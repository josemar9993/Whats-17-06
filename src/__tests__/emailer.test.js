jest.mock('nodemailer', () => {
  const sendMailMock = jest.fn();
  return {
    createTransport: jest.fn(() => ({ sendMail: sendMailMock })),
    sendMailMock
  };
});

const nodemailer = require('nodemailer');
const { sendEmail } = require('../emailer');
const { sendMailMock } = nodemailer;

beforeEach(() => {
  sendMailMock.mockReset().mockResolvedValue(true);
  process.env.EMAIL_USER = 'user@test.com';
  process.env.EMAIL_PASS = 'pass';
  process.env.EMAIL_TO = 'dest@test.com';
  process.env.WHATSAPP_ADMIN_NUMBER = 'admin';
});

describe('emailer', () => {
  test('envia email com nodemailer', async () => {
    await sendEmail({ subject: 'Assunto', text: 'corpo' });
    expect(sendMailMock).toHaveBeenCalled();
  });

  test('propaga erro e notifica via WhatsApp', async () => {
    const error = new Error('falha');
    sendMailMock.mockRejectedValueOnce(error);
    const client = { sendMessage: jest.fn().mockResolvedValue() };

    await expect(sendEmail({ subject: 'Assunto' }, client)).rejects.toThrow('falha');
    expect(client.sendMessage).toHaveBeenCalled();
  });
});
