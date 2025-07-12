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
ssh root@161.35.176.216
cd /var/www/html
git pull origin main
npm install
pm2 restart whatsapp-bot
rm -f logs/*.log  # Limpar logs antigos
pm2 logs whatsapp-bot --lines 20  # Verificar logs limpos
```

### 2. Deploy Ultra Rápido (One-liner)
```bash
ssh root@161.35.176.216 "cd /var/www/html && git pull origin main && npm install && pm2 restart whatsapp-bot && rm -f logs/*.log && pm2 logs whatsapp-bot --lines 20"
```

### 3. Verificação Rápida
```bash
ssh root@161.35.176.216 "pm2 status && curl -s http://localhost:8080/health"
```

### 4. Ver Logs Remotamente
```bash
ssh root@161.35.176.216 "pm2 logs whatsapp-bot --lines 50"
```

### 5. Reiniciar Serviço
```bash
ssh root@161.35.176.216 "pm2 restart whatsapp-bot"
```

### 6. Backup Rápido
```bash
ssh root@161.35.176.216 "cd /var/www/html && cp data/messages.db data/messages.db.backup.$(date +%Y%m%d_%H%M%S)"
```

## 🔧 Comandos de Manutenção

### Limpar Logs
```bash
ssh root@161.35.176.216 "cd /var/www/html && rm -f logs/*.log"
```

### Monitorar Recursos
```bash
ssh root@161.35.176.216 "pm2 monit"
```

### Verificar Espaço em Disco
```bash
ssh root@161.35.176.216 "df -h"
```

### Limpar Sessão WhatsApp
```bash
ssh root@161.35.176.216 "cd /var/www/html && rm -rf .wwebjs_auth/ && pm2 restart whatsapp-bot"
```

## 🆘 Comandos de Emergência

### Parar Tudo
```bash
ssh root@161.35.176.216 "pm2 stop all"
```

### Reiniciar Tudo
```bash
ssh root@161.35.176.216 "pm2 restart all"
```

### Rollback
```bash
ssh root@161.35.176.216 "cd /var/www/html && git reset --hard HEAD~1 && pm2 restart whatsapp-bot"
```

---

**Servidor atual:** 161.35.176.216  
**Diretório do projeto:** /var/www/html  
**Processo PM2:** whatsapp-bot  

**Comando completo atual:**
```bash
ssh root@161.35.176.216 "cd /var/www/html && git pull origin main && npm install && pm2 restart whatsapp-bot && rm -f logs/*.log && pm2 logs whatsapp-bot --lines 20"
```
