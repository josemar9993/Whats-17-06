const NodeCache = require('node-cache');
const logger = require('../logger');
const CONSTANTS = require('../constants');

class CacheManager {
  constructor() {
    // Cache principal com TTL padrão de 5 minutos
    this.cache = new NodeCache({
      stdTTL: CONSTANTS.CACHE_TTL.STATS / 1000,
      checkperiod: 60, // Verificar itens expirados a cada 60s
      useClones: false // Performance otimizada
    });

    // Cache para dados de usuários
    this.userCache = new NodeCache({
      stdTTL: CONSTANTS.CACHE_TTL.USER_DATA / 1000,
      maxKeys: 1000 // Máximo de 1000 usuários em cache
    });

    // Cache para health checks
    this.healthCache = new NodeCache({
      stdTTL: CONSTANTS.CACHE_TTL.HEALTH / 1000
    });

    this.setupEventListeners();
  }

  setupEventListeners() {
    this.cache.on('set', (key) => {
      logger.debug(`Cache SET: ${key}`);
    });

    this.cache.on('expired', (key) => {
      logger.debug(`Cache EXPIRED: ${key}`);
    });

    this.cache.on('flush', () => {
      logger.info('Cache FLUSH executado');
    });
  }

  // Métodos para cache geral
  set(key, value, ttl = null) {
    try {
      if (ttl) {
        return this.cache.set(key, value, ttl);
      }
      return this.cache.set(key, value);
    } catch (error) {
      logger.error('Erro ao definir cache:', error);
      return false;
    }
  }

  get(key) {
    try {
      return this.cache.get(key);
    } catch (error) {
      logger.error('Erro ao buscar cache:', error);
      return undefined;
    }
  }

  del(key) {
    try {
      return this.cache.del(key);
    } catch (error) {
      logger.error('Erro ao deletar cache:', error);
      return false;
    }
  }

  // Métodos para cache de usuários
  setUserData(userId, data, ttl = null) {
    const key = `user_${userId}`;
    if (ttl) {
      return this.userCache.set(key, data, ttl);
    }
    return this.userCache.set(key, data);
  }

  getUserData(userId) {
    const key = `user_${userId}`;
    return this.userCache.get(key);
  }

  // Métodos para cache de health
  setHealthData(key, data) {
    return this.healthCache.set(key, data);
  }

  getHealthData(key) {
    return this.healthCache.get(key);
  }

  // Método helper para cache com callback
  async getOrSet(key, callback, ttl = null) {
    try {
      let data = this.get(key);

      if (data === undefined) {
        logger.debug(`Cache MISS: ${key}, executando callback`);
        data = await callback();
        this.set(key, data, ttl);
      } else {
        logger.debug(`Cache HIT: ${key}`);
      }

      return data;
    } catch (error) {
      logger.error('Erro em getOrSet:', error);
      // Em caso de erro, executa o callback sem cache
      return await callback();
    }
  }

  // Estatísticas do cache
  getStats() {
    return {
      main: this.cache.getStats(),
      user: this.userCache.getStats(),
      health: this.healthCache.getStats()
    };
  }

  // Limpar todos os caches
  flushAll() {
    this.cache.flushAll();
    this.userCache.flushAll();
    this.healthCache.flushAll();
    logger.info('Todos os caches foram limpos');
  }

  // Limpar cache específico
  flushPattern(pattern) {
    const keys = this.cache.keys();
    const matchingKeys = keys.filter((key) => key.includes(pattern));

    matchingKeys.forEach((key) => this.cache.del(key));
    logger.info(
      `Cache limpo para pattern: ${pattern}, ${matchingKeys.length} chaves removidas`
    );
  }
}

// Instância singleton
const cacheManager = new CacheManager();

module.exports = cacheManager;
