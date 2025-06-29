const db = require('../../database');
const logger = require('../../logger');
const { isAdmin } = require('../../utils/admin');

module.exports = {
  name: 'buscar',
  description: 'Busca mensagens no banco contendo o termo informado.',
  async execute(message, args) {
    if (!isAdmin(message.from)) {
      return;
    }

    const term = args.join(' ');
    if (!term) {
      await message.reply('Uso: !buscar <termo>');
      return;
    }

    try {
      const results = await db.searchMessages(term);
      if (!results.length) {
        await message.reply('Nenhuma mensagem encontrada.');
        return;
      }
      const lines = results.map((m) => `• ${m.senderName}: ${m.body.substring(0, 50)}`).join('\n');
      await message.reply(`Resultados:\n${lines}`);
    } catch (err) {
      logger.error('Erro no comando !buscar:', err);
      await message.reply('Falha ao buscar mensagens.');
    }
  }
};
