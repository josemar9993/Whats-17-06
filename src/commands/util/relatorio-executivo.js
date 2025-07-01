// src/commands/util/relatorio-executivo.js

const { createDailySummary } = require('../../summarizer');
const { getMessagesByDate, getAllMessages } = require('../../database');

module.exports = {
  name: 'relatorio-executivo',
  aliases: ['rel-exec', 'dashboard', 'executive'],
  description: 'Gera relatório executivo detalhado para gestão empresarial',
  usage: '!relatorio-executivo [periodo] - Períodos: hoje, ontem, semana, mes',
  adminOnly: true,
  category: 'admin',

  async execute(message, args) {
    try {
      const periodo = args[0]?.toLowerCase() || 'hoje';
      let startDate, endDate, label;
      const now = new Date();

      switch (periodo) {
        case 'hoje':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
          label = `HOJE (${startDate.toLocaleDateString('pt-BR')})`;
          break;
          
        case 'ontem':
          const yesterday = new Date(now);
          yesterday.setDate(yesterday.getDate() - 1);
          startDate = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
          endDate = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59);
          label = `ONTEM (${startDate.toLocaleDateString('pt-BR')})`;
          break;
          
        case 'semana':
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - now.getDay());
          weekStart.setHours(0, 0, 0, 0);
          startDate = weekStart;
          endDate = now;
          label = `ESTA SEMANA (${startDate.toLocaleDateString('pt-BR')} - ${endDate.toLocaleDateString('pt-BR')})`;
          break;
          
        case 'mes':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = now;
          label = `ESTE MÊS (${startDate.toLocaleDateString('pt-BR')} - ${endDate.toLocaleDateString('pt-BR')})`;
          break;
          
        default:
          // Tenta interpretar como data DD/MM/YYYY
          const dateMatch = periodo.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
          if (dateMatch) {
            const [, day, month, year] = dateMatch;
            startDate = new Date(year, month - 1, day);
            endDate = new Date(year, month - 1, day, 23, 59, 59);
            label = `${startDate.toLocaleDateString('pt-BR')}`;
          } else {
            await message.reply(`❌ Período inválido. Use: hoje, ontem, semana, mes ou DD/MM/YYYY`);
            return;
          }
      }

      await message.reply('📊 Gerando relatório executivo... Por favor, aguarde.');

      // Busca mensagens do período especificado
      let messages;
      if (periodo === 'hoje') {
        const today = new Date().toISOString().split('T')[0];
        messages = await getMessagesByDate(today);
        
        // Debug: Se não encontrar mensagens de hoje, busca últimas mensagens
        if (!messages || messages.length === 0) {
          console.log(`[DEBUG] Nenhuma mensagem encontrada para hoje (${today}), buscando todas as mensagens...`);
          const allMessages = await getAllMessages();
          
          // Filtra últimas 24 horas
          const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
          messages = allMessages.filter(msg => {
            const msgDate = new Date(msg.timestamp * 1000);
            return msgDate >= last24Hours;
          });
          
          console.log(`[DEBUG] Encontradas ${messages.length} mensagens nas últimas 24 horas`);
        }
      } else {
        messages = await getAllMessages();
        
        // Filtra mensagens do período especificado
        if (periodo !== 'semana' && periodo !== 'mes') {
          messages = messages.filter(msg => {
            const msgDate = new Date(msg.timestamp * 1000);
            return msgDate >= startDate && msgDate <= endDate;
          });
        }
      }

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
        const emailer = require('../../emailer');
        const emailContent = `
RELATÓRIO EXECUTIVO WHATSAPP
${label}

${summary.replace(/\*\*/g, '').replace(/\*/g, '')}

---
Relatório gerado automaticamente em ${new Date().toLocaleString('pt-BR')}
        `;
        
        await emailer.sendEmail(
          `📊 Relatório Executivo WhatsApp - ${label}`,
          emailContent
        );
        
        await message.reply('✅ Relatório também enviado por email!');
      } catch (emailError) {
        console.log('Erro ao enviar email:', emailError.message);
      }

    } catch (error) {
      console.error('Erro no comando relatorio-executivo:', error);
      await message.reply(`❌ Erro ao gerar relatório: ${error.message}`);
    }
  }
};
