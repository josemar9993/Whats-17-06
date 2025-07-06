# 🤝 Guia de Contribuição

Obrigado por considerar contribuir para o WhatsApp Bot Enterprise! Este documento fornece diretrizes para contribuições.

## 📋 Processo de Contribuição

### 1. 🔍 Antes de Contribuir
- Verifique se já existe uma issue relacionada
- Leia toda a documentação disponível
- Teste o sistema localmente
- Siga o [checklist de alterações](CHECKLIST_COMPLETO_ALTERACOES.md)

### 2. 🌱 Preparando o Ambiente

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/Whats-17-06.git
cd Whats-17-06

# Configure o ambiente
cp .env.example .env
# Edite o .env com suas configurações

# Instale dependências
npm install

# Execute o setup
./setup.sh

# Teste o sistema
npm test
node test-command.js
```

### 3. 📝 Criando uma Contribuição

#### Para Correções de Bug:
1. Crie uma branch: `git checkout -b fix/descricao-do-bug`
2. Faça as correções necessárias
3. Teste completamente a correção
4. Adicione/atualize testes se necessário
5. Documente a correção no CHANGELOG.md

#### Para Novas Funcionalidades:
1. Crie uma issue primeiro para discussão
2. Crie uma branch: `git checkout -b feature/nova-funcionalidade`
3. Implemente a funcionalidade
4. Adicione testes adequados
5. Atualize a documentação
6. Adicione entrada no CHANGELOG.md

## 🔧 Padrões de Código

### JavaScript/Node.js
- Use ESLint configurado no projeto
- Siga o padrão de nomenclatura existente
- Adicione comentários para códigos complexos
- Use async/await ao invés de callbacks

### Comandos WhatsApp
```javascript
module.exports = {
  name: 'nome-comando',
  aliases: ['alias1', 'alias2'],
  description: 'Descrição clara do comando',
  usage: '!nome-comando [parametros]',
  adminOnly: false, // ou true se for admin
  category: 'categoria',
  
  async execute(message, args, client) {
    try {
      // Implementação do comando
      // Sempre incluir tratamento de erros
      // Usar logs informativos
    } catch (error) {
      // Tratamento de erro adequado
    }
  }
};
```

### Estrutura de Commits
```
tipo(escopo): descrição breve

Descrição mais detalhada se necessário.

- Lista de mudanças principais
- Outras informações relevantes

Fixes #numero-da-issue
```

**Tipos de commit:**
- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Mudanças na documentação
- `style`: Formatação, sem mudança de código
- `refactor`: Refatoração de código
- `test`: Adição ou correção de testes
- `chore`: Tarefas de manutenção

## 🧪 Testes

### Executar Testes
```bash
# Testes unitários
npm test

# Teste de integração
node test-command.js

# Teste do sistema completo
./setup.sh && node test-system.js
```

### Escrever Testes
- Teste todas as funcionalidades críticas
- Inclua testes para casos extremos
- Use nomes descritivos para os testes
- Mantenha os testes independentes

## 📚 Documentação

### O que Documentar
- Novas funcionalidades
- Mudanças na API
- Configurações necessárias
- Comandos adicionados/modificados

### Onde Documentar
- **README.md** - Visão geral e quick start
- **CHANGELOG.md** - Todas as mudanças
- **Comentários no código** - Lógica complexa
- **JSDoc** - Funções e métodos

## 🚀 Deploy e Produção

### Antes do Deploy
1. Execute TODOS os testes
2. Siga o [checklist completo](CHECKLIST_COMPLETO_ALTERACOES.md)
3. Teste em ambiente local
4. Verifique se não há arquivos sensíveis no commit

### Deploy Automático
```bash
# No servidor DigitalOcean
./deploy-digitalocean.sh production v1.x.x
```

## 🐛 Reportando Bugs

### Informações Obrigatórias
- **Versão do sistema:** Node.js, NPM, OS
- **Versão do bot:** Encontrada no package.json
- **Descrição do problema:** Clara e detalhada
- **Passos para reproduzir:** Lista numerada
- **Comportamento esperado:** O que deveria acontecer
- **Comportamento atual:** O que está acontecendo
- **Logs:** Inclua logs relevantes (sem informações sensíveis)

### Template de Issue
```markdown
## 🐛 Descrição do Bug
Descrição clara e concisa do problema.

## 🔄 Passos para Reproduzir
1. Vá para '...'
2. Clique em '...'
3. Execute '...'
4. Veja o erro

## ✅ Comportamento Esperado
O que deveria acontecer.

## ❌ Comportamento Atual
O que está acontecendo atualmente.

## 🖼️ Screenshots
Se aplicável, adicione screenshots.

## 🔍 Informações do Sistema
- OS: [e.g. Ubuntu 20.04]
- Node.js: [e.g. 18.17.0]
- Versão do Bot: [e.g. 1.1.0]

## 📝 Logs
```
Inclua logs relevantes aqui
```

## 💡 Contexto Adicional
Qualquer outra informação sobre o problema.
```

## 🎯 Prioridades

### Alta Prioridade
- Bugs que quebram funcionalidades críticas
- Problemas de segurança
- Falhas no deploy automático
- Perda de dados

### Média Prioridade
- Melhorias de performance
- Novas funcionalidades solicitadas
- Refatorações importantes
- Melhorias na documentação

### Baixa Prioridade
- Melhorias de UI/UX
- Otimizações menores
- Funcionalidades experimentais

## 📞 Contato

- **Issues:** Use o sistema de issues do GitHub
- **Discussões:** Use GitHub Discussions para dúvidas
- **Emergências:** Contate os mantenedores diretamente

## 📜 Código de Conduta

### Nossos Compromissos
- Ambiente acolhedor e inclusivo
- Respeito a diferentes pontos de vista
- Foco em melhorar o projeto
- Colaboração construtiva

### Comportamentos Esperados
- Use linguagem acolhedora e inclusiva
- Respeite pontos de vista diferentes
- Aceite críticas construtivas
- Foque no melhor para a comunidade

### Comportamentos Inaceitáveis
- Linguagem ou imagens sexualizadas
- Trolling, comentários insultuosos
- Assédio público ou privado
- Publicar informações privadas sem permissão

---

**Obrigado por contribuir! 🙏**

Sua contribuição ajuda a tornar este projeto melhor para todos. Se você tiver dúvidas sobre este guia, abra uma issue ou discussão.
