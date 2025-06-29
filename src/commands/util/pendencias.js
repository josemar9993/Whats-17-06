const db = require('../../database');
const { generatePendingSummary } = require('../../summarizer');
const logger = require('../../logger');

module.exports = {
  name: 'pendencias',
  description: 'Envia um resumo de pendências do dia para o administrador.',
  category: 'util',
  async execute(message, args, client) {
    // A verificação de admin foi removida para permitir a execução pela própria conta
    // if (!isAdmin(message.from)) {
    //   // Ignora silenciosamente se não for o administrador
    //   return;
    // }

    logger.info('Comando !pendencias recebido. Gerando e enviando resumo...');

    try {
      const todayStr = new Date().toISOString().slice(0, 10); // Formato 'YYYY-MM-DD'
      const messages = await db.getMessagesByDate(todayStr);

      if (!messages || messages.length === 0) {
        await client.sendMessage(
          message.from,
          'Nenhuma mensagem registrada hoje para gerar resumo de pendências.'
        );
        return;
      }

      // Assumindo que generatePendingSummary pode lidar com um array de mensagens
      const resumoPendencias = generatePendingSummary(messages);

      if (!resumoPendencias || resumoPendencias.trim() === '') {
        await client.sendMessage(
          message.from,
          'Nenhuma pendência encontrada nas conversas de hoje.'
        );
        return;
      }

      // Envia o resumo como mensagem para o administrador
      await client.sendMessage(
        message.from,
        `📋 *Resumo de Pendências de Hoje:*\n${resumoPendencias}`
      );
      await client.sendMessage(message.from, '✅ Resumo de pendências enviado.');
    } catch (error) {
      logger.error('Erro ao executar o comando !pendencias:', error);
      await client.sendMessage(
        message.from,
        'Ocorreu um erro ao gerar o resumo de pendências. Verifique os logs.'
      );
    }
  }
};
