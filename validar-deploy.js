const fs = require('fs');
const path = require('path');

console.log('🔍 VALIDAÇÃO DO SISTEMA DE DEPLOY');
console.log('================================');

// 1. Verificar arquivo deploy.js
const deployPath = './src/commands/util/deploy.js';
if (fs.existsSync(deployPath)) {
  console.log('✅ deploy.js encontrado');
  
  // Verificar tamanho do arquivo
  const stats = fs.statSync(deployPath);
  console.log(`📏 Tamanho: ${stats.size} bytes`);
  
  // Tentar carregar o módulo
  try {
    const deployCmd = require(deployPath);
    console.log('✅ deploy.js carregado com sucesso');
    console.log(`📋 Nome: ${deployCmd.name}`);
    console.log(`📋 Descrição: ${deployCmd.description}`);
    console.log(`🔧 Admin Only: ${deployCmd.adminOnly}`);
  } catch (error) {
    console.log(`❌ Erro ao carregar deploy.js: ${error.message}`);
  }
} else {
  console.log('❌ deploy.js não encontrado');
}

// 2. Verificar arquivo config.js
const configPath = './src/config.js';
if (fs.existsSync(configPath)) {
  console.log('✅ config.js encontrado');
  
  try {
    const config = require(configPath);
    console.log('✅ config.js carregado com sucesso');
    console.log(`🔧 Admin IDs: ${config.adminIds}`);
    console.log(`🔧 Command Prefix: ${config.commandPrefix}`);
  } catch (error) {
    console.log(`❌ Erro ao carregar config.js: ${error.message}`);
  }
} else {
  console.log('❌ config.js não encontrado');
}

// 3. Verificar .env
const envPath = './.env';
if (fs.existsSync(envPath)) {
  console.log('✅ .env encontrado');
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  if (envContent.includes('5581984079371')) {
    console.log('✅ Admin ID correto configurado');
  } else {
    console.log('⚠️ Admin ID pode estar incorreto');
  }
  
  if (envContent.includes('DEBUG=true')) {
    console.log('✅ Debug habilitado');
  } else {
    console.log('⚠️ Debug desabilitado');
  }
} else {
  console.log('❌ .env não encontrado');
}

// 4. Verificar script de deploy
const scriptPath = './deploy-whatsapp.sh';
if (fs.existsSync(scriptPath)) {
  console.log('✅ deploy-whatsapp.sh encontrado');
  
  const stats = fs.statSync(scriptPath);
  console.log(`📏 Tamanho: ${stats.size} bytes`);
  
  // Verificar se é executável
  if (stats.mode & parseInt('0111', 8)) {
    console.log('✅ Script é executável');
  } else {
    console.log('⚠️ Script não é executável');
  }
} else {
  console.log('❌ deploy-whatsapp.sh não encontrado');
}

console.log('');
console.log('🎯 RESUMO:');
console.log('- Sistema de deploy configurado');
console.log('- Admin: 5581984079371');
console.log('- Comandos: !deploy test, !deploy servidor');
console.log('');
console.log('📱 PRÓXIMOS PASSOS:');
console.log('1. npm run dev (iniciar bot)');
console.log('2. Escanear QR code');
console.log('3. Enviar: !deploy test');
console.log('4. Se OK: !deploy servidor');
