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

  // Adicionar índice para otimizar consultas por data
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

/**
 * Busca todas as mensagens de uma data específica.
 * @param {string} dateStr - A data no formato 'YYYY-MM-DD'.
 * @returns {Promise<Array>} Uma promessa que resolve para um array de mensagens.
 */
function getMessagesByDate(dateStr) {
  return new Promise((resolve, reject) => {
    // Usar a coluna isoTimestamp (texto em UTC) para evitar problemas de fuso horário.
    // O padrão `dateStr%` encontrará todas as entradas para aquele dia.
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
        fromMe: !!r.fromMe
      }));
      resolve(messages);
    });
  });
}

/**
 * Obtém uma lista de IDs de chat únicos que tiveram mensagens em uma data específica.
 * @param {string} dateStr - A data no formato 'YYYY-MM-DD'.
 * @returns {Promise<string[]>} Uma promessa que resolve para um array de IDs de chat.
 */
function getChatsByDate(dateStr) {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT DISTINCT chatId FROM messages
      WHERE isoTimestamp LIKE ?
    `;
    db.all(query, [`${dateStr}%`], (err, rows) => {
      if (err) {
        return reject(err);
      }
      resolve(rows.map(r => r.chatId));
    });
  });
}

/**
 * Busca todas as mensagens dos últimos N dias.
 * @param {number} days - O número de dias para buscar.
 * @returns {Promise<Array>} Uma promessa que resolve para um array de mensagens.
 */
function getMessagesForLastDays(days) {
  return new Promise((resolve, reject) => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    const dateStr = date.toISOString().slice(0, 10);

    const query = `
      SELECT * FROM messages
      WHERE isoTimestamp >= ?
      ORDER BY timestamp
    `;
    db.all(query, [dateStr], (err, rows) => {
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
        fromMe: !!r.fromMe
      }));
      resolve(messages);
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

module.exports = { addMessage, getMessagesByDate, getChatsByDate, getMessagesForLastDays, closeDatabase };
