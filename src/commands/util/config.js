const config = require('../../config');

module.exports = {
  name: 'config',
  description: 'Mostra as configurações atuais do bot.',
  category: 'util',
  async execute(message) {
    const confStr = Object.entries(config)
      .map(([k, v]) => `- ${k}: ${JSON.stringify(v)}`)
      .join('\n');
    await message.reply(`⚙️ Configurações atuais:\n${confStr}`);
  }
};
