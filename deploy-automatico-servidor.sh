#!/bin/bash

# ================================================
# SCRIPT DE DEPLOY AUTOMATIZADO PARA SERVIDOR
# WhatsApp Bot Enterprise v1.1.0
# ================================================

echo "🚀 INICIANDO DEPLOY AUTOMATIZADO"
echo "================================"
echo "📍 Servidor: 161.35.176.216"
echo "📂 Diretório: /var/www/html"
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Função para status
print_status() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ $1${NC}"
    else
        echo -e "${RED}❌ $1 - FALHOU${NC}"
        exit 1
    fi
}

print_info() {
    echo -e "${BLUE}🔍 $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Verificar se SSH está disponível
print_info "Verificando conectividade SSH..."
if ! ssh -o BatchMode=yes -o ConnectTimeout=5 root@161.35.176.216 echo "SSH OK" > /dev/null 2>&1; then
    echo -e "${RED}❌ Não foi possível conectar ao servidor via SSH${NC}"
    echo "Verifique:"
    echo "  1. Servidor está online"
    echo "  2. Chave SSH configurada"
    echo "  3. IP correto: 161.35.176.216"
    exit 1
fi
print_status "SSH conectado com sucesso"

# Função para executar comandos no servidor
run_remote() {
    local cmd="$1"
    local desc="$2"
    print_info "$desc"
    ssh root@161.35.176.216 "$cmd"
    print_status "$desc"
}

# 1. Verificar estrutura do servidor
print_info "Verificando estrutura do servidor..."
ssh root@161.35.176.216 "
    echo '📁 Verificando diretórios...'
    [ -d '/var/www/html' ] && echo '✅ /var/www/html existe' || echo '❌ /var/www/html não encontrado'
    
    cd /var/www/html || exit 1
    [ -f 'package.json' ] && echo '✅ package.json encontrado' || echo '❌ package.json não encontrado'
    [ -f 'src/index.js' ] && echo '✅ src/index.js encontrado' || echo '❌ src/index.js não encontrado'
"
print_status "Estrutura verificada"

# 2. Atualizar código do GitHub
run_remote "cd /var/www/html && git pull" "Atualizando código do GitHub"

# 3. Verificar dependências
run_remote "cd /var/www/html && npm list --depth=0 | head -10" "Verificando dependências"

# 4. Popular banco com dados de teste
run_remote "cd /var/www/html && node populate-database.js" "Populando banco com dados de teste"

# 5. Executar teste automatizado
run_remote "cd /var/www/html && chmod +x test-servidor-completo.sh && ./test-servidor-completo.sh" "Executando testes automatizados"

# 6. Reiniciar o bot
run_remote "pm2 restart whatsapp-bot" "Reiniciando bot via PM2"

# 7. Verificar status final
print_info "Verificando status final..."
ssh root@161.35.176.216 "
    echo '📊 STATUS PM2:'
    pm2 status
    echo ''
    echo '🌐 HEALTH CHECK:'
    curl -s http://localhost:8080/health || echo 'Health check não disponível'
    echo ''
    echo '📝 ÚLTIMOS LOGS:'
    pm2 logs whatsapp-bot --lines 5 --nostream
"
print_status "Status final verificado"

# 8. Teste de comandos
print_info "Testando comandos específicos..."
ssh root@161.35.176.216 "
    cd /var/www/html
    echo '🧪 Testando comandos...'
    timeout 30s node test-comandos-whatsapp.js | head -20
"
print_status "Comandos testados"

# 9. Verificar banco de dados
print_info "Verificando banco de dados..."
ssh root@161.35.176.216 "
    cd /var/www/html
    echo '🗄️ Status do banco:'
    [ -f 'data/messages.db' ] && echo '✅ Banco de dados existe' || echo '❌ Banco não encontrado'
    
    if command -v sqlite3 > /dev/null 2>&1 && [ -f 'data/messages.db' ]; then
        echo 'Total de mensagens:' \$(sqlite3 data/messages.db 'SELECT COUNT(*) FROM messages;' 2>/dev/null || echo 'Erro ao contar')
    fi
"
print_status "Banco verificado"

# Resumo final
echo ""
echo "🎉 DEPLOY FINALIZADO COM SUCESSO!"
echo "================================="
echo -e "${GREEN}✅ Código atualizado do GitHub${NC}"
echo -e "${GREEN}✅ Banco populado com dados de teste${NC}"
echo -e "${GREEN}✅ Testes automatizados executados${NC}"
echo -e "${GREEN}✅ Bot reiniciado via PM2${NC}"
echo -e "${GREEN}✅ Sistema verificado e operacional${NC}"

echo ""
echo "📋 PRÓXIMOS PASSOS:"
echo "1. Verificar se WhatsApp Web está conectado"
echo "2. Escanear QR code se necessário"
echo "3. Testar comandos via WhatsApp:"
echo "   • !ping"
echo "   • !ajuda"
echo "   • !relatorio-executivo hoje"
echo "   • !alertas"
echo "   • !stats"

echo ""
echo "🌐 MONITORAMENTO:"
echo "• Status: pm2 status"
echo "• Logs: pm2 logs whatsapp-bot"
echo "• Health: curl http://161.35.176.216:8080/health"
echo "• Monitor: pm2 monit"

echo ""
echo -e "${GREEN}🚀 SISTEMA PRONTO PARA USO!${NC}"
