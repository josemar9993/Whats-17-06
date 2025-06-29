require('winston-daily-rotate-file');
require('dotenv').config();

const config = require('./config');
const { getAdminIds, isAdmin } = require('./utils/admin');

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcodeTerminal = require('qrcode-terminal');
const express = require('express');
const cron = require('node-cron');
const logger = require('./logger');
const db = require('./database');
const { createDailySummary } = require('./summarizer');
const fs = require('fs');
const path = require('path');

logger.info('Configurando o cliente do WhatsApp...');

// Debug da configuração
logger.info(`[DEBUG CONFIG] commandPrefix: "${config.commandPrefix}"`);
logger.info(`[DEBUG CONFIG] dailySummaryCron: "${config.dailySummaryCron}"`);

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});

// Carregar comandos
client.commands = new Map();
const commandsPath = path.join(__dirname, 'commands');
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

client.on('disconnected', (reason) => {
  logger.warn(`Cliente desconectado: ${reason}. Tentando reiniciar...`);
  client.destroy();
  client.initialize().catch((err) => logger.error('Erro ao reiniciar cliente:', err));
});

client.on('ready', () => {
  logger.info('Cliente do WhatsApp está pronto!');

  const summaryCron = config.dailySummaryCron;
  
  cron.schedule(
    summaryCron,
    async () => {
      logger.info(`[CRON] Executando tarefa de resumo diário agendada para "${summaryCron}"...`);
      try {
        const today = new Date().toISOString().slice(0, 10);
        const chats = await db.getMessagesByDate(today);

        if (!chats || chats.length === 0) {
          logger.info(`[CRON] Nenhuma conversa encontrada para ${today}, resumo não gerado.`);
          return;
        }

        const summaryText = await createDailySummary(chats);
        
        const adminIds = getAdminIds();
        const primaryAdminId = adminIds[0];

        if (primaryAdminId) {
          await client.sendMessage(primaryAdminId, summaryText);
          logger.info(`[CRON] Resumo diário enviado via WhatsApp para o admin primário ${primaryAdminId}.`);
        } else {
          logger.warn('[CRON] ADMIN_WHATSAPP_IDS não definido. O resumo não foi enviado.');
        }

        logger.info('[CRON] Tarefa de resumo diário concluída com sucesso.');
      } catch (error) {
        logger.error('[CRON] Erro ao executar a tarefa de resumo diário:', error.message);
        try {
          const adminIds = getAdminIds();
          const adminId = adminIds[0];
          if (adminId) {
            await client.sendMessage(
              adminId,
              `⚠️ Falha ao gerar ou enviar o resumo diário: ${error.message}`
            );
          }
        } catch (notifyErr) {
          logger.error('Erro ao notificar administrador sobre falha do cron:', notifyErr);
        }
      }
    },
    {
      scheduled: true,
      timezone: 'America/Sao_Paulo'
    }
  );

  logger.info(`[CRON] Tarefa de resumo diário agendada com a expressão: "${summaryCron}" no fuso horário de São Paulo.`);
});

client.on('message', async (msg) => {
  const prefix = config.commandPrefix || '!';

  if (msg.from === 'status@broadcast') {
    return;
  }

  if (msg.fromMe) {
    logger.info(`[MENSAGEM PRÓPRIA] ${msg.body}`);
    return;
  }

  try {
    await db.addMessageFromWhatsapp(msg);
    logger.info(`[MENSAGEM RECEBIDA] De: ${msg._data.notifyName || msg.from} | Mensagem: "${msg.body}"`);
  } catch (dbErr) {
    logger.error('Erro ao salvar mensagem no banco:', dbErr);
    const adminIds = getAdminIds();
    const primaryAdmin = adminIds[0];
    if (primaryAdmin) {
      await client.sendMessage(
        primaryAdmin,
        `⚠️ Erro ao salvar mensagem no banco: ${dbErr.message}`
      );
    }
  }

  // Verifica se é um comando
  const isCommand = msg.body && msg.body.startsWith(prefix);
  if (!isCommand) {
    return;
  }

  const args = msg.body.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();
  const command = client.commands.get(commandName);

  // Processa o comando
  if (!command) {
    // Responde apenas se a menção for direta ou em grupos
    const chat = await msg.getChat();
    if (!chat.isGroup || msg.mentionedIds.includes(client.info.wid._serialized)) {
      await msg.reply('Comando não reconhecido. Digite `!ajuda` para ver a lista de comandos.');
    }
    return;
  }

  const start = Date.now();
  try {
    await command.execute(msg, args, client);
    const duration = Date.now() - start;
    logger.info(`[COMANDO EXECUTADO] ${command.name} por ${msg._data.notifyName || msg.from} em ${duration}ms`);
  } catch (error) {
    logger.error(`Erro ao processar comando: ${error.message}`, error);
    try {
      await msg.reply('Ocorreu um erro ao tentar executar esse comando.');
    } catch (e) {
      logger.error('Erro ao enviar mensagem de erro para o usuário:', e);
    }
  }
});

// Registra mensagens enviadas pelo bot
client.on('message_create', async (message) => {
  if (message.fromMe) {
    logger.info(`[DEBUG] message_create disparado: fromMe=${message.fromMe}, to=${message.to}, body=${message.body}`);

    const chat = await message.getChat();
    let recipientName = chat.name;
    if (!chat.isGroup) {
      try {
        const contact = await client.getContactById(message.to);
        recipientName = contact.pushname || contact.name || message.to;
      } catch (err) {
        recipientName = message.to;
      }
    }
    logger.info(
      `[MENSAGEM ENVIADA] Para: ${recipientName} (${message.to}) | Mensagem: \"${message.body}\"`
    );

    // Salva no banco de dados
    try {
      const messageData = {
        chatId: chat.id._serialized,
        id: message.id.id,
        timestamp: message.timestamp,
        isoTimestamp: new Date(message.timestamp * 1000).toISOString(),
        senderName: 'Bot Whts',
        type: message.type,
        body: message.body,
        fromMe: true
      };
      await db.addMessage(messageData);
    } catch (dbErr) {
      logger.error('Erro ao salvar mensagem enviada no banco:', dbErr);
    }

    // Se a mensagem enviada for um comando para o contato específico, executa o comando
    const targetContact = '554899931227@c.us';
    const prefix = config.commandPrefix;
    logger.info(`[DEBUG] Verificando: to=${message.to}, target=${targetContact}, body=\"${message.body}\", prefix=\"${prefix}\", startsWith=${message.body?.startsWith(prefix)}`);

    if (message.to === targetContact && message.body && message.body.startsWith(prefix)) {
      logger.info(`[EXECUTANDO COMANDO ENVIADO] ${message.body} para ${recipientName}`);

      try {
        const args = message.body.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();
        const command = client.commands.get(commandName);

        logger.info(`[DEBUG] CommandName: ${commandName}, Command found: ${!!command}`);
        if (command) {
          const start = Date.now();
          logger.info(`[DEBUG] Executando comando ${commandName}...`);
          await command.execute(message, args, client);
          const duration = Date.now() - start;
          logger.info(`[COMANDO EXECUTADO] ${command.name} (auto-executado) em ${duration}ms`);
        } else {
          logger.warn(`[COMANDO NÃO ENCONTRADO] ${commandName}`);
        }
      } catch (error) {
        logger.error(`Erro ao executar comando auto-enviado: ${error.message}`, error);
      }
    } else {
      logger.info(`[DEBUG] Condições não atendidas - to match: ${message.to === targetContact}, body exists: ${!!message.body}, startsWith: ${message.body?.startsWith(prefix)}`);
    }
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
