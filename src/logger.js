// Um logger simples para fins de exemplo e teste.
// Adapte conforme o seu sistema de logging real.
const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const fs = require('fs');
const path = require('path');

const logDir = path.resolve(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Define se está rodando via PM2 (para evitar timestamp duplicado)
const isRunningInPM2 =
  process.env.PM2_HOME ||
  process.env.PM2_USAGE ||
  process.env.NODE_APP_INSTANCE !== undefined;

// Define um formato personalizado para o console
const consoleFormat = winston.format.printf(
  ({ level, message, timestamp, stack, ...metadata }) => {
    // Se está rodando via PM2, não incluir timestamp próprio (PM2 já inclui)
    let log = isRunningInPM2
      ? `${level}: ${message}`
      : `${timestamp} ${level}: ${message}`;
    if (stack) {
      log = `${log}\n${stack}`;
    }
    // Adiciona metadados formatados se existirem
    const meta = Object.keys(metadata).length ? JSON.stringify(metadata) : '';
    return `${log} ${meta}`;
  }
);

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), consoleFormat)
    }),
    new DailyRotateFile({
      filename: path.join(logDir, 'bot-json-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d',
      zippedArchive: true,
      format: winston.format.json() // Log em formato JSON para arquivos
    })
  ]
});

module.exports = logger;
