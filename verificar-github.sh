#!/bin/bash

# ===============================================
# VERIFICAÇÃO FINAL - PRONTO PARA GITHUB
# ===============================================

echo "🔍 VERIFICAÇÃO FINAL DO PROJETO"
echo "================================="

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Contadores
ERRORS=0
WARNINGS=0

# Função para verificar arquivos críticos
check_file() {
    if [[ -f "$1" ]]; then
        echo -e "✅ $1"
    else
        echo -e "${RED}❌ $1 - FALTANDO${NC}"
        ((ERRORS++))
    fi
}

# Função para verificar diretórios
check_dir() {
    if [[ -d "$1" ]]; then
        echo -e "✅ $1/"
    else
        echo -e "${YELLOW}⚠️ $1/ - OPCIONAL${NC}"
        ((WARNINGS++))
    fi
}

echo ""
echo "📁 ESTRUTURA DE ARQUIVOS ESSENCIAIS"
echo "======================================"

# Arquivos obrigatórios
check_file "package.json"
check_file "README.md"
check_file "LICENSE"
check_file ".gitignore"
check_file ".env.example"
check_file "ecosystem.config.js"
check_file "Dockerfile"

echo ""
echo "📂 DIRETÓRIOS PRINCIPAIS"
echo "========================="

check_dir "src"
check_dir "src/commands"
check_dir "src/commands/util"
check_dir "src/commands/group"
check_dir ".github"
check_dir "docs"

echo ""
echo "🔧 ARQUIVOS DE CONFIGURAÇÃO"
echo "============================"

check_file "src/index.js"
check_file "src/config.js"
check_file "src/database.js"
check_file "src/logger.js"
check_file "deploy-digitalocean.sh"
check_file "deploy-whatsapp.sh"

echo ""
echo "📊 CONTAGEM DE COMANDOS"
echo "======================="

UTIL_COMMANDS=$(find src/commands/util -name "*.js" -type f 2>/dev/null | wc -l)
GROUP_COMMANDS=$(find src/commands/group -name "*.js" -type f 2>/dev/null | wc -l)
TOTAL_COMMANDS=$((UTIL_COMMANDS + GROUP_COMMANDS))

echo "📝 Comandos /util: $UTIL_COMMANDS"
echo "👥 Comandos /group: $GROUP_COMMANDS"
echo "🎯 Total: $TOTAL_COMMANDS comandos"

echo ""
echo "🔍 VERIFICAÇÕES DE SEGURANÇA"
echo "============================="

# Verificar se .env não está commitado
if [[ -f ".env" ]]; then
    if git check-ignore .env >/dev/null 2>&1; then
        echo "✅ .env ignorado pelo git"
    else
        echo -e "${RED}❌ .env NÃO está no .gitignore!${NC}"
        ((ERRORS++))
    fi
else
    echo "✅ .env não existe (correto para GitHub)"
fi

# Verificar se node_modules está ignorado
if git check-ignore node_modules >/dev/null 2>&1; then
    echo "✅ node_modules ignorado pelo git"
else
    echo -e "${YELLOW}⚠️ node_modules pode não estar ignorado${NC}"
    ((WARNINGS++))
fi

# Verificar se logs estão ignorados
if git check-ignore logs >/dev/null 2>&1; then
    echo "✅ logs/ ignorado pelo git"
else
    echo -e "${YELLOW}⚠️ logs/ pode não estar ignorado${NC}"
    ((WARNINGS++))
fi

echo ""
echo "📦 PACKAGE.JSON"
echo "==============="

# Verificar campos obrigatórios no package.json
if [[ -f "package.json" ]]; then
    if grep -q "\"name\"" package.json; then
        NAME=$(grep "\"name\"" package.json | cut -d'"' -f4)
        echo "✅ Nome: $NAME"
    fi
    
    if grep -q "\"version\"" package.json; then
        VERSION=$(grep "\"version\"" package.json | cut -d'"' -f4)
        echo "✅ Versão: $VERSION"
    fi
    
    if grep -q "\"description\"" package.json; then
        echo "✅ Descrição: Presente"
    else
        echo -e "${YELLOW}⚠️ Descrição ausente${NC}"
        ((WARNINGS++))
    fi
    
    if grep -q "\"repository\"" package.json; then
        echo "✅ Repository: Configurado"
    else
        echo -e "${YELLOW}⚠️ Repository não configurado${NC}"
        ((WARNINGS++))
    fi
    
    if grep -q "\"license\"" package.json; then
        echo "✅ License: Presente"
    else
        echo -e "${YELLOW}⚠️ License ausente${NC}"
        ((WARNINGS++))
    fi
fi

echo ""
echo "📖 README.MD"
echo "============"

if [[ -f "README.md" ]]; then
    # Verificar seções importantes
    if grep -q "# " README.md; then
        echo "✅ Título principal presente"
    fi
    
    if grep -q "## " README.md; then
        echo "✅ Seções organizadas"
    fi
    
    if grep -q "npm " README.md; then
        echo "✅ Comandos npm documentados"
    fi
    
    # Contar linhas
    LINES=$(wc -l < README.md)
    echo "📏 Tamanho: $LINES linhas"
    
    if [[ $LINES -gt 100 ]]; then
        echo "✅ Documentação completa"
    else
        echo -e "${YELLOW}⚠️ Documentação pode estar incompleta${NC}"
        ((WARNINGS++))
    fi
fi

echo ""
echo "🚫 GITIGNORE"
echo "============"

if [[ -f ".gitignore" ]]; then
    # Verificar entradas importantes
    ENTRIES=("node_modules" ".env" "logs" "data" "auth_data")
    
    for entry in "${ENTRIES[@]}"; do
        if grep -q "$entry" .gitignore; then
            echo "✅ $entry ignorado"
        else
            echo -e "${YELLOW}⚠️ $entry pode não estar ignorado${NC}"
            ((WARNINGS++))
        fi
    done
fi

echo ""
echo "🗃️ TAMANHO DO PROJETO"
echo "====================="

# Calcular tamanho (excluindo node_modules e git)
SIZE=$(du -sh --exclude=node_modules --exclude=.git . 2>/dev/null | cut -f1)
echo "📦 Tamanho total: $SIZE"

# Contar arquivos
JS_FILES=$(find . -name "*.js" -not -path "./node_modules/*" -type f | wc -l)
MD_FILES=$(find . -name "*.md" -type f | wc -l)
JSON_FILES=$(find . -name "*.json" -not -path "./node_modules/*" -type f | wc -l)

echo "📄 Arquivos .js: $JS_FILES"
echo "📝 Arquivos .md: $MD_FILES"
echo "⚙️ Arquivos .json: $JSON_FILES"

echo ""
echo "🎯 RESUMO FINAL"
echo "==============="

if [[ $ERRORS -eq 0 ]]; then
    echo -e "${GREEN}✅ PRONTO PARA GITHUB!${NC}"
    echo -e "${GREEN}✅ Nenhum erro crítico encontrado${NC}"
else
    echo -e "${RED}❌ $ERRORS erro(s) crítico(s) encontrado(s)${NC}"
    echo -e "${RED}❌ CORRIJA ANTES DE ENVIAR AO GITHUB${NC}"
fi

if [[ $WARNINGS -gt 0 ]]; then
    echo -e "${YELLOW}⚠️ $WARNINGS aviso(s) encontrado(s)${NC}"
    echo -e "${YELLOW}⚠️ Recomenda-se revisar${NC}"
fi

echo ""
echo "📋 CHECKLIST GITHUB:"
echo "- [ ] git add ."
echo "- [ ] git commit -m \"feat: WhatsApp Bot Enterprise v1.1.0 - Sistema completo\""
echo "- [ ] git push origin main"

echo ""
if [[ $ERRORS -eq 0 ]]; then
    echo -e "${GREEN}🚀 SISTEMA APROVADO PARA GITHUB!${NC}"
    exit 0
else
    echo -e "${RED}🔧 CORRIJA OS ERROS ANTES DE CONTINUAR${NC}"
    exit 1
fi
