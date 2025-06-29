const logger = require('../logger');
const { getAdminIds } = require('../utils/admin');
const CONSTANTS = require('../constants');

class ErrorHandler {
  constructor() {
    this.criticalErrors = [
      'ENOENT',
      'ECONNREFUSED', 
      'ECONNRESET',
      'ETIMEDOUT',
      'DATABASE_ERROR',
      'AUTHENTICATION_FAILED',
      'MEMORY_LIMIT_EXCEEDED'
    ];
    
    this.errorCounts = new Map();
    this.lastNotification = new Map();
    this.notificationThreshold = 5; // Notificar após 5 erros do mesmo tipo
    this.notificationCooldown = 300000; // 5 minutos entre notificações
  }
  
  // Manipulador principal de erros
  async handle(error, context = {}) {
    const errorInfo = this.analyzeError(error, context);
    
    // Logar o erro
    await this.logError(errorInfo);
    
    // Contar ocorrências
    this.trackError(errorInfo);
    
    // Notificar admins se necessário
    if (this.shouldNotifyAdmins(errorInfo)) {
      await this.notifyAdmins(errorInfo);
    }
    
    // Retornar resposta apropriada
    return this.getErrorResponse(errorInfo);
  }
  
  // Analisar erro e extrair informações relevantes
  analyzeError(error, context) {
    const errorInfo = {
      message: error.message || 'Erro desconhecido',
      stack: error.stack,
      code: error.code,
      type: this.categorizeError(error),
      severity: this.getSeverity(error),
      context: {
        ...context,
        timestamp: new Date().toISOString(),
        memoryUsage: process.memoryUsage(),
        uptime: process.uptime()
      },
      isCritical: this.isCritical(error)
    };
    
    return errorInfo;
  }
  
  // Categorizar tipo de erro
  categorizeError(error) {
    if (error.code === 'ENOENT') return 'FILE_NOT_FOUND';
    if (error.code === 'ECONNREFUSED') return 'CONNECTION_REFUSED';
    if (error.code === 'ETIMEDOUT') return 'TIMEOUT';
    if (error.message.includes('database')) return 'DATABASE_ERROR';
    if (error.message.includes('validation')) return 'VALIDATION_ERROR';
    if (error.message.includes('authentication')) return 'AUTH_ERROR';
    if (error.message.includes('rate limit')) return 'RATE_LIMIT_ERROR';
    
    return 'UNKNOWN_ERROR';
  }
  
  // Determinar severidade do erro
  getSeverity(error) {
    if (this.isCritical(error)) return 'CRITICAL';
    if (error.code === 'ETIMEDOUT') return 'HIGH';
    if (error.message.includes('validation')) return 'LOW';
    
    return 'MEDIUM';
  }
  
  // Verificar se erro é crítico
  isCritical(error) {
    return this.criticalErrors.some(criticalError => 
      error.code === criticalError || 
      error.message.includes(criticalError)
    );
  }
  
  // Logar erro com contexto
  async logError(errorInfo) {
    const logLevel = errorInfo.severity === 'CRITICAL' ? 'error' : 
                     errorInfo.severity === 'HIGH' ? 'error' : 
                     errorInfo.severity === 'MEDIUM' ? 'warn' : 'info';
    
    logger[logLevel]('Erro capturado pelo ErrorHandler:', {
      message: errorInfo.message,
      type: errorInfo.type,
      severity: errorInfo.severity,
      code: errorInfo.code,
      context: errorInfo.context,
      stack: errorInfo.stack
    });
  }
  
  // Rastrear ocorrências de erro
  trackError(errorInfo) {
    const key = `${errorInfo.type}_${errorInfo.code}`;
    const count = this.errorCounts.get(key) || 0;
    this.errorCounts.set(key, count + 1);
  }
  
  // Verificar se deve notificar admins
  shouldNotifyAdmins(errorInfo) {
    if (!errorInfo.isCritical) return false;
    
    const key = `${errorInfo.type}_${errorInfo.code}`;
    const count = this.errorCounts.get(key) || 0;
    const lastNotified = this.lastNotification.get(key) || 0;
    const now = Date.now();
    
    // Notificar se:
    // 1. É o primeiro erro crítico, OU
    // 2. Atingiu o threshold de erros, OU
    // 3. Passou do cooldown desde a última notificação
    return count === 1 || 
           count >= this.notificationThreshold || 
           (now - lastNotified) > this.notificationCooldown;
  }
  
  // Notificar administradores
  async notifyAdmins(errorInfo) {
    try {
      const adminIds = getAdminIds();
      
      if (!adminIds || adminIds.length === 0) {
        logger.warn('Nenhum admin configurado para notificações de erro');
        return;
      }
      
      const message = this.formatErrorMessage(errorInfo);
      
      // Usar o cliente do WhatsApp se disponível
      if (global.whatsappClient) {
        for (const adminId of adminIds) {
          try {
            await global.whatsappClient.sendMessage(adminId, message);
          } catch (sendError) {
            logger.error(`Erro ao enviar notificação para admin ${adminId}:`, sendError);
          }
        }
      }
      
      // Marcar como notificado
      const key = `${errorInfo.type}_${errorInfo.code}`;
      this.lastNotification.set(key, Date.now());
      
    } catch (error) {
      logger.error('Erro ao notificar administradores:', error);
    }
  }
  
  // Formatar mensagem de erro para admins
  formatErrorMessage(errorInfo) {
    const emoji = errorInfo.severity === 'CRITICAL' ? '🚨' : '⚠️';
    
    return `${emoji} *ERRO DO BOT* ${emoji}
    
*Tipo:* ${errorInfo.type}
*Severidade:* ${errorInfo.severity}
*Mensagem:* ${errorInfo.message}
*Código:* ${errorInfo.code || 'N/A'}
*Contexto:* ${errorInfo.context.command || 'N/A'}
*Timestamp:* ${errorInfo.context.timestamp}

_Verifique os logs para mais detalhes._`;
  }
  
  // Gerar resposta apropriada para o usuário
  getErrorResponse(errorInfo) {
    switch (errorInfo.type) {
      case 'VALIDATION_ERROR':
        return {
          userMessage: errorInfo.message,
          shouldReply: true
        };
        
      case 'RATE_LIMIT_ERROR':
        return {
          userMessage: '⏰ Você está enviando comandos muito rapidamente. Aguarde um momento.',
          shouldReply: true
        };
        
      case 'DATABASE_ERROR':
        return {
          userMessage: '🛠️ Erro temporário no sistema. Tente novamente em alguns segundos.',
          shouldReply: true
        };
        
      case 'TIMEOUT':
        return {
          userMessage: '⏱️ Operação demorou muito para responder. Tente novamente.',
          shouldReply: true
        };
        
      case 'AUTH_ERROR':
        return {
          userMessage: '🔒 Você não tem permissão para executar este comando.',
          shouldReply: true
        };
        
      default:
        if (errorInfo.severity === 'CRITICAL') {
          return {
            userMessage: '🚨 Erro crítico detectado. Os administradores foram notificados.',
            shouldReply: true
          };
        }
        
        return {
          userMessage: '❌ Ocorreu um erro inesperado. Tente novamente.',
          shouldReply: true
        };
    }
  }
  
  // Obter estatísticas de erros
  getStats() {
    const stats = {
      totalErrors: 0,
      errorsByType: {},
      recentErrors: []
    };
    
    for (const [key, count] of this.errorCounts) {
      stats.totalErrors += count;
      stats.errorsByType[key] = count;
    }
    
    return stats;
  }
  
  // Limpar estatísticas antigas
  cleanup() {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 horas
    
    for (const [key, timestamp] of this.lastNotification) {
      if (now - timestamp > maxAge) {
        this.lastNotification.delete(key);
      }
    }
    
    logger.info('ErrorHandler cleanup executado');
  }
}

// Instância singleton
const errorHandler = new ErrorHandler();

// Configurar cleanup automático
setInterval(() => {
  errorHandler.cleanup();
}, 60 * 60 * 1000); // A cada hora

module.exports = errorHandler;
