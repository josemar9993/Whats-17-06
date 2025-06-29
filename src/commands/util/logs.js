const fs = require('fs');
const path = require('path');
const { getAdminIds } = require('../../utils/admin');

module.exports = {
  name: 'logs',
  description: 'Envia os últimos logs do bot (apenas admin).',
  category: 'admin',
  async execute(message, args, client) {
    const adminIds = getAdminIds();
    if (!adminIds.includes(message.from)) {
      await message.reply('Apenas administradores podem solicitar logs.');
      return;
    }
    const logDir = path.resolve(__dirname, '../../logs');
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
