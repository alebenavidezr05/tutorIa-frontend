# syntax=docker/dockerfile:1
# Imagen del frontend de TutorIA: compila Angular y lo sirve con Caddy (SPA + proxy /api + HTTPS).

# Etapa 1: compilar con Node LTS (Angular 22 exige Node ^22.22.3 o ^24.15.0).
FROM node:24-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .
# Mismo origen detrás de Caddy: la API vive en /api/v1.
ARG API_BASE_URL=/api/v1
ENV API_BASE_URL=${API_BASE_URL}
RUN npm run build:prod

# Etapa 2: servir con Caddy (versión menor fijada; verifica la vigente en Docker Hub).
FROM caddy:2.11-alpine
COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/dist/tutoria-frontend/browser /srv
EXPOSE 80 443
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD wget -q -O /dev/null http://127.0.0.1:8081/salud || exit 1
