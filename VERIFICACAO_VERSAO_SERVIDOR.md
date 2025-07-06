# 🔍 VERIFICAÇÃO DE VERSÃO DO SERVIDOR

## 📊 **INFORMAÇÕES DA VERSÃO LOCAL:**

**Último commit local:** `a72939d`  
**Mensagem:** 🚀 Script de deploy automatizado para servidor  
**Data:** 06/07/2025  

---

## 🌐 **COMO VERIFICAR O SERVIDOR:**

### **1. Conecte ao servidor e execute:**
```bash
ssh root@161.35.176.216
cd /var/www/html
git log -1 --oneline
```

### **2. Compare com a versão local:**
- **Local:** `a72939d - 🚀 Script de deploy automatizado para servidor`
- **Servidor:** (execute o comando acima para ver)

---

## 🎯 **SE O SERVIDOR ESTIVER DESATUALIZADO:**

### **Opção 1: Deploy automatizado**
```bash
./deploy-automatico-servidor.sh
```

### **Opção 2: Atualização manual**
```bash
ssh root@161.35.176.216 "cd /var/www/html && git pull && node populate-database.js && pm2 restart whatsapp-bot"
```

### **Opção 3: Verificação completa**
```bash
ssh root@161.35.176.216 "cd /var/www/html && git pull && ./test-servidor-completo.sh && pm2 restart whatsapp-bot && pm2 status"
```

---

## 📋 **ARQUIVOS QUE DEVEM EXISTIR NO SERVIDOR:**

Execute no servidor para verificar:
```bash
cd /var/www/html
ls -la | grep -E "(populate-database|deploy-automatico|test-servidor|test-comandos)"
```

**Arquivos esperados:**
- ✅ `populate-database.js` (corrige relatórios vazios)
- ✅ `deploy-automatico-servidor.sh` (deploy automático)
- ✅ `test-servidor-completo.sh` (testes completos)
- ✅ `test-comandos-whatsapp.js` (teste de comandos)

---

## 🚀 **VERIFICAÇÃO RÁPIDA:**

Execute este comando para verificar tudo de uma vez:
```bash
ssh root@161.35.176.216 "cd /var/www/html && echo 'COMMIT ATUAL:' && git log -1 --oneline && echo -e '\nARQUIVOS CRÍTICOS:' && ls -la populate-database.js deploy-automatico-servidor.sh test-*.sh test-*.js 2>/dev/null || echo 'Alguns arquivos podem estar faltando' && echo -e '\nSTATUS PM2:' && pm2 status"
```

---

## 🎯 **RESULTADO ESPERADO:**

Se o servidor estiver atualizado, você deve ver:
- **Commit:** `a72939d` ou mais recente
- **Arquivos:** Todos os scripts de teste e deploy presentes  
- **PM2:** Bot rodando com status "online"

---

## ⚡ **AÇÃO RECOMENDADA:**

**Execute a verificação rápida acima e depois:**

1. **Se commit for diferente** → Execute deploy
2. **Se arquivos faltando** → Execute git pull
3. **Se PM2 offline** → Execute pm2 restart whatsapp-bot

---

*Verificação criada em 06/07/2025 - Última versão local: a72939d*
