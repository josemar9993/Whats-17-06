FROM node:18-alpine

# Diretório de trabalho da aplicação
WORKDIR /app

# Instala o Chromium e dependências básicas
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ttf-freefont

# Copia apenas arquivos de dependência para instalar módulos
COPY package.json package-lock.json* ecosystem.config.js* ./

# Define variáveis antes da instalação de dependências para evitar
# download automático do Chromium pelo Puppeteer.
ENV CHROMIUM_PATH=/usr/bin/chromium-browser \
    PUPPETEER_SKIP_DOWNLOAD=true

RUN npm ci --omit=dev

# Copia o restante do código para o contêiner
COPY . .

# Prepara diretórios utilizados pela aplicação
RUN mkdir -p /app/auth_data /app/logs && chown -R node:node /app

USER node

# Comando de inicialização
CMD ["node", "src/index.js"]
