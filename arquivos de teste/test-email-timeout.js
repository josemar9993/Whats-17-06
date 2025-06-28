require('dotenv').config();

async function testEmailTimeout() {
  console.log('=== TESTE COM TIMEOUT ===');
  
  try {
    const nodemailer = require('nodemailer');
    
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      },
      connectionTimeout: 10000,   // 10 segundos
      greetingTimeout: 5000,      // 5 segundos  
      socketTimeout: 10000        // 10 segundos
    });
    
    console.log('Enviando com timeout curto...');
    
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_TO,
      subject: 'Teste Timeout - Bot WhatsApp',
      text: 'Teste com timeout configurado!'
    });
    
    console.log('✅ EMAIL ENVIADO!');
    console.log('ID:', info.messageId);
    
  } catch (error) {
    console.log('❌ Erro:', error.message);
    console.log('Código:', error.code || 'N/A');
    
    if (error.code === 'ETIMEDOUT' || error.code === 'ECONNRESET') {
      console.log('💡 Problema de conectividade - firewall pode estar bloqueando');
    } else if (error.responseCode === 535) {
      console.log('💡 Problema de autenticação - verificar senha de aplicativo');
    }
  }
  
  process.exit(0);
}

testEmailTimeout();
