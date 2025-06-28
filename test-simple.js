require('dotenv').config();

async function testSimple() {
  console.log('=== TESTE SIMPLES DE EMAIL ===');
  console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'Configurado' : 'NÃO configurado');
  console.log('EMAIL_TO:', process.env.EMAIL_TO ? 'Configurado' : 'NÃO configurado');
  console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? 'Configurado' : 'NÃO configurado');
  
  try {
    const nodemailer = require('nodemailer');
    console.log('✅ Nodemailer carregado');
    
    // Configuração simples do Gmail
    const transporter = nodemailer.createTransporter({
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
      subject: '🎉 Bot WhatsApp - Sistema de Email Funcionando!',
      text: `Teste realizado em: ${new Date().toLocaleString('pt-BR')}

Este email confirma que:
✅ O bot está rodando
✅ O firewall está configurado  
✅ As credenciais do Gmail estão corretas
✅ O sistema de resumos deve funcionar normalmente

Próximo resumo às 16:00 (horário de Brasília).`
    });
    
    console.log('✅ EMAIL ENVIADO COM SUCESSO!');
    console.log('Message ID:', info.messageId);
    console.log('Verifique sua caixa de entrada:', process.env.EMAIL_TO);
    
  } catch (error) {
    console.log('❌ ERRO ao enviar email:');
    console.log('Mensagem:', error.message);
    console.log('Código:', error.code);
    
    if (error.message.includes('invalid login')) {
      console.log('\n💡 SOLUÇÃO: Verifique se a senha é de APLICATIVO, não a senha normal do Gmail');
    }
    if (error.message.includes('timeout')) {
      console.log('\n💡 SOLUÇÃO: Problema de conectividade - verifique firewall');
    }
  }
  
  process.exit(0);
}

testSimple();
