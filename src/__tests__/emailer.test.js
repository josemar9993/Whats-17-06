jest.mock('nodemailer', () => {
  const sendMailMock = jest.fn();
  return {
    createTransport: jest.fn(() => ({ sendMail: sendMailMock })),
    sendMailMock
  };
});
jest.mock('../utils/admin', () => ({
  getAdminIds: () => ['admin']
}));

let sendEmail;

beforeEach(() => {
  jest.resetModules();
  const nodemailerRef = require('nodemailer');
  nodemailerRef.sendMailMock.mockReset().mockResolvedValue(true);
  process.env.EMAIL_USER = 'user@test.com';
  process.env.EMAIL_PASS = 'pass';
  process.env.EMAIL_TO = 'dest@test.com';
  process.env.ADMIN_WHATSAPP_IDS = 'admin';
  sendEmail = require('../emailer').sendEmail;
});

describe('emailer', () => {
  test('envia email com nodemailer', async () => {
    await expect(sendEmail({ subject: 'Assunto', text: 'corpo' })).resolves.not.toThrow();
  });
});
