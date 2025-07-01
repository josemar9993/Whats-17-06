// src/commands/util/test-email.js
const { sendEmail } = require('../../emailer');

module.exports = {
  name: 'test-email',
  description: 'Envia um e-mail de teste para validar a configuração.',
  async execute(message, args, client) {
    try {
      const to = process.env.EMAIL_TO || require('../../config').emailTo;
      if (!to) {
        await message.reply(
          'Destinatário de teste não configurado. Defina EMAIL_TO no .env ou config.js.'
        );
        return;
      }
      await message.reply('Enviando e-mail de teste para: ' + to);
      await sendEmail(
        {
          to,
          subject: 'Teste de Envio de E-mail via Bot WhatsApp',
          text: 'Este é um e-mail de teste enviado diretamente pelo comando !test-email do bot.',
          html: '<p>Este é um e-mail de teste enviado diretamente pelo comando <b>!test-email</b> do bot.</p>'
        },
        client
      );
      await message.reply(
        'E-mail de teste enviado com sucesso! Verifique a caixa de entrada.'
      );
    } catch (error) {
      await message.reply(
        'Houve um erro ao tentar enviar o e-mail de teste: ' +
          (error.message || error)
      );
    }
  }
};
