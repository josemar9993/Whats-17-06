#!/bin/bash

# ================================================
# SCRIPT DE VERIFICAÇÃO DE VERSÃO DO SERVIDOR
# Compara versão local com servidor
# ================================================

echo "🔍 VERIFICANDO VERSÃO DO SERVIDOR"
echo "================================="
echo "📍 Servidor: 161.35.176.216"
echo "📂 Repositório: https://github.com/josemar9993/Whats-17-06"
echo ""

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_info() {
    echo -e "${BLUE}🔍 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 1. Verificar último commit local
print_info "Verificando último commit local..."
LOCAL_COMMIT=$(git rev-parse HEAD 2>/dev/null)
LOCAL_COMMIT_SHORT=$(git rev-parse --short HEAD 2>/dev/null)
LOCAL_MSG=$(git log -1 --pretty=format:"%s" 2>/dev/null)

if [ -z "$LOCAL_COMMIT" ]; then
    print_error "Não foi possível obter informações do Git local"
    exit 1
fi

echo "   Hash: $LOCAL_COMMIT_SHORT"
echo "   Mensagem: $LOCAL_MSG"
print_success "Commit local obtido"

# 2. Verificar conectividade SSH
print_info "Verificando conectividade com servidor..."
if ! ssh -o BatchMode=yes -o ConnectTimeout=5 root@161.35.176.216 echo "SSH OK" > /dev/null 2>&1; then
    print_error "Não foi possível conectar ao servidor via SSH"
    echo "Execute manualmente:"
    echo "ssh root@161.35.176.216 'cd /var/www/html && git log -1 --oneline'"
    exit 1
fi
print_success "SSH conectado"

# 3. Verificar commit do servidor
print_info "Verificando último commit do servidor..."
SERVER_INFO=$(ssh root@161.35.176.216 "cd /var/www/html && git rev-parse HEAD && git rev-parse --short HEAD && git log -1 --pretty=format:'%s'" 2>/dev/null)

if [ -z "$SERVER_INFO" ]; then
    print_error "Não foi possível obter informações do Git do servidor"
    echo "Executando verificação manual..."
    ssh root@161.35.176.216 "cd /var/www/html && pwd && ls -la && git status"
    exit 1
fi

# Parse das informações do servidor
SERVER_COMMIT=$(echo "$SERVER_INFO" | sed -n '1p')
SERVER_COMMIT_SHORT=$(echo "$SERVER_INFO" | sed -n '2p')
SERVER_MSG=$(echo "$SERVER_INFO" | sed -n '3p')

echo "   Hash: $SERVER_COMMIT_SHORT"
echo "   Mensagem: $SERVER_MSG"
print_success "Commit do servidor obtido"

# 4. Comparar versões
echo ""
echo "📊 COMPARAÇÃO DE VERSÕES:"
echo "========================="
echo "🖥️  LOCAL:    $LOCAL_COMMIT_SHORT - $LOCAL_MSG"
echo "🌐 SERVIDOR: $SERVER_COMMIT_SHORT - $SERVER_MSG"
echo ""

if [ "$LOCAL_COMMIT" = "$SERVER_COMMIT" ]; then
    print_success "SERVIDOR ESTÁ ATUALIZADO!"
    echo "   ✅ Ambos têm o mesmo commit: $LOCAL_COMMIT_SHORT"
    echo "   ✅ Não é necessário fazer deploy"
else
    print_warning "SERVIDOR DESATUALIZADO!"
    echo "   ⚠️  Local:    $LOCAL_COMMIT_SHORT"
    echo "   ⚠️  Servidor: $SERVER_COMMIT_SHORT"
    echo ""
    echo "🚀 AÇÕES RECOMENDADAS:"
    echo "1. Execute o deploy automatizado:"
    echo "   ./deploy-automatico-servidor.sh"
    echo ""
    echo "2. Ou atualize manualmente:"
    echo "   ssh root@161.35.176.216"
    echo "   cd /var/www/html"
    echo "   git pull"
    echo "   pm2 restart whatsapp-bot"
fi

# 5. Verificar arquivos críticos recentes
print_info "Verificando arquivos críticos no servidor..."
ssh root@161.35.176.216 "
    cd /var/www/html
    echo '📁 ARQUIVOS CRÍTICOS:'
    [ -f 'populate-database.js' ] && echo '✅ populate-database.js existe' || echo '❌ populate-database.js FALTANDO'
    [ -f 'deploy-automatico-servidor.sh' ] && echo '✅ deploy-automatico-servidor.sh existe' || echo '❌ deploy-automatico-servidor.sh FALTANDO'
    [ -f 'test-servidor-completo.sh' ] && echo '✅ test-servidor-completo.sh existe' || echo '❌ test-servidor-completo.sh FALTANDO'
    [ -f 'test-comandos-whatsapp.js' ] && echo '✅ test-comandos-whatsapp.js existe' || echo '❌ test-comandos-whatsapp.js FALTANDO'
    
    echo ''
    echo '📊 STATUS PM2:'
    pm2 status 2>/dev/null || echo 'PM2 não está rodando ou não instalado'
    
    echo ''
    echo '📝 ÚLTIMOS LOGS (se disponível):'
    pm2 logs whatsapp-bot --lines 3 --nostream 2>/dev/null || echo 'Logs não disponíveis'
"

# 6. Verificar se precisa de deploy
echo ""
if [ "$LOCAL_COMMIT" != "$SERVER_COMMIT" ]; then
    echo "🔄 VERIFICANDO DIFERENÇAS:"
    echo "=========================="
    
    # Mostrar commits que o servidor não tem
    print_info "Commits que o servidor não possui:"
    git log --oneline "${SERVER_COMMIT}..${LOCAL_COMMIT}" 2>/dev/null || echo "Não foi possível comparar commits"
    
    echo ""
    print_warning "RECOMENDAÇÃO: Execute o deploy para atualizar o servidor!"
    echo ""
    echo "🚀 COMANDO PARA ATUALIZAR:"
    echo "./deploy-automatico-servidor.sh"
else
    echo ""
    print_success "🎉 SERVIDOR ESTÁ NA VERSÃO MAIS RECENTE!"
    echo ""
    echo "📋 VERIFICAÇÕES ADICIONAIS RECOMENDADAS:"
    echo "• Status do PM2: pm2 status"
    echo "• Health check: curl http://161.35.176.216:8080/health"
    echo "• Logs recentes: pm2 logs whatsapp-bot --lines 20"
fi

echo ""
echo "📊 RESUMO:"
echo "=========="
echo "Local:    $LOCAL_COMMIT_SHORT"
echo "Servidor: $SERVER_COMMIT_SHORT"
echo "Status:   $([ "$LOCAL_COMMIT" = "$SERVER_COMMIT" ] && echo "✅ ATUALIZADO" || echo "⚠️  PRECISA ATUALIZAR")"
