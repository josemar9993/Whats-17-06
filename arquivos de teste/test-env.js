require('dotenv').config();

console.log('=== TESTE DE VARIÁVEIS DE AMBIENTE ===');
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'CONFIGURADO' : 'NÃO CONFIGURADO');
console.log('EMAIL_TO:', process.env.EMAIL_TO);
console.log('SMTP_HOST:', process.env.SMTP_HOST);
console.log('SMTP_PORT:', process.env.SMTP_PORT);

if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    console.log('✅ Credenciais carregadas com sucesso!');
} else {
    console.log('❌ Problema no carregamento das credenciais');
}

// Teste de envio direto
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

async function testDirectEmail() {
    try {
        console.log('\n🔗 Testando envio direto...');
        await transporter.verify();
        console.log('✅ Conexão SMTP OK');
        
        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_TO,
            subject: 'Teste Direto - WhatsApp Bot',
            html: '<h2>✅ Sistema de email funcionando!</h2>'
        });
        
        console.log('✅ Email enviado:', info.messageId);
    } catch (error) {
        console.error('❌ Erro:', error.message);
    }
}

testDirectEmail();
