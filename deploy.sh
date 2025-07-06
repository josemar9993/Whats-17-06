#!/bin/bash

# Script de deploy para o WhatsApp Bot
# Este script deve ser executado no servidor de produção

echo "🚀 Iniciando deploy do WhatsApp Bot..."

# 1. Navegar para o diretório do projeto
cd /var/www/html || { echo "❌ Erro: Diretório /var/www/html não encontrado"; exit 1; }

echo "📁 Diretório atual: $(pwd)"

# 2. Parar todos os processos relacionados
echo "⏹️  Parando todos os processos PM2..."
pm2 stop all
pm2 delete all

# 3. Limpar processos órfãos na porta 8080
echo "🧹 Limpando processos na porta 8080..."
sudo lsof -ti:8080 | xargs -r sudo kill -9

# 4. Fazer backup do banco de dados (se existir)
if [ -f "data/messages.db" ]; then
    echo "💾 Fazendo backup do banco de dados..."
    cp data/messages.db data/messages.db.backup.$(date +%Y%m%d_%H%M%S)
fi

# 5. Puxar as últimas alterações do GitHub
echo "📥 Baixando últimas alterações do GitHub..."
git fetch origin
git reset --hard origin/main

# 6. Instalar/atualizar dependências
echo "📦 Instalando dependências..."
npm ci --only=production

# 7. Criar diretórios necessários
echo "📂 Criando diretórios necessários..."
mkdir -p logs
mkdir -p data
mkdir -p auth_data

# 8. Definir permissões corretas
echo "🔒 Definindo permissões..."
chmod -R 755 .
chmod -R 777 logs
chmod -R 777 data
chmod -R 777 auth_data

# 9. Iniciar o bot usando o arquivo de configuração do PM2
echo "🏁 Iniciando o bot com PM2..."
pm2 start ecosystem.config.js --env production

# 10. Verificar status
echo "📊 Status dos processos PM2:"
pm2 status

# 11. Mostrar logs iniciais
echo "📝 Logs iniciais (últimas 20 linhas):"
sleep 3
pm2 logs whatsapp-bot --lines 20

echo "✅ Deploy concluído!"
echo "🌐 Health check disponível em: http://161.35.176.216:8080/health"
echo "📊 Para ver logs: pm2 logs whatsapp-bot"
echo "🔄 Para reiniciar: pm2 restart whatsapp-bot"
