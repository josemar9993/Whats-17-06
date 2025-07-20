// src/commands/util/relatorio-executivo.js

const logger = require('../../logger');
const { createDailySummary } = require('../../summarizer');
const { getAllMessages, getMessagesByDateRange, getMessageStats } = require('../../database');
const { sendEmail } = require('../../emailer');
const config = require('../../config');

module.exports = {
  name: 'relatorio-executivo',
  aliases: ['rel-exec', 'dashboard', 'executive'],
  description: 'Gera relatório executivo detalhado para gestão empresarial',
  usage: '!relatorio-executivo [periodo] - Períodos: hoje, ontem, semana, mes',
  adminOnly: true,
  category: 'admin',

  async execute(message, args, client) {
    try {
      const periodo = args[0]?.toLowerCase() || 'hoje';
      let startDate, endDate, label;
      
      // --- LÓGICA DE DATA COM FUSO HORÁRIO DE SÃO PAULO (GMT-3) ---
      // Use moment.js or proper timezone handling to ensure consistency
      const now = new Date();
      
      // Create São Paulo timezone date
      const spDate = new Date(now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
      
      // Get start of today in São Paulo timezone
      const startOfToday = new Date(spDate);
      startOfToday.setHours(0, 0, 0, 0);

      switch (periodo) {
        case 'hoje':
          startDate = new Date(startOfToday);
          endDate = new Date(startOfToday);
          endDate.setHours(23, 59, 59, 999);
          label = `HOJE (${startDate.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })})`;
          break;
          
        case 'ontem':
          const yesterday = new Date(startOfToday);
          yesterday.setDate(yesterday.getDate() - 1);
          startDate = new Date(yesterday);
          endDate = new Date(yesterday);
          endDate.setHours(23, 59, 59, 999);
          label = `ONTEM (${startDate.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })})`;
          break;
          
        case 'semana':
          const weekStart = new Date(startOfToday);
          weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Domingo
          startDate = weekStart;
          endDate = new Date(spDate);
          endDate.setHours(23, 59, 59, 999);
          label = `ESTA SEMANA (${startDate.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })} - ${endDate.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })})`;
          break;
          
        case 'mes':
          startDate = new Date(spDate.getFullYear(), spDate.getMonth(), 1);
          endDate = new Date(spDate);
          endDate.setHours(23, 59, 59, 999);
          label = `ESTE MÊS (${startDate.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })} - ${endDate.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })})`;
          break;
          
        default:
          // Tenta interpretar como data DD/MM/YYYY
          const dateMatch = periodo.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
          if (dateMatch) {
            const [, day, month, year] = dateMatch;
            startDate = new Date(year, month - 1, day, 0, 0, 0);
            endDate = new Date(year, month - 1, day, 23, 59, 59, 999);
            label = `${startDate.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })}`;
          } else {
            await message.reply(`❌ Período inválido. Use: hoje, ontem, semana, mes ou DD/MM/YYYY`);
            return;
          }
      }

      await message.reply('📊 Gerando relatório executivo... Por favor, aguarde.');

      // First check database statistics
      const stats = await getMessageStats();
      logger.info(`[RELATORIO] Estatísticas do banco: ${stats.total} mensagens, ${stats.unique_chats} chats`);
      
      if (stats.total === 0) {
        await message.reply(`📊 *BANCO DE DADOS VAZIO*\n\n❌ Não há mensagens armazenadas no banco de dados.\n\n🔧 Isso pode indicar que:\n• O bot não está recebendo mensagens\n• Há problemas na conexão com o banco\n• O sistema ainda não foi utilizado\n\n📋 Execute \`!ajuda\` para mais informações.`);
        return;
      }

      // Debug melhorado
      logger.info(`[RELATORIO] Buscando mensagens para período: ${periodo}`);
      logger.info(`[RELATORIO] Data início: ${startDate.toISOString()}`);
      logger.info(`[RELATORIO] Data fim: ${endDate.toISOString()}`);
      logger.info(`[RELATORIO] Timezone: America/Sao_Paulo`);
      
      // Use the new date range function for more accurate filtering
      const messages = await getMessagesByDateRange(startDate, endDate);
      
      logger.info(`[RELATORIO] Total de mensagens encontradas: ${messages.length}`);

      // If no messages found, try alternative approach
      if (messages.length === 0) {
        // Try getting all messages and show debug info
        const allMessages = await getAllMessages();
        logger.warn(`[RELATORIO] Nenhuma mensagem encontrada para o período. Total no banco: ${allMessages.length}`);
        
        if (allMessages.length > 0) {
          const oldestMsg = allMessages[0];
          const newestMsg = allMessages[allMessages.length - 1];
          const oldestDate = new Date(oldestMsg.timestamp * 1000);
          const newestDate = new Date(newestMsg.timestamp * 1000);
          
          await message.reply(`📊 *NENHUMA MENSAGEM ENCONTRADA PARA O PERÍODO*\n\n📅 **Período solicitado:** ${label}\n\n📋 **Dados disponíveis:**\n• Total de mensagens: ${allMessages.length}\n• Mensagem mais antiga: ${oldestDate.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}\n• Mensagem mais recente: ${newestDate.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}\n\n💡 **Dica:** Use outros períodos como \`ontem\`, \`semana\` ou \`mes\``);
        } else {
          await message.reply(`📊 Nenhuma atividade encontrada para o período: ${label}`);
        }
        return;
      }

      const summary = await createDailySummary(messages, label);
      
      // Check if summary generation was successful
      if (!summary || summary.trim() === '' || summary.includes('❌ Nenhuma atividade registrada')) {
        await message.reply(`📊 Erro ao gerar relatório para o período: ${label}\n\nEncontradas ${messages.length} mensagens, mas não foi possível processar os dados.`);
        return;
      }
      
      // Divide o relatório em partes se for muito longo
      const maxLength = 4000;
      if (summary.length <= maxLength) {
        await message.reply(summary);
      } else {
        const parts = [];
        let currentPart = '';
        const lines = summary.split('\n');
        
        for (const line of lines) {
          if ((currentPart + line + '\n').length > maxLength) {
            if (currentPart) parts.push(currentPart.trim());
            currentPart = line + '\n';
          } else {
            currentPart += line + '\n';
          }
        }
        
        if (currentPart) parts.push(currentPart.trim());
        
        for (let i = 0; i < parts.length; i++) {
          const partHeader = i === 0 ? '' : `\n📊 **RELATÓRIO EXECUTIVO - PARTE ${i + 1}/${parts.length}**\n\n`;
          await message.reply(partHeader + parts[i]);
          
          // Pequeno delay entre partes
          if (i < parts.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }

      // Envia por email se configurado
      try {
        if (config.emailTo && config.emailUser && config.emailPass) {
          const emailContent = `
RELATÓRIO EXECUTIVO WHATSAPP
${label}

${summary.replace(/\*\*/g, '').replace(/\*/g, '').replace(/┏[━┓┃┗┛═]+/g, '').replace(/[📊💬📨📥📈⏱️🕐🚨⚠️🐢📥🎯📊🔄⚡🎯🏆🤖📱]/g, '')}

---
Relatório gerado automaticamente em ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}
          `;
          
          const subject = `Relatório Executivo WhatsApp - ${label}`;
          await sendEmail({
            to: config.emailTo,
            subject: subject,
            html: emailContent.replace(/\n/g, '<br>'),
          }, client);

          await message.reply(`✅ Relatório executivo enviado por e-mail para ${config.emailTo}.`);
        } else {
          logger.warn('[RELATORIO] Configuração de e-mail incompleta. Relatório não enviado por e-mail.');
        }
      } catch (emailError) {
        logger.error(`[RELATORIO] Erro ao enviar email: ${emailError.message}`);
        await message.reply(`⚠️ Relatório gerado com sucesso, mas não foi possível enviar por e-mail.`);
      }

    } catch (error) {
      logger.error(`[RELATORIO] Erro no comando relatorio-executivo: ${error.message}`, { stack: error.stack });
      await message.reply(`❌ Erro ao gerar relatório: ${error.message}\n\n🔧 Verifique os logs para mais detalhes.`);
    }
  }
};
