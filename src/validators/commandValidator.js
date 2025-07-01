const Joi = require('joi');
const logger = require('../logger');
const CONSTANTS = require('../constants');

class CommandValidator {
  constructor() {
    // Schemas de validação para cada comando
    this.schemas = {
      buscar: Joi.object({
        term: Joi.string()
          .min(2)
          .max(100)
          .pattern(/^[a-zA-Z0-9\s\-_.àáâãéêíóôõúç]+$/i)
          .required()
          .messages({
            'string.min': 'O termo de busca deve ter pelo menos 2 caracteres',
            'string.max': 'O termo de busca deve ter no máximo 100 caracteres',
            'string.pattern.base':
              'O termo de busca contém caracteres inválidos',
            'any.required': 'Termo de busca é obrigatório'
          })
      }),

      'resumo-hoje': Joi.object({
        date: Joi.date().iso().max('now').optional().messages({
          'date.iso': 'Data deve estar no formato ISO (YYYY-MM-DD)',
          'date.max': 'Data não pode ser futura'
        })
      }),

      'test-email': Joi.object({
        email: Joi.string().email().optional().messages({
          'string.email': 'Email deve ter formato válido'
        })
      }),

      logs: Joi.object({
        lines: Joi.number()
          .integer()
          .min(1)
          .max(200)
          .optional()
          .default(20)
          .messages({
            'number.min': 'Número de linhas deve ser pelo menos 1',
            'number.max': 'Número máximo de linhas é 200'
          })
      })
    };

    // Schema genérico para argumentos de comando
    this.genericSchema = Joi.object({
      args: Joi.array()
        .items(Joi.string().max(500))
        .max(CONSTANTS.MAX_COMMAND_ARGS)
        .messages({
          'array.max': `Máximo de ${CONSTANTS.MAX_COMMAND_ARGS} argumentos permitidos`
        })
    });
  }

  // Validar entrada básica de mensagem
  validateMessage(message) {
    const schema = Joi.object({
      body: Joi.string()
        .max(CONSTANTS.MAX_MESSAGE_LENGTH)
        .required()
        .messages({
          'string.max': `Mensagem muito longa. Máximo ${CONSTANTS.MAX_MESSAGE_LENGTH} caracteres`,
          'any.required': 'Corpo da mensagem é obrigatório'
        }),

      from: Joi.string()
        .pattern(/^[0-9]+@[cs]\.us$/)
        .required()
        .messages({
          'string.pattern.base': 'ID do remetente inválido'
        })
    });

    return schema.validate({
      body: message.body,
      from: message.from
    });
  }

  // Validar comando específico
  validateCommand(commandName, data) {
    try {
      const schema = this.schemas[commandName];

      if (!schema) {
        // Para comandos sem schema específico, usa validação genérica
        return this.genericSchema.validate({ args: data });
      }

      const result = schema.validate(data);

      if (result.error) {
        logger.warn(`Validação falhou para comando ${commandName}:`, {
          error: result.error.message,
          data
        });
      }

      return result;
    } catch (error) {
      logger.error('Erro durante validação:', error);
      return {
        error: new Error('Erro interno de validação'),
        value: null
      };
    }
  }

  // Sanitizar entrada do usuário
  sanitizeInput(input) {
    if (typeof input !== 'string') {
      return input;
    }

    return input
      .replace(/[<>]/g, '') // Remove tags HTML básicas
      .replace(/javascript:/gi, '') // Remove javascript:
      .replace(/on\w+=/gi, '') // Remove eventos HTML
      .trim()
      .substring(0, CONSTANTS.MAX_MESSAGE_LENGTH);
  }

  // Validar argumentos de busca
  validateSearchArgs(args) {
    if (!args || args.length === 0) {
      return {
        error: new Error('Uso: !buscar <termo>'),
        value: null
      };
    }

    const term = args.join(' ');
    return this.validateCommand('buscar', { term });
  }

  // Validar se usuário pode executar comando
  validateUserPermission(userId, commandName, commandConfig = {}) {
    // Validação básica de rate limiting será feita em outro middleware

    const validation = {
      allowed: true,
      reason: null
    };

    // Verificar se comando existe
    if (!commandName) {
      validation.allowed = false;
      validation.reason = 'Comando não especificado';
      return validation;
    }

    // Verificar tipo de comando
    if (commandConfig.adminOnly && !this.isAdmin(userId)) {
      validation.allowed = false;
      validation.reason = 'Comando restrito a administradores';
      return validation;
    }

    return validation;
  }

  // Helper para verificar se é admin (será integrado com o sistema existente)
  isAdmin(userId) {
    const { isAdmin } = require('../utils/admin');
    return isAdmin(userId);
  }

  // Validar parâmetros de paginação
  validatePagination(page = 1, limit = 20) {
    const schema = Joi.object({
      page: Joi.number().integer().min(1).max(1000).default(1),
      limit: Joi.number().integer().min(1).max(100).default(20)
    });

    return schema.validate({ page, limit });
  }

  // Adicionar novo schema de validação
  addSchema(commandName, schema) {
    this.schemas[commandName] = schema;
    logger.info(`Schema de validação adicionado para comando: ${commandName}`);
  }
}

// Instância singleton
const validator = new CommandValidator();

module.exports = validator;
