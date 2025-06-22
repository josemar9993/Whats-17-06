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

client.on('message', async (msg) => {
  try {
    logger.info(`MENSAGEM RECEBIDA de ${msg.from}: ${msg.body}`);
    // Armazena a mensagem se não for de grupo
    const chat = await msg.getChat();
    if (!chat.isGroup) {
      const contact = await msg.getContact();
      const messageData = {
        chatId: msg.from,
        id: msg.id.id,
        timestamp: msg.timestamp,
        isoTimestamp: new Date(msg.timestamp * 1000).toISOString(),
        senderName: contact.pushname || contact.name || msg.from,
        type: msg.type,
        body: msg.body,
        fromMe: msg.fromMe
      };
      db.addMessage(messageData);
    }

    if (msg.body === '!ping') {
      await msg.reply('pong');
      logger.info(`Respondeu pong para !ping de ${msg.from}`);
    } else if (
      msg.body === '!pendencias' &&
      msg.from === process.env.WHATSAPP_ADMIN_NUMBER
    ) {
      logger.info('Comando !pendencias recebido. Gerando e enviando resumo...');
      // Carrega as conversas do dia para análise
      const todayStr = new Date().toISOString().slice(0, 10);
      const chatsDoDia = emailer.loadChatsByDate(todayStr);

      const { generatePendingSummary } = require('./summarizer');
      const resumoPendencias = generatePendingSummary(chatsDoDia);

      await client.sendMessage(msg.from, resumoPendencias);
    }
    // Adicione sua lógica de manipulação de mensagens aqui
  } catch (err) {
    logger.error(
      `Erro ao processar mensagem ${msg.id?.id || msg.id} de ${msg.from}:`,
      err
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
