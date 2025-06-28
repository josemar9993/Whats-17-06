require('dotenv').config();

async function testEmailFinal() {
  console.log('=== TESTE FINAL DE EMAIL ===');
  console.log('EMAIL_USER:', process.env.EMAIL_USER);
  console.log('EMAIL_TO:', process.env.EMAIL_TO);
  
  try {
    const nodemailer = require('nodemailer');
    console.log('✅ Nodemailer carregado');
    
    // NOME CORRETO: createTransport (sem 'er' no final)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      },
      tls: {
        rejectUnauthorized: false
      }
    });
    
    console.log('✅ Transporter criado');
    console.log('Enviando email de teste...');
    
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_TO,
      subject: '🎉 FUNCIONOU! Bot WhatsApp Email OK',
      text: `SUCESSO! Email enviado em: ${new Date().toLocaleString('pt-BR')}

✅ Bot funcionando
✅ Firewall configurado  
✅ Nodemailer corrigido (createTransport, não createTransporter!)
✅ Credenciais Gmail OK

Os resumos diários devem funcionar normalmente às 16:00 BRT!`
    });
    
    console.log('🎉 EMAIL ENVIADO COM SUCESSO!');
    console.log('Message ID:', info.messageId);
    console.log('Verifique sua caixa de entrada!');
    
  } catch (error) {
    console.log('❌ Erro:', error.message);
    if (error.code) console.log('Código:', error.code);
  }
  
  process.exit(0);
}

testEmailFinal();
