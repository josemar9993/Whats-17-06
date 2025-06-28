console.log('Testando nodemailer básico...');

try {
  const nodemailer = require('nodemailer');
  console.log('✅ Nodemailer importado com sucesso');
  console.log('Tipo:', typeof nodemailer);
  console.log('createTransporter existe?:', typeof nodemailer.createTransporter);
  
  if (typeof nodemailer.createTransporter === 'function') {
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: 'teste@gmail.com',
        pass: 'senha'
      }
    });
    console.log('✅ Transporter criado com sucesso');
  } else {
    console.log('❌ createTransporter não é uma função');
  }
  
} catch (error) {
  console.log('❌ Erro ao importar nodemailer:', error.message);
}
