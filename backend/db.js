const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./app.db');
const path = require('path');
console.log('Using SQLite DB at', path.resolve('./app.db'));


db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS runs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      finding TEXT,
      payload TEXT,
      status TEXT,
      raw_json TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

module.exports = db;
