const path = require('path');
const fs = require('fs');
const initSqlJs = require('sql.js');
require('dotenv').config();

const dbPath = path.resolve(process.env.DB_PATH || './database.sqlite');

// ─── sql.js: 100% pure JavaScript SQLite, no native compilation needed ───────
// Works on Windows without Visual Studio, macOS without Xcode, etc.

let sqlDb; // in-memory sql.js Database instance

// Persist to disk after every write
function persist() {
  const data = sqlDb.export();
  fs.writeFileSync(dbPath, Buffer.from(data));
}

// Load (or create) the database from disk
async function loadDb() {
  const SQL = await initSqlJs();
  if (fs.existsSync(dbPath)) {
    const fileBuffer = fs.readFileSync(dbPath);
    sqlDb = new SQL.Database(fileBuffer);
  } else {
    sqlDb = new SQL.Database();
  }
}

// ─── db interface — mirrors better-sqlite3's synchronous API ─────────────────
const db = {
  exec(sql) {
    sqlDb.run(sql);
    persist();
  },

  pragma(str) {
    try { sqlDb.run(`PRAGMA ${str}`); } catch (_) {}
  },

  prepare(sql) {
    return {
      all(...params) {
        const args = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;
        const stmt = sqlDb.prepare(sql);
        const rows = [];
        stmt.bind(args);
        while (stmt.step()) rows.push(stmt.getAsObject());
        stmt.free();
        return rows;
      },

      get(...params) {
        const args = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;
        const stmt = sqlDb.prepare(sql);
        stmt.bind(args);
        const row = stmt.step() ? stmt.getAsObject() : undefined;
        stmt.free();
        return row;
      },

      run(...params) {
        const args = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;
        sqlDb.run(sql, args);
        persist();
        return { changes: sqlDb.getRowsModified() };
      },
    };
  },
};

// ─── Schema ───────────────────────────────────────────────────────────────────
function initializeDatabase() {
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token TEXT NOT NULL UNIQUE,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      amount REAL NOT NULL,
      type TEXT NOT NULL,
      category TEXT NOT NULL,
      date TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  console.log('✅ Database initialized successfully');
}

// loadDb() must be awaited once at startup
module.exports = { db, loadDb, initializeDatabase };
