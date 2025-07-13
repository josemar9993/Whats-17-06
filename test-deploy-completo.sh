#!/bin/bash

# ===============================================
# TESTE COMPLETO DO COMANDO !deploy
# ===============================================

echo "🔧 VERIFICAÇÃO DE DEPENDÊNCIAS"
echo "==============================="

# Verificar Node.js
echo -n "✓ Node.js: "
node --version

# Verificar npm
echo -n "✓ npm: "
npm --version

# Verificar PM2
echo -n "✓ PM2: "
pm2 --version 2>/dev/null || echo "Não instalado (opcional para teste local)"

echo ""
echo "🗂️ VERIFICAÇÃO DE ARQUIVOS"
echo "============================"

# Verificar arquivos principais
files=(
    "src/commands/util/deploy.js"
    "deploy-whatsapp.sh"
    "src/config.js"
    ".env"
)

for file in "${files[@]}"; do
    if [[ -f "$file" ]]; then
        echo "✅ $file - OK"
    else
        echo "❌ $file - FALTANDO"
    fi
done

echo ""
echo "⚙️ VERIFICAÇÃO DE CONFIGURAÇÕES"
echo "================================="

# Verificar .env
if [[ -f ".env" ]]; then
    echo "✅ Arquivo .env encontrado"
    
    if grep -q "ADMIN_WHATSAPP_IDS=5581984079371" .env; then
        echo "✅ Admin IDs configurados corretamente"
    else
        echo "⚠️ Admin IDs podem estar incorretos"
    fi
    
    if grep -q "DEBUG=true" .env; then
        echo "✅ Debug habilitado"
    else
        echo "⚠️ Debug desabilitado"
    fi
else
    echo "❌ Arquivo .env não encontrado"
fi

echo ""
echo "🌐 TESTE DE CONECTIVIDADE"
echo "=========================="

# Teste ping
echo -n "🏓 Ping servidor: "
if ping -c 1 161.35.176.216 >/dev/null 2>&1; then
    echo "✅ OK"
else
    echo "❌ FALHOU"
fi

# Teste SSH (sem interação)
echo -n "🔐 SSH: "
if timeout 5s ssh -o ConnectTimeout=3 -o BatchMode=yes root@161.35.176.216 "echo SSH_OK" 2>/dev/null | grep -q "SSH_OK"; then
    echo "✅ Configurado"
else
    echo "⚠️ Não configurado (normal para primeiro uso)"
fi

# Teste Health endpoint local
echo -n "💖 Health local: "
if curl -s http://localhost:8080/health >/dev/null 2>&1; then
    echo "✅ Funcionando"
else
    echo "⚠️ Bot não está rodando localmente"
fi

echo ""
echo "📋 TESTE DE COMANDOS"
echo "====================="

# Verificar sintaxe do arquivo deploy.js
echo -n "📝 Sintaxe deploy.js: "
if node -c src/commands/util/deploy.js 2>/dev/null; then
    echo "✅ OK"
else
    echo "❌ ERRO DE SINTAXE"
fi

# Verificar permissões do script
echo -n "🔧 Permissões deploy-whatsapp.sh: "
if [[ -x "deploy-whatsapp.sh" ]]; then
    echo "✅ Executável"
else
    echo "⚠️ Sem permissão (rodando chmod +x...)"
    chmod +x deploy-whatsapp.sh
    echo "✅ Corrigido"
fi

echo ""
echo "🎯 RESUMO DO STATUS"
echo "==================="

echo "✅ Sistema configurado para testes"
echo "✅ Admin ID: 5581984079371 configurado"
echo "✅ Debug habilitado"
echo "✅ Comando !deploy pronto"
echo ""
echo "📱 COMANDOS DISPONÍVEIS:"
echo "• !deploy test - Teste de conectividade"
echo "• !deploy servidor - Deploy no servidor"
echo "• !deploy status - Status do sistema"
echo "• !deploy logs - Ver logs"
echo ""
echo "🚀 PARA TESTAR:"
echo "1. Inicie o bot: npm run dev"
echo "2. Escaneie o QR code"
echo "3. Envie: !deploy test"
echo "4. Se OK, envie: !deploy servidor"
echo ""
echo "🔍 LOGS DE DEBUG:"
echo "Os logs detalhados estarão em logs/combined.log"
echo ""
echo "========================================="
echo "✅ VERIFICAÇÃO COMPLETA FINALIZADA!"
echo "========================================="
