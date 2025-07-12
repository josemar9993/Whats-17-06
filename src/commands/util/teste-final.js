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

// Função para testar envio de e-mail
async function sendTestEmail(client, to, options = {}) {
  const { port = process.env.SMTP_PORT || 587 } = options;
  
  try {
    const result = await sendEmail(
      '🤖 Teste de E-mail - WhatsApp Bot',
      `Este é um e-mail de teste enviado automaticamente pelo WhatsApp Bot.
      
Data/Hora: ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}
Porta utilizada: ${port}
Status: Sistema funcionando corretamente!`,
      null,
      []
    );
    
    return { success: true, result };
  } catch (error) {
    return { success: false, error };
  }
}

module.exports = {
  name: 'teste-final',
  description: 'Executa um diagnóstico completo do sistema, incluindo conectividade de rede e envio de e-mail.',
  aliases: ['diag', 'diagnostico-completo'],
  cooldown: 30,
  adminOnly: true,
  async execute(message, args, client) {
    try {
      await message.reply('🤖 Iniciando diagnóstico completo... Isso pode levar até 2 minutos. Por favor, aguarde.');

      let pingCheck = false, dnsCheck = false, portCheck587 = false, portCheck465 = false, emailCheck = false;
      let pingOutput = '', dnsOutput = '', portOutput587 = '', portOutput465 = '', emailOutput = '';

      // Etapa 1: Verificação de Conectividade Básica (Ping)
      logger.info('[DIAG] Verificando conectividade com Google DNS...');
      await message.reply('1/5 - Testando conectividade básica com a internet (ping 8.8.8.8)...');
      pingOutput = await execShellCommand('ping -c 4 8.8.8.8');
      pingCheck = pingOutput.includes('4 packets transmitted, 4 received');
      logger.info(`[DIAG] Resultado do ping: ${pingCheck}`);

      // Etapa 2: Testar a resolução de DNS
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

      // Etapa 3: Testar a conexão na porta do SMTP (587)
      await message.reply('3/5 - Testando conexão com o servidor do Gmail na porta 587...');
      logger.info('[DIAG] Verificando conexão na porta 587 com smtp.gmail.com...');
      const portResult587 = await new Promise((resolve) => {
        exec('nc -zv -w 5 smtp.gmail.com 587', (error, stdout, stderr) => {
          if (!error && stdout.toLowerCase().includes('succeeded')) {
            resolve({ success: true, output: stdout });
          } else {
            resolve({ success: false, output: error ? error.message : stderr });
          }
        });
      });
      portCheck587 = portResult587.success;
      portOutput587 = portResult587.output;
      logger.info(`[DIAG] Resultado da conexão na porta 587: ${portResult587.success}`);

      // Etapa 4: Testar a conexão na porta do SMTPS (465)
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

      // Etapa 5: Tentar enviar um e-mail de teste
      // Usaremos a porta que teve sucesso, ou a padrão 587 se ambas falharem.
      const testPort = portCheck587 ? 587 : (portCheck465 ? 465 : 587);
      await message.reply(`5/5 - Tentando enviar um e-mail de teste real pela porta ${testPort}...`);
      logger.info(`[DIAG] Tentando enviar e-mail de teste pela porta ${testPort}...`);
      const emailResult = await sendTestEmail(client, message.from, { port: testPort });
      emailCheck = emailResult.success;
      emailOutput = emailResult.error ? (emailResult.error.message || JSON.stringify(emailResult.error)) : 'Enviado com sucesso!';
      logger.info(`[DIAG] Resultado do envio de e-mail: ${emailResult.success}`);

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

    } catch (error) {
      logger.error(`Erro durante o comando de diagnóstico: ${error.message}`);
      await message.reply(`❌ Ocorreu um erro inesperado ao executar o diagnóstico. Verifique os logs do sistema.`);
    }
  },
};
