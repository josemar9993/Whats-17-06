// src/commands/util/alertas.js

const { getMessagesByDate } = require('../../database');

module.exports = {
  name: 'alertas',
  aliases: ['alerts', 'criticos'],
  description: 'Mostra alertas críticos e contatos que precisam de atenção imediata',
  usage: '!alertas [limite] - Mostra alertas críticos (padrão: 10)',
  adminOnly: true,
  category: 'admin',

  async execute(message, args) {
    try {
      const limite = parseInt(args[0]) || 10;
      
      await message.reply('🚨 Analisando situação crítica... Aguarde.');

      // Busca mensagens de hoje
      const today = new Date().toISOString().split('T')[0];
      const mensagensHoje = await getMessagesByDate(today);

      // Agrupa por chat
      const chats = {};
      mensagensHoje.forEach(msg => {
        if (!chats[msg.chatId]) {
          chats[msg.chatId] = {
            chatId: msg.chatId,
            nome: msg.senderName || msg.contactName || msg.chatId.replace(/@c\.us|@g\.us/, ''),
            mensagens: []
          };
        }
        chats[msg.chatId].mensagens.push(msg);
      });

      // Análise de criticidade
      const alertasCriticos = [];
      const agora_ms = agora.getTime();

      Object.values(chats).forEach(chat => {
        let enviadas = 0;
        let recebidas = 0;
        let ultimaMensagem = null;
        let tempoSemResposta = 0;
        let temaCritico = false;
        let palavrasCriticas = [];

        // Ordena mensagens por timestamp
        chat.mensagens.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

        chat.mensagens.forEach(msg => {
          if (msg.fromMe) {
            enviadas++;
          } else {
            recebidas++;
            ultimaMensagem = msg;
          }

          // Verifica palavras críticas
          const texto = (msg.body || '').toLowerCase();
          const criticWords = [
            'urgente', 'crítico', 'emergência', 'parado', 'down', 'não funciona',
            'erro grave', 'sistema fora', 'perdemos', 'problema sério', 'falha crítica',
            'cliente reclamando', 'perdendo dinheiro', 'vazamento', 'hack', 'invadido'
          ];

          criticWords.forEach(word => {
            if (texto.includes(word)) {
              temaCritico = true;
              if (!palavrasCriticas.includes(word)) {
                palavrasCriticas.push(word);
              }
            }
          });
        });

        // Calcula tempo sem resposta
        if (ultimaMensagem && ultimaMensagem.timestamp) {
          tempoSemResposta = Math.floor((agora_ms - (ultimaMensagem.timestamp * 1000)) / (1000 * 60)); // em minutos
        }

        // Critérios de alerta
        let nivelCriticidade = 0;
        let razoes = [];

        // Mensagens não respondidas
        if (recebidas > 0 && enviadas === 0) {
          nivelCriticidade += recebidas > 3 ? 3 : 2;
          razoes.push(`${recebidas} mensagens sem resposta`);
        }

        // Tempo sem resposta
        if (tempoSemResposta > 180) { // 3+ horas
          nivelCriticidade += 3;
          razoes.push(`${Math.floor(tempoSemResposta / 60)}h sem resposta`);
        } else if (tempoSemResposta > 60) { // 1+ hora
          nivelCriticidade += 2;
          razoes.push(`${tempoSemResposta}min sem resposta`);
        }

        // Palavras críticas
        if (temaCritico) {
          nivelCriticidade += 4;
          razoes.push(`Contém: ${palavrasCriticas.join(', ')}`);
        }

        // Volume alto de mensagens
        if (recebidas > 10) {
          nivelCriticidade += 2;
          razoes.push(`Volume alto: ${recebidas} mensagens`);
        }

        // Adiciona à lista se for crítico
        if (nivelCriticidade >= 3) {
          alertasCriticos.push({
            nome: chat.nome,
            chatId: chat.chatId,
            criticidade: nivelCriticidade,
            razoes: razoes,
            recebidas: recebidas,
            enviadas: enviadas,
            ultimaMensagem: ultimaMensagem ? ultimaMensagem.body.substring(0, 100) : '',
            tempoSemResposta: tempoSemResposta,
            palavrasCriticas: palavrasCriticas
          });
        }
      });

      // Ordena por criticidade
      alertasCriticos.sort((a, b) => b.criticidade - a.criticidade);

      if (alertasCriticos.length === 0) {
        await message.reply(`✅ **SITUAÇÃO CONTROLADA**\n\nNenhum alerta crítico detectado no momento.\n\n🎯 Todas as conversas estão sendo atendidas adequadamente.`);
        return;
      }

      // Monta relatório de alertas
      let relatorio = `🚨 **ALERTAS CRÍTICOS** - ${agora.toLocaleTimeString('pt-BR')}\n`;
      relatorio += `═══════════════════════════════════════════════════\n`;
      relatorio += `📊 **${alertasCriticos.length} SITUAÇÃO(ÕES) CRÍTICA(S) DETECTADA(S)**\n\n`;

      alertasCriticos.slice(0, limite).forEach((alerta, idx) => {
        const nivelEmoji = alerta.criticidade >= 8 ? '🔴 CRÍTICO' : 
                          alerta.criticidade >= 6 ? '🟠 ALTO' : 
                          alerta.criticidade >= 4 ? '🟡 MÉDIO' : '🟢 BAIXO';
        
        relatorio += `${idx + 1}. ${nivelEmoji} | **${alerta.nome}**\n`;
        relatorio += `   📊 Criticidade: ${alerta.criticidade}/10\n`;
        relatorio += `   📥 ${alerta.recebidas} recebidas | 📤 ${alerta.enviadas} enviadas\n`;
        
        if (alerta.tempoSemResposta > 0) {
          const tempo = alerta.tempoSemResposta >= 60 ? 
                       `${Math.floor(alerta.tempoSemResposta / 60)}h${alerta.tempoSemResposta % 60}m` : 
                       `${alerta.tempoSemResposta}m`;
          relatorio += `   ⏰ Sem resposta há: ${tempo}\n`;
        }
        
        relatorio += `   🚨 Motivos: ${alerta.razoes.join(' | ')}\n`;
        
        if (alerta.ultimaMensagem) {
          const msgCorta = alerta.ultimaMensagem.length > 80 ? 
                          alerta.ultimaMensagem.substring(0, 80) + '...' : 
                          alerta.ultimaMensagem;
          relatorio += `   💬 Última msg: "${msgCorta}"\n`;
        }
        
        relatorio += `\n`;
      });

      // Resumo executivo
      const criticos = alertasCriticos.filter(a => a.criticidade >= 8).length;
      const altos = alertasCriticos.filter(a => a.criticidade >= 6 && a.criticidade < 8).length;
      const totalNaoRespondidas = alertasCriticos.reduce((sum, a) => sum + a.recebidas, 0);

      relatorio += `📈 **RESUMO EXECUTIVO**\n`;
      relatorio += `🔴 Críticos: ${criticos} | 🟠 Altos: ${altos} | 🟡 Outros: ${alertasCriticos.length - criticos - altos}\n`;
      relatorio += `📥 Total de mensagens não respondidas: ${totalNaoRespondidas}\n`;
      
      if (criticos > 0) {
        relatorio += `\n⚠️ **AÇÃO IMEDIATA NECESSÁRIA** - ${criticos} caso(s) crítico(s)!\n`;
      }

      relatorio += `\n🤖 Análise automática | ⏰ ${agora.toLocaleTimeString('pt-BR')}`;

      await message.reply(relatorio);

      // Envia resumo por email se houver casos críticos
      if (criticos > 0) {
        try {
          const emailer = require('../../emailer');
          const emailContent = relatorio.replace(/\*\*/g, '').replace(/\*/g, '');
          
          await emailer.sendEmail(
            `🚨 ALERTA CRÍTICO WhatsApp - ${criticos} caso(s) precisam de atenção imediata`,
            emailContent
          );
          
          await message.reply('📧 Alerta crítico enviado por email!');
        } catch (emailError) {
          console.log('Erro ao enviar email de alerta:', emailError.message);
        }
      }

    } catch (error) {
      console.error('Erro no comando alertas:', error);
      await message.reply(`❌ Erro ao analisar alertas: ${error.message}`);
    }
  }
};
