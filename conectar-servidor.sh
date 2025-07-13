#!/bin/bash

# ================================================
# CONECTAR E GERENCIAR SERVIDOR DIRETAMENTE
# ================================================

SERVER_IP="161.35.176.216"
SERVER_USER="root"
SERVER_PATH="/var/www/html"

echo "🌐 CONECTANDO AO SERVIDOR"
echo "========================="
echo "📍 IP: $SERVER_IP"
echo "👤 Usuário: $SERVER_USER"
echo "📁 Diretório: $SERVER_PATH"
echo ""

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Função para executar comando no servidor
exec_remote() {
    local cmd="$1"
    local desc="$2"
    
    echo -e "${BLUE}[EXECUTANDO]${NC} $desc"
    echo "Comando: $cmd"
    echo "----------------------------------------"
    
    ssh $SERVER_USER@$SERVER_IP "cd $SERVER_PATH && $cmd"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Sucesso${NC}"
    else
        echo -e "${RED}❌ Falhou${NC}"
    fi
    echo ""
}

# Menu de opções
while true; do
    echo "🔧 GERENCIAMENTO DO SERVIDOR"
    echo "============================"
    echo "1. 📊 Status do sistema"
    echo "2. 🔄 Atualizar código (git pull)"
    echo "3. 🚀 Reiniciar bot (PM2)"
    echo "4. 📋 Ver logs"
    echo "5. 🌐 Health check"
    echo "6. 📁 Listar arquivos"
    echo "7. 💻 Conectar SSH interativo"
    echo "8. 🏃 Deploy completo"
    echo "9. ❌ Sair"
    echo ""
    read -p "Escolha uma opção (1-9): " opcao
    
    case $opcao in
        1)
            echo "📊 Verificando status do sistema..."
            exec_remote "pm2 status" "Status PM2"
            exec_remote "curl -s http://localhost:8080/health || echo 'Health endpoint não disponível'" "Health Check"
            exec_remote "df -h" "Espaço em disco"
            exec_remote "free -h" "Uso de memória"
            ;;
        2)
            echo "🔄 Atualizando código do GitHub..."
            exec_remote "git status" "Status Git"
            exec_remote "git pull origin main" "Git Pull"
            ;;
        3)
            echo "🚀 Reiniciando bot..."
            exec_remote "pm2 restart whatsapp-bot" "Restart PM2"
            exec_remote "pm2 status whatsapp-bot" "Status após restart"
            ;;
        4)
            echo "📋 Visualizando logs..."
            exec_remote "pm2 logs whatsapp-bot --lines 20 --nostream" "Logs PM2"
            ;;
        5)
            echo "🌐 Executando health check..."
            exec_remote "curl -v http://localhost:8080/health" "Health Check Detalhado"
            exec_remote "netstat -tlnp | grep :8080" "Verificar porta 8080"
            ;;
        6)
            echo "📁 Listando arquivos..."
            exec_remote "ls -la" "Listar diretório"
            exec_remote "ls -la src/" "Listar src/"
            exec_remote "ls -la logs/" "Listar logs/"
            ;;
        7)
            echo "💻 Conectando SSH interativo..."
            echo "Para sair, digite 'exit'"
            ssh $SERVER_USER@$SERVER_IP -t "cd $SERVER_PATH && bash"
            ;;
        8)
            echo "🏃 Executando deploy completo..."
            exec_remote "git pull origin main" "1. Git Pull"
            exec_remote "npm install --production" "2. Instalar dependências"
            exec_remote "pm2 restart whatsapp-bot" "3. Restart PM2"
            exec_remote "sleep 5 && curl -s http://localhost:8080/health" "4. Health Check"
            exec_remote "pm2 status whatsapp-bot" "5. Status final"
            echo -e "${GREEN}🎉 Deploy completo finalizado!${NC}"
            ;;
        9)
            echo "👋 Saindo..."
            exit 0
            ;;
        *)
            echo -e "${RED}❌ Opção inválida!${NC}"
            ;;
    esac
    
    echo ""
    read -p "Pressione ENTER para continuar..."
    clear
done
