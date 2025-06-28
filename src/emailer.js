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
 * @param {object} mailDetails - Objeto com os detalhes do e-mail (to, subject, text, html).
 */
async function sendEmail(mailDetails) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: mailDetails.to || process.env.EMAIL_TO, // Usa o 'to' dos detalhes ou o padrão
    subject: mailDetails.subject,
    text: mailDetails.text,
    html: mailDetails.html, // Adiciona suporte a HTML
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info(`E-mail "${mailOptions.subject}" enviado com sucesso para ${mailOptions.to}!`);
  } catch (error) {
    // Melhora o log para garantir que a mensagem de erro seja uma string.
    const errorMessage = error.message || error.toString();
    logger.error(`Erro ao enviar o e-mail "${mailOptions.subject}": ${errorMessage}`);
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
  
  await sendEmail({
    subject: '📋 Resumo Diário de Conversas',
    text: resumoTexto,
    html: `<pre>${resumoTexto}</pre>`,
  });
  
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
  
  await sendEmail({
    subject: '⏳ Resumo de Pendências',
    text: resumoTexto,
    html: `<pre>${resumoTexto}</pre>`,
  });
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
  sendEmail,
  sendDailySummary,
  sendPendingSummary,
  sendSummaryForDate,
  sendSummaryForLastDays
};
