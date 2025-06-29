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
const { createDailySummary } = require('./summarizer'); // Corrigido para createDailySummary
const fs = require('fs');
const path = require('path');

logger.info('Configurando o cliente do WhatsApp...');
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});

// Carregar comandos
client.commands = new Map();
const commandsPath = path.join(__dirname, 'commands'); // Definir o caminho base para os comandos
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

  // Agendamento de tarefas com node-cron
  // Executa todo dia às 16h, horário de Brasília.
  const summaryCron = config.dailySummaryCron;
  
  cron.schedule(
    summaryCron,
    async () => {
      logger.info(`[CRON] Executando tarefa de resumo diário agendada para "${summaryCron}"...`);
      try {
        const today = new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'
        const chats = await db.getMessagesByDate(today); // Corrigido para getMessagesByDate

        if (!chats || chats.length === 0) {
          logger.info(`[CRON] Nenhuma conversa encontrada para ${today}, resumo não gerado.`);
          return; // Sai se não houver chats
        }

        const summaryText = await createDailySummary(chats); // Corrigido para createDailySummary
        
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
  const prefix = process.env.COMMAND_PREFIX || '!';

  const isCommand = msg.body.startsWith(prefix);
  // Verifica se o remetente está na lista de administradores
  const isAdminUser = isAdmin(msg.from);

  // Ignora mensagens do próprio bot, a menos que seja um comando de um admin.
  if (msg.fromMe && !(isCommand && isAdminUser)) {
    return;
  }

  try {
    // Salva a mensagem recebida no banco de dados (APENAS se não for do bot)
    if (!msg.fromMe) {
      try {
        await db.addMessageFromWhatsapp(msg);
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
    }

    // Ignora mensagens que não são comandos ou que vêm de status
    if (!isCommand || msg.from === 'status@broadcast') {
      return;
    }

    const args = msg.body.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName);

    if (!command) {
      // Responde apenas se a menção for direta ou em grupos
      const chat = await msg.getChat();
      if (!chat.isGroup || msg.mentionedIds.includes(client.info.wid._serialized)) {
         await msg.reply('Comando não reconhecido. Digite `!ajuda` para ver a lista de comandos.');
      }
      return;
    }

    const start = Date.now();
    await command.execute(msg, args, client);
    const duration = Date.now() - start;
    logger.info(`[COMANDO EXECUTADO] ${command.name} por ${msg._data.notifyName} em ${duration}ms`);

  } catch (error) {
    logger.error(`Erro ao processar mensagem: ${error.message}`, error);
    // Evita crashar o bot por um erro em um único comando/mensagem
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

// Forçando a atualização para limpar os erros do servidor.
