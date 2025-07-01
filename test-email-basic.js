#!/usr/bin/env node

/**
 * Teste básico de envio de email
 * Este script testa a funcionalidade básica de envio de email
 */

require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('🧪 Teste Básico de Email - Iniciando...\n');

// Verificar variáveis de ambiente
const requiredEnvVars = ['EMAIL_USER', 'EMAIL_PASS', 'EMAIL_TO', 'SMTP_HOST', 'SMTP_PORT'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
    console.error('❌ Variáveis de ambiente faltando:');
    missingVars.forEach(varName => console.error(`   - ${varName}`));
    console.error('\n📝 Configure o arquivo .env com as credenciais corretas.');
    process.exit(1);
}

console.log('✅ Variáveis de ambiente configuradas:');
console.log(`   - EMAIL_USER: ${process.env.EMAIL_USER}`);
console.log(`   - EMAIL_TO: ${process.env.EMAIL_TO}`);
console.log(`   - SMTP_HOST: ${process.env.SMTP_HOST}`);
console.log(`   - SMTP_PORT: ${process.env.SMTP_PORT}\n`);

// Configurar transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    debug: true,
    logger: true
});

async function testBasicEmail() {
    try {
        console.log('📧 Enviando email de teste...');
        
        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_TO,
            subject: '🧪 Teste Básico - Bot WhatsApp',
            text: 'Este é um teste básico de email do bot WhatsApp.',
            html: `
                <h2>🧪 Teste Básico - Bot WhatsApp</h2>
                <p>Este é um teste básico de email do bot WhatsApp.</p>
                <p><strong>Data/Hora:</strong> ${new Date().toLocaleString('pt-BR')}</p>
                <p><strong>Status:</strong> ✅ Email enviado com sucesso!</p>
            `
        });

        console.log('✅ Email enviado com sucesso!');
        console.log(`   - Message ID: ${info.messageId}`);
        console.log(`   - Response: ${info.response}`);
        
    } catch (error) {
        console.error('❌ Erro ao enviar email:');
        console.error(`   - Erro: ${error.message}`);
        
        if (error.code) {
            console.error(`   - Código: ${error.code}`);
        }
        
        process.exit(1);
    }
}

// Executar teste
testBasicEmail()
    .then(() => {
        console.log('\n🎉 Teste básico de email concluído com sucesso!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Teste básico de email falhou:', error.message);
        process.exit(1);
    });
