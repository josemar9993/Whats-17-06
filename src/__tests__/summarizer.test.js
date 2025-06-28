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

  test('generateSummary com array vazio', () => {
    const res = generateSummary([]);
    // Correção: Atualiza o texto esperado para corresponder à nova implementação.
    expect(res).toBe('Nenhuma mensagem para analisar.');
  });

  test('aceita lista simples de mensagens', () => {
    const flat = chats[0].messages;
    const res = generateSummary(flat);
    expect(res).toContain('Resumo das Conversas');
  });

  test('sem pendencias retorna mensagem apropriada', () => {
    const noPend = JSON.parse(JSON.stringify(chats));
    noPend[0].messages[noPend[0].messages.length - 1].fromMe = true;
    const res = generatePendingSummary(noPend);
    expect(res).toContain('Nenhuma conversa pendente');
  });
});
