const nodemailer = require('nodemailer');
require('dotenv').config();

async function testAlternativeProviders() {
  const configs = [
    {
      name: 'Gmail Porta 2525',
      config: {
        host: 'smtp.gmail.com',
        port: 2525,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        },
        tls: { rejectUnauthorized: false }
      }
    },
    {
      name: 'Gmail Porta 25',
      config: {
        host: 'smtp.gmail.com',
        port: 25,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        },
        tls: { rejectUnauthorized: false }
      }
    }
  ];

  for (const { name, config } of configs) {
    try {
      console.log(`🔄 Testando ${name}...`);
      const transporter = nodemailer.createTransport(config);
      await transporter.verify();
      console.log(`✅ ${name} - Conexão OK!`);
      
      const info = await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_TO,
        subject: `🧪 Teste ${name}`,
        text: `Teste bem-sucedido usando ${name}`
      });
      
      console.log(`✅ ${name} - E-mail enviado:`, info.messageId);
      break;
      
    } catch (error) {
      console.log(`❌ ${name} - Erro:`, error.message);
    }
  }
}

testAlternativeProviders();
