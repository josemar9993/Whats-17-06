const pkg = require('../../../package.json');

module.exports = {
  name: 'versao',
  description: 'Mostra a versão do bot e principais dependências.',
  category: 'util',
  async execute(message) {
    const deps = Object.entries(pkg.dependencies || {})
      .map(([dep, ver]) => `- ${dep}: ${ver}`)
      .join('\n');
    await message.reply(
      `🤖 Versão do bot: *${pkg.version}*\n` +
      `Principais dependências:\n${deps}`
    );
  }
};
