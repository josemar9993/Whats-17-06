require('dotenv').config();
const nodemailer = require('nodemailer');

async function testSMTPConnectivity() {
  console.log('=== TESTE DE CONECTIVIDADE SMTP ===\n');
  
  const configs = [
    {
      name: 'Gmail SMTP TLS (587)',
      config: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        },
        connectionTimeout: 10000,
        greetingTimeout: 5000,
        socketTimeout: 10000
      }
    },
    {
      name: 'Gmail SMTP SSL (465)',
      config: {
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        },
        connectionTimeout: 10000,
        greetingTimeout: 5000,
        socketTimeout: 10000
      }
    }
  ];

  for (const testConfig of configs) {
    console.log(`Testando: ${testConfig.name}`);
    
    try {
      const transporter = nodemailer.createTransporter(testConfig.config);
      
      console.log('  - Verificando conexão...');
      await transporter.verify();
      console.log('  ✅ Conexão OK!');
      
      console.log('  - Enviando email de teste...');
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_TO,
        subject: 'Teste de Conectividade SMTP - Bot WhatsApp',
        text: `Teste realizado em ${new Date().toLocaleString()} usando ${testConfig.name}\n\nSe você recebeu este email, o sistema de resumos está funcionando!`
      });
      console.log('  ✅ Email enviado com sucesso!\n');
      
      return true;
      
    } catch (error) {
      console.log(`  ❌ Erro: ${error.message}`);
      console.log(`  Code: ${error.code || 'N/A'}`);
      console.log(`  Command: ${error.command || 'N/A'}\n`);
    }
  }
  
  return false;
}

async function testTCPConnection(host, port) {
  return new Promise((resolve) => {
    const net = require('net');
    const socket = new net.Socket();
    
    const timeout = setTimeout(() => {
      socket.destroy();
      resolve(false);
    }, 5000);
    
    socket.connect(port, host, () => {
      clearTimeout(timeout);
      socket.destroy();
      resolve(true);
    });
    
    socket.on('error', () => {
      clearTimeout(timeout);
      resolve(false);
    });
  });
}

async function runAllTests() {
  console.log('Iniciando testes de conectividade...\n');
  
  // Teste TCP
  console.log('=== TESTE DE CONECTIVIDADE TCP ===');
  const ports = [
    { port: 587, name: 'SMTP TLS' },
    { port: 465, name: 'SMTP SSL' }
  ];
  
  for (const { port, name } of ports) {
    const canConnect = await testTCPConnection('smtp.gmail.com', port);
    console.log(`${name} (${port}): ${canConnect ? '✅ OK' : '❌ Bloqueado'}`);
  }
  
  console.log('');
  
  // Teste SMTP completo
  const smtpWorking = await testSMTPConnectivity();
  
  if (!smtpWorking) {
    console.log('❌ SMTP não está funcionando.');
    console.log('\nVerifique:');
    console.log('1. Credenciais do Gmail no .env');
    console.log('2. Senha deve ser de aplicativo, não a senha normal');
  } else {
    console.log('✅ Tudo funcionando! Os resumos devem chegar no email.');
  }
  
  process.exit(0);
}

runAllTests().catch(console.error);
