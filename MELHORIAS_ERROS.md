# 🛠️ MELHORIAS EM TRATAMENTO DE ERROS

## 1. Error Handler Centralizado
```javascript
// src/utils/errorHandler.js
class ErrorHandler {
  static async handle(error, context = {}) {
    logger.error('Erro capturado:', {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString()
    });
    
    // Notificar admins para erros críticos
    if (this.isCritical(error)) {
      await this.notifyAdmins(error, context);
    }
  }
  
  static isCritical(error) {
    const criticalErrors = ['ENOENT', 'ECONNREFUSED', 'DATABASE_ERROR'];
    return criticalErrors.some(type => error.message.includes(type));
  }
}
```

## 2. Retry Mechanism
```javascript
// src/utils/retry.js
async function withRetry(fn, maxRetries = 3, delay = 1000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries) throw error;
      
      logger.warn(`Tentativa ${attempt} falhou, tentando novamente em ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2; // Backoff exponencial
    }
  }
}
```

## 3. Circuit Breaker
```javascript
// src/utils/circuitBreaker.js
class CircuitBreaker {
  constructor(fn, threshold = 5, timeout = 60000) {
    this.fn = fn;
    this.threshold = threshold;
    this.timeout = timeout;
    this.failureCount = 0;
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
  }
  
  async execute(...args) {
    if (this.state === 'OPEN') {
      throw new Error('Circuit breaker is OPEN');
    }
    
    try {
      const result = await this.fn(...args);
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
}
```

## 4. Validação de Entrada
```javascript
// src/validators/commandValidator.js
const Joi = require('joi');

const commandSchemas = {
  buscar: Joi.object({
    term: Joi.string().min(2).max(100).required()
  }),
  
  pendencias: Joi.object({
    date: Joi.date().optional()
  })
};

function validateCommand(commandName, data) {
  const schema = commandSchemas[commandName];
  if (!schema) return { error: null, value: data };
  
  return schema.validate(data);
}
```
