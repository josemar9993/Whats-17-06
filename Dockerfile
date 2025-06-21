# =================================
#  Estágio 1: Builder
# =================================
FROM node:18-bookworm-slim AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# =================================
#  Estágio 2: Production
# =================================
FROM node:18-bookworm-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    --no-install-recommends \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /usr/share/keyrings/google-chrome-keyring.gpg \
    && echo "deb [arch=amd64 signed-by=/usr/share/keyrings/google-chrome-keyring.gpg] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list \
    && apt-get update \
    && apt-get install -y google-chrome-stable --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

RUN groupadd -r pptruser && useradd -r -g pptruser -G audio,video pptruser \
    && mkdir -p /home/pptruser/Downloads \
    && chown -R pptruser:pptruser /home/pptruser

COPY --from=builder --chown=pptruser:pptruser /app/node_modules ./node_modules
COPY --from=builder --chown=pptruser:pptruser /app/package.json ./
COPY --from=builder --chown=pptruser:pptruser /app/src ./src

RUN chown -R pptruser:pptruser /app

USER pptruser

CMD ["node", "src/index.js"]
