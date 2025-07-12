const { exec } = require('child_process');
const logger = require('../../logger');
const { sendEmail } = require('../../emailer');
const path = require('path');

// Função para executar um comando shell e retornar uma promessa
const execShellCommand = (cmd) => {
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.warn(error);
      }
      resolve(stdout ? stdout : stderr);
    });
  });
};

module.exports = {
  name: 'teste-final',
  description: 'Executa um diagnóstico completo do sistema, incluindo conectividade de rede e envio de e-mail.',
  aliases: ['diag', 'diagnostico-completo'],
  cooldown: 30,
  adminOnly: true,
  async execute(message, args, client) {
    try {
      await message.reply('🤖 Iniciando diagnóstico completo... Isso pode levar até 2 minutos. Por favor, aguarde.');

      let report = '✅ *Diagnóstico Completo do Sistema*\n\n';

      // 1. Verificação de Conectividade Básica (Ping)
      logger.info('[DIAG] Verificando conectividade com Google DNS...');
      await message.reply('1/5 - Testando conectividade básica com a internet (ping 8.8.8.8)...');
      const pingOutput = await execShellCommand('ping -c 4 8.8.8.8');
      const pingSuccess = pingOutput.includes('4 packets transmitted, 4 received');
      report += `1. *Conectividade com a Internet (Ping 8.8.8.8):* ${pingSuccess ? '✅ SUCESSO' : '❌ FALHA'}\n`;
      if (!pingSuccess) {
        report += `\`\`\`${pingOutput}\`\`\`\n`;
        await message.reply(report);
        return;
      }

      // 2. Verificação de Resolução de DNS
      logger.info('[DIAG] Verificando resolução de DNS para smtp.gmail.com...');
      await message.reply('2/5 - Testando resolução de DNS para smtp.gmail.com...');
      const dnsOutput = await execShellCommand('nslookup smtp.gmail.com');
      const dnsSuccess = dnsOutput.includes('server');
      report += `2. *Resolução de DNS (smtp.gmail.com):* ${dnsSuccess ? '✅ SUCESSO' : '❌ FALHA'}\n`;
      if (!dnsSuccess) {
        report += `\`\`\`${dnsOutput}\`\`\`\n`;
        await message.reply(report);
        return;
      }

      // 3. Verificação de Conexão na Porta 587 (SMTP)
      logger.info('[DIAG] Verificando conexão na porta 587 com smtp.gmail.com...');
      await message.reply('3/5 - Testando conexão com o servidor do Gmail na porta 587...');
      const ncOutput = await execShellCommand('nc -zv -w 5 smtp.gmail.com 587');
      const ncSuccess = ncOutput.toLowerCase().includes('succeeded') || ncOutput.toLowerCase().includes('connected');
      report += `3. *Conexão SMTP (Porta 587):* ${ncSuccess ? '✅ SUCESSO' : '❌ FALHA'}\n`;
       if (!ncSuccess) {
        report += `\`\`\`${ncOutput}\`\`\`\n\n`;
        report += '⚠️ *Causa Provável:* O firewall (provavelmente da DigitalOcean) está bloqueando a conexão de saída na porta 587. Verifique as "Outbound Rules" do seu Cloud Firewall.\n';
        await message.reply(report);
        return;
      }

      // 4. Verificação das Variáveis de Ambiente
      await message.reply('4/5 - Verificando as variáveis de ambiente de e-mail...');
      const emailUser = process.env.EMAIL_USER;
      const emailPass = process.env.EMAIL_PASS;
      const emailTo = process.env.EMAIL_TO;
      const userOk = emailUser && emailUser.includes('@');
      const passOk = emailPass && emailPass.length > 5;
      const toOk = emailTo && emailTo.includes('@');
      report += `4. *Variáveis de Ambiente:* ${userOk && passOk && toOk ? '✅ CONFIGURADAS' : '❌ FALHA'}\n`;
      if (!userOk || !passOk || !toOk) {
          report += `  - EMAIL_USER: ${userOk ? 'OK' : 'FALHA'}\n`;
          report += `  - EMAIL_PASS: ${passOk ? 'OK' : 'FALHA'}\n`;
          report += `  - EMAIL_TO: ${toOk ? 'OK' : 'FALHA'}\n\n`;
          report += '⚠️ *Causa Provável:* Uma ou mais variáveis de ambiente para o e-mail não estão definidas corretamente no arquivo `.env` do servidor.\n';
          await message.reply(report);
          return;
      }


      // 5. Teste de Envio de E-mail Real
      logger.info('[DIAG] Enviando e-mail de teste real...');
      await message.reply('5/5 - Enviando um e-mail de teste real...');
      const subject = `✅ Teste de Diagnóstico do Bot (${new Date().toLocaleString()})`;
      const body = '<h1>Diagnóstico Completo</h1><p>Se você recebeu este e-mail, seu bot está configurado corretamente para enviar e-mails através do Gmail.</p>';
      
      const emailResult = await sendEmail({ subject, html: body }, client, true); // true para modo diagnóstico

      report += `5. *Envio de E-mail Real:* ${emailResult.success ? '✅ SUCESSO' : '❌ FALHA'}\n`;
      if (!emailResult.success) {
          report += `   - *Erro:* \`${emailResult.error.code || 'Desconhecido'}\`\n`;
          report += `   - *Mensagem:* ${emailResult.error.response || 'N/A'}\n\n`;
          report += '⚠️ *Causa Provável:*\n';
          if (emailResult.error.code === 'EAUTH') {
              report += '- *Credenciais Inválidas:* O `EMAIL_USER` ou `EMAIL_PASS` (senha de app) estão incorretos no arquivo `.env`.\n';
              report += '- *Segurança do Gmail:* O Gmail pode ter bloqueado a tentativa. Verifique seu e-mail por alertas de segurança.\n';
          } else {
              report += '- *Problema de Rede/Firewall:* Mesmo com a porta aberta, algo pode estar impedindo a comunicação.\n';
          }
      }

      logger.info('[DIAG] Diagnóstico concluído.');
      await message.reply(report);

    } catch (error) {
      logger.error(`Erro durante o comando de diagnóstico: ${error.message}`);
      await message.reply(`❌ Ocorreu um erro inesperado ao executar o diagnóstico. Verifique os logs do sistema.`);
    }
  },
};
