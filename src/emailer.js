// src/emailer.js

// Importações necessárias
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const nodemailer = require('nodemailer');
const logger = require('./logger');

/**
 * Configura o transportador de e-mail (Gmail) com base nas variáveis de ambiente.
 * - EMAIL_USER: email remetente (ex.: seu_usuario@gmail.com)
 * - EMAIL_PASSWORD: senha de aplicativo do Google (NÃO a senha normal)
 */
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

/**
 * Gera e envia o resumo diário completo por e-mail.
 * 
 * @param {Object} chats  Mesmo objeto de chats usado no summarizer.js
 */
async function sendDailySummary(chats) {
  const { generateSummary } = require('./summarizer');
  if (!Array.isArray(chats)) {
    logger.warn('O parâmetro chats não é um array. O e-mail não será enviado.');
    return;
  }
  if (chats.length === 0) {
    logger.warn('Nenhuma mensagem encontrada. Gerando análise vazia.');
  }
  const resumoTexto = await generateSummary(chats);

  // Adicione esta linha para visualizar no terminal:
  logger.info(resumoTexto);

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_TO,
    subject: '📋 Resumo Diário de Conversas',
    text: resumoTexto
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info('Email de resumo diário enviado com sucesso!');
  } catch (error) {
    logger.error('Erro ao enviar o email:', error);
  }
}

/**
 * Gera e envia o resumo apenas de pendências por e-mail.
 * 
 * @param {Object} chats
 */
async function sendPendingSummary(chats) {
  const { generatePendingSummary } = require('./summarizer');
  const resumoTexto = generatePendingSummary(chats);

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_TO,
    subject: '⏳ Resumo de Pendências (Hoje às 23h)',
    text: resumoTexto
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info('Email de pendências enviado com sucesso!');
  } catch (error) {
    logger.error('Erro ao enviar o email de pendências:', error);
  }
}


/**
 * Carrega as conversas de um dia específico (formato: YYYY-MM-DD).
 * Supondo que cada dia esteja em um arquivo chats_salvos/chats-YYYY-MM-DD.json
 */
function loadChatsByDate(dateStr) {
  const filePath = path.resolve(__dirname, `../chats_salvos/chats-${dateStr}.json`);
  if (fs.existsSync(filePath)) {
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      if (Array.isArray(data)) {
        logger.info(`Carregado ${data.length} mensagens de ${filePath}`);
        return data;
      }
      logger.error('O arquivo não contém um array de mensagens válido.');
      return [];
    } catch (e) {
      logger.error('Erro ao ler o arquivo JSON:', e.message);
      return [];
    }
  }
  logger.warn(`Arquivo não encontrado: ${filePath}`);
  return [];
}

/**
 * Envia o resumo das conversas de um dia específico por e-mail.
 * @param {string} dateStr - Data no formato YYYY-MM-DD
 */
async function sendSummaryForDate(dateStr) {
  const chats = loadChatsByDate(dateStr);
  if (!chats || chats.length === 0) {
    logger.info(`Nenhuma conversa encontrada para ${dateStr}`);
    return;
  }
  await sendDailySummary(chats);
}

// Exemplo de uso prático: enviar o resumo do dia atual
if (require.main === module) {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  sendSummaryForDate(today);
}

module.exports = {
  sendDailySummary,
  sendPendingSummary,
  sendSummaryForDate,
  loadChatsByDate
};
