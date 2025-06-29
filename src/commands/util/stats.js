const db = require('../../database');

module.exports = {
  name: 'stats',
  description: 'Mostra estatísticas rápidas do bot.',
  category: 'util',
  async execute(message) {
    // Busca estatísticas básicas
    let totalMsgs = 0;
    let totalChats = 0;
    let totalGrupos = 0;
    let totalUsuarios = 0;
    try {
      const allMsgs = await db.getAllMessages();
      totalMsgs = allMsgs.length;
      const chatIds = new Set(allMsgs.map(m => m.chatId));
      totalChats = chatIds.size;
      totalGrupos = Array.from(chatIds).filter(id => id.endsWith('@g.us')).length;
      totalUsuarios = Array.from(new Set(allMsgs.map(m => m.senderName || m.contactName || m.from))).length;
    } catch (e) {
      await message.reply('Erro ao buscar estatísticas: ' + e.message);
      return;
    }
    await message.reply(
      `📊 Estatísticas rápidas:\n` +
      `Mensagens: ${totalMsgs}\n` +
      `Conversas: ${totalChats}\n` +
      `Grupos: ${totalGrupos}\n` +
      `Usuários únicos: ${totalUsuarios}`
    );
  }
};
