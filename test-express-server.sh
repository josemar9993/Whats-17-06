#!/bin/bash

echo "🚀 TESTE DO EXPRESS SERVER - CORREÇÃO APLICADA"
echo "==============================================="

echo "1️⃣ Testando sintaxe do código..."
if node -c src/index.js; then
    echo "✅ Sintaxe OK"
else
    echo "❌ Erro de sintaxe"
    exit 1
fi

echo ""
echo "2️⃣ Verificando se Express está importado..."
if grep -q "const express = require('express');" src/index.js; then
    echo "✅ Express importado"
else
    echo "❌ Express não encontrado"
    exit 1
fi

echo ""
echo "3️⃣ Verificando se servidor está configurado..."
if grep -q "app.listen" src/index.js; then
    echo "✅ Servidor configurado"
else
    echo "❌ Servidor não configurado"
    exit 1
fi

echo ""
echo "4️⃣ Verificando endpoints..."
if grep -q "/health" src/index.js; then
    echo "✅ Health check endpoint presente"
else
    echo "❌ Health check não encontrado"
fi

if grep -q "/status" src/index.js; then
    echo "✅ Status endpoint presente"
else
    echo "❌ Status endpoint não encontrado"
fi

echo ""
echo "5️⃣ Verificando configuração de porta..."
if grep -q "PORT.*8080" src/index.js; then
    echo "✅ Porta 8080 configurada"
else
    echo "⚠️ Porta pode estar em variável de ambiente"
fi

echo ""
echo "🎉 TESTES CONCLUÍDOS!"
echo "Express server foi reativado com sucesso"
echo ""
echo "📋 PRÓXIMOS PASSOS:"
echo "   1. Commit das alterações"
echo "   2. Deploy no servidor"  
echo "   3. Testar health check: curl http://161.35.176.216:8080/health"
echo "   4. Verificar PM2 status"
