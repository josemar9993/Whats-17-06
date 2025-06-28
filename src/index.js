require('winston-daily-rotate-file');
require('dotenv').config();

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcodeTerminal = require('qrcode-terminal');
const express = require('express');
const cron = require('node-cron');
const logger = require('./logger');
const db = require('./database');
const { sendSummaryForDate } = require('./emailer');

logger.info('Configurando o cliente do WhatsApp...');
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});

// Carregar comandos
client.commands = new Map();
const commandFolders = fs.readdirSync(path.join(__dirname, 'commands'));

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

  // Agendamento do resumo diário
  // Correção: Adicionado timezone para garantir a execução no horário de Brasília.
  // Refatoração: Simplificado para usar a função sendSummaryForDate, que já contém a lógica necessária.
  cron.schedule('0 23 * * *', async () => {
    logger.info('Executando tarefa agendada: envio do resumo diário.');
    try {
      const today = new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'
      await sendSummaryForDate(today);
      // A função sendSummaryForDate já registra se o e-mail foi enviado ou não.
      logger.info('Tarefa agendada de resumo diário concluída.');
    } catch (error) {
      // O erro já é logado dentro de sendEmail, mas podemos logar aqui também para o contexto do cron.
      logger.error('Erro ao executar a tarefa agendada de resumo diário:', error.message);
    }
  }, {
    scheduled: true,
    timezone: "America/Sao_Paulo"
  });
});

client.on('message', async (msg) => {
  await db.addMessageFromWhatsapp(msg);
  // A lógica de comando foi movida para o handler
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
