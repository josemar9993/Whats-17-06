// exemplo-relatorio-empresarial.js
// Este arquivo demonstra como ficará o novo relatório empresarial

const { createDailySummary } = require('./src/summarizer');

// Dados de exemplo simulando mensagens reais de uma empresa
const mensagensExemplo = [
  {
    chatId: '5548999312271@c.us',
    senderName: 'João Silva (Cliente Premium)',
    body: 'Bom dia! O sistema parou de funcionar aqui, é urgente!',
    fromMe: false,
    timestamp: Math.floor(Date.now() / 1000) - 9000, // 2.5h atrás
    contactName: 'João Silva'
  },
  {
    chatId: '5548999312271@c.us',
    senderName: 'João Silva (Cliente Premium)', 
    body: 'Pessoal, precisamos resolver isso hoje, temos cliente esperando',
    fromMe: false,
    timestamp: Math.floor(Date.now() / 1000) - 7200, // 2h atrás
    contactName: 'João Silva'
  },
  {
    chatId: '5548999312271@c.us',
    senderName: 'João Silva (Cliente Premium)',
    body: 'Erro crítico na aplicação, perdendo dinheiro a cada minuto',
    fromMe: false,
    timestamp: Math.floor(Date.now() / 1000) - 5400, // 1.5h atrás
    contactName: 'João Silva'
  },
  
  {
    chatId: '5548999312272@c.us',
    senderName: 'Maria Santos (Lead)',
    body: 'Oi! Gostaria de saber mais sobre os preços dos seus serviços',
    fromMe: false,
    timestamp: Math.floor(Date.now() / 1000) - 10800, // 3h atrás
    contactName: 'Maria Santos'
  },
  {
    chatId: '5548999312272@c.us',
    senderName: 'Bot',
    body: 'Olá Maria! Fico feliz com seu interesse. Vou te passar nossa tabela de preços.',
    fromMe: true,
    timestamp: Math.floor(Date.now() / 1000) - 10080, // 2.8h atrás
    contactName: 'Maria Santos'
  },
  {
    chatId: '5548999312272@c.us',
    senderName: 'Maria Santos (Lead)',
    body: 'Perfeito! Quando podemos marcar uma reunião para fechar a proposta?',
    fromMe: false,
    timestamp: Math.floor(Date.now() / 1000) - 5400, // 1.5h atrás
    contactName: 'Maria Santos'
  },
  
  {
    chatId: '5548999312273@c.us',
    senderName: 'Carlos Tech',
    body: 'Preciso de ajuda com a integração da API',
    fromMe: false, 
    timestamp: Math.floor(Date.now() / 1000) - 14400, // 4h atrás
    contactName: 'Carlos Tech'
  },
  {
    chatId: '5548999312273@c.us',
    senderName: 'Bot',
    body: 'Claro Carlos! Vou te ajudar com a integração. Qual erro específico você está enfrentando?',
    fromMe: true,
    timestamp: Math.floor(Date.now() / 1000) - 12600, // 3.5h atrás
    contactName: 'Carlos Tech'
  },
  {
    chatId: '5548999312273@c.us',
    senderName: 'Carlos Tech',
    body: 'Obrigado! O problema é no endpoint de pagamentos, retorna erro 500',
    fromMe: false,
    timestamp: Math.floor(Date.now() / 1000) - 10800, // 3h atrás
    contactName: 'Carlos Tech'
  },
  
  {
    chatId: '5548999312274@c.us',
    senderName: 'Ana Startup',
    body: 'Boa tarde! Vocês fazem desenvolvimento de apps mobile?',
    fromMe: false,
    timestamp: Math.floor(Date.now() / 1000) - 3600, // 1h atrás
    contactName: 'Ana Startup'
  },
  
  {
    chatId: '5548999312275@c.us',
    senderName: 'Pedro Investidor',
    body: 'Recebi a proposta por email, vamos agendar para amanhã às 14h?',
    fromMe: false,
    timestamp: Math.floor(Date.now() / 1000) - 1800, // 30min atrás
    contactName: 'Pedro Investidor'
  },
  {
    chatId: '5548999312275@c.us',
    senderName: 'Bot',
    body: 'Perfeito Pedro! Agendado para amanhã às 14h. Te envio o link da reunião por aqui.',
    fromMe: true,
    timestamp: Math.floor(Date.now() / 1000) - 1080, // 18min atrás
    contactName: 'Pedro Investidor'
  }
];

async function exemploRelatorio() {
  console.log('🚀 Gerando exemplo de Relatório Empresarial...\n');
  
  try {
    // Lógica de fuso horário mais robusta para 'America/Sao_Paulo' (UTC-3)
    const now = new Date();
    const utcOffset = now.getTimezoneOffset() * 60000; // Offset do servidor em milissegundos
    const saoPauloOffset = -3 * 60 * 60000; // UTC-3 em milissegundos
    const nowInSaoPaulo = new Date(now.getTime() + utcOffset + saoPauloOffset);

    const reportDate = nowInSaoPaulo.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
    
    // Ajusta os timestamps para garantir que todos caiam no "hoje" de São Paulo
    const startOfTodaySaoPaulo = new Date(nowInSaoPaulo);
    startOfTodaySaoPaulo.setHours(0, 0, 0, 0);
    
    const adjustedMessages = mensagensExemplo.map(msg => {
        const originalOffset = Math.floor(Date.now() / 1000) - msg.timestamp;
        const newTimestamp = Math.floor(nowInSaoPaulo.getTime() / 1000) - originalOffset;
        // Garante que a mensagem não seja do futuro e esteja dentro do dia de hoje em SP
        return { ...msg, timestamp: Math.max(Math.floor(startOfTodaySaoPaulo.getTime() / 1000), newTimestamp) };
    });

    const relatorio = await createDailySummary(adjustedMessages, `HOJE (${reportDate}) - EXEMPLO`);
    console.log(relatorio);
    
    console.log('\n\n' + '='.repeat(60));
    console.log('📊 ESTE É O NOVO RELATÓRIO EMPRESARIAL!');
    console.log('='.repeat(60));
    console.log('\n✅ BENEFÍCIOS PARA O DONO DA EMPRESA:');
    console.log('• 🚨 Identifica situações críticas imediatamente');
    console.log('• 💰 Detecta oportunidades de negócio perdidas');
    console.log('• 📈 Mostra métricas de performance da equipe');
    console.log('• ⏰ Calcula tempo de resposta aos clientes');  
    console.log('• 🎯 Prioriza contatos que precisam de atenção');
    console.log('• 📊 Categoriza temas empresariais automaticamente');
    console.log('• 💡 Fornece insights para tomada de decisão');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

// Executa o exemplo
exemploRelatorio();
