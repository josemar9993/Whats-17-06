# 🧪 Guia de Testes

## 📋 Visão Geral

Este guia contém todas as instruções para testar o Bot WhatsApp localmente e validar todas as funcionalidades.

## 🛠️ Pré-requisitos

### 1. Ambiente de Desenvolvimento
```bash
# Verificar versões
node --version  # >= 16.0.0
npm --version   # >= 8.0.0
git --version   # Recomendado para atualizações
```

### 2. Configuração do Projeto
```bash
# Clonar/atualizar repositório
git clone https://github.com/josemar9993/Whats-17-06.git
cd Whats-17-06

# Instalar dependências
npm install

# Configurar ambiente
cp .env.example .env
# Editar .env com suas credenciais
```

## 🔧 Configuração do .env

```env
# WhatsApp
WHATSAPP_ADMIN_NUMBER=5511999999999@c.us
DEFAULT_SUMMARY_DAYS=7
DAILY_SUMMARY_CRON=0 16 * * *
WHATSAPP_NOTIFY=false

# Email - Gmail
EMAIL_USER=seu_email@gmail.com
EMAIL_PASS=sua_senha_de_app
EMAIL_TO=destinatario@gmail.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587

# Servidor
PORT=8080
```

## 🧪 Tipos de Teste

### 1. **Testes Automatizados**

#### Execução Básica
```bash
# Executar todos os testes
npm test

# Testes com cobertura
npm run test:coverage

# Testes em modo watch (desenvolvimento)
npm run test:watch
```

#### Validação Completa
```bash
# Validar código (lint + testes + formatação)
npm run validate

# Corrigir problemas de lint automaticamente
npm run lint:fix

# Verificar formatação
npm run format:check
```

### 2. **Testes de Email**

#### Teste Básico
```bash
# Via script npm
npm run email:test-basic

# Ou diretamente
node test-email-basic.js
```

**O que testa:**
- ✅ Configuração de variáveis de ambiente
- ✅ Conexão com servidor SMTP
- ✅ Envio de email simples
- ✅ Verificação de resposta

#### Teste de Conectividade
```bash
# Via script npm
npm run connection:test

# Ou diretamente
node test-connection.js
```

**O que testa:**
- ✅ Conectividade com servidor SMTP
- ✅ Autenticação com credenciais
- ✅ Verificação de recursos do servidor
- ✅ Diagnóstico de problemas

#### Teste Completo
```bash
# Via script npm
npm run email:test-final

# Ou diretamente
node test-email-final.js
```

**O que testa:**
- ✅ Email de texto simples
- ✅ Email HTML formatado
- ✅ Tratamento de erros
- ✅ Geração de relatórios

### 3. **Testes Manuais**

#### Teste do Bot WhatsApp
```bash
# Iniciar o bot
npm start

# Aguardar QR Code e escanear
# Testar comandos no WhatsApp:
# !ping
# !pendencias (apenas admin)
```

#### Teste de Resumo Manual
```bash
# Executar script de teste
node src/scripts/test-summary.js
```

### 4. **Testes Docker**

#### Build e Execução
```bash
# Build da imagem
npm run docker:build-local

# Executar container
npm run docker:run-local

# Parar container
npm run docker:stop-local

# Teste completo
npm run docker:test-local
```

## 📊 Resultados Esperados

### ✅ Testes Bem-Sucedidos

#### Testes Automatizados
```
✅ summarizer.test.js - Geração de resumos
✅ emailer.test.js - Sistema de emails
✅ commands.test.js - Comandos do bot
✅ database.test.js - Operações do banco
✅ api.test.js - Endpoints da API
```

#### Testes de Email
```
✅ Variáveis de ambiente configuradas
✅ Conexão SMTP estabelecida
✅ Email básico enviado
✅ Email HTML formatado enviado
✅ Tratamento de erros funcionando
```

#### Teste do Bot
```
✅ Cliente WhatsApp autenticado
✅ Comandos respondendo corretamente
✅ Resumos sendo gerados
✅ Logs sendo registrados
✅ Servidor health check ativo
```

### ❌ Problemas Comuns

#### Erro de Email
```
❌ Invalid login: EAUTH
💡 Solução: Usar senha de aplicativo do Gmail
```

#### Erro de Conexão
```
❌ ECONNREFUSED 
💡 Solução: Verificar SMTP_HOST e SMTP_PORT
```

#### Erro de Variáveis
```
❌ Missing required environment variables
💡 Solução: Configurar .env corretamente
```

## 🔍 Debugging

### Logs do Sistema
```bash
# Ver logs em tempo real
tail -f logs/app.log

# Ver logs de erro
tail -f logs/error.log
```

### Debug do Email
```bash
# Executar com debug ativo
DEBUG=nodemailer:* node test-email-basic.js
```

### Debug do WhatsApp
```bash
# Remover cache do WhatsApp
rm -rf .wwebjs_auth .wwebjs_cache

# Iniciar com debug
DEBUG=whatsapp-web.js:* npm start
```

## 📋 Checklist de Validação

### Antes de Usar em Produção:

- [ ] Todos os testes automatizados passando
- [ ] Teste de email básico funcionando
- [ ] Teste de conectividade SMTP ok
- [ ] Bot WhatsApp autenticando corretamente
- [ ] Comandos respondendo
- [ ] Resumos sendo gerados
- [ ] Logs sendo registrados
- [ ] Container Docker executando
- [ ] Arquivo .env configurado
- [ ] Credenciais de email válidas

### Configuração de Produção:

- [ ] Variáveis de ambiente configuradas
- [ ] Backup dos dados de autenticação
- [ ] Monitoramento de logs ativo
- [ ] Webhook de deploy configurado
- [ ] Certificados SSL válidos
- [ ] Recursos do servidor adequados

## 🎯 Próximos Passos

1. **Executar todos os testes**: `npm run validate`
2. **Testar funcionalidades**: Usar scripts de teste
3. **Configurar produção**: Deploy no servidor
4. **Monitorar**: Acompanhar logs e métricas

## 🆘 Suporte

Se encontrar problemas:

1. Verificar logs do sistema
2. Executar testes de diagnóstico
3. Consultar documentação
4. Verificar configurações de ambiente

**Status do Sistema**: 🟢 **Totalmente Testado e Funcional**
