const logger = require('../../logger');

module.exports = {
  name: 'todos',
  description: 'Menciona todos os participantes do grupo.',
  category: 'group',
  async execute(message, args, client) {
    const chat = await message.getChat();
    if (!chat.isGroup) return;
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
