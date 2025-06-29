const logger = require('../../logger');

module.exports = {
  name: 'todos',
  description: 'Menciona todos os participantes do grupo.',
  category: 'group',
  async execute(message, args, client) {
    try {
      let chat;
      try {
        chat = await message.getChat();
      } catch (err) {
        logger.warn(`Falha ao obter chat: ${err.message}`);
        return;
      }

      if (!chat.isGroup) return;

      // Garante que a lista de participantes esteja disponível
      if (!chat.participants || chat.participants.length === 0) {
        try {
          chat = await client.getChatById(chat.id._serialized);
        } catch (err) {
          logger.warn(
            `Não foi possível obter metadados do grupo ${chat.id._serialized}: ${err.message}`
          );
          return;
        }
      }

      if (!Array.isArray(chat.participants) || chat.participants.length === 0) {
        logger.warn(`Metadados do grupo ${chat.name} não contêm participantes.`);
        return;
      }

      let text = '';
      const mentions = [];
      for (const participant of chat.participants) {
        const contact = await client.getContactById(participant.id._serialized);
        mentions.push(contact);
        text += `@${participant.id.user} `;
      }
      await chat.sendMessage(text.trim(), { mentions });
      logger.info(`[AÇÃO GRUPO] Marquei todos no grupo "${chat.name}".`);
    } catch (err) {
      logger.error('Erro no comando todos:', err);
      try {
        await message.reply('Ocorreu um erro ao mencionar todos no grupo.');
      } catch (e) {
        logger.error('Falha ao enviar mensagem de erro no comando todos:', e);
      }
    }
  }
};
