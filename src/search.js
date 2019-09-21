const { pageContetFilePath } = require('./env');
const _chunk = require('lodash.chunk');
const sqlite3 = require('sqlite3').verbose();

module.exports = keyword => {
  const pages = require(pageContetFilePath);

  if (!keyword) {
    throw new Error('keyword requried!!');
  }
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
      `CREATE VIRTUAL TABLE pages USING FTS5(name, url, description, readme);`,
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
    if (!keyword) {
      return console.log('no keyword found. example: npm run search express');
    }
    db.all(
      `SELECT url,name FROM pages WHERE pages match '${keyword}'`,
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
      },
    );
  });

  // close the database connection
  db.close(err => {
    if (err) {
      return console.error(err.message);
    }
  });
};
