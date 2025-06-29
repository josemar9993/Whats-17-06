const logger = require('../logger');
const CONSTANTS = require('../constants');
const { isAdmin } = require('./admin');

class RateLimiter {
  constructor() {
    // Mapa para armazenar contadores por usuário
    this.userRequests = new Map();
    
    // Mapa para armazenar timestamps de bloqueios
    this.blockedUsers = new Map();
    
    // Configurações
    this.windowMs = CONSTANTS.RATE_LIMIT.WINDOW_MS;
    this.maxRequests = CONSTANTS.RATE_LIMIT.MAX_REQUESTS;
    this.adminMaxRequests = CONSTANTS.RATE_LIMIT.ADMIN_MAX_REQUESTS;
    
    // Limpar dados antigos periodicamente
    this.setupCleanup();
  }
  
  // Verificar se usuário pode fazer requisição
  checkLimit(userId, commandName = 'unknown') {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    // Verificar se usuário está temporariamente bloqueado
    if (this.isBlocked(userId, now)) {
      return {
        allowed: false,
        reason: 'Usuário temporariamente bloqueado por excesso de requisições',
        retryAfter: this.getRetryAfter(userId, now)
      };
    }
    
    // Obter ou criar entrada do usuário
    if (!this.userRequests.has(userId)) {
      this.userRequests.set(userId, []);
    }
    
    const userRequests = this.userRequests.get(userId);
    
    // Remover requisições antigas (fora da janela)
    const validRequests = userRequests.filter(timestamp => timestamp > windowStart);
    this.userRequests.set(userId, validRequests);
    
    // Determinar limite baseado se é admin
    const limit = isAdmin(userId) ? this.adminMaxRequests : this.maxRequests;
    
    // Verificar se excedeu o limite
    if (validRequests.length >= limit) {
      // Bloquear usuário temporariamente se exceder muito o limite
      if (validRequests.length > limit * 2) {
        this.blockUser(userId, now);
        logger.warn(`Usuário ${userId} bloqueado temporariamente por excesso de requisições`, {
          requests: validRequests.length,
          limit,
          command: commandName
        });
      }
      
      return {
        allowed: false,
        reason: `Limite de ${limit} comandos por minuto atingido`,
        current: validRequests.length,
        limit,
        retryAfter: Math.ceil((validRequests[0] + this.windowMs - now) / 1000)
      };
    }
    
    // Adicionar a requisição atual
    validRequests.push(now);
    this.userRequests.set(userId, validRequests);
    
    // Log para monitoramento
    if (validRequests.length > limit * 0.8) { // Avisar quando chegar a 80% do limite
      logger.warn(`Usuário ${userId} próximo do limite de rate`, {
        requests: validRequests.length,
        limit,
        command: commandName
      });
    }
    
    return {
      allowed: true,
      current: validRequests.length,
      limit,
      remaining: limit - validRequests.length
    };
  }
  
  // Verificar se usuário está bloqueado
  isBlocked(userId, now = Date.now()) {
    const blockUntil = this.blockedUsers.get(userId);
    return blockUntil && now < blockUntil;
  }
  
  // Bloquear usuário temporariamente
  blockUser(userId, now = Date.now()) {
    const blockDuration = 5 * 60 * 1000; // 5 minutos
    const blockUntil = now + blockDuration;
    
    this.blockedUsers.set(userId, blockUntil);
  }
  
  // Obter tempo até poder tentar novamente
  getRetryAfter(userId, now = Date.now()) {
    const blockUntil = this.blockedUsers.get(userId);
    if (!blockUntil) return 0;
    
    return Math.max(0, Math.ceil((blockUntil - now) / 1000));
  }
  
  // Desbloquear usuário manualmente (para admins)
  unblockUser(userId) {
    const wasBlocked = this.blockedUsers.has(userId);
    this.blockedUsers.delete(userId);
    
    if (wasBlocked) {
      logger.info(`Usuário ${userId} desbloqueado manualmente`);
    }
    
    return wasBlocked;
  }
  
  // Limpar dados de usuário específico
  clearUser(userId) {
    this.userRequests.delete(userId);
    this.blockedUsers.delete(userId);
    logger.info(`Dados de rate limit limpos para usuário ${userId}`);
  }
  
  // Configurar limpeza automática
  setupCleanup() {
    // Limpar dados antigos a cada 5 minutos
    setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }
  
  // Limpar dados antigos
  cleanup() {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    let cleanedUsers = 0;
    let cleanedBlocks = 0;
    
    // Limpar requisições antigas
    for (const [userId, requests] of this.userRequests) {
      const validRequests = requests.filter(timestamp => timestamp > windowStart);
      
      if (validRequests.length === 0) {
        this.userRequests.delete(userId);
        cleanedUsers++;
      } else {
        this.userRequests.set(userId, validRequests);
      }
    }
    
    // Limpar bloqueios expirados
    for (const [userId, blockUntil] of this.blockedUsers) {
      if (now >= blockUntil) {
        this.blockedUsers.delete(userId);
        cleanedBlocks++;
      }
    }
    
    if (cleanedUsers > 0 || cleanedBlocks > 0) {
      logger.debug(`Rate limiter cleanup: ${cleanedUsers} usuários, ${cleanedBlocks} bloqueios`);
    }
  }
  
  // Obter estatísticas
  getStats() {
    const now = Date.now();
    const stats = {
      totalUsers: this.userRequests.size,
      blockedUsers: Array.from(this.blockedUsers.entries())
        .filter(([_, blockUntil]) => now < blockUntil).length,
      activeUsers: 0,
      topUsers: [],
      configuration: {
        windowMs: this.windowMs,
        maxRequests: this.maxRequests,
        adminMaxRequests: this.adminMaxRequests
      }
    };
    
    // Calcular usuários ativos e top usuários
    const userActivity = [];
    const windowStart = now - this.windowMs;
    
    for (const [userId, requests] of this.userRequests) {
      const validRequests = requests.filter(timestamp => timestamp > windowStart);
      
      if (validRequests.length > 0) {
        stats.activeUsers++;
        userActivity.push({
          userId: userId.substring(0, 10) + '...', // Mascarar ID para privacidade
          requests: validRequests.length,
          isAdmin: isAdmin(userId),
          isBlocked: this.isBlocked(userId, now)
        });
      }
    }
    
    // Top 10 usuários mais ativos
    stats.topUsers = userActivity
      .sort((a, b) => b.requests - a.requests)
      .slice(0, 10);
    
    return stats;
  }
  
  // Middleware para integração com comandos
  createMiddleware() {
    return async (message, commandName, next) => {
      const userId = message.from;
      const result = this.checkLimit(userId, commandName);
      
      if (!result.allowed) {
        logger.warn(`Rate limit atingido para usuário ${userId}`, {
          command: commandName,
          reason: result.reason,
          current: result.current,
          limit: result.limit
        });
        
        // Enviar mensagem de erro ao usuário
        const errorMessage = `⏰ ${result.reason}. Tente novamente em ${result.retryAfter} segundos.`;
        await message.reply(errorMessage);
        
        return false; // Bloquear execução do comando
      }
      
      // Continuar execução
      if (next) {
        return await next();
      }
      
      return true;
    };
  }
  
  // Resetar todos os dados (para emergências)
  reset() {
    this.userRequests.clear();
    this.blockedUsers.clear();
    logger.warn('Rate limiter foi resetado - todos os dados foram limpos');
  }
}

// Instância singleton
const rateLimiter = new RateLimiter();

module.exports = rateLimiter;
