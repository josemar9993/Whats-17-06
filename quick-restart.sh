#!/bin/bash

# Script rápido para reiniciar o bot
echo "🔄 Reiniciando WhatsApp Bot..."

cd /var/www/html || exit 1

# Parar todos os processos
pm2 stop all
pm2 delete all

# Limpar porta 8080
sudo lsof -ti:8080 | xargs -r sudo kill -9

# Puxar alterações
git pull

# Iniciar novamente
pm2 start ecosystem.config.js --env production

# Mostrar status
pm2 status
pm2 logs whatsapp-bot --lines 10
