const { pageContetFilePath } = require('./env');
const stemmer = require('porter-stemmer').stemmer;
const JsSearch = require('js-search');

module.exports = (keyword) => {
  const pages = require(pageContetFilePath);

  if (!keyword) {
    throw new Error('keyword requried!!');
  }
  console.log('Searching.....');
  const dataToSearch = new JsSearch.Search('url');

  dataToSearch.indexStrategy = new JsSearch.AllSubstringsIndexStrategy();

  dataToSearch.tokenizer = new JsSearch.StemmingTokenizer(
    stemmer,
    new JsSearch.SimpleTokenizer(),
  );

  ['name', 'url', 'description', 'readme'].map((field) =>
    dataToSearch.addIndex(field),
  );

  dataToSearch.addDocuments(pages);
  const searchResult = dataToSearch.search(keyword);

  searchResult.map((row) => {
    console.log(`name: ${row.name}`);
    console.log(`url: ${row.url}\n`);
  });
  console.log(
    `${searchResult.length} results found!!\nkeyword: '${keyword}' in url, name, description, readme`,
  );
};
