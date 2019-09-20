require('dotenv').config();
const fs = require('fs');
const path = require('path');
const fetch = require('isomorphic-fetch');
const _get = require('lodash/get');
const x = require('x-ray')();

//https://developer.github.com/v4/guides/using-the-explorer/

const githubPersonalAccessToken = process.env.GITHUB_PERSONAL_ACCESS_TOKEN;
const reposFilePath =
  process.env.REPOS_FILE_PATH || path.join(__dirname, 'repos.json');
const pageContetFilePath =
  process.env.PAGE_CONTENT_FILE_PATH || path.join(__dirname, 'pages.json');

if (!githubPersonalAccessToken) {
  throw new Error(
    'github personal access token requried!! https://developer.github.com/v4/guides/using-the-explorer/',
  );
}
(async () => {
  await writeAllReposToFile(reposFilePath);
  await readFromFileAndParseToReadme(reposFilePath, pageContetFilePath);
})();

function wait(ms = 500) {
  return new Promise(resolve =>
    setTimeout(() => {
      resolve();
    }, ms),
  );
}

async function writeAllReposToFile(reposFilePath) {
  let allRepos = [];
  // 100 is the API limit of each request
  const getReposBatch = async (afterCursor = '', first = 100) => {
    try {
      const res = await fetch(`https://api.github.com/graphql`, {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${githubPersonalAccessToken}`,
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
      console.log('allRepos.length', allRepos.length);
      await wait();

      if (hasNextPage) {
        await getReposBatch(endCursor);
      } else {
        //for debug
        console.log('when !hasNextPage data', data);
      }
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
  const batchSize = 5;
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

    if ((i + 1) % 5 === 0 || i === repos.length - 1) {
      console.log(
        `start crawling page content No.${
          count - batchSize <= 0 ? 1 : count - batchSize
        }-${count - 1}  ${batchRepos.reduce((accu, repo) => {
          accu += `${repo.name},`;
          return accu;
        }, '')}`,
      );
      await Promise.all(
        batchRepos.map(repo => {
          return x(repoUrl, 'div.repository-content', [
            { title: '.f4', readme: 'div.Box-body' },
          ]).then((data, url) => {
            allRepoPageContents.push(data);
            return true;
          });
        }),
      );
    }
    // await wait(200);
  }
  fs.writeFileSync(
    pageContetFilePath,
    JSON.stringify(allRepoPageContents).replace(/\\n/gi, ' '),
  );
  console.log(`saved file to ${pageContetFilePath}`);
}
