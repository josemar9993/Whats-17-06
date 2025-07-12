# Comandos para Deploy no Servidor

## 📋 Checklist Pré-Deploy
- [ ] Código testado localmente
- [ ] Lint sem erros
- [ ] Testes passando
- [ ] Alterações commitadas e enviadas para o GitHub

## 🚀 Comandos para Deploy

### 1. Conectar ao Servidor
```bash
# Conectar via SSH ao servidor DigitalOcean
ssh root@SEU_IP_DO_SERVIDOR
```

### 2. Navegar para o Diretório do Projeto
```bash
cd /opt/whatsapp-bot
```

### 3. Fazer Backup (Opcional mas Recomendado)
```bash
# Criar backup do banco de dados
cp data/messages.db data/messages.db.backup.$(date +%Y%m%d_%H%M%S)

# Criar backup dos logs
tar -czf logs_backup_$(date +%Y%m%d_%H%M%S).tar.gz logs/
```

### 4. Parar o Serviço
```bash
pm2 stop whatsapp-bot
```

### 5. Atualizar o Código
```bash
# Fazer pull das últimas alterações
git pull origin main

# Instalar dependências (se necessário)
npm install --production
```

### 6. Verificar Configuração
```bash
# Verificar se o .env está correto
cat .env

# Testar conexão com o banco
node -e "const db = require('./src/database'); console.log('DB OK');"
```

### 7. Reiniciar o Serviço
```bash
pm2 start whatsapp-bot
```

### 8. Verificar Status
```bash
# Verificar se o serviço está rodando
pm2 status

# Verificar logs em tempo real
pm2 logs whatsapp-bot --lines 50

# Verificar health check
curl http://localhost:8080/health
```

### 9. Monitorar por alguns minutos
```bash
# Monitorar logs por 2-3 minutos
pm2 logs whatsapp-bot --lines 100

# Verificar uso de recursos
pm2 monit
```

## 🔧 Comandos de Solução de Problemas

### Se o serviço não iniciar:
```bash
# Ver logs detalhados
pm2 logs whatsapp-bot --err

# Reiniciar PM2
pm2 restart whatsapp-bot

# Verificar dependências
npm install --production
```

### Se houver problemas de QR Code:
```bash
# Limpar sessão
rm -rf .wwebjs_auth/

# Reiniciar
pm2 restart whatsapp-bot
```

### Verificar recursos do servidor:
```bash
# Verificar uso de memória
free -h

# Verificar uso de disco
df -h

# Verificar processos
top
```

## 📱 Comandos para Testar o Bot

### Testar localmente antes do deploy:
```bash
# Rodar testes
npm test

# Rodar o bot localmente
npm run dev
```

### Testar no servidor após deploy:
```bash
# Enviar comando via WhatsApp: !teste
# Verificar se o bot responde

# Testar comando de status
# Enviar: !status

# Testar relatório
# Enviar: !relatorio-executivo hoje
```

## 🔄 Comandos Rápidos (One-liner)

### Deploy Rápido:
```bash
ssh root@SEU_IP_DO_SERVIDOR "cd /opt/whatsapp-bot && pm2 stop whatsapp-bot && git pull origin main && pm2 start whatsapp-bot && pm2 logs whatsapp-bot --lines 20"
```

### Verificação Rápida:
```bash
ssh root@SEU_IP_DO_SERVIDOR "cd /opt/whatsapp-bot && pm2 status && curl -s http://localhost:8080/health"
```

## 📝 Notas Importantes

1. **Sempre fazer backup** antes de fazer deploy
2. **Verificar logs** após cada deploy
3. **Testar comandos básicos** para garantir que tudo está funcionando
4. **Monitorar por alguns minutos** após o deploy
5. **Manter o arquivo .env** atualizado com as configurações corretas

## 🆘 Em Caso de Emergência

### Rollback rápido:
```bash
# Voltar para o commit anterior
git reset --hard HEAD~1

# Reiniciar serviço
pm2 restart whatsapp-bot
```

### Restaurar backup do banco:
```bash
# Parar serviço
pm2 stop whatsapp-bot

# Restaurar backup
cp data/messages.db.backup.YYYYMMDD_HHMMSS data/messages.db

# Iniciar serviço
pm2 start whatsapp-bot
```

---

**Última atualização:** 12/07/2025
**Versão:** 1.1.0
