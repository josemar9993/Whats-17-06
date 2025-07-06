#!/bin/bash

# ================================
# SCRIPT DE ATUALIZAÇÃO DO SERVIDOR
# ================================

echo "=== ATUALIZANDO CÓDIGO DO SERVIDOR ==="

# 1. Parar todos os processos PM2
echo "1. Parando processos PM2..."
pm2 stop all
pm2 delete all

# 2. Verificar se a porta 8080 está livre
echo "2. Verificando porta 8080..."
netstat -tulpn | grep :8080
if [ $? -eq 0 ]; then
    echo "AVISO: Porta 8080 ainda está em uso!"
    # Tentar matar processo que está usando a porta
    sudo fuser -k 8080/tcp
fi

# 3. Navegar para o diretório do projeto
cd /var/www/html

# 4. Fazer backup do .env atual
echo "3. Fazendo backup do .env..."
cp .env .env.backup.$(date +%Y%m%d_%H%M%S)

# 5. Fazer pull do GitHub
echo "4. Atualizando código do GitHub..."
git stash  # Salva mudanças locais se houver
git pull origin main
git stash pop  # Restaura mudanças locais se necessário

# 6. Instalar/atualizar dependências
echo "5. Instalando dependências..."
npm install

# 7. Verificar se existe o diretório utils
echo "6. Verificando estrutura de diretórios..."
if [ ! -d "src/utils" ]; then
    mkdir -p src/utils
    echo "Diretório src/utils criado"
fi

# 8. Verificar se existe o arquivo mediaHandler.js
if [ ! -f "src/utils/mediaHandler.js" ]; then
    echo "AVISO: Arquivo mediaHandler.js não encontrado!"
    echo "O código pode não estar totalmente atualizado."
fi

# 9. Verificar se o summarizer.js está atualizado
echo "7. Verificando se summarizer.js tem as atualizações..."
if grep -q "gerarResumoAvancado" src/summarizer.js; then
    echo "✓ Summarizer atualizado encontrado"
else
    echo "⚠ Summarizer pode não estar atualizado"
fi

# 10. Verificar se o index.js tem tratamento de mídia
echo "8. Verificando tratamento de mídia no index.js..."
if grep -q "mediaHandler" src/index.js; then
    echo "✓ Tratamento de mídia encontrado"
else
    echo "⚠ Tratamento de mídia pode não estar ativo"
fi

# 11. Verificar .env
echo "9. Verificando configurações do .env..."
if [ -f ".env" ]; then
    echo "✓ Arquivo .env encontrado"
    # Verificar se tem as configurações essenciais
    for var in "NODE_ENV" "PORT" "WHATSAPP_ADMIN_NUMBER" "EMAIL_USER"; do
        if grep -q "^$var=" .env; then
            echo "✓ $var configurado"
        else
            echo "⚠ $var não encontrado no .env"
        fi
    done
else
    echo "⚠ Arquivo .env não encontrado!"
fi

# 12. Testar se o Node.js consegue carregar o projeto
echo "10. Testando carregamento do projeto..."
node -c src/index.js
if [ $? -eq 0 ]; then
    echo "✓ Código válido"
else
    echo "⚠ Erro de sintaxe no código"
fi

# 13. Iniciar novamente com PM2
echo "11. Iniciando bot com PM2..."
pm2 start src/index.js --name "whatsapp-bot" --time

# 14. Verificar status
echo "12. Status final:"
pm2 status
pm2 logs whatsapp-bot --lines 10

echo "=== ATUALIZAÇÃO CONCLUÍDA ==="
echo "Monitore os logs com: pm2 logs whatsapp-bot"
