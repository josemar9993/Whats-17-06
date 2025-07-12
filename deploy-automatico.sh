#!/bin/bash

# Script para Deploy Automático do WhatsApp Bot
# Autor: Gerado para o projeto WhatsApp Bot Enterprise
# Data: 12/07/2025

set -e  # Parar em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

# Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
    error "Este script deve ser executado no diretório raiz do projeto"
fi

# Verificar se há alterações não commitadas
if [ -n "$(git status --porcelain)" ]; then
    warn "Há alterações não commitadas. Fazendo commit automático..."
    git add .
    git commit -m "chore: alterações automáticas antes do deploy"
fi

# Fazer push das alterações
log "Enviando alterações para o GitHub..."
git push origin main --no-verify

# Informações do servidor (valores padrão)
SERVER_IP_DEFAULT="161.35.176.216"
PROJECT_DIR="/var/www/html"

read -p "Digite o IP do servidor (padrão: $SERVER_IP_DEFAULT): " SERVER_IP
SERVER_IP=${SERVER_IP:-$SERVER_IP_DEFAULT}

read -p "Digite o usuário SSH (padrão: root): " SSH_USER
SSH_USER=${SSH_USER:-root}

log "Conectando ao servidor $SERVER_IP..."

# Comando SSH completo para deploy
SSH_CMD="ssh -o StrictHostKeyChecking=no $SSH_USER@$SERVER_IP"

log "Fazendo backup do banco de dados..."
$SSH_CMD "cd $PROJECT_DIR && cp data/messages.db data/messages.db.backup.$(date +%Y%m%d_%H%M%S) 2>/dev/null || echo 'Backup não necessário - primeira instalação'"

log "Atualizando código..."
$SSH_CMD "cd $PROJECT_DIR && git pull origin main"

log "Instalando dependências..."
$SSH_CMD "cd $PROJECT_DIR && npm install"

log "Reiniciando serviço..."
$SSH_CMD "pm2 restart whatsapp-bot"

log "Limpando logs antigos..."
$SSH_CMD "cd $PROJECT_DIR && rm -f logs/*.log"

log "Verificando status..."
$SSH_CMD "pm2 status"

log "Aguardando 10 segundos para o serviço estabilizar..."
sleep 10

log "Verificando health check..."
$SSH_CMD "curl -s http://localhost:8080/health || echo 'Health check falhou - verificar logs'"

log "Mostrando logs recentes..."
$SSH_CMD "pm2 logs whatsapp-bot --lines 20"

log "✅ Deploy concluído com sucesso!"

echo -e "${BLUE}"
echo "═══════════════════════════════════════════════════════════════"
echo "                    DEPLOY CONCLUÍDO                           "
echo "═══════════════════════════════════════════════════════════════"
echo "Próximos passos:"
echo "1. Teste o bot enviando !teste no WhatsApp"
echo "2. Verifique se o QR Code foi gerado (se necessário)"
echo "3. Monitore os logs por alguns minutos"
echo "4. Teste comandos básicos como !status"
echo "═══════════════════════════════════════════════════════════════"
echo -e "${NC}"
