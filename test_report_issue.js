// Test script to reproduce the zero values issue in the report
const { createDailySummary } = require('./src/summarizer');
const { getAllMessages, addMessage } = require('./src/database');

async function testReportIssue() {
  console.log('Testing report issue...');
  
  try {
    // Check if database is empty
    const allMessages = await getAllMessages();
    console.log(`Total messages in database: ${allMessages.length}`);
    
    if (allMessages.length === 0) {
      console.log('Database is empty. Adding test messages...');
      
      // Add some test messages
      const testMessages = [
        {
          id: 'msg1',
          chatId: '123456789@c.us',
          timestamp: Math.floor(Date.now() / 1000),
          isoTimestamp: new Date().toISOString(),
          senderName: 'Test User',
          type: 'chat',
          body: 'Hello, this is a test message',
          fromMe: false
        },
        {
          id: 'msg2',
          chatId: '123456789@c.us',
          timestamp: Math.floor(Date.now() / 1000),
          isoTimestamp: new Date().toISOString(),
          senderName: 'Bot',
          type: 'chat',
          body: 'This is a response',
          fromMe: true
        },
        {
          id: 'msg3',
          chatId: '987654321@c.us',
          timestamp: Math.floor(Date.now() / 1000),
          isoTimestamp: new Date().toISOString(),
          senderName: 'Another User',
          type: 'chat',
          body: 'Another conversation',
          fromMe: false
        }
      ];
      
      for (const msg of testMessages) {
        await addMessage(msg);
      }
      
      console.log('Added test messages');
    }
    
    // Now test the report generation
    const updatedMessages = await getAllMessages();
    console.log(`Total messages after addition: ${updatedMessages.length}`);
    
    const report = await createDailySummary(updatedMessages, 'TEST');
    console.log('\n=== GENERATED REPORT ===');
    console.log(report);
    
  } catch (error) {
    console.error('Error testing report:', error);
  }
}

testReportIssue();