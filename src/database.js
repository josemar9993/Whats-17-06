const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.resolve(__dirname, '../data/messages.db');
const dir = path.dirname(dbPath);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      chatId TEXT,
      timestamp INTEGER,
      isoTimestamp TEXT,
      senderName TEXT,
      type TEXT,
      body TEXT,
      fromMe INTEGER
    )
  `);
});

function addMessage(msg) {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare(
      `INSERT OR IGNORE INTO messages (
        id, chatId, timestamp, isoTimestamp, senderName, type, body, fromMe
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    );
    stmt.run(
      msg.id,
      msg.chatId,
      msg.timestamp,
      msg.isoTimestamp,
      msg.senderName,
      msg.type,
      msg.body,
      msg.fromMe ? 1 : 0,
      function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      }
    );
    stmt.finalize();
  });
}

function getMessagesByDate(dateStr) {
  return new Promise((resolve, reject) => {
    const start = Math.floor(new Date(`${dateStr}T00:00:00`).getTime() / 1000);
    const end = start + 24 * 60 * 60;
    const query = `
      SELECT * FROM messages
      WHERE timestamp >= ? AND timestamp < ?
      ORDER BY timestamp
    `;
    db.all(query, [start, end], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        const messages = rows.map((r) => ({
          id: r.id,
          chatId: r.chatId,
          timestamp: r.timestamp,
          isoTimestamp: r.isoTimestamp,
          senderName: r.senderName,
          type: r.type,
          body: r.body,
          fromMe: !!r.fromMe
        }));
        resolve(messages);
      }
    });
  });
}

function closeDatabase() {
  return new Promise((resolve) => {
    db.close((err) => {
      if (err) console.error('Erro ao fechar o banco:', err);
      resolve();
    });
  });
}

module.exports = { addMessage, getMessagesByDate, closeDatabase };
