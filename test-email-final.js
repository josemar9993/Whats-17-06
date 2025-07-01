#!/usr/bin/env node

/**
 * Teste completo de funcionalidades de email
 * Este script testa todas as funcionalidades do sistema de email
 */

require('dotenv').config();
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

console.log('🚀 Teste Final de Email - Iniciando...\n');

// Verificar variáveis de ambiente
const requiredEnvVars = ['EMAIL_USER', 'EMAIL_PASS', 'EMAIL_TO', 'SMTP_HOST', 'SMTP_PORT'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
    console.error('❌ Variáveis de ambiente faltando:');
    missingVars.forEach(varName => console.error(`   - ${varName}`));
    process.exit(1);
}

// Configurar transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Dados de teste simulados
const testData = {
    summary: {
        totalMessages: 45,
        activeUsers: 8,
        topTopics: ['projeto', 'reunião', 'prazo'],
        sentiment: { positive: 60, neutral: 30, negative: 10 },
        urgentTasks: [
            'Revisar proposta até amanhã',
            'Confirmar reunião da semana',
            'Enviar relatório mensal'
        ]
    },
    date: new Date().toLocaleDateString('pt-BR'),
    period: 'últimas 24 horas'
};

async function testConnection() {
    console.log('🔌 Testando conexão SMTP...');
    try {
        await transporter.verify();
        console.log('✅ Conexão SMTP estabelecida\n');
        return true;
    } catch (error) {
        console.error('❌ Falha na conexão SMTP:', error.message);
        throw error;
    }
}

async function generateTestReport() {
    console.log('📊 Gerando relatório de teste...');
    
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Relatório de Teste - Bot WhatsApp</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
            .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .header { text-align: center; margin-bottom: 30px; }
            .header h1 { color: #25D366; margin: 0; }
            .header p { color: #666; margin: 5px 0; }
            .section { margin: 20px 0; padding: 20px; border-left: 4px solid #25D366; background: #f9f9f9; }
            .section h2 { margin-top: 0; color: #333; }
            .stats { display: flex; flex-wrap: wrap; gap: 15px; margin: 15px 0; }
            .stat { flex: 1; min-width: 150px; padding: 15px; background: white; border-radius: 8px; text-align: center; }
            .stat .number { font-size: 24px; font-weight: bold; color: #25D366; }
            .stat .label { font-size: 12px; color: #666; text-transform: uppercase; }
            .tasks { list-style: none; padding: 0; }
            .tasks li { padding: 10px; margin: 5px 0; background: #fff; border-left: 3px solid #ff6b6b; border-radius: 3px; }
            .sentiment { display: flex; gap: 10px; margin: 15px 0; }
            .sentiment-bar { flex: 1; height: 20px; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; font-weight: bold; }
            .positive { background: #4CAF50; }
            .neutral { background: #FFC107; }
            .negative { background: #F44336; }
            .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>📱 Relatório de Teste - Bot WhatsApp</h1>
                <p>Período: ${testData.period}</p>
                <p>Data: ${testData.date}</p>
            </div>

            <div class="section">
                <h2>📊 Estatísticas Gerais</h2>
                <div class="stats">
                    <div class="stat">
                        <div class="number">${testData.summary.totalMessages}</div>
                        <div class="label">Mensagens</div>
                    </div>
                    <div class="stat">
                        <div class="number">${testData.summary.activeUsers}</div>
                        <div class="label">Usuários Ativos</div>
                    </div>
                    <div class="stat">
                        <div class="number">${testData.summary.topTopics.length}</div>
                        <div class="label">Tópicos Principais</div>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2>💭 Análise de Sentimentos</h2>
                <div class="sentiment">
                    <div class="sentiment-bar positive" style="flex: ${testData.summary.sentiment.positive}">
                        ${testData.summary.sentiment.positive}% Positivo
                    </div>
                    <div class="sentiment-bar neutral" style="flex: ${testData.summary.sentiment.neutral}">
                        ${testData.summary.sentiment.neutral}% Neutro
                    </div>
                    <div class="sentiment-bar negative" style="flex: ${testData.summary.sentiment.negative}">
                        ${testData.summary.sentiment.negative}% Negativo
                    </div>
                </div>
            </div>

            <div class="section">
                <h2>🔥 Tópicos Principais</h2>
                <p><strong>Assuntos mais discutidos:</strong> ${testData.summary.topTopics.join(', ')}</p>
            </div>

            <div class="section">
                <h2>⚠️ Tarefas Urgentes</h2>
                <ul class="tasks">
                    ${testData.summary.urgentTasks.map(task => `<li>${task}</li>`).join('')}
                </ul>
            </div>

            <div class="footer">
                <p>Este é um teste automático do sistema de relatórios do Bot WhatsApp</p>
                <p>✅ Sistema funcionando corretamente!</p>
            </div>
        </div>
    </body>
    </html>
    `;
    
    console.log('✅ Relatório HTML gerado\n');
    return htmlContent;
}

async function testTextEmail() {
    console.log('📝 Testando email em texto simples...');
    
    const textContent = `
🤖 RELATÓRIO DE TESTE - BOT WHATSAPP

📅 Data: ${testData.date}
⏰ Período: ${testData.period}

📊 ESTATÍSTICAS:
• Total de mensagens: ${testData.summary.totalMessages}
• Usuários ativos: ${testData.summary.activeUsers}
• Tópicos principais: ${testData.summary.topTopics.join(', ')}

💭 SENTIMENTOS:
• Positivo: ${testData.summary.sentiment.positive}%
• Neutro: ${testData.summary.sentiment.neutral}%
• Negativo: ${testData.summary.sentiment.negative}%

⚠️ TAREFAS URGENTES:
${testData.summary.urgentTasks.map(task => `• ${task}`).join('\n')}

✅ Sistema de email funcionando corretamente!
    `;

    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_TO,
            subject: '📝 Teste de Email Texto - Bot WhatsApp',
            text: textContent
        });

        console.log('✅ Email de texto enviado com sucesso!');
        console.log(`   - Message ID: ${info.messageId}\n`);
        return true;
    } catch (error) {
        console.error('❌ Erro no email de texto:', error.message);
        throw error;
    }
}

async function testHtmlEmail() {
    console.log('🎨 Testando email HTML formatado...');
    
    try {
        const htmlContent = await generateTestReport();
        
        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_TO,
            subject: '🎨 Teste de Email HTML - Bot WhatsApp',
            html: htmlContent,
            text: 'Este é um teste de email HTML. Se você está vendo esta mensagem, seu cliente de email não suporta HTML.'
        });

        console.log('✅ Email HTML enviado com sucesso!');
        console.log(`   - Message ID: ${info.messageId}\n`);
        return true;
    } catch (error) {
        console.error('❌ Erro no email HTML:', error.message);
        throw error;
    }
}

async function testErrorHandling() {
    console.log('🔧 Testando tratamento de erros...');
    
    try {
        // Testar com email inválido para verificar tratamento de erro
        const invalidTransporter = nodemailer.createTransport({
            host: 'smtp.invalid-domain.com',
            port: 587,
            auth: {
                user: 'invalid@email.com',
                pass: 'invalid-password'
            }
        });

        await invalidTransporter.sendMail({
            from: 'invalid@email.com',
            to: 'test@test.com',
            subject: 'Teste de erro',
            text: 'Este email não deve ser enviado'
        });

        console.log('⚠️  Esperava-se um erro, mas o email foi enviado');
        
    } catch (error) {
        console.log('✅ Tratamento de erro funcionando corretamente');
        console.log(`   - Erro capturado: ${error.code || error.message}\n`);
    }
}

// Executar todos os testes
async function runAllTests() {
    try {
        console.log('🚀 Iniciando bateria completa de testes...\n');
        
        // Teste 1: Conexão
        await testConnection();
        
        // Teste 2: Email de texto
        await testTextEmail();
        
        // Teste 3: Email HTML
        await testHtmlEmail();
        
        // Teste 4: Tratamento de erros
        await testErrorHandling();
        
        console.log('🎉 TODOS OS TESTES CONCLUÍDOS COM SUCESSO!');
        console.log('✅ Sistema de email totalmente funcional');
        console.log('📧 Verifique sua caixa de entrada para os emails de teste');
        
    } catch (error) {
        console.error('\n💥 FALHA NOS TESTES DE EMAIL!');
        console.error('❌ Erro:', error.message);
        process.exit(1);
    }
}

runAllTests();
