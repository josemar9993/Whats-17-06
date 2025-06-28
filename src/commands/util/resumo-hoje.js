const db = require('../../database');
const { generateSummary } = require('../../summarizer');
const logger = require('../../logger');

module.exports = {
  name: 'resumo-hoje',
  description: 'Envia o resumo das conversas de hoje para o administrador.',
  async execute(msg) {
    const today = new Date().toISOString().slice(0, 10);
    const adminContactId = process.env.ADMIN_WHATSAPP_ID;
    const senderId = msg.from;

    // Apenas o administrador pode executar este comando
    if (senderId !== adminContactId) {
      await msg.reply('Você não tem permissão para usar este comando.');
      return;
    }

    if (!adminContactId) {
      logger.warn('Comando !resumo-hoje: ADMIN_WHATSAPP_ID não definido.');
      await msg.reply('O ID do administrador não está configurado no servidor. Não posso enviar o resumo.');
      return;
    }

    try {
      await msg.reply('Gerando o resumo de hoje, por favor aguarde...');
      const chats = await db.getMessagesByDate(today);

      if (!chats || chats.length === 0) {
        const replyText = `Nenhuma conversa encontrada para hoje (${today}).`;
        await msg.client.sendMessage(adminContactId, replyText);
        return;
      }

      const summaryText = await generateSummary(chats);
      
      await msg.client.sendMessage(adminContactId, `*Resumo Diário - ${today}*\n\n${summaryText}`);
      logger.info(`Resumo de hoje enviado manualmente para ${adminContactId} a pedido de ${msg.from}.`);

    } catch (error) {
      logger.error(`Erro no comando !resumo-hoje: ${error.message}`);
      await msg.reply('Ocorreu um erro ao gerar ou enviar o resumo.');
    }
  },
};
