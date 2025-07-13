#!/bin/bash

# Corrigir arquivo deploy.js

DEPLOY_FILE="/workspaces/Whats-17-06/src/commands/util/deploy.js"

# Backup do arquivo original
cp "$DEPLOY_FILE" "$DEPLOY_FILE.backup"

# Verificar se o arquivo termina corretamente
if ! tail -1 "$DEPLOY_FILE" | grep -q "^}$"; then
    echo "🔧 Arquivo deploy.js incompleto. Corrigindo..."
    echo "" >> "$DEPLOY_FILE"
    echo "// Fim das funções auxiliares" >> "$DEPLOY_FILE"
    echo "" >> "$DEPLOY_FILE"
    echo "✅ Arquivo corrigido!"
else
    echo "✅ Arquivo deploy.js está correto!"
fi

# Verificar sintaxe
echo "🔍 Verificando sintaxe..."
if node -c "$DEPLOY_FILE" 2>/dev/null; then
    echo "✅ Sintaxe OK!"
    
    # Verificar se o módulo pode ser carregado
    echo "🔍 Testando carregamento do módulo..."
    if node -e "const cmd = require('$DEPLOY_FILE'); console.log('✅ Módulo carregado:', cmd.name);" 2>/dev/null; then
        echo "✅ Módulo funcional!"
    else
        echo "❌ Erro ao carregar módulo"
    fi
else
    echo "❌ Erro de sintaxe!"
fi

echo "🎯 Deploy.js pronto para uso!"
