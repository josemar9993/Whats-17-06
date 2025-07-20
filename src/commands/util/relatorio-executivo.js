const { MessageMedia } = require('whatsapp-web.js');
const path = require('path');
const fs = require('fs').promises;
const puppeteer = require('puppeteer');
const { getChatsToday, getChatMessages } = require('../../database');
const logger = require('../../logger');
const { getReportPeriod } = require('../../utils/reportHelper');

let executablePath;

async function getChromeExecutablePath() {
  if (executablePath) return executablePath;
  
  try {
    const browserFetcher = puppeteer.createBrowserFetcher();
    const revisionInfo = await browserFetcher.download(puppeteer.defaultRevision);
    executablePath = revisionInfo.executablePath;
    logger.info(`[Puppeteer] Usando Chrome baixado: ${executablePath}`);
    return executablePath;
  } catch (e) {
    logger.warn(`[Puppeteer] Falha ao baixar Chrome. Procurando instalação local...`);
    const commonPaths = [
      '/usr/bin/google-chrome-stable',
      '/usr/bin/google-chrome',
      '/usr/bin/chromium-browser',
      '/snap/bin/chromium',
    ];
    for (const chromePath of commonPaths) {
      try {
        await fs.access(chromePath);
        logger.info(`[Puppeteer] Chrome encontrado em: ${chromePath}`);
        executablePath = chromePath;
        return chromePath;
      } catch (error) {
        // Continua procurando
      }
    }
    logger.error('[Puppeteer] Chrome não encontrado no servidor.');
    throw new Error('Navegador Chrome não encontrado.');
  }
}

async function generateReportHTML(summaryData, period) {
  const templatePath = path.join(__dirname, '..', '..', 'templates', 'reportTemplate.html');
  let html = await fs.readFile(templatePath, 'utf-8');

  const summaryCards = `
    <div class="summary-card"><h3>Total de Chats Ativos</h3><p>${summaryData.totalChats}</p></div>
    <div class="summary-card"><h3>Total de Mensagens</h3><p>${summaryData.totalMessages}</p></div>
    <div class="summary-card"><h3>Média de Mensagens/Chat</h3><p>${summaryData.avgMessagesPerChat.toFixed(2)}</p></div>
  `;

  const topChatsList = summaryData.topChats
    .map(
      (chat) => `
    <div class="chat-item">
      <span class="chat-name">${chat.contactName}</span>
      <div class="progress-bar-container">
        <div class="progress-bar" style="width: ${
          (chat.totalMessages / summaryData.totalMessages) * 100
        }%;"></div>
      </div>
      <span class="chat-count">${chat.totalMessages} msgs</span>
    </div>
  `,
    )
    .join('');

  html = html.replace('{{period}}', period);
  html = html.replace('{{generationDate}}', new Date().toLocaleString('pt-BR'));
  html = html.replace('{{summaryCards}}', summaryCards);
  html = html.replace('{{topChatsList}}', topChatsList);

  return html;
}

async function generatePdf(html) {
  let browser;
  try {
    const chromePath = await getChromeExecutablePath();
    browser = await puppeteer.launch({
      executablePath: chromePath,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--headless',
      ],
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' },
    });
    return pdfBuffer;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

module.exports = {
  name: 'relatorio-executivo',
  description: 'Gera um relatório executivo em PDF das conversas.',
  aliases: ['report', 'relatorio'],
  cooldown: 60,
  adminOnly: true,
  async execute(message, args) {
    const periodArg = args[0] || 'hoje';
    const { startDate, periodLabel } = getReportPeriod(periodArg);

    try {
      await message.reply(`📊 Gerando relatório para *${periodLabel}*... Aguarde um momento.`);

      const chats = await getChatsToday(startDate);
      logger.info(`[Relatório] Chats encontrados: ${chats.length}`);

      if (chats.length === 0) {
        return message.reply(`Nenhum chat ativo encontrado para o período de *${periodLabel}*.`);
      }

      let totalMessages = 0;
      const chatDetails = [];

      for (const chat of chats) {
        const messages = await getChatMessages(chat.chatId, startDate);
        if (messages.length > 0) {
          totalMessages += messages.length;
          chatDetails.push({
            contactName: chat.contactName || 'Desconhecido',
            totalMessages: messages.length,
          });
        }
      }

      if (chatDetails.length === 0) {
        return message.reply(`Nenhuma mensagem encontrada no período de *${periodLabel}*.`);
      }

      chatDetails.sort((a, b) => b.totalMessages - a.totalMessages);

      const summaryData = {
        totalChats: chatDetails.length,
        totalMessages,
        avgMessagesPerChat: totalMessages / chatDetails.length,
        topChats: chatDetails.slice(0, 10),
      };

      const html = await generateReportHTML(summaryData, periodLabel);
      const pdfBuffer = await generatePdf(html);

      const reportMedia = new MessageMedia(
        'application/pdf',
        pdfBuffer.toString('base64'),
        `Relatorio_Executivo_${periodLabel.replace(/ /g, '_')}.pdf`,
      );

      await message.reply(reportMedia, null, {
        caption: `📄 Aqui está o seu relatório executivo para *${periodLabel}*.`,
      });

      logger.info(`[Relatório] PDF gerado com sucesso para ${periodLabel}`);
    } catch (error) {
      logger.error(`Erro crítico ao gerar relatório: ${error.stack}`);
      await message.reply(
        '❌ Erro ao gerar o relatório. Causa provável: Google Chrome não instalado no servidor. Execute: `sudo apt-get update && sudo apt-get install -y google-chrome-stable`',
      );
    }
  },
};
