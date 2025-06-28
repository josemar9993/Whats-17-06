const logger = require('./logger');
const sgMail = require('@sendgrid/mail');
require('dotenv').config();

// Configurar SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * Envia e-mail usando SendGrid
 */
async function sendEmailWithSendGrid(subject, content) {
  const msg = {
    to: process.env.EMAIL_TO,
    from: process.env.EMAIL_FROM,
    subject: subject,
    text: content,
    html: content.replace(/\n/g, '<br>')
  };

  try {
    await sgMail.send(msg);
    logger.info('✅ E-mail enviado com sucesso via SendGrid!');
    return true;
  } catch (error) {
    logger.error('❌ Erro ao enviar e-mail via SendGrid:', error.message);
    return false;
  }
}

/**
 * Gera e envia o resumo diário completo por e-mail.
 */
async function sendDailySummary(chats) {
  const { generateSummary } = require('./summarizer');
  
  if (!Array.isArray(chats)) {
    logger.warn('O parâmetro chats não é um array. O e-mail não será enviado.');
    return;
  }
  
  const resumoTexto = await generateSummary(chats);
  logger.info(resumoTexto);
  
  return await sendEmailWithSendGrid('📋 Resumo Diário de Conversas', resumoTexto);
}

/**
 * Gera e envia o resumo apenas de pendências por e-mail.
 */
async function sendPendingSummary(chats) {
  const { generatePendingSummary } = require('./summarizer');
  const resumoTexto = generatePendingSummary(chats);
  
  return await sendEmailWithSendGrid('⏳ Resumo de Pendências', resumoTexto);
}

module.exports = {
  sendDailySummary,
  sendPendingSummary,
  sendEmailWithSendGrid
};

