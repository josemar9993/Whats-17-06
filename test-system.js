#!/usr/bin/env node

// Script para testar configurações básicas do sistema
require('dotenv').config();

const config = require('./src/config');
const logger = require('./src/logger');
const db = require('./src/database');

async function testSystem() {
  console.log('🔍 DIAGNÓSTICO DO SISTEMA WHATSAPP BOT\n');
  
  // 1. Testar configurações
  console.log('1. CONFIGURAÇÕES:');
  console.log(`   ✓ Command Prefix: "${config.commandPrefix}"`);
  console.log(`   ✓ Admin IDs: ${config.adminIds.length > 0 ? config.adminIds.join(', ') : '❌ NENHUM ADMIN CONFIGURADO'}`);
  console.log(`   ✓ DB Path: ${config.dbPath}`);
  console.log(`   ✓ Daily Summary Cron: ${config.dailySummaryCron}`);
  console.log(`   ✓ Email User: ${config.emailUser || '❌ NÃO CONFIGURADO'}`);
  
  // 2. Testar banco de dados
  console.log('\n2. BANCO DE DADOS:');
  try {
    const allMessages = await db.getAllMessages();
    console.log(`   ✓ Conectado ao banco SQLite`);
    console.log(`   ✓ Total de mensagens: ${allMessages.length}`);
    
    if (allMessages.length > 0) {
      const lastMessage = allMessages[allMessages.length - 1];
      console.log(`   ✓ Última mensagem: ${new Date(lastMessage.timestamp * 1000).toLocaleString('pt-BR')}`);
    }
  } catch (err) {
    console.log(`   ❌ Erro no banco: ${err.message}`);
  }
  
  // 3. Testar mensagens por data
  console.log('\n3. MENSAGENS DE HOJE:');
  try {
    const today = new Date().toISOString().split('T')[0];
    const todayMessages = await db.getMessagesByDate(today);
    console.log(`   ✓ Mensagens de hoje (${today}): ${todayMessages.length}`);
    
    if (todayMessages.length === 0) {
      console.log('   ⚠️  Nenhuma mensagem encontrada para hoje');
      
      // Verificar últimas 7 dias
      for (let i = 1; i <= 7; i++) {
        const testDate = new Date();
        testDate.setDate(testDate.getDate() - i);
        const dateStr = testDate.toISOString().split('T')[0];
        const messages = await db.getMessagesByDate(dateStr);
        if (messages.length > 0) {
          console.log(`   ✓ Encontradas ${messages.length} mensagens em ${dateStr}`);
          break;
        }
      }
    }
  } catch (err) {
    console.log(`   ❌ Erro ao buscar mensagens: ${err.message}`);
  }
  
  // 4. Testar estrutura de comandos
  console.log('\n4. COMANDOS:');
  const fs = require('fs');
  const path = require('path');
  
  const commandsPath = path.join(__dirname, 'src/commands');
  const commandFolders = fs.readdirSync(commandsPath);
  
  let totalCommands = 0;
  for (const folder of commandFolders) {
    const folderPath = path.join(commandsPath, folder);
    const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
    
    console.log(`   ✓ Pasta ${folder}: ${commandFiles.length} comandos`);
    totalCommands += commandFiles.length;
    
    // Verificar se os comandos carregam corretamente
    for (const file of commandFiles) {
      try {
        const command = require(path.join(folderPath, file));
        if (!command.name || !command.execute) {
          console.log(`   ❌ Comando inválido: ${file} (falta name ou execute)`);
        }
      } catch (err) {
        console.log(`   ❌ Erro ao carregar: ${file} - ${err.message}`);
      }
    }
  }
  
  console.log(`   ✓ Total de comandos: ${totalCommands}`);
  
  // 5. Verificar variáveis de ambiente críticas
  console.log('\n5. VARIÁVEIS DE AMBIENTE:');
  const criticalVars = [
    'COMMAND_PREFIX',
    'ADMIN_WHATSAPP_IDS',
    'DB_PATH'
  ];
  
  criticalVars.forEach(varName => {
    const value = process.env[varName];
    console.log(`   ${value ? '✓' : '❌'} ${varName}: ${value || 'NÃO DEFINIDA'}`);
  });
  
  console.log('\n✅ DIAGNÓSTICO CONCLUÍDO');
  
  if (config.adminIds.length === 0) {
    console.log('\n🚨 PROBLEMA CRÍTICO: Nenhum administrador configurado!');
    console.log('   Configure ADMIN_WHATSAPP_IDS no arquivo .env');
  }
}

// Executar o teste
testSystem().catch(err => {
  console.error('❌ Erro no diagnóstico:', err);
  process.exit(1);
});
