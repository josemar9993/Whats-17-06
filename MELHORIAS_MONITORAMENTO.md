# 📊 MELHORIAS EM MONITORAMENTO

## 1. Métricas Detalhadas
```javascript
// src/metrics/collector.js
class MetricsCollector {
  constructor() {
    this.metrics = {
      commandsExecuted: new Map(),
      errors: new Map(),
      responseTime: [],
      activeUsers: new Set(),
      messagesProcessed: 0
    };
  }
  
  recordCommand(commandName, duration, success = true) {
    const key = `${commandName}_${success ? 'success' : 'error'}`;
    this.metrics.commandsExecuted.set(key, 
      (this.metrics.commandsExecuted.get(key) || 0) + 1
    );
    this.metrics.responseTime.push(duration);
  }
  
  getReport() {
    return {
      totalCommands: Array.from(this.metrics.commandsExecuted.values())
        .reduce((a, b) => a + b, 0),
      averageResponseTime: this.metrics.responseTime.reduce((a, b) => a + b, 0) 
        / this.metrics.responseTime.length,
      activeUsers: this.metrics.activeUsers.size,
      messagesProcessed: this.metrics.messagesProcessed
    };
  }
}
```

## 2. Health Check Avançado
```javascript
// src/health/checker.js
class HealthChecker {
  async checkDatabase() {
    try {
      await db.getAllMessages();
      return { status: 'healthy', latency: Date.now() - start };
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  }
  
  async checkWhatsApp() {
    try {
      const state = await client.getState();
      return { status: state === 'CONNECTED' ? 'healthy' : 'unhealthy', state };
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  }
  
  async getStatus() {
    const checks = await Promise.all([
      this.checkDatabase(),
      this.checkWhatsApp(),
      this.checkMemory(),
      this.checkDisk()
    ]);
    
    return {
      status: checks.every(c => c.status === 'healthy') ? 'healthy' : 'degraded',
      checks: {
        database: checks[0],
        whatsapp: checks[1],
        memory: checks[2],
        disk: checks[3]
      },
      timestamp: new Date().toISOString()
    };
  }
}
```

## 3. Alertas Automáticos
```javascript
// src/alerts/manager.js
class AlertManager {
  constructor() {
    this.thresholds = {
      errorRate: 0.05, // 5%
      responseTime: 5000, // 5s
      memoryUsage: 0.85 // 85%
    };
  }
  
  async checkThresholds(metrics) {
    const alerts = [];
    
    if (metrics.errorRate > this.thresholds.errorRate) {
      alerts.push({
        type: 'HIGH_ERROR_RATE',
        message: `Taxa de erro alta: ${(metrics.errorRate * 100).toFixed(2)}%`
      });
    }
    
    // Enviar alertas para admins
    if (alerts.length > 0) {
      await this.sendAlertsToAdmins(alerts);
    }
  }
}
```

## 4. Dashboard Web Simples
```javascript
// src/dashboard/server.js
const express = require('express');
const app = express();

app.get('/dashboard', (req, res) => {
  const metrics = metricsCollector.getReport();
  const health = await healthChecker.getStatus();
  
  res.json({
    uptime: Date.now() - startTime,
    metrics,
    health,
    lastUpdate: new Date().toISOString()
  });
});
```
