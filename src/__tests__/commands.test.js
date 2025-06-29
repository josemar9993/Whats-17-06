jest.mock('../database');
jest.mock('../summarizer');
jest.mock('../utils/admin', () => ({
  isAdmin: jest.fn((id) => id === 'admin'),
  getAdminIds: jest.fn(() => ['admin'])
}));

const db = require('../database');
const summarizer = require('../summarizer');
const ping = require('../commands/util/ping');
const pendencias = require('../commands/util/pendencias');
const buscar = require('../commands/util/buscar');

describe('comandos', () => {
  test('ping responde status online', async () => {
    const message = { reply: jest.fn() };
    await ping.execute(message);
    expect(message.reply).toHaveBeenCalledWith(expect.stringMatching(/^on-line/));
  });

  test('pendencias executa para qualquer usuario', async () => {
    db.getMessagesByDate.mockResolvedValue([]);
    const message = { from: '000', client: {}, reply: jest.fn(), sendMessage: jest.fn() };
    await pendencias.execute(message, [], { sendMessage: jest.fn() });
    expect(db.getMessagesByDate).toHaveBeenCalled();
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

  test('buscar retorna resultados', async () => {
    db.searchMessages.mockResolvedValue([{ senderName: 'Alice', body: 'pedido' }]);
    const message = { from: 'admin', reply: jest.fn() };
    await buscar.execute(message, ['pedido']);
    expect(message.reply).toHaveBeenCalledWith(expect.stringContaining('Alice'));
  });
});
