// Script para testar comandos individualmente
require('dotenv').config();

async function testCommand() {
  console.log('=== TESTE DE COMANDO RELATORIO-EXECUTIVO ===');
  
  try {
    // Carregar dependências
    const db = require('./src/database');
    const comando = require('./src/commands/util/relatorio-executivo');
    
    console.log('✅ Dependências carregadas');
    console.log('✅ Comando carregado:', comando.name);
    
    // Verificar mensagens no banco
    const allMessages = await db.getAllMessages();
    console.log(`✅ Total de mensagens no banco: ${allMessages.length}`);
    
    if (allMessages.length === 0) {
      console.log('⚠️ Criando mensagens de teste...');
      
      // Adicionar algumas mensagens de teste
      const testMessages = [
        {
          id: 'test1',
          chatId: '554899931227@c.us',
          timestamp: Math.floor(Date.now() / 1000) - 3600, // 1 hora atrás
          isoTimestamp: new Date(Date.now() - 3600000).toISOString(),
          senderName: 'João Teste',
          type: 'chat',
          body: 'Olá, preciso de ajuda com o sistema',
          fromMe: false
        },
        {
          id: 'test2',
          chatId: '554899931227@c.us',
          timestamp: Math.floor(Date.now() / 1000) - 3000, // 50 min atrás
          isoTimestamp: new Date(Date.now() - 3000000).toISOString(),
          senderName: 'Bot Whts',
          type: 'chat',
          body: 'Olá! Como posso ajudar?',
          fromMe: true
        },
        {
          id: 'test3',
          chatId: '555555555555@c.us',
          timestamp: Math.floor(Date.now() / 1000) - 1800, // 30 min atrás
          isoTimestamp: new Date(Date.now() - 1800000).toISOString(),
          senderName: 'Maria Cliente',
          type: 'chat',
          body: 'Qual o preço do seu produto?',
          fromMe: false
        }
      ];
      
      for (const msg of testMessages) {
        await db.addMessage(msg);
      }
      
      console.log('✅ Mensagens de teste criadas');
    }
    
    // Verificar mensagens após inserção
    const finalMessages = await db.getAllMessages();
    console.log(`✅ Total final de mensagens: ${finalMessages.length}`);
    
    // Mostrar algumas mensagens
    console.log('\n📋 ÚLTIMAS MENSAGENS:');
    finalMessages.slice(-5).forEach(msg => {
      console.log(`- ${msg.senderName}: ${msg.body} (${new Date(msg.timestamp * 1000).toLocaleString('pt-BR')})`);
    });
    
    // Testar summarizer diretamente
    console.log('\n🔍 TESTANDO SUMMARIZER...');
    const { createDailySummary } = require('./src/summarizer');
    const summary = await createDailySummary(finalMessages, 'TESTE');
    
    console.log('\n📊 RESUMO GERADO:');
    console.log(summary);
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error(error.stack);
  }
}

testCommand();
