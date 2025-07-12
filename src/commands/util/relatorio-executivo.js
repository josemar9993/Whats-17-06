// src/commands/util/relatorio-executivo.js

const { createDailySummary } = require('../../summarizer');
const { getMessagesByDate, getAllMessages } = require('../../database');
const { sendEmail } = require('../../emailer');
const config = require('../../config');

module.exports = {
  name: 'relatorio-executivo',
  aliases: ['rel-exec', 'dashboard', 'executive'],
  description: 'Gera relatório executivo detalhado para gestão empresarial',
  usage: '!relatorio-executivo [periodo] - Períodos: hoje, ontem, semana, mes',
  adminOnly: true,
  category: 'admin',

  async execute(message, args, client) { // <<< CORREÇÃO: Adicionado 'client'
    try {
      const periodo = args[0]?.toLowerCase() || 'hoje';
      let startDate, endDate, label;
      
      // --- LÓGICA DE DATA COM FUSO HORÁRIO DE SÃO PAULO (GMT-3) ---
      const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));

      // Zera a hora para o início do dia em São Paulo
      const startOfToday = new Date(now);
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
          endDate = now;
          label = `ESTA SEMANA (${startDate.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })} - ${endDate.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })})`;
          break;
          
        case 'mes':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = now;
          label = `ESTE MÊS (${startDate.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })} - ${endDate.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })})`;
          break;
          
        default:
          // Tenta interpretar como data DD/MM/YYYY
          const dateMatch = periodo.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
          if (dateMatch) {
            const [, day, month, year] = dateMatch;
            // As datas são criadas no fuso do servidor, mas representam o dia em SP
            startDate = new Date(year, month - 1, day, 0, 0, 0);
            endDate = new Date(year, month - 1, day, 23, 59, 59, 999);
            label = `${startDate.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })}`;
          } else {
            await message.reply(`❌ Período inválido. Use: hoje, ontem, semana, mes ou DD/MM/YYYY`);
            return;
          }
      }

      await message.reply('📊 Gerando relatório executivo... Por favor, aguarde.');

      // Busca mensagens do período especificado
      let messages;
      
      // Debug melhorado
      logger.debug(`[RELATORIO] Buscando mensagens para período: ${periodo}`);
      logger.debug(`[RELATORIO] Data início (Servidor): ${startDate.toISOString()}`);
      logger.debug(`[RELATORIO] Data fim (Servidor): ${endDate.toISOString()}`);
      
      const allMessages = await getAllMessages();
      messages = allMessages.filter(msg => {
        const msgDate = new Date(msg.timestamp * 1000);
        return msgDate >= startDate && msgDate <= endDate;
      });
      
      logger.debug(`[RELATORIO] Total de mensagens no período: ${messages.length}`);

      if (!messages || messages.length === 0) {
        await message.reply(`📊 Nenhuma atividade encontrada para o período: ${label}`);
        return;
      }

      const summary = await createDailySummary(messages, label);
      
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
        const emailContent = `
RELATÓRIO EXECUTIVO WHATSAPP
${label}

${summary.replace(/\*\*/g, '').replace(/\*/g, '')}

---
Relatório gerado automaticamente em ${new Date().toLocaleString('pt-BR')}
        `;
        
        // Verifica se o conteúdo do relatório não está vazio
        if (!summary || summary.includes('Nenhuma atividade registrada')) {
          console.log(`[RELATORIO] Relatório para o período "${periodo}" está vazio. Abortando envio de e-mail.`);
          await message.reply(`Não há dados para gerar o relatório executivo para o período "${periodo}". Nenhuma ação necessária.`);
          return;
        }

        // Enviar o relatório por e-mail
        const subject = `Relatório Executivo WhatsApp - ${periodo.toUpperCase()}`;
        await sendEmail({
          to: config.emailTo,
          subject: subject,
          html: summary, // Envia o HTML diretamente
        }, client); // <<< CORREÇÃO: Passa o client como segundo argumento

        await message.reply(`✅ Relatório executivo para "${periodo}" foi gerado e enviado por e-mail para ${config.emailTo}.`);
      } catch (emailError) {
        logger.error(`Erro ao enviar email: ${emailError.message}`);
      }

    } catch (error) {
      logger.error(`Erro no comando relatorio-executivo: ${error.message}`, { stack: error.stack });
      await message.reply(`❌ Erro ao gerar relatório: ${error.message}`);
    }
  }
};
