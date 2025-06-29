module.exports = {
  name: 'ping',
  description: 'Verifica se o bot está online respondendo com status e uptime.',
  category: 'util',
  async execute(message, args, client) {
    // Calcula uptime
    let uptimeStr = '';
    if (client && client.startTime) {
      const uptimeMs = Date.now() - client.startTime;
      const hours = Math.floor(uptimeMs / 3600000);
      const minutes = Math.floor((uptimeMs % 3600000) / 60000);
      const seconds = Math.floor((uptimeMs % 60000) / 1000);
      uptimeStr = `${hours}h ${minutes}m ${seconds}s`;
    } else if (global.startTime) {
      const uptimeMs = Date.now() - global.startTime;
      const hours = Math.floor(uptimeMs / 3600000);
      const minutes = Math.floor((uptimeMs % 3600000) / 60000);
      const seconds = Math.floor((uptimeMs % 60000) / 1000);
      uptimeStr = `${hours}h ${minutes}m ${seconds}s`;
    } else {
      uptimeStr = 'indisponível';
    }
    await message.reply(`on-line\nUptime: ${uptimeStr}`);
  }
};
