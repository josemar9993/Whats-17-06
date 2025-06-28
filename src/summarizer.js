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
  // Garante que o nome do contato seja usado, se não, usa o ID do chat formatado.
  const contactName = chat.name && chat.name !== chat.chatId.replace('@c.us', '') ? chat.name : chat.chatId.replace('@c.us', '');

  chat.messages.forEach((message) => {
    const text = message.body || '';
    const normalizedText = removeAccents(text.toLowerCase());

    // Análise de Sentimento
    sentimentScore += sentiment.analyze(text).score;

    // Contagem de Mensagens
    if (message.fromMe) {
      sentMessages++;
    } else {
      receivedMessages++;
    }
    lastMessage = message;

    // Detecção de Temas por Palavra-chave
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
    contactName,
    sentMessages,
    receivedMessages,
    totalMessages: chat.messages.length,
    sentimentLabel: getSentimentLabel(sentimentScore),
    lastMessage: lastMessage ? `_"${lastMessage.body.substring(0, 50)}..."_` : '_Nenhuma mensagem_',
    detectedThemes: detectedThemes.size > 0 ? [...detectedThemes].join(', ') : 'Nenhum tópico principal detectado',
  };
}


/**
 * Cria um resumo diário com base nos chats fornecidos.
 * @param {Array<Object>} allMessages - Lista de todas as mensagens do dia.
 * @returns {string} O resumo formatado como uma string.
 */
async function createDailySummary(allMessages) {
  if (!allMessages || allMessages.length === 0) {
    return 'Nenhuma mensagem registrada hoje para resumir.';
  }

  // Agrupa mensagens por chat de forma assíncrona
  const chats = {};
  for (const msg of allMessages) {
      const chatId = msg.chatId;
      if (!chats[chatId]) {
          let contactName = chatId.replace('@c.us', '');
          try {
              // A função getChat pode não estar disponível em todos os objetos de mensagem
              if (typeof msg.getChat === 'function') {
                  const chatInfo = await msg.getChat();
                  contactName = chatInfo.name || contactName;
              }
          } catch (error) {
              console.error(`Erro ao obter informações do chat para ${chatId}:`, error);
          }
          chats[chatId] = {
              chatId: chatId,
              name: contactName,
              messages: []
          };
      }
      chats[chatId].messages.push(msg);
  }


  const chatList = Object.values(chats);

  if (chatList.length === 0) {
    return 'Nenhuma conversa encontrada para resumir hoje.';
  }

  const analyzedChats = chatList.map(analyzeChatMetrics);

  // Monta o resumo formatado para WhatsApp
  let summary = `*Resumo Diário de Atividades - ${new Date().toLocaleDateString('pt-BR')}*\n\n`;
  summary += `Você interagiu em *${analyzedChats.length}* conversa(s) hoje.\n\n`;
  summary += `-----------------------------------\n\n`;

  analyzedChats.forEach(chat => {
    summary += `👤 *Contato:* ${chat.contactName}\n`;
    summary += `📤 Enviadas: ${chat.sentMessages}\n`;
    summary += `📥 Recebidas: ${chat.receivedMessages}\n`;
    summary += `🙂 Sentimento: ${chat.sentimentLabel}\n`;
    summary += `📌 Tópicos: ${chat.detectedThemes}\n`;
    summary += `💬 Última Mensagem: ${chat.lastMessage}\n\n`;
    summary += `-----------------------------------\n\n`;
  });

  const totalSent = analyzedChats.reduce((sum, chat) => sum + chat.sentMessages, 0);
  const totalReceived = analyzedChats.reduce((sum, chat) => sum + chat.receivedMessages, 0);

  summary += `*Resumo Geral do Dia:*\n`;
  summary += `Total de Mensagens Enviadas: *${totalSent}*\n`;
  summary += `Total de Mensagens Recebidas: *${totalReceived}*\n`;
  summary += `Total de Conversas Ativas: *${analyzedChats.length}*\n\n`;
  summary += `Este é um resumo automático das suas interações.`;

  return summary;
}

module.exports = {
  createDailySummary,
};
