/**
 * Tratamento de mensagens de mídia
 * Este módulo processa mensagens que contêm localização, fotos, vídeos, documentos, etc.
 */

const logger = require('../logger');

class MediaHandler {
  constructor() {
    // Tipos de mídia suportados
    this.supportedTypes = {
      location: 'localização',
      image: 'foto',
      video: 'vídeo',
      document: 'documento',
      audio: 'áudio',
      voice: 'mensagem de voz',
      sticker: 'sticker',
      gif: 'GIF'
    };
  }

  /**
   * Verifica se a mensagem é de mídia
   * @param {Object} message - Objeto da mensagem
   * @returns {boolean}
   */
  isMediaMessage(message) {
    // Verifica se tem tipo de mídia
    if (message.type && this.supportedTypes[message.type]) {
      return true;
    }

    // Verifica se tem anexos
    if (message.hasMedia || message.attachments?.length > 0) {
      return true;
    }

    // Verifica se é localização (algumas implementações não marcam o tipo corretamente)
    if (message.location) {
      return true;
    }

    // Verifica se o corpo da mensagem parece ser dados binários (base64)
    if (message.body && this.looksLikeBinaryData(message.body)) {
      return true;
    }

    return false;
  }

  /**
   * Verifica se o conteúdo parece ser dados binários
   * @param {string} content
   * @returns {boolean}
   */
  looksLikeBinaryData(content) {
    // Se for muito longo e contém caracteres típicos de base64/binário
    if (content.length > 100) {
      // Verifica padrões típicos de dados base64 ou binários
      const base64Pattern = /^[A-Za-z0-9+/=]+$/;
      const hasControlChars = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/.test(
        content
      );

      // Se parece base64 e é longo, provavelmente é mídia
      if (base64Pattern.test(content) && content.length > 500) {
        return true;
      }

      return hasControlChars;
    }
    return false;
  }

  /**
   * Processa mensagem de mídia
   * @param {Object} message - Objeto da mensagem
   * @returns {Object} - Informações processadas da mídia
   */
  async processMediaMessage(message) {
    try {
      let mediaInfo = {
        type: message.type || 'unknown',
        mediaType: this.supportedTypes[message.type] || 'mídia',
        hasMedia: !!message.hasMedia,
        size: null,
        caption: null,
        fileName: null,
        mimeType: null,
        location: null,
        processedAt: new Date().toISOString()
      };

      // Processar diferentes tipos de mídia
      switch (message.type) {
        case 'location':
          mediaInfo.location = await this.processLocation(message);
          break;

        case 'image':
        case 'video':
        case 'document':
        case 'audio':
        case 'voice':
          mediaInfo = { ...mediaInfo, ...(await this.processFile(message)) };
          break;

        case 'sticker':
          mediaInfo.stickerInfo = await this.processSticker(message);
          break;

        default:
          // Tenta processar como mídia genérica
          if (message.hasMedia) {
            mediaInfo = { ...mediaInfo, ...(await this.processFile(message)) };
          }
      }

      logger.info(
        `[MÍDIA PROCESSADA] Tipo: ${mediaInfo.mediaType} | De: ${message.from}`
      );
      return mediaInfo;
    } catch (error) {
      logger.error(`Erro ao processar mídia: ${error.message}`);
      return {
        type: 'error',
        mediaType: 'mídia com erro',
        error: error.message,
        processedAt: new Date().toISOString()
      };
    }
  }

  /**
   * Processa mensagem de localização
   * @param {Object} message
   * @returns {Object}
   */
  async processLocation(message) {
    try {
      let location = message.location;

      // Se não tiver location direta, tenta extrair do corpo
      if (!location && message.body) {
        // Alguns formatos de localização podem vir no corpo
        const locationMatch = message.body.match(
          /(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/
        );
        if (locationMatch) {
          location = {
            latitude: parseFloat(locationMatch[1]),
            longitude: parseFloat(locationMatch[2])
          };
        }
      }

      return {
        latitude: location?.latitude || null,
        longitude: location?.longitude || null,
        description: location?.description || 'Localização compartilhada'
      };
    } catch (error) {
      logger.error(`Erro ao processar localização: ${error.message}`);
      return { error: 'Erro ao processar localização' };
    }
  }

  /**
   * Processa arquivos de mídia
   * @param {Object} message
   * @returns {Object}
   */
  async processFile(message) {
    try {
      const fileInfo = {
        caption: message.caption || null,
        fileName: null,
        mimeType: null,
        size: null
      };

      // Se tem mídia, tenta obter informações
      if (message.hasMedia) {
        try {
          // Note: Não baixamos o arquivo por questões de performance e armazenamento
          // Apenas coletamos metadados
          if (message._data) {
            fileInfo.fileName = message._data.filename || null;
            fileInfo.mimeType = message._data.mimetype || null;
            fileInfo.size = message._data.size || null;
          }
        } catch (mediaError) {
          logger.warn(
            `Não foi possível obter metadados da mídia: ${mediaError.message}`
          );
        }
      }

      return fileInfo;
    } catch (error) {
      logger.error(`Erro ao processar arquivo: ${error.message}`);
      return { error: 'Erro ao processar arquivo' };
    }
  }

  /**
   * Processa stickers
   * @returns {Object}
   */
  async processSticker() {
    try {
      return {
        stickerName: message._data?.stickerName || null,
        isAnimated: message._data?.isAnimated || false
      };
    } catch (error) {
      logger.error(`Erro ao processar sticker: ${error.message}`);
      return { error: 'Erro ao processar sticker' };
    }
  }

  /**
   * Gera uma resposta amigável para mensagens de mídia
   * @param {Object} mediaInfo
   * @returns {string}
   */
  generateMediaResponse(mediaInfo) {
    const responses = {
      location: [
        '📍 Localização recebida! Obrigado por compartilhar.',
        '🗺️ Localização salva com sucesso!',
        '📍 Recebi sua localização!'
      ],
      image: [
        '📸 Foto recebida! Muito obrigado.',
        '🖼️ Imagem salva com sucesso!',
        '📷 Recebi sua foto!'
      ],
      video: [
        '🎥 Vídeo recebido! Obrigado.',
        '📹 Vídeo salvo com sucesso!',
        '🎬 Recebi seu vídeo!'
      ],
      document: [
        '📄 Documento recebido! Obrigado.',
        '📋 Arquivo salvo com sucesso!',
        '📎 Recebi seu documento!'
      ],
      audio: [
        '🎵 Áudio recebido! Obrigado.',
        '🔊 Áudio salvo com sucesso!',
        '🎧 Recebi seu áudio!'
      ],
      voice: [
        '🎤 Mensagem de voz recebida!',
        '🗣️ Áudio salvo com sucesso!',
        '🎙️ Recebi sua mensagem de voz!'
      ],
      sticker: [
        '😄 Sticker recebido! Legal!',
        '🎭 Sticker salvo!',
        '😊 Recebi seu sticker!'
      ],
      gif: [
        '🎭 GIF recebido! Muito bom!',
        '📱 GIF salvo com sucesso!',
        '😄 Recebi seu GIF!'
      ]
    };

    const typeResponses = responses[mediaInfo.type] || responses['document'];
    const randomResponse =
      typeResponses[Math.floor(Math.random() * typeResponses.length)];

    // Adiciona informações extras se disponível
    let extraInfo = '';
    if (mediaInfo.fileName) {
      extraInfo += `\n📁 Arquivo: ${mediaInfo.fileName}`;
    }
    if (mediaInfo.caption) {
      extraInfo += `\n💬 Legenda: "${mediaInfo.caption}"`;
    }
    if (mediaInfo.location) {
      extraInfo += `\n🗺️ Coordenadas: ${mediaInfo.location.latitude}, ${mediaInfo.location.longitude}`;
    }

    return randomResponse + extraInfo;
  }

  /**
   * Cria resposta automática para mensagens de mídia
   * @param {Object} mediaInfo - Informações processadas da mídia
   * @returns {string} - Resposta a ser enviada
   */
  async createResponse(mediaInfo) {
    try {
      const responses = {
        localização: [
          '📍 Localização recebida! Obrigado por compartilhar.',
          '🗺️ Legal! Recebi sua localização.',
          '📍 Localização salva! Muito obrigado.'
        ],
        foto: [
          '📸 Foto recebida! Muito legal!',
          '🖼️ Que foto bacana! Recebi aqui.',
          '📷 Foto salva! Obrigado por compartilhar.'
        ],
        vídeo: [
          '🎥 Vídeo recebido! Vou dar uma olhada.',
          '📹 Que vídeo interessante! Recebi aqui.',
          '🎬 Vídeo salvo! Obrigado por compartilhar.'
        ],
        documento: [
          '📄 Documento recebido! Obrigado.',
          '📋 Recebi seu documento! Muito útil.',
          '📊 Documento salvo! Obrigado por enviar.'
        ],
        áudio: [
          '🔊 Áudio recebido! Vou escutar.',
          '🎵 Que áudio legal! Recebi aqui.',
          '🎧 Áudio salvo! Obrigado por compartilhar.'
        ],
        'mensagem de voz': [
          '🎤 Mensagem de voz recebida! Vou escutar.',
          '🗣️ Recebi sua mensagem de voz!',
          '📢 Mensagem de voz salva! Obrigado.'
        ],
        sticker: [
          '😄 Sticker recebido! Muito legal!',
          '🎨 Que sticker bacana! Recebi aqui.',
          '😍 Sticker salvo! Obrigado por compartilhar.'
        ],
        GIF: [
          '🎭 GIF recebido! Muito engraçado!',
          '🎪 Que GIF legal! Recebi aqui.',
          '🎨 GIF salvo! Obrigado por compartilhar.'
        ]
      };

      const mediaType = mediaInfo.mediaType || 'mídia';
      const possibleResponses = responses[mediaType] || [
        '📎 Mídia recebida! Obrigado por compartilhar.',
        '💾 Recebi sua mídia! Muito legal.',
        '✅ Mídia salva! Obrigado.'
      ];

      // Escolher resposta aleatória
      const randomResponse =
        possibleResponses[Math.floor(Math.random() * possibleResponses.length)];

      // Adicionar informações extras se disponível
      let extraInfo = '';
      if (mediaInfo.location) {
        extraInfo = `\n📍 Lat: ${mediaInfo.location.latitude?.toFixed(4) || 'N/A'}, Lon: ${mediaInfo.location.longitude?.toFixed(4) || 'N/A'}`;
      } else if (mediaInfo.caption) {
        extraInfo = `\n💬 "${mediaInfo.caption}"`;
      } else if (mediaInfo.fileName) {
        extraInfo = `\n📝 Arquivo: ${mediaInfo.fileName}`;
      }

      return randomResponse + extraInfo;
    } catch (error) {
      logger.error(`Erro ao criar resposta para mídia: ${error.message}`);
      return '✅ Mídia recebida! Obrigado por compartilhar.';
    }
  }

  /**
   * Converte informações de mídia para formato de mensagem do banco
   * @param {Object} message
   * @param {Object} mediaInfo
   * @returns {Object}
   */
  formatForDatabase(message, mediaInfo) {
    return {
      chatId: message.from,
      id: message.id?.id || Date.now().toString(),
      timestamp: message.timestamp,
      isoTimestamp: new Date(message.timestamp * 1000).toISOString(),
      senderName: message._data?.notifyName || message.from,
      type: mediaInfo.type,
      body: `[${mediaInfo.mediaType.toUpperCase()}]${mediaInfo.caption ? ` ${mediaInfo.caption}` : ''}`,
      fromMe: false,
      mediaInfo: JSON.stringify(mediaInfo)
    };
  }
}

module.exports = MediaHandler;
