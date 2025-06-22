const emailer = require('../../emailer');
const logger = require('../../logger');

module.exports = {
  name: 'pendencias',
  description: 'Envia um resumo de pendências apenas para o administrador.',
  category: 'util',
  async execute(message, args, client) {
    if (message.from !== process.env.WHATSAPP_ADMIN_NUMBER) {
      return;
    }
    logger.info('Comando !pendencias recebido. Gerando e enviando resumo...');
    const todayStr = new Date().toISOString().slice(0, 10);
    const chatsDoDia = emailer.loadChatsByDate(todayStr);
    const { generatePendingSummary } = require('../../summarizer');
    const resumoPendencias = generatePendingSummary(chatsDoDia);
    await client.sendMessage(message.from, resumoPendencias);
  }
};
