# 🤖 WhatsApp Bot Enterprise - Sistema Completo v1.1.0

![Status](https://img.shields.io/badge/Status-FUNCIONANDO-brightgreen) ![Version](https://img.shields.io/badge/Version-1.1.0-blue) ![Tests](https://img.shields.io/badge/Tests-Aprovado-green) ![Deploy](https://img.shields.io/badge/Deploy-Automatizado-orange)

**Sistema empresarial completo para WhatsApp** com automação inteligente, relatórios executivos, deploy automatizado e monitoramento avançado. Totalmente configurado para produção no DigitalOcean.

## 🚀 **NOVIDADES DA VERSÃO 1.1.0**

### ✨ **Deploy Automatizado:**
- 🔄 Script de deploy automático com backup
- 📦 Configuração inicial do servidor DigitalOcean
- 📊 Monitoramento de saúde do sistema
- 📋 Checklist completo para alterações

### 🛠️ **Melhorias no Sistema:**
- 🔍 Relatórios mais precisos e informativos
- 🐛 Correção de problemas com relatórios vazios
- 📝 Logs de debug aprimorados
- ⚡ Performance otimizada

## 🎯 **CONFIGURAÇÃO ESTÁVEL - NUNCA ALTERAR**

⚠️ **ATENÇÃO:** Esta é a versão **ESTÁVEL E TESTADA** que está funcionando perfeitamente em produção.
**NÃO ALTERE ESTAS CONFIGURAÇÕES** sem fazer backup primeiro.

## 🚀 **STATUS ATUAL - FUNCIONANDO PERFEITAMENTE**

### ✅ **Bot em Produção:**
- **Servidor:** 161.35.176.216 (DigitalOcean)
- **Express Server:** ✅ Ativo na porta 8080
- **WhatsApp:** ✅ Conectado e autenticado
- **PM2:** ✅ Online (PID: 221177+)
- **Comandos:** ✅ 14 comandos carregados
- **Health Check:** ✅ http://161.35.176.216:8080/health

### � **Configuração Crítica:**
```bash
# Status PM2 esperado:
┌──┬─────────────┬───────┬─────┬────────┬──────┬──────┬────────┬─────┬─────┬─────┬────────┐
│id│name         │version│mode │pid     │uptime│↺    │status  │cpu  │mem  │user │watching│
├──┼─────────────┼───────┼─────┼────────┼──────┼──────┼────────┼─────┼─────┼─────┼────────┤
│0 │whatsapp-bot │1.0.0  │fork │RUNNING │ONLINE│STABLE│online  │<5%  │<100M│root │disabled│
└──┴─────────────┴───────┴─────┴────────┴──────┴──────┴────────┴─────┴─────┴─────┴────────┘
```

---

## 🔑 **CONFIGURAÇÕES OBRIGATÓRIAS**

### 📄 **1. Arquivo .env (CRÍTICO)**
```env
# ================================
# CONFIGURAÇÕES OBRIGATÓRIAS DO BOT WHATSAPP
# ================================
NODE_ENV=production
PORT=8080                    # ⚠️ OBRIGATÓRIO - Express Server
COMMAND_PREFIX=!
DEBUG=false
LOG_LEVEL=info

# ================================
# CONFIGURAÇÕES DE ADMINISTRADORES
# ================================
WHATSAPP_ADMIN_NUMBER=554899931227@c.us
ADMIN_WHATSAPP_IDS=554899931227@c.us
DEFAULT_SUMMARY_DAYS=7

# ================================
# CONFIGURAÇÕES DE AGENDAMENTO
# ================================
DAILY_SUMMARY_CRON="0 16 * * *"
WHATSAPP_NOTIFY=true

# ================================
# CONFIGURAÇÃO DE E-MAIL
# ================================
EMAIL_USER=seu-email@gmail.com
EMAIL_PASS=sua-senha-de-app-gmail
EMAIL_TO=email-destinatario@exemplo.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587

# ================================
# CONFIGURAÇÕES AVANÇADAS (FASE 1)
# ================================
DB_PATH=./data/messages.db
COMMAND_TIMEOUT=30000
RATE_LIMIT_MAX_REQUESTS=30
RATE_LIMIT_ADMIN_MAX_REQUESTS=100
CACHE_TTL_STATS=300000
RETRY_MAX_ATTEMPTS=3
RETRY_INITIAL_DELAY=1000
RETRY_BACKOFF_FACTOR=2
MAX_MESSAGE_LENGTH=4096
MAX_COMMAND_ARGS=20
MAX_SEARCH_RESULTS=50
```

### 🚀 **2. PM2 Configuration (ecosystem.config.js)**
```javascript
module.exports = {
  apps: [{
    name: 'whatsapp-bot',
    script: 'src/index.js',              // ⚠️ OBRIGATÓRIO
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 8080                         // ⚠️ PORTA OBRIGATÓRIA
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 8080
    },
    time: false,
    log_date_format: '',
    merge_logs: true,
    combine_logs: true,
    timestamp: false,
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_file: './logs/pm2-combined.log',
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024',
    restart_delay: 1000,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
```

---

## ⚠️ **CONFIGURAÇÃO CRÍTICA DO EXPRESS SERVER**

### 🌐 **Express Server (NUNCA REMOVER)**
O Express server é **OBRIGATÓRIO** e está configurado no arquivo `src/index.js`:

```javascript
// Linha 22 - OBRIGATÓRIA
const express = require('express');

// Linhas 345-371 - CRÍTICAS - NÃO ALTERAR
const app = express();
const port = process.env.PORT || 8080;

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

app.listen(port, () => {
  logger.info(`Servidor de health check ouvindo na porta ${port}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    logger.error(`Porta ${port} já está em uso. Tentando outra porta...`);
    const alternativePort = port + 1;
    app.listen(alternativePort, () => {
      logger.info(`Servidor de health check ouvindo na porta alternativa ${alternativePort}`);
    });
  } else {
    logger.error('Erro ao iniciar servidor:', err);
  }
});
```

**🚨 IMPORTANTE:** Remover o Express server causa o erro `EADDRINUSE: address already in use :::8080`

---

## 🏗️ **Arquitetura Estável**

### 📁 **Estrutura de Pastas (OBRIGATÓRIA)**
```
/var/www/html/                    # Diretório raiz no servidor
├── src/
│   ├── index.js                  # ✅ ARQUIVO PRINCIPAL
│   ├── database.js              # ✅ Banco SQLite
│   ├── emailer.js               # ✅ Sistema de email
│   ├── logger.js                # ✅ Sistema de logs
│   ├── scheduler.js             # ✅ Agendamento
│   ├── summarizer.js            # ✅ Gerador de resumos
│   └── commands/                # ✅ 14 comandos
│       ├── group/
│       │   └── todos.js
│       └── util/
│           ├── ajuda.js
│           ├── buscar.js
│           ├── config.js
│           ├── grupos.js
│           ├── logs.js
│           ├── pendencias.js
│           ├── ping.js
│           ├── reiniciar.js
│           ├── resumo-hoje.js
│           ├── stats.js
│           ├── test-email.js
│           ├── uptime.js
│           └── versao.js
├── .env                         # ✅ CONFIGURAÇÕES
├── package.json                 # ✅ DEPENDÊNCIAS
├── ecosystem.config.js          # ✅ CONFIGURAÇÃO PM2
└── logs/                        # ✅ Diretório de logs
```

### 📦 **Dependências Críticas (package.json)**
```json
{
  "dependencies": {
    "@discordjs/collection": "^1.5.3",
    "@google-cloud/storage": "^7.0.0",
    "@sendgrid/mail": "^8.1.5",
    "compromise": "^13.11.3",
    "dotenv": "^16.6.1",
    "express": "^4.21.2",           // ⚠️ CRÍTICO - NÃO REMOVER
    "express-rate-limit": "^7.5.1",
    "helmet": "^8.1.0",
    "joi": "^17.13.3",
    "node-cache": "^5.1.2",
    "node-cron": "^3.0.3",
    "nodemailer": "^6.10.1",
    "puppeteer": "^19.11.1",
    "qrcode-terminal": "^0.12.0",
    "quickchart-js": "^3.1.0",
    "remove-accents": "^0.5.0",
    "sentiment": "^5.0.2",
    "sqlite3": "^5.1.6",
    "tar-fs": "2.1.3",
    "whatsapp-web.js": "^1.30.0",
    "winston": "^3.11.0",
    "winston-daily-rotate-file": "^4.7.1"
  }
}
```

---

## 🚀 **Comandos de Deploy**

### 📥 **1. Deploy Inicial:**
```bash
# No servidor (161.35.176.216):
cd /var/www/html
git clone https://github.com/josemar9993/Whats-17-06.git .
git checkout versao-ontem-16h        # ⚠️ BRANCH OBRIGATÓRIA
npm install
pm2 start ecosystem.config.js
```

### 🔄 **2. Atualizar Código:**
```bash
# No servidor:
cd /var/www/html
git stash                          # Salvar mudanças locais
git fetch origin                   # Baixar atualizações
git checkout versao-ontem-16h      # ⚠️ SEMPRE esta branch
pm2 restart whatsapp-bot           # Reiniciar bot
pm2 logs whatsapp-bot --lines 20   # Verificar logs
```

### � **3. Verificar Status:**
```bash
pm2 list                          # Lista processos
pm2 logs whatsapp-bot             # Ver logs em tempo real
pm2 monit                         # Monitor visual
curl http://localhost:8080/health  # Testar health check
```

---

## ✅ **Checklist de Funcionamento**

### 🔍 **Logs Esperados (Ordem Correta):**
```log
✅ info: Configurando o cliente do WhatsApp...
✅ info: [DEBUG CONFIG] commandPrefix: "!"
✅ info: [DEBUG CONFIG] dailySummaryCron: "0 16 * * *"
✅ info: [COMANDO CARREGADO] todos
✅ info: [COMANDO CARREGADO] ajuda
✅ info: [COMANDO CARREGADO] buscar
✅ info: [COMANDO CARREGADO] config
✅ info: [COMANDO CARREGADO] grupos
✅ info: [COMANDO CARREGADO] logs
✅ info: [COMANDO CARREGADO] pendencias
✅ info: [COMANDO CARREGADO] ping
✅ info: [COMANDO CARREGADO] reiniciar
✅ info: [COMANDO CARREGADO] resumo-hoje
✅ info: [COMANDO CARREGADO] stats
✅ info: [COMANDO CARREGADO] test-email
✅ info: [COMANDO CARREGADO] uptime
✅ info: [COMANDO CARREGADO] versao
✅ info: Configurando eventos do cliente...
✅ info: Inicializando o cliente... Isso pode levar um minuto.
✅ info: Servidor de health check ouvindo na porta 8080
✅ info: Cliente autenticado!
✅ info: Cliente do WhatsApp está pronto!
✅ info: [CRON] Tarefa de resumo diário agendada com a expressão: "0 16 * * *"
```

---

## 🎯 **Comandos Disponíveis (14 TOTAL)**

### 👤 **Usuários Gerais**
| Comando | Descrição | Exemplo |
|---------|-----------|---------|
| `!ajuda` | Lista todos os comandos | `!ajuda` |
| `!ping` | Verifica status do bot | `!ping` |
| `!uptime` | Tempo online do sistema | `!uptime` |
| `!versao` | Versão atual do bot | `!versao` |

### 👥 **Comandos de Grupo**
| Comando | Descrição | Exemplo |
|---------|-----------|---------|
| `!todos` | Menciona todos do grupo | `!todos` |

### 🔧 **Administradores**
| Comando | Descrição | Exemplo |
|---------|-----------|---------|
| `!stats` | Estatísticas do sistema | `!stats` |
| `!buscar <termo>` | Busca em mensagens | `!buscar pedido` |
| `!pendencias` | Perguntas sem resposta | `!pendencias` |
| `!resumo-hoje [data]` | Resumo do dia/período | `!resumo-hoje 01/01/2025` |
| `!logs [linhas]` | Visualizar logs | `!logs 50` |
| `!grupos` | Lista grupos ativos | `!grupos` |
| `!config` | Configurações do bot | `!config` |
| `!reiniciar` | Reinicia o sistema | `!reiniciar` |
| `!test-email` | Testa envio de email | `!test-email` |

---

## 🚨 **Problemas Conhecidos e Soluções**

### ❌ **Erro EADDRINUSE: address already in use :::8080**
**Causa:** Express server removido ou porta em conflito  
**Solução:** Garantir que o Express server está ativo no código  

### ❌ **Bot não conecta WhatsApp**
**Causa:** `client.initialize()` não chamado  
**Solução:** Verificar se a linha está no final do `src/index.js`  

### ❌ **Comandos não carregam**
**Causa:** Estrutura de pastas incorreta  
**Solução:** Verificar estrutura `src/commands/group/` e `src/commands/util/`  

### ❌ **PM2 não inicia**
**Causa:** Dependências não instaladas  
**Solução:** `npm install` antes de iniciar PM2  

---

## 🖥️ **Configuração do Servidor**

### � **Informações do Servidor:**
- **IP:** 161.35.176.216
- **OS:** Ubuntu 24.04.2 LTS
- **Node.js:** >= 16.0.0
- **PM2:** Versão mais recente
- **Diretório:** /var/www/html
- **Usuário:** root

### 🔌 **Portas Utilizadas:**
- **8080:** Express Health Check (HTTP)
- **22:** SSH
- **80:** HTTP (liberado no firewall)
- **443:** HTTPS (liberado no firewall)

### 🛡️ **Firewall UFW:**
```bash
# Portas liberadas automaticamente:
ufw allow 22/tcp     # SSH
ufw allow 80/tcp     # HTTP  
ufw allow 443/tcp    # HTTPS
# Porta 8080 é interna (não precisa liberar)
```

---

## 📊 **Monitoramento**

### 🌐 **URLs de Verificação:**
- **Health Check:** http://161.35.176.216:8080/health
- **Status:** Deve retornar JSON com status: "OK"

### � **Métricas Importantes:**
- **Memory:** < 100MB normal
- **CPU:** < 5% normal
- **Uptime:** Deve ser estável
- **Restarts:** Máximo 10 por dia

---

## 🔐 **Dados Sensíveis**

### 📧 **Configurações de Email:**
- **SMTP:** smtp.gmail.com:587
- **Usuário:** seu-email@gmail.com
- **Senha App:** sua-senha-de-app-gmail
- **Destinatário:** email-destinatario@exemplo.com

### 📱 **WhatsApp Admin:**
- **Número:** 554899931227@c.us
- **Formato:** Sempre incluir @c.us

---

## � **Suporte e Troubleshooting**

### 🔍 **Comandos de Diagnóstico:**
```bash
# Verificar logs
pm2 logs whatsapp-bot

# Verificar status
pm2 list

# Reiniciar bot
pm2 restart whatsapp-bot

# Health check
curl http://localhost:8080/health

# Limpar logs
pm2 flush whatsapp-bot
```

### 🆘 **Em Caso de Emergência:**
1. Verificar logs: `pm2 logs whatsapp-bot`
2. Verificar status: `pm2 list`
3. Reiniciar: `pm2 restart whatsapp-bot`
4. Health check: `curl http://localhost:8080/health`

**⚠️ EM CASO DE EMERGÊNCIA TOTAL:**
```bash
git checkout versao-ontem-16h  # Voltar para versão estável
```

---

## 🏆 **Versão e Histórico**

### � **Informações da Versão:**
- **Branch:** `versao-ontem-16h`
- **Commit:** `dcd3026` (docs: Atualizar README.md com sistema enterprise completo)
- **Status:** ✅ FUNCIONANDO PERFEITAMENTE
- **Data:** 01/07/2025
- **Testado por:** GitHub Copilot

### 🎯 **Características Principais:**
- ✅ Express Server Ativo (porta 8080)
- ✅ WhatsApp Client Conectado
- ✅ 14 Comandos Funcionais
- ✅ PM2 Configurado
- ✅ Logs Estruturados
- ✅ Health Check Endpoint
- ✅ Sistema de Email Funcional
- ✅ Agendamento de Resumos (16:00)

---

## � **Documentação Adicional**

Para documentação completa e detalhada, consulte:
- **📋 CONFIGURACAO_ESTAVEL.md** - Documentação técnica completa
- **🔧 ecosystem.config.js** - Configuração do PM2
- **⚙️ .env** - Variáveis de ambiente

---

**⚠️ LEMBRE-SE:** Esta é a configuração **ESTÁVEL E TESTADA**. NÃO ALTERE sem backup!
