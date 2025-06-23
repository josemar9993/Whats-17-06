const logger = require('../../logger');

module.exports = {
  name: 'todos',
  description: 'Menciona todos os participantes do grupo.',
  category: 'group',
  async execute(message, args, client) {
    let chat = await message.getChat();
    if (!chat.isGroup) return;

    // Garante que a lista de participantes esteja disponível
    if (!chat.participants) {
      try {
        chat = await client.getChatById(chat.id._serialized);
      } catch (err) {
        logger.warn(
          `Não foi possível obter metadados do grupo ${chat.id._serialized}: ${err.message}`
        );
        return;
      }
    }

    if (!chat.participants) {
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
    await chat.sendMessage(text, { mentions });
    logger.info(`[AÇÃO GRUPO] Marquei todos no grupo "${chat.name}".`);
  }
};
