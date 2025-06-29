# ❌ PROBLEMA SOLUCIONADO: Múltiplos Processos PM2 na Mesma Porta

## ✅ Solução Implementada

O problema foi causado por dois processos PM2 (`meu-bot` e `whatsapp-bot`) tentando usar a mesma porta 8080, causando o erro:
```
Error: listen EADDRINUSE: address already in use :::8080
```

### O que foi feito:

1. **📁 Criado arquivo de configuração PM2**: `ecosystem.config.js`
   - Define apenas um processo com nome único
   - Configurações otimizadas para produção
   - Tratamento de logs melhorado

2. **🔧 Corrigido o código do servidor**: `src/index.js`
   - Adicionado tratamento de erro para porta em uso
   - Melhorado endpoint de health check
   - Fallback para porta alternativa

3. **📜 Scripts de deploy automatizados**:
   - `deploy.sh`: Deploy completo com limpeza
   - `quick-restart.sh`: Reinício rápido

### 🚀 Como usar no servidor:

```bash
# Conectar ao servidor
ssh root@161.35.176.216

# Ir para o diretório
cd /var/www/html

# Puxar as alterações
git pull

# Executar script de deploy (recomendado)
chmod +x deploy.sh
./deploy.sh
```

OU para reinício rápido:

```bash
chmod +x quick-restart.sh
./quick-restart.sh
```

### 🔍 Verificação:

Após o deploy, verificar:
- ✅ Apenas um processo PM2 rodando
- ✅ Health check funcionando: http://161.35.176.216:8080/health
- ✅ Bot respondendo no WhatsApp

---

# Problema Original: Múltiplos Processos PM2

## 🔍 O que estava acontecendo:

1. Dois processos PM2 rodando simultaneamente:
   - `meu-bot` (PID: 123288)
   - `whatsapp-bot` (PID: 123323)

2. Ambos tentando usar a porta 8080

3. O segundo processo falhava com `EADDRINUSE`

4. PM2 ficava tentando reiniciar infinitamente

## ⚡ Comandos para emergência:

Se precisar resolver manualmente:

```bash
# 1. Parar tudo
pm2 stop all
pm2 delete all

# 2. Matar processos na porta 8080
sudo lsof -ti:8080 | xargs -r sudo kill -9

# 3. Verificar se está limpo
sudo lsof -i:8080
pm2 list

# 4. Iniciar apenas uma instância
pm2 start ecosystem.config.js --env production

# 5. Verificar
pm2 status
curl http://161.35.176.216:8080/health
```

## 🛠️ Comandos de monitoramento:

```bash
# Ver logs em tempo real
pm2 logs whatsapp-bot

# Ver status detalhado
pm2 show whatsapp-bot

# Monitorar recursos
pm2 monit

# Ver histórico de reinicializações
pm2 prettylist
```
