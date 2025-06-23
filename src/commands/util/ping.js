module.exports = {
  name: 'ping',
  description: 'Verifica se o bot está online respondendo com pong.',
  category: 'util',
  // Apenas a mensagem é utilizada, parâmetros adicionais são ignorados
  async execute(message) {
    await message.reply('pong');
  }
};
