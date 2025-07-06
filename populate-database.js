#!/usr/bin/env node

/**
 * SCRIPT PARA POPULAR BANCO COM DADOS DE TESTE
 * Resolve o problema de relatórios vazios
 */

const fs = require('fs');
const path = require('path');

console.log('🗄️ POPULANDO BANCO COM DADOS DE TESTE');
console.log('====================================\n');

// Garantir que o diretório data existe
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log('✅ Diretório data/ criado');
}

// Carregar o módulo de banco
const db = require('./src/database');

// Dados de teste para simular conversas empresariais
const testMessages = [
    // Conversas de hoje
    {
        id: 'msg001',
        chatId: '5511999998888@c.us',
        timestamp: Math.floor(Date.now() / 1000) - 3600, // 1 hora atrás
        isoTimestamp: new Date(Date.now() - 3600000).toISOString(),
        senderName: 'Cliente VIP - João Silva',
        type: 'chat',
        body: 'Olá! Preciso de informações sobre o produto premium',
        fromMe: 0
    },
    {
        id: 'msg002',
        chatId: '5511999998888@c.us',
        timestamp: Math.floor(Date.now() / 1000) - 3500,
        isoTimestamp: new Date(Date.now() - 3500000).toISOString(),
        senderName: 'Bot Empresa',
        type: 'chat',
        body: 'Olá João! Claro, posso te ajudar com informações sobre nossos produtos premium.',
        fromMe: 1
    },
    {
        id: 'msg003',
        chatId: '5511999997777@c.us',
        timestamp: Math.floor(Date.now() / 1000) - 2400,
        isoTimestamp: new Date(Date.now() - 2400000).toISOString(),
        senderName: 'Empresa ABC - Maria Santos',
        type: 'chat',
        body: 'URGENTE: Problema com o pedido #12345. Preciso de suporte imediato!',
        fromMe: 0
    },
    {
        id: 'msg004',
        chatId: '5511999997777@c.us',
        timestamp: Math.floor(Date.now() / 1000) - 2300,
        isoTimestamp: new Date(Date.now() - 2300000).toISOString(),
        senderName: 'Bot Empresa',
        type: 'chat',
        body: 'Olá Maria! Entendemos a urgência. Vou verificar o pedido #12345 imediatamente.',
        fromMe: 1
    },
    {
        id: 'msg005',
        chatId: '5511999996666@c.us',
        timestamp: Math.floor(Date.now() / 1000) - 1800,
        isoTimestamp: new Date(Date.now() - 1800000).toISOString(),
        senderName: 'Prospect - Carlos Lima',
        type: 'chat',
        body: 'Vi vocês no Google. Podem me enviar uma proposta para consultoria?',
        fromMe: 0
    },
    // Conversas de ontem
    {
        id: 'msg006',
        chatId: '5511999995555@c.us',
        timestamp: Math.floor((Date.now() - 86400000) / 1000), // ontem
        isoTimestamp: new Date(Date.now() - 86400000).toISOString(),
        senderName: 'Cliente Antigo - Ana Costa',
        type: 'chat',
        body: 'Boa tarde! Gostaria de renovar meu contrato anual.',
        fromMe: 0
    },
    {
        id: 'msg007',
        chatId: '5511999995555@c.us',
        timestamp: Math.floor((Date.now() - 86400000) / 1000) + 300,
        isoTimestamp: new Date(Date.now() - 86400000 + 300000).toISOString(),
        senderName: 'Bot Empresa',
        type: 'chat',
        body: 'Olá Ana! Que ótima notícia! Vou preparar uma proposta de renovação para você.',
        fromMe: 1
    },
    {
        id: 'msg008',
        chatId: '5511999994444@c.us',
        timestamp: Math.floor((Date.now() - 86400000) / 1000) + 3600,
        isoTimestamp: new Date(Date.now() - 86400000 + 3600000).toISOString(),
        senderName: 'Suporte Técnico - Pedro Oliveira',
        type: 'chat',
        body: 'Sistema apresentando lentidão. Podem verificar?',
        fromMe: 0
    },
    // Conversas desta semana
    {
        id: 'msg009',
        chatId: '5511999993333@c.us',
        timestamp: Math.floor((Date.now() - 172800000) / 1000), // 2 dias atrás
        isoTimestamp: new Date(Date.now() - 172800000).toISOString(),
        senderName: 'Lead Qualificado - Roberto Silva',
        type: 'chat',
        body: 'Recebi o material por email. Muito interessante! Quando podemos conversar?',
        fromMe: 0
    },
    {
        id: 'msg010',
        chatId: '5511999992222@c.us',
        timestamp: Math.floor((Date.now() - 259200000) / 1000), // 3 dias atrás
        isoTimestamp: new Date(Date.now() - 259200000).toISOString(),
        senderName: 'Cliente Insatisfeito - José Ferreira',
        type: 'chat',
        body: 'Estou muito insatisfeito com o atendimento. Quero cancelar meu contrato.',
        fromMe: 0
    },
    // Mensagens com palavras-chave importantes
    {
        id: 'msg011',
        chatId: '5511999991111@c.us',
        timestamp: Math.floor(Date.now() / 1000) - 1200,
        isoTimestamp: new Date(Date.now() - 1200000).toISOString(),
        senderName: 'Oportunidade - Lucas Mendes',
        type: 'chat',
        body: 'Preciso de um orçamento para 500 licenças. Prazo até amanhã!',
        fromMe: 0
    },
    {
        id: 'msg012',
        chatId: '5511999990000@c.us',
        timestamp: Math.floor(Date.now() / 1000) - 900,
        isoTimestamp: new Date(Date.now() - 900000).toISOString(),
        senderName: 'Cliente Reclamação - Sandra Alves',
        type: 'chat',
        body: 'PÉSSIMO atendimento! Já é a terceira vez que entro em contato sem resposta!',
        fromMe: 0
    }
];

async function populateDatabase() {
    try {
        console.log('📊 Inserindo dados de teste...\n');
        
        let insertedCount = 0;
        
        for (const message of testMessages) {
            try {
                await db.addMessage(message);
                insertedCount++;
                
                // Log detalhado da inserção
                const timeStr = new Date(message.timestamp * 1000).toLocaleString('pt-BR');
                console.log(`✅ [${timeStr}] ${message.senderName}: ${message.body.substring(0, 50)}...`);
                
            } catch (error) {
                if (error.message.includes('UNIQUE constraint failed')) {
                    console.log(`⚠️ Mensagem já existe: ${message.id}`);
                } else {
                    console.log(`❌ Erro ao inserir ${message.id}: ${error.message}`);
                }
            }
        }
        
        console.log(`\n📈 RESUMO DA INSERÇÃO:`);
        console.log(`   ✅ Mensagens inseridas: ${insertedCount}`);
        console.log(`   📱 Total de mensagens tentadas: ${testMessages.length}`);
        
        // Verificar dados inseridos
        console.log('\n🔍 VERIFICANDO DADOS INSERIDOS:');
        
        const allMessages = await db.getAllMessages();
        console.log(`   📊 Total de mensagens no banco: ${allMessages.length}`);
        
        // Mensagens por data
        const today = new Date().toISOString().split('T')[0];
        const todayMessages = await db.getMessagesByDate(today);
        console.log(`   📅 Mensagens de hoje (${today}): ${todayMessages.length}`);
        
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        const yesterdayMessages = await db.getMessagesByDate(yesterday);
        console.log(`   📅 Mensagens de ontem (${yesterday}): ${yesterdayMessages.length}`);
        
        // Estatísticas por chat
        const chatStats = {};
        allMessages.forEach(msg => {
            if (!chatStats[msg.chatId]) {
                chatStats[msg.chatId] = { sent: 0, received: 0, name: msg.senderName };
            }
            if (msg.fromMe) {
                chatStats[msg.chatId].sent++;
            } else {
                chatStats[msg.chatId].received++;
            }
        });
        
        console.log('\n💬 ESTATÍSTICAS POR CHAT:');
        Object.entries(chatStats).forEach(([chatId, stats]) => {
            console.log(`   📱 ${stats.name}: ${stats.received} recebidas, ${stats.sent} enviadas`);
        });
        
        console.log('\n🎉 BANCO POPULADO COM SUCESSO!');
        console.log('\n📋 AGORA VOCÊ PODE TESTAR:');
        console.log('   • !relatorio-executivo hoje');
        console.log('   • !resumo-hoje');
        console.log('   • !alertas');
        console.log('   • !stats');
        console.log('   • !pendencias');
        console.log('   • !buscar urgente');
        
    } catch (error) {
        console.error('❌ Erro ao popular banco:', error.message);
        process.exit(1);
    }
}

// Executar população do banco
populateDatabase();
