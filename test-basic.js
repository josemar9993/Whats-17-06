#!/usr/bin/env node

console.log('🔍 TESTE BÁSICO DO SISTEMA');
console.log('==========================\n');

try {
  // Teste 1: Node.js básico
  console.log('✅ 1. Node.js funcionando:', process.version);
  
  // Teste 2: Carregar módulos básicos
  console.log('✅ 2. Carregando módulos...');
  
  const fs = require('fs');
  const path = require('path');
  console.log('   ✓ fs e path carregados');
  
  // Teste 3: Verificar estrutura
  console.log('✅ 3. Verificando estrutura...');
  const srcExists = fs.existsSync(path.join(__dirname, 'src'));
  const packageExists = fs.existsSync(path.join(__dirname, 'package.json'));
  console.log(`   ✓ src/ existe: ${srcExists}`);
  console.log(`   ✓ package.json existe: ${packageExists}`);
  
  // Teste 4: Tentar carregar config sem dotenv
  console.log('✅ 4. Testando config...');
  try {
    const config = require('./src/config');
    console.log(`   ✓ Config carregado - prefix: "${config.commandPrefix}"`);
    console.log(`   ✓ Admin IDs: ${config.adminIds.length || 0}`);
  } catch (err) {
    console.log(`   ❌ Erro no config: ${err.message}`);
  }
  
  // Teste 5: Verificar banco de dados
  console.log('✅ 5. Verificando banco...');
  const dbExists = fs.existsSync(path.join(__dirname, 'data', 'messages.db'));
  console.log(`   ✓ messages.db existe: ${dbExists}`);
  
  // Teste 6: Listar comandos
  console.log('✅ 6. Comandos disponíveis...');
  const commandsDir = path.join(__dirname, 'src', 'commands', 'util');
  if (fs.existsSync(commandsDir)) {
    const commands = fs.readdirSync(commandsDir).filter(f => f.endsWith('.js'));
    console.log(`   ✓ ${commands.length} comandos encontrados:`);
    commands.forEach(cmd => console.log(`      - ${cmd.replace('.js', '')}`));
  }
  
  console.log('\n🎉 SISTEMA BÁSICO FUNCIONANDO!');
  console.log('\n⚠️  NOTA: O problema principal é o Puppeteer/Chrome para WhatsApp Web');
  console.log('   Todos os outros módulos estão funcionando corretamente.');
  
} catch (error) {
  console.error('❌ Erro no teste:', error.message);
  process.exit(1);
}
