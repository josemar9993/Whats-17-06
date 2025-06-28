const net = require('net');

function testPort(host, port) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    
    socket.setTimeout(5000);
    
    socket.on('connect', () => {
      console.log(`✅ Porta ${port} está acessível`);
      socket.destroy();
      resolve(true);
    });
    
    socket.on('timeout', () => {
      console.log(`❌ Porta ${port} - Timeout`);
      socket.destroy();
      resolve(false);
    });
    
    socket.on('error', (err) => {
      console.log(`❌ Porta ${port} - Erro:`, err.message);
      resolve(false);
    });
    
    socket.connect(port, host);
  });
}

async function checkFirewall() {
  console.log('🔍 Verificando conectividade com portas SMTP...');
  
  const ports = [25, 465, 587];
  const host = 'smtp.gmail.com';
  
  for (const port of ports) {
    await testPort(host, port);
  }
}

checkFirewall();
