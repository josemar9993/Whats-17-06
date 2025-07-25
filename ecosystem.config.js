module.exports = {
  apps: [{
    name: 'whatsapp-bot',
    script: 'src/index.js',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 8080
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 8080
    },
    // Configuração de logs - eliminar timestamp do PM2 completamente
    time: false,
    log_date_format: '',
    merge_logs: true,
    combine_logs: true,
    timestamp: false,
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_file: './logs/pm2-combined.log',
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024',
    restart_delay: 1000,
    max_restarts: 10,
    min_uptime: '10s',
    kill_timeout: 3000 // Adicionado para forçar o encerramento
  }]
};
