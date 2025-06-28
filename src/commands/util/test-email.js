// src/commands/util/test-email.js
const { sendEmail } = require('../../emailer');
const logger = require('../../logger');

module.exports = {
    name: 'test-email',
    description: 'Envia um e-mail de teste para validar a configuração.',
    async execute(message, args) {
        try {
            logger.info('Executando comando !test-email...');
            message.reply('Enviando e-mail de teste...');

            await sendEmail({
                to: process.env.EMAIL_TO, // Certifique-se que esta variável está no .env
                subject: 'Teste de Envio de E-mail via Bot WhatsApp',
                text: 'Este é um e-mail de teste enviado diretamente pelo comando !test-email do bot.',
                html: '<p>Este é um e-mail de teste enviado diretamente pelo comando <b>!test-email</b> do bot.</p>'
            });

            message.reply('E-mail de teste enviado com sucesso! Verifique a caixa de entrada.');
            logger.info('E-mail de teste enviado com sucesso.');
        } catch (error) {
            logger.error('Erro no comando !test-email:', error);
            message.reply('Houve um erro ao tentar enviar o e-mail de teste. Verifique os logs.');
        }
    },
};
