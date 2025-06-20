const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const dbPath = path.resolve(__dirname, '../data/messages.db');
const dir = path.dirname(dbPath);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const db = new Database(dbPath);

// Cria a tabela caso nao exista
const createTable = `CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  chatId TEXT,
  timestamp INTEGER,
  isoTimestamp TEXT,
  senderName TEXT,
  type TEXT,
  body TEXT,
  fromMe INTEGER
)`;
db.exec(createTable);

/**
 * Insere uma mensagem na base de dados.
 * @param {Object} msg - Mensagem a ser registrada
 */
function addMessage(msg) {
  const stmt = db.prepare(
    `INSERT OR IGNORE INTO messages (id, chatId, timestamp, isoTimestamp, senderName, type, body, fromMe)
     VALUES (@id, @chatId, @timestamp, @isoTimestamp, @senderName, @type, @body, @fromMe)`
  );
  stmt.run({
    id: msg.id,
    chatId: msg.chatId,
    timestamp: msg.timestamp,
    isoTimestamp: msg.isoTimestamp,
    senderName: msg.senderName,
    type: msg.type,
    body: msg.body,
    fromMe: msg.fromMe ? 1 : 0
  });
}

/**
 * Recupera mensagens de um dia específico.
 * @param {string} dateStr - Data no formato YYYY-MM-DD
 * @returns {Array<Object>} Lista de mensagens
 */
function getMessagesByDate(dateStr) {
  const start = Math.floor(new Date(`${dateStr}T00:00:00`).getTime() / 1000);
  const end = start + 24 * 60 * 60;
  const stmt = db.prepare(
    'SELECT * FROM messages WHERE timestamp >= ? AND timestamp < ? ORDER BY timestamp'
  );
  return stmt.all(start, end).map((r) => ({
    id: r.id,
    chatId: r.chatId,
    timestamp: r.timestamp,
    isoTimestamp: r.isoTimestamp,
    senderName: r.senderName,
    type: r.type,
    body: r.body,
    fromMe: !!r.fromMe
  }));
}

module.exports = { addMessage, getMessagesByDate };
