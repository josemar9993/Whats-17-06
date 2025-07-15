// src/commands/util/status-db.js
const logger = require('../../logger');
const { getMessageStats, getAllMessages } = require('../../database');

module.exports = {
  name: 'status-db',
  aliases: ['db-status', 'database-status'],
  description: 'Verifica o status do banco de dados e estatísticas de mensagens',
  usage: '!status-db',
  adminOnly: true,
  category: 'admin',

  async execute(message, args, client) {
    try {
      await message.reply('🔍 Verificando status do banco de dados...');
      
      // Get database statistics
      const stats = await getMessageStats();
      
      let statusMessage = `📊 **STATUS DO BANCO DE DADOS**\n\n`;
      
      if (stats.total === 0) {
        statusMessage += `❌ **BANCO VAZIO**\n`;
        statusMessage += `• Nenhuma mensagem armazenada\n`;
        statusMessage += `• Possíveis causas:\n`;
        statusMessage += `  - Bot nunca recebeu mensagens\n`;
        statusMessage += `  - Problemas na conexão com WhatsApp\n`;
        statusMessage += `  - Erro no armazenamento de mensagens\n\n`;
        statusMessage += `🔧 **Próximos passos:**\n`;
        statusMessage += `• Envie uma mensagem para o bot\n`;
        statusMessage += `• Verifique os logs do sistema\n`;
        statusMessage += `• Execute novamente este comando\n`;
      } else {
        statusMessage += `✅ **BANCO OPERACIONAL**\n\n`;
        statusMessage += `📈 **Estatísticas Gerais:**\n`;
        statusMessage += `• Total de mensagens: ${stats.total}\n`;
        statusMessage += `• Conversas únicas: ${stats.unique_chats}\n`;
        statusMessage += `• Mensagens enviadas: ${stats.sent_messages}\n`;
        statusMessage += `• Mensagens recebidas: ${stats.received_messages}\n\n`;
        
        // Convert timestamps to readable dates
        const oldestDate = stats.oldest_message ? 
          new Date(stats.oldest_message * 1000).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }) : 
          'N/A';
        const newestDate = stats.newest_message ? 
          new Date(stats.newest_message * 1000).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }) : 
          'N/A';
        
        statusMessage += `📅 **Período dos Dados:**\n`;
        statusMessage += `• Primeira mensagem: ${oldestDate}\n`;
        statusMessage += `• Última mensagem: ${newestDate}\n\n`;
        
        // Calculate coverage for today
        const now = new Date();
        const startOfToday = new Date(now);
        startOfToday.setHours(0, 0, 0, 0);
        
        const todayStartTimestamp = Math.floor(startOfToday.getTime() / 1000);
        const nowTimestamp = Math.floor(now.getTime() / 1000);
        
        const allMessages = await getAllMessages();
        const todayMessages = allMessages.filter(msg => 
          msg.timestamp >= todayStartTimestamp && msg.timestamp <= nowTimestamp
        );
        
        statusMessage += `🗓️ **Dados de Hoje:**\n`;
        statusMessage += `• Mensagens hoje: ${todayMessages.length}\n`;
        statusMessage += `• Cobertura: ${todayMessages.length > 0 ? 'Ativa' : 'Sem dados'}\n\n`;
        
        // Performance metrics
        const responseRate = stats.received_messages > 0 ? 
          Math.round((stats.sent_messages / stats.received_messages) * 100) : 0;
        
        statusMessage += `📊 **Métricas de Performance:**\n`;
        statusMessage += `• Taxa de resposta: ${responseRate}%\n`;
        statusMessage += `• Atividade: ${stats.total > 50 ? 'Alta' : stats.total > 10 ? 'Média' : 'Baixa'}\n`;
      }
      
      statusMessage += `\n🔧 **Sistema:** WhatsApp Bot Enterprise v2.0\n`;
      statusMessage += `⏰ **Verificado em:** ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}`;
      
      await message.reply(statusMessage);
      
      logger.info(`[STATUS-DB] Comando executado. Total de mensagens: ${stats.total}`);
      
    } catch (error) {
      logger.error(`[STATUS-DB] Erro no comando status-db: ${error.message}`, { stack: error.stack });
      await message.reply(`❌ Erro ao verificar status do banco de dados: ${error.message}`);
    }
  }
};