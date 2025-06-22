module.exports = {
  name: 'ping',
  description: 'Verifica se o bot está online respondendo com pong.',
  category: 'util',
  async execute(message, args, client) {
    await message.reply('pong');
  }
};
