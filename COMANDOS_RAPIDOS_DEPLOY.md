# Comandos Rápidos para Deploy - WhatsApp Bot

## 🚀 Deploy Automático (Recomendado)
```bash
./deploy-automatico.sh
```

## 📋 Comandos Manuais Essenciais

### 1. Deploy Manual Completo
```bash
# No seu computador local:
git add .
git commit -m "feat: suas alterações aqui"
git push origin main --no-verify

# No servidor:
ssh root@SEU_IP_SERVIDOR
cd /opt/whatsapp-bot
pm2 stop whatsapp-bot
git pull origin main
npm install --production
pm2 start whatsapp-bot
pm2 logs whatsapp-bot --lines 20
```

### 2. Deploy Ultra Rápido (One-liner)
```bash
ssh root@SEU_IP_SERVIDOR "cd /opt/whatsapp-bot && pm2 stop whatsapp-bot && git pull origin main && pm2 start whatsapp-bot"
```

### 3. Verificação Rápida
```bash
ssh root@SEU_IP_SERVIDOR "pm2 status && curl -s http://localhost:8080/health"
```

### 4. Ver Logs Remotamente
```bash
ssh root@SEU_IP_SERVIDOR "pm2 logs whatsapp-bot --lines 50"
```

### 5. Reiniciar Serviço
```bash
ssh root@SEU_IP_SERVIDOR "pm2 restart whatsapp-bot"
```

### 6. Backup Rápido
```bash
ssh root@SEU_IP_SERVIDOR "cd /opt/whatsapp-bot && cp data/messages.db data/messages.db.backup.$(date +%Y%m%d_%H%M%S)"
```

## 🔧 Comandos de Manutenção

### Limpar Logs
```bash
ssh root@SEU_IP_SERVIDOR "pm2 flush whatsapp-bot"
```

### Monitorar Recursos
```bash
ssh root@SEU_IP_SERVIDOR "pm2 monit"
```

### Verificar Espaço em Disco
```bash
ssh root@SEU_IP_SERVIDOR "df -h"
```

### Limpar Sessão WhatsApp
```bash
ssh root@SEU_IP_SERVIDOR "cd /opt/whatsapp-bot && rm -rf .wwebjs_auth/ && pm2 restart whatsapp-bot"
```

## 🆘 Comandos de Emergência

### Parar Tudo
```bash
ssh root@SEU_IP_SERVIDOR "pm2 stop all"
```

### Reiniciar Tudo
```bash
ssh root@SEU_IP_SERVIDOR "pm2 restart all"
```

### Rollback
```bash
ssh root@SEU_IP_SERVIDOR "cd /opt/whatsapp-bot && git reset --hard HEAD~1 && pm2 restart whatsapp-bot"
```

---

**Dica:** Substitua `SEU_IP_SERVIDOR` pelo IP real do seu servidor DigitalOcean.

**Exemplo:** Se o IP for `164.90.140.123`, use:
```bash
ssh root@164.90.140.123 "pm2 status"
```
