require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcodeTerminal = require('qrcode-terminal');
const express = require('express');
const cron = require('node-cron');
const emailer = require('./emailer');
const logger = require('./logger');

// Armazenamento em memória para mensagens do dia
let dailyMessages = [];

// Função para salvar conversas em arquivo
const saveDailyChats = () => {
  if (dailyMessages.length === 0) {
    logger.info('Nenhuma mensagem nova para salvar.');
    return;
  }
  const todayStr = new Date().toISOString().slice(0, 10);
  const filePath = path.resolve(__dirname, `../chats_salvos/chats-${todayStr}.json`);
  const dir = path.dirname(filePath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Lê o arquivo existente para adicionar novas mensagens, se houver
  let existingMessages = [];
  if (fs.existsSync(filePath)) {
    try {
      existingMessages = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (e) {
      logger.error('Erro ao ler arquivo de chats existente:', e);
    }
  }
  
  const allMessages = [...existingMessages, ...dailyMessages];

  fs.writeFile(filePath, JSON.stringify(allMessages, null, 2), 'utf8', (err) => {
    if (err) {
      logger.error('Erro ao salvar as conversas do dia:', err);
    } else {
      logger.info(`Conversas salvas com sucesso em ${filePath}`);
      dailyMessages = []; // Limpa a memória após salvar
    }
  });
};


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
    if (!fsSync.existsSync(logsDir)) fsSync.mkdirSync(logsDir, { recursive: true });
    fsSync.appendFileSync(pathSync.join(logsDir, 'exceptions.log'), `[${new Date().toISOString()}] Origin: ${origin}\n${err.stack || err}\n\n`);
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
    if (!fsSync.existsSync(logsDir)) fsSync.mkdirSync(logsDir, { recursive: true });
    fsSync.appendFileSync(pathSync.join(logsDir, 'rejections.log'), `[${new Date().toISOString()}] Reason: ${String(reason)}\n\n`);
  } catch (logErr) {
    logger.error('Falha ao escrever no log de rejeições síncrono:', logErr);
  }
});

logger.info("Configurando o cliente do WhatsApp...");
const client = new Client({
    authStrategy: new LocalAuth({ dataPath: "auth_data" }), // USANDO LocalAuth
    puppeteer: {
        headless: true, // Mantenha true para Docker, ou false para ver o navegador se rodar fora do Docker
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            // '--single-process', // Remova se causar problemas; às vezes necessário em ambientes restritos
            '--disable-gpu'
        ],
        // Para Windows, se rodar fora do Docker e o Chrome não for encontrado:
        // executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', 
    }
});

logger.info("Configurando eventos do cliente...");
client.on('qr', qr => {
    logger.info('QR Code recebido, escaneie por favor:');
    qrcodeTerminal.generate(qr, { small: true });
});

client.on('authenticated', () => {
    logger.info('Cliente autenticado!');
});

client.on('auth_failure', msg => {
    logger.error('Falha na autenticação:', msg);
});

client.on('ready', () => {
    logger.info('Cliente do WhatsApp está pronto!');

    // Agendamento de tarefas com node-cron
    // Salva as conversas e envia o e-mail de resumo diário às 23:50
    cron.schedule('50 23 * * *', () => {
        logger.info('[CRON] Executando tarefa de resumo diário...');
        saveDailyChats();
        
        // Aguarda um pouco para o arquivo ser escrito
        setTimeout(() => {
            const todayStr = new Date().toISOString().slice(0, 10);
            emailer.sendSummaryForDate(todayStr);
        }, 10000); // Atraso de 10 segundos
    }, {
        scheduled: true,
        timezone: "America/Sao_Paulo"
    });

    logger.info('[CRON] Tarefa de resumo diário agendada para 23:50 (America/Sao_Paulo).');
});

client.on('message', async msg => {
  try {
    // Armazena a mensagem se não for de grupo
    const chat = await msg.getChat();
    if (!chat.isGroup) {
      const contact = await msg.getContact();
      dailyMessages.push({
        chatId: msg.from,
        id: msg.id.id,
        timestamp: msg.timestamp,
        isoTimestamp: new Date(msg.timestamp * 1000).toISOString(),
        senderName: contact.pushname || contact.name || msg.from,
        type: msg.type,
        body: msg.body,
        fromMe: msg.fromMe,
      });
    }

    if (msg.body === '!ping') {
      await msg.reply('pong');
      logger.info(`Respondeu pong para !ping de ${msg.from}`);
    } else if (msg.body === '!pendencias' && msg.from === process.env.WHATSAPP_ADMIN_NUMBER) {
      logger.info('Comando !pendencias recebido. Gerando e enviando resumo...');
      // Carrega as conversas do dia para análise
      const todayStr = new Date().toISOString().slice(0, 10);
      const chatsDoDia = emailer.loadChatsByDate(todayStr);
      const todasAsConversas = [...chatsDoDia, ...dailyMessages]; // Combina salvas e em memória

      const { generatePendingSummary } = require('./summarizer');
      const resumoPendencias = generatePendingSummary(todasAsConversas);

      await client.sendMessage(msg.from, resumoPendencias);
    }
    // Adicione sua lógica de manipulação de mensagens aqui
  } catch (err) {
    logger.error(`Erro ao processar mensagem ${msg.id?.id || msg.id} de ${msg.from}:`, err);
  }
});

logger.info("Inicializando o cliente... Isso pode levar um minuto.");
client.initialize().catch(err => {
    logger.error("Erro ao inicializar o cliente:", err);
});

// Servidor Express para health check (útil para Docker)
const app = express();
const port = process.env.PORT || 8080; // O Dockerfile não expõe explicitamente, mas pm2 pode usar
app.get('/', (req, res) => {
  res.send('Bot WhatsApp (local) está rodando!');
});
app.listen(port, () => {
  logger.info(`Servidor de teste local ouvindo na porta ${port}`);
});
