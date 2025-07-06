#!/bin/bash

echo "🚀 SCRIPT DE INICIALIZAÇÃO DO WHATSAPP BOT"
echo "=========================================="

# Verificar se o Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não está instalado!"
    exit 1
fi

echo "✅ Node.js $(node --version) encontrado"

# Verificar se npm está instalado
if ! command -v npm &> /dev/null; then
    echo "❌ NPM não está instalado!"
    exit 1
fi

echo "✅ NPM $(npm --version) encontrado"

# Navegar para o diretório do projeto
cd /workspaces/Whats-17-06

# Verificar se package.json existe
if [ ! -f "package.json" ]; then
    echo "❌ package.json não encontrado!"
    exit 1
fi

echo "✅ package.json encontrado"

# Verificar se .env existe
if [ ! -f ".env" ]; then
    echo "❌ Arquivo .env não encontrado!"
    echo "🔧 Copiando do .env.example..."
    cp .env.example .env
fi

echo "✅ Arquivo .env encontrado"

# Verificar se node_modules existe
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Erro ao instalar dependências!"
        exit 1
    fi
fi

echo "✅ Dependências instaladas"

# Criar diretórios necessários
mkdir -p data logs auth_data
echo "✅ Diretórios criados"

# Testar configuração básica
echo "🧪 Testando configuração..."
node -e "
require('dotenv').config();
console.log('✅ Dotenv carregado');
console.log('✅ COMMAND_PREFIX:', process.env.COMMAND_PREFIX || 'Não definido');
console.log('✅ ADMIN_WHATSAPP_IDS:', process.env.ADMIN_WHATSAPP_IDS || 'Não definido');
"

if [ $? -ne 0 ]; then
    echo "❌ Erro na configuração!"
    exit 1
fi

echo "✅ Configuração testada com sucesso"

# Testar banco de dados
echo "🗄️ Testando banco de dados..."
node -e "
const db = require('./src/database');
console.log('✅ Banco de dados conectado');
"

if [ $? -ne 0 ]; then
    echo "❌ Erro no banco de dados!"
    exit 1
fi

echo "✅ Banco de dados funcionando"

echo ""
echo "🎉 SISTEMA PRONTO PARA EXECUÇÃO!"
echo "=========================================="
echo "Para iniciar o bot, execute:"
echo "  npm start"
echo ""
echo "Para executar em modo desenvolvimento:"
echo "  npm run dev"
echo ""
echo "Para ver logs em tempo real:"
echo "  tail -f logs/*.log"
echo ""
echo "📝 IMPORTANTE:"
echo "1. Configure seus números de WhatsApp no arquivo .env"
echo "2. Configure as credenciais de email se necessário"
echo "3. O bot criará um QR Code para conectar ao WhatsApp"
echo ""
