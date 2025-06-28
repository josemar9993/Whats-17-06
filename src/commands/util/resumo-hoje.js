const db = require('../../database');
const { createDailySummary } = require('../../summarizer');
const logger = require('../../logger');

module.exports = {
  name: 'resumo-hoje',
  description: 'Envia o resumo das conversas de um dia específico (ou de hoje) para o administrador.',
  async execute(msg, args) { // Adiciona args
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

    // Verifica se uma data foi fornecida, senão usa a data atual
    let dateStringForDb;
    let friendlyDate;

    if (args && args.length > 0) {
      const dateParts = args[0].split('/');
      if (dateParts.length === 3 && dateParts[0].length === 2 && dateParts[1].length === 2 && dateParts[2].length === 4) {
        // Formato DD/MM/YYYY -> YYYY-MM-DD para o banco de dados
        dateStringForDb = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
        friendlyDate = args[0];
      } else {
        await msg.reply('Formato de data inválido. Use DD/MM/YYYY.');
        return;
      }
    } else {
      // Usa o fuso horário de São Paulo para garantir que a data seja a correta
      const today = new Date(new Date().toLocaleString("en-US", {timeZone: "America/Sao_Paulo"}));
      dateStringForDb = today.toISOString().slice(0, 10);
      friendlyDate = today.toLocaleDateString('pt-BR');
    }

    try {
      await msg.reply(`Gerando o resumo do dia ${friendlyDate}, por favor aguarde...`);
      const chats = await db.getMessagesByDate(dateStringForDb);

      if (!chats || chats.length === 0) {
        const replyText = `Nenhuma conversa encontrada para o dia ${friendlyDate}.`;
        await msg.client.sendMessage(adminContactId, replyText);
        return;
      }

      const summaryText = await createDailySummary(chats);
      
      await msg.client.sendMessage(adminContactId, summaryText);
      logger.info(`Resumo do dia ${friendlyDate} enviado manualmente para ${adminContactId} a pedido de ${msg.from}.`);

    } catch (error) {
      logger.error(`Erro no comando !resumo-hoje: ${error.message}`);
      await msg.reply('Ocorreu um erro ao gerar ou enviar o resumo.');
    }
  },
};
