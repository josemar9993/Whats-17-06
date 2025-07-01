module.exports = {
  name: 'grupos',
  description: 'Lista todos os grupos em que o bot está.',
  category: 'util',
  async execute(message, args, client) {
    const chats = await client.getChats();
    const grupos = chats.filter((c) => c.isGroup);
    if (grupos.length === 0) {
      await message.reply('O bot não está em nenhum grupo.');
      return;
    }
    const lista = grupos.map((g) => `- ${g.name || g.id.user}`).join('\n');
    await message.reply(`👥 Grupos em que o bot está:\n${lista}`);
  }
};
