// src/emailer.js

// Importações necessárias
const logger = require('./logger');
const nodemailer = require('nodemailer');
const config = require('./config');
const { getAdminIds } = require('./utils/admin');

/**
 * Configura o transportador de e-mail (Gmail) com base nas variáveis de ambiente.
 */
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: config.emailUser,
    pass: config.emailPass
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
async function sendEmail(mailDetails, client) {
  const mailOptions = {
    from: config.emailUser,
    to: mailDetails.to || config.emailTo,
    subject: mailDetails.subject,
    text: mailDetails.text,
    html: mailDetails.html // Adiciona suporte a HTML
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info(
      `E-mail "${mailOptions.subject}" enviado com sucesso para ${mailOptions.to}!`
    );
  } catch (error) {
    const errorMessage = error.message || error.toString();
    logger.error(
      `Erro ao enviar o e-mail "${mailOptions.subject}": ${errorMessage}`
    );

    if (client) {
      try {
        const adminIds = getAdminIds();
        const adminId = adminIds[0];

        if (adminId) {
          await client.sendMessage(
            adminId,
            `⚠️ Falha ao enviar e-mail: ${errorMessage}`
          );
          logger.info(
            `Notificação de falha enviada via WhatsApp para ${adminId}.`
          );
        } else {
          logger.warn(
            'Admin não definido para receber notificação de falha por WhatsApp.'
          );
        }
      } catch (notifyErr) {
        logger.error(
          'Erro ao enviar notificação de falha via WhatsApp:',
          notifyErr
        );
      }
    }

    throw error;
  }
}

module.exports = {
  sendEmail
};
