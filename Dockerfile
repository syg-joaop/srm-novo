# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Build arguments - variáveis de ambiente necessárias no build time
ARG API_LOGIN
ARG API_URL
ARG API_URL_HOMOL
ARG API_SECRET
ARG NUXT_PUBLIC_API_SECRET
ARG NUXT_PUBLIC_APP_NAME
ARG NUXT_PUBLIC_APP_VERSION
ARG NUXT_PUBLIC_SUPPORT_CHAT_URL
ARG NUXT_PUBLIC_VRP_API_URL
ARG NUXT_PUBLIC_VRP_API_KEY

# Definir como variáveis de ambiente para o build
ENV API_LOGIN=$API_LOGIN
ENV API_URL=$API_URL
ENV API_URL_HOMOL=$API_URL_HOMOL
ENV API_SECRET=$API_SECRET
ENV NUXT_PUBLIC_API_SECRET=$NUXT_PUBLIC_API_SECRET
ENV NUXT_PUBLIC_APP_NAME=$NUXT_PUBLIC_APP_NAME
ENV NUXT_PUBLIC_APP_VERSION=$NUXT_PUBLIC_APP_VERSION
ENV NUXT_PUBLIC_SUPPORT_CHAT_URL=$NUXT_PUBLIC_SUPPORT_CHAT_URL
ENV NUXT_PUBLIC_VRP_API_URL=$NUXT_PUBLIC_VRP_API_URL
ENV NUXT_PUBLIC_VRP_API_KEY=$NUXT_PUBLIC_VRP_API_KEY

# Copiar arquivos de dependências
COPY package*.json ./
COPY nuxt.config.ts ./
COPY tsconfig.json ./

# Instalar dependências
RUN npm ci

# Copiar código fonte
COPY . .

# Build da aplicação (gera arquivos estáticos)
RUN npm run generate

# Stage 2: Production
FROM nginx:alpine

# Copiar arquivos estáticos gerados
COPY --from=builder /app/.output/public /usr/share/nginx/html

# Copiar configuração customizada do nginx para SPA
RUN echo 'server { \
    listen 80; \
    server_name _; \
    root /usr/share/nginx/html; \
    index index.html; \
    \
    # Gzip compression \
    gzip on; \
    gzip_vary on; \
    gzip_min_length 1024; \
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript; \
    \
    # Cache estático \
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ { \
        expires 1y; \
        add_header Cache-Control "public, immutable"; \
    } \
    \
    # SPA fallback - todas as rotas vão para index.html \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    \
    # Security headers \
    add_header X-Frame-Options "SAMEORIGIN" always; \
    add_header X-Content-Type-Options "nosniff" always; \
    add_header X-XSS-Protection "1; mode=block" always; \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
