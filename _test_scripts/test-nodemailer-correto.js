console.log('Testando com nome correto...');

try {
  const nodemailer = require('nodemailer');
  console.log('✅ Nodemailer importado');
  console.log('createTransport existe?:', typeof nodemailer.createTransport);
  
  if (typeof nodemailer.createTransport === 'function') {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'teste@gmail.com',
        pass: 'senha'
      }
    });
    console.log('✅ Transporter criado com sucesso!');
  }
  
} catch (error) {
  console.log('❌ Erro:', error.message);
}
