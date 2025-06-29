module.exports = {
  name: 'uptime',
  description: 'Mostra há quanto tempo o bot está online.',
  category: 'util',
  async execute(message, args, client) {
    let uptimeMs = 0;
    if (client && client.startTime) {
      uptimeMs = Date.now() - client.startTime;
    } else if (global.startTime) {
      uptimeMs = Date.now() - global.startTime;
    }
    const hours = Math.floor(uptimeMs / 3600000);
    const minutes = Math.floor((uptimeMs % 3600000) / 60000);
    const seconds = Math.floor((uptimeMs % 60000) / 1000);
    await message.reply(`⏱️ Uptime: ${hours}h ${minutes}m ${seconds}s`);
  }
};
