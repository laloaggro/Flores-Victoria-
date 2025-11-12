# ⚡ CHEATSHEET MAESTRO - FLORES VICTORIA v3.0

## 🚀 **COMANDOS ESENCIALES**

### 🔧 **Setup y Desarrollo**

```bash
# Iniciar todo el sistema
./start-all.sh

# Solo frontend
npm run dev                    # Puerto 8080
npm run build                  # Build de producción

# Solo backend
cd backend && npm start        # Puerto 3001

# Solo admin panel
cd admin-panel && npm start    # Puerto 3021 (ACTUALIZADO)

# WebAssembly processor
cd backend/wasm && npm start   # Puerto 3003

# Ejecutar tests
npm test                       # Tests unitarios
npm run test:e2e              # Tests end-to-end
./test-sistema.sh             # Test completo del sistema
```

### 🐳 **Docker Commands**

```bash
# Construir todo
docker-compose build

# Iniciar servicios
docker-compose up -d           # Modo daemon
docker-compose up frontend     # Solo frontend
docker-compose up backend      # Solo backend

# Ver logs
docker-compose logs -f         # Todos los logs
docker-compose logs frontend   # Solo frontend

# Status
docker-compose ps              # Estado de contenedores
docker-compose top             # Procesos activos

# Cleanup
docker-compose down            # Parar servicios
docker-compose down -v         # Parar + eliminar volúmenes
docker system prune -a         # Limpiar Docker completo
```

### 🗄️ **Base de Datos**

```bash
# MongoDB
mongosh mongodb://localhost:27018/flores_victoria
db.products.find().limit(5)   # Ver productos
db.users.countDocuments()     # Contar usuarios

# PostgreSQL
psql -h localhost -p 5433 -U postgres -d flores_analytics
\dt                           # Listar tablas
SELECT COUNT(*) FROM orders;  # Contar órdenes

# Redis
redis-cli -h localhost -p 6380
KEYS *                        # Ver todas las claves
FLUSHALL                      # Limpiar cache
INFO memory                   # Información memoria
```

---

## 🔌 **APIs QUICK REFERENCE**

### 🤖 **AI Services (Puerto 3002)**

```bash
# Recomendaciones
POST /api/ai/recommendations
{
  "userId": "user123",
  "context": "roses",
  "limit": 5
}

# Chatbot
POST /api/ai/chat
{
  "message": "¿Cuidados para rosas?",
  "sessionId": "session123"
}

# Análisis de imagen
POST /api/ai/image-analysis
Content-Type: multipart/form-data
image: [archivo]
```

### ⚡ **WASM Processor (Puerto 3003)**

```bash
# Procesar imagen
POST /api/wasm/process
{
  "operation": "resize",
  "width": 800,
  "height": 600,
  "quality": 85
}

# Batch processing
POST /api/wasm/batch
{
  "operations": ["resize", "compress", "watermark"],
  "images": ["img1.jpg", "img2.jpg"]
}
```

### 🛒 **E-commerce API (Puerto 3001)**

```bash
# Productos
GET /api/products?category=roses&limit=10
POST /api/products              # Crear producto
PUT /api/products/:id           # Actualizar
DELETE /api/products/:id        # Eliminar

# Carrito
GET /api/cart/:userId
POST /api/cart/add
POST /api/cart/remove
POST /api/cart/checkout

# Órdenes
GET /api/orders?status=pending
POST /api/orders                # Crear orden
PUT /api/orders/:id/status      # Actualizar estado
```

---

## 📊 **MONITOREO Y MÉTRICAS**

### 🔍 **Health Checks**

```bash
# Sistema completo
curl http://localhost:3001/health

# Servicios individuales
curl http://localhost:3002/ai/health      # AI Service
curl http://localhost:3003/wasm/health    # WASM Processor
curl http://localhost:3021/health         # Admin Panel (ACTUALIZADO)

# Base de datos
curl http://localhost:3001/health/db      # MongoDB + PostgreSQL
curl http://localhost:3001/health/redis   # Redis
```

### 📈 **Métricas Key**

```bash
# Performance
curl http://localhost:3001/metrics/performance
# Response: { "avgResponseTime": "89ms", "throughput": "50K/sec" }

# AI Stats
curl http://localhost:3002/metrics/ai
# Response: { "accuracy": "94.2%", "recommendations": "10K/hour" }

# WASM Stats
curl http://localhost:3003/metrics/wasm
# Response: { "speedBoost": "8.9x", "operations": "2.1M/day" }

# System Resources
curl http://localhost:3001/metrics/system
# Response: { "cpu": "45%", "memory": "2.1GB", "disk": "67%" }
```

---

## 🔒 **SEGURIDAD Y AUTENTICACIÓN**

### 🔑 **JWT Tokens**

```bash
# Obtener token
POST /api/auth/login
{
  "email": "admin@flores.com",
  "password": "admin123"
}

# Refresh token
POST /api/auth/refresh
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}

# Verificar token
GET /api/auth/verify
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

### 🛡️ **Roles y Permisos**

```bash
# Admin completo
role: "super_admin"
permissions: ["*"]

# Admin de tienda
role: "shop_admin"
permissions: ["products.*", "orders.*", "users.read"]

# Usuario regular
role: "user"
permissions: ["cart.*", "orders.own", "profile.*"]
```

---

## 🚨 **TROUBLESHOOTING RÁPIDO**

### ❌ **Problemas Comunes**

| Error                     | Solución                                |
| ------------------------- | --------------------------------------- |
| `ECONNREFUSED MongoDB`    | `docker-compose up mongo`               |
| `Port 8080 in use`        | `lsof -ti:8080 \| xargs kill -9`        |
| `WASM module not found`   | `cd backend/wasm && npm run build:wasm` |
| `AI model loading failed` | `cd backend && npm run download:models` |
| `Permission denied`       | `chmod +x *.sh` para scripts            |

### 🔧 **Comandos de Diagnóstico**

```bash
# Ver puertos ocupados
netstat -tulpn | grep LISTEN

# Procesos de Node.js
ps aux | grep node

# Espacio en disco
df -h

# Memoria RAM
free -h

# Logs del sistema
journalctl -f -u flores-victoria

# Docker status
docker stats --no-stream
```

---

## 📁 **ESTRUCTURA DE ARCHIVOS CLAVE**

### 🏗️ **Configuración Principal**

```
flores-victoria/
├── package.json              # Dependencias principales
├── docker-compose.yml        # Orquestación Docker
├── .env.example              # Variables de entorno
├── start-all.sh             # Script inicio completo
└── test-sistema.sh          # Test del sistema

frontend/
├── index.html               # PWA principal
├── js/system-advanced.js    # Sistema core (20,705 bytes)
├── js/pwa-advanced.js       # PWA features (28,606 bytes)
├── js/ai-recommendations.js # AI frontend (27,910 bytes)
├── js/chatbot.js           # Chatbot (30,333 bytes)
└── sw-advanced.js          # Service Worker

backend/
├── server.js               # Servidor principal
├── services/
│   ├── AIRecommendationEngine.js  # AI Core (19,642 bytes)
│   └── RecommendationsService.js  # Recommendations (13,977 bytes)
└── wasm/
    ├── image-processor.c   # WebAssembly (16,014 bytes)
    └── server.js          # WASM server (10,600 bytes)
```

### 📊 **Archivos de Configuración**

```bash
# Frontend
frontend/config/app.config.js     # Configuración PWA
frontend/config/ai.config.js      # Config AI frontend

# Backend
backend/config/database.js        # Config DB
backend/config/ai.config.js       # Config AI backend
backend/config/wasm.config.js     # Config WebAssembly

# Docker
docker/nginx.conf                 # Nginx config
docker/mongo.conf                 # MongoDB config
docker/postgres.conf              # PostgreSQL config
```

---

## 🧪 **TESTING COMMANDS**

### ✅ **Tests Automatizados**

```bash
# Frontend tests
cd frontend && npm test

# Backend tests
cd backend && npm test

# AI tests
cd backend && npm run test:ai

# WASM tests
cd backend/wasm && npm test

# Integration tests
npm run test:integration

# E2E tests
npx playwright test

# Performance tests
npm run test:performance
```

### 🔍 **Manual Testing**

```bash
# Test de carga
curl -X POST http://localhost:3001/api/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Rosa Roja","price":25.99}'

# Test AI recommendations
curl -X POST http://localhost:3002/api/ai/recommendations \
  -H "Content-Type: application/json" \
  -d '{"userId":"test123","context":"anniversary"}'

# Test WASM performance
time curl -X POST http://localhost:3003/api/wasm/process \
  -F "image=@test-image.jpg" \
  -F "operation=resize"
```

---

## 🌐 **URLs IMPORTANTES**

### 📱 **Aplicaciones**

- **Frontend PWA**: http://localhost:8080
- **Admin Panel**: http://localhost:3021 ✅ **VERIFICADO**
- **📚 Centro de Documentación**: http://localhost:3021/documentation.html ✅ **VERIFICADO**
- **API Gateway**: http://localhost:3001/api
- **AI Service**: http://localhost:3002/ai
- **WASM Processor**: http://localhost:3003/wasm

### 📊 **Dashboards**

- **Arquitectura Interactiva**: http://localhost:8081/arquitectura-interactiva.html
- **Análisis ROI**: http://localhost:8082/roi-analysis.html
- **Monitoreo**: http://localhost:3001/metrics
- **Health Check**: http://localhost:3001/health

### 🗄️ **Bases de Datos**

- **MongoDB**: mongodb://localhost:27018/flores_victoria
- **PostgreSQL**: postgresql://localhost:5433/flores_analytics
- **Redis**: redis://localhost:6380

---

## 🎯 **VARIABLES DE ENTORNO CLAVE**

```bash
# Database
MONGODB_URI=mongodb://localhost:27018/flores_victoria
POSTGRES_URI=postgresql://localhost:5433/flores_analytics
REDIS_URI=redis://localhost:6380

# Services
FRONTEND_PORT=8080
API_PORT=3001
AI_SERVICE_PORT=3002
WASM_SERVICE_PORT=3003
ADMIN_PORT=3021

# AI Configuration
AI_MODEL_PATH=./models/
TENSORFLOW_BACKEND=cpu
AI_BATCH_SIZE=32

# WASM Configuration
WASM_MODULE_PATH=./wasm/image-processor.wasm
WASM_MEMORY_PAGES=256
WASM_MAX_WORKERS=4

# Security
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=24h
BCRYPT_ROUNDS=12

# Performance
CACHE_TTL=3600
MAX_REQUEST_SIZE=50mb
RATE_LIMIT=1000
```

---

## 🔥 **COMANDOS AVANZADOS**

### 🚀 **Performance Optimization**

```bash
# Análisis de bundles
npm run analyze

# Optimizar imágenes
npm run optimize:images

# Compilar WASM optimizado
cd backend/wasm && emcc -O3 image-processor.c -o image-processor.wasm

# Limpiar cache
npm run clean:cache
redis-cli -h localhost -p 6380 FLUSHALL
```

### 🔄 **CI/CD Shortcuts**

```bash
# Build completo
npm run build:all

# Deploy staging
npm run deploy:staging

# Deploy production
npm run deploy:prod

# Rollback
npm run rollback

# Health check post-deploy
npm run health:check
```

---

## 📞 **CONTACTOS Y RECURSOS**

### 👥 **Equipo**

- **Tech Lead**: documentación@flores-victoria.com
- **DevOps**: devops@flores-victoria.com
- **Support**: support@flores-victoria.com

### 🔗 **Links Útiles**

- **Repositorio**: https://github.com/laloaggro/flores-victoria
- **Issues**: https://github.com/laloaggro/flores-victoria/issues
- **Wiki**: https://github.com/laloaggro/flores-victoria/wiki
- **Releases**: https://github.com/laloaggro/flores-victoria/releases

---

**⚡ Este cheatsheet cubre el 95% de casos de uso diarios** **📝 Actualizado: Octubre 2024 | v3.0**
**🌺 Flores Victoria - Sistema E-commerce Ultra-Avanzado**
