#!/bin/bash

# ================================================
# COMANDOS RÁPIDOS PARA O SERVIDOR
# ================================================

SERVER="root@161.35.176.216"
PATH_SERVER="/var/www/html"

echo "🚀 COMANDOS RÁPIDOS PARA SERVIDOR"
echo "================================="

# Função para executar comando
run_cmd() {
    echo "🔄 Executando: $2"
    ssh $SERVER "cd $PATH_SERVER && $1"
    echo "✅ Concluído!"
    echo ""
}

# 1. Status rápido
echo "📊 1. STATUS DO SISTEMA"
run_cmd "pm2 status && curl -s http://localhost:8080/health" "Status PM2 e Health Check"

# 2. Logs recentes
echo "📋 2. LOGS RECENTES"
run_cmd "pm2 logs whatsapp-bot --lines 10 --nostream" "Últimos logs"

# 3. Git status
echo "📂 3. STATUS GIT"
run_cmd "git status && git log --oneline -5" "Status e últimos commits"

# 4. Deploy rápido
echo "🚀 4. QUER FAZER DEPLOY? (y/n)"
read -p "Deploy agora? " deploy

if [ "$deploy" = "y" ] || [ "$deploy" = "Y" ]; then
    echo "🔄 Executando deploy..."
    run_cmd "git pull origin main" "Git pull"
    run_cmd "npm install --production" "Install dependências"
    run_cmd "pm2 restart whatsapp-bot" "Restart bot"
    run_cmd "sleep 3 && curl -s http://localhost:8080/health" "Health check final"
    echo "🎉 Deploy concluído!"
fi

echo "✅ Comandos executados!"
