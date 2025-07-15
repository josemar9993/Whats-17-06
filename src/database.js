const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const config = require('./config');
const logger = require('./logger');

const dbPath = config.dbPath;
const dir = path.dirname(dbPath);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

// Database connection with improved error handling
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    logger.error('[DATABASE] Erro ao conectar:', err.message);
    throw err;
  } else {
    logger.info(`[DATABASE] Conectado ao banco de dados: ${dbPath}`);
  }
});

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
      fromMe INTEGER,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      logger.error('[DATABASE] Erro ao criar tabela messages:', err.message);
    } else {
      logger.info('[DATABASE] Tabela messages criada ou já existe');
    }
  });

  db.run(
    `CREATE INDEX IF NOT EXISTS idx_isoTimestamp ON messages (isoTimestamp)`,
    (err) => {
      if (err) {
        logger.error('[DATABASE] Erro ao criar índice isoTimestamp:', err.message);
      }
    }
  );

  db.run(
    `CREATE INDEX IF NOT EXISTS idx_timestamp ON messages (timestamp)`,
    (err) => {
      if (err) {
        logger.error('[DATABASE] Erro ao criar índice timestamp:', err.message);
      }
    }
  );

  db.run(
    `CREATE INDEX IF NOT EXISTS idx_chatId ON messages (chatId)`,
    (err) => {
      if (err) {
        logger.error('[DATABASE] Erro ao criar índice chatId:', err.message);
      }
    }
  );
});

function addMessage(msg) {
  return new Promise((resolve, reject) => {
    // Validate required fields
    if (!msg.id || !msg.chatId || !msg.timestamp) {
      const error = new Error('Mensagem inválida: campos obrigatórios ausentes');
      logger.error('[DATABASE] Erro de validação:', error.message, { msg });
      return reject(error);
    }

    // Ensure timestamp is valid
    const timestamp = typeof msg.timestamp === 'number' ? msg.timestamp : parseInt(msg.timestamp);
    if (isNaN(timestamp) || timestamp <= 0) {
      const error = new Error('Timestamp inválido');
      logger.error('[DATABASE] Erro de timestamp:', error.message, { timestamp: msg.timestamp });
      return reject(error);
    }

    // Create ISO timestamp with proper timezone handling
    const date = new Date(timestamp * 1000);
    const isoTimestamp = date.toISOString();

    const stmt = db.prepare(
      `INSERT OR IGNORE INTO messages (
        id, chatId, timestamp, isoTimestamp, senderName, type, body, fromMe
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    );
    
    stmt.run(
      msg.id,
      msg.chatId,
      timestamp,
      isoTimestamp,
      msg.senderName || 'Unknown',
      msg.type || 'chat',
      msg.body || '',
      msg.fromMe ? 1 : 0,
      function (err) {
        if (err) {
          logger.error('[DATABASE] Erro ao inserir mensagem:', err.message, { msg });
          reject(err);
        } else {
          logger.debug(`[DATABASE] Mensagem salva: ${msg.id} de ${msg.senderName}`);
          resolve(this.lastID);
        }
      }
    );
    stmt.finalize();
  });
}

async function addMessageFromWhatsapp(msg) {
  try {
    const chat = await msg.getChat();
    let senderName;

    if (chat.isGroup) {
      senderName = msg._data.notifyName || msg.author;
    } else {
      const contact = await msg.getContact();
      senderName = contact.pushname || contact.name || msg.from;
    }

    // Validate timestamp
    const timestamp = msg.timestamp;
    if (!timestamp || isNaN(timestamp) || timestamp <= 0) {
      throw new Error(`Timestamp inválido: ${timestamp}`);
    }

    const messageData = {
      id: msg.id.id,
      chatId: chat.id._serialized,
      timestamp: timestamp,
      isoTimestamp: new Date(timestamp * 1000).toISOString(),
      senderName: senderName,
      type: msg.type,
      body: msg.body || '',
      fromMe: msg.fromMe
    };

    logger.debug(`[DATABASE] Salvando mensagem do WhatsApp: ${messageData.id} de ${messageData.senderName}`);
    return await addMessage(messageData);
  } catch (error) {
    logger.error('[DATABASE] Erro ao processar mensagem do WhatsApp:', error.message, { 
      msgId: msg.id?.id, 
      from: msg.from, 
      timestamp: msg.timestamp 
    });
    throw error;
  }
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
        logger.error('[DATABASE] Erro ao buscar mensagens por data:', err.message);
        return reject(err);
      }
      const messages = rows.map(mapRowToMessage);
      logger.debug(`[DATABASE] Encontradas ${messages.length} mensagens para data ${dateStr}`);
      resolve(messages);
    });
  });
}

function getMessagesByDateRange(startDate, endDate) {
  return new Promise((resolve, reject) => {
    // Convert dates to timestamps for more accurate filtering
    const startTimestamp = Math.floor(startDate.getTime() / 1000);
    const endTimestamp = Math.floor(endDate.getTime() / 1000);
    
    const query = `
      SELECT * FROM messages
      WHERE timestamp BETWEEN ? AND ?
      ORDER BY timestamp
    `;
    
    logger.debug(`[DATABASE] Buscando mensagens entre ${startDate.toISOString()} e ${endDate.toISOString()}`);
    logger.debug(`[DATABASE] Timestamps: ${startTimestamp} - ${endTimestamp}`);
    
    db.all(query, [startTimestamp, endTimestamp], (err, rows) => {
      if (err) {
        logger.error('[DATABASE] Erro ao buscar mensagens por intervalo:', err.message);
        return reject(err);
      }
      const messages = rows.map(mapRowToMessage);
      logger.debug(`[DATABASE] Encontradas ${messages.length} mensagens no intervalo`);
      resolve(messages);
    });
  });
}

function mapRowToMessage(row) {
  return {
    id: row.id,
    chatId: row.chatId,
    timestamp: row.timestamp,
    isoTimestamp: row.isoTimestamp,
    senderName: row.senderName,
    type: row.type,
    body: row.body,
    fromMe: row.fromMe === 1,
    createdAt: row.createdAt
  };
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
      if (err) {
        logger.error('[DATABASE] Erro ao buscar mensagens:', err.message);
        return reject(err);
      }
      const messages = rows.map(mapRowToMessage);
      resolve(messages);
    });
  });
}

function getAllMessages() {
  return new Promise((resolve, reject) => {
    const query = `SELECT * FROM messages ORDER BY timestamp`;
    db.all(query, [], (err, rows) => {
      if (err) {
        logger.error('[DATABASE] Erro ao buscar todas as mensagens:', err.message);
        return reject(err);
      }
      const messages = rows.map(mapRowToMessage);
      logger.debug(`[DATABASE] Retornando ${messages.length} mensagens do banco`);
      resolve(messages);
    });
  });
}

function getMessageStats() {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        COUNT(*) as total,
        COUNT(DISTINCT chatId) as unique_chats,
        SUM(CASE WHEN fromMe = 1 THEN 1 ELSE 0 END) as sent_messages,
        SUM(CASE WHEN fromMe = 0 THEN 1 ELSE 0 END) as received_messages,
        MIN(timestamp) as oldest_message,
        MAX(timestamp) as newest_message
      FROM messages
    `;
    db.get(query, [], (err, row) => {
      if (err) {
        logger.error('[DATABASE] Erro ao buscar estatísticas:', err.message);
        return reject(err);
      }
      resolve(row);
    });
  });
}

module.exports = {
  addMessage,
  addMessageFromWhatsapp,
  getMessagesByDate,
  getMessagesByDateRange,
  searchMessages,
  getAllMessages,
  getMessageStats
};
