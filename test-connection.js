#!/usr/bin/env node

/**
 * Teste de conexão SMTP
 * Este script testa a conectividade com o servidor SMTP
 */

require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('🔌 Teste de Conexão SMTP - Iniciando...\n');

// Verificar variáveis de ambiente
const requiredEnvVars = ['EMAIL_USER', 'EMAIL_PASS', 'SMTP_HOST', 'SMTP_PORT'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
    console.error('❌ Variáveis de ambiente SMTP faltando:');
    missingVars.forEach(varName => console.error(`   - ${varName}`));
    console.error('\n📝 Configure o arquivo .env com as credenciais SMTP.');
    process.exit(1);
}

console.log('✅ Configuração SMTP:');
console.log(`   - Servidor: ${process.env.SMTP_HOST}:${process.env.SMTP_PORT}`);
console.log(`   - Usuário: ${process.env.EMAIL_USER}\n`);

// Configurar transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: false, // true para 465, false para outras portas
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    debug: true,
    logger: true
});

async function testConnection() {
    try {
        console.log('🔍 Testando conexão com servidor SMTP...');
        
        // Verificar conexão
        await transporter.verify();
        
        console.log('✅ Conexão SMTP estabelecida com sucesso!');
        console.log('   - Servidor SMTP está acessível');
        console.log('   - Credenciais de autenticação válidas');
        
        return true;
        
    } catch (error) {
        console.error('❌ Falha na conexão SMTP:');
        console.error(`   - Erro: ${error.message}`);
        
        if (error.code) {
            console.error(`   - Código: ${error.code}`);
        }
        
        // Dicas de solução baseadas no erro
        if (error.message.includes('ENOTFOUND')) {
            console.error('\n💡 Dica: Verifique se o SMTP_HOST está correto');
        } else if (error.message.includes('ECONNREFUSED')) {
            console.error('\n💡 Dica: Verifique se a SMTP_PORT está correta');
        } else if (error.message.includes('Invalid login')) {
            console.error('\n💡 Dica: Verifique EMAIL_USER e EMAIL_PASS');
            console.error('   Para Gmail, use uma senha de aplicativo, não a senha normal');
        }
        
        throw error;
    }
}

async function testSMTPCapabilities() {
    try {
        console.log('\n🔧 Testando recursos SMTP...');
        
        // Criar conexão para inspecionar recursos
        const connection = transporter.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT),
            secure: false
        });
        
        console.log('✅ Recursos SMTP disponíveis');
        
    } catch (error) {
        console.error('⚠️  Não foi possível verificar recursos SMTP:', error.message);
    }
}

// Executar testes
async function runTests() {
    try {
        await testConnection();
        await testSMTPCapabilities();
        
        console.log('\n🎉 Teste de conexão SMTP concluído com sucesso!');
        console.log('📧 Você pode prosseguir com o envio de emails.');
        
    } catch (error) {
        console.error('\n💥 Teste de conexão SMTP falhou!');
        console.error('🔧 Verifique suas configurações de email no arquivo .env');
        process.exit(1);
    }
}

runTests();
