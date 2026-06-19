# Stage 1: Build backend
FROM node:18-alpine AS backend-builder

WORKDIR /app/backend

# Copiar package files del backend
COPY backend/package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente del backend
COPY backend/src ./src
COPY backend/tsconfig*.json ./
COPY backend/nest-cli.json ./

# Compilar backend
RUN npm run build

# Stage 3: Runtime
FROM node:18-alpine

WORKDIR /app

# Instalar dumb-init para manejo correcto de señales
RUN apk add --no-cache dumb-init

# Copiar package files del backend (para dependencias de runtime)
COPY backend/package*.json ./backend/

WORKDIR /app/backend

# Instalar solo dependencias de producción
RUN npm ci --only=production

# Copiar el código compilado del backend desde el builder
COPY --from=backend-builder /app/backend/dist ./dist

# Variables de entorno
ENV NODE_ENV=production
ENV PORT=8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/api/auth/me || exit 1

# Usar dumb-init como entrypoint
ENTRYPOINT ["dumb-init", "--"]

# Comando de inicio
CMD ["node", "dist/main.js"]

