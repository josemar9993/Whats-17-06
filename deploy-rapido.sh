#!/bin/bash

# Deploy Rápido - Comando Atual do Servidor
# Baseado no processo atual usado no servidor 161.35.176.216

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Iniciando deploy no servidor...${NC}"

# Verificar se há alterações não commitadas
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${BLUE}📝 Fazendo commit das alterações...${NC}"
    git add .
    git commit -m "chore: deploy $(date +'%Y-%m-%d %H:%M:%S')" --no-verify
    git push origin main --no-verify
fi

echo -e "${GREEN}🔄 Executando deploy no servidor...${NC}"

# Comando exato usado atualmente
ssh root@161.35.176.216 "cd /var/www/html && git pull origin main && npm install && pm2 restart whatsapp-bot && rm -f logs/*.log && pm2 logs whatsapp-bot --lines 20"

echo -e "${GREEN}✅ Deploy concluído!${NC}"
echo -e "${BLUE}💡 Teste o bot enviando !teste no WhatsApp${NC}"
