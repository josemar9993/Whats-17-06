#!/usr/bin/env node

/**
 * TESTE DE COMANDOS WHATSAPP
 * Simula execução de comandos para verificar se estão funcionando
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 TESTE DE COMANDOS WHATSAPP BOT');
console.log('=================================\n');

// Mock objects para simular WhatsApp
const mockMessage = {
  body: '',
  from: '5511999999999@c.us',
  chat: {
    id: {
      server: 'c.us',
      user: '5511999999999',
      _serialized: '5511999999999@c.us'
    },
    name: 'Chat Teste'
  },
  reply: async (text) => {
    console.log(`📤 RESPOSTA: ${text.substring(0, 100)}${text.length > 100 ? '...' : ''}`);
    return Promise.resolve();
  }
};

const mockClient = {
  startTime: Date.now() - 3600000, // 1 hora atrás
  info: {
    displayName: 'Bot Teste',
    platform: 'WhatsApp Business'
  }
};

async function testCommand(commandName) {
  try {
    const commandPath = path.join(__dirname, 'src', 'commands', 'util', `${commandName}.js`);
    
    if (!fs.existsSync(commandPath)) {
      console.log(`❌ Comando ${commandName} não encontrado`);
      return false;
    }

    const command = require(commandPath);
    
    if (!command.execute || typeof command.execute !== 'function') {
      console.log(`❌ Comando ${commandName} não tem função execute`);
      return false;
    }

    console.log(`🔍 Testando comando: ${commandName}`);
    
    // Simular execução do comando
    mockMessage.body = `!${commandName}`;
    
    await command.execute(mockMessage, [], mockClient);
    
    console.log(`✅ Comando ${commandName} executado com sucesso\n`);
    return true;
    
  } catch (error) {
    console.log(`❌ Erro no comando ${commandName}: ${error.message}\n`);
    return false;
  }
}

async function runTests() {
  console.log('📋 Listando comandos disponíveis...\n');
  
  const commandsDir = path.join(__dirname, 'src', 'commands', 'util');
  
  if (!fs.existsSync(commandsDir)) {
    console.log('❌ Diretório de comandos não encontrado');
    return;
  }

  const commandFiles = fs.readdirSync(commandsDir)
    .filter(file => file.endsWith('.js'))
    .map(file => file.replace('.js', ''));

  console.log(`📊 Total de comandos encontrados: ${commandFiles.length}`);
  console.log('Comandos:', commandFiles.join(', '));
  console.log('\n' + '='.repeat(50) + '\n');

  let successCount = 0;
  let totalCount = commandFiles.length;

  // Teste comandos básicos primeiro
  const basicCommands = ['ping', 'ajuda', 'versao', 'uptime'];
  const complexCommands = commandFiles.filter(cmd => !basicCommands.includes(cmd));

  console.log('🧪 TESTANDO COMANDOS BÁSICOS:\n');
  for (const command of basicCommands) {
    if (commandFiles.includes(command)) {
      const success = await testCommand(command);
      if (success) successCount++;
      await new Promise(resolve => setTimeout(resolve, 100)); // Pequena pausa
    }
  }

  console.log('🧪 TESTANDO COMANDOS AVANÇADOS:\n');
  for (const command of complexCommands) {
    const success = await testCommand(command);
    if (success) successCount++;
    await new Promise(resolve => setTimeout(resolve, 100)); // Pequena pausa
  }

  // Resumo final
  console.log('='.repeat(50));
  console.log('📊 RESUMO DOS TESTES:');
  console.log(`✅ Comandos funcionando: ${successCount}/${totalCount}`);
  console.log(`📈 Taxa de sucesso: ${((successCount/totalCount) * 100).toFixed(1)}%`);
  
  if (successCount === totalCount) {
    console.log('\n🎉 TODOS OS COMANDOS ESTÃO FUNCIONANDO! 🎉');
  } else {
    console.log(`\n⚠️  ${totalCount - successCount} comando(s) com problemas`);
  }

  console.log('\n📋 COMANDOS TESTADOS:');
  commandFiles.forEach(cmd => {
    console.log(`   ${cmd}`);
  });

  console.log('\n✅ TESTE DE COMANDOS CONCLUÍDO!');
}

// Executar testes
runTests().catch(error => {
  console.error('❌ Erro durante os testes:', error.message);
  process.exit(1);
});
