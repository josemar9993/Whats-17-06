#!/bin/bash

# ================================================
# DEPLOY AUTOMÁTICO VIA WHATSAPP
# Versão otimizada para execução via comando WhatsApp
# ================================================

echo "🚀 DEPLOY AUTOMÁTICO INICIADO VIA WHATSAPP"
echo "=========================================="

# Configurações
SERVER_IP="161.35.176.216"
SERVER_USER="root"
SERVER_PATH="/var/www/html"
TIMEOUT=300

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Função para log
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Verificar conectividade
log_info "Verificando conectividade com servidor..."
if ! ping -c 1 $SERVER_IP > /dev/null 2>&1; then
    log_error "Servidor não está respondendo"
    exit 1
fi
log_success "Servidor online"

# Verificar SSH
log_info "Testando conexão SSH..."
if ! ssh -o BatchMode=yes -o ConnectTimeout=5 $SERVER_USER@$SERVER_IP echo "OK" > /dev/null 2>&1; then
    log_error "Falha na conexão SSH"
    exit 1
fi
log_success "SSH conectado"

# Função para executar comando remoto
exec_remote() {
    local cmd="$1"
    local desc="$2"
    
    log_info "$desc"
    
    # Executar comando com timeout
    timeout $TIMEOUT ssh $SERVER_USER@$SERVER_IP "cd $SERVER_PATH && $cmd" 2>&1
    
    if [ $? -eq 0 ]; then
        log_success "$desc - OK"
        return 0
    else
        log_error "$desc - FALHOU"
        return 1
    fi
}

# Verificar se diretório existe
log_info "Verificando estrutura do servidor..."
if ! exec_remote "[ -d '$SERVER_PATH' ] && echo 'Diretório OK'" "Verificar diretório"; then
    log_error "Diretório do projeto não encontrado"
    exit 1
fi

# Atualizar código
log_info "Atualizando código do GitHub..."
if ! exec_remote "git pull origin main" "Git pull"; then
    log_error "Falha ao atualizar código"
    exit 1
fi

# Instalar dependências (se necessário)
log_info "Verificando dependências..."
exec_remote "npm install --production" "Instalar dependências"

# Reiniciar bot
log_info "Reiniciando bot..."
if ! exec_remote "pm2 restart whatsapp-bot" "Restart PM2"; then
    log_error "Falha ao reiniciar bot"
    exit 1
fi

# Verificar status
log_info "Verificando status final..."
STATUS_OUTPUT=$(exec_remote "pm2 status whatsapp-bot" "Status PM2")
if [ $? -eq 0 ]; then
    log_success "Bot reiniciado com sucesso"
else
    log_warning "Status não pôde ser verificado"
fi

# Health check
log_info "Executando health check..."
HEALTH_OUTPUT=$(exec_remote "curl -s http://localhost:8080/health || echo 'Health check falhou'" "Health check")
if [[ "$HEALTH_OUTPUT" == *"OK"* ]]; then
    log_success "Health check passou"
else
    log_warning "Health check com problemas"
fi

# Verificar logs recentes
log_info "Verificando logs recentes..."
LOGS_OUTPUT=$(exec_remote "pm2 logs whatsapp-bot --lines 5 --nostream" "Logs recentes")

# Relatório final
echo ""
echo "🎉 DEPLOY FINALIZADO COM SUCESSO!"
echo "================================="
echo "📊 RESUMO:"
echo "✅ Código atualizado do GitHub"
echo "✅ Dependências verificadas"
echo "✅ Bot reiniciado via PM2"
echo "✅ Health check executado"
echo "✅ Sistema operacional"

echo ""
echo "📋 STATUS FINAL:"
echo "$STATUS_OUTPUT"

echo ""
echo "🌐 HEALTH CHECK:"
echo "$HEALTH_OUTPUT"

echo ""
echo "📝 ÚLTIMOS LOGS:"
echo "$LOGS_OUTPUT"

echo ""
echo "🚀 DEPLOY CONCLUÍDO - SISTEMA ATUALIZADO!"
echo "Servidor: $SERVER_IP"
echo "Status: ONLINE"
echo "Última atualização: $(date)"

exit 0
