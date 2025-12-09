#!/bin/bash

# Script para crear un nuevo microservicio con estructura estandarizada
# Uso: ./create-service.sh nombre-del-servicio puerto descripcion

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para mostrar ayuda
show_help() {
    echo -e "${BLUE}=== Creador de Microservicios - Flores Victoria ===${NC}"
    echo ""
    echo "Uso: $0 <nombre-servicio> <puerto> [descripcion]"
    echo ""
    echo "Parámetros:"
    echo "  nombre-servicio    Nombre del servicio (ej: inventory-service)"
    echo "  puerto             Puerto único (ej: 3012)"
    echo "  descripcion        Descripción del servicio (opcional)"
    echo ""
    echo "Ejemplo:"
    echo "  $0 inventory-service 3012 'Servicio de gestión de inventario'"
    echo ""
    echo "Puertos disponibles: 3012-3100"
    echo "Puertos ocupados: 3001-3011, 8080"
}

# Validar argumentos
if [ $# -lt 2 ]; then
    show_help
    exit 1
fi

SERVICE_NAME=$1
PORT=$2
DESCRIPTION=${3:-"Microservicio de ${SERVICE_NAME}"}

# Validaciones
if [[ ! $SERVICE_NAME =~ ^[a-z][a-z0-9-]*-service$ ]]; then
    echo -e "${RED}Error: El nombre debe terminar en '-service' y usar kebab-case${NC}"
    echo "Ejemplo válido: inventory-service"
    exit 1
fi

if [[ ! $PORT =~ ^[0-9]+$ ]] || [ $PORT -lt 3000 ] || [ $PORT -gt 9999 ]; then
    echo -e "${RED}Error: Puerto inválido. Usa un número entre 3000-9999${NC}"
    exit 1
fi

# Verificar si el puerto ya está en uso
RESERVED_PORTS=(3001 3002 3003 3004 3005 3006 3007 3008 3009 3010 3011 8080)
if [[ " ${RESERVED_PORTS[@]} " =~ " ${PORT} " ]]; then
    echo -e "${RED}Error: Puerto $PORT ya está asignado a otro servicio${NC}"
    echo "Puertos disponibles: 3012+"
    exit 1
fi

# Directorio del servicio
SERVICE_DIR="./microservices/${SERVICE_NAME}"

# Verificar si el servicio ya existe
if [ -d "$SERVICE_DIR" ]; then
    echo -e "${RED}Error: El servicio $SERVICE_NAME ya existe en $SERVICE_DIR${NC}"
    exit 1
fi

echo -e "${GREEN}Creando servicio: $SERVICE_NAME${NC}"
echo -e "${BLUE}Puerto: $PORT${NC}"
echo -e "${BLUE}Descripción: $DESCRIPTION${NC}"
echo ""

# Convertir nombre a diferentes formatos
SERVICE_NAME_UPPER=$(echo "$SERVICE_NAME" | tr '[:lower:]' '[:upper:]' | tr '-' '_')
SERVICE_NAME_PASCAL=$(echo "$SERVICE_NAME" | sed 's/-\([a-z]\)/\U\1/g' | sed 's/^\([a-z]\)/\U\1/')
SERVICE_NAME_LOWER=$(echo "$SERVICE_NAME" | tr '-' '_')

# Crear estructura de directorios
echo -e "${YELLOW}[1/7] Creando estructura de directorios...${NC}"
mkdir -p "$SERVICE_DIR"/{src/{config,routes,controllers,models,middleware,validators,__tests__},logs}

# 1. Crear nixpacks.toml
echo -e "${YELLOW}[2/7] Generando nixpacks.toml...${NC}"
cat > "$SERVICE_DIR/nixpacks.toml" << EOF
# Nixpacks configuration for ${SERVICE_NAME}
[phases.setup]
nixPkgs = ['nodejs']

[phases.install]
cmds = [
  'cd /app/microservices/shared && npm install --production',
  'cd /app/microservices/${SERVICE_NAME} && npm ci',
  'cd /app/microservices/${SERVICE_NAME} && mkdir -p node_modules/@flores-victoria',
  'cd /app/microservices/${SERVICE_NAME} && cp -r ../shared node_modules/@flores-victoria/'
]

[start]
cmd = 'cd /app/microservices/${SERVICE_NAME} && node src/server.js'
EOF

# 2. Crear railway.toml
echo -e "${YELLOW}[3/7] Generando railway.toml...${NC}"
cat > "$SERVICE_DIR/railway.toml" << EOF
[deploy]
numReplicas = 1
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10
healthcheckPath = "/health"
healthcheckTimeout = 100
startCommand = "cd microservices/${SERVICE_NAME} && node src/server.js"
EOF

# 3. Crear railway.json
echo -e "${YELLOW}[4/7] Generando railway.json...${NC}"
cat > "$SERVICE_DIR/railway.json" << EOF
{
  "\$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "nixpacksConfigPath": "microservices/${SERVICE_NAME}/nixpacks.toml"
  },
  "deploy": {
    "numReplicas": 1,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
EOF

# 4. Crear package.json
echo -e "${YELLOW}[5/7] Generando package.json...${NC}"
cat > "$SERVICE_DIR/package.json" << EOF
{
  "name": "@flores-victoria/${SERVICE_NAME}",
  "version": "1.0.0",
  "description": "${DESCRIPTION}",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "test": "jest --coverage",
    "test:watch": "jest --watch"
  },
  "dependencies": {
    "express": "^4.18.2",
    "dotenv": "^16.3.1",
    "cors": "^2.8.5",
    "@flores-victoria/shared": "file:../shared"
  },
  "devDependencies": {
    "nodemon": "^3.0.1",
    "jest": "^29.7.0",
    "supertest": "^6.3.3"
  },
  "jest": {
    "testEnvironment": "node",
    "coverageDirectory": "coverage",
    "collectCoverageFrom": [
      "src/**/*.js",
      "!src/__tests__/**"
    ]
  }
}
EOF

# 5. Crear config/index.js
echo -e "${YELLOW}[6/7] Generando src/config/index.js...${NC}"
cat > "$SERVICE_DIR/src/config/index.js" << 'EOF'
/**
 * Configuración del servicio ${SERVICE_NAME}
 */
require('dotenv').config();

module.exports = {
  // CRITICAL: PORT debe ser primera prioridad para Railway
  port: process.env.PORT || process.env.${SERVICE_NAME_UPPER}_PORT || ${PORT},
  
  nodeEnv: process.env.NODE_ENV || 'development',
  serviceName: '${SERVICE_NAME}',
  
  // Database configuration
  database: {
    // PostgreSQL
    postgresUrl: process.env.DATABASE_URL,
    
    // MongoDB
    mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/${SERVICE_NAME_LOWER}_db',
    
    // Redis
    redisUrl: process.env.REDIS_URL || 'redis://localhost:6379'
  },
  
  // Service URLs
  services: {
    authService: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
    userService: process.env.USER_SERVICE_URL || 'http://localhost:3002',
    productService: process.env.PRODUCT_SERVICE_URL || 'http://localhost:3009'
  },
  
  // Security
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
  
  // Logging
  logLevel: process.env.LOG_LEVEL || 'info'
};
EOF

# Reemplazar variables en config
sed -i "s/\${SERVICE_NAME}/$SERVICE_NAME/g" "$SERVICE_DIR/src/config/index.js"
sed -i "s/\${SERVICE_NAME_UPPER}/$SERVICE_NAME_UPPER/g" "$SERVICE_DIR/src/config/index.js"
sed -i "s/\${SERVICE_NAME_LOWER}/$SERVICE_NAME_LOWER/g" "$SERVICE_DIR/src/config/index.js"
sed -i "s/\${PORT}/$PORT/g" "$SERVICE_DIR/src/config/index.js"

# 6. Crear server.js
echo -e "${YELLOW}[7/7] Generando src/server.js...${NC}"
cat > "$SERVICE_DIR/src/server.js" << EOF
/**
 * Servidor principal del ${SERVICE_NAME}
 */
const express = require('express');
const cors = require('cors');
const config = require('./config');
const logger = require('@flores-victoria/shared/utils/logger');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  logger.info(\`\${req.method} \${req.path}\`, {
    service: config.serviceName,
    ip: req.ip
  });
  next();
});

// Health check endpoint (REQUERIDO para Railway)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: '${SERVICE_NAME}',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.nodeEnv
  });
});

// API Routes
app.get('/api/${SERVICE_NAME_LOWER}', (req, res) => {
  res.json({
    message: 'Bienvenido al ${SERVICE_NAME}',
    version: '1.0.0',
    endpoints: [
      'GET /health - Health check',
      'GET /api/${SERVICE_NAME_LOWER} - Información del servicio'
    ]
  });
});

// TODO: Agregar rutas específicas del servicio
// app.use('/api/${SERVICE_NAME_LOWER}', require('./routes/${SERVICE_NAME_LOWER}Routes'));

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    error: true,
    message: 'Ruta no encontrada'
  });
});

// Error Handler
app.use((err, req, res, next) => {
  logger.error('Error no manejado', {
    error: err.message,
    stack: err.stack,
    service: config.serviceName
  });
  
  res.status(err.status || 500).json({
    error: true,
    message: config.nodeEnv === 'production' 
      ? 'Error interno del servidor'
      : err.message
  });
});

// Iniciar servidor
const PORT = config.port;
app.listen(PORT, '0.0.0.0', () => {
  logger.info(\`Servicio de ${SERVICE_NAME} ejecutándose en el puerto \${PORT}\`, {
    environment: config.nodeEnv,
    port: PORT,
    service: config.serviceName
  });
});

// Manejo de errores no capturados
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', { reason, promise });
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
  process.exit(1);
});

module.exports = app;
EOF

# 7. Crear .env.example
cat > "$SERVICE_DIR/.env.example" << EOF
# ${SERVICE_NAME} Environment Variables

# Server
PORT=${PORT}
NODE_ENV=development

# Database (seleccionar según necesidad)
# DATABASE_URL=postgresql://user:password@localhost:5432/${SERVICE_NAME_LOWER}_db
# MONGODB_URI=mongodb://localhost:27017/${SERVICE_NAME_LOWER}_db
# REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-secret-key

# Service URLs
AUTH_SERVICE_URL=http://localhost:3001
USER_SERVICE_URL=http://localhost:3002
PRODUCT_SERVICE_URL=http://localhost:3009

# Logging
LOG_LEVEL=info
EOF

# 8. Crear README del servicio
cat > "$SERVICE_DIR/README.md" << EOF
# ${SERVICE_NAME}

${DESCRIPTION}

## 🚀 Inicio Rápido

### Desarrollo Local

\`\`\`bash
cd microservices/${SERVICE_NAME}
npm install
npm run dev
\`\`\`

El servicio estará disponible en: \`http://localhost:${PORT}\`

### Producción

\`\`\`bash
npm start
\`\`\`

## 📋 Variables de Entorno

Ver \`.env.example\` para la lista completa de variables requeridas.

## 🔌 Endpoints

- \`GET /health\` - Health check
- \`GET /api/${SERVICE_NAME_LOWER}\` - Información del servicio

## 🧪 Testing

\`\`\`bash
npm test
npm run test:watch
\`\`\`

## 📦 Deployment en Railway

Este servicio está configurado para deployment automático en Railway.

**Variables de entorno requeridas:**
- \`PORT\` (asignado automáticamente por Railway)
- \`DATABASE_URL\` / \`MONGODB_URI\` / \`REDIS_URL\` (según tipo de DB)
- \`JWT_SECRET\`
- URLs de servicios dependientes

Ver [SERVICE_TEMPLATE.md](../SERVICE_TEMPLATE.md) para detalles completos.

## 📚 Documentación

- [Plantilla de Servicio](../SERVICE_TEMPLATE.md)
- [Documentación del Proyecto](../../README.md)
EOF

# Crear test básico
mkdir -p "$SERVICE_DIR/src/__tests__"
cat > "$SERVICE_DIR/src/__tests__/server.test.js" << EOF
const request = require('supertest');
const app = require('../server');

describe('${SERVICE_NAME} - Health Check', () => {
  it('GET /health - should return healthy status', async () => {
    const response = await request(app).get('/health');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'healthy');
    expect(response.body).toHaveProperty('service', '${SERVICE_NAME}');
    expect(response.body).toHaveProperty('uptime');
  });
});

describe('${SERVICE_NAME} - API Info', () => {
  it('GET /api/${SERVICE_NAME_LOWER} - should return service info', async () => {
    const response = await request(app).get('/api/${SERVICE_NAME_LOWER}');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('version');
  });
});

describe('${SERVICE_NAME} - 404 Handler', () => {
  it('should return 404 for unknown routes', async () => {
    const response = await request(app).get('/ruta-inexistente');
    
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error', true);
  });
});
EOF

echo ""
echo -e "${GREEN}✅ Servicio $SERVICE_NAME creado exitosamente!${NC}"
echo ""
echo -e "${BLUE}📁 Ubicación:${NC} $SERVICE_DIR"
echo ""
echo -e "${YELLOW}Próximos pasos:${NC}"
echo "1. cd $SERVICE_DIR"
echo "2. npm install"
echo "3. Configurar variables de entorno (.env)"
echo "4. Implementar lógica de negocio en src/"
echo "5. npm run dev (para desarrollo local)"
echo ""
echo -e "${BLUE}Para deployment en Railway:${NC}"
echo "1. Crear nuevo servicio en Railway Dashboard"
echo "2. Conectar repositorio GitHub"
echo "3. NO configurar Root Directory (dejar vacío)"
echo "4. Configurar variables de entorno (ver .env.example)"
echo "5. Railway desplegará automáticamente"
echo ""
echo -e "${GREEN}📚 Documentación completa:${NC} microservices/SERVICE_TEMPLATE.md"
