const sqlite = require('sqlite3');

const db = new sqlite.Database("./db.db", (err) => {
    if (err) {
        console.log("Error while starting the database");
        throw err;
    }
});

module.exports = db;