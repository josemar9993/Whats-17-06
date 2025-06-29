const db = require('../../database');
const cache = require('../../cache/manager');
const retryManager = require('../../utils/retryManager');
const logger = require('../../logger');

module.exports = {
  name: 'stats',
  description: 'Mostra estatísticas rápidas do bot.',
  category: 'util',
  async execute(message) {
    try {
      const startTime = Date.now();
      
      // Tentar buscar do cache primeiro
      const stats = await cache.getOrSet('bot-stats', async () => {
        logger.debug('Cache miss para stats, calculando...');
        return await this.calculateStats();
      }, 300); // Cache por 5 minutos
      
      const duration = Date.now() - startTime;
      logger.info(`Estatísticas geradas em ${duration}ms (cache: ${duration < 50 ? 'HIT' : 'MISS'})`);
      
      await message.reply(stats);
      
    } catch (error) {
      logger.error('Erro ao buscar estatísticas:', error);
      await message.reply('❌ Erro ao buscar estatísticas. Tente novamente.');
    }
  },
  
  async calculateStats() {
    return await retryManager.withDatabaseRetry(async () => {
      let totalMsgs = 0;
      let totalChats = 0;
      let totalGrupos = 0;
      let totalUsuarios = 0;
      
      const allMsgs = await db.getAllMessages();
      totalMsgs = allMsgs.length;
      
      const chatIds = new Set(allMsgs.map(m => m.chatId));
      totalChats = chatIds.size;
      totalGrupos = Array.from(chatIds).filter(id => id.endsWith('@g.us')).length;
      totalUsuarios = Array.from(new Set(allMsgs.map(m => m.senderName || m.contactName || m.from))).length;
      
      // Estatísticas adicionais
      const today = new Date().toISOString().slice(0, 10);
      const todayMsgs = allMsgs.filter(m => m.isoTimestamp?.startsWith(today));
      
      const uptimeMs = Date.now() - (global.botStartTime || Date.now());
      const uptime = this.formatUptime(uptimeMs);
      
      return `📊 *Estatísticas do Bot*
      
💬 *Mensagens:* ${totalMsgs.toLocaleString()}
📝 *Hoje:* ${todayMsgs.length.toLocaleString()}
💭 *Conversas:* ${totalChats.toLocaleString()}
👥 *Grupos:* ${totalGrupos.toLocaleString()}
👤 *Usuários:* ${totalUsuarios.toLocaleString()}
⏱️ *Uptime:* ${uptime}
🔄 *Última atualização:* ${new Date().toLocaleTimeString()}`;
    }, 'stats-calculation');
  },
  
  formatUptime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }
};
