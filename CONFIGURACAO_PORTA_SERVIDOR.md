# 🌐 CONFIGURAÇÃO DE PORTA NO SERVIDOR

## 📍 **PORTA CONFIGURADA: 8080**

### ✅ **CONFIGURAÇÃO ATUAL:**
- **Porta:** 8080 ✅
- **Protocolo:** HTTP ✅
- **Health Check:** http://161.35.176.216:8080/health ✅
- **Status:** http://161.35.176.216:8080/status ✅

---

## 🔧 **COMANDOS PARA CONFIGURAR PORTA NO SERVIDOR:**

### 1️⃣ **VERIFICAR PORTA ATUAL:**
```bash
# Conectar ao servidor
ssh root@161.35.176.216

# Verificar se porta 8080 está sendo usada
netstat -tulpn | grep :8080

# Verificar processo na porta
lsof -i :8080
```

### 2️⃣ **CONFIGURAR FIREWALL:**
```bash
# Verificar status do firewall
ufw status

# Liberar porta 8080 se necessário
ufw allow 8080/tcp

# Verificar regras
ufw status numbered
```

### 3️⃣ **TESTAR CONECTIVIDADE:**
```bash
# Teste local (dentro do servidor)
curl http://localhost:8080/health

# Teste externo (do seu computador)
curl http://161.35.176.216:8080/health

# Teste com timeout
curl -m 10 http://161.35.176.216:8080/health
```

### 4️⃣ **VERIFICAR CONFIGURAÇÃO DE REDE:**
```bash
# Verificar interfaces de rede
ip addr show

# Verificar rotas
ip route show

# Verificar DNS
nslookup 161.35.176.216
```

---

## 🔍 **DIAGNÓSTICO DE PROBLEMAS:**

### ❌ **SE PORTA NÃO RESPONDER:**

#### **Problema 1: Firewall bloqueando**
```bash
# Solução:
ufw allow 8080/tcp
ufw reload
```

#### **Problema 2: Processo não rodando**
```bash
# Verificar PM2
pm2 status

# Restart se necessário
pm2 restart whatsapp-bot

# Verificar logs
pm2 logs whatsapp-bot --lines 20
```

#### **Problema 3: Porta em uso**
```bash
# Verificar o que está usando a porta
sudo lsof -i :8080

# Matar processo se necessário (cuidado!)
sudo kill -9 <PID>
```

#### **Problema 4: Express não iniciado**
```bash
# Verificar se Express está no código
grep -n "app.listen" /var/www/html/src/index.js

# Verificar logs de erro
pm2 logs whatsapp-bot --err --lines 50
```

---

## 🎯 **VALIDAÇÃO COMPLETA DA PORTA:**

### ✅ **SCRIPT DE VALIDAÇÃO:**
```bash
#!/bin/bash
echo "🔍 VALIDANDO PORTA 8080 NO SERVIDOR"
echo "===================================="

# 1. Verificar se porta está ativa
if netstat -tulpn | grep -q ":8080"; then
    echo "✅ Porta 8080 ativa"
    netstat -tulpn | grep ":8080"
else
    echo "❌ Porta 8080 não encontrada"
fi

# 2. Testar health check local
echo ""
echo "🩺 Testando health check local..."
if curl -s http://localhost:8080/health > /dev/null; then
    echo "✅ Health check local OK"
    curl -s http://localhost:8080/health | head -n 3
else
    echo "❌ Health check local falhou"
fi

# 3. Verificar firewall
echo ""
echo "🔥 Verificando firewall..."
ufw status | grep 8080 || echo "⚠️ Regra de firewall não encontrada"

# 4. Verificar PM2
echo ""
echo "🚀 Verificando PM2..."
pm2 status | grep whatsapp-bot || echo "❌ Processo não encontrado"

echo ""
echo "🎯 Validação concluída!"
```

---

## 📊 **RESULTADOS ESPERADOS:**

### ✅ **Health Check OK:**
```json
{
  "status": "ok",
  "timestamp": "2025-07-06T16:XX:XX.XXXZ",
  "uptime": "Xh Xm Xs",
  "version": "1.1.0",
  "database": "connected",
  "commands": 15,
  "memory": "XX MB",
  "environment": "production"
}
```

### ✅ **Status OK:**
```json
{
  "status": "running",
  "whatsapp": "connected",
  "commands_loaded": 15,
  "uptime_seconds": XXXX,
  "node_version": "vXX.XX.X",
  "platform": "linux"
}
```

### ✅ **Netstat OK:**
```
tcp6    0    0 :::8080    :::*    LISTEN    XXXX/node
```

---

## 🚨 **COMANDOS DE EMERGÊNCIA:**

### **Se nada funcionar:**
```bash
# 1. Parar tudo
pm2 stop whatsapp-bot

# 2. Verificar se porta liberou
netstat -tulpn | grep :8080

# 3. Reiniciar processo
pm2 start ecosystem.config.js

# 4. Verificar logs
pm2 logs whatsapp-bot --lines 30

# 5. Testar novamente
curl http://localhost:8080/health
```

### **Restart completo do sistema:**
```bash
# Última opção - restart do servidor
sudo reboot
```

---

## 🎉 **CONFIGURAÇÃO FINALIZADA:**

Após seguir este guia:
- ✅ Porta 8080 ativa
- ✅ Health check funcionando
- ✅ Firewall configurado
- ✅ Acesso externo liberado
- ✅ Monitoramento ativo

**A porta 8080 é a correta e deve estar funcionando!** 🚀

---

*Guia criado em 06/07/2025*
*Porta padrão: 8080 (HTTP)*
