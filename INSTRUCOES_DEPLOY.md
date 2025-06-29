# Instruções de Deploy - WhatsApp Bot

## Deploy no Servidor (DigitalOcean)

### Opção 1: Deploy Completo (Recomendado)

```bash
# Conectar ao servidor
ssh root@161.35.176.216

# Executar script de deploy
cd /var/www/html
chmod +x deploy.sh
./deploy.sh
```

### Opção 2: Reinício Rápido

```bash
# Conectar ao servidor
ssh root@161.35.176.216

# Executar script de reinício rápido
cd /var/www/html
chmod +x quick-restart.sh
./quick-restart.sh
```

### Opção 3: Manual (Caso os scripts não funcionem)

```bash
# Conectar ao servidor
ssh root@161.35.176.216

# Navegar para o diretório
cd /var/www/html

# Parar todos os processos PM2
pm2 stop all
pm2 delete all

# Limpar processos na porta 8080
sudo lsof -ti:8080 | xargs -r sudo kill -9

# Puxar alterações do GitHub
git pull

# Iniciar com o arquivo de configuração
pm2 start ecosystem.config.js --env production

# Verificar status
pm2 status
pm2 logs whatsapp-bot --lines 20
```

## Comandos Úteis

### Monitoramento
```bash
# Ver logs em tempo real
pm2 logs whatsapp-bot

# Ver status dos processos
pm2 status

# Ver logs das últimas 50 linhas
pm2 logs whatsapp-bot --lines 50

# Monitorar recursos
pm2 monit
```

### Manutenção
```bash
# Reiniciar apenas o bot
pm2 restart whatsapp-bot

# Parar o bot
pm2 stop whatsapp-bot

# Ver processos na porta 8080
sudo lsof -i:8080

# Matar processo específico na porta 8080
sudo kill -9 $(sudo lsof -t -i:8080)
```

### Health Check
```bash
# Verificar se o servidor está respondendo
curl http://161.35.176.216:8080/health

# Ou no navegador
http://161.35.176.216:8080/health
```

## Estrutura de Arquivos no Servidor

```
/var/www/html/
├── ecosystem.config.js  # Configuração do PM2
├── deploy.sh           # Script de deploy completo
├── quick-restart.sh    # Script de reinício rápido
├── src/               # Código fonte
├── data/              # Banco de dados SQLite
├── logs/              # Logs da aplicação e PM2
└── auth_data/         # Dados de autenticação do WhatsApp
```

## Solução de Problemas

### Erro "EADDRINUSE: address already in use"
- Executar: `sudo lsof -ti:8080 | xargs -r sudo kill -9`
- Depois: `pm2 restart whatsapp-bot`

### Bot não responde no WhatsApp
- Verificar logs: `pm2 logs whatsapp-bot`
- Reautenticar: Deletar `auth_data` e reiniciar o bot

### Múltiplos processos PM2
- Limpar todos: `pm2 delete all`
- Iniciar apenas um: `pm2 start ecosystem.config.js --env production`

---

# Como Corrigir o Erro de Deploy "Branch Not Found" (Coolify)

Este erro acontece porque a sua plataforma de deploy (Coolify) está tentando baixar uma branch que não existe. Siga os passos abaixo para corrigir.

**Nenhuma alteração de código é necessária.** O problema é apenas na configuração do seu serviço na Coolify.

## Passo a Passo

1.  **Acesse o Painel da Coolify:**
    *   Faça login na sua conta da Coolify.

2.  **Vá para o seu Projeto:**
    *   Encontre e clique no seu projeto (provavelmente chamado `Whats-17-06`).

3.  **Acesse as Configurações da Aplicação:**
    *   Dentro do projeto, vá para a sua aplicação.
    *   Procure por uma aba ou seção chamada **"Configuration" (Configuração)** ou **"General" (Geral)**.

4.  **Localize e Corrija o Nome da Branch:**
    *   Dentro das configurações, procure por um campo de texto chamado **"Branch"**.
    *   O valor neste campo estará incorreto, provavelmente `Whats-17-06`.
    *   Apague `Whats-17-06` e digite `main` no lugar.

5.  **Salve e Faça o Deploy Novamente:**
    *   Clique no botão **"Save" (Salvar)** para aplicar a nova configuração.
    *   Depois de salvar, procure por um botão como **"Deploy"**, **"Redeploy"** ou **"Force Redeploy"** e clique nele para iniciar o processo de implantação novamente.

Após seguir estes passos, a Coolify irá baixar a branch `main` correta, e sua aplicação será implantada com sucesso.
