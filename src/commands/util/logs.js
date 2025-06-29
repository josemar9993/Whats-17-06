const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'logs',
  description: 'Envia os últimos logs do bot.',
  category: 'util',
  async execute(message) {
    const logDir = path.resolve(__dirname, '../../../logs');
    const files = fs.readdirSync(logDir).filter(f => f.endsWith('.log'));
    if (files.length === 0) {
      await message.reply('Nenhum log encontrado.');
      return;
    }
    const lastLog = files.sort().reverse()[0];
    const logPath = path.join(logDir, lastLog);
    const content = fs.readFileSync(logPath, 'utf8');
    const lastLines = content.split('\n').slice(-20).join('\n');
    await message.reply(`📝 Últimas linhas do log (${lastLog}):\n${lastLines}`);
  }
};
