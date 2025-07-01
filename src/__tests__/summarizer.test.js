const { createDailySummary, generatePendingSummary } = require('../summarizer');

describe('summarizer', () => {
  test('createDailySummary gera resumo com métricas básicas', async () => {
    const messages = [
      { chatId: '123@c.us', senderName: 'Alice', body: 'Oi', fromMe: false },
      { chatId: '123@c.us', senderName: 'Eu', body: 'Olá', fromMe: true }
    ];

    const summary = await createDailySummary(messages);

    expect(summary).toContain('Alice');
    expect(summary).toContain('Enviadas');
    expect(summary).toContain('Recebidas');
  });

  test('generatePendingSummary identifica perguntas sem resposta', () => {
    const messages = [
      {
        chatId: '123@c.us',
        senderName: 'Alice',
        body: 'Tudo bem?',
        fromMe: false
      },
      { chatId: '123@c.us', senderName: 'Alice', body: 'Oi?', fromMe: false }
    ];

    const pending = generatePendingSummary(messages);
    expect(pending).toContain('Tudo bem?');
  });
});
