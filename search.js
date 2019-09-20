require('dotenv').config();
const _chunk = require('lodash.chunk');
const path = require('path');
const pageContetFilePath =
  process.env.PAGE_CONTENT_FILE_PATH || path.join(__dirname, 'pages.json');
const pages = require(pageContetFilePath);
const sqlite3 = require('sqlite3').verbose();

// open the database connection
let db = new sqlite3.Database(':memory:', err => {
  if (err) {
    console.error(err.message);
  }
});

/**
 * escape string when insert
 * https://stackoverflow.com/questions/30080535/escape-a-string-in-node-js-to-insert-it-in-a-sqlite3-database
 * https://www.sqlitetutorial.net/sqlite-insert/
 */
db.serialize(() => {
  db.run(
    'CREATE TABLE pages(name text, url text, description text, readme text)',
  );
  /**
   * chuck due to error caused by SQLITE_MAX_VARIABLE_NUMBER
   * https://www.sqlite.org/limits.html
   **/

  _chunk(pages, 100).map(pages100 => {
    db.run(
      `INSERT INTO pages(name,url,description,readme)
            VALUES ${pages100.reduce((accu, page, i, arr) => {
              accu += `(?,?,?,?)${i === arr.length - 1 ? ';' : ','}`;
              return accu;
            }, '')}
            `,
      ...pages100.reduce((accu, page) => {
        ['name', 'url', 'description', 'readme'].map(prop => {
          accu.push((page && page[prop]) || ' ');
        });

        return accu;
      }, []),
    );
  });
  const keyword = process.argv[2] || '';
  if (!keyword) {
    return console.log('no keyword found. example: npm run search express');
  }
  db.all(
    `SELECT url,name FROM pages WHERE url LIKE '%${keyword}%' OR name LIKE '%${keyword}%' OR description LIKE '%${keyword}%' OR readme LIKE '%${keyword}%'`,
    (err, rows) => {
      if (err) {
        throw err;
      }

      rows.map(row => {
        console.log(`name: ${row.name}`);
        console.log(`url: ${row.url}\n`);
      });
      console.log(
        `${rows.length} results found!!\nkeyword: '${keyword}' in url, name, description, readme`,
      );
      console.log(``);
    },
  );
});

// close the database connection
db.close(err => {
  if (err) {
    return console.error(err.message);
  }
});
