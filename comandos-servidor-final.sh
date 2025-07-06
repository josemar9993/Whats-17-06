#!/bin/bash

echo "🔍 VALIDAÇÃO FINAL DO SERVIDOR WHATSAPP BOT"
echo "=========================================="
echo "📍 Servidor: 161.35.176.216"
echo "📂 Diretório: /var/www/html"
echo ""

echo "1️⃣ VERIFICANDO VERSÃO ATUAL DO SERVIDOR..."
echo "git log --oneline -3"
echo ""

echo "2️⃣ COMMIT MAIS RECENTE NO GITHUB:"
echo "   Hash: 86b989d"
echo "   Mensagem: 🔍 Sistema de verificação de versão do servidor"
echo ""

echo "3️⃣ SE O SERVIDOR NÃO ESTIVER COM O COMMIT 86b989d, EXECUTE:"
echo "git fetch --all"
echo "git reset --hard origin/main"
echo "chmod +x *.sh"
echo "npm install"
echo ""

echo "4️⃣ POPULANDO BANCO DE DADOS:"
echo "node populate-database.js"
echo ""

echo "5️⃣ REINICIANDO O BOT:"
echo "pm2 restart ecosystem.config.js"
echo ""

echo "6️⃣ TESTANDO SISTEMA COMPLETO:"
echo "./test-servidor-completo.sh"
echo ""

echo "7️⃣ VERIFICANDO STATUS:"
echo "pm2 status"
echo "curl -s http://localhost:8080/health | head -n 5"
echo ""

echo "8️⃣ CASO DE EMERGÊNCIA - RESTART COMPLETO:"
echo "pm2 delete all"
echo "pm2 start ecosystem.config.js"
echo ""

echo "✅ VALIDAÇÃO CONCLUÍDA!"
echo "O servidor deve estar respondendo em http://161.35.176.216:8080/health"
