# 🌐 **CONECTAR AO SERVIDOR - GUIA COMPLETO**

## 📋 **INFORMAÇÕES DO SERVIDOR:**

- **🎯 IP:** `161.35.176.216`
- **👤 Usuário:** `root`
- **📁 Diretório:** `/var/www/html`
- **🌐 Health Check:** `http://161.35.176.216:8080/health`

---

## 🚀 **SCRIPTS CRIADOS PARA VOCÊ:**

### **1. Diagnóstico Completo:**
```bash
./diagnostico-servidor.sh
```
**O que faz:** Testa conectividade, SSH, portas, chaves

### **2. Conexão Rápida:**
```bash
./servidor-rapido.sh
```
**O que faz:** Status, logs, deploy rápido

### **3. Menu Interativo:**
```bash
./conectar-servidor.sh
```
**O que faz:** Menu completo com todas as opções

---

## 🔧 **COMANDOS MANUAIS:**

### **Testar Conectividade:**
```bash
# Ping básico
ping -c 3 161.35.176.216

# Testar porta SSH
nc -z 161.35.176.216 22

# Testar health endpoint
curl http://161.35.176.216:8080/health
```

### **Conectar SSH:**
```bash
# Conexão direta
ssh root@161.35.176.216

# Com timeout
timeout 10s ssh root@161.35.176.216

# Executar comando remoto
ssh root@161.35.176.216 "cd /var/www/html && pm2 status"
```

### **Deploy Manual:**
```bash
# Update código
ssh root@161.35.176.216 "cd /var/www/html && git pull"

# Restart bot
ssh root@161.35.176.216 "cd /var/www/html && pm2 restart whatsapp-bot"

# Verificar status
ssh root@161.35.176.216 "cd /var/www/html && pm2 status"
```

---

## 🔑 **CONFIGURAR SSH (Primeira vez):**

### **1. Gerar chave SSH:**
```bash
ssh-keygen -t rsa -b 4096 -C "seu@email.com"
```

### **2. Copiar chave para servidor:**
```bash
ssh-copy-id root@161.35.176.216
```

### **3. Testar conexão:**
```bash
ssh root@161.35.176.216 "echo 'SSH funcionando!'"
```

---

## 📊 **MONITORAMENTO DO SERVIDOR:**

### **Status do Sistema:**
```bash
ssh root@161.35.176.216 "
  echo '📊 SYSTEM STATUS'
  echo '=================='
  uptime
  df -h
  free -h
  pm2 status
"
```

### **Logs do Bot:**
```bash
ssh root@161.35.176.216 "
  cd /var/www/html
  pm2 logs whatsapp-bot --lines 20 --nostream
"
```

### **Health Check:**
```bash
ssh root@161.35.176.216 "
  curl -v http://localhost:8080/health
  netstat -tlnp | grep :8080
"
```

---

## 🚀 **DEPLOY COMPLETO:**

### **Script de Deploy:**
```bash
ssh root@161.35.176.216 "
  cd /var/www/html
  echo '🔄 Updating code...'
  git pull origin main
  echo '📦 Installing dependencies...'
  npm install --production
  echo '🚀 Restarting bot...'
  pm2 restart whatsapp-bot
  echo '🌐 Health check...'
  sleep 5
  curl -s http://localhost:8080/health
  echo '📊 Final status...'
  pm2 status whatsapp-bot
  echo '✅ Deploy complete!'
"
```

---

## 🛠️ **TROUBLESHOOTING:**

### **Problema: SSH não conecta**
```bash
# Verificar conectividade
ping 161.35.176.216

# Verificar porta SSH
telnet 161.35.176.216 22

# Regenerar chaves SSH
rm ~/.ssh/id_rsa*
ssh-keygen -t rsa -b 4096
ssh-copy-id root@161.35.176.216
```

### **Problema: Bot não responde**
```bash
ssh root@161.35.176.216 "
  pm2 restart whatsapp-bot
  pm2 logs whatsapp-bot --lines 10
"
```

### **Problema: Health check falha**
```bash
ssh root@161.35.176.216 "
  netstat -tlnp | grep :8080
  curl -v http://localhost:8080/health
  pm2 restart whatsapp-bot
"
```

---

## 📱 **USO COM WHATSAPP:**

### **Depois que SSH estiver funcionando:**
```
# No WhatsApp, envie:
!deploy servidor

# O bot vai:
1. Conectar ao servidor via SSH
2. Fazer git pull
3. Reiniciar PM2
4. Verificar health check
5. Confirmar deploy
```

---

## 🎯 **TESTE RÁPIDO:**

### **1. Execute diagnóstico:**
```bash
./diagnostico-servidor.sh
```

### **2. Se SSH estiver OK, teste deploy:**
```bash
ssh root@161.35.176.216 "cd /var/www/html && git status && pm2 status"
```

### **3. Se tudo OK, teste WhatsApp:**
```
!deploy status
!deploy servidor
```

---

## ✅ **VERIFICAÇÃO FINAL:**

**🔍 Para verificar se tudo está funcionando:**

1. **SSH:** `ssh root@161.35.176.216 "echo OK"`
2. **Bot:** `ssh root@161.35.176.216 "pm2 status whatsapp-bot"`
3. **Health:** `curl http://161.35.176.216:8080/health`
4. **WhatsApp:** `!deploy status`

---

## 🎉 **AGORA VOCÊ PODE:**

✅ **Conectar ao servidor** via SSH  
✅ **Monitorar o sistema** remotamente  
✅ **Fazer deploy** pelo terminal  
✅ **Usar comando WhatsApp** `!deploy servidor`  
✅ **Debuggar problemas** facilmente  

**🚀 Servidor totalmente acessível e gerenciável!**
