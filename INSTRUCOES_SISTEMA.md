# Instruções do Sistema

Este documento resume todas as instruções fornecidas para o projeto **Whats-17-06**.

## 1. Tecnologias
- **Cliente WhatsApp:** `whatsapp-web.js` usando `LocalAuth`.
- **Servidor Web:** `Express.js` apenas para endpoint de *health check*.
- **Agendamento de Tarefas:** `node-cron` com execução diária às **16:00 BRT (19:00 UTC)**.
- **Envio de E-mails:** `Nodemailer` com conta Gmail.
- **Logs:** `Winston` para registro de eventos e erros.

## 2. Estrutura e Fluxo
- Arquivos principais localizados em `src/`:
  - `index.js` – Inicialização do bot e agendamento diário.
  - `summarizer.js` – Lógica de análise de mensagens e geração de resumos.
  - `emailer.js` – Envio de e-mails.
  - `logger.js` – Configuração do Winston.
- Mensagens registradas em um banco SQLite localizado em `data/messages.db`.
- Comandos do bot:
  - `!ping` – responde `pong`.
  - `!pendencias` – restrito ao administrador, gera resumo de pendências.
- Desenvolvimento local: `npm run dev`.
- Teste manual do e-mail: `node test-summary.js`.
- Futuras refatorações devem manter o código dentro de `src/`.

## 3. Infraestrutura e Deploy
- Hospedagem em Droplet da **DigitalOcean**.
- Deploy automatizado pelo **Coolify** via `git push` para a branch principal.
- A imagem é construída com o `Dockerfile` do projeto.
- Não utilizar Google Cloud Build ou PM2 nesse fluxo.

## 4. Segurança e Configuração
- Segredos definidos como *Secrets* no Coolify e acessados via `process.env`.
- Variáveis necessárias:
  - `WHATSAPP_ADMIN_NUMBER`
  - `DEFAULT_SUMMARY_DAYS`
  - `EMAIL_USER`
  - `EMAIL_PASSWORD`
  - `EMAIL_TO`
- Nunca incluir segredos diretamente no código.

## 5. Padrões de Código e Contribuição
- Seguir regras do `.eslintrc.jsonc` (ES6+, `async/await`, `const/let`).
- Comentários e documentação sempre em **português**.
- Commits devem seguir o padrão:
  - `feat: [Descrição]`
  - `fix: [Descrição]`
  - `docs: [Descrição]`
  - `chore: [Descrição]`

