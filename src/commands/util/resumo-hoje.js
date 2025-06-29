const db = require('../../database');
const { createDailySummary } = require('../../summarizer');
const logger = require('../../logger');

function parseDate(str) {
  const parts = str.split('/');
  if (parts.length !== 3) return null;
  const [d, m, y] = parts;
  if (d.length !== 2 || m.length !== 2 || y.length !== 4) return null;
  const iso = `${y}-${m}-${d}`;
  return new Date(`${iso}T00:00:00`);
}

module.exports = {
  name: 'resumo-hoje',
  description: 'Envia o resumo das conversas de um dia ou intervalo para o administrador.',
  async execute(msg, args) {
    const { getAdminIds, isAdmin } = require('../../utils/admin');
    const adminIds = getAdminIds();
    const senderId = msg.from;

    if (adminIds.length === 0) {
      logger.warn('Comando !resumo-hoje: nenhum administrador definido.');
      return;
    }

    if (!isAdmin(senderId)) {
      await msg.reply('Você não tem permissão para usar este comando.');
      return;
    }

    const adminContactId = senderId;

    let startDate;
    let endDate;

    if (args && args.length >= 2) {
      startDate = parseDate(args[0]);
      endDate = parseDate(args[1]);
      if (!startDate || !endDate) {
        await msg.reply('Formato de data inválido. Use DD/MM/YYYY.');
        return;
      }
    } else if (args && args.length === 1) {
      startDate = parseDate(args[0]);
      if (!startDate) {
        await msg.reply('Formato de data inválido. Use DD/MM/YYYY.');
        return;
      }
      endDate = new Date(startDate);
    } else {
      const today = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
      startDate = today;
      endDate = new Date(today);
    }

    if (startDate > endDate) {
      const temp = startDate;
      startDate = endDate;
      endDate = temp;
    }

    const friendlyStart = startDate.toLocaleDateString('pt-BR');
    const friendlyEnd = endDate.toLocaleDateString('pt-BR');
    const friendlyRange = friendlyStart === friendlyEnd ? friendlyStart : `${friendlyStart} até ${friendlyEnd}`;

    try {
      await msg.client.sendMessage(adminContactId, `Gerando o resumo de ${friendlyRange}, por favor aguarde...`);

      let allMessages = [];
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const iso = d.toISOString().slice(0, 10);
        const dayMsgs = await db.getMessagesByDate(iso);
        allMessages = allMessages.concat(dayMsgs);
      }

      if (!allMessages || allMessages.length === 0) {
        await msg.client.sendMessage(adminContactId, `Nenhuma conversa encontrada para o período ${friendlyRange}.`);
        return;
      }

      const summaryText = await createDailySummary(allMessages);

      await msg.client.sendMessage(adminContactId, summaryText);
      await msg.client.sendMessage(adminContactId, '✅ Resumo enviado.');
      logger.info(`Resumo do período ${friendlyRange} enviado para ${adminContactId} a pedido de ${msg.from}.`);
    } catch (error) {
      logger.error(`Erro no comando !resumo-hoje: ${error.message}`);
      await msg.reply('Ocorreu um erro ao gerar ou enviar o resumo.');
    }
  },
};
