// src/summarizer.js

// Importa bibliotecas de NLP para análise de sentimentos e detecção de tópicos
const Sentiment = require('sentiment');
const sentiment = new Sentiment();
const nlp = require('compromise');
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

/**
 * Normaliza o input de chats para um formato padrão.
 * @param {Array<Object>} chats - Lista de chats ou mensagens.
 * @returns {Array<Object>}
 */
function normalizeChats(chats) {
  if (!Array.isArray(chats)) {
    throw new Error('Formato de chats não suportado: não é um array.');
  }
  if (chats.length === 0) {
    return [];
  }

  // Se for um array de mensagens simples, agrupa por chatId
  if (!chats[0].messages) {
    const grouped = {};
    chats.forEach((msg) => {
      if (!grouped[msg.chatId]) {
        grouped[msg.chatId] = { chatId: msg.chatId, messages: [] };
      }
      grouped[msg.chatId].messages.push(msg);
    });
    return Object.values(grouped);
  }
  
  return chats;
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
  let responseTimes = [];
  let lastContactMessage = null;
  let lastMyMessage = null;
  const detectedThemes = new Set();
  const nouns = {};

  chat.messages.forEach((message) => {
    const text = message.body || '';
    const normalizedText = removeAccents(text.toLowerCase());

    // Análise de Sentimento
    sentimentScore += sentiment.analyze(text).score;

    // Contagem de Mensagens e Cálculo de Tempo de Resposta
    if (message.fromMe) {
      sentMessages++;
      if (lastContactMessage) {
        responseTimes.push(message.timestamp - lastContactMessage.timestamp);
      }
      lastMyMessage = message;
    } else {
      receivedMessages++;
      if (lastMyMessage) {
        // Aqui poderíamos calcular o tempo de resposta do contato, se necessário
      }
      lastContactMessage = message;
    }
    lastMessage = message;

    // Detecção de Temas por Palavra-chave
    for (const theme of KEYWORD_THEMES) {
      for (const keyword of theme.palavras) {
        if (normalizedText.includes(keyword)) {
          detectedThemes.add(theme.tema);
        }
      }
    }

    // Extração de Tópicos (Substantivos)
    nlp(normalizedText).nouns().out('array').forEach(n => {
      nouns[n] = (nouns[n] || 0) + 1;
    });
  });

  const avgResponseTime = responseTimes.length > 0
    ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
    : null;

  return {
    chatId: chat.chatId,
    contactName: (lastMessage && lastMessage.senderName) || chat.chatId,
    totalMessages: chat.messages.length,
    sentMessages,
    receivedMessages,
    sentimentScore,
    isPending: lastMessage && !lastMessage.fromMe,
    pendingInfo: lastMessage && !lastMessage.fromMe ? {
      body: lastMessage.body,
      timestamp: lastMessage.isoTimestamp
    } : null,
    avgResponseTime,
    themes: Array.from(detectedThemes),
    nouns
  };
}

/**
 * Formata o relatório de resumo final a partir das métricas agregadas.
 * @param {Object} metrics - Métricas agregadas de todos os chats.
 * @returns {string} O relatório de resumo formatado.
 */
function formatSummaryReport(metrics) {
  let summary = `Resumo das Conversas:\n`;
  summary += `Total de Mensagens: ${metrics.totalMessages}\n`;
  summary += `Sentimento Médio: ${metrics.averageSentiment.toFixed(2)}\n`;

  summary += `\nTop 3 contatos mais engajados:\n`;
  metrics.topEngaged.forEach(e => summary += `- ${e.contactName}: ${e.totalMessages} mensagens\n`);

  summary += `\nTop 3 maiores tempos médios de resposta (em segundos):\n`;
  metrics.topResponseTimes.forEach(t => summary += `- ${t.contactName}: ${Math.round(t.avgResponseTime)}s\n`);
  
  summary += `\nTop 3 temas mais frequentes:\n`;
  metrics.topThemes.forEach(([theme, count]) => summary += `- ${theme}: ${count} chats\n`);

  summary += `\nPrincipais tópicos mencionados:\n`;
  metrics.topNouns.forEach(([noun, count]) => summary += `- ${noun}: ${count} menções\n`);

  if (metrics.pendingChats.length > 0) {
    summary += `\nConversas aguardando seu retorno:\n`;
    metrics.pendingChats.forEach(p => {
      summary += `- ${p.contactName}: "${p.pendingInfo.body.slice(0, 50)}..."\n`;
    });
  } else {
    summary += '\nNenhuma conversa pendente de resposta.\n';
  }

  return summary;
}

/**
 * Gera um resumo estatístico das conversas analisando sentimento, engajamento e tópicos.
 *
 * @param {Array<Object>} chats - Lista de chats ou mensagens simples para agrupar.
 * @returns {string} Texto em português contendo as principais métricas do período.
 */
function generateSummary(chats) {
  const normalizedChats = normalizeChats(chats);
  if (normalizedChats.length === 0) {
    return "Nenhuma mensagem para analisar.";
  }

  const analysisResults = normalizedChats.map(analyzeChatMetrics);

  // Agregação de Métricas
  const totalMessages = analysisResults.reduce((sum, r) => sum + r.totalMessages, 0);
  const totalSentiment = analysisResults.reduce((sum, r) => sum + r.sentimentScore, 0);
  
  const allNouns = {};
  const allThemes = {};
  analysisResults.forEach(r => {
    r.themes.forEach(theme => allThemes[theme] = (allThemes[theme] || 0) + 1);
    Object.entries(r.nouns).forEach(([noun, count]) => allNouns[noun] = (allNouns[noun] || 0) + count);
  });

  const aggregatedMetrics = {
    totalMessages,
    averageSentiment: totalMessages > 0 ? totalSentiment / totalMessages : 0,
    topEngaged: [...analysisResults].sort((a, b) => b.totalMessages - a.totalMessages).slice(0, 3),
    topResponseTimes: [...analysisResults].filter(r => r.avgResponseTime).sort((a, b) => b.avgResponseTime - a.avgResponseTime).slice(0, 3),
    topThemes: Object.entries(allThemes).sort((a, b) => b[1] - a[1]).slice(0, 3),
    topNouns: Object.entries(allNouns).sort((a, b) => b[1] - a[1]).slice(0, 5),
    pendingChats: analysisResults.filter(r => r.isPending)
  };

  return formatSummaryReport(aggregatedMetrics);
}

/**
 * Analisa as conversas e retorna apenas as pendências, isto é,
 * chats cuja última mensagem não foi respondida.
 *
 * @param {Array<Object>|Array} chats - Lista de chats ou mensagens soltas.
 * @returns {string} Texto com a lista de pendências encontradas.
 */
function generatePendingSummary(chats) {
  const normalizedChats = normalizeChats(chats);
  if (normalizedChats.length === 0) {
    return "Nenhuma mensagem para analisar.";
  }

  const pendencias = [];

  normalizedChats.forEach((chat) => {
    if (chat.messages.length === 0) return;
    const ultimaMsg = chat.messages[chat.messages.length - 1];

    if (ultimaMsg && !ultimaMsg.fromMe) {
      pendencias.push({
        contato: ultimaMsg.senderName || chat.chatId || 'desconhecido',
        mensagem: ultimaMsg.body,
        quando: ultimaMsg.isoTimestamp
          ? new Date(ultimaMsg.isoTimestamp).toLocaleString('pt-BR')
          : 'data desconhecida'
      });
    }
  });

  if (pendencias.length > 0) {
    let summary = `Resumo de Pendências:\n\nConversas aguardando seu retorno:\n`;
    pendencias.forEach((p) => {
      summary += `- ${p.contato}: "${p.mensagem.slice(0, 50)}..." (em ${p.quando})\n`;
    });
    return summary;
  } else {
    return 'Nenhuma conversa pendente de resposta.\n';
  }
}

// Exporta as funções de geração de resumo
module.exports = {
  generateSummary,
  generatePendingSummary
};
