# Whats-17-06

Bot de WhatsApp em Node.js voltado para registro de conversas e envio de resumos diários. As mensagens são armazenadas em arquivos JSON e analisadas para gerar estatísticas de interação e pendências.

## Funcionalidades principais

- **Integração com o WhatsApp** através da biblioteca `whatsapp-web.js` com autenticação `LocalAuth`.
- **Comandos básicos**: responde `!ping` com `pong` e envia o resumo de pendências quando recebe `!pendencias` do administrador definido em `WHATSAPP_ADMIN_NUMBER`.
- **Armazenamento de mensagens**: as conversas do dia são salvas em `chats_salvos/chats-YYYY-MM-DD.json`.
- **Resumos automáticos**: uma tarefa `cron` é executada às 23:50 para salvar as conversas e disparar um e-mail com o resumo do dia.
- **Envio de e-mail**: utiliza `nodemailer` com uma conta Gmail para enviar resumos completos ou apenas de pendências.
- **Servidor Express** para health check, útil em execuções via Docker ou PM2.

## Estrutura do repositório

```
src/index.js         - Inicializa o cliente WhatsApp e agenda o resumo diário
src/summarizer.js    - Analisa mensagens e gera resumos gerais ou de pendências
src/emailer.js       - Envio de e-mails com os resumos gerados
src/logger.js        - Configuração simples de logs com Winston
src/test-summary.js  - Script exemplo para testar o envio de e-mail
Dockerfile           - Imagem com Chrome e Node para execução em contêiner
ecosystem.config.js  - Arquivo de configuração do PM2
cloudbuild.yaml      - Exemplo de build no Google Cloud Build
DEPLOYMENT_FIX.md    - Instruções para corrigir erro de branch em plataformas de deploy
INSTRUCOES_DEPLOY.md - Passo a passo de configuração na Coolify
.eslintrc.jsonc      - Regras básicas do ESLint
```

## Configuração

Crie um arquivo `.env` baseado em `.env.example` com as variáveis abaixo:

```
WHATSAPP_ADMIN_NUMBER=55999931227@c.us
DEFAULT_SUMMARY_DAYS=7
EMAIL_USER=josemarschieste84@gmail.com
EMAIL_PASSWORD=senha_de_aplicativo
EMAIL_TO=schieste87@gmail.com
CHROMIUM_PATH=/usr/bin/google-chrome-stable
```
O valor de `WHATSAPP_ADMIN_NUMBER` define qual contato está autorizado a usar o comando `!pendencias`.
Para que o envio de e-mails funcione é necessário criar uma senha de aplicativo no Gmail e habilitar o acesso às APIs necessárias.

## Executando localmente

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Inicie o bot:
   ```bash
   node src/index.js
   ```
   Na primeira execução será exibido um QR Code no terminal para autenticação.

Durante o desenvolvimento você pode utilizar `npm run dev` (com `nodemon`) para recarregar o bot automaticamente.

## Utilizando Docker

O repositório inclui um `Dockerfile` pronto para execução. Para construir e rodar localmente:

```bash
npm run docker:build-local
npm run docker:run-local
```
Se preferir executar o comando manualmente, utilize a sintaxe abaixo (útil em sistemas Linux/macOS):

```bash
docker run -it --rm \
  -v "$(pwd)/auth_data:/app/auth_data" \
  -v "$(pwd)/logs:/app/logs" \
  --name meu-bot-local meu-bot-whatsapp-local:latest
```

## Uso com PM2

Para gestão do processo em produção pode-se usar o PM2:

```bash
pm install -g pm2
pm2 start ecosystem.config.js
```

## Gerando resumos manualmente

Para testar o envio de e-mails sem precisar aguardar o agendamento, execute:

```bash
node src/test-summary.js
```

## Considerações adicionais

- Os arquivos `DEPLOYMENT_FIX.md` e `INSTRUCOES_DEPLOY.md` contêm instruções específicas de deploy para plataformas como Coolify.
- Todo o código principal agora está organizado dentro do diretório `src/`.
- Caso deseje personalizar as regras de estilo, utilize os arquivos `.eslintrc.jsonc` e `.prettierrc.txt`.

# Versão 1.1
