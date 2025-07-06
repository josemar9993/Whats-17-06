# ⚡ CHECKLIST RÁPIDO - DEPLOY EM PRODUÇÃO

## 🚨 **NUNCA ESQUEÇA ESTES PASSOS:**

### **📋 PRÉ-DEPLOY (LOCAL)**
1. [ ] `npm test` - Testes passando
2. [ ] `node test-basic.js` - Sistema funcionando
3. [ ] `git push origin main` - Código no GitHub

### **💾 BACKUP (SERVIDOR)**
4. [ ] `tar -czf backup-$(date +%Y%m%d-%H%M%S).tar.gz auth_data/ data/ logs/ .env`
5. [ ] Verificar backup criado

### **🚀 DEPLOY (SERVIDOR)**
6. [ ] `git pull origin main` - Atualizar código
7. [ ] `node populate-database.js` - Popular banco
8. [ ] `./test-servidor-completo.sh` - Testar sistema
9. [ ] `pm2 restart whatsapp-bot` - Reiniciar bot

### **✅ VALIDAÇÃO (SERVIDOR)**
10. [ ] `pm2 status` - Status "online"
11. [ ] `curl http://localhost:8080/health` - Health check OK
12. [ ] Monitorar por 15 minutos

---

## 🆘 **ROLLBACK DE EMERGÊNCIA:**
```bash
pm2 stop whatsapp-bot && git reset --hard HEAD~1 && pm2 restart whatsapp-bot
```

---

## ✅ **DEPLOY OK QUANDO:**
- PM2 "online" ✅
- Health check {"status":"ok"} ✅  
- Logs sem erros ✅
- 15+ min estável ✅
