// Teste simples do sistema
require('dotenv').config();

console.log('=== TESTE DE CONFIGURAÇÃO ===');
console.log('COMMAND_PREFIX:', process.env.COMMAND_PREFIX);
console.log('ADMIN_WHATSAPP_IDS:', process.env.ADMIN_WHATSAPP_IDS);
console.log('DB_PATH:', process.env.DB_PATH);

try {
  const config = require('./src/config');
  console.log('\n=== CONFIG CARREGADO ===');
  console.log('commandPrefix:', config.commandPrefix);
  console.log('adminIds:', config.adminIds);
  console.log('dbPath:', config.dbPath);
} catch (err) {
  console.error('ERRO ao carregar config:', err.message);
}

try {
  const db = require('./src/database');
  console.log('\n=== DATABASE CARREGADO ===');
  console.log('Módulo de banco carregado com sucesso');
  
  // Teste simples do banco
  db.getAllMessages().then(messages => {
    console.log('Total de mensagens:', messages.length);
  }).catch(err => {
    console.log('Erro ao buscar mensagens:', err.message);
  });
} catch (err) {
  console.error('ERRO ao carregar database:', err.message);
}
