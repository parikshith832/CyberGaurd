// backend/db.js
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const DB_PATH = path.join(__dirname, "app.db");

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error("Failed to open DB:", err.message);
  } else {
    console.log("SQLite DB opened at", DB_PATH);
  }
});

// Enable foreign keys
db.serialize(() => {
  db.run("PRAGMA foreign_keys = ON;");

  // Users table: login + roles + status
  db.run(
    `
    CREATE TABLE IF NOT EXISTS users (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      username      TEXT    NOT NULL UNIQUE,
      password_hash TEXT    NOT NULL,
      is_admin      INTEGER NOT NULL DEFAULT 0,
      action        TEXT    NOT NULL DEFAULT 'active',
      created_at    TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    `,
    (err) => {
      if (err) {
        console.error("Error creating users table:", err.message);
      }
    }
  );

  // User stats table: dashboard metrics linked to users
  db.run(
    `
    CREATE TABLE IF NOT EXISTS user_stats (
      id               INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id          INTEGER NOT NULL,
      total_score      INTEGER NOT NULL DEFAULT 0,
      total_time_sec   INTEGER NOT NULL DEFAULT 0,
      sessions_count   INTEGER NOT NULL DEFAULT 0,
      last_login_at    TEXT,
      last_activity_at TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
    `,
    (err) => {
      if (err) {
        console.error("Error creating user_stats table:", err.message);
      }
    }
  );

  // OPTIONAL: existing runs table if you still use it for lab runs
  db.run(
    `
    CREATE TABLE IF NOT EXISTS runs (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id   INTEGER,
      finding   TEXT,
      payload   TEXT,
      status    TEXT,
      raw_json  TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
    `,
    (err) => {
      if (err) {
        console.error("Error creating runs table:", err.message);
      }
    }
  );
});

module.exports = db;
