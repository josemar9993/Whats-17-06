const db = require('../../database');
const logger = require('../../logger');
const { isAdmin } = require('../../utils/admin');
const validator = require('../../validators/commandValidator');
const retryManager = require('../../utils/retryManager');

module.exports = {
  name: 'buscar',
  description: 'Busca mensagens no banco contendo o termo informado.',
  async execute(message, args) {
    if (!isAdmin(message.from)) {
      return;
    }

    // Validar argumentos
    const validation = validator.validateSearchArgs(args);
    if (validation.error) {
      await message.reply(validation.error.message);
      return;
    }

    const term = validation.value.term;
    const sanitizedTerm = validator.sanitizeInput(term);

    try {
      // Usar retry para operação de banco
      const results = await retryManager.withDatabaseRetry(async () => {
        return await db.searchMessages(sanitizedTerm);
      }, 'search-messages');

      if (!results.length) {
        await message.reply(
          '🔍 Nenhuma mensagem encontrada para: ' + sanitizedTerm
        );
        return;
      }

      // Limitar resultados para evitar mensagens muito grandes
      const limitedResults = results.slice(0, 20);
      const lines = limitedResults
        .map(
          (m, index) =>
            `${index + 1}. *${m.senderName}*: ${m.body.substring(0, 80)}${m.body.length > 80 ? '...' : ''}`
        )
        .join('\n');

      const resultText = `🔍 *Resultados para "${sanitizedTerm}":*\n\n${lines}`;

      if (results.length > 20) {
        resultText += `\n\n_Mostrando 20 de ${results.length} resultados._`;
      }

      await message.reply(resultText);

      logger.info(
        `Busca realizada por ${message.from}: "${sanitizedTerm}" (${results.length} resultados)`
      );
    } catch (err) {
      logger.error('Erro no comando !buscar:', err);
      await message.reply('❌ Falha ao buscar mensagens. Tente novamente.');
    }
  }
};
