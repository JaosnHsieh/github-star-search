const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

//https://developer.github.com/v4/guides/using-the-explorer/
const githubPersonalAccessToken = process.env.GITHUB_PERSONAL_ACCESS_TOKEN;
const reposFilePath =
  process.env.REPOS_FILE_PATH || path.join(__dirname, '..', 'repos.json');
const pageContetFilePath =
  process.env.PAGE_CONTENT_FILE_PATH ||
  path.join(__dirname, '..', 'pages.json');

module.exports = {
  githubPersonalAccessToken,
  reposFilePath,
  pageContetFilePath,
};
