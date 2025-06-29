const logger = require('../../logger');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'ajuda',
  description: 'Lista todos os comandos disponíveis.',
  category: 'util',
  async execute(message) {
    try {
      const commandsPath = path.resolve(__dirname, '../../../COMMANDS.md');
      const md = await fs.promises.readFile(commandsPath, 'utf8');
      const regex = /^##\s+(!\S+)\n([^#]+)/gm;
      const comandos = [];
      let match;
      while ((match = regex.exec(md)) !== null) {
        const nome = match[1];
        const desc = match[2].split('\n')[0].trim();
        comandos.push(`${nome} - ${desc}`);
      }
      if (comandos.length === 0) {
        await message.reply('Nenhum comando encontrado em COMMANDS.md.');
        return;
      }
      const resposta = `*Comandos disponíveis:*\n${comandos.join('\n')}`;
      await message.reply(resposta);
    } catch (error) {
      logger.error('Erro ao carregar comandos:', error);
      await message.reply('Não foi possível carregar a lista de comandos.');
    }
  }
};
