# syntax=docker/dockerfile:1
# Etapa 1: compilar con Node LTS.
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .
# URL de la API inyectada en el build (por defecto, mismo origen detrás de Nginx).
ARG API_BASE_URL=/api/v1
ENV API_BASE_URL=${API_BASE_URL}
RUN npm run build:prod

# Etapa 2: servir los archivos estáticos con Nginx.
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/tutoria-frontend/browser /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1
