const logger = require('../../logger');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'ajuda',
  description: 'Lista todos os comandos disponíveis.',
  category: 'util',
  async execute(message, args) {
    try {
      const categoria = args[0]?.toLowerCase();
      
      if (categoria === 'executivo' || categoria === 'empresa') {
        const ajudaExecutiva = `
🏢 **COMANDOS EMPRESARIAIS - WhatsApp Business Intelligence**
═══════════════════════════════════════════════════════════

📊 **RELATÓRIOS EXECUTIVOS**
• !relatorio-executivo [periodo] - Relatório completo empresarial
  Períodos: hoje, ontem, semana, mes, DD/MM/YYYY
  
🚨 **MONITORAMENTO EM TEMPO REAL**
• !alertas [limite] - Situações críticas que precisam de atenção
• !stats - Estatísticas operacionais em tempo real

🔍 **ANÁLISE DE DADOS**
• !buscar <termo> - Busca avançada em conversas
• !pendencias - Mensagens não respondidas (críticas)
• !resumo-hoje [data] - Resumo inteligente do período

⚙️ **GESTÃO OPERACIONAL**
• !grupos - Monitoramento de grupos ativos
• !logs [linhas] - Análise de logs do sistema
• !config - Configurações empresariais
• !uptime - Performance e disponibilidade

📈 **MÉTRICAS DE NEGÓCIO**
• Taxa de resposta em tempo real
• Tempo médio de resposta por cliente
• Identificação automática de temas críticos
• Alertas de contatos ignorados
• Dashboard de performance

💡 **RECURSOS AVANÇADOS**
• Relatórios automáticos por email
• Análise de sentimento dos clientes  
• Detecção de urgência por palavras-chave
• Ranking de atividade por contatos
• Métricas de engajamento

🎯 **PARA GESTORES**
Estes comandos foram projetados para dar visibilidade completa
das operações de comunicação da empresa via WhatsApp.

Digite !ajuda geral para ver todos os comandos.
        `;
        
        await message.reply(ajudaExecutiva.trim());
        return;
      }

      // Ajuda geral padrão
      const commandsPath = path.resolve(__dirname, '../../../COMMANDS.md');
      
      let resposta = `
🤖 **SISTEMA DE COMANDOS - WhatsApp Bot Enterprise**
════════════════════════════════════════════════════

👤 **COMANDOS GERAIS** (Todos os usuários)
• !ajuda - Esta lista de comandos
• !ajuda executivo - Comandos empresariais avançados
• !ping - Verifica se o bot está funcionando
• !versao - Versão atual do sistema
• !uptime - Tempo online do bot

👥 **COMANDOS DE GRUPO**
• !todos - Menciona todos os membros do grupo

🔧 **COMANDOS ADMINISTRATIVOS** (Apenas admins)
• !stats - Estatísticas detalhadas do sistema
• !relatorio-executivo - Relatório empresarial completo
• !alertas - Situações críticas em tempo real
• !buscar <termo> - Busca avançada em mensagens
• !pendencias - Mensagens aguardando resposta
• !resumo-hoje [data] - Resumo inteligente do dia
• !logs [linhas] - Visualizar logs do sistema
• !grupos - Lista grupos monitorados
• !config - Configurações do bot
• !reiniciar - Reinicia o sistema
• !test-email - Testa envio de emails

📊 **RECURSOS EMPRESARIAIS**
✅ Relatórios executivos automáticos
✅ Monitoramento em tempo real
✅ Análise de performance 
✅ Alertas críticos por email
✅ Dashboard de métricas
✅ Análise de sentimentos

Para comandos empresariais avançados: !ajuda executivo
      `;

      try {
        if (fs.existsSync(commandsPath)) {
          const md = await fs.promises.readFile(commandsPath, 'utf8');
          const regex = /^##\s+(!\S+)\n([^#]+)/gm;
          const comandosAdicionais = [];
          let match;
          while ((match = regex.exec(md)) !== null) {
            const nome = match[1];
            const desc = match[2].split('\n')[0].trim();
            if (!resposta.includes(nome)) {
              comandosAdicionais.push(`• ${nome} - ${desc}`);
            }
          }
          if (comandosAdicionais.length > 0) {
            resposta += `\n\n📋 **COMANDOS ADICIONAIS**\n${comandosAdicionais.join('\n')}`;
          }
        }
      } catch (error) {
        logger.warn('Não foi possível carregar COMMANDS.md:', error.message);
      }

      resposta += `\n\n🤖 Bot em produção | ⏰ ${new Date().toLocaleTimeString('pt-BR')}`;
      
      await message.reply(resposta.trim());
      
    } catch (error) {
      logger.error('Erro ao carregar comandos:', error);
      await message.reply('❌ Não foi possível carregar a lista de comandos.');
    }
  }
};
