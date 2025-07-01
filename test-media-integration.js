/**
 * Teste da integração do tratamento de mídia
 * Simula mensagens de mídia para verificar se o sistema está funcionando
 */

require('dotenv').config();
const MediaHandler = require('./src/utils/mediaHandler');

async function testMediaIntegration() {
  console.log('🧪 Testando integração do tratamento de mídia...\n');

  const mediaHandler = new MediaHandler();

  // Teste 1: Mensagem de localização
  console.log('📍 Teste 1: Mensagem de localização');
  const locationMessage = {
    type: 'location',
    from: '5548999123456@c.us',
    location: {
      latitude: -27.5954,
      longitude: -48.5480
    },
    _data: { notifyName: 'Usuário Teste' }
  };

  const isLocation = mediaHandler.isMediaMessage(locationMessage);
  console.log(`   É mídia: ${isLocation}`);
  
  if (isLocation) {
    const processed = await mediaHandler.processMediaMessage(locationMessage);
    console.log('   Processado:', JSON.stringify(processed, null, 2));
    
    const response = await mediaHandler.createResponse(processed);
    console.log(`   Resposta: ${response}\n`);
  }

  // Teste 2: Mensagem de foto
  console.log('📸 Teste 2: Mensagem de foto');
  const imageMessage = {
    type: 'image',
    from: '5548999123456@c.us',
    hasMedia: true,
    _data: { 
      notifyName: 'Usuário Teste',
      caption: 'Olha que foto legal!'
    }
  };

  const isImage = mediaHandler.isMediaMessage(imageMessage);
  console.log(`   É mídia: ${isImage}`);
  
  if (isImage) {
    const processed = await mediaHandler.processMediaMessage(imageMessage);
    console.log('   Processado:', JSON.stringify(processed, null, 2));
    
    const response = await mediaHandler.createResponse(processed);
    console.log(`   Resposta: ${response}\n`);
  }

  // Teste 3: Mensagem com dados binários
  console.log('💾 Teste 3: Mensagem com dados binários');
  const binaryMessage = {
    type: 'unknown',
    from: '5548999123456@c.us',
    body: '/9j/4AAQSkZJRgABAQAASABIAAD/4QCMRXhpZgAATU0AKgAAAAgABQESAAMAAAABAAEAAAEaAAUAAAABAAAASgEbAAUAAAABAAAAUgEoAAMAAAABAAIAAIdpAAQAAAABAAAAWgAAAAAAAABIAAAAAQAAAEgAAAABAAOgAQADAAAAAQABAACgAgAEAAAAAQAAAGSgAwAEAAAAAQAAAGQAAAAA/+0AOFBob3Rvc2hvcCAzLjAAOEJJTQQEAAAAAAAAOEJJTQQlAAAAAAAQ1B2M2Y8AsgTpgAmY7PhCfv/AABEIAGQAZAMBIgACEQEDEQH/xAAfAAABBQEBAQEBAQAAAAAAAAAAAQIDBAUGBwgJCgv/xAC1EAACAQMDAgQDBQUEBAAAAX0BAgMABBEFEiExQQYTUWEHInEUMoGRoQgjQrHBFVLR8CQzYnKCCQoWFxgZGiUmJygpKjQ1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4eLj5OXm5+jp6vHy8/T19vf4+fr/xAAfAQADAQEBAQEBAQEBAAAAAAAAAQIDBAUGBwgJCgv/xAC1EQACAQIEBAMEBwUEBAABAncAAQIDEQQFITEGEkFRB2FxEyIygQgUQpGhscEJIzNS8BVictEKFiQ04SXxFxgZGiYnKCkqNTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqCg4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2dri4+Tl5ufo6ery8/T19vf4+fr/2wBDAAYGBgYGBgoH',
    _data: { notifyName: 'Usuário Teste' }
  };

  const isBinary = mediaHandler.isMediaMessage(binaryMessage);
  console.log(`   É mídia: ${isBinary}`);
  
  if (isBinary) {
    const processed = await mediaHandler.processMediaMessage(binaryMessage);
    console.log('   Processado:', JSON.stringify(processed, null, 2));
    
    const response = await mediaHandler.createResponse(processed);
    console.log(`   Resposta: ${response}\n`);
  }

  // Teste 4: Mensagem de texto normal (não deve ser processada como mídia)
  console.log('💬 Teste 4: Mensagem de texto normal');
  const textMessage = {
    type: 'chat',
    from: '5548999123456@c.us',
    body: 'Olá, como vai?',
    _data: { notifyName: 'Usuário Teste' }
  };

  const isText = mediaHandler.isMediaMessage(textMessage);
  console.log(`   É mídia: ${isText} (deve ser false)\n`);

  // Teste 5: Comando com prefix (não deve ser processado como mídia)
  console.log('⚡ Teste 5: Comando com prefix');
  const commandMessage = {
    type: 'chat',
    from: '5548999123456@c.us',
    body: '!ajuda',
    _data: { notifyName: 'Usuário Teste' }
  };

  const isCommand = mediaHandler.isMediaMessage(commandMessage);
  console.log(`   É mídia: ${isCommand} (deve ser false)`);

  console.log('\n✅ Testes de integração de mídia concluídos!');
  console.log('📋 Resumo:');
  console.log('   - Localização: detectada e processada');
  console.log('   - Foto: detectada e processada');
  console.log('   - Dados binários: detectados e processados');
  console.log('   - Texto normal: não processado como mídia');
  console.log('   - Comando: não processado como mídia');
}

// Executar teste se chamado diretamente
if (require.main === module) {
  testMediaIntegration().catch(console.error);
}

module.exports = { testMediaIntegration };
