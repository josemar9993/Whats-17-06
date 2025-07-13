#!/usr/bin/env node

/**
 * AVALIAÇÃO E CORREÇÃO COMPLETA DO PROJETO
 * Script para avaliar e corrigir todos os problemas do WhatsApp Bot Enterprise
 */

console.log('🔍 AVALIAÇÃO COMPLETA DO PROJETO WHATSAPP BOT ENTERPRISE');
console.log('========================================================\n');

const fs = require('fs');
const path = require('path');

// Contadores
let ok = 0;
let warnings = 0;
let errors = 0;
const problemas = [];
const correcoes = [];

function log(level, message, details = '') {
  const timestamp = new Date().toLocaleTimeString();
  const icon = level === 'OK' ? '✅' : level === 'WARNING' ? '⚠️' : '❌';
  console.log(`[${timestamp}] ${icon} ${message}${details ? ': ' + details : ''}`);
}

function check(nome, test, autofix = null) {
  process.stdout.write(`${nome}... `);
  try {
    const result = test();
    if (result === true) {
      console.log('✅ OK');
      ok++;
    } else if (result === 'WARNING') {
      console.log('⚠️  WARNING');
      warnings++;
      problemas.push(`WARNING: ${nome}`);
    } else {
      console.log('❌ ERRO');
      errors++;
      problemas.push(nome);
      
      // Tentar correção automática se disponível
      if (autofix && typeof autofix === 'function') {
        try {
          autofix();
          correcoes.push(nome);
          console.log(`   🔧 Correção automática aplicada para: ${nome}`);
        } catch (fixError) {
          console.log(`   ❌ Falha na correção automática: ${fixError.message}`);
        }
      }
    }
  } catch (error) {
    console.log(`❌ ERRO: ${error.message}`);
    errors++;
    problemas.push(`${nome}: ${error.message}`);
  }
}

function avaliacao() {
  console.log('🚀 Iniciando avaliação completa...\n');

  // ===========================================
  // 1. VERIFICAÇÕES BÁSICAS DO AMBIENTE
  // ===========================================
  console.log('📁 1. AMBIENTE E ESTRUTURA');
  console.log('─'.repeat(40));

  check('Node.js versão >= 16', () => {
    const version = parseInt(process.version.replace('v', '').split('.')[0]);
    return version >= 16;
  });

  check('Estrutura de diretórios', () => {
    const requiredDirs = ['src', 'data', 'logs', 'auth_data'];
    let missing = [];
    
    requiredDirs.forEach(dir => {
      const dirPath = path.join(__dirname, dir);
      if (!fs.existsSync(dirPath)) {
        missing.push(dir);
      }
    });
    
    return missing.length === 0 ? true : false;
  }, () => {
    // Auto-fix: criar diretórios
    const requiredDirs = ['src', 'data', 'logs', 'auth_data'];
    requiredDirs.forEach(dir => {
      const dirPath = path.join(__dirname, dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
    });
  });

  check('package.json válido', () => {
    if (!fs.existsSync('./package.json')) return false;
    try {
      const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
      return pkg.name && pkg.version && pkg.main;
    } catch (e) {
      return false;
    }
  });

  check('Arquivo .env configurado', () => {
    if (!fs.existsSync('./.env')) return false;
    const env = fs.readFileSync('./.env', 'utf8');
    
    // Verificar configurações críticas
    const required = [
      'WHATSAPP_ADMIN_NUMBER',
      'EMAIL_USER',
      'EMAIL_PASS',
      'EMAIL_TO'
    ];
    
    let hasDefaultValues = false;
    required.forEach(key => {
      if (env.includes(`${key}=seu`) || env.includes(`${key}=sua_`) || env.includes(`${key}=destino`)) {
        hasDefaultValues = true;
      }
    });
    
    return hasDefaultValues ? 'WARNING' : true;
  });

  // ===========================================
  // 2. VERIFICAÇÕES DO CÓDIGO FONTE
  // ===========================================
  console.log('\n💻 2. CÓDIGO FONTE');
  console.log('─'.repeat(40));

  check('src/index.js principal', () => fs.existsSync('./src/index.js'));
  check('src/config.js', () => fs.existsSync('./src/config.js'));
  check('src/logger.js', () => fs.existsSync('./src/logger.js'));
  check('src/database.js', () => fs.existsSync('./src/database.js'));

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
      
      log('INFO', `Total de comandos encontrados: ${totalCommands}`);
      return totalCommands >= 10; // Espera pelo menos 10 comandos
    } catch (e) {
      return false;
    }
  });

  check('Módulos carregam sem erro', () => {
    const modules = ['./src/config', './src/logger', './src/database'];
    
    for (const mod of modules) {
      try {
        delete require.cache[require.resolve(mod)];
        require(mod);
      } catch (e) {
        log('ERROR', `Erro ao carregar ${mod}`, e.message);
        return false;
      }
    }
    return true;
  });

  // ===========================================
  // 3. DEPENDÊNCIAS E BIBLIOTECAS
  // ===========================================
  console.log('\n📦 3. DEPENDÊNCIAS');
  console.log('─'.repeat(40));

  check('Dependências críticas instaladas', () => {
    const criticalDeps = [
      'express', 'winston', 'sqlite3', 'dotenv', 
      'whatsapp-web.js', 'qrcode-terminal', 'node-cron'
    ];
    
    for (const dep of criticalDeps) {
      try {
        require(dep);
      } catch (e) {
        log('ERROR', `Dependência faltando: ${dep}`);
        return false;
      }
    }
    return true;
  });

  check('WhatsApp-web.js funcional', () => {
    try {
      const { Client } = require('whatsapp-web.js');
      return typeof Client === 'function';
    } catch (e) {
      return false;
    }
  });

  // ===========================================
  // 4. CONFIGURAÇÕES DE DEPLOY
  // ===========================================
  console.log('\n🚀 4. CONFIGURAÇÕES DE DEPLOY');
  console.log('─'.repeat(40));

  check('ecosystem.config.js (PM2)', () => fs.existsSync('./ecosystem.config.js'));
  check('deploy-digitalocean.sh', () => fs.existsSync('./deploy-digitalocean.sh'));
  check('Dockerfile presente', () => fs.existsSync('./Dockerfile'));
  check('.env.example atualizado', () => fs.existsSync('./.env.example'));

  // ===========================================
  // 5. QUALIDADE DO CÓDIGO
  // ===========================================
  console.log('\n🔍 5. QUALIDADE DO CÓDIGO');
  console.log('─'.repeat(40));

  check('ESLint configurado', () => {
    return fs.existsSync('./eslint.config.js') || fs.existsSync('./.eslintrc.jsonc');
  });

  check('Prettier configurado', () => fs.existsSync('./.prettierrc'));

  check('Testes configurados', () => {
    return fs.existsSync('./jest.setup.js') && fs.existsSync('./src/__tests__');
  });

  check('Git hooks (Husky)', () => fs.existsSync('./.husky'));

  // ===========================================
  // 6. DOCUMENTAÇÃO
  // ===========================================
  console.log('\n📚 6. DOCUMENTAÇÃO');
  console.log('─'.repeat(40));

  check('README.md completo', () => {
    if (!fs.existsSync('./README.md')) return false;
    const readme = fs.readFileSync('./README.md', 'utf8');
    return readme.length > 1000; // README deve ter conteúdo substancial
  });

  check('CHANGELOG.md', () => fs.existsSync('./CHANGELOG.md'));
  check('COMMANDS.md', () => fs.existsSync('./COMMANDS.md'));
  check('CONTRIBUTING.md', () => fs.existsSync('./CONTRIBUTING.md'));
  check('LICENSE', () => fs.existsSync('./LICENSE'));

  // ===========================================
  // 7. ARQUIVOS DESNECESSÁRIOS
  // ===========================================
  console.log('\n🧹 7. LIMPEZA DE ARQUIVOS');
  console.log('─'.repeat(40));

  check('Sem arquivos de teste antigos', () => {
    const testFiles = [
      'test-basic.js', 'test-email-basic.js', 'test-simple.js',
      'teste-sistema-real.js', 'diagnostic.py'
    ];
    
    let foundOldFiles = [];
    testFiles.forEach(file => {
      if (fs.existsSync(file)) {
        foundOldFiles.push(file);
      }
    });
    
    if (foundOldFiles.length > 0) {
      log('WARNING', `Arquivos antigos encontrados: ${foundOldFiles.join(', ')}`);
      return 'WARNING';
    }
    return true;
  });

  // ===========================================
  // RELATÓRIO FINAL
  // ===========================================
  console.log('\n' + '='.repeat(60));
  console.log('📊 RELATÓRIO DE AVALIAÇÃO');
  console.log('='.repeat(60));
  console.log(`✅ Verificações OK: ${ok}`);
  console.log(`⚠️  Warnings: ${warnings}`);
  console.log(`❌ Erros: ${errors}`);
  console.log(`🔧 Correções aplicadas: ${correcoes.length}`);
  console.log(`📈 Taxa de sucesso: ${((ok / (ok + warnings + errors)) * 100).toFixed(1)}%`);

  if (problemas.length > 0) {
    console.log('\n🚨 PROBLEMAS ENCONTRADOS:');
    problemas.forEach((problema, index) => {
      console.log(`${index + 1}. ${problema}`);
    });
  }

  if (correcoes.length > 0) {
    console.log('\n🔧 CORREÇÕES APLICADAS:');
    correcoes.forEach((correcao, index) => {
      console.log(`${index + 1}. ${correcao}`);
    });
  }

  // Avaliação geral
  if (errors === 0 && warnings <= 2) {
    console.log('\n🎉 PROJETO EXCELENTE!');
    console.log('✨ Seu projeto está em ótimo estado, pronto para produção.');
    console.log('💡 Sugestão: Execute npm start para testar o bot.');
  } else if (errors <= 2 && warnings <= 5) {
    console.log('\n⚠️  PROJETO BOM COM MELHORIAS NECESSÁRIAS');
    console.log('🔧 Algumas correções são recomendadas antes do deploy.');
    console.log('💡 Revise os warnings e corrija os erros críticos.');
  } else {
    console.log('\n🚨 PROJETO REQUER ATENÇÃO');
    console.log('🔧 Várias correções são necessárias antes do uso em produção.');
    console.log('💡 Priorize a correção dos erros críticos primeiro.');
  }

  // Próximos passos
  console.log('\n📋 PRÓXIMOS PASSOS RECOMENDADOS:');
  console.log('1. Configure adequadamente o arquivo .env');
  console.log('2. Execute: npm test (para validar testes)');
  console.log('3. Execute: npm run lint (para verificar código)');
  console.log('4. Execute: npm start (para testar o bot)');
  console.log('5. Execute: ./deploy-digitalocean.sh (para deploy)');

  console.log('\n✅ Avaliação concluída!');
  
  // Salvar relatório
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      ok,
      warnings,
      errors,
      corrections: correcoes.length,
      successRate: ((ok / (ok + warnings + errors)) * 100).toFixed(1)
    },
    problems: problemas,
    corrections: correcoes
  };
  
  fs.writeFileSync('avaliacao-relatorio.json', JSON.stringify(report, null, 2));
  console.log('\n💾 Relatório salvo em: avaliacao-relatorio.json');
}

// Executar avaliação
avaliacao();
