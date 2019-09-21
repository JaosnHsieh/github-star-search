const fire = require('js-fire');
const fs = require('fs');
const path = require('path');
const fetch = require('isomorphic-fetch');
const _get = require('lodash.get');
const x = require('x-ray')();
const search = require('./search');
const {
  githubPersonalAccessToken,
  reposFilePath,
  pageContetFilePath,
} = require('./env');

const starsearch = {
  __description__: 'search your github stared repos with ease.',
  start: async token => {
    if (!githubPersonalAccessToken && !token) {
      throw new Error(
        `github personal access token requried!\n
        star-search start --token=<token>
        https://help.github.com/en/articles/creating-a-personal-access-token-for-the-command-line`,
      );
    }
    if (token) {
      fs.writeFileSync(
        path.join(__dirname, '..', '.env'),
        `GITHUB_PERSONAL_ACCESS_TOKEN=${token}`,
      );
    }
    await writeAllReposToFile(reposFilePath, token);
    await readFromFileAndParseToReadme(reposFilePath, pageContetFilePath);
  },
  search: keyword => {
    search(keyword);
  },
};

fire(starsearch);

function wait(ms = 500) {
  return new Promise(resolve =>
    setTimeout(() => {
      resolve();
    }, ms),
  );
}

async function writeAllReposToFile(reposFilePath, token) {
  let allRepos = [];
  // 100 is the API limit of each request
  const getReposBatch = async (afterCursor = '', first = 100) => {
    try {
      const res = await fetch(`https://api.github.com/graphql`, {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${githubPersonalAccessToken || token}`,
          // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: JSON.stringify({
          query: `{ viewer { starredRepositories(first:${first},${afterCursor &&
            `after:"${afterCursor}"`} orderBy:{field:STARRED_AT,direction:ASC},){ pageInfo{ hasNextPage startCursor endCursor } nodes{ name url } totalCount } } }`,
        }),
      });

      /**
       * sample response data
       * {
          "data": {
            "viewer": {
              "starredRepositories": {
                "pageInfo": {
                  "hasNextPage": true,
                  "startCursor": "Y3Vyc29yOnYyOpK5MjAxNi0wNy0wMVQxODo1NTowNSswODowMM4DuIeg",
                  "endCursor": "Y3Vyc29yOnYyOpK5MjAxNi0wOC0xOFQxNzowMDowOCswODowMM4D7bX2"
                },
                "nodes": [
                  {
                    "name": "freeCodeCamp",
                    "url": "https://github.com/freeCodeCamp/freeCodeCamp"
                  },
                  {
                    "name": "node-uglifier",
                    "url": "https://github.com/zsoltszabo/node-uglifier"
                  }
                ],
                "totalCount": 1026
              }
            }
          }
        }
       */
      const data = await res.json();
      const starredRepositories = _get(
        data,
        'data.viewer.starredRepositories',
        {},
      );
      const hasNextPage = _get(
        starredRepositories,
        'pageInfo.hasNextPage',
        false,
      );
      const endCursor = _get(starredRepositories, 'pageInfo.endCursor', '');
      const nodes = _get(starredRepositories, 'nodes', []);
      allRepos = allRepos.concat(nodes);
      console.log('stared repositories count', allRepos.length);
      await wait();

      if (hasNextPage) {
        await getReposBatch(endCursor);
      }
      // else {
      //   //for debug
      //   console.log('when !hasNextPage data', data);
      // }
    } catch (err) {
      console.error(err);
    }
  };
  await getReposBatch();
  fs.writeFileSync(reposFilePath, JSON.stringify(allRepos));
  console.log(`saved file to ${reposFilePath}`);
}

async function readFromFileAndParseToReadme(filePath, pageContetFilePath) {
  const repos = JSON.parse(fs.readFileSync(filePath).toString());
  let count = 1;
  const batchSize = +process.env.REQUEST_BATCH_SIZE || 10;
  let batchRepos = [];
  let allRepoPageContents = [];
  for (let i = 0; i < repos.length; ++i) {
    const repo = repos[i];
    const repoName = repo.name || '';
    let repoUrl = repo.url;
    if (!repoUrl || !repoName) {
      break;
    }
    batchRepos.push(repo);
    ++count;

    if ((i + 1) % batchSize === 0 || i === repos.length - 1) {
      console.log(
        `Crawling page content No.${
          count - batchSize <= 0 ? 1 : count - batchSize
        }-${count - 1}  ${batchRepos.reduce((accu, repo) => {
          accu += `${repo.name} ${repo.url}\n`;
          return accu;
        }, '\n')}`,
      );
      await Promise.all(
        batchRepos.map(repo => {
          return x(repo.url, 'div.repository-content', [
            { description: '.f4', readme: 'div.Box-body' },
          ])
            .then((data, url) => {
              if (Array.isArray(data)) {
                data = data[0];
                data &&
                  data.readme &&
                  typeof data.readme === 'string' &&
                  (data.readme = data.readme.replace(/\n/gi, ' '));
                data = {
                  ...data,
                  url: repo.url,
                  name: repo.name,
                };
                allRepoPageContents.push(data);
              }
            })
            .catch(err => {
              console.log(
                `retry one more time due to request error ${repo.url}`,
              );
              if (err) {
                return x(repo.url, 'div.repository-content', [
                  { description: '.f4', readme: 'div.Box-body' },
                ]);
              }
            })
            .catch(err => {
              if (err) {
                console.log('2nd time request error', repo.url, err);
              }
            });
        }),
      );
      batchRepos = [];
      await wait(500);
    }
  }
  fs.writeFileSync(pageContetFilePath, JSON.stringify(allRepoPageContents));
  console.log(`saved file to ${pageContetFilePath}`);
}
