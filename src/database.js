const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const config = require('./config');

const dbPath = config.dbPath;
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

  db.run(`CREATE INDEX IF NOT EXISTS idx_isoTimestamp ON messages (isoTimestamp)`);
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

async function addMessageFromWhatsapp(msg) {
  const chat = await msg.getChat();
  let senderName;

  if (chat.isGroup) {
    senderName = msg._data.notifyName || msg.author;
  } else {
    const contact = await msg.getContact();
    senderName = contact.pushname || contact.name || msg.from;
  }

  const messageData = {
    id: msg.id.id,
    chatId: chat.id._serialized,
    timestamp: msg.timestamp,
    isoTimestamp: new Date(msg.timestamp * 1000).toISOString(),
    senderName: senderName,
    type: msg.type,
    body: msg.body,
    fromMe: msg.fromMe,
  };

  return addMessage(messageData);
}

function getMessagesByDate(dateStr) {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT * FROM messages
      WHERE isoTimestamp LIKE ?
      ORDER BY timestamp
    `;
    db.all(query, [`${dateStr}%`], (err, rows) => {
      if (err) {
        return reject(err);
      }
      const messages = rows.map((r) => ({
        id: r.id,
        chatId: r.chatId,
        timestamp: r.timestamp,
        isoTimestamp: r.isoTimestamp,
        senderName: r.senderName,
        type: r.type,
        body: r.body,
        fromMe: r.fromMe === 1,
      }));
      resolve(messages);
    });
  });
}

function searchMessages(term) {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT * FROM messages
      WHERE body LIKE ?
      ORDER BY timestamp DESC
      LIMIT 20
    `;
    db.all(query, [`%${term}%`], (err, rows) => {
      if (err) return reject(err);
      const messages = rows.map((r) => ({
        id: r.id,
        chatId: r.chatId,
        timestamp: r.timestamp,
        isoTimestamp: r.isoTimestamp,
        senderName: r.senderName,
        type: r.type,
        body: r.body,
        fromMe: r.fromMe === 1,
      }));
      resolve(messages);
    });
  });
}

module.exports = {
  addMessage,
  addMessageFromWhatsapp,
  getMessagesByDate,
  searchMessages,
};
