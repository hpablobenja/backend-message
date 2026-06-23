# =========================================================================
# ETAPA 1: Dependencias de Desarrollo y Compilación (Builder)
# =========================================================================
FROM node:20-alpine AS builder

# SOLUCIÓN AL WARNING: Añadimos openssl y libc6-compat requeridos por el engine de Prisma
RUN apk add --no-cache libc6-compat python3 make g++ openssl openssl-dev

WORKDIR /app

COPY package*.json ./
COPY ./src/infrastructure/database/prisma ./src/infrastructure/database/prisma/

RUN npm ci

# Generar el cliente de Prisma explícitamente antes del build
RUN npx prisma generate --schema=./src/infrastructure/database/prisma/schema.prisma

COPY . .

# Ahora sí, correrá el build sin problemas de rutas
RUN npm run build

RUN npm prune --production

# =========================================================================
# ETAPA 2: Entorno de Ejecución Final (Production)
# =========================================================================
FROM node:20-alpine AS runner

# SOLUCIÓN PARA PRODUCCIÓN: El contenedor final también necesita leer OpenSSL para ejecutar queries
RUN apk add --no-cache openssl

ENV NODE_ENV=production
WORKDIR /app

# Clonar los usuarios seguros
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/infrastructure/database/prisma ./src/infrastructure/database/prisma

RUN chown -R nestjs:nodejs /app
USER nestjs

EXPOSE 3000

CMD ["node", "dist/main.js"]