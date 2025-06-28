const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  tls: {
    rejectUnauthorized: false
  },
  timeout: 30000,
  connectionTimeout: 30000
});

async function testConnection() {
  try {
    console.log('🔄 Testando conexão SMTP...');
    await transporter.verify();
    console.log('✅ Conexão SMTP OK!');
    
    // Teste de envio simples
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_TO,
      subject: '🧪 Teste de Conexão',
      text: 'Este é um teste simples de envio de e-mail. Se você recebeu esta mensagem, a configuração está funcionando!'
    });
    
    console.log('✅ E-mail enviado:', info.messageId);
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

testConnection();
