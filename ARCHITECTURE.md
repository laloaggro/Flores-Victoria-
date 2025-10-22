# 🏗️ Arquitectura del Sistema - Flores Victoria

**Version**: 2.0.0 Enterprise Edition  
**Última actualización**: Octubre 22, 2025  
**Estado**: Production-Ready

---

## 📊 Vista General

Flores Victoria es una plataforma e-commerce enterprise construida con arquitectura de
microservicios, diseñada para escalabilidad, observabilidad y alta disponibilidad.

### Principios de Diseño

1. **Microservicios** - Servicios desacoplados y especializados
2. **API-First** - Documentación OpenAPI completa
3. **Security-First** - Headers, rate limiting, validation en cada capa
4. **Observability** - Logging centralizado, métricas, healthchecks
5. **Testing** - 95+ tests automatizados (Unit, Integration, E2E, Visual)
6. **Documentation** - Swagger, Storybook, Markdown docs

---

## 🎯 Arquitectura de Microservicios

```
┌─────────────────────────────────────────────────────────────────┐
│                        CAPA DE CLIENTE                           │
├─────────────────────────────────────────────────────────────────┤
│  Frontend (Vite)          │  Admin Panel        │  Storybook     │
│  Puerto: 5173             │  Puerto: 3010       │  Puerto: 6006  │
│  - PWA Service Worker     │  - Management UI    │  - Components  │
│  - Offline-first          │  - Auth required    │  - 16+ stories │
│  - WebP optimized         │  - CRUD ops         │  - Interactive │
└─────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────┐
│                       CAPA DE API GATEWAY                        │
├─────────────────────────────────────────────────────────────────┤
│  API Gateway (Express)                                           │
│  Puerto: 3000                                                    │
│                                                                  │
│  ✅ Swagger UI (/api-docs)                                      │
│  ✅ Rate Limiting (Redis) - 6 estrategias                       │
│  ✅ Security Headers (Helmet)                                   │
│  ✅ Request ID Tracking (UUID)                                  │
│  ✅ CORS Whitelist                                              │
│  ✅ Winston Logging                                             │
│  ✅ Health Endpoints (/health, /ready, /metrics)                │
│  ✅ Joi Validation                                              │
└─────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────┐
│                    CAPA DE MICROSERVICIOS                        │
├────────────────────┬───────────────────┬────────────────────────┤
│  Auth Service      │  Product Service  │  Order Service         │
│  Puerto: 3001      │  Puerto: 3009     │  Puerto: 3002          │
│  - JWT Auth        │  - Catalog CRUD   │  - Order Management    │
│  - OAuth Google    │  - Search         │  - Status tracking     │
│  - Rate Limited    │  - Images         │  - PostgreSQL          │
│  - MongoDB         │  - MongoDB        │  - Transactions        │
├────────────────────┼───────────────────┼────────────────────────┤
│  User Service      │  Contact Service  │  Payment Service       │
│  Puerto: 3003      │  Puerto: 3004     │  Puerto: 3005          │
│  - Profiles        │  - Forms          │  - Webpay Integration  │
│  - Preferences     │  - Email notif    │  - Secure tokens       │
│  - MongoDB         │  - Validation     │  - Transaction logs    │
├────────────────────┼───────────────────┼────────────────────────┤
│  Cart Service      │  Notification Svc │  Analytics Service     │
│  Puerto: 3006      │  Puerto: 3007     │  Puerto: 3008          │
│  - Cart CRUD       │  - Email          │  - User tracking       │
│  - Redis cache     │  - RabbitMQ       │  - Metrics             │
│  - Session mgmt    │  - Templates      │  - Reports             │
└────────────────────┴───────────────────┴────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────┐
│                      CAPA DE PERSISTENCIA                        │
├─────────────────────────────────────────────────────────────────┤
│  MongoDB 7.0        │  PostgreSQL 16   │  Redis 7  │ RabbitMQ  │
│  Puerto: 27017      │  Puerto: 5432    │  Port: 6379│ 5672     │
│  - Products         │  - Orders        │  - Cache  │  - Queue  │
│  - Users            │  - Transactions  │  - Sessions│ - Notif  │
│  - Auth             │  - Analytics     │  - Limits │           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔐 Capa de Seguridad

### 1. API Gateway Security

```javascript
// Helmet.js Security Headers
✅ Content-Security-Policy (CSP)
✅ Strict-Transport-Security (HSTS - 1 año)
✅ X-Frame-Options: DENY
✅ X-Content-Type-Options: nosniff
✅ X-XSS-Protection: 1; mode=block
✅ Referrer-Policy: strict-origin-when-cross-origin

// CORS Whitelist
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3010',
  'https://flores-victoria.com'
];
```

### 2. Rate Limiting (Redis-backed)

```javascript
General Limiter:     100 requests / 15min
Auth Limiter:        5 requests / 15min (brute-force protection)
Create Limiter:      20 requests / hora
Search Limiter:      50 requests / minuto
Public Limiter:      30 requests / 15min
Authenticated:       200 requests / 15min
```

### 3. Input Validation (Joi)

```javascript
✅ Register Schema - Email, password (8+ chars, complex), Chilean phone
✅ Login Schema - Email, password
✅ Product Schema - Category, price, discount constraints
✅ Order Schema - Items nested, delivery address, future date
✅ Contact Schema - Message length 10-1000 chars
```

### 4. Authentication Flow

```
1. User → POST /api/auth/login
2. API Gateway → Joi Validation
3. API Gateway → Rate Limiter Check (5 req/15min)
4. API Gateway → Auth Service
5. Auth Service → Verify credentials (bcrypt)
6. Auth Service → Generate JWT (access + refresh)
7. Auth Service → Return tokens
8. API Gateway → Set HTTP-only cookies
9. API Gateway → Return response + X-Request-ID
```

---

## 📊 Observabilidad

### 1. Winston Centralized Logging

```javascript
// Log Levels
error   - Errores críticos
warn    - Advertencias
info    - Información general
debug   - Debugging detallado

// Transports
Console           - Development (colored)
Error File        - errors.log
Combined File     - combined.log
Daily Rotation    - error-YYYY-MM-DD.log
Daily Rotation    - combined-YYYY-MM-DD.log

// Retention
Max Size: 20MB per file
Max Files: 14 días
```

### 2. Request ID Tracking

```javascript
// Flow
1. Request → API Gateway
2. Generate UUID v4 → X-Request-ID header
3. Propagate to downstream services
4. Include in all logs
5. Return in response headers

// Benefits
- End-to-end traceability
- Cross-service correlation
- Debugging simplificado
- User support mejorado
```

### 3. Health Endpoints

```bash
# Liveness Probe (¿Está vivo el servicio?)
GET /health
Response: { status: 'healthy', service: 'api-gateway', uptime: 3600 }

# Readiness Probe (¿Puede recibir tráfico?)
GET /ready
Response: {
  ready: true,
  checks: { database: 'ok', redis: 'ok' },
  memory: { used: '150MB', total: '512MB' }
}

# Metrics (Observabilidad)
GET /metrics
Response: {
  uptime: '1h 30m 45s',
  process: { pid: 1234, node_version: 'v22.20.0' },
  memory: { rss: 157286400, heapUsed: 98304000 },
  cpu: { user: 5000, system: 2000 },
  system: { platform: 'linux', cpus: 8 }
}
```

---

## 🧪 Estrategia de Testing

### Test Pyramid

```
                 ▲
                / \
               /E2E\
              /  &  \         10+ tests (Playwright)
             /Visual\
            /_______\
           /         \
          /Integration\       25+ tests (Supertest)
         /  Complete  \
        /    Flows     \
       /_______________\
      /                 \
     /   Unit Tests      \    70+ tests (Jest)
    /   API Gateway       \
   /    Validation         \
  /_______________________\

Total: 95+ automated tests
```

### Coverage por Capa

```
Unit Tests (70+):
├── API Gateway (40+ tests)
│   ├── Health endpoints
│   ├── Security headers
│   ├── Request ID format
│   ├── CORS preflight
│   └── Rate limiting
├── Validation Schemas (30+ tests)
│   ├── Email validation
│   ├── Password strength
│   ├── Chilean phone format
│   ├── Postal code (7 digits)
│   └── Data sanitization

Integration Tests (25+):
├── Complete User Flows
│   ├── Registration → Login → Browse → Cart → Order
│   ├── Product search & filters
│   ├── Cart management
│   ├── Contact form submission
│   ├── Error handling (404, 500)
│   └── Concurrent requests

E2E Tests (Playwright):
├── Homepage navigation
├── Product listing & detail
├── Cart operations
├── Contact form
└── Checkout flow

Visual Regression (Percy):
├── 4 Viewports (375, 768, 1280, 1920)
├── 4 Pages (Home, Products, ProductDetail, Cart)
└── 10+ Scenarios
```

---

## 📚 Documentación API

### Swagger/OpenAPI 3.0

**URL**: http://localhost:3000/api-docs

**Características**:

- ✅ 20+ endpoints documentados
- ✅ 6 schemas (Product, User, Order, Error, etc.)
- ✅ Try It Out interactivo
- ✅ Ejemplos de request/response
- ✅ Security schemes (JWT Bearer + API Key)
- ✅ Error codes documentados

**Endpoints Documentados**:

```yaml
Health:
  GET /health - Liveness probe GET /ready - Readiness probe GET /metrics - Observability metrics

Auth:
  POST /api/auth/register - User registration POST /api/auth/login - User login POST
  /api/auth/refresh - Refresh access token POST /api/auth/logout - User logout

Products:
  GET /api/products - List products (paginated) GET /api/products/:id - Get product details POST
  /api/products - Create product (admin) PUT /api/products/:id - Update product (admin) DELETE
  /api/products/:id - Delete product (admin) GET /api/products/search - Search products

Orders:
  GET /api/orders - List user orders GET /api/orders/:id - Get order details POST /api/orders -
  Create new order PUT /api/orders/:id - Update order status (admin) DELETE /api/orders/:id - Cancel
  order

Contact: POST /api/contact - Submit contact form
```

---

## 🐳 Infraestructura Docker

### Docker Compose Services

```yaml
services:
  # Databases
  mongodb:
    image: mongo:7.0
    ports: 27017:27017
    volumes: ./data/mongodb
    healthcheck: mongosh --eval "db.adminCommand('ping')"

  postgresql:
    image: postgres:16-alpine
    ports: 5432:5432
    volumes: ./data/postgres
    healthcheck: pg_isready

  redis:
    image: redis:7-alpine
    ports: 6379:6379
    volumes: ./data/redis
    healthcheck: redis-cli ping

  rabbitmq:
    image: rabbitmq:3.12-management-alpine
    ports:
      - 5672:5672 # AMQP
      - 15672:15672 # Management UI
    healthcheck: rabbitmq-diagnostics -q ping

  # Microservices (auto-restart)
  api-gateway:
    build: ./microservices/api-gateway
    ports: 3000:3000
    depends_on: [redis, rabbitmq]
    environment:
      - NODE_ENV=development
      - REDIS_URL=redis://redis:6379

  auth-service:
    build: ./microservices/auth-service
    ports: 3001:3001
    depends_on: [mongodb, redis]

  product-service:
    build: ./microservices/product-service
    ports: 3009:3009
    depends_on: [mongodb]

  # Frontend
  frontend:
    build: ./frontend
    ports: 5173:5173
    volumes: ./frontend:/app
```

### Health Checks Flow

```
1. Container starts
2. Wait for dependencies (depends_on)
3. Run healthcheck command every 30s
4. Unhealthy after 3 consecutive failures
5. Auto-restart unhealthy containers
```

---

## 🔄 Flujos de Datos Principales

### 1. Registro de Usuario

```
User → Frontend → API Gateway → Joi Validation → Rate Limiter
→ Auth Service → Hash password (bcrypt) → Save to MongoDB
→ Generate JWT tokens → Return to Gateway → Set cookies
→ Response to Frontend → Redirect to dashboard
```

### 2. Crear Orden

```
User → Frontend → API Gateway → Auth Middleware (verify JWT)
→ Joi Validation → Order Service → Start Transaction (PostgreSQL)
→ Validate products (Product Service) → Calculate total
→ Create order → Decrement inventory → Commit transaction
→ Emit event (RabbitMQ) → Notification Service → Send email
→ Analytics Service → Track purchase → Response to Frontend
```

### 3. Búsqueda de Productos

```
User → Frontend → API Gateway → Rate Limiter (50 req/min)
→ Product Service → Build MongoDB query (filters, sort, pagination)
→ Query database → Format results → Cache in Redis (5min TTL)
→ Return to Gateway → Response to Frontend → Display results
```

---

## 📈 Performance & Scalabilidad

### Optimizaciones Implementadas

1. **Caching (Redis)**
   - Product lists (5 min TTL)
   - User sessions
   - Rate limiting counters
   - Search results

2. **Database Indexing**
   - MongoDB: category, price, name
   - PostgreSQL: user_id, order_date, status

3. **CDN Ready**
   - Static assets servidos desde `/public`
   - WebP images optimized
   - Vite build optimizations

4. **Connection Pooling**
   - MongoDB: max 10 connections
   - PostgreSQL: max 20 connections
   - Redis: max 50 connections

### Horizontal Scaling

```
Load Balancer (nginx)
        ↓
  ┌─────┼─────┐
  ↓     ↓     ↓
API-GW API-GW API-GW (3 replicas)
  ↓     ↓     ↓
  └─────┼─────┘
        ↓
  Shared Redis (sessions + cache)
        ↓
  MongoDB Replica Set (3 nodes)
```

---

## 🚀 Deployment Pipeline (Futuro)

### CI/CD Flow (GitHub Actions)

```
1. Push to main
2. Run linting (ESLint + Prettier)
3. Run tests (Unit + Integration + E2E)
4. Build Docker images
5. Push to Docker Registry
6. Deploy to staging
7. Run smoke tests
8. Manual approval
9. Deploy to production
10. Run health checks
11. Notify team (Slack)
```

### Kubernetes Deployment (Próximo)

```yaml
Namespace: flores-victoria-prod

Deployments:
  - api-gateway (replicas: 3)
  - auth-service (replicas: 2)
  - product-service (replicas: 3)
  - order-service (replicas: 2)
  - frontend (replicas: 2)

Services:
  - api-gateway (LoadBalancer)
  - MongoDB (StatefulSet)
  - PostgreSQL (StatefulSet)
  - Redis (StatefulSet)

ConfigMaps:
  - app-config
  - nginx-config

Secrets:
  - database-credentials
  - jwt-secrets
  - oauth-credentials

Ingress:
  - flores-victoria.com → frontend
  - api.flores-victoria.com → api-gateway
```

---

## 📖 Referencias Técnicas

### Stack Completo

**Frontend**:

- Vite 5.x - Build tool
- Vanilla JavaScript - No framework overhead
- Service Workers - PWA offline support
- WebP - Image optimization

**Backend**:

- Node.js 22+ - Runtime
- Express - Web framework
- Winston 3.x - Logging
- Helmet - Security headers
- Joi - Validation
- JWT - Authentication

**Testing**:

- Jest - Unit testing
- Supertest - HTTP testing
- Playwright 1.40.0 - E2E testing
- Percy - Visual regression

**Infrastructure**:

- Docker - Containerization
- Docker Compose - Orchestration
- MongoDB 7.0 - NoSQL database
- PostgreSQL 16 - SQL database
- Redis 7 - Cache & sessions
- RabbitMQ 3.12 - Message queue

**Documentation**:

- Swagger UI Express - API docs
- Storybook 9.1.13 - Component docs
- Markdown - Technical docs

---

## 🤝 Contribuir

Ver [README.md](./README.md#🤝-contribuir) para guías de contribución.

---

## 📞 Soporte

- **Issues**: [GitHub Issues](https://github.com/laloaggro/Flores-Victoria-/issues)
- **Docs**: Ver carpeta `docs/`
- **Email**: arreglosvictoriafloreria@gmail.com

---

**Version**: 2.0.0 Enterprise Edition  
**Última actualización**: Octubre 22, 2025  
**Autor**: [@laloaggro](https://github.com/laloaggro)
