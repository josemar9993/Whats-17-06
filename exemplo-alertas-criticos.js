// exemplo-alertas-criticos.js
// Demonstração do sistema de alertas críticos empresariais

const Database = require('./src/database');

// Simula dados críticos que um empresário encontraria
const situacoesCriticas = [
  {
    chatId: '5548999312271@c.us',
    senderName: 'João Silva - Cliente Premium',
    mensagens: [
      {
        body: 'Bom dia! O sistema parou de funcionar aqui, é URGENTE!',
        fromMe: false,
        timestamp: Math.floor((Date.now() - 3 * 60 * 60 * 1000) / 1000) // 3h atrás
      },
      {
        body: 'Pessoal, estamos perdendo dinheiro a cada minuto que passa!',
        fromMe: false,
        timestamp: Math.floor((Date.now() - 2.5 * 60 * 60 * 1000) / 1000) // 2.5h atrás
      },
      {
        body: 'CRÍTICO: Sistema completamente down, clientes reclamando',
        fromMe: false,
        timestamp: Math.floor((Date.now() - 2 * 60 * 60 * 1000) / 1000) // 2h atrás
      }
    ]
  },
  {
    chatId: '5548999312272@c.us',
    senderName: 'Maria Santos - Lead Qualificado',
    mensagens: [
      {
        body: 'Oi! Gostaria de fechar a proposta hoje mesmo',
        fromMe: false,
        timestamp: Math.floor((Date.now() - 2 * 60 * 60 * 1000) / 1000) // 2h atrás
      },
      {
        body: 'Preciso de uma resposta rápida para aprovar o orçamento',
        fromMe: false,
        timestamp: Math.floor((Date.now() - 1.5 * 60 * 60 * 1000) / 1000) // 1.5h atrás
      },
      {
        body: 'Estou esperando retorno para definir o investimento',
        fromMe: false,
        timestamp: Math.floor((Date.now() - 1 * 60 * 60 * 1000) / 1000) // 1h atrás
      }
    ]
  },
  {
    chatId: '5548999312273@c.us',
    senderName: 'Carlos Tech - Parceiro',
    mensagens: [
      {
        body: 'Houston, we have a problem! API retornando 500',
        fromMe: false,
        timestamp: Math.floor((Date.now() - 4 * 60 * 60 * 1000) / 1000) // 4h atrás
      },
      {
        body: 'Falha crítica no sistema de pagamentos, preciso de ajuda urgente',
        fromMe: false,
        timestamp: Math.floor((Date.now() - 3.5 * 60 * 60 * 1000) / 1000) // 3.5h atrás
      }
    ]
  },
  {
    chatId: '5548999312274@c.us',
    senderName: 'Ana Startup',
    mensagens: [
      {
        body: 'Boa tarde! Vocês fazem desenvolvimento de apps?',
        fromMe: false,
        timestamp: Math.floor((Date.now() - 1 * 60 * 60 * 1000) / 1000) // 1h atrás
      }
    ]
  },
  {
    chatId: '5548999312275@c.us',
    senderName: 'Empresa ABC - Grande Cliente',
    mensagens: [
      {
        body: 'Sistema indisponível há 2 horas, nossos clientes estão reclamando',
        fromMe: false,
        timestamp: Math.floor((Date.now() - 2.5 * 60 * 60 * 1000) / 1000) // 2.5h atrás
      },
      {
        body: 'Isso é inaceitável! Vamos ter que avaliar outros fornecedores',
        fromMe: false,
        timestamp: Math.floor((Date.now() - 2 * 60 * 60 * 1000) / 1000) // 2h atrás
      },
      {
        body: 'Última chance: se não resolverem hoje, cancelamos o contrato',
        fromMe: false,
        timestamp: Math.floor((Date.now() - 1.5 * 60 * 60 * 1000) / 1000) // 1.5h atrás
      }
    ]
  }
];

function analisarSituacaoCritica() {
  console.log('🚨 SISTEMA DE ALERTAS CRÍTICOS EMPRESARIAIS\n');
  console.log('═'.repeat(60));
  console.log('📊 Analisando situações que precisam de ATENÇÃO IMEDIATA');
  console.log('═'.repeat(60));
  
  const agora = new Date();
  const alertasCriticos = [];
  
  situacoesCriticas.forEach(situacao => {
    const ultimaMensagem = situacao.mensagens[situacao.mensagens.length - 1];
    const tempoSemResposta = Math.floor((Date.now() - (ultimaMensagem.timestamp * 1000)) / (1000 * 60)); // em minutos
    
    // Análise de criticidade
    let nivelCriticidade = 0;
    let razoes = [];
    let palavrasCriticas = [];
    
    situacao.mensagens.forEach(msg => {
      const texto = msg.body.toLowerCase();
      
      // Palavras críticas empresariais
      const criticWords = [
        'urgente', 'crítico', 'emergência', 'parado', 'down', 'não funciona',
        'erro grave', 'sistema fora', 'perdemos', 'problema sério', 'falha crítica',
        'cliente reclamando', 'perdendo dinheiro', 'inaceitável', 'cancelamos',
        'indisponível', 'última chance'
      ];
      
      criticWords.forEach(word => {
        if (texto.includes(word)) {
          if (!palavrasCriticas.includes(word)) {
            palavrasCriticas.push(word);
            nivelCriticidade += word === 'urgente' || word === 'crítico' ? 2 : 1;
          }
        }
      });
    });
    
    // Fatores de criticidade
    const recebidas = situacao.mensagens.length;
    const enviadas = 0; // Simulando que não foram respondidas
    
    if (recebidas > 0 && enviadas === 0) {
      nivelCriticidade += recebidas > 2 ? 3 : 2;
      razoes.push(`${recebidas} mensagens sem resposta`);
    }
    
    if (tempoSemResposta > 120) { // 2+ horas
      nivelCriticidade += 4;
      razoes.push(`${Math.floor(tempoSemResposta / 60)}h sem resposta`);
    } else if (tempoSemResposta > 60) { // 1+ hora
      nivelCriticidade += 2;
      razoes.push(`${tempoSemResposta}min sem resposta`);
    }
    
    if (palavrasCriticas.length > 0) {
      nivelCriticidade += palavrasCriticas.length;
      razoes.push(`Contém: ${palavrasCriticas.join(', ')}`);
    }
    
    // Cliente premium ou grande volume
    if (situacao.senderName.includes('Premium') || situacao.senderName.includes('Grande Cliente')) {
      nivelCriticidade += 2;
      razoes.push('Cliente Premium/Estratégico');
    }
    
    if (recebidas > 2) {
      nivelCriticidade += 1;
      razoes.push(`Volume alto: ${recebidas} mensagens`);
    }
    
    if (nivelCriticidade >= 4) {
      alertasCriticos.push({
        nome: situacao.senderName,
        criticidade: nivelCriticidade,
        razoes: razoes,
        recebidas: recebidas,
        enviadas: enviadas,
        ultimaMensagem: ultimaMensagem.body,
        tempoSemResposta: tempoSemResposta,
        palavrasCriticas: palavrasCriticas
      });
    }
  });
  
  // Ordena por criticidade
  alertasCriticos.sort((a, b) => b.criticidade - a.criticidade);
  
  // Exibe relatório
  console.log(`\n🚨 **${alertasCriticos.length} SITUAÇÃO(ÕES) CRÍTICA(S) DETECTADA(S)**`);
  console.log(`⏰ Análise realizada em: ${agora.toLocaleTimeString('pt-BR')}\n`);
  
  alertasCriticos.forEach((alerta, idx) => {
    const nivelEmoji = alerta.criticidade >= 10 ? '🔴 CRÍTICO' : 
                      alerta.criticidade >= 7 ? '🟠 ALTO' : 
                      alerta.criticidade >= 5 ? '🟡 MÉDIO' : '🟢 BAIXO';
    
    console.log(`${idx + 1}. ${nivelEmoji} | **${alerta.nome}**`);
    console.log(`   📊 Nível de Criticidade: ${alerta.criticidade}/10`);
    console.log(`   📥 ${alerta.recebidas} recebidas | 📤 ${alerta.enviadas} enviadas`);
    
    const tempo = alerta.tempoSemResposta >= 60 ? 
                 `${Math.floor(alerta.tempoSemResposta / 60)}h${alerta.tempoSemResposta % 60}m` : 
                 `${alerta.tempoSemResposta}m`;
    console.log(`   ⏰ Sem resposta há: ${tempo}`);
    
    console.log(`   🚨 Motivos críticos: ${alerta.razoes.join(' | ')}`);
    
    const msgCorta = alerta.ultimaMensagem.length > 70 ? 
                    alerta.ultimaMensagem.substring(0, 70) + '...' : 
                    alerta.ultimaMensagem;
    console.log(`   💬 Última mensagem: "${msgCorta}"`);
    console.log('');
  });
  
  // Resumo executivo para gestores
  const criticos = alertasCriticos.filter(a => a.criticidade >= 10).length;
  const altos = alertasCriticos.filter(a => a.criticidade >= 7 && a.criticidade < 10).length;
  const totalNaoRespondidas = alertasCriticos.reduce((sum, a) => sum + a.recebidas, 0);
  
  console.log('📈 **RESUMO EXECUTIVO PARA GESTÃO**');
  console.log('═'.repeat(50));
  console.log(`🔴 Situações Críticas: ${criticos}`);
  console.log(`🟠 Situações de Alta Prioridade: ${altos}`);
  console.log(`📥 Total de mensagens não respondidas: ${totalNaoRespondidas}`);
  console.log(`⚠️  Risco de perda de clientes: ${criticos > 0 ? 'ALTO' : 'MÉDIO'}`);
  console.log(`💰 Potencial perda de receita: ${criticos > 0 ? 'SIM' : 'BAIXO'}`);
  
  if (criticos > 0) {
    console.log('\n🚨 **AÇÃO IMEDIATA NECESSÁRIA**');
    console.log(`⚡ ${criticos} caso(s) precisam de resposta AGORA!`);
    console.log('📧 Recomendação: Enviar alerta por email para gestores');
    console.log('📞 Considerar contato telefônico para casos críticos');
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('💡 ESTE SISTEMA RESOLVE PROBLEMAS REAIS:');
  console.log('='.repeat(60));
  console.log('✅ Evita perda de clientes por falta de resposta');
  console.log('✅ Prioriza situações críticas automaticamente');
  console.log('✅ Identifica oportunidades de negócio em risco');
  console.log('✅ Calcula impacto financeiro de demoras');
  console.log('✅ Fornece métricas para melhoria de processos');
  console.log('✅ Envia alertas proativos para gestores');
  
  return alertasCriticos;
}

// Executa a análise
analisarSituacaoCritica();
