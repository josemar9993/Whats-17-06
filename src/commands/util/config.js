const config = require('../../config');
const { getAdminIds } = require('../../utils/admin');

module.exports = {
  name: 'config',
  description: 'Mostra as configurações atuais do bot (apenas admin).',
  category: 'admin',
  async execute(message, args, client) {
    const adminIds = getAdminIds();
    if (!adminIds.includes(message.from)) {
      await message.reply('Apenas administradores podem ver as configurações.');
      return;
    }
    const confStr = Object.entries(config)
      .map(([k, v]) => `- ${k}: ${JSON.stringify(v)}`)
      .join('\n');
    await message.reply(`⚙️ Configurações atuais:\n${confStr}`);
  }
};
