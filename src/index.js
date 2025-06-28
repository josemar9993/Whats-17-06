require('winston-daily-rotate-file');
require('dotenv').config();

const db = require('./database');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcodeTerminal = require('qrcode-terminal');
const express = require('express');
const cron = require('node-cron');
const emailer = require('./emailer');
const logger = require('./logger');
const { Collection } = require('@discordjs/collection');
const fs = require('fs');
const path = require('path');

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
  authStrategy: new LocalAuth({ clientId: 'client-one' }),
  puppeteer: { 
    executablePath: '/usr/bin/google-chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox'] 
  }
});

// Coleção que armazenará os comandos
client.commands = new Collection();

// Carrega os comandos dinamicamente
const commandsPath = path.join(__dirname, 'commands');
if (fs.existsSync(commandsPath)) {
  const commandFolders = fs.readdirSync(commandsPath);
  for (const folder of commandFolders) {
    const folderPath = path.join(commandsPath, folder);
    const commandFiles = fs
      .readdirSync(folderPath)
      .filter((file) => file.endsWith('.js'));
    for (const file of commandFiles) {
      const filePath = path.join(folderPath, file);
      const command = require(filePath);
      if (command.name && command.execute) {
        client.commands.set(command.name, command);
        logger.info(`[COMANDO CARREGADO] ${command.name}`);
      } else {
        logger.warn(`Comando em ${filePath} ignorado (formato inválido).`);
      }
    }
  }
}

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
  // Executa todo dia às 16:00 BRT por padrão
  const summaryCron = process.env.DAILY_SUMMARY_CRON || '0 16 * * *';
  cron.schedule(
    summaryCron,
    async () => {
      logger.info('[CRON] Executando tarefa de resumo diário...');
      const days = parseInt(process.env.DEFAULT_SUMMARY_DAYS || '1', 10);
      const resumo = await emailer.sendSummaryForLastDays(days);
      if (process.env.WHATSAPP_NOTIFY === 'true') {
        try {
          await client.sendMessage(process.env.WHATSAPP_ADMIN_NUMBER, resumo);
          logger.info('Resumo diário enviado também via WhatsApp.');
        } catch (err) {
          logger.error('Falha ao enviar resumo via WhatsApp:', err);
        }
      }
    },
    {
      scheduled: true,
      timezone: 'America/Sao_Paulo'
    }
  );

  logger.info(`[CRON] Tarefa de resumo diário agendada para "${summaryCron}".`);
});

client.on('message', async (message) => {
  try {
    let chat;
    try {
      chat = await message.getChat();
    } catch (chatErr) {
      logger.warn(
        `Não foi possível obter o chat da mensagem ${
          message.id?.id || message.id
        }: ${chatErr.message}`
      );
      return;
    }
    const contact = await message.getContact();
    const contactName =
      contact.pushname || contact.name || (chat.isGroup ? message.author : message.from);

    if (chat.isGroup) {
      logger.info(
        `[GRUPO] Em "${chat.name}": De: ${contactName} | Mensagem: "${message.body}"`
      );
    } else {
      logger.info(`[PRIVADO] De: ${contactName} | Mensagem: "${message.body}"`);
    }

    const messageData = {
      chatId: chat.id._serialized,
      id: message.id.id,
      timestamp: message.timestamp,
      isoTimestamp: new Date(message.timestamp * 1000).toISOString(),
      senderName: contactName,
      type: message.type,
      body: message.body,
      fromMe: message.fromMe
    };
    await db.addMessage(messageData);

    const prefix = '!';
    if (!message.body.startsWith(prefix) || message.fromMe) return;

    const args = message.body.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName);
    if (!command) return;

    logger.info(`[EXECUÇÃO] Executando comando "${command.name}"...`);
    await command.execute(message, args, client);
  } catch (err) {
    logger.error(
      `Erro ao processar mensagem ${message.id?.id || message.id} de ${message.from}:`,
      err
    );
    try {
      await message.reply('Ocorreu um erro ao processar sua mensagem!');
    } catch (e) {
      logger.error('Falha ao enviar mensagem de erro:', e);
    }
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

    const messageData = {
      chatId: chat.id._serialized,
      id: message.id.id,
      timestamp: message.timestamp,
      isoTimestamp: new Date(message.timestamp * 1000).toISOString(),
      senderName: 'Eu',
      type: message.type,
      body: message.body,
      fromMe: true
    };
    await db.addMessage(messageData);
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
