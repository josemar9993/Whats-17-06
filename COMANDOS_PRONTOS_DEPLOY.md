# 📋 COMANDOS PRONTOS PARA DEPLOY

## 🔧 **COPIE E COLE ESTES COMANDOS:**

### **1️⃣ BACKUP COMPLETO:**
```bash
ssh root@161.35.176.216 "cd /var/www/html && tar -czf backup-$(date +%Y%m%d-%H%M%S).tar.gz auth_data/ data/ logs/ .env && mkdir -p /root/backups/whatsapp-bot && mv backup-*.tar.gz /root/backups/whatsapp-bot/ && ls -la /root/backups/whatsapp-bot/"
```

### **2️⃣ DEPLOY COMPLETO:**
```bash
ssh root@161.35.176.216 "cd /var/www/html && git pull origin main && node populate-database.js && ./test-servidor-completo.sh && pm2 restart whatsapp-bot && sleep 10 && pm2 status && curl -s http://localhost:8080/health"
```

### **3️⃣ VALIDAÇÃO RÁPIDA:**
```bash
ssh root@161.35.176.216 "pm2 status && echo '---' && curl -s http://localhost:8080/health && echo '---' && sqlite3 data/messages.db 'SELECT COUNT(*) FROM messages;'"
```

### **4️⃣ ROLLBACK DE EMERGÊNCIA:**
```bash
ssh root@161.35.176.216 "cd /var/www/html && pm2 stop whatsapp-bot && git reset --hard HEAD~1 && pm2 restart whatsapp-bot && pm2 status"
```

### **5️⃣ VERIFICAR LOGS:**
```bash
ssh root@161.35.176.216 "pm2 logs whatsapp-bot --lines 20"
```

### **6️⃣ MONITORAMENTO:**
```bash
ssh root@161.35.176.216 "pm2 monit"
```

---

## 🎯 **SEQUÊNCIA COMPLETA (BACKUP + DEPLOY + VALIDAÇÃO):**

```bash
# 1. Backup
ssh root@161.35.176.216 "cd /var/www/html && tar -czf backup-$(date +%Y%m%d-%H%M%S).tar.gz auth_data/ data/ logs/ .env && mkdir -p /root/backups/whatsapp-bot && mv backup-*.tar.gz /root/backups/whatsapp-bot/"

# 2. Deploy
ssh root@161.35.176.216 "cd /var/www/html && git pull origin main && node populate-database.js && ./test-servidor-completo.sh && pm2 restart whatsapp-bot"

# 3. Validação
ssh root@161.35.176.216 "sleep 10 && pm2 status && curl -s http://localhost:8080/health"
```
