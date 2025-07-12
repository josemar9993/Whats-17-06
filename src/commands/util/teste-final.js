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
      await message.reply('2/5 - Testando resolução de DNS para smtp.gmail.com...');
      logger.info('[DIAG] Verificando resolução de DNS para smtp.gmail.com...');
      const dnsResult = await new Promise((resolve) => {
        exec('nslookup smtp.gmail.com', (error, stdout, stderr) => {
          // A resposta "Non-authoritative answer" é normal e não deve ser tratada como erro.
          // O nslookup retorna um status de erro (1) para isso, então verificamos o stdout.
          if (stdout.includes('smtp.gmail.com') && stdout.includes('Address')) {
            resolve({ success: true, output: stdout || stderr });
          } else {
            resolve({ success: false, output: error ? error.message : stderr });
          }
        });
      });
      dnsCheck = dnsResult.success;
      dnsOutput = dnsResult.output;
      logger.info(`[DIAG] Resultado do DNS: ${dnsResult.success}`);

      report += `2. *Resolução de DNS (smtp.gmail.com):* ${dnsCheck ? '✅ SUCESSO' : '❌ FALHA'}\n`;
      if (!dnsCheck) {
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

      // Etapa 3.5: Testar a conexão na porta do SMTPS (465)
      await message.reply('4/5 - Testando conexão com o servidor do Gmail na porta alternativa (465)...');
      logger.info('[DIAG] Verificando conexão na porta 465 com smtp.gmail.com...');
      const portResult465 = await new Promise((resolve) => {
        exec('nc -zv -w 5 smtp.gmail.com 465', (error, stdout, stderr) => {
          if (!error && stdout.toLowerCase().includes('succeeded')) {
            resolve({ success: true, output: stdout });
          } else {
            resolve({ success: false, output: error ? error.message : stderr });
          }
        });
      });
      portCheck465 = portResult465.success;
      portOutput465 = portResult465.output;
      logger.info(`[DIAG] Resultado da conexão na porta 465: ${portResult465.success}`);


      // Etapa 4: Tentar enviar um e-mail de teste
      // Usaremos a porta que teve sucesso, ou a padrão 587 se ambas falharem.
      const testPort = portCheck587 ? 587 : (portCheck465 ? 465 : 587);
      await message.reply(`5/5 - Tentando enviar um e-mail de teste real pela porta ${testPort}...`);
      logger.info(`[DIAG] Tentando enviar e-mail de teste pela porta ${testPort}...`);
      const emailResult = await sendTestEmail(client, message.from, { port: testPort });
      emailCheck = emailResult.success;
      emailOutput = emailResult.error ? (emailResult.error.message || JSON.stringify(emailResult.error)) : 'Enviado com sucesso!';
      logger.info(`[DIAG] Resultado do envio de e-mail: ${emailResult.success}`);

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

      const finalReport = `✅ *Diagnóstico Completo do Sistema*
1. *Conectividade com a Internet (Ping 8.8.8.8):* ${pingCheck ? '✅ SUCESSO' : '❌ FALHA'}
2. *Resolução de DNS (smtp.gmail.com):* ${dnsCheck ? '✅ SUCESSO' : '❌ FALHA'}
3. *Conexão na Porta 587 (SMTP):* ${portCheck587 ? '✅ SUCESSO' : '❌ FALHA'}
4. *Conexão na Porta 465 (SMTPS):* ${portCheck465 ? '✅ SUCESSO' : '❌ FALHA'}
5. *Envio de E-mail de Teste:* ${emailCheck ? '✅ SUCESSO' : '❌ FALHA'}

*Detalhes Técnicos:*
\`\`\`
--- PING ---
${pingOutput}

--- DNS ---
${dnsOutput}

--- PORTA 587 ---
${portOutput587}

--- PORTA 465 ---
${portOutput465}

--- E-MAIL ---
${emailOutput}
\`\`\``;

      await message.reply(finalReport);

      logger.info('[DIAG] Diagnóstico concluído.');
      await message.reply(report);

    } catch (error) {
      logger.error(`Erro durante o comando de diagnóstico: ${error.message}`);
      await message.reply(`❌ Ocorreu um erro inesperado ao executar o diagnóstico. Verifique os logs do sistema.`);
    }
  },
};
