// src/emailer.js

// Importações necessárias
const logger = require('./logger');
require('dotenv').config();
const nodemailer = require('nodemailer');

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

module.exports = {
  sendEmail,
};
