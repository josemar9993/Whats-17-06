// Constantes centralizadas do sistema
const CONSTANTS = {
  // Limites de mensagens
  MAX_MESSAGE_LENGTH: 4096,
  MAX_COMMAND_ARGS: 20,
  MAX_SEARCH_RESULTS: 50,

  // Timeouts
  COMMAND_TIMEOUT: 30000, // 30 segundos
  DATABASE_TIMEOUT: 10000, // 10 segundos
  HEALTH_CHECK_TIMEOUT: 5000, // 5 segundos

  // Cache
  CACHE_TTL: {
    STATS: 300000, // 5 minutos
    HEALTH: 30000, // 30 segundos
    USER_DATA: 600000 // 10 minutos
  },

  // Rate Limiting
  RATE_LIMIT: {
    WINDOW_MS: 60000, // 1 minuto
    MAX_REQUESTS: 30, // 30 comandos por minuto por usuário
    ADMIN_MAX_REQUESTS: 100 // Admins têm limite maior
  },

  // Retry
  RETRY: {
    MAX_ATTEMPTS: 3,
    INITIAL_DELAY: 1000, // 1 segundo
    MAX_DELAY: 5000, // 5 segundos
    BACKOFF_FACTOR: 2
  },

  // Logs
  LOG_LEVELS: {
    ERROR: 'error',
    WARN: 'warn',
    INFO: 'info',
    DEBUG: 'debug'
  },

  // Estados do bot
  BOT_STATES: {
    STARTING: 'starting',
    READY: 'ready',
    DISCONNECTED: 'disconnected',
    ERROR: 'error'
  },

  // Tipos de comando
  COMMAND_TYPES: {
    PUBLIC: 'public',
    ADMIN_ONLY: 'admin_only',
    GROUP_ONLY: 'group_only'
  }
};

module.exports = CONSTANTS;
