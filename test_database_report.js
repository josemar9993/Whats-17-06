// Test script to verify database and report functionality
const { getAllMessages, getMessagesByDateRange, getMessageStats, addMessage } = require('./src/database');
const { createDailySummary } = require('./src/summarizer');

async function testDatabaseAndReport() {
  console.log('🔍 Testing database and report functionality...\n');
  
  try {
    // Test database statistics
    console.log('1. Checking database statistics...');
    const stats = await getMessageStats();
    console.log('Database Stats:', stats);
    
    // If database is empty, add test data
    if (stats.total === 0) {
      console.log('\n2. Database is empty, adding test data...');
      const baseTime = Math.floor(Date.now() / 1000);
      
      const testMessages = [
        {
          id: 'msg_' + Date.now() + '_1',
          chatId: '551234567890@c.us',
          timestamp: baseTime - 3600, // 1 hour ago
          senderName: 'Cliente A',
          type: 'chat',
          body: 'Olá, preciso de ajuda com meu pedido. Quando vai ser entregue?',
          fromMe: false
        },
        {
          id: 'msg_' + Date.now() + '_2',
          chatId: '551234567890@c.us',
          timestamp: baseTime - 3500, // 58 minutes ago
          senderName: 'Atendente',
          type: 'chat',
          body: 'Olá! Vou verificar o status do seu pedido. Qual o número?',
          fromMe: true
        },
        {
          id: 'msg_' + Date.now() + '_3',
          chatId: '551234567890@c.us',
          timestamp: baseTime - 3400, // 56 minutes ago
          senderName: 'Cliente A',
          type: 'chat',
          body: 'É o pedido #12345',
          fromMe: false
        },
        {
          id: 'msg_' + Date.now() + '_4',
          chatId: '559876543210@c.us',
          timestamp: baseTime - 1800, // 30 minutes ago
          senderName: 'Cliente B',
          type: 'chat',
          body: 'Bom dia! Gostaria de fazer um orçamento para desenvolvimento de site',
          fromMe: false
        },
        {
          id: 'msg_' + Date.now() + '_5',
          chatId: '559876543210@c.us',
          timestamp: baseTime - 1700, // 28 minutes ago
          senderName: 'Vendedor',
          type: 'chat',
          body: 'Bom dia! Claro, vou te ajudar com isso. Que tipo de site você precisa?',
          fromMe: true
        },
        {
          id: 'msg_' + Date.now() + '_6',
          chatId: '555555555555@c.us',
          timestamp: baseTime - 600, // 10 minutes ago
          senderName: 'Cliente C',
          type: 'chat',
          body: 'Olá, estou com problema no sistema. Não consegui fazer login',
          fromMe: false
        }
      ];
      
      for (const msg of testMessages) {
        await addMessage(msg);
      }
      
      console.log(`✅ Added ${testMessages.length} test messages`);
    }
    
    // Test date range filtering
    console.log('\n3. Testing date range filtering...');
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 59, 999);
    
    console.log(`Date range: ${startOfToday.toISOString()} to ${endOfToday.toISOString()}`);
    
    const todayMessages = await getMessagesByDateRange(startOfToday, endOfToday);
    console.log(`✅ Found ${todayMessages.length} messages for today`);
    
    if (todayMessages.length > 0) {
      console.log('\n4. Testing report generation...');
      const report = await createDailySummary(todayMessages, 'TESTE');
      console.log('\n=== GENERATED REPORT ===');
      console.log(report);
      console.log('\n=== END REPORT ===');
    }
    
    // Test getting all messages
    console.log('\n5. Testing getAllMessages...');
    const allMessages = await getAllMessages();
    console.log(`✅ Total messages in database: ${allMessages.length}`);
    
    if (allMessages.length > 0) {
      const oldest = allMessages[0];
      const newest = allMessages[allMessages.length - 1];
      console.log(`📅 Oldest message: ${new Date(oldest.timestamp * 1000).toLocaleString('pt-BR')}`);
      console.log(`📅 Newest message: ${new Date(newest.timestamp * 1000).toLocaleString('pt-BR')}`);
    }
    
    // Final stats
    console.log('\n6. Final database statistics...');
    const finalStats = await getMessageStats();
    console.log('Final Stats:', finalStats);
    
    console.log('\n✅ All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during testing:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

testDatabaseAndReport();