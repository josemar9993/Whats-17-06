require('winston-daily-rotate-file');
require('dotenv').config();

const config = require('./config');
const { getAdminIds } = require('./utils/admin');
const logger = require('./logger');
const db = require('./database');
const { createDailySummary } = require('./summarizer');
const fs = require('fs');
const path = require('path');

// Importar novas funcionalidades da Fase 1
const CONSTANTS = require('./constants');
// const cache = require('./cache/manager'); // Disponível se necessário
const validator = require('./validators/commandValidator');
const errorHandler = require('./utils/errorHandler');
const retryManager = require('./utils/retryManager');
const rateLimiter = require('./middleware/rateLimiter');

// Importar tratamento de mídia
const MediaHandler = require('./utils/mediaHandler');
const mediaHandler = new MediaHandler();

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcodeTerminal = require('qrcode-terminal');
const express = require('express');
const cron = require('node-cron');

const startTime = Date.now(); // Marca o início do bot para cálculo de uptime

// Definir variáveis globais para integração
global.botStartTime = startTime;
global.whatsappClient = null;

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

client.startTime = startTime;

// Definir cliente global para integração
global.whatsappClient = client;

// Configurar Express server para health check e monitoramento
const app = express();
const PORT = process.env.PORT || 8080;

// Middleware básico
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  const uptime = Math.floor((Date.now() - startTime) / 1000);
  const hours = Math.floor(uptime / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = uptime % 60;
  
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: `${hours}h ${minutes}m ${seconds}s`,
    version: '1.1.0',
    database: 'connected',
    commands: client.commands ? client.commands.size : 0,
    memory: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`,
    environment: process.env.NODE_ENV || 'development'
  });
});

// Status endpoint
app.get('/status', (req, res) => {
  res.json({
    status: 'running',
    whatsapp: global.whatsappClient ? 'connected' : 'disconnected',
    commands_loaded: client.commands ? client.commands.size : 0,
    uptime_seconds: Math.floor((Date.now() - startTime) / 1000),
    node_version: process.version,
    platform: process.platform
  });
});

// Commands endpoint
app.get('/commands', (req, res) => {
  const commands = [];
  if (client.commands) {
    client.commands.forEach((command, name) => {
      commands.push({
        name: name,
        description: command.description || 'Sem descrição'
      });
    });
  }
  res.json({
    total: commands.length,
    commands: commands
  });
});

// Iniciar servidor Express
app.listen(PORT, () => {
  logger.info(`Express server iniciado na porta ${PORT}`);
  logger.info(`Health check disponível em: http://localhost:${PORT}/health`);
  logger.info(`Status disponível em: http://localhost:${PORT}/status`);
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
  client
    .initialize()
    .catch((err) => logger.error('Erro ao reiniciar cliente:', err));
});

client.on('ready', () => {
  logger.info('Cliente do WhatsApp está pronto!');

  const summaryCron = config.dailySummaryCron;

  cron.schedule(
    summaryCron,
    async () => {
      logger.info(
        `[CRON] Executando tarefa de resumo diário agendada para "${summaryCron}"...`
      );
      try {
        const today = new Date().toISOString().slice(0, 10);
        const chats = await db.getMessagesByDate(today);

        if (!chats || chats.length === 0) {
          logger.info(
            `[CRON] Nenhuma conversa encontrada para ${today}, resumo não gerado.`
          );
          return;
        }

        const summaryText = await createDailySummary(chats);

        const adminIds = getAdminIds();
        const primaryAdminId = adminIds[0];

        if (primaryAdminId) {
          await client.sendMessage(primaryAdminId, summaryText);
          logger.info(
            `[CRON] Resumo diário enviado via WhatsApp para o admin primário ${primaryAdminId}.`
          );
        } else {
          logger.warn(
            '[CRON] ADMIN_WHATSAPP_IDS não definido. O resumo não foi enviado.'
          );
        }

        logger.info('[CRON] Tarefa de resumo diário concluída com sucesso.');
      } catch (error) {
        logger.error(
          '[CRON] Erro ao executar a tarefa de resumo diário:',
          error.message
        );
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
          logger.error(
            'Erro ao notificar administrador sobre falha do cron:',
            notifyErr
          );
        }
      }
    },
    {
      scheduled: true,
      timezone: 'America/Sao_Paulo'
    }
  );

  logger.info(
    `[CRON] Tarefa de resumo diário agendada com a expressão: "${summaryCron}" no fuso horário de São Paulo.`
  );
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

  // Verificar se é mensagem de mídia antes de processar
  if (mediaHandler.isMediaMessage(msg)) {
    try {
      logger.info(
        `[MÍDIA DETECTADA] De: ${msg._data.notifyName || msg.from} | Tipo: ${msg.type || 'unknown'}`
      );

      // Processar informações da mídia
      const mediaInfo = await mediaHandler.processMediaMessage(msg);

      // RESPOSTA AUTOMÁTICA PARA MÍDIA COMPLETAMENTE REMOVIDA
      // Sistema agora processa mídia silenciosamente sem enviar qualquer resposta
      // const response = await mediaHandler.createResponse(mediaInfo);
      // if (response) {
      //   await msg.reply(response);
      //   logger.info(`[RESPOSTA MÍDIA] Enviada para ${msg._data.notifyName || msg.from}: ${response.substring(0, 50)}...`);
      // }

      logger.info(`[MÍDIA PROCESSADA SILENCIOSAMENTE] Tipo: ${mediaInfo.mediaType} | De: ${msg._data.notifyName || msg.from} | SEM RESPOSTA AUTOMÁTICA`);

      // Salvar mensagem de mídia no banco com informações processadas
      try {
        // Criar cópia da mensagem com informações de mídia adicionadas
        const messageWithMedia = {
          ...msg,
          body: msg.body || `[${mediaInfo.mediaType}]`,
          mediaInfo: mediaInfo
        };

        await db.addMessageFromWhatsapp(messageWithMedia);
        logger.info(
          `[MÍDIA SALVA] Tipo: ${mediaInfo.mediaType} | De: ${msg._data.notifyName || msg.from}`
        );
      } catch (dbErr) {
        logger.error('Erro ao salvar mensagem de mídia no banco:', dbErr);
      }

      // Para mensagens de mídia, não processar como comando mesmo se tiver prefix
      return;
    } catch (mediaErr) {
      logger.error('Erro ao processar mensagem de mídia:', mediaErr);
      // Continua o fluxo normal se houver erro no processamento de mídia
    }
  }

  try {
    // Validar mensagem básica (apenas para mensagens de texto)
    const messageValidation = validator.validateMessage(msg);
    if (messageValidation.error) {
      logger.warn(
        'Mensagem inválida recebida:',
        messageValidation.error.message
      );
      return;
    }

    await db.addMessageFromWhatsapp(msg);
    logger.info(
      `[MENSAGEM RECEBIDA] De: ${msg._data.notifyName || msg.from} | Mensagem: "${msg.body}"`
    );
  } catch (dbErr) {
    // Usar error handler para tratar erros de banco
    const errorResponse = await errorHandler.handle(dbErr, {
      operation: 'save_message',
      userId: msg.from,
      command: 'message_received'
    });

    if (errorResponse.shouldReply) {
      await msg.reply(errorResponse.userMessage);
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
    if (
      !chat.isGroup ||
      msg.mentionedIds.includes(client.info.wid._serialized)
    ) {
      await msg.reply(
        'Comando não reconhecido. Digite `!ajuda` para ver a lista de comandos.'
      );
    }
    return;
  }

  const start = Date.now();
  try {
    // Verificar rate limiting
    const rateLimitResult = rateLimiter.checkLimit(msg.from, commandName);
    if (!rateLimitResult.allowed) {
      await msg.reply(
        `⏰ ${rateLimitResult.reason}. Tente novamente em ${rateLimitResult.retryAfter || 60} segundos.`
      );
      return;
    }

    // Executar comando com timeout e retry se necessário
    await retryManager.executeWithTimeout(async () => {
      await command.execute(msg, args, client);
    }, CONSTANTS.COMMAND_TIMEOUT);

    const duration = Date.now() - start;
    logger.info(
      `[COMANDO EXECUTADO] ${command.name} por ${msg._data.notifyName || msg.from} em ${duration}ms`
    );
  } catch (error) {
    // Usar error handler centralizado
    const errorResponse = await errorHandler.handle(error, {
      operation: 'execute_command',
      command: commandName,
      userId: msg.from,
      args: args
    });

    if (errorResponse.shouldReply) {
      try {
        await msg.reply(errorResponse.userMessage);
      } catch (replyError) {
        logger.error('Erro ao enviar mensagem de erro:', replyError);
      }
    }
  }
});

// Registra mensagens enviadas pelo bot
client.on('message_create', async (message) => {
  const isCommand =
    message.body && message.body.startsWith(config.commandPrefix || '!');

  // Se for uma mensagem própria (fromMe=true)
  if (message.fromMe) {
    // Se for um comando, processa normalmente
    if (isCommand) {
      logger.info(
        `[EXECUTANDO COMANDO ENVIADO] ${message.body} para ${message.to}`
      );

      const args = message.body
        .slice((config.commandPrefix || '!').length)
        .trim()
        .split(/ +/);
      const commandName = args.shift().toLowerCase();
      const command = client.commands.get(commandName);

      logger.info(
        `[DEBUG] CommandName: ${commandName}, Command found: ${!!command}`
      );

      if (command) {
        logger.info(`[DEBUG] Executando comando ${commandName}...`);
        const start = Date.now();
        try {
          // Cria um objeto mock de mensagem para compatibilidade com os comandos
          const mockMsg = {
            ...message,
            reply: async (text) => {
              await client.sendMessage(message.to, text);
            },
            getChat: async () => {
              return await client.getChatById(message.to);
            },
            _data: {
              notifyName: 'Auto-executado'
            }
          };

          await command.execute(mockMsg, args, client);
          const duration = Date.now() - start;
          logger.info(
            `[COMANDO EXECUTADO] ${command.name} (auto-executado) em ${duration}ms`
          );
        } catch (error) {
          logger.error(
            `Erro ao executar comando auto-enviado: ${error.message}`,
            error
          );
        }
      }
      return;
    }

    // Se não for comando, apenas registra que foi ignorado
    logger.info(
      `[DEBUG] message_create disparado, mas ignorado (fromMe=true, não é comando): to=${message.to}, body=${message.body.substring(0, 50)}...`
    );
    return;
  }

  const sender = await message.getContact();
  const senderName = sender.pushname || sender.name || sender.number;
  logger.info(
    `[MENSAGEM ENVIADA] Para: ${senderName} (${message.to}) | Mensagem: "${message.body}"`
  );

  // Salva no banco de dados
  try {
    const messageData = {
      chatId: message.to,
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
  logger.info(
    `[DEBUG] Verificando: to=${message.to}, target=${targetContact}, body="${message.body}", prefix="${prefix}", startsWith=${message.body?.startsWith(prefix)}`
  );

  if (
    message.to === targetContact &&
    message.body &&
    message.body.startsWith(prefix)
  ) {
    logger.info(
      `[EXECUTANDO COMANDO ENVIADO] ${message.body} para ${senderName}`
    );

    try {
      const args = message.body.slice(prefix.length).trim().split(/ +/);
      const commandName = args.shift().toLowerCase();
      const command = client.commands.get(commandName);

      logger.info(
        `[DEBUG] CommandName: ${commandName}, Command found: ${!!command}`
      );
      if (command) {
        const start = Date.now();
        logger.info(`[DEBUG] Executando comando ${commandName}...`);
        await command.execute(message, args, client);
        const duration = Date.now() - start;
        logger.info(
          `[COMANDO EXECUTADO] ${command.name} (auto-executado) em ${duration}ms`
        );
      } else {
        logger.warn(`[COMANDO NÃO ENCONTRADO] ${commandName}`);
      }
    } catch (error) {
      logger.error(
        `Erro ao executar comando auto-enviado: ${error.message}`,
        error
      );
    }
  } else if (message.body && message.body.startsWith(prefix)) {
    logger.info(
      `[DEBUG] Condições não atendidas - to match: ${message.to === targetContact}, body exists: ${!!message.body}, startsWith: ${message.body?.startsWith(prefix)}`
    );
  }
});

// Inicializar o cliente WhatsApp
logger.info('Inicializando cliente WhatsApp...');
client.initialize().catch((err) => {
  logger.error('Erro ao inicializar cliente WhatsApp:', err);
});
