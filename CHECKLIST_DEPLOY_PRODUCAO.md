# 📋 CHECKLIST COMPLETO DE DEPLOY/ATUALIZAÇÃO EM PRODUÇÃO

## 🎯 **OBJETIVO**
Lista definitiva para NUNCA esquecer nenhum passo ao atualizar o sistema WhatsApp Bot Enterprise em produção. Siga TODOS os itens na ordem exata.

---

## 🚨 **ATENÇÃO: REGRAS FUNDAMENTAIS**
- ❌ **NUNCA** pule nenhum item desta lista
- ❌ **NUNCA** faça deploy sem testar localmente
- ❌ **NUNCA** atualize em horário de pico
- ❌ **NUNCA** esqueça de fazer backup
- ✅ **SEMPRE** teste cada comando antes de executar
- ✅ **SEMPRE** monitore logs após deploy

---

## 📝 **CHECKLIST PRÉ-DEPLOY (AMBIENTE LOCAL)**

### ✅ **1. VALIDAÇÃO DO CÓDIGO LOCAL**
- [ ] Todos os testes passando: `npm test`
- [ ] ESLint sem erros: `npm run lint`
- [ ] Sintaxe validada: `node -c src/index.js`
- [ ] Dependências atualizadas: `npm audit fix`
- [ ] Banco local funcionando: `sqlite3 data/messages.db ".tables"`

### ✅ **2. TESTES LOCAIS OBRIGATÓRIOS**
- [ ] `node test-basic.js` - Sistema básico
- [ ] `node test-system.js` - Diagnóstico completo
- [ ] `node populate-database.js` - Popular banco
- [ ] `./test-servidor-completo.sh` - Testes automatizados
- [ ] Verificar 15 comandos carregados

### ✅ **3. VALIDAÇÃO DE ARQUIVOS CRÍTICOS**
- [ ] `src/index.js` - Arquivo principal
- [ ] `src/config.js` - Configurações
- [ ] `src/database.js` - Banco de dados
- [ ] `package.json` - Dependências
- [ ] `ecosystem.config.js` - PM2
- [ ] `.env.example` - Variáveis de ambiente

### ✅ **4. COMMIT E PUSH PARA GITHUB**
- [ ] `git status` - Verificar arquivos
- [ ] `git add .` - Adicionar arquivos
- [ ] `git commit -m "Descrição clara"` - Commit
- [ ] `git push origin main` - Push
- [ ] Verificar commit no GitHub

---

## 🔄 **CHECKLIST DE BACKUP (SERVIDOR)**

### ✅ **5. BACKUP OBRIGATÓRIO ANTES DE QUALQUER ALTERAÇÃO**
```bash
# Conectar ao servidor
ssh root@161.35.176.216

# Ir para diretório do projeto
cd /var/www/html

# Backup completo com timestamp
tar -czf backup-$(date +%Y%m%d-%H%M%S).tar.gz auth_data/ data/ logs/ .env

# Verificar backup criado
ls -la backup-*.tar.gz

# Mover backup para pasta segura
mkdir -p /root/backups/whatsapp-bot
mv backup-*.tar.gz /root/backups/whatsapp-bot/

# Verificar espaço em disco
df -h
```

### ✅ **6. VERIFICAÇÃO DO BACKUP**
- [ ] Arquivo de backup criado
- [ ] Tamanho do backup > 0 bytes
- [ ] auth_data/ incluído no backup
- [ ] data/ incluído no backup
- [ ] logs/ incluído no backup
- [ ] .env incluído no backup (se existir)

---

## 🚀 **CHECKLIST DE DEPLOY (SERVIDOR)**

### ✅ **7. VERIFICAÇÃO PRÉ-ATUALIZAÇÃO**
```bash
# Verificar status atual
pm2 status
pm2 logs whatsapp-bot --lines 10

# Verificar commit atual
git log --oneline -1

# Verificar porta 8080
netstat -tulpn | grep :8080

# Verificar health check atual
curl -s http://localhost:8080/health
```

### ✅ **8. ATUALIZAÇÃO DO CÓDIGO**
```bash
# Verificar branch
git branch

# Fazer stash se necessário
git stash

# Atualizar código
git fetch --all
git pull origin main

# Verificar novo commit
git log --oneline -3
```

### ✅ **9. VERIFICAÇÃO PÓS-PULL**
- [ ] Commit atualizado corretamente
- [ ] Novos arquivos presentes
- [ ] Sem conflitos de merge
- [ ] Branch main ativo

### ✅ **10. ATUALIZAÇÃO DE DEPENDÊNCIAS (SE NECESSÁRIO)**
```bash
# Verificar package.json
cat package.json | grep version

# Instalar dependências (só se package.json mudou)
npm install --production

# Verificar dependências críticas
npm list whatsapp-web.js express sqlite3 --depth=0
```

### ✅ **11. POPULAR BANCO COM DADOS DE TESTE**
```bash
# SEMPRE executar para garantir dados para relatórios
node populate-database.js

# Verificar dados inseridos
sqlite3 data/messages.db "SELECT COUNT(*) FROM messages;"
```

### ✅ **12. EXECUTAR TESTES NO SERVIDOR**
```bash
# Testes automatizados
./test-servidor-completo.sh

# Teste básico
node test-basic.js

# Diagnóstico do sistema
node test-system.js
```

---

## 🔄 **CHECKLIST DE RESTART (SERVIDOR)**

### ✅ **13. RESTART DO BOT**
```bash
# Restart do processo
pm2 restart whatsapp-bot

# Aguardar 10 segundos
sleep 10

# Verificar status
pm2 status

# Verificar logs de inicialização
pm2 logs whatsapp-bot --lines 20
```

### ✅ **14. VALIDAÇÃO PÓS-RESTART**
- [ ] Status PM2: "online"
- [ ] PID novo gerado
- [ ] Uptime resetado
- [ ] CPU e Memória normais
- [ ] Sem erros nos logs

---

## 🩺 **CHECKLIST DE VALIDAÇÃO FINAL**

### ✅ **15. HEALTH CHECK OBRIGATÓRIO**
```bash
# Teste local
curl -s http://localhost:8080/health

# Teste externo
curl -s http://161.35.176.216:8080/health

# Verificar resposta JSON válida
```

### ✅ **16. VALIDAÇÃO DE FUNCIONALIDADES**
```bash
# Verificar comandos carregados
ls -la src/commands/util/ | wc -l

# Verificar banco de dados
sqlite3 data/messages.db "SELECT COUNT(*) FROM messages;"

# Verificar logs sem erros críticos
pm2 logs whatsapp-bot --err --lines 50
```

### ✅ **17. TESTE DE CONECTIVIDADE**
```bash
# Verificar porta ativa
netstat -tulpn | grep :8080

# Verificar processo node
ps aux | grep node

# Verificar uso de recursos
pm2 monit
```

---

## 📊 **CHECKLIST DE MONITORAMENTO PÓS-DEPLOY**

### ✅ **18. MONITORAMENTO IMEDIATO (PRIMEIROS 15 MINUTOS)**
- [ ] PM2 status "online" continuamente
- [ ] Health check respondendo
- [ ] CPU < 10%
- [ ] Memória < 200MB
- [ ] Sem erros nos logs
- [ ] Porta 8080 acessível

### ✅ **19. MONITORAMENTO ESTENDIDO (PRÓXIMAS 2 HORAS)**
- [ ] Uptime estável
- [ ] Sem memory leaks
- [ ] Logs normais
- [ ] WhatsApp conectado (se aplicável)
- [ ] Comandos funcionando (se testados)

---

## 🚨 **CHECKLIST DE EMERGÊNCIA (SE ALGO DEU ERRADO)**

### ✅ **20. ROLLBACK IMEDIATO**
```bash
# Parar o processo
pm2 stop whatsapp-bot

# Restaurar backup
cd /var/www/html
tar -xzf /root/backups/whatsapp-bot/backup-YYYYMMDD-HHMMSS.tar.gz

# Voltar para commit anterior
git reset --hard HEAD~1

# Restart
pm2 restart whatsapp-bot

# Verificar funcionamento
pm2 status
curl http://localhost:8080/health
```

### ✅ **21. DIAGNÓSTICO DE PROBLEMAS**
```bash
# Logs detalhados
pm2 logs whatsapp-bot --err --lines 100

# Verificar processo
pm2 info whatsapp-bot

# Verificar recursos
df -h
free -h

# Verificar portas
netstat -tulpn
```

---

## 📋 **CHECKLIST FINAL DE CONFIRMAÇÃO**

### ✅ **22. ANTES DE CONSIDERAR DEPLOY CONCLUÍDO**
- [ ] ✅ Backup realizado e verificado
- [ ] ✅ Código atualizado (commit correto)
- [ ] ✅ Dependências atualizadas (se necessário)
- [ ] ✅ Banco populado com dados
- [ ] ✅ Testes executados e passando
- [ ] ✅ PM2 status "online"
- [ ] ✅ Health check respondendo {"status":"ok"}
- [ ] ✅ Porta 8080 ativa
- [ ] ✅ Logs sem erros críticos
- [ ] ✅ Recursos (CPU/Memória) normais
- [ ] ✅ Sistema monitorado por 15+ minutos

### ✅ **23. DOCUMENTAÇÃO**
- [ ] Registrar horário do deploy
- [ ] Registrar commit deployado
- [ ] Registrar problemas encontrados
- [ ] Atualizar log de mudanças

---

## 🎯 **COMANDOS RÁPIDOS DE VALIDAÇÃO**

### **Deploy em Uma Linha (DEPOIS do backup):**
```bash
cd /var/www/html && git pull && node populate-database.js && ./test-servidor-completo.sh && pm2 restart whatsapp-bot && sleep 10 && pm2 status && curl -s http://localhost:8080/health
```

### **Validação Rápida:**
```bash
pm2 status && curl -s http://localhost:8080/health && sqlite3 data/messages.db "SELECT COUNT(*) FROM messages;"
```

### **Rollback Rápido:**
```bash
pm2 stop whatsapp-bot && git reset --hard HEAD~1 && pm2 restart whatsapp-bot && pm2 status
```

---

## ⚠️ **ERROS COMUNS A EVITAR**

### ❌ **NUNCA FAÇA:**
1. Deploy sem backup
2. Atualização sem testar localmente
3. Restart sem verificar logs
4. Deploy em horário de pico
5. Commit direto para produção
6. Alteração manual de arquivos no servidor
7. Restart sem verificar status
8. Deploy sem popular banco
9. Update sem verificar dependências
10. Finalizar sem monitorar

### ✅ **SEMPRE FAÇA:**
1. Backup completo antes de qualquer alteração
2. Teste local antes de deploy
3. Verificação de logs após restart
4. Deploy em horário de baixo tráfego
5. Commit para GitHub primeiro
6. Alterações via Git
7. Verificação de status após restart
8. Popular banco com dados de teste
9. Verificar dependências se package.json mudou
10. Monitorar sistema por pelo menos 15 minutos

---

## 🎉 **DEPLOY BEM-SUCEDIDO QUANDO:**
- ✅ Todos os itens do checklist marcados
- ✅ PM2 status "online" por 15+ minutos
- ✅ Health check {"status":"ok"}
- ✅ Logs sem erros críticos
- ✅ Recursos estáveis
- ✅ Backup confirmado

---

*Checklist criado em 06/07/2025*
*Versão: 1.0 - Checklist definitivo para deploy seguro*
*NUNCA pule nenhum item desta lista!*
