# 🚀 COMANDOS PARA O SERVIDOR UBUNTU (PRODUÇÃO)

## ✅ LOGS LIMPOS CONFIRMADOS LOCALMENTE!
Os logs agora aparecem sem duplicidade de timestamp.

## 🛠️ DEPLOY NO SERVIDOR DE PRODUÇÃO:

```bash
# 1. Conectar ao servidor (tentar novamente)
ssh root@192.241.134.9

# 2. Navegar para o diretório do projeto
cd /var/www/html

# 3. Atualizar código
git pull origin main

# 4. Parar o bot
pm2 stop whatsapp-bot

# 5. Limpar logs antigos (sintaxe Linux)
rm -f logs/*.log

# 6. Limpar cache PM2
pm2 flush

# 7. Reiniciar o bot
pm2 start whatsapp-bot

# 8. Aguardar inicialização
sleep 15

# 9. Verificar logs LIMPOS
pm2 logs whatsapp-bot --lines 20
```

## 🔍 VERIFICAÇÕES ADICIONAIS:

```bash
# Status do processo
pm2 status

# Informações detalhadas
pm2 info whatsapp-bot

# Health check
curl http://localhost:8080/health

# Monitoramento em tempo real
pm2 monit
```

## 🎯 RESULTADO ESPERADO NO SERVIDOR:

Os logs devem aparecer assim (sem duplicidade):
```
info: [COMANDO CARREGADO] ping
info: [COMANDO CARREGADO] stats
info: Cliente autenticado!
info: Cliente do WhatsApp está pronto!
info: [CRON] Tarefa de resumo diário agendada
```

## 🧪 TESTE FINAL:
Após o deploy, envie um comando como `!ping` ou `!stats` para confirmar que:
1. O comando executa normalmente
2. Os logs aparecem limpos (sem timestamp duplicado)
3. O bot responde corretamente

---

**🎉 MISSÃO CUMPRIDA LOCALMENTE - PRONTO PARA PRODUÇÃO!**
