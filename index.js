const fs = require('fs');
const path = require('path');
const fetch = require('isomorphic-fetch');
const _get = require('lodash/get');
const x = require('x-ray')();

(async () => {
  const reposFilePath = path.join(__dirname, 'repos.json');
  const pageContetFilePath = path.join(__dirname, 'pages.json');
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

async function writeAllReposToFile() {
  let allRepos = [];
  // 100 is the API limit of each request
  const getReposBatch = async (afterCursor = '', first = 100) => {
    try {
      const res = await fetch(`https://api.github.com/graphql`, {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer f60284300d2ad46be1f44dec9c7518c08dd7787e',
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
      const starredRepositories = _get(data, 'data.viewer.starredRepositories', {});
      const hasNextPage = _get(starredRepositories, 'pageInfo.hasNextPage', false);
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
  fs.writeFileSync(filePath, JSON.stringify(allRepos));
  console.log(`saved file to ${filePath}`);
}

async function readFromFileAndParseToReadme(filePath, pageContetFilePath) {
  const repos = JSON.parse(fs.readFileSync(filePath).toString());
  let count = 0;
  let allRepoPageContents = [];
  for (let repo of repos) {
    const repoName = repo.name || '';
    let repoUrl = repo.url;

    if (!repoUrl) {
      return;
    }
    console.log(`start getting No.${count} name ${repoName}`);
    ++count;
    x(repoUrl, 'div.repository-content', [{ title: '.f4', readme: 'div.Box-body' }]).then(
      (data, url) => {
        allRepoPageContents.push(data);
        return true;
      },
    );
    await wait();
  }
  fs.writeFileSync(pageContetFilePath, JSON.stringify(allRepoPageContents));
  console.log(`saved file to ${pageContetFilePath}`);
}
