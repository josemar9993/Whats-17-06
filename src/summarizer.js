// src/summarizer.js

// Importa bibliotecas de NLP para análise de sentimentos e detecção de tópicos
const Sentiment = require('sentiment');
const sentiment = new Sentiment();
const removeAccents = require('remove-accents');

const KEYWORD_THEMES = [
  {
    tema: '💰 Financeiro',
    prioridade: 'ALTA',
    icon: '💰',
    palavras: [
      'preço', 'cobrança', 'valor', 'pagar', 'orçamento', 'boleto', 'pix',
      'faturamento', 'receita', 'lucro', 'investimento', 'custo', 'desconto',
      'proposta', 'contrato', 'negociação', 'comissão', 'prazo', 'vencimento'
    ]
  },
  {
    tema: '🚨 Suporte Técnico',
    prioridade: 'CRÍTICA',
    icon: '🚨',
    palavras: [
      'erro', 'problema', 'ajuda', 'suporte', 'bug', 'falha', 'down',
      'indisponível', 'lento', 'travou', 'não funciona', 'urgente',
      'crítico', 'parado', 'sistema', 'servidor', 'backup'
    ]
  },
  {
    tema: '🤝 Vendas/Negócios',
    prioridade: 'ALTA',
    icon: '🤝',
    palavras: [
      'cliente', 'lead', 'prospect', 'venda', 'negócio', 'oportunidade',
      'proposta comercial', 'demonstração', 'trial', 'teste', 'contrato',
      'fechamento', 'pipeline', 'follow-up', 'interessado'
    ]
  },
  {
    tema: '📅 Agendamentos',
    prioridade: 'MÉDIA',
    icon: '📅',
    palavras: [
      'horário', 'marcar', 'agenda', 'amanhã', 'reunião', 'encontro',
      'meeting', 'call', 'apresentação', 'demo', 'visita', 'disponibilidade'
    ]
  },
  {
    tema: '⚙️ Desenvolvimento',
    prioridade: 'ALTA',
    icon: '⚙️',
    palavras: [
      'desenvolvimento', 'feature', 'funcionalidade', 'código', 'deploy',
      'release', 'versão', 'atualização', 'melhoria', 'implementação',
      'integração', 'api', 'database', 'performance'
    ]
  },
  {
    tema: '👥 Recursos Humanos',
    prioridade: 'MÉDIA',
    icon: '👥',
    palavras: [
      'contratação', 'vaga', 'candidato', 'entrevista', 'equipe', 'time',
      'funcionário', 'colaborador', 'treinamento', 'capacitação', 'férias'
    ]
  },
  {
    tema: '📊 Relatórios/Dados',
    prioridade: 'MÉDIA',
    icon: '📊',
    palavras: [
      'relatório', 'dashboard', 'métricas', 'kpi', 'dados', 'análise',
      'performance', 'resultado', 'estatística', 'gráfico', 'indicador'
    ]
  },
  {
    tema: '📱 Mídia/Documentos',
    prioridade: 'BAIXA',
    icon: '📱',
    palavras: ['foto', 'imagem', 'pdf', 'documento', 'áudio', 'vídeo', 'arquivo']
  },
  {
    tema: '😊 Pessoal',
    prioridade: 'BAIXA',
    icon: '😊',
    palavras: ['família', 'amor', 'parabéns', 'saudade', 'abraço', 'feliz', 'aniversário']
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
  let firstMessage = null;
  const detectedThemes = new Map();
  const hourlyActivity = new Array(24).fill(0);
  let avgResponseTime = 0;
  let totalResponseTimes = 0;
  let responseCount = 0;
  
  // Simplifica a obtenção do nome do contato, priorizando o nome do chat.
  const contactName = chat.name || chat.chatId.replace('@c.us', '').replace(/[^\w\s]/gi, '');

  // Ordena mensagens por timestamp
  const sortedMessages = chat.messages.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
  
  sortedMessages.forEach((message, index) => {
    const text = message.body || '';
    const normalizedText = removeAccents(text.toLowerCase());
    const messageDate = new Date((message.timestamp || Date.now() / 1000) * 1000);
    const hour = messageDate.getHours();
    
    hourlyActivity[hour]++;
    sentimentScore += sentiment.analyze(text).score;

    if (message.fromMe) {
      sentMessages++;
      // Calcula tempo de resposta se for resposta a uma mensagem recebida
      if (index > 0 && !sortedMessages[index - 1].fromMe) {
        const responseTime = (message.timestamp - sortedMessages[index - 1].timestamp) / 60; // em minutos
        if (responseTime < 1440) { // só considera se for menos de 24h
          totalResponseTimes += responseTime;
          responseCount++;
        }
      }
    } else {
      receivedMessages++;
    }
    
    if (!firstMessage) firstMessage = message;
    lastMessage = message;

    // Análise de temas com prioridade
    for (const theme of KEYWORD_THEMES) {
      for (const keyword of theme.palavras) {
        if (normalizedText.includes(keyword)) {
          const currentCount = detectedThemes.get(theme.tema) || 0;
          detectedThemes.set(theme.tema, currentCount + 1);
          break;
        }
      }
    }
  });

  avgResponseTime = responseCount > 0 ? Math.round(totalResponseTimes / responseCount) : 0;
  
  // Identifica pico de atividade
  const peakHour = hourlyActivity.indexOf(Math.max(...hourlyActivity));
  
  // Classifica urgência baseado em temas críticos
  const criticalThemes = [...detectedThemes.keys()].filter(theme => 
    KEYWORD_THEMES.find(t => t.tema === theme)?.prioridade === 'CRÍTICA'
  );
  
  const urgencyLevel = criticalThemes.length > 0 ? 'CRÍTICA' : 
                      receivedMessages > sentMessages && receivedMessages > 3 ? 'ALTA' :
                      receivedMessages > sentMessages ? 'MÉDIA' : 'BAIXA';

  return {
    chatId: chat.chatId,
    contactName,
    sentMessages,
    receivedMessages,
    totalMessages: chat.messages.length,
    sentimentLabel: getSentimentLabel(sentimentScore),
    sentimentScore: Math.round(sentimentScore * 100) / 100,
    lastMessage: lastMessage
      ? `${lastMessage.body.substring(0, 50)}${lastMessage.body.length > 50 ? '...' : ''}`
      : 'Nenhuma mensagem',
    lastMessageTime: lastMessage ? new Date((lastMessage.timestamp || 0) * 1000) : null,
    firstMessageTime: firstMessage ? new Date((firstMessage.timestamp || 0) * 1000) : null,
    detectedThemes: detectedThemes.size > 0 ? detectedThemes : new Map([['Nenhum tópico principal', 1]]),
    themesText: detectedThemes.size > 0 
      ? [...detectedThemes.entries()].map(([theme, count]) => `${theme} (${count})`).join(', ')
      : 'Nenhum tópico principal',
    avgResponseTime,
    peakHour,
    urgencyLevel,
    isUnanswered: receivedMessages > 0 && sentMessages === 0,
    responseRate: receivedMessages > 0 ? Math.round((Math.min(sentMessages, receivedMessages) / receivedMessages) * 100) : 0,
    messages: chat.messages
  };
}

/**
 * Cria um resumo diário com base nos chats fornecidos.
 * @param {Array<Object>} allMessages - Lista de todas as mensagens do dia.
 * @returns {string} O resumo formatado como uma string.
 */
async function createDailySummary(allMessages, periodLabel = null) {
  if (!allMessages || allMessages.length === 0) {
    return '📊 *RELATÓRIO EMPRESARIAL DIÁRIO*\n\n❌ Nenhuma atividade registrada no período.';
  }

  const chats = {};
  const themeCount = new Map();
  const hourlyActivity = new Array(24).fill(0);
  let totalResponseTime = 0;
  let responseCount = 0;
  
  // Agrupa mensagens por chat
  for (const message of allMessages) {
    const chatId = message.chatId;
    const messageDate = new Date((message.timestamp || Date.now() / 1000) * 1000);
    const hour = messageDate.getHours();
    hourlyActivity[hour]++;
    
    if (!chats[chatId]) {
      const isGroup = chatId.endsWith('@g.us');
      let chatName = !message.fromMe && message.senderName
        ? message.senderName
        : (message.contactName || message.senderName || chatId.replace(/@c\.us|@g\.us/, ''));
      chats[chatId] = {
        chatId: chatId,
        name: chatName,
        isGroup,
        messages: []
      };
    } else if (!message.fromMe && message.senderName) {
      const currentName = chats[chatId].name.toLowerCase();
      if (currentName === 'bot whts' || currentName === 'eu' || currentName === chatId.replace(/@c\.us|@g\.us/, '')) {
        chats[chatId].name = message.senderName;
      }
    }
    chats[chatId].messages.push(message);
  }

  // Análise detalhada dos chats
  let analyzedChats = Object.values(chats).map(analyzeChatMetrics);
  
  // Debug: Log para verificar chats antes e depois do filtro
  console.log(`[DEBUG SUMMARIZER] Total de chats antes do filtro: ${analyzedChats.length}`);
  analyzedChats.forEach(chat => {
    console.log(`[DEBUG CHAT] ${chat.contactName} - Sent: ${chat.sentMessages}, Received: ${chat.receivedMessages}`);
  });
  
  // Filtro mais específico - remove apenas bots conhecidos
  analyzedChats = analyzedChats.filter(chat => {
    const name = chat.contactName.toLowerCase();
    const isBot = name === 'eu' || 
                  name === 'bot whts' || 
                  name.includes('whatsapp') ||
                  name.includes('system') ||
                  name.includes('broadcast');
    
    if (isBot) {
      console.log(`[DEBUG FILTER] Removendo bot: ${chat.contactName}`);
    }
    
    return !isBot;
  });
  
  console.log(`[DEBUG SUMMARIZER] Total de chats após filtro: ${analyzedChats.length}`);

  // Calcula métricas gerais
  const totalSent = analyzedChats.reduce((sum, chat) => sum + chat.sentMessages, 0);
  const totalReceived = analyzedChats.reduce((sum, chat) => sum + chat.receivedMessages, 0);
  const totalConversations = analyzedChats.length;
  
  // Contabiliza temas e calcula tempo médio de resposta
  analyzedChats.forEach(chat => {
    if (chat.avgResponseTime > 0) {
      totalResponseTime += chat.avgResponseTime;
      responseCount++;
    }
    
    for (const [theme, count] of chat.detectedThemes) {
      themeCount.set(theme, (themeCount.get(theme) || 0) + count);
    }
  });

  const avgResponseTime = responseCount > 0 ? Math.round(totalResponseTime / responseCount) : 0;
  const peakHour = hourlyActivity.indexOf(Math.max(...hourlyActivity));
  
  // Identifica contatos críticos
  const criticalContacts = analyzedChats.filter(chat => chat.urgencyLevel === 'CRÍTICA');
  const unansweredContacts = analyzedChats.filter(chat => chat.isUnanswered);
  const slowResponseContacts = analyzedChats.filter(chat => chat.avgResponseTime > 60);
  
  // Ordena por prioridade
  analyzedChats.sort((a, b) => {
    const priorities = {'CRÍTICA': 4, 'ALTA': 3, 'MÉDIA': 2, 'BAIXA': 1};
    return (priorities[b.urgencyLevel] || 0) - (priorities[a.urgencyLevel] || 0);
  });

  // Construção do relatório
  const today = new Date().toLocaleDateString('pt-BR');
  const periodo = periodLabel || today;
  const currentTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  
  let summary = `
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  � **RELATÓRIO EMPRESARIAL DIÁRIO**           ┃
┃  🗓️ **${periodo}** | ⏰ **${currentTime}**                    ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

🎯 **RESUMO EXECUTIVO**
═══════════════════════════════════════════════════
�💬 **Conversas Ativas:** ${totalConversations}
📨 **Mensagens Enviadas:** ${totalSent}
📥 **Mensagens Recebidas:** ${totalReceived}
📈 **Taxa de Resposta Geral:** ${totalReceived > 0 ? Math.round((Math.min(totalSent, totalReceived) / totalReceived) * 100) : 100}%
⏱️ **Tempo Médio de Resposta:** ${avgResponseTime > 0 ? `${avgResponseTime} min` : 'N/A'}
🕐 **Pico de Atividade:** ${peakHour}:00h
`;

  // Alertas críticos
  const alerts = [];
  if (criticalContacts.length > 0) {
    alerts.push(`🚨 **${criticalContacts.length} CONTATO(S) CRÍTICO(S)**`);
  }
  if (unansweredContacts.length > 0) {
    alerts.push(`⚠️ **${unansweredContacts.length} CONTATO(S) SEM RESPOSTA**`);
  }
  if (slowResponseContacts.length > 0) {
    alerts.push(`� **${slowResponseContacts.length} RESPOSTA(S) LENTA(S) (>1h)**`);
  }
  if (totalReceived > totalSent * 1.5) {
    alerts.push(`� **SOBRECARGA: Recebendo ${Math.round(totalReceived/totalSent)}x mais mensagens**`);
  }

  if (alerts.length > 0) {
    summary += `\n🚨 **ALERTAS CRÍTICOS**\n`;
    summary += `═══════════════════════════════════════════════════\n`;
    alerts.forEach(alert => summary += `${alert}\n`);
  }

  // Top temas empresariais
  const businessThemes = [...themeCount.entries()]
    .filter(([theme]) => theme !== 'Nenhum tópico principal')
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  if (businessThemes.length > 0) {
    summary += `\n📊 **TÓPICOS EMPRESARIAIS**\n`;
    summary += `═══════════════════════════════════════════════════\n`;
    businessThemes.forEach(([theme, count], idx) => {
      const priority = KEYWORD_THEMES.find(t => t.tema === theme)?.prioridade || 'MÉDIA';
      const priorityEmoji = priority === 'CRÍTICA' ? '🔴' : priority === 'ALTA' ? '🟠' : priority === 'MÉDIA' ? '🟡' : '�';
      summary += `${idx + 1}. ${priorityEmoji} ${theme}: **${count} menção${count > 1 ? 'ões' : ''}**\n`;
    });
  }

  // Contatos prioritários que precisam de atenção
  if (criticalContacts.length > 0 || unansweredContacts.length > 0) {
    summary += `\n🎯 **AÇÃO NECESSÁRIA - PRIORIDADE**\n`;
    summary += `═══════════════════════════════════════════════════\n`;
    
    const priorityContacts = [...criticalContacts, ...unansweredContacts.filter(c => !criticalContacts.includes(c))];
    
    priorityContacts.slice(0, 8).forEach((chat, idx) => {
      const urgencyEmoji = chat.urgencyLevel === 'CRÍTICA' ? '🔴' : '🟠';
      const timeAgo = chat.lastMessageTime ? getTimeAgo(chat.lastMessageTime) : '';
      summary += `${idx + 1}. ${urgencyEmoji} **${chat.contactName}**\n`;
      summary += `   📥 ${chat.receivedMessages} msg | 📤 ${chat.sentMessages} resp | ⏰ ${timeAgo}\n`;
      summary += `   💬 "${chat.lastMessage}"\n`;
      summary += `   �️ ${chat.themesText}\n`;
      summary += `   😊 ${chat.sentimentLabel}\n\n`;
    });
  }

  // Dashboard de performance
  summary += `\n📈 **DASHBOARD DE PERFORMANCE**\n`;
  summary += `═══════════════════════════════════════════════════\n`;
  
  const activeChats = analyzedChats.filter(c => c.sentMessages > 0 && c.receivedMessages > 0).length;
  const engagementRate = totalConversations > 0 ? Math.round((activeChats / totalConversations) * 100) : 0;
  
  summary += `� **Taxa de Engajamento:** ${engagementRate}% (${activeChats}/${totalConversations})\n`;
  summary += `⚡ **Produtividade:** ${totalSent > 0 ? Math.round(totalReceived / totalSent * 100) / 100 : 0} msgs recebidas/enviada\n`;
  summary += `🎯 **Eficiência de Resposta:** ${avgResponseTime > 0 ? avgResponseTime + ' min' : 'Excelente'}\n`;
  
  // Ranking de atividade
  const topActive = analyzedChats
    .filter(c => c.totalMessages > 3)
    .sort((a, b) => b.totalMessages - a.totalMessages)
    .slice(0, 5);

  if (topActive.length > 0) {
    summary += `\n🏆 **TOP 5 CONVERSAS MAIS ATIVAS**\n`;
    summary += `═══════════════════════════════════════════════════\n`;
    topActive.forEach((chat, idx) => {
      const status = chat.isUnanswered ? '⚠️' : chat.sentMessages > chat.receivedMessages ? '📤' : '📥';
      const efficiency = chat.receivedMessages > 0 ? Math.round((chat.sentMessages / chat.receivedMessages) * 100) : 100;
      summary += `${idx + 1}. ${status} **${chat.contactName}** | ${chat.totalMessages} msgs | ${efficiency}% resp\n`;
    });
  }

  summary += `\n\n🤖 **Relatório gerado automaticamente** | ⏰ ${currentTime}\n`;
  summary += `� **Sistema:** WhatsApp Business Intelligence v2.0\n`;
  summary += `═══════════════════════════════════════════════════`;
  
  return summary.trim();
}

function getTimeAgo(date) {
  const now = new Date();
  const diffMs = now - date;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  if (diffHours > 0) {
    return `${diffHours}h${diffMinutes > 0 ? diffMinutes + 'm' : ''} atrás`;
  } else if (diffMinutes > 0) {
    return `${diffMinutes}m atrás`;
  } else {
    return 'agora';
  }
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
        messages: []
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
  generatePendingSummary
};
