#!/usr/bin/env node

/**
 * VERIFICAÇÃO RÁPIDA DO SISTEMA
 * Script otimizado para verificar apenas os componentes essenciais
 */

console.log('🔍 VERIFICAÇÃO RÁPIDA DO SISTEMA');
console.log('===============================\n');

const fs = require('fs');
const path = require('path');

// Contadores
let ok = 0;
let erros = 0;
const problemas = [];

function check(nome, test) {
  process.stdout.write(`${nome}... `);
  try {
    if (test()) {
      console.log('✅ OK');
      ok++;
    } else {
      console.log('❌ ERRO');
      erros++;
      problemas.push(nome);
    }
  } catch (error) {
    console.log(`❌ ERRO: ${error.message}`);
    erros++;
    problemas.push(`${nome}: ${error.message}`);
  }
}

function verificarSistema() {
  console.log('🚀 Verificando componentes essenciais...\n');

  // 1. Node.js
  check('Node.js versão', () => {
    const version = parseInt(process.version.replace('v', '').split('.')[0]);
    return version >= 16;
  });

  // 2. Estrutura básica
  check('Estrutura de diretórios', () => {
    const dirs = ['src', 'data', 'logs'];
    dirs.forEach(dir => {
      const dirPath = path.join(__dirname, dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
    });
    return true;
  });

  // 3. Arquivos essenciais
  check('package.json', () => fs.existsSync('./package.json'));
  check('.env', () => fs.existsSync('./.env'));
  check('src/index.js', () => fs.existsSync('./src/index.js'));
  check('src/config.js', () => fs.existsSync('./src/config.js'));

  // 4. Módulos principais
  check('Config carrega', () => {
    try {
      require('./src/config');
      return true;
    } catch (e) {
      return false;
    }
  });

  check('Logger carrega', () => {
    try {
      require('./src/logger');
      return true;
    } catch (e) {
      return false;
    }
  });

  check('Database carrega', () => {
    try {
      require('./src/database');
      return true;
    } catch (e) {
      return false;
    }
  });

  // 5. Comandos
  check('Comandos disponíveis', () => {
    try {
      const commandsPath = path.join(__dirname, 'src/commands');
      if (!fs.existsSync(commandsPath)) return false;
      
      const folders = fs.readdirSync(commandsPath);
      let totalCommands = 0;
      
      folders.forEach(folder => {
        const folderPath = path.join(commandsPath, folder);
        if (fs.statSync(folderPath).isDirectory()) {
          const commands = fs.readdirSync(folderPath).filter(f => f.endsWith('.js'));
          totalCommands += commands.length;
        }
      });
      
      return totalCommands > 0;
    } catch (e) {
      return false;
    }
  });

  // 6. Dependências críticas
  check('Dependências', () => {
    const deps = ['express', 'winston', 'sqlite3', 'dotenv'];
    
    for (const dep of deps) {
      try {
        require(dep);
      } catch (e) {
        return false;
      }
    }
    return true;
  });

  // 7. WhatsApp-web.js
  check('WhatsApp-web.js', () => {
    try {
      require('whatsapp-web.js');
      return true;
    } catch (e) {
      return false;
    }
  });

  // 8. Deploy configs
  check('Configs de deploy', () => {
    return fs.existsSync('./ecosystem.config.js') && fs.existsSync('./.env.example');
  });

  // Relatório final
  console.log('\n' + '='.repeat(40));
  console.log('📊 RELATÓRIO RÁPIDO');
  console.log('='.repeat(40));
  console.log(`✅ Componentes OK: ${ok}`);
  console.log(`❌ Problemas: ${erros}`);
  console.log(`📈 Taxa de sucesso: ${((ok / (ok + erros)) * 100).toFixed(1)}%`);

  if (problemas.length > 0) {
    console.log('\n🚨 PROBLEMAS:');
    problemas.forEach((problema, index) => {
      console.log(`${index + 1}. ${problema}`);
    });
  }

  if (erros === 0) {
    console.log('\n🎉 SISTEMA FUNCIONANDO!');
    console.log('✨ Todos os componentes essenciais estão OK.');
  } else if (erros <= 2) {
    console.log('\n⚠️  SISTEMA FUNCIONAL COM PEQUENOS PROBLEMAS');
    console.log('💡 Pode funcionar mas requer alguns ajustes.');
  } else {
    console.log('\n🚨 SISTEMA REQUER CORREÇÕES');
    console.log('🔧 Corrija os problemas antes de usar.');
  }

  console.log('\n📋 PRÓXIMOS PASSOS:');
  console.log('1. Configure arquivo .env');
  console.log('2. Execute: npm start');
  console.log('3. Acesse: http://localhost:8080/health');

  console.log('\n✅ Verificação concluída!');
}

// Executar verificação
verificarSistema();
