# Orientações para o Agente de IA - WhatsApp Bot Enterprise

Bem-vindo ao projeto WhatsApp Bot Enterprise! Este documento fornece as diretrizes essenciais para entender e trabalhar neste codebase de forma eficaz.

## 1. Visão Geral da Arquitetura

Este é um bot para WhatsApp em Node.js, projetado para um ambiente de produção robusto. A arquitetura é modular e orientada a eventos.

- **Ponto de Entrada Principal:** `src/index.js` orquestra todos os módulos. Ele inicializa o cliente do WhatsApp, carrega os comandos e configura o servidor de health check.
- **Cliente do WhatsApp:** Usamos a biblioteca `whatsapp-web.js` para toda a interação com o WhatsApp.
- **Servidor Express.js:** Um servidor Express mínimo é **crítico** para a implantação. Ele expõe um endpoint `/health` na porta `8080` (configurável via `process.env.PORT`). Este endpoint é usado pelo PM2 e pelo provedor de nuvem (DigitalOcean) para verificar a saúde do aplicativo. **Nunca remova o servidor Express**, pois isso fará com que a implantação falhe.
- **Banco de Dados:** Um banco de dados SQLite (`data/messages.db`) é usado para persistir mensagens e outros dados. A lógica de acesso ao banco de dados está encapsulada em `src/database.js`.
- **Comandos:** A lógica do bot é baseada em comandos. Cada comando reside em seu próprio arquivo dentro de `src/commands/util/` ou `src/commands/group/`. O prefixo padrão do comando é `!`.
- **Configuração:** Toda a configuração é gerenciada por meio de um arquivo `.env` na raiz do projeto. O `README.md` contém uma lista completa de todas as variáveis de ambiente necessárias.
- **Agendamento:** Tarefas agendadas (como resumos diários) são gerenciadas pelo `node-cron` no módulo `src/scheduler.js`.
- **Logs:** Usamos `winston` para um sistema de log robusto, com logs rotativos diários armazenados no diretório `logs/`.

## 2. Fluxos de Trabalho do Desenvolvedor

- **Instalação:** `npm install`
- **Execução (Desenvolvimento):** `npm run dev` (usa `nodemon` para recarregamento automático).
- **Teste:** `npm test` (usa Jest). Existem também scripts de teste para funcionalidades específicas, como `npm run email:test-final`.
- **Linting e Formatação:** `npm run lint` e `npm run format`.

### Implantação (Deployment)

O fluxo de implantação principal é para um servidor DigitalOcean usando PM2.

1.  **Configuração do Servidor:** O `README.md` e vários scripts de shell (`deploy-digitalocean.sh`, `setup.sh`) detalham o processo. O ambiente de produção esperado é o Ubuntu.
2.  **Gerenciador de Processos:** O PM2 é usado para manter o bot em execução. A configuração está em `ecosystem.config.js`.
3.  **Comandos de Deploy:**
    - Para iniciar: `pm2 start ecosystem.config.js`
    - Para reiniciar: `pm2 restart whatsapp-bot`
    - Para ver os logs: `pm2 logs whatsapp-bot`
4.  **Branch Estável:** O `README.md` enfatiza o uso de uma branch específica (`versao-ontem-16h`) como a fonte estável para produção. Sempre verifique o `README.md` para a branch recomendada.

## 3. Padrões e Convenções Específicas do Projeto

### Adicionando um Novo Comando

1.  Crie um novo arquivo `.js` em `src/commands/util/` (para comandos gerais) ou `src/commands/group/` (para comandos de grupo).
2.  Exporte um objeto com a seguinte estrutura:
    ```javascript
    module.exports = {
      name: 'meu-comando', // O nome que será usado para chamar o comando (ex: !meu-comando)
      description: 'Descrição do que o comando faz.',
      aliases: ['mc', 'meuc'], // Apelidos opcionais
      cooldown: 5, // Cooldown em segundos
      adminOnly: false, // Se o comando é apenas para administradores
      async execute(message, args, client) {
        // Sua lógica de comando aqui
        await message.reply('Executado com sucesso!');
      },
    };
    ```
3.  O comando será carregado automaticamente na inicialização. Não é necessário editar `src/index.js`.

### Configuração

- Sempre use o arquivo `.env` para configurações. Nunca codifique valores sensíveis ou de ambiente diretamente.
- Consulte o `README.md` para a lista completa e atualizada de variáveis de ambiente.

### Módulos Principais

- `src/logger.js`: Use o logger exportado para todos os logs. Ex: `logger.info('Mensagem')`, `logger.error('Erro')`.
- `src/database.js`: Use as funções exportadas para interagir com o banco de dados.
- `src/emailer.js`: Use para enviar e-mails.

Este projeto tem uma extensa documentação em vários arquivos `.md`. O `README.md` é a fonte de verdade mais importante para o status atual, configuração e procedimentos de implantação.
