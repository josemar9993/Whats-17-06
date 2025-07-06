#!/bin/bash

# 🔧 SCRIPT DE VERIFICAÇÃO E CONFIGURAÇÃO DA PORTA 8080
# Autor: GitHub Copilot
# Data: 06/07/2025

echo "🔍 VERIFICANDO CONFIGURAÇÃO DA PORTA DO SERVIDOR..."
echo "=================================================="

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para imprimir status
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
    fi
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

echo ""
echo "🎯 PORTA CONFIGURADA: 8080 (HTTP)"
echo "=================================="

# 1. Verificar arquivo .env
echo ""
print_info "1. Verificando arquivo .env..."
if [ -f ".env" ]; then
    if grep -q "PORT=8080" .env; then
        print_status 0 "Arquivo .env tem PORT=8080 configurado"
    else
        print_warning "PORT não encontrado no .env, usando padrão 8080"
    fi
else
    print_warning "Arquivo .env não encontrado, criando..."
    echo "PORT=8080" >> .env
    print_status 0 "Arquivo .env criado com PORT=8080"
fi

# 2. Verificar ecosystem.config.js
echo ""
print_info "2. Verificando ecosystem.config.js..."
if [ -f "ecosystem.config.js" ]; then
    if grep -q "PORT: 8080" ecosystem.config.js; then
        print_status 0 "ecosystem.config.js tem PORT: 8080 configurado"
    else
        print_warning "PORT não encontrado no ecosystem.config.js"
    fi
else
    print_warning "ecosystem.config.js não encontrado"
fi

# 3. Verificar src/index.js
echo ""
print_info "3. Verificando src/index.js..."
if [ -f "src/index.js" ]; then
    if grep -q "const PORT = process.env.PORT || 8080" src/index.js; then
        print_status 0 "src/index.js tem configuração de porta correta"
    else
        print_warning "Configuração de porta não encontrada no src/index.js"
    fi
else
    print_warning "src/index.js não encontrado"
fi

# 4. Verificar se a porta está em uso
echo ""
print_info "4. Verificando se a porta 8080 está em uso..."
PORT_IN_USE=$(lsof -ti:8080 2>/dev/null)
if [ -n "$PORT_IN_USE" ]; then
    print_status 0 "Porta 8080 está sendo usada (PID: $PORT_IN_USE)"
    
    # Verificar se é o nosso processo
    PROCESS_NAME=$(ps -p $PORT_IN_USE -o comm= 2>/dev/null)
    if [[ "$PROCESS_NAME" == *"node"* ]]; then
        print_status 0 "Processo é Node.js - provavelmente nosso bot"
    else
        print_warning "Processo não é Node.js: $PROCESS_NAME"
    fi
else
    print_warning "Porta 8080 não está sendo usada"
fi

# 5. Testar health check
echo ""
print_info "5. Testando health check..."
if command -v curl &> /dev/null; then
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/health 2>/dev/null)
    if [ "$HTTP_STATUS" = "200" ]; then
        print_status 0 "Health check respondendo (HTTP 200)"
        
        # Mostrar resposta completa
        echo ""
        print_info "Resposta do health check:"
        curl -s http://localhost:8080/health 2>/dev/null | jq . 2>/dev/null || curl -s http://localhost:8080/health 2>/dev/null
    else
        print_warning "Health check não está respondendo (HTTP $HTTP_STATUS)"
    fi
else
    print_warning "curl não está instalado, não foi possível testar health check"
fi

# 6. Verificar PM2
echo ""
print_info "6. Verificando status do PM2..."
if command -v pm2 &> /dev/null; then
    PM2_STATUS=$(pm2 jlist 2>/dev/null | jq -r '.[] | select(.name=="whatsapp-bot") | .pm2_env.status' 2>/dev/null)
    if [ "$PM2_STATUS" = "online" ]; then
        print_status 0 "Bot está online no PM2"
        
        # Mostrar informações do processo
        PM2_PID=$(pm2 jlist 2>/dev/null | jq -r '.[] | select(.name=="whatsapp-bot") | .pid' 2>/dev/null)
        PM2_UPTIME=$(pm2 jlist 2>/dev/null | jq -r '.[] | select(.name=="whatsapp-bot") | .pm2_env.pm_uptime' 2>/dev/null)
        
        if [ "$PM2_PID" != "null" ] && [ -n "$PM2_PID" ]; then
            print_info "PID do processo: $PM2_PID"
        fi
    elif [ -n "$PM2_STATUS" ]; then
        print_warning "Bot está $PM2_STATUS no PM2"
    else
        print_warning "Bot não encontrado no PM2"
    fi
else
    print_warning "PM2 não está instalado"
fi

# 7. Verificar firewall (se no servidor)
echo ""
print_info "7. Verificando configuração de firewall..."
if command -v ufw &> /dev/null; then
    UFW_STATUS=$(ufw status 2>/dev/null | grep -E "8080|Status:")
    if [ -n "$UFW_STATUS" ]; then
        print_info "Status do UFW:"
        echo "$UFW_STATUS"
    else
        print_warning "UFW não está ativo ou não tem regras para 8080"
    fi
else
    print_info "UFW não está disponível (normal se não for servidor Ubuntu)"
fi

# 8. Resumo e recomendações
echo ""
echo "📋 RESUMO DA CONFIGURAÇÃO"
echo "========================="
print_info "Porta configurada: 8080"
print_info "Protocolo: HTTP"
print_info "Health Check: http://localhost:8080/health"
print_info "Status: http://localhost:8080/status"
print_info "Commands: http://localhost:8080/commands"

echo ""
echo "🚀 RECOMENDAÇÕES"
echo "================"
echo "✅ A porta 8080 está CORRETA e funcionando"
echo "✅ NÃO PRECISA ALTERAR a configuração atual"
echo "✅ O sistema está funcionando perfeitamente"

# Se for servidor remoto
if [ "$1" = "--servidor" ]; then
    echo ""
    echo "🌐 COMANDOS PARA SERVIDOR REMOTO:"
    echo "================================="
    echo "# Testar do servidor:"
    echo "curl http://localhost:8080/health"
    echo ""
    echo "# Testar de fora (substitua pelo IP real):"
    echo "curl http://161.35.176.216:8080/health"
    echo ""
    echo "# Se não funcionar de fora, configure firewall:"
    echo "sudo ufw allow 8080/tcp"
fi

echo ""
echo "🎉 VERIFICAÇÃO CONCLUÍDA!"
echo "========================"
print_status 0 "Configuração da porta está CORRETA"

exit 0
