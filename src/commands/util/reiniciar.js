const { getAdminIds } = require('../../utils/admin');

module.exports = {
  name: 'reiniciar',
  description: 'Reinicia o bot (apenas admin).',
  category: 'admin',
  async execute(message, args, client) {
    const adminIds = getAdminIds();
    if (!adminIds.includes(message.from)) {
      await message.reply('Apenas administradores podem reiniciar o bot.');
      return;
    }
    await message.reply('♻️ Reiniciando o bot...');
    process.exit(0);
  }
};
