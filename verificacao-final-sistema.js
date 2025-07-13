#!/usr/bin/env node

/**
 * VERIFICAÇÃO FINAL E CORREÇÃO DO SISTEMA
 * Script otimizado para verificar e corrigir o projeto final
 */

console.log('🔍 VERIFICAÇÃO FINAL DO WHATSAPP BOT ENTERPRISE');
console.log('===============================================\n');

const fs = require('fs');
const path = require('path');

// Contadores
let ok = 0;
let warnings = 0;
let errors = 0;
const detalhes = [];

function check(nome, test, nivel = 'OK') {
  process.stdout.write(`${nome}... `);
  try {
    const result = test();
    if (result === true) {
      console.log('✅ OK');
      ok++;
      detalhes.push({ nome, status: 'OK', nivel: 'success' });
    } else if (result === 'WARNING') {
      console.log('⚠️  WARNING');
      warnings++;
      detalhes.push({ nome, status: 'WARNING', nivel: 'warning' });
    } else {
      console.log('❌ ERRO');
      errors++;
      detalhes.push({ nome, status: 'ERRO', nivel: 'error' });
    }
  } catch (error) {
    console.log(`❌ ERRO: ${error.message}`);
    errors++;
    detalhes.push({ nome, status: `ERRO: ${error.message}`, nivel: 'error' });
  }
}

function verificarSistemaFinal() {
  console.log('🚀 Executando verificação final completa...\n');

  // =======================================
  // 1. ESTRUTURA BÁSICA
  // =======================================
  console.log('📁 1. ESTRUTURA E CONFIGURAÇÃO');
  console.log('─'.repeat(35));

  check('Node.js >= 16', () => {
    const version = parseInt(process.version.replace('v', '').split('.')[0]);
    return version >= 16;
  });

  check('Diretórios essenciais', () => {
    const dirs = ['src', 'data', 'logs', 'auth_data'];
    return dirs.every(dir => {
      const dirPath = path.join(__dirname, dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      return fs.existsSync(dirPath);
    });
  });

  check('package.json válido', () => {
    if (!fs.existsSync('./package.json')) return false;
    const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
    return pkg.name && pkg.version && pkg.main;
  });

  check('Arquivo .env presente', () => fs.existsSync('./.env'));

  // =======================================
  // 2. CÓDIGO FONTE
  // =======================================
  console.log('\n💻 2. CÓDIGO FONTE');
  console.log('─'.repeat(35));

  check('src/index.js', () => fs.existsSync('./src/index.js'));
  check('src/config.js', () => fs.existsSync('./src/config.js'));
  check('src/logger.js', () => fs.existsSync('./src/logger.js'));
  check('src/database.js', () => fs.existsSync('./src/database.js'));
  check('src/summarizer.js', () => fs.existsSync('./src/summarizer.js'));
  check('src/emailer.js', () => fs.existsSync('./src/emailer.js'));

  // =======================================
  // 3. COMANDOS
  // =======================================
  console.log('\n🎯 3. COMANDOS DO BOT');
  console.log('─'.repeat(35));

  check('Comandos util/', () => {
    const utilPath = path.join(__dirname, 'src/commands/util');
    if (!fs.existsSync(utilPath)) return false;
    const commands = fs.readdirSync(utilPath).filter(f => f.endsWith('.js'));
    console.log(`\n   📊 Comandos util encontrados: ${commands.length}`);
    return commands.length >= 10;
  });

  check('Comandos group/', () => {
    const groupPath = path.join(__dirname, 'src/commands/group');
    if (!fs.existsSync(groupPath)) return false;
    const commands = fs.readdirSync(groupPath).filter(f => f.endsWith('.js'));
    console.log(`   📊 Comandos group encontrados: ${commands.length}`);
    return commands.length >= 1;
  });

  // =======================================
  // 4. DEPENDÊNCIAS
  // =======================================
  console.log('\n📦 4. DEPENDÊNCIAS');
  console.log('─'.repeat(35));

  check('WhatsApp-web.js', () => {
    try {
      const { Client } = require('whatsapp-web.js');
      return typeof Client === 'function';
    } catch (e) {
      return false;
    }
  });

  check('Express.js', () => {
    try {
      const express = require('express');
      return typeof express === 'function';
    } catch (e) {
      return false;
    }
  });

  check('Winston (Logs)', () => {
    try {
      const winston = require('winston');
      return winston && winston.createLogger;
    } catch (e) {
      return false;
    }
  });

  check('SQLite3', () => {
    try {
      const sqlite3 = require('sqlite3');
      return sqlite3 && sqlite3.Database;
    } catch (e) {
      return false;
    }
  });

  // =======================================
  // 5. CONFIGURAÇÕES DE DEPLOY
  // =======================================
  console.log('\n🚀 5. DEPLOY E PRODUÇÃO');
  console.log('─'.repeat(35));

  check('ecosystem.config.js', () => fs.existsSync('./ecosystem.config.js'));
  check('deploy-digitalocean.sh', () => fs.existsSync('./deploy-digitalocean.sh'));
  check('Dockerfile', () => fs.existsSync('./Dockerfile'));
  check('.env.example', () => fs.existsSync('./.env.example'));

  // =======================================
  // 6. QUALIDADE DO CÓDIGO
  // =======================================
  console.log('\n🔍 6. QUALIDADE E TESTES');
  console.log('─'.repeat(35));

  check('ESLint config', () => {
    return fs.existsSync('./eslint.config.js') || fs.existsSync('./.eslintrc.jsonc');
  });

  check('Prettier config', () => fs.existsSync('./.prettierrc'));

  check('Jest testes', () => {
    return fs.existsSync('./jest.setup.js') && fs.existsSync('./src/__tests__');
  });

  check('Git hooks (Husky)', () => fs.existsSync('./.husky'));

  // =======================================
  // 7. LIMPEZA
  // =======================================
  console.log('\n🧹 7. LIMPEZA DO PROJETO');
  console.log('─'.repeat(35));

  check('Sem arquivos obsoletos', () => {
    const obsoletos = [
      'checklist-final.js', 'correcao-automatica.js', 'teste-comunicacao.js',
      'teste-final.js', 'teste-servidor.js', 'teste-simples.js',
      'teste-ultra-rapido.js', 'verificacao-rapida.js'
    ];
    
    const encontrados = obsoletos.filter(file => fs.existsSync(file));
    if (encontrados.length > 0) {
      console.log(`\n   ⚠️  Arquivos obsoletos encontrados: ${encontrados.join(', ')}`);
      return 'WARNING';
    }
    return true;
  });

  // =======================================
  // RELATÓRIO FINAL DETALHADO
  // =======================================
  console.log('\n' + '='.repeat(60));
  console.log('📊 RELATÓRIO FINAL DE VERIFICAÇÃO');
  console.log('='.repeat(60));

  console.log(`✅ Verificações OK: ${ok}`);
  console.log(`⚠️  Warnings: ${warnings}`);
  console.log(`❌ Erros críticos: ${errors}`);

  const total = ok + warnings + errors;
  const successRate = total > 0 ? ((ok / total) * 100).toFixed(1) : 0;
  console.log(`📈 Taxa de sucesso: ${successRate}%`);

  // Classificação detalhada
  console.log('\n📋 DETALHAMENTO POR CATEGORIA:');
  
  const categorias = {
    'Estrutura e Configuração': detalhes.slice(0, 4),
    'Código Fonte': detalhes.slice(4, 10),
    'Comandos': detalhes.slice(10, 12),
    'Dependências': detalhes.slice(12, 16),
    'Deploy': detalhes.slice(16, 20),
    'Qualidade': detalhes.slice(20, 24),
    'Limpeza': detalhes.slice(24)
  };

  Object.entries(categorias).forEach(([categoria, items]) => {
    const okCount = items.filter(i => i.nivel === 'success').length;
    const total = items.length;
    const percentage = total > 0 ? ((okCount / total) * 100).toFixed(0) : 0;
    
    let icon = '✅';
    if (percentage < 70) icon = '❌';
    else if (percentage < 90) icon = '⚠️';
    
    console.log(`${icon} ${categoria}: ${okCount}/${total} (${percentage}%)`);
  });

  // Avaliação geral
  console.log('\n🎯 AVALIAÇÃO GERAL:');
  
  if (errors === 0 && warnings <= 2) {
    console.log('🏆 PROJETO EXCELENTE!');
    console.log('✨ Sistema em perfeito estado, pronto para produção.');
    console.log('🚀 Pode proceder com o deploy imediatamente.');
  } else if (errors <= 1 && warnings <= 5) {
    console.log('👍 PROJETO BOM!');
    console.log('💡 Pequenos ajustes recomendados, mas funcional.');
    console.log('🔧 Corrija os warnings para otimização.');
  } else if (errors <= 3) {
    console.log('⚠️  PROJETO NECESSITA CORREÇÕES');
    console.log('🔧 Alguns problemas devem ser corrigidos antes do deploy.');
    console.log('💡 Foque nos erros críticos primeiro.');
  } else {
    console.log('🚨 PROJETO REQUER ATENÇÃO URGENTE');
    console.log('❌ Muitos problemas identificados.');
    console.log('🔧 Correção extensiva necessária antes do uso.');
  }

  // Próximos passos personalizados
  console.log('\n📋 PRÓXIMOS PASSOS RECOMENDADOS:');
  
  if (errors === 0) {
    console.log('1. ✅ Sistema verificado - Pronto para uso');
    console.log('2. 🔧 Configure .env com dados reais');
    console.log('3. 🚀 Execute: npm start');
    console.log('4. 🌐 Teste: http://localhost:8080/health');
    console.log('5. 🚀 Deploy: ./deploy-digitalocean.sh');
  } else {
    console.log('1. 🔧 Corrija os erros críticos listados acima');
    console.log('2. 📦 Execute: npm install (se necessário)');
    console.log('3. 🧪 Execute: npm test');
    console.log('4. 🔍 Execute esta verificação novamente');
  }

  console.log('\n✅ Verificação final concluída!');
  console.log(`📅 Data: ${new Date().toLocaleString()}`);
  
  // Salvar relatório detalhado
  const relatorio = {
    timestamp: new Date().toISOString(),
    summary: { ok, warnings, errors, successRate: parseFloat(successRate) },
    details: detalhes,
    categories: categorias
  };
  
  try {
    fs.writeFileSync('relatorio-verificacao-final.json', JSON.stringify(relatorio, null, 2));
    console.log('💾 Relatório detalhado salvo em: relatorio-verificacao-final.json');
  } catch (e) {
    console.log('⚠️  Não foi possível salvar o relatório detalhado');
  }
}

// Executar verificação final
verificarSistemaFinal();
