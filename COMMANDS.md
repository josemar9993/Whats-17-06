# Comandos do Bot

Este documento lista os comandos disponíveis para interagir com o bot via WhatsApp.

## !ping
Envia `pong` como resposta imediata. Útil para verificar se o bot está online.

Exemplo:
```
!ping
```

## !deploy
**[ADMIN ONLY]** Executa deploy automático no servidor. Permite atualizar o sistema diretamente pelo WhatsApp.

Subcomandos:
- `!deploy servidor` - Deploy no servidor remoto
- `!deploy local` - Restart local
- `!deploy docker` - Deploy com Docker
- `!deploy status` - Status do sistema
- `!deploy logs` - Últimos logs
- `!deploy restart` - Reiniciar PM2

Exemplo:
```
!deploy servidor
!deploy status
```

## !pendencias
Disponível apenas para o número definido em `WHATSAPP_ADMIN_NUMBER`. O bot envia um resumo por e-mail com as conversas que aguardam resposta.

Exemplo:
```
!pendencias
```

## !resumo-hoje
Gera um resumo das conversas de uma data ou intervalo. Se usado sem parâmetros, considera o dia atual.

Exemplos:
```
!resumo-hoje
!resumo-hoje 01/02/2024 05/02/2024
```

## !todos
Menciona todos os participantes do grupo atual.

Exemplo:
```
!todos
```

## !test-email
Dispara um e-mail de teste para validar as credenciais configuradas.

Exemplo:
```
!test-email
```

## !buscar
Pesquisa mensagens contendo um termo específico no banco de dados.

Exemplo:
```
!buscar pedido
```

## !ajuda
Lista todos os comandos disponíveis conforme este documento.

Exemplo:
```
!ajuda
```
