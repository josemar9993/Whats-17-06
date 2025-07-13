# 🚀 **DEPLOY AUTOMÁTICO - GUIA COMPLETO**

## 📋 **COMO FUNCIONA O DEPLOY AUTOMÁTICO**

O seu projeto WhatsApp Bot Enterprise possui **múltiplas formas de deploy automático** para diferentes cenários:

---

## 🔧 **1. DEPLOY MANUAL LOCAL**

### **Comando Principal:**
```bash
npm run deploy
```
**Executa:** `./deploy-digitalocean.sh`

### **Scripts Disponíveis:**
- `npm start` - Execução local
- `npm run dev` - Desenvolvimento com nodemon
- `npm run setup` - Configuração inicial
- `npm run deploy` - Deploy para DigitalOcean

---

## 🌐 **2. DEPLOY PARA SERVIDOR (DigitalOcean)**

### **Script Principal:** `deploy-automatico-servidor.sh`

**Como funciona:**
```bash
./deploy-automatico-servidor.sh
```

### **Processo Automático:**
1. **📡 Conecta via SSH** ao servidor `161.35.176.216`
2. **🔄 Atualiza código** do GitHub (`git pull`)
3. **📦 Verifica dependências** (`npm install`)
4. **🗄️ Popula banco** com dados de teste
5. **🧪 Executa testes** automatizados
6. **🔄 Reinicia bot** via PM2
7. **📊 Verifica status** final
8. **🌐 Health check** do sistema

### **Configuração do Servidor:**
```bash
# Servidor: 161.35.176.216
# Diretório: /var/www/html
# Gerenciador: PM2
# Porta: 8080
```

---

## 🐳 **3. DEPLOY COM DOCKER**

### **Scripts Docker:**
```bash
# Build local
npm run docker:build-local

# Executar container
npm run docker:run-local

# Testar sistema
npm run docker:test-local

# Parar container
npm run docker:stop-local
```

### **Como funciona:**
1. **🔨 Build** da imagem Docker
2. **🗂️ Monta volumes** para dados persistentes
3. **🚀 Executa** container com WhatsApp Bot
4. **📊 Monitora** logs e status

---

## ⚙️ **4. DEPLOY COM PM2 (PRODUÇÃO)**

### **Configuração:** `ecosystem.config.js`

```javascript
module.exports = {
  apps: [{
    name: 'whatsapp-bot',
    script: 'src/index.js',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 8080
    },
    max_memory_restart: '1G',
    restart_delay: 1000,
    max_restarts: 10
  }]
};
```

### **Comandos PM2:**
```bash
# Iniciar
pm2 start ecosystem.config.js

# Reiniciar
pm2 restart whatsapp-bot

# Monitorar
pm2 monit

# Logs
pm2 logs whatsapp-bot

# Status
pm2 status
```

---

## 🔄 **5. CI/CD AUTOMÁTICO (GitHub Actions)**

### **Arquivo:** `.github/workflows/ci.yml`

**Trigger:** Push para branch `main`

### **Processo:**
1. **🔄 Checkout** do código
2. **📦 Setup** Node.js 20
3. **⬇️ Install** dependências
4. **🧹 Lint** código (ESLint)
5. **🧪 Testes** (Jest)

### **Como ativar:**
```bash
# Cada push para main executa automaticamente
git push origin main
```

---

## 📊 **6. MONITORAMENTO AUTOMÁTICO**

### **Scripts de Monitoramento:**
```bash
# Monitor em tempo real
npm run monitor

# Health check
curl http://localhost:8080/health

# Logs em tempo real
tail -f logs/*.log
```

### **Endpoints de Status:**
- `http://localhost:8080/health` - Health check
- `http://localhost:8080/status` - Status detalhado
- `http://localhost:8080/metrics` - Métricas do sistema

---

## 🎯 **7. CONFIGURAÇÃO AUTOMÁTICA**

### **Setup Inicial:**
```bash
./setup.sh
```

**O que faz:**
1. **✅ Verifica** Node.js e NPM
2. **📦 Instala** dependências
3. **📁 Cria** diretórios necessários
4. **🔧 Configura** `.env` se necessário
5. **🗄️ Testa** banco de dados
6. **🎉 Confirma** sistema pronto

---

## 🔐 **8. CONFIGURAÇÃO SSH (SERVIDOR)**

### **Para Deploy no Servidor:**
```bash
# Configurar chave SSH
ssh-keygen -t rsa -b 4096 -C "seu@email.com"

# Copiar chave para servidor
ssh-copy-id root@161.35.176.216

# Testar conexão
ssh root@161.35.176.216 "echo 'SSH OK'"
```

---

## 📋 **9. FLUXO COMPLETO DE DEPLOY**

### **Desenvolvimento → Produção:**

1. **👨‍💻 Desenvolvimento Local:**
   ```bash
   npm run dev
   ```

2. **🧪 Testes:**
   ```bash
   npm run validate  # lint + test + format
   ```

3. **📤 Commit & Push:**
   ```bash
   git add .
   git commit -m "feat: nova funcionalidade"
   git push origin main
   ```

4. **🔄 CI/CD Automático:**
   - GitHub Actions executa automaticamente
   - Testes são executados
   - Build é validado

5. **🚀 Deploy para Servidor:**
   ```bash
   ./deploy-automatico-servidor.sh
   ```

6. **📊 Monitoramento:**
   ```bash
   pm2 monit
   curl http://161.35.176.216:8080/health
   ```

---

## 🛠️ **10. COMANDOS ÚTEIS**

### **Deploy Completo:**
```bash
# Setup inicial
./setup.sh

# Validar código
npm run validate

# Deploy para servidor
./deploy-automatico-servidor.sh

# Monitorar
pm2 logs whatsapp-bot --lines 50
```

### **Troubleshooting:**
```bash
# Verificar sistema
node verificacao-completa.js

# Reiniciar tudo
pm2 restart whatsapp-bot

# Logs detalhados
pm2 logs whatsapp-bot --lines 100

# Status do sistema
pm2 status
```

---

## 🎯 **RESUMO: COMO USAR**

### **🚀 Deploy Rápido:**
```bash
# 1. Setup inicial (apenas primeira vez)
./setup.sh

# 2. Deploy para servidor
./deploy-automatico-servidor.sh

# 3. Monitorar
pm2 logs whatsapp-bot
```

### **🔄 Deploy Contínuo:**
```bash
# Cada alteração de código:
git add .
git commit -m "sua mensagem"
git push origin main

# GitHub Actions executa automaticamente
# Para aplicar no servidor:
./deploy-automatico-servidor.sh
```

### **🐳 Deploy Docker:**
```bash
# Build e execução
npm run docker:test-local

# Monitorar logs
docker logs whatsapp-bot-local -f
```

---

## 🎉 **BENEFÍCIOS DO DEPLOY AUTOMÁTICO:**

✅ **Deploy em 1 comando**  
✅ **Testes automáticos**  
✅ **Rollback rápido**  
✅ **Monitoramento integrado**  
✅ **Zero downtime**  
✅ **Logs centralizados**  
✅ **Health checks**  
✅ **Scaling automático**  

**🚀 Seu WhatsApp Bot está pronto para deploy profissional!**
