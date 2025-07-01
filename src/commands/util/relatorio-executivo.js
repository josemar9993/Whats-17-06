// src/commands/util/relatorio-executivo.js

const { createDailySummary } = require('../../summarizer');
const Database = require('../../database');

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

      const db = new Database();
      const messages = await db.getMessagesByDateRange(
        Math.floor(startDate.getTime() / 1000),
        Math.floor(endDate.getTime() / 1000)
      );

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
