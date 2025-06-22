require('dotenv').config();

const db = require('./database');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcodeTerminal = require('qrcode-terminal');
const express = require('express');
const cron = require('node-cron');
const emailer = require('./emailer');
const logger = require('./logger');

process.on('uncaughtException', (err, origin) => {
  const fsSync = require('fs');
  const pathSync = require('path');
  logger.error('====== UNCAUGHT EXCEPTION ======');
  logger.error(`Timestamp: ${new Date().toISOString()}`);
  logger.error(`Origem: ${origin}`);
  logger.error(err);
  logger.error('==============================');
  try {
    const logsDir = pathSync.join(__dirname, 'logs');
    if (!fsSync.existsSync(logsDir))
      fsSync.mkdirSync(logsDir, { recursive: true });
    fsSync.appendFileSync(
      pathSync.join(logsDir, 'exceptions.log'),
      `[${new Date().toISOString()}] Origin: ${origin}\n${err.stack || err}\n\n`
    );
  } catch (logErr) {
    logger.error('Falha ao escrever no log de exceções síncrono:', logErr);
  }
});

process.on('unhandledRejection', (reason) => {
  const fsSync = require('fs');
  const pathSync = require('path');
  logger.error('====== UNHANDLED REJECTION ======');
  logger.error(`Timestamp: ${new Date().toISOString()}`);
  logger.error('Motivo do Rejection:', reason);
  logger.error('===============================');
  try {
    const logsDir = pathSync.join(__dirname, 'logs');
    if (!fsSync.existsSync(logsDir))
      fsSync.mkdirSync(logsDir, { recursive: true });
    fsSync.appendFileSync(
      pathSync.join(logsDir, 'rejections.log'),
      `[${new Date().toISOString()}] Reason: ${String(reason)}\n\n`
    );
  } catch (logErr) {
    logger.error('Falha ao escrever no log de rejeições síncrono:', logErr);
  }
});

logger.info('Configurando o cliente do WhatsApp...');
const client = new Client({
  // Persistência da sessão em diretório dedicado
  authStrategy: new LocalAuth({ dataPath: './session_data' }),
  puppeteer: {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu'
    ],
    executablePath: process.env.CHROMIUM_PATH || '/usr/bin/google-chrome-stable'
  }
});

logger.info('Configurando eventos do cliente...');
client.on('qr', (qr) => {
  logger.info('QR Code recebido, escaneie por favor:');
  qrcodeTerminal.generate(qr, { small: true });
});

client.on('authenticated', () => {
  logger.info('Cliente autenticado!');
});

client.on('auth_failure', (msg) => {
  logger.error('Falha na autenticação:', msg);
});

client.on('ready', () => {
  logger.info('Cliente do WhatsApp está pronto!');

  // Agendamento de tarefas com node-cron
  // Salva as conversas e envia o e-mail de resumo diário às 23:50
  cron.schedule(
    '50 23 * * *',
    () => {
      logger.info('[CRON] Executando tarefa de resumo diário...');
      const days = parseInt(process.env.DEFAULT_SUMMARY_DAYS || '1', 10);
      emailer.sendSummaryForLastDays(days);
    },
    {
      scheduled: true,
      timezone: 'America/Sao_Paulo'
    }
  );

  logger.info(
    '[CRON] Tarefa de resumo diário agendada para 23:50 (America/Sao_Paulo).'
  );
});

client.on('message', async (message) => {
  try {
    const chat = await message.getChat();

    if (chat.isGroup) {
      // --- LÓGICA PARA MENSAGENS DE GRUPO ---
      const authorContact = await message.getContact();
      const groupName = chat.name;
      const authorName =
        authorContact.pushname || authorContact.name || message.author;

      logger.info(
        `[GRUPO] Em "${groupName}": De: ${authorName} | Mensagem: "${message.body}"`
      );

      if (message.body === '!todos') {
        let text = '';
        const mentions = [];

        for (const participant of chat.participants) {
          const contact = await client.getContactById(
            participant.id._serialized
          );

          mentions.push(contact);
          text += `@${participant.id.user} `;
        }

        await chat.sendMessage(text, { mentions });
        logger.info(`[AÇÃO GRUPO] Marquei todos no grupo "${groupName}".`);
      }
    } else {
      // --- LÓGICA PARA MENSAGENS PRIVADAS ---
      const contact = await message.getContact();
      const contactName = contact.pushname || contact.name || message.from;

      logger.info(
        `[PRIVADO] De: ${contactName} | Mensagem: "${message.body}"`
      );

      const messageData = {
        chatId: message.from,
        id: message.id.id,
        timestamp: message.timestamp,
        isoTimestamp: new Date(message.timestamp * 1000).toISOString(),
        senderName: contactName,
        type: message.type,
        body: message.body,
        fromMe: message.fromMe
      };
      db.addMessage(messageData);

      if (message.body === '!ping') {
        await message.reply('pong');
      } else if (
        message.body === '!pendencias' &&
        message.from === process.env.WHATSAPP_ADMIN_NUMBER
      ) {
        logger.info(
          'Comando !pendencias recebido. Gerando e enviando resumo...'
        );
        const todayStr = new Date().toISOString().slice(0, 10);
        const chatsDoDia = emailer.loadChatsByDate(todayStr);

        const { generatePendingSummary } = require('./summarizer');
        const resumoPendencias = generatePendingSummary(chatsDoDia);

        await client.sendMessage(message.from, resumoPendencias);
      }
    }
  } catch (err) {
    logger.error(
      `Erro ao processar mensagem ${message.id?.id || message.id} de ${message.from}:`,
      err
    );
  }
});

// Registra mensagens enviadas pelo bot
client.on('message_create', async (message) => {
  if (message.fromMe) {
    const chat = await message.getChat();
    let recipientName = chat.name;
    if (!chat.isGroup) {
      const contact = await client.getContactById(message.to);
      recipientName = contact.pushname || contact.name || message.to;
    }
    logger.info(
      `[MENSAGEM ENVIADA] Para: ${recipientName} (${message.to}) | Mensagem: "${message.body}"`
    );
  }
});

logger.info('Inicializando o cliente... Isso pode levar um minuto.');
client.initialize().catch((err) => {
  logger.error('Erro ao inicializar o cliente:', err);
});

// Servidor Express para health check (útil para Docker)
const app = express();
const port = process.env.PORT || 8080;
app.get('/health', (req, res) => {
  res.send('OK');
});
app.listen(port, () => {
  logger.info(`Servidor de health check ouvindo na porta ${port}`);
});
