// src/summarizer.js

// Importa bibliotecas de NLP para análise de sentimentos e detecção de tópicos
const Sentiment = require('sentiment');
const sentiment = new Sentiment();
const removeAccents = require('remove-accents');

const KEYWORD_THEMES = [
  {
    tema: 'Financeiro',
    palavras: ['preço', 'cobrança', 'valor', 'pagar', 'orçamento', 'boleto', 'pix']
  },
  {
    tema: 'Suporte',
    palavras: ['erro', 'problema', 'ajuda', 'suporte', 'bug', 'falha']
  },
  {
    tema: 'Agendamento',
    palavras: ['horário', 'marcar', 'agenda', 'amanhã', 'reunião', 'encontro']
  },
  {
    tema: 'Pessoal',
    palavras: ['família', 'amor', 'parabéns', 'saudade', 'abraço', 'feliz']
  },
  {
    tema: 'Mídia',
    palavras: ['foto', 'imagem', 'pdf', 'documento', 'áudio', 'vídeo']
  }
];

function getSentimentLabel(score) {
  if (score > 2) return '😄 Positivo';
  if (score < -2) return '😠 Negativo';
  return '😐 Neutro';
}

/**
 * Analisa um único chat e extrai métricas.
 * @param {Object} chat - O objeto do chat com mensagens.
 * @returns {Object} Métricas analisadas para o chat.
 */
function analyzeChatMetrics(chat) {
  let sentMessages = 0;
  let receivedMessages = 0;
  let sentimentScore = 0;
  let lastMessage = null;
  const detectedThemes = new Set();
  // Simplifica a obtenção do nome do contato, priorizando o nome do chat.
  const contactName = chat.name || chat.chatId.replace('@c.us', '');

  chat.messages.forEach((message) => {
    const text = message.body || '';
    const normalizedText = removeAccents(text.toLowerCase());

    sentimentScore += sentiment.analyze(text).score;

    if (message.fromMe) {
      sentMessages++;
    } else {
      receivedMessages++;
    }
    lastMessage = message;

    for (const theme of KEYWORD_THEMES) {
      for (const keyword of theme.palavras) {
        if (normalizedText.includes(keyword)) {
          detectedThemes.add(theme.tema);
          break;
        }
      }
    }
  });

  return {
    chatId: chat.chatId, // <-- Adicionado para corrigir o erro
    contactName,
    sentMessages,
    receivedMessages,
    totalMessages: chat.messages.length,
    sentimentLabel: getSentimentLabel(sentimentScore),
    lastMessage: lastMessage ? `_${"\""}${lastMessage.body.substring(0, 50)}..."_` : '_Nenhuma mensagem_',
    detectedThemes: detectedThemes.size > 0 ? [...detectedThemes].join(', ') : 'Nenhum tópico principal',
    messages: chat.messages, // <-- Adicionado para manter acesso às mensagens
  };
}


/**
 * Cria um resumo diário com base nos chats fornecidos.
 * @param {Array<Object>} allMessages - Lista de todas as mensagens do dia.
 * @returns {string} O resumo formatado como uma string.
 */
async function createDailySummary(allMessages, periodLabel = null) {
  if (!allMessages || allMessages.length === 0) {
    return 'Nenhuma mensagem registrada para resumir.';
  }

  const chats = {};
  const themeCount = {};
  let totalRespondidas = 0;
  let totalRecebidas = 0;
  for (const message of allMessages) {
    const chatId = message.chatId;
    if (!chats[chatId]) {
      const isGroup = chatId.endsWith('@g.us');
      const chatName = message.senderName || message.contactName || chatId.replace(/@c\.us|@g\.us/, '');
      chats[chatId] = {
        chatId: chatId,
        name: chatName,
        isGroup,
        messages: [],
      };
    }
    chats[chatId].messages.push(message);
  }

  // Análise e ordenação
  let analyzedChats = Object.values(chats).map(analyzeChatMetrics);
  analyzedChats = analyzedChats.filter(chat => chat.contactName.toLowerCase() !== 'eu');
  analyzedChats = analyzedChats.sort((a, b) => b.receivedMessages - a.receivedMessages);

  // Agrupamento por tipo
  const groups = analyzedChats.filter(c => c.chatId.endsWith('@g.us'));
  const individuals = analyzedChats.filter(c => !c.chatId.endsWith('@g.us'));

  // Resumo do período
  const today = new Date().toLocaleDateString('pt-BR');
  const periodo = periodLabel ? periodLabel : today;
  let summary = `📊 *Resumo Diário de Atividades* | ${periodo} 📊\n\n`;
  summary += `Hoje você interagiu em *${analyzedChats.length}* conversas distintas.\n`;
  summary += '===================================\n\n';

  // Resumo geral antes dos contatos
  const totalSent = analyzedChats.reduce((sum, chat) => sum + chat.sentMessages, 0);
  const totalReceived = analyzedChats.reduce((sum, chat) => sum + chat.receivedMessages, 0);
  // Taxa de resposta geral
  analyzedChats.forEach(chat => {
    totalRecebidas += chat.receivedMessages;
    totalRespondidas += Math.min(chat.sentMessages, chat.receivedMessages);
    // Contabiliza temas para ranking
    chat.detectedThemes.split(',').forEach(theme => {
      const t = theme.trim();
      if (t && t !== 'Nenhum tópico principal') {
        themeCount[t] = (themeCount[t] || 0) + 1;
      }
    });
  });
  const taxaResposta = totalRecebidas > 0 ? Math.round((totalRespondidas / totalRecebidas) * 100) : 100;

  summary += '===================================\n';
  summary += `*Resumo Geral do Dia:*\n`;
  summary += `  - ↗️ Total Enviadas: *${totalSent}*\n`;
  summary += `  - ↙️ Total Recebidas: *${totalReceived}*\n`;
  summary += `  - 💬 Total de Conversas: *${analyzedChats.length}*\n`;
  summary += `  - 📈 Taxa de Resposta: *${taxaResposta}%*\n\n`;
  summary += `🤖 _Este é um resumo automático._\n\n`;

  // Contatos individuais
  if (individuals.length > 0) {
    summary += '*Conversas Individuais:*\n';
    individuals.forEach(chat => {
      let lastMsg = chat.lastMessage.replace(/^_"|"_$/g, '');
      if (lastMsg.length > 30) lastMsg = lastMsg.substring(0, 30) + '...';
      let lastMsgTime = '';
      if (chat.messages && chat.messages.length > 0) {
        const last = chat.messages[chat.messages.length - 1];
        if (last.timestamp) {
          const date = new Date(last.timestamp * 1000);
          lastMsgTime = ` (${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })})`;
        }
      }
      const semResposta = chat.sentMessages === 0 && chat.receivedMessages > 0 ? ' ⚠️' : '';
      summary += '-----------------------------------\n';
      summary += `👤 Contato: ${chat.contactName}${semResposta}\n`;
      summary += `📤 Enviadas: ${chat.sentMessages}\n`;
      summary += `📥 Recebidas: ${chat.receivedMessages}\n`;
      summary += `🙂 Sentimento: ${chat.sentimentLabel}\n`;
      summary += `📌 Tópicos: ${chat.detectedThemes}\n`;
      summary += `💬 Última Mensagem: "${lastMsg}"${lastMsgTime}\n`;
    });
    summary += '\n';
  }

  // Grupos
  if (groups.length > 0) {
    summary += '*Conversas em Grupo:*\n';
    groups.forEach(chat => {
      let lastMsg = chat.lastMessage.replace(/^_"|"_$/g, '');
      if (lastMsg.length > 30) lastMsg = lastMsg.substring(0, 30) + '...';
      let lastMsgTime = '';
      if (chat.messages && chat.messages.length > 0) {
        const last = chat.messages[chat.messages.length - 1];
        if (last.timestamp) {
          const date = new Date(last.timestamp * 1000);
          lastMsgTime = ` (${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })})`;
        }
      }
      const semResposta = chat.sentMessages === 0 && chat.receivedMessages > 0 ? ' ⚠️' : '';
      summary += '-----------------------------------\n';
      summary += `👥 Grupo: ${chat.contactName}${semResposta}\n`;
      summary += `📤 Enviadas: ${chat.sentMessages}\n`;
      summary += `📥 Recebidas: ${chat.receivedMessages}\n`;
      summary += `🙂 Sentimento: ${chat.sentimentLabel}\n`;
      summary += `📌 Tópicos: ${chat.detectedThemes}\n`;
      summary += `💬 Última Mensagem: "${lastMsg}"${lastMsgTime}\n`;
    });
    summary += '\n';
  }

  // Contatos mais ignorados
  const ignorados = analyzedChats.filter(c => c.sentMessages === 0 && c.receivedMessages > 0);
  if (ignorados.length > 0) {
    summary += '*Contatos mais ignorados (sem resposta):*\n';
    ignorados.forEach(chat => {
      summary += `- ${chat.contactName} (${chat.receivedMessages} recebidas)\n`;
    });
    summary += '\n';
  }

  // Ranking de tópicos
  const temasOrdenados = Object.entries(themeCount).sort((a, b) => b[1] - a[1]);
  if (temasOrdenados.length > 0) {
    summary += '*Principais tópicos do dia:*\n';
    temasOrdenados.forEach(([tema, count], idx) => {
      summary += `${idx + 1}. ${tema} (${count})\n`;
    });
  }

  summary += '\n-----------------------------------';
  return summary.trim();
}

/**
 * Gera um resumo de mensagens que possivelmente ficaram sem resposta.
 * A heurística considera perguntas que não receberam retorno do usuário.
 * @param {Array<Object>} allMessages - Lista de mensagens já agrupadas por data.
 * @returns {string} Texto com as pendências encontradas.
 */
function generatePendingSummary(allMessages) {
  if (!allMessages || allMessages.length === 0) {
    return '';
  }

  // Agrupa mensagens por chat para verificar cada conversa separadamente
  const chats = {};
  for (const message of allMessages) {
    const chatId = message.chatId;
    if (!chats[chatId]) {
      chats[chatId] = {
        chatId,
        name: message.senderName || chatId.replace('@c.us', ''),
        messages: [],
      };
    }
    chats[chatId].messages.push(message);
  }

  let summary = '';

  for (const chat of Object.values(chats)) {
    const pending = [];
    const msgs = chat.messages;

    for (let i = 0; i < msgs.length; i++) {
      const msg = msgs[i];

      // Considera perguntas de outros participantes
      if (!msg.fromMe && msg.body && msg.body.includes('?')) {
        const answered = msgs.slice(i + 1).some((next) => next.fromMe);
        if (!answered) {
          pending.push(`• ${msg.body.substring(0, 60)}...`);
        }
      }
    }

    if (pending.length > 0) {
      summary += `👤 *${chat.name}*\n`;
      summary += pending.join('\n');
      summary += '\n\n';
    }
  }

  return summary.trim();
}

module.exports = {
  createDailySummary,
  generatePendingSummary,
};
