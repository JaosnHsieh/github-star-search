const x = require('x-ray')().timeout(8000);

const crawlerDomMatcher = {
  description:
    '#js-repo-pjax-container > div.container-xl.clearfix.new-discussion-timeline.px-3.px-md-4.px-lg-5 > div > div.gutter-condensed.gutter-lg.flex-column.flex-md-row.d-flex > div.flex-shrink-0.col-12.col-md-3 > div > div.BorderGrid-row.hide-sm.hide-md > div > p',
  readme: 'div.Box-body',
};

async function crawlRepo(repo, ...args) {
  let data = await x(...args);
  dataPropTrimOrEmpty(data, 'readme');
  dataPropTrimOrEmpty(data, 'description');
  data = {
    ...data,
    url: repo.url,
    name: repo.name,
  };
  return data;
}
function dataPropTrimOrEmpty(data = {}, propName = '') {
  data && data[propName] && typeof data[propName] === 'string'
    ? (data[propName] = data[propName].replace(/\n/gi, ' '))
    : (data[propName] = '');
}

module.exports.crawlRepo = crawlRepo;
module.exports.crawlerDomMatcher = crawlerDomMatcher;
