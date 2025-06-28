    
const fs = require('fs').promises;
const path = require('path');

async function createReportsIndex() {
  try {
    const reportsDir = '/var/www/html/reports';
    const files = await fs.readdir(reportsDir);
    const htmlFiles = files.filter(file => file.endsWith('.html'));
    
    const indexHtml = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>📋 Relatórios WhatsApp</title>
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
        .report-list {
            list-style: none;
            padding: 0;
        }
        .report-item {
            background: #f8f9fa;
            margin: 10px 0;
            padding: 15px;
            border-radius: 5px;
            border-left: 4px solid #4CAF50;
        }
        .report-item a {
            text-decoration: none;
            color: #333;
            font-weight: bold;
        }
        .report-item a:hover {
            color: #4CAF50;
        }
        .report-date {
            color: #666;
            font-size: 0.9em;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>📋 Relatórios WhatsApp</h1>
        <p>Total de relatórios: ${htmlFiles.length}</p>
        <ul class="report-list">
            ${htmlFiles.map(file => `
                <li class="report-item">
                    <a href="/reports/${file}">${file.replace('resumo-', '').replace('.html', '').replace(/T/g, ' ').replace(/-/g, ':')}</a>
                    <div class="report-date">Arquivo: ${file}</div>
                </li>
            `).join('')}
        </ul>
        <p><small>Última atualização: ${new Date().toLocaleString('pt-BR')}</small></p>
    </div>
</body>
</html>`;
    
    await fs.writeFile(path.join(reportsDir, 'index.html'), indexHtml);
    console.log('✅ Página index criada em: http://161.35.176.216/reports/');
    
  } catch (error) {
    console.error('❌ Erro ao criar index:', error.message);
  }
}

createReportsIndex();

