# 🧪 GUIA DE TESTES NO SERVIDOR - WhatsApp Bot Enterprise

## 🎯 **OBJETIVO**
Testar completamente o sistema no servidor DigitalOcean (161.35.176.216) para confirmar que tudo está funcionando após o deploy.

---

## 🔧 **COMANDOS DE TESTE NO SERVIDOR**

### 1. **Conectar ao Servidor**
```bash
ssh root@161.35.176.216
```

### 2. **Verificar Status do Sistema**
```bash
# Navegar para o diretório do projeto
cd /var/www/html

# Verificar se o código foi atualizado
git log --oneline -5
git status

# Verificar status do PM2
pm2 status
pm2 info whatsapp-bot
```

### 3. **Verificar Logs do Sistema**
```bash
# Logs em tempo real (últimas 50 linhas)
pm2 logs whatsapp-bot --lines 50

# Logs apenas de erro
pm2 logs whatsapp-bot --err

# Monitoramento em tempo real
pm2 monit
```

### 4. **Testes de Funcionalidade**
```bash
# Teste do sistema básico
node test-system.js

# Teste de conexão com banco
node test-connection.js

# Verificar dependências
npm list --depth=0

# Verificar se todos os comandos estão carregados
ls -la src/commands/util/
```

### 5. **Teste de Health Check**
```bash
# Verificar se o Express está rodando
curl http://localhost:8080/health
curl http://161.35.176.216:8080/health

# Verificar status das portas
netstat -tulpn | grep :8080
```

### 6. **Teste de Email (se configurado)**
```bash
# Teste básico de email
node test-email-basic.js

# Teste completo de email
node test-email-final.js
```

### 7. **Verificar Arquivos Críticos**
```bash
# Verificar estrutura do projeto
ls -la

# Verificar configurações
cat .env.example
ls -la auth_data/
ls -la data/
ls -la logs/

# Verificar permissões
ls -la src/
```

### 8. **Teste de Comandos (se WhatsApp estiver conectado)**
```bash
# Verificar logs para confirmar comandos funcionando
tail -f logs/*.log | grep "COMANDO"

# Verificar banco de dados
sqlite3 data/messages.db "SELECT COUNT(*) FROM messages;"
sqlite3 data/messages.db "SELECT * FROM messages LIMIT 5;"
```

---

## 🔍 **CHECKLIST DE VALIDAÇÃO**

### ✅ **Sistema Base**
- [ ] Git atualizado com último commit
- [ ] PM2 mostrando status "online"
- [ ] Processo whatsapp-bot rodando
- [ ] Sem erros críticos nos logs

### ✅ **Conectividade**
- [ ] Porta 8080 acessível
- [ ] Health check respondendo
- [ ] Express server funcionando
- [ ] Firewall configurado corretamente

### ✅ **Banco de Dados**
- [ ] SQLite conectando
- [ ] Tabelas criadas
- [ ] Dados sendo salvos (se houver mensagens)

### ✅ **Funcionalidades**
- [ ] Comandos carregados (15 comandos)
- [ ] Logger funcionando
- [ ] Sistema de email configurado
- [ ] WhatsApp Web conectado (QR code ou sessão)

### ✅ **Performance**
- [ ] Consumo de CPU baixo (<10%)
- [ ] Uso de memória estável (<200MB)
- [ ] Sem memory leaks
- [ ] Uptime estável

---

## 🚨 **COMANDOS DE EMERGÊNCIA**

### **Se algo não estiver funcionando:**
```bash
# Restart completo
pm2 restart whatsapp-bot

# Rebuild se necessário
npm install --production

# Verificar logs de erro
pm2 logs whatsapp-bot --err --lines 100

# Restart do servidor (último recurso)
pm2 kill
pm2 start ecosystem.config.js
```

### **Backup de segurança:**
```bash
# Fazer backup dos dados
tar -czf backup-$(date +%Y%m%d).tar.gz auth_data/ data/ logs/

# Verificar espaço em disco
df -h
```

---

## 📊 **RESULTADOS ESPERADOS**

### ✅ **PM2 Status Esperado:**
```
┌──┬─────────────┬─────────────┬─────────┬─────────┬──────────┬────────┬──────┬───────────┬──────────┬──────────┬──────────┬──────────┐
│id│name         │namespace    │version  │mode     │pid       │uptime  │↺    │status    │cpu      │mem      │user     │watching │
├──┼─────────────┼─────────────┼─────────┼─────────┼──────────┼────────┼──────┼──────────┼─────────┼─────────┼─────────┼─────────┤
│0 │whatsapp-bot │default      │1.1.0    │fork     │XXXXX     │Xm      │0    │online    │0%       │XX.X mb   │root     │disabled │
└──┴─────────────┴─────────────┴─────────┴─────────┴──────────┴────────┴──────┴──────────┴─────────┴─────────┴─────────┴─────────┘
```

### ✅ **Health Check Esperado:**
```json
{
  "status": "ok",
  "timestamp": "2025-07-06T13:XX:XX.XXXZ",
  "uptime": "XXXs",
  "version": "1.1.0"
}
```

### ✅ **Logs Esperados:**
```
2025-07-06 XX:XX:XX info: Configurando o cliente do WhatsApp...
2025-07-06 XX:XX:XX info: [COMANDO CARREGADO] ajuda
2025-07-06 XX:XX:XX info: [COMANDO CARREGADO] alertas
...
2025-07-06 XX:XX:XX info: Cliente WhatsApp pronto!
```

---

## 🎯 **TESTE FINAL**

Após executar todos os comandos acima, o sistema deve estar:
- ✅ **Online** no PM2
- ✅ **Conectado** ao WhatsApp Web
- ✅ **Respondendo** comandos
- ✅ **Logando** atividades
- ✅ **Salvando** mensagens no banco

**Se todos os testes passarem, o sistema está 100% operacional!** 🚀

---

*Guia criado em 06/07/2025 para validação completa do sistema*
