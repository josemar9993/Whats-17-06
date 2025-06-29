module.exports = {
  name: 'reiniciar',
  description: 'Reinicia o bot.',
  category: 'util',
  async execute(message) {
    await message.reply('♻️ Reiniciando o bot...');
    process.exit(0);
  }
};
