const { pageContetFilePath } = require('./env');
const stemmer = require('porter-stemmer').stemmer;
const JsSearch = require('js-search');

const pages = require(pageContetFilePath);
//   console.log(`pages`,pages)

const dataToSearch = new JsSearch.Search('url');
/**
 *  defines a indexing strategy for the data
 * more about it in here https://github.com/bvaughn/js-search#configuring-the-index-strategy
 */
dataToSearch.indexStrategy = new JsSearch.AllSubstringsIndexStrategy();

dataToSearch.tokenizer = new JsSearch.StemmingTokenizer(
  stemmer, // Function should accept a string param and return a string
  new JsSearch.SimpleTokenizer(),
);

/**
 * defines the sanitizer for the search
 * to prevent some of the words from being excluded
 *
 */
//   dataToSearch.sanitizer = new JsSearch.LowerCaseSanitizer();

['name', 'url', 'description', 'readme'].map((field) =>
  dataToSearch.addIndex(field),
);

/**
 * defines the search index
 * read more in here https://github.com/bvaughn/js-search#configuring-the-search-index
 */
//   dataToSearch.searchIndex = new JsSearch.TfIdfSearchIndex()
// dataToSearch.addIndex("title") // sets the index attribute for the data
// dataToSearch.addIndex("author") // sets the index attribute for the data
dataToSearch.addDocuments(pages); // adds the data to

console.log(dataToSearch.search('graphql.js').length);
