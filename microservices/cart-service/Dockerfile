# Build stage
FROM node:22-alpine AS builder




















































































environments/Dockerfile.devdocker-compose.dev*.yml.dockerignore# Docker**/*.spec.js**/*.test.js**/__tests__/# Test filesdevelopment/# Development environmentbackend/# Backend legacy.nyc_output/coverage/# Coverage*.loglogs/# Logs*.tmptemp/tmp/# Archivos temporales.gitignore.git/# Gityarn-error.lognpm-debug.lognode_modules/# Node*~*.swo*.swp.idea/.vscode/# Archivos de desarrollo*.key*.pemprivada.pem.env.development.env.local# Configuración localscripts/*.sh# Scripts de automatización!frontend/**/*.html*.html# Archivos HTML de pruebaDASHBOARD_*.mdCSS_*.mdCONTRIBUTING.mdCONTACT_PAGE_*.mdCONNECTIVITY_GUIDE.mdCOMPONENTS_*.mdCOMPONENTES_*.mdCOLOR_PALETTE_*.mdCODECOV_*.mdCODE_OF_CONDUCT.mdCI_CD_*.mdCHECKLIST_*.mdCHANGELOG*.mdAUTOMATIZACION_*.mdAUDITORIA_*.mdARQUITECTURA*.mdARCHITECTURE*.mdAPI_*.mdANALISIS_*.mdAI_*.mdADMIN_*.mdWORKDIR /app

# Copiar archivos de configuración
COPY microservices/cart-service/package*.json ./

# Instalar dependencias de producción
RUN npm ci --omit=dev && \
    npm cache clean --force

# Production stage
FROM node:22-alpine

# Instalar curl y dumb-init
RUN apk add --no-cache curl dumb-init

# Crear usuario no-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copiar node_modules desde builder
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules

# Copiar package.json
COPY --chown=nodejs:nodejs microservices/cart-service/package*.json ./

# Copiar el código fuente (desde el contexto raíz)
COPY --chown=nodejs:nodejs microservices/cart-service/. ./
    
# Copiar shared desde el root (reemplaza symlink con directorio real)
COPY --chown=nodejs:nodejs shared /shared
COPY --chown=nodejs:nodejs shared ./shared

# CRITICAL: Copy shared to node_modules and install dependencies
RUN mkdir -p node_modules/@flores-victoria
COPY --chown=nodejs:nodejs shared node_modules/@flores-victoria/shared
RUN cd node_modules/@flores-victoria/shared && npm install --production

# Cambiar a usuario no-root
USER nodejs

EXPOSE 3005

# Usar dumb-init para manejar señales correctamente
ENTRYPOINT ["dumb-init", "--"]

CMD ["node", "src/server.js"]