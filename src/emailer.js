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
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: process.env.SMTP_PORT === '465', // true para 465, false para as outras
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
 * @param {object} [client] - Instância do cliente do WhatsApp para enviar notificações de falha.
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
      `Erro ao enviar o e-mail "${mailOptions.subject}": ${errorMessage}`,
      { subject: mailOptions.subject, error }
    );

    // Tenta notificar o admin via WhatsApp se o client for fornecido
    if (client && typeof client.sendMessage === 'function') {
      try {
        const adminIds = getAdminIds();
        const adminId = adminIds[0];

        if (adminId) {
          const notificationMessage = `⚠️ *Falha Crítica no Envio de E-mail* ⚠️\n\n*Assunto:* ${mailOptions.subject}\n*Erro:* ${errorMessage}\n\nO sistema não conseguiu enviar este e-mail. Verifique as configurações de SMTP e a conexão do servidor.`;
          await client.sendMessage(adminId, notificationMessage);
          logger.info(`Notificação de falha no envio de e-mail enviada via WhatsApp para ${adminId}.`);
        } else {
          logger.warn('Nenhum admin ID configurado para receber notificação de falha de e-mail.');
        }
      } catch (notifyErr) {
        logger.error('Falha ao enviar a notificação de erro via WhatsApp:', { message: notifyErr.message, stack: notifyErr.stack });
      }
    } else if (client) {
      logger.warn('O objeto client foi fornecido para sendEmail, mas não possui o método sendMessage.');
    }

    // Re-lança o erro para que a função chamadora saiba que a operação falhou.
    throw error;
  }
}

module.exports = {
  sendEmail
};
