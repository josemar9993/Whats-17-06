module.exports = {
  apps: [{
    name: 'meu-bot-whatsapp',
    script: './src/index.js', // Caminho para o script principal
    watch: false,
    max_memory_restart: '500M'
  }]
};
