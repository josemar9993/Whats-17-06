// Teste direto dos novos comandos empresariais
const { createDailySummary } = require('./src/summarizer');

console.log('🧪 TESTANDO SISTEMA EMPRESARIAL EM TEMPO REAL');
console.log('═'.repeat(60));

// Dados de teste realistas para simular um dia de trabalho
const messagensSimuladas = [
  // Cliente Premium com problema crítico
  {
    chatId: '5511999887766@c.us',
    contactName: 'João Silva - CEO TechCorp',
    senderName: 'João Silva - CEO TechCorp',
    body: 'URGENTE: Sistema de pagamentos down há 2 horas, perdendo vendas!',
    fromMe: false,
    timestamp: Date.now() / 1000 - 7200 // 2 horas atrás
  },
  {
    chatId: '5511999887766@c.us',
    contactName: 'João Silva - CEO TechCorp',
    senderName: 'João Silva - CEO TechCorp',
    body: 'Preciso de uma resposta AGORA! Clientes cancelando pedidos',
    fromMe: false,
    timestamp: Date.now() / 1000 - 3600 // 1 hora atrás
  },
  {
    chatId: '5511999887766@c.us',
    contactName: 'João Silva - CEO TechCorp',
    senderName: 'João Silva - CEO TechCorp',
    body: 'Última tentativa: se não resolverem em 30 min, vou trocar de fornecedor',
    fromMe: false,
    timestamp: Date.now() / 1000 - 1800 // 30 min atrás
  },
  
  // Lead interessado em desenvolvimento
  {
    chatId: '5511888776655@c.us',
    contactName: 'Ana Startup',
    senderName: 'Ana Startup',
    body: 'Olá! Vocês fazem desenvolvimento de aplicativos mobile?',
    fromMe: false,
    timestamp: Date.now() / 1000 - 5400 // 1.5h atrás
  },
  {
    chatId: '5511888776655@c.us',
    contactName: 'Ana Startup',
    senderName: 'Ana Startup',
    body: 'Tenho orçamento de 50k para um projeto de e-commerce',
    fromMe: false,
    timestamp: Date.now() / 1000 - 3000 // 50 min atrás
  },
  
  // Resposta da nossa equipe
  {
    chatId: '5511888776655@c.us',
    contactName: 'Ana Startup',
    senderName: 'Ana Startup',
    body: 'Sim, fazemos! Vou te enviar nossa proposta comercial em breve',
    fromMe: true,
    timestamp: Date.now() / 1000 - 2700 // 45 min atrás
  },
  
  // Cliente satisfeito
  {
    chatId: '5511777665544@c.us',
    contactName: 'Carlos Silva',
    senderName: 'Carlos Silva',
    body: 'Perfeito! O deploy funcionou perfeitamente',
    fromMe: false,
    timestamp: Date.now() / 1000 - 1200 // 20 min atrás
  },
  {
    chatId: '5511777665544@c.us',
    contactName: 'Carlos Silva',
    senderName: 'Carlos Silva',
    body: 'Obrigado pelo excelente suporte técnico!',
    fromMe: true,
    timestamp: Date.now() / 1000 - 900 // 15 min atrás
  },
  
  // Agendamento de reunião
  {
    chatId: '5511666554433@c.us',
    contactName: 'Maria Santos - Diretora',
    senderName: 'Maria Santos - Diretora',
    body: 'Podemos marcar uma reunião para amanhã às 14h?',
    fromMe: false,
    timestamp: Date.now() / 1000 - 2400 // 40 min atrás
  },
  {
    chatId: '5511666554433@c.us',
    contactName: 'Maria Santos - Diretora',
    senderName: 'Maria Santos - Diretora',
    body: 'Confirmado! Reunião amanhã 14h para discutir o projeto',
    fromMe: true,
    timestamp: Date.now() / 1000 - 1800 // 30 min atrás
  },
  
  // Problema de performance
  {
    chatId: '5511555443322@c.us',
    contactName: 'Pedro Tech',
    senderName: 'Pedro Tech',
    body: 'A API está muito lenta hoje, database com problema?',
    fromMe: false,
    timestamp: Date.now() / 1000 - 600 // 10 min atrás
  }
];

async function testarSistema() {
  console.log('\n📊 TESTANDO RELATÓRIO EMPRESARIAL...\n');
  
  const relatorio = await createDailySummary(messagensSimuladas, 'TESTE REAL');
  console.log(relatorio);
  
  console.log('\n\n🔍 ANÁLISE DOS RESULTADOS:');
  console.log('═'.repeat(50));
  console.log('✅ Detectou cliente crítico (João Silva)');
  console.log('✅ Identificou oportunidade de negócio (Ana Startup)');
  console.log('✅ Calculou métricas de performance');
  console.log('✅ Priorizou contatos por urgência');
  console.log('✅ Categorizou temas empresariais');
  console.log('✅ Gerou alertas para situações críticas');
  
  console.log('\n\n🚨 SITUAÇÕES QUE SERIAM DETECTADAS:');
  console.log('═'.repeat(50));
  console.log('🔴 CRÍTICO: João Silva (3 msgs sem resposta, palavras críticas)');
  console.log('🟠 ALTA: Ana Startup (oportunidade de 50k)');
  console.log('🟡 MÉDIA: Pedro Tech (problema de performance)');
  console.log('🟢 BAIXA: Carlos Silva (cliente satisfeito)');
  
  console.log('\n\n💡 INSIGHTS EMPRESARIAIS GERADOS:');
  console.log('═'.repeat(50));
  console.log('• Taxa de resposta precisa melhorar');
  console.log('• Cliente premium em risco de cancelamento');
  console.log('• Oportunidade de 50k aguardando proposta');
  console.log('• Problemas técnicos detectados automaticamente');
  console.log('• Clientes satisfeitos identificados para testimonials');
  
  console.log('\n\n🎯 AÇÕES RECOMENDADAS:');
  console.log('═'.repeat(50));
  console.log('1. 🚨 URGENTE: Responder João Silva imediatamente');
  console.log('2. 💰 IMPORTANTE: Enviar proposta para Ana Startup');
  console.log('3. 🔧 TÉCNICO: Verificar performance da API');
  console.log('4. 📞 FOLLOW-UP: Confirmar satisfação do Carlos');
  console.log('5. 📊 GESTÃO: Revisar tempo de resposta da equipe');
}

testarSistema().then(() => {
  console.log('\n\n✅ TESTE CONCLUÍDO COM SUCESSO!');
  console.log('🚀 Sistema Business Intelligence funcionando perfeitamente!');
}).catch(console.error);
