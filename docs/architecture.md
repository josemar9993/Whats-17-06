# Arquitetura do Projeto

Este documento resume a organização de pastas e módulos principais do bot.

```text
Whats-17-06/
├── src/
│   ├── index.js            # Inicialização do bot e agendamentos
│   ├── database.js         # Persistência em SQLite
│   ├── emailer.js          # Envio de e-mails
│   ├── logger.js           # Configuração do Winston
│   ├── summarizer.js       # Geração de resumos e pendências
│   ├── commands/
│   │   ├── group/
│   │   │   └── todos.js
│   │   └── util/
│   │       ├── ajuda.js
│   │       ├── pendencias.js
│   │       ├── ping.js
│   │       ├── resumo-hoje.js
│   │       └── test-email.js
│   └── __tests__/          # Testes automatizados
├── data/                   # Banco SQLite
├── logs/                   # Arquivos de log
└── COMMANDS.md             # Documentação rápida de comandos
```

Os módulos se comunicam de forma simples: `index.js` recebe mensagens via `whatsapp-web.js`, salva tudo no `database.js` e, quando necessário, gera resumos com `summarizer.js` e envia e-mails usando `emailer.js`.
