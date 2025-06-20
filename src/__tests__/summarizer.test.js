const { generateSummary, generatePendingSummary } = require('../summarizer');

describe('summarizer', () => {
  const chats = [
    {
      chatId: 'test@c.us',
      messages: [
        {
          chatId: 'test@c.us',
          id: '1',
          timestamp: 0,
          isoTimestamp: '',
          senderName: 'A',
          type: 'chat',
          body: 'Olá',
          fromMe: false
        },
        {
          chatId: 'test@c.us',
          id: '2',
          timestamp: 1,
          isoTimestamp: '',
          senderName: 'B',
          type: 'chat',
          body: 'Oi',
          fromMe: false
        }
      ]
    }
  ];

  test('generateSummary retorna texto', () => {
    const res = generateSummary(chats);
    expect(typeof res).toBe('string');
    expect(res).toContain('Resumo das Conversas');
  });

  test('generatePendingSummary detecta pendencia', () => {
    const res = generatePendingSummary(chats);
    expect(res).toContain('Resumo de Pendências');
  });
});
