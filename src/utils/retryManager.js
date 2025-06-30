const logger = require('../logger');
const CONSTANTS = require('../constants');

class RetryManager {
  constructor() {
    this.retryStats = new Map();
  }
  
  // Executar função com retry e backoff exponencial
  async withRetry(fn, options = {}) {
    const config = {
      maxAttempts: options.maxAttempts || CONSTANTS.RETRY.MAX_ATTEMPTS,
      initialDelay: options.initialDelay || CONSTANTS.RETRY.INITIAL_DELAY,
      maxDelay: options.maxDelay || CONSTANTS.RETRY.MAX_DELAY,
      backoffFactor: options.backoffFactor || CONSTANTS.RETRY.BACKOFF_FACTOR,
      retryOn: options.retryOn || this.defaultRetryCondition,
      onRetry: options.onRetry || this.defaultOnRetry,
      context: options.context || 'unknown'
    };
    
    let delay = config.initialDelay;
    
    for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
      try {
        // Executar a função
        const result = await this.executeWithTimeout(fn, config.timeout);
        
        // Sucesso - logar se não foi na primeira tentativa
        if (attempt > 1) {
          logger.info(`Operação bem-sucedida após ${attempt} tentativas`, {
            context: config.context,
            attempts: attempt
          });
        }
        
        // Atualizar estatísticas
        this.updateStats(config.context, attempt, true);
        
        return result;
        } catch (error) {
          // Verificar se deve tentar novamente
          if (attempt === config.maxAttempts || !config.retryOn(error, attempt)) {
            logger.error(`Operação falhou após ${attempt} tentativas`, {
              context: config.context,
              error: error.message,
              attempts: attempt
            });
            
            // Atualizar estatísticas
            this.updateStats(config.context, attempt, false);
            
            throw error;
          }
          
          // Executar callback de retry
          await config.onRetry(error, attempt, delay);
          
          // Aguardar antes da próxima tentativa
          await this.sleep(delay);
          
          // Calcular próximo delay com backoff exponencial
          delay = Math.min(delay * config.backoffFactor, config.maxDelay);
        }
    }
  }
  
  // Executar função com timeout
  async executeWithTimeout(fn, timeout = CONSTANTS.COMMAND_TIMEOUT) {
    if (!timeout) {
      return await fn();
    }
    
    return Promise.race([
      fn(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Operation timeout')), timeout)
      )
    ]);
  }
  
  // Condição padrão para retry
  defaultRetryCondition(error) {
    // Não tentar novamente para erros de validação
    if (error.message.includes('validation')) {
      return false;
    }
    
    // Não tentar novamente para erros de autenticação
    if (error.message.includes('authentication') || error.message.includes('permission')) {
      return false;
    }
    
    // Tentar novamente para erros temporários
    const retryableErrors = [
      'ETIMEDOUT',
      'ECONNRESET', 
      'ECONNREFUSED',
      'ENOTFOUND',
      'EAI_AGAIN',
      'SQLITE_BUSY',
      'SQLITE_LOCKED'
    ];
    
    return retryableErrors.some(code => 
      error.code === code || error.message.includes(code)
    );
  }
  
  // Callback padrão executado antes de cada retry
  async defaultOnRetry(error, attempt, delay) {
    logger.warn(`Tentativa ${attempt} falhou, tentando novamente em ${delay}ms`, {
      error: error.message,
      code: error.code
    });
  }
  
  // Helper para sleep
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  // Atualizar estatísticas de retry
  updateStats(context, attempts, success) {
    if (!this.retryStats.has(context)) {
      this.retryStats.set(context, {
        totalOperations: 0,
        successfulOperations: 0,
        failedOperations: 0,
        totalAttempts: 0,
        maxAttempts: 0
      });
    }
    
    const stats = this.retryStats.get(context);
    stats.totalOperations++;
    stats.totalAttempts += attempts;
    stats.maxAttempts = Math.max(stats.maxAttempts, attempts);
    
    if (success) {
      stats.successfulOperations++;
    } else {
      stats.failedOperations++;
    }
    
    this.retryStats.set(context, stats);
  }
  
  // Wrapper para operações de banco de dados
  async withDatabaseRetry(fn, context = 'database') {
    return this.withRetry(fn, {
      context,
      timeout: CONSTANTS.DATABASE_TIMEOUT,
      retryOn: (error) => {
        // Retry específico para banco
        return error.code === 'SQLITE_BUSY' || 
               error.code === 'SQLITE_LOCKED' ||
               error.message.includes('database is locked');
      }
    });
  }
  
  // Wrapper para comandos WhatsApp
  async withWhatsAppRetry(fn, context = 'whatsapp') {
    return this.withRetry(fn, {
      context,
      maxAttempts: 2, // Menos tentativas para WhatsApp
      initialDelay: 2000, // Delay maior
      retryOn: (error) => {
        // Retry específico para WhatsApp
        return error.message.includes('Rate limit') ||
               error.message.includes('Connection lost') ||
               error.message.includes('Session closed');
      }
    });
  }
  
  // Wrapper para operações de rede
  async withNetworkRetry(fn, context = 'network') {
    return this.withRetry(fn, {
      context,
      retryOn: (error) => {
        // Retry específico para rede
        const networkErrors = [
          'ETIMEDOUT', 'ECONNRESET', 'ECONNREFUSED',
          'ENOTFOUND', 'EAI_AGAIN', 'ENETUNREACH'
        ];
        
        return networkErrors.includes(error.code);
      }
    });
  }
  
  // Obter estatísticas de retry
  getStats() {
    const summary = {
      contexts: {},
      overall: {
        totalOperations: 0,
        totalAttempts: 0,
        successRate: 0,
        avgAttemptsPerOperation: 0
      }
    };
    
    for (const [context, stats] of this.retryStats) {
      summary.contexts[context] = {
        ...stats,
        successRate: stats.totalOperations > 0 ? 
          (stats.successfulOperations / stats.totalOperations * 100).toFixed(2) : 0,
        avgAttempts: stats.totalOperations > 0 ?
          (stats.totalAttempts / stats.totalOperations).toFixed(2) : 0
      };
      
      summary.overall.totalOperations += stats.totalOperations;
      summary.overall.totalAttempts += stats.totalAttempts;
    }
    
    if (summary.overall.totalOperations > 0) {
      const successfulOps = Array.from(this.retryStats.values())
        .reduce((sum, stats) => sum + stats.successfulOperations, 0);
      
      summary.overall.successRate = (successfulOps / summary.overall.totalOperations * 100).toFixed(2);
      summary.overall.avgAttemptsPerOperation = (summary.overall.totalAttempts / summary.overall.totalOperations).toFixed(2);
    }
    
    return summary;
  }
  
  // Limpar estatísticas antigas
  clearStats() {
    this.retryStats.clear();
    logger.info('Estatísticas de retry limpas');
  }
}

// Instância singleton
const retryManager = new RetryManager();

module.exports = retryManager;
