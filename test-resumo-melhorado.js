#!/usr/bin/env node

/**
 * Teste do novo formato de resumo
 * Este script demonstra o resumo melhorado com dados simulados
 */

require('dotenv').config();
const { createDailySummary } = require('./src/summarizer');

console.log('🧪 Testando Novo Formato de Resumo...\n');

// Dados simulados mais realistas
const mensagensSimuladas = [
  // Conversa com Andréia - cliente com problema
  {
    chatId: '5511999999999@c.us',
    contactName: 'Andréia Brick Ramos',
    senderName: 'Andréia Brick Ramos',
    body: 'Oi! Estou com um problema no sistema, pode me ajudar?',
    fromMe: false,
    timestamp: Date.now() / 1000 - 3600
  },
  {
    chatId: '5511999999999@c.us',
    contactName: 'Andréia Brick Ramos',
    senderName: 'Andréia Brick Ramos',
    body: 'É urgente, preciso resolver hoje!',
    fromMe: false,
    timestamp: Date.now() / 1000 - 3500
  },
  
  // Conversa com Erico - desenvolvimento
  {
    chatId: '5511888888888@c.us',
    contactName: 'Erico Seberino da Silva J',
    senderName: 'Erico Seberino da Silva J',
    body: 'O código rodou certinho? Conseguiu fazer o deploy?',
    fromMe: false,
    timestamp: Date.now() / 1000 - 3000
  },
  {
    chatId: '5511888888888@c.us',
    contactName: 'Erico Seberino da Silva J',
    senderName: 'Erico Seberino da Silva J',
    body: 'Se der algum erro me avisa',
    fromMe: false,
    timestamp: Date.now() / 1000 - 2900
  },
  
  // Conversa ativa com Cliente Premium
  {
    chatId: '5511777777777@c.us',
    contactName: 'Maria Silva Cliente Premium',
    senderName: 'Maria Silva Cliente Premium',
    body: 'Bom dia! Como está o andamento do projeto?',
    fromMe: false,
    timestamp: Date.now() / 1000 - 2800
  },
  {
    chatId: '5511777777777@c.us',
    contactName: 'Maria Silva Cliente Premium',
    senderName: 'Maria Silva Cliente Premium',
    body: 'Bom dia Maria! O projeto está 80% concluído.',
    fromMe: true,
    timestamp: Date.now() / 1000 - 2700
  },
  {
    chatId: '5511777777777@c.us',
    contactName: 'Maria Silva Cliente Premium',
    senderName: 'Maria Silva Cliente Premium',
    body: 'Vamos entregar na próxima semana conforme o cronograma.',
    fromMe: true,
    timestamp: Date.now() / 1000 - 2600
  },
  {
    chatId: '5511777777777@c.us',
    contactName: 'Maria Silva Cliente Premium',
    senderName: 'Maria Silva Cliente Premium',
    body: 'Perfeito! Muito obrigada pelo update.',
    fromMe: false,
    timestamp: Date.now() / 1000 - 2500
  },
  
  // Conversa em grupo ativa
  {
    chatId: '5511666666666@g.us',
    contactName: 'Equipe Desenvolvimento',
    senderName: 'João Dev',
    body: 'Pessoal, vamos fazer a reunião às 15h?',
    fromMe: false,
    timestamp: Date.now() / 1000 - 2400
  },
  {
    chatId: '5511666666666@g.us',
    contactName: 'Equipe Desenvolvimento',
    senderName: 'Ana Tech',
    body: 'Perfeito! Já preparei os relatórios.',
    fromMe: false,
    timestamp: Date.now() / 1000 - 2300
  },
  {
    chatId: '5511666666666@g.us',
    contactName: 'Equipe Desenvolvimento',
    senderName: 'Bot',
    body: 'Confirmado! Reunião às 15h. Agenda atualizada.',
    fromMe: true,
    timestamp: Date.now() / 1000 - 2200
  },
  
  // Cliente que envou muitas mensagens
  {
    chatId: '5511555555555@c.us',
    contactName: 'Carlos Urgente',
    senderName: 'Carlos Urgente',
    body: 'Preciso de uma resposta urgente sobre o orçamento!',
    fromMe: false,
    timestamp: Date.now() / 1000 - 2100
  },
  {
    chatId: '5511555555555@c.us',
    contactName: 'Carlos Urgente',
    senderName: 'Carlos Urgente',
    body: 'Já enviei por email também',
    fromMe: false,
    timestamp: Date.now() / 1000 - 2000
  },
  {
    chatId: '5511555555555@c.us',
    contactName: 'Carlos Urgente',
    senderName: 'Carlos Urgente',
    body: 'Por favor, me respondam até o fim do dia',
    fromMe: false,
    timestamp: Date.now() / 1000 - 1900
  },
  
  // Conversa com resposta
  {
    chatId: '5511444444444@c.us',
    contactName: 'Pedro Suporte',
    senderName: 'Pedro Suporte',
    body: 'Oi! Pode me explicar como funciona o sistema de agendamento?',
    fromMe: false,
    timestamp: Date.now() / 1000 - 1800
  },
  {
    chatId: '5511444444444@c.us',
    contactName: 'Pedro Suporte',
    senderName: 'Pedro Suporte',
    body: 'Claro! O sistema funciona assim: você acessa o menu...',
    fromMe: true,
    timestamp: Date.now() / 1000 - 1700
  }
];

async function testarResumo() {
  try {
    console.log('📊 Gerando resumo com dados simulados...\n');
    
    const resumo = await createDailySummary(mensagensSimuladas);
    
    console.log('✅ Resumo gerado com sucesso!\n');
    console.log('═'.repeat(60));
    console.log(resumo);
    console.log('═'.repeat(60));
    
    console.log('\n🎉 Teste concluído! Confira o novo formato acima.');
    console.log('\n💡 Melhorias implementadas:');
    console.log('   ✅ Estatísticas visuais em destaque');
    console.log('   ✅ Alertas importantes primeiro');
    console.log('   ✅ Ranking de tópicos mais claro');
    console.log('   ✅ Priorização de contatos sem resposta');
    console.log('   ✅ Conversas mais ativas em evidência');
    console.log('   ✅ Informações organizadas por importância');
    
  } catch (error) {
    console.error('❌ Erro ao gerar resumo:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testarResumo();
