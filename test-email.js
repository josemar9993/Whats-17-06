const { sendDailySummary } = require('./src/emailer');
const logger = require('./src/logger');

// Dados de teste
const testChats = [
  {
    from: 'João Silva',
    body: 'Oi, tudo bem? Preciso do relatório até amanhã pela manhã.',
    timestamp: new Date().toISOString(),
    isFromMe: false
  },
  {
    from: 'Maria Santos',
    body: 'Reunião marcada para segunda-feira às 14h na sala de conferências',
    timestamp: new Date().toISOString(),
    isFromMe: false
  },
  {
    from: 'Pedro Costa',
    body: 'PENDENTE: revisar contrato antes da assinatura na próxima semana',
    timestamp: new Date().toISOString(),
    isFromMe: false
  }
];

async function testEmail() {
  try {
    logger.info('🧪 Iniciando teste de envio de e-mail...');
    
    const resultado = await sendDailySummary(testChats);
    
    logger.info('✅ Teste concluído!');
    logger.info('📧 Verifique sua caixa de e-mail');
    
  } catch (error) {
    logger.error('❌ Erro no teste:', error.message);
  }
}

testEmail();
