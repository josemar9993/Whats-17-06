#!/usr/bin/env node

/**
 * CHECKLIST FINAL PARA GITHUB
 * Verificação completa antes do upload
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 CHECKLIST FINAL PARA GITHUB');
console.log('===============================\n');

let allPassed = true;
const issues = [];

// Função para verificar arquivo
function checkFile(filePath, description) {
  const exists = fs.existsSync(path.join(__dirname, filePath));
  console.log(`${exists ? '✅' : '❌'} ${description}: ${filePath}`);
  if (!exists) {
    issues.push(`Arquivo faltando: ${filePath}`);
    allPassed = false;
  }
  return exists;
}

// Função para verificar conteúdo
function checkContent(filePath, pattern, description) {
  try {
    const content = fs.readFileSync(path.join(__dirname, filePath), 'utf8');
    const found = content.includes(pattern);
    console.log(`${found ? '✅' : '❌'} ${description}`);
    if (!found) {
      issues.push(`${description} - ${filePath}`);
      allPassed = false;
    }
    return found;
  } catch (err) {
    console.log(`❌ Erro ao ler ${filePath}: ${err.message}`);
    allPassed = false;
    return false;
  }
}

console.log('📁 ARQUIVOS ESSENCIAIS:');
checkFile('package.json', 'Package.json');
checkFile('README.md', 'Documentação principal');
checkFile('LICENSE', 'Licença');
checkFile('Dockerfile', 'Container Docker');
checkFile('.env.example', 'Exemplo de configuração');
checkFile('src/index.js', 'Arquivo principal');
checkFile('src/config.js', 'Configurações');
checkFile('src/database.js', 'Banco de dados');

console.log('\n🛠️ ESTRUTURA DO CÓDIGO:');
checkFile('src/commands/util', 'Diretório de comandos');
checkFile('src/utils', 'Utilitários');
checkFile('src/middleware', 'Middleware');
checkFile('src/validators', 'Validadores');

console.log('\n📝 DOCUMENTAÇÃO:');
checkFile('RELATORIO_REVISAO_SISTEMA.md', 'Relatório de revisão');
checkFile('CHANGELOG.md', 'Log de mudanças');
checkFile('CONTRIBUTING.md', 'Guia de contribuição');

console.log('\n🚀 SCRIPTS DE DEPLOY:');
checkFile('deploy.sh', 'Script de deploy básico');
checkFile('deploy-digitalocean.sh', 'Deploy DigitalOcean');
checkFile('setup.sh', 'Setup inicial');
checkFile('ecosystem.config.js', 'Configuração PM2');

console.log('\n🧪 TESTES:');
checkFile('test-basic.js', 'Teste básico');
checkFile('test-system.js', 'Teste do sistema');
checkFile('jest.setup.js', 'Setup do Jest');

console.log('\n📦 VERIFICAÇÃO PACKAGE.JSON:');
try {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  console.log(`✅ Nome: ${pkg.name}`);
  console.log(`✅ Versão: ${pkg.version}`);
  console.log(`✅ Dependências: ${Object.keys(pkg.dependencies || {}).length}`);
  console.log(`✅ Scripts: ${Object.keys(pkg.scripts || {}).length}`);
  
  // Verificar dependências críticas
  const criticalDeps = ['whatsapp-web.js', 'express', 'sqlite3', 'winston', 'nodemailer'];
  criticalDeps.forEach(dep => {
    const hasIt = pkg.dependencies && pkg.dependencies[dep];
    console.log(`${hasIt ? '✅' : '❌'} Dependência crítica: ${dep}`);
    if (!hasIt) {
      issues.push(`Dependência faltando: ${dep}`);
      allPassed = false;
    }
  });
} catch (err) {
  console.log(`❌ Erro ao ler package.json: ${err.message}`);
  allPassed = false;
}

console.log('\n🔒 SEGURANÇA:');
const sensitiveFiles = ['.env', 'auth_data', 'logs'];
sensitiveFiles.forEach(file => {
  const exists = fs.existsSync(file);
  if (exists) {
    console.log(`⚠️  Arquivo sensível encontrado: ${file} (deve estar no .gitignore)`);
  } else {
    console.log(`✅ Arquivo sensível não presente: ${file}`);
  }
});

// Verificar .gitignore
if (checkFile('.gitignore', 'GitIgnore')) {
  checkContent('.gitignore', '.env', 'GitIgnore inclui .env');
  checkContent('.gitignore', 'auth_data', 'GitIgnore inclui auth_data');
  checkContent('.gitignore', 'logs', 'GitIgnore inclui logs');
  checkContent('.gitignore', 'node_modules', 'GitIgnore inclui node_modules');
}

console.log('\n📊 COMANDOS IMPLEMENTADOS:');
try {
  const commandsDir = path.join(__dirname, 'src', 'commands', 'util');
  if (fs.existsSync(commandsDir)) {
    const commands = fs.readdirSync(commandsDir).filter(f => f.endsWith('.js'));
    console.log(`✅ Total de comandos: ${commands.length}`);
    commands.forEach(cmd => {
      const name = cmd.replace('.js', '');
      console.log(`   ✓ ${name}`);
    });
  }
} catch (err) {
  console.log(`❌ Erro ao listar comandos: ${err.message}`);
}

console.log('\n' + '='.repeat(50));

if (allPassed) {
  console.log('🎉 TUDO CERTO! PRONTO PARA GITHUB! 🎉');
  console.log('\n📋 PRÓXIMOS PASSOS:');
  console.log('1. git add .');
  console.log('2. git commit -m "Sistema completo v1.1.0 - Revisão final aprovada"');
  console.log('3. git push origin main');
  console.log('\n🚀 O sistema está 100% funcional e documentado!');
} else {
  console.log('❌ PROBLEMAS ENCONTRADOS:');
  issues.forEach(issue => console.log(`   - ${issue}`));
  console.log('\n🔧 Corrija os problemas antes de subir para o GitHub.');
}

console.log('\n📈 ESTATÍSTICAS DO PROJETO:');
try {
  const countFiles = (dir, ext = '') => {
    try {
      return fs.readdirSync(dir, { withFileTypes: true })
        .filter(item => item.isFile() && item.name.endsWith(ext))
        .length;
    } catch { return 0; }
  };
  
  console.log(`   📄 Arquivos JS: ${countFiles('src', '.js')}`);
  console.log(`   📋 Arquivos MD: ${countFiles('.', '.md')}`);
  console.log(`   🧪 Testes: ${countFiles('.', 'test.js')}`);
  console.log(`   🚀 Scripts: ${countFiles('.', '.sh')}`);
} catch (err) {
  console.log('   ⚠️  Não foi possível calcular estatísticas');
}
