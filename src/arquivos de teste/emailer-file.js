const fs = require('fs').promises;
const path = require('path');
const logger = require('./logger');

/**
 * Salva resumo em arquivo HTML acessível via web
 */
async function saveReportToFile(subject, content) {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `resumo-${timestamp}.html`;
    const filepath = path.join('/var/www/html/reports', filename);
    
    const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            margin: 40px; 
            background: #f5f5f5; 
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            max-width: 800px;
            margin: 0 auto;
        }
        h1 { color: #333; border-bottom: 2px solid #4CAF50; padding-bottom: 10px; }
        pre { 
            background: #f8f9fa; 
            padding: 20px; 
            border-radius: 5px; 
            border-left: 4px solid #4CAF50;
            overflow-x: auto;
            white-space: pre-wrap;
        }
        .timestamp {
            color: #666;
            font-size: 0.9em;
            text-align: right;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>${subject}</h1>
        <pre>${content}</pre>
        <div class="timestamp">Gerado em: ${new Date().toLocaleString('pt-BR')}</div>
    </div>
</body>
</html>`;
    
    await fs.writeFile(filepath, html);
    
    const url = `http://161.35.176.216/reports/${filename}`;
    logger.info(`📄 Resumo salvo: ${url}`);
    
    return url;
  } catch (error) {
    logger.error('❌ Erro ao salvar arquivo:', error.message);
    return null;
  }
}

/**
 * Gera e salva o resumo diário completo em arquivo HTML
 */
async function sendDailySummary(chats) {
  const { generateSummary } = require('./summarizer');
  
  if (!Array.isArray(chats)) {
    logger.warn('O parâmetro chats não é um array. O arquivo não será gerado.');
    return;
  }
  
  const resumoTexto = await generateSummary(chats);
  logger.info(resumoTexto);
  
  const url = await saveReportToFile('📋 Resumo Diário de Conversas', resumoTexto);
  
  if (url) {
    logger.info(`✅ Resumo disponível em: ${url}`);
  }
  
  return resumoTexto;
}

/**
 * Gera e salva o resumo de pendências em arquivo HTML
 */
async function sendPendingSummary(chats) {
  const { generatePendingSummary } = require('./summarizer');
  const resumoTexto = generatePendingSummary(chats);
  
  const url = await saveReportToFile('⏳ Resumo de Pendências', resumoTexto);
  
  if (url) {
    logger.info(`✅ Resumo de pendências disponível em: ${url}`);
  }
  
  return resumoTexto;
}

module.exports = {
  sendDailySummary,
  sendPendingSummary,
  saveReportToFile
};
