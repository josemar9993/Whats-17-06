# Whats-17-06

Bot de WhatsApp em Node.js para registrar conversas, analisar mensagens e enviar resumos diários por e-mail.

## Funcionalidades principais

- **Integração com o WhatsApp** usando `whatsapp-web.js` e autenticação `LocalAuth` para manter a sessão.
- **Comandos**: `!ping` responde `pong` e `!pendencias` (restrito ao administrador) envia um resumo apenas com as pendências.
- **Armazenamento de mensagens**: cada dia é salvo em `chats_salvos/chats-YYYY-MM-DD.json`.
- **Sessão persistente**: dados do WhatsApp ficam em `session_data/`.
- **Resumos automáticos**: tarefa agendada com `node-cron` para as **23:50** que salva as conversas do dia e dispara o e-mail.
- **Envio de e-mails**: `nodemailer` configurado para Gmail (necessária senha de aplicativo).
- **Análise de mensagens**: `src/summarizer.js` calcula sentimento, temas e pendências.
- **Servidor Express** expõe `/health` para verificação de saúde do contêiner.
- **Logs estruturados** com `winston`.
- **Qualidade de código**: ESLint, Prettier e testes com Jest.

## Estrutura do repositório

```
src/index.js         - Inicializa o cliente e agenda o resumo diário
src/summarizer.js    - Gera textos dos resumos e das pendências
src/emailer.js       - Lógica de envio de e-mails
src/logger.js        - Configuração do Winston
src/database.js      - Utilitários de persistência
src/scripts/test-summary.js  - Teste manual do envio de e-mails
src/__tests__/       - Testes automatizados
src/commands/        - Comandos do bot
session_data/        - Dados de autenticação do WhatsApp
chats_salvos/        - Conversas salvas por dia
COMMANDS.md          - Lista rápida dos comandos
Dockerfile           - Imagem para execução em contêiner
DEPLOYMENT_FIX.md    - Dicas para corrigir erro de branch em plataformas de deploy
INSTRUCOES_DEPLOY.md - Passo a passo de deploy na Coolify
.eslintrc.jsonc      - Regras do ESLint
```

## Configuração

Crie um arquivo `.env` baseado em `.env.example` e defina:

```
WHATSAPP_ADMIN_NUMBER=559999999999@c.us
DEFAULT_SUMMARY_DAYS=7
DAILY_SUMMARY_CRON=50 23 * * *
WHATSAPP_NOTIFY=false
EMAIL_USER=seu_email@gmail.com
EMAIL_PASSWORD=sua_senha_de_app
EMAIL_TO=destinatario@gmail.com
PORT=8080
```

`WHATSAPP_ADMIN_NUMBER` é o contato autorizado a usar `!pendencias`.
`DEFAULT_SUMMARY_DAYS` define quantos dias entram no resumo padrão.
`DAILY_SUMMARY_CRON` permite ajustar o horário da tarefa diária.
Se `WHATSAPP_NOTIFY` for `true`, o resumo também é enviado via WhatsApp.
A senha do Gmail deve ser uma **senha de aplicativo**.

## Executando localmente

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Inicie o bot:
   ```bash
   node src/index.js
   ```
   Na primeira execução será exibido um QR Code para autenticação.

Durante o desenvolvimento é possível usar `npm run dev` para recarregar automaticamente.
Os testes podem ser executados com `npm test`.

## Utilizando Docker

O `Dockerfile` permite construir e rodar a aplicação em contêiner:

```bash
npm run docker:build-local
npm run docker:run-local
```

Se preferir rodar manualmente:

```bash
docker run -it --rm \
  -v "$(pwd)/auth_data:/app/auth_data" \
  -v "$(pwd)/logs:/app/logs" \
  --name meu-bot-local meu-bot-whatsapp-local:latest
```

## Gerando resumos manualmente

Para testar o envio de e-mail sem aguardar o agendamento:

```bash
node src/scripts/test-summary.js
```

## Deploy

O deploy é feito no **Coolify**. Basta configurar o repositório, escolher **Dockerfile** como método de build e manter a branch `main`. A cada `git push` um novo deploy é disparado.

Se algum erro de branch ocorrer, consulte `DEPLOYMENT_FIX.md` ou `INSTRUCOES_DEPLOY.md`.
