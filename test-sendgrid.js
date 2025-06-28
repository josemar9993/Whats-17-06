const { sendEmailWithSendGrid } = require('./src/emailer-sendgrid');

async function testSendGrid() {
  console.log('🧪 Testando SendGrid...');
  
  const success = await sendEmailWithSendGrid(
    '🧪 Teste SendGrid', 
    'Este é um teste usando SendGrid.\n\nSe você recebeu este e-mail, a configuração está funcionando!'
  );
  
  if (success) {
    console.log('✅ SendGrid funcionando perfeitamente!');
  } else {
    console.log('❌ Erro no SendGrid. Verifique as configurações.');
  }
}

testSendGrid();
