const { createDailySummary, generatePendingSummary } = require('../summarizer');

describe('summarizer', () => {
  test('createDailySummary gera resumo empresarial com métricas', async () => {
    const messages = [
      { 
        chatId: '123@c.us', 
        senderName: 'Alice', 
        contactName: 'Alice',
        body: 'Preciso de suporte urgente', 
        fromMe: false,
        timestamp: Date.now() / 1000
      },
      { 
        chatId: '123@c.us', 
        senderName: 'Eu', 
        body: 'Vou te ajudar', 
        fromMe: true,
        timestamp: Date.now() / 1000 + 300 // 5 minutos depois
      }
    ];

    const summary = await createDailySummary(messages);

    expect(summary).toContain('RELATÓRIO EMPRESARIAL DIÁRIO');
    expect(summary).toContain('Alice');
    expect(summary).toContain('Mensagens Enviadas');
    expect(summary).toContain('Mensagens Recebidas');
    expect(summary).toContain('Taxa de Resposta');
    expect(summary).toContain('DASHBOARD DE PERFORMANCE');
  });

  test('generatePendingSummary identifica perguntas sem resposta', () => {
    const messages = [
      {
        chatId: '123@c.us',
        senderName: 'Alice',
        contactName: 'Alice',
        body: 'Tudo bem com o sistema?',
        fromMe: false,
        timestamp: Date.now() / 1000
      },
      { 
        chatId: '123@c.us', 
        senderName: 'Alice', 
        contactName: 'Alice',
        body: 'Preciso de uma resposta urgente?', 
        fromMe: false,
        timestamp: Date.now() / 1000 + 100
      }
    ];

    const pending = generatePendingSummary(messages);
    expect(pending).toContain('Tudo bem com o sistema?');
    expect(pending).toContain('Alice');
  });
});
