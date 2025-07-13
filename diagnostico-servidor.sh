#!/bin/bash

# ================================================
# DIAGNÓSTICO DE CONECTIVIDADE COM SERVIDOR
# ================================================

SERVER_IP="161.35.176.216"
SERVER_USER="root"

echo "🔍 DIAGNÓSTICO DE CONECTIVIDADE"
echo "==============================="
echo "🎯 Servidor: $SERVER_IP"
echo "👤 Usuário: $SERVER_USER"
echo ""

# 1. Verificar conectividade básica
echo "1️⃣ Testando conectividade básica..."
if timeout 5s ping -c 1 $SERVER_IP > /dev/null 2>&1; then
    echo "✅ Ping: Servidor responde"
else
    echo "❌ Ping: Servidor não responde"
fi

# 2. Verificar porta SSH (22)
echo ""
echo "2️⃣ Testando porta SSH (22)..."
if timeout 5s nc -z $SERVER_IP 22 > /dev/null 2>&1; then
    echo "✅ SSH: Porta 22 aberta"
else
    echo "❌ SSH: Porta 22 fechada ou filtrada"
fi

# 3. Verificar chaves SSH
echo ""
echo "3️⃣ Verificando chaves SSH..."
if [ -f ~/.ssh/id_rsa ]; then
    echo "✅ Chave privada encontrada: ~/.ssh/id_rsa"
else
    echo "❌ Chave privada não encontrada"
fi

if [ -f ~/.ssh/id_rsa.pub ]; then
    echo "✅ Chave pública encontrada: ~/.ssh/id_rsa.pub"
else
    echo "❌ Chave pública não encontrada"
fi

# 4. Testar SSH sem interação
echo ""
echo "4️⃣ Testando conexão SSH..."
if timeout 10s ssh -o ConnectTimeout=5 -o BatchMode=yes -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP "echo 'SSH OK'" > /dev/null 2>&1; then
    echo "✅ SSH: Conexão funcionando"
else
    echo "❌ SSH: Falha na conexão"
    echo ""
    echo "🔧 POSSÍVEIS SOLUÇÕES:"
    echo "1. Gerar chave SSH: ssh-keygen -t rsa -b 4096"
    echo "2. Copiar chave: ssh-copy-id $SERVER_USER@$SERVER_IP"
    echo "3. Verificar se servidor está online"
    echo "4. Verificar firewall"
fi

# 5. Informações de rede
echo ""
echo "5️⃣ Informações de rede local..."
echo "IP local: $(hostname -I | awk '{print $1}')"
echo "Gateway: $(ip route | grep default | awk '{print $3}')"

# 6. Tentativa de conexão manual
echo ""
echo "6️⃣ Para conectar manualmente, use:"
echo "ssh $SERVER_USER@$SERVER_IP"
echo ""
echo "📋 Para configurar SSH pela primeira vez:"
echo "1. ssh-keygen -t rsa -b 4096 -C 'your@email.com'"
echo "2. ssh-copy-id $SERVER_USER@$SERVER_IP"
echo "3. ssh $SERVER_USER@$SERVER_IP"

echo ""
echo "✅ Diagnóstico concluído!"
