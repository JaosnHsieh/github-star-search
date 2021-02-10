const assert = require('assert');
const { crawlRepo, crawlerDomMatcher } = require('./crawlRepo');

(async () => {
  const repo = {
    name: 'github-star-search',
    url: 'https://github.com/JaosnHsieh/github-star-search',
  };
  console.log(`crawling ${repo.url}`);
  const data = await crawlRepo(repo, repo.url, crawlerDomMatcher);
  assert(
    data.description.includes(
      `Search your github stared repos by repo's README.md content.`,
    ),
  );
  assert(
    data.readme.includes(
      `Feature Search your star repositories on Github by text in README, description and repo name offline.`,
    ),
  );
  console.log('got correct description and readme');
})();
