jest.mock('../database');
jest.mock('../summarizer');

const db = require('../database');
const summarizer = require('../summarizer');

const ping = require('../commands/util/ping');
const pendencias = require('../commands/util/pendencias');

describe('comandos', () => {
  test('ping responde pong', async () => {
    const message = { reply: jest.fn() };
    await ping.execute(message);
    expect(message.reply).toHaveBeenCalledWith('pong');
  });

  test('pendencias ignora nao admin', async () => {
    const message = { from: '000', client: {}, reply: jest.fn(), sendMessage: jest.fn() };
    await pendencias.execute(message, [], { sendMessage: jest.fn() });
    expect(db.getMessagesByDate).not.toHaveBeenCalled();
  });

  test('pendencias envia resumo para admin', async () => {
    process.env.WHATSAPP_ADMIN_NUMBER = 'admin';
    db.getMessagesByDate.mockResolvedValue([{ body: 'Pergunta?', fromMe: false }]);
    summarizer.generatePendingSummary.mockReturnValue('Resumo');
    const client = { sendMessage: jest.fn() };
    const message = { from: 'admin', reply: jest.fn(), client };

    await pendencias.execute(message, [], client);

    expect(client.sendMessage).toHaveBeenCalledWith('admin', expect.stringContaining('Resumo'));
  });
});
