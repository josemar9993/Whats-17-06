// src/emailer.js

// Importações necessárias
const logger = require('./logger');
const db = require('./database');
require('dotenv').config();
const nodemailer = require('nodemailer');
const { generateSummary, generatePendingSummary } = require('./summarizer');

/**
 * Configura o transportador de e-mail (Gmail) com base nas variáveis de ambiente.
 */
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  },
  connectionTimeout: 60000,
  greetingTimeout: 30000,
  socketTimeout: 60000
});

/**
 * Envia um e-mail de forma genérica.
 * @param {string} subject - O assunto do e-mail.
 * @param {string} text - O corpo do e-mail em texto plano.
 */
async function sendEmail(subject, text) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_TO,
    subject: subject,
    text: text
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info(`E-mail "${subject}" enviado com sucesso!`);
  } catch (error) {
    logger.error(`Erro ao enviar o e-mail "${subject}":`, error);
    // Re-lançar o erro pode ser útil se o chamador precisar saber que falhou
    throw error;
  }
}

/**
 * Gera e envia o resumo diário completo por e-mail.
 *
 * @param {Object[]} chats - Array de conversas.
 */
async function sendDailySummary(chats) {
  if (!Array.isArray(chats)) {
    logger.warn('O parâmetro chats não é um array. O e-mail não será enviado.');
    return;
  }
  if (chats.length === 0) {
    logger.warn('Nenhuma mensagem encontrada para o resumo diário.');
  }
  
  const resumoTexto = await generateSummary(chats);
  logger.info('Resumo diário gerado.');
  
  await sendEmail('📋 Resumo Diário de Conversas', resumoTexto);
  
  return resumoTexto;
}

/**
 * Gera e envia o resumo apenas de pendências por e-mail.
 *
 * @param {Object[]} chats - Array de conversas.
 */
async function sendPendingSummary(chats) {
  const resumoTexto = generatePendingSummary(chats);
  logger.info('Resumo de pendências gerado.');
  
  await sendEmail('⏳ Resumo de Pendências', resumoTexto);
}

/**
 * Envia o resumo das conversas de um dia específico por e-mail.
 * @param {string} dateStr - Data no formato YYYY-MM-DD
 */
async function sendSummaryForDate(dateStr) {
  const chats = await db.loadChatsByDate(dateStr);
  if (!chats || chats.length === 0) {
    logger.info(`Nenhuma conversa encontrada para ${dateStr}, e-mail não enviado.`);
    return '';
  }
  return await sendDailySummary(chats);
}

/**
 * Envia o resumo dos últimos `days` dias por e-mail.
 * @param {number} days - Quantidade de dias a incluir no resumo.
 */
async function sendSummaryForLastDays(days) {
  const chats = await db.loadChatsForLastDays(days);
  if (chats.length === 0) {
    logger.info(`Nenhuma conversa encontrada nos últimos ${days} dias, e-mail não enviado.`);
    return '';
  }
  return await sendDailySummary(chats);
}

module.exports = {
  sendDailySummary,
  sendPendingSummary,
  sendSummaryForDate,
  sendSummaryForLastDays
};
