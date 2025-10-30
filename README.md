# 🌸 Flores Victoria - Florería Enterprise

<div align="center">

![Flores Victoria Logo](frontend/public/logo.svg)

**Florería Profesional | Enterprise-Grade E-commerce | Santiago, Chile 🇨🇱**

[![CI/CD](https://img.shields.io/badge/CI%2FCD-Active-brightgreen)](https://github.com/laloaggro/Flores-Victoria-)
[![Tests](https://img.shields.io/badge/Tests-365%20Passing-brightgreen)](./TESTING_GUIDE.md)
[![codecov](https://codecov.io/gh/laloaggro/Flores-Victoria-/branch/main/graph/badge.svg)](https://codecov.io/gh/laloaggro/Flores-Victoria-)
[![Security](https://img.shields.io/badge/Security-A%2B-brightgreen)](./REPORTE_VALIDACION_FINAL.md)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue)](./docker-compose.local.yml)
[![Documentation](https://img.shields.io/badge/Docs-Complete-blue)](./ARCHITECTURE.md)
[![Node](https://img.shields.io/badge/Node-18.x-green)](package.json)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

[🌐 Demo](#demo) | [📚 API Docs](./API_REFERENCE.md) | [🏗️ Architecture](./ARCHITECTURE.md) |
[🧪 Testing](./TESTING_GUIDE.md) | [🐳 Docker](./docker-compose.local.yml)

</div>

---

## 📋 Descripción

**Flores Victoria** es una plataforma **enterprise-grade** de e-commerce para florería, construida
con arquitectura de microservicios, observabilidad completa, y las mejores prácticas de la
industria.

**Version**: 4.0.0 Enterprise Edition  
**Estado**: 🚀 **Production-Ready** (Servicios Core + Admin Panel Unificado) **Última
actualización**: 30 Octubre 2025

---

## 🚀 Quick Start

### Opción 1: Docker Compose (Recomendado)

```bash
# 1. Clonar repositorio
git clone https://github.com/laloaggro/Flores-Victoria-.git
cd Flores-Victoria-

# 2. Iniciar todos los servicios (single command)
docker-compose -f docker-compose.local.yml up -d

# 3. Servicios disponibles en:
# - API Gateway: http://localhost:3000
# - Jaeger UI: http://localhost:16686
# - MongoDB: localhost:27017
# - PostgreSQL: localhost:5432
# - Redis: localhost:6379
```

### Opción 2: Manual Setup

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env

# 3. Iniciar bases de datos
docker-compose up -d mongodb postgres redis

# 4. Ejecutar tests
npm test

# 5. Ver cobertura
npm test -- --coverage
```

### 📚 Documentación

- **[🏗️ Arquitectura](./ARCHITECTURE.md)** - Diseño del sistema, microservicios, flujos de datos
- **[📡 API Reference](./API_REFERENCE.md)** - Todos los endpoints (60+) con ejemplos
- **[🧪 Testing Guide](./TESTING_GUIDE.md)** - Cómo escribir y ejecutar tests
- **[🐳 Docker Compose](./docker-compose.local.yml)** - Configuración de desarrollo local

---

### 🎯 Características Enterprise

#### **Admin Panel v4.0** 🆕

- ✨ **Panel Unificado** - Navegación por tabs (hash-based) sin recarga
- 🎨 **8 Temas Personalizables** - Light, Dark, Ocean, Forest, Retro, NeoGlass, CyberNight, Minimal
  Pro
- 📊 **Métricas en Tiempo Real** - Actualización automática cada 5 segundos
- 🧾 **Stream de Logs en Vivo** - Nuevos logs cada 8-15 segundos
- 🎛️ **7 Secciones Integradas** - Dashboard, Control Center, Analytics, Logs, Monitoring, Docs,
  Backups
- ♿ **Accesibilidad WCAG 2.1 AA** - ARIA, roles semánticos, navegación por teclado
- 📱 **Responsive Design** - Mobile-first con breakpoints optimizados
- 🔌 **Puerto Fijo 3021** - Unificado en desarrollo y producción

#### **Testing & Quality** 🆕

- ✅ **428 Tests Passing** - Unit + Integration tests (+22 product-service)
- ✅ **23.66% Coverage** - Growing towards 60% goal (+0.3%)
- ✅ **Jest + Supertest** - Modern testing stack
- ✅ **GitHub Actions CI/CD** - Automated testing on push/PR
- ✅ **Codecov Integration** - Automatic coverage reporting
- 📊 **Service Coverage** ([See Testing Guide](./TESTING_GUIDE.md)):
  - cart-service: 100% ✅ (82 tests)
  - order-service: 100% ✅ (37 tests)
  - contact-service: 74% ✅ (32 tests)
  - review-service: 100% ✅ (22 tests)
  - wishlist-service: 100% ✅ (21 tests)
  - user-service: 84% 🟡
  - auth-service: 67% 🟡
  - api-gateway: 100% ✅ (41 tests) 🆕
  - product-service: 15% ⚠️
- ✅ **ESLint + Prettier** - Code quality y formatting automático
- ✅ **Git Hooks (Husky)** - Pre-commit validation

#### **Security**

- 🛡️ **Helmet.js** - 8+ security headers (CSP, HSTS, X-Frame-Options)
- � **Rate Limiting** - 6 estrategias Redis-backed (anti brute-force)
- ✅ **Joi Validation** - 6 schemas con patrones chilenos
- � **CORS Whitelist** - Origin validation configurada
- 🔑 **JWT Authentication** - Tokens seguros con refresh

#### **Observability**

- 📝 **Winston Logging** - Logs centralizados JSON con daily rotation
- 🔍 **Request ID Tracking** - UUID correlation entre microservicios
- 🏥 **Health Endpoints** - /health, /ready, /metrics (Kubernetes-ready)
- 📊 **Swagger/OpenAPI 3.0** - 20+ endpoints documentados
- 📈 **Metrics Endpoint** - CPU, memoria, uptime en tiempo real

#### **Infrastructure**

- 🐳 **Docker Compose** - Orquestación de 4 databases (MongoDB, PostgreSQL, Redis, RabbitMQ)
- � **Microservices Architecture** - API Gateway + 8 servicios especializados
- 📱 **PWA Ready** - Offline-first, installable
- 🚀 **Performance Optimized** - WebP, lazy loading, caching
- 🇨🇱 **Localized for Chile** - CLP, Chilean phone/postal validation

### 📊 Métricas del Proyecto

| Categoría              | Valor   | Estado           |
| ---------------------- | ------- | ---------------- |
| **Tests Passing**      | 428     | ✅ Completo      |
| **Test Coverage**      | 23.66%  | 🟡 Growing       |
| **Microservicios**     | 9       | ✅ Funcionales   |
| **Bases de Datos**     | 3       | ✅ Orquestadas   |
| **API Endpoints**      | 60+     | ✅ Documentados  |
| **Security Headers**   | 8+      | ✅ Activos       |
| **Rate Limiters**      | 6       | ✅ Redis-backed  |
| **Schemas Validación** | 6       | ✅ Joi           |
| **Docker Services**    | 13      | ✅ Compose Ready |
| **Líneas de Código**   | 25,000+ | ✅ Committed     |

## Arquitectura

## Roles y Responsables de Documentación / Documentation Roles

**Español:**

- Responsable documental: @laloaggro
- Revisores: @laloaggro, @colaborador1
- Contribuyentes: cualquier usuario con PR aprobado
- Revisión trimestral: última semana de cada trimestre

**English:**

- Documentation lead: @laloaggro
- Reviewers: @laloaggro, @colaborador1
- Contributors: any user with approved PR
- Quarterly review: last week of each quarter

---

## 🏗️ Arquitectura

### Stack Tecnológico Enterprise

```
Frontend:          HTML5, CSS3, JavaScript (Vanilla), Vite, PWA
UI Components:     Storybook 9.1.13
Visual Testing:    Percy, Playwright 1.40.0
Backend:           Node.js 22+, Express
API Gateway:       Express + Rate Limiting + Security Headers
Security:          Helmet.js, Joi Validation, JWT Auth
Logging:           Winston 3.x + Daily Rotation
Databases:         MongoDB 7.0, PostgreSQL 16, Redis 7, RabbitMQ 3.12
Testing:           Jest, Supertest, Playwright
Documentation:     Swagger/OpenAPI 3.0, Storybook
Container:         Docker, Docker Compose
```

### Microservicios Architecture

```
📊 API Gateway (Puerto 3000)
├── Swagger UI: /api-docs
├── Health: /health, /ready, /metrics
├── Rate Limiting: 6 estrategias Redis-backed
├── Security Headers: Helmet + CORS
├── Request ID Tracking: UUID correlation
└── Winston Logging: Centralized JSON logs

🎨 Frontend (Puerto 5173)
├── Vite Dev Server
├── PWA Service Worker
├── Offline-first
└── Storybook: localhost:6006

🔐 Auth Service (Puerto 3001)
├── JWT + Refresh Tokens
├── Joi Validation
├── Rate Limiting (5 req/15min)
└── Health Endpoints

📦 Product Service (Puerto 3009)
├── MongoDB Catalog
├── Image Optimization
├── Search & Filters
└── Health Endpoints

🛒 Order Service
├── Order Management
├── PostgreSQL
└── Transaction Support

👤 User Service
├── Profile Management
├── Preferences
└── MongoDB

💬 Contact Service
├── Form Validation (Joi)
├── Email Integration
└── Rate Limiting

� Analytics Service
├── User Tracking
├── Metrics Collection
└── Reports

💳 Payment Service
├── Webpay Integration
├── Transaction Processing
└── Secure Tokens

📧 Notification Service
├── Email (Nodemailer)
├── RabbitMQ Queue
└── Templates

🛡️ Admin Panel (Puerto 3021) ✅ ACTIVO
├── Centralized Management
├── Documentation Center
└── System Monitoring

🤖 AI Service (Puerto 3002) ✅ ACTIVO
├── Product Recommendations
├── Chatbot Interface
└── Analytics Engine

🛒 Order Service (Puerto 3004) ✅ ACTIVO
├── Order Management
├── CRUD Operations
└── Status Tracking

📚 Storybook (Puerto 6006)
└── Component Documentation
```

## ✨ Características Enterprise Implementadas

### 🧪 Testing & Quality Assurance

- ✅ **428 Tests Automatizados** (+22 nuevos product-service)
  - 386+ Unit Tests (Jest + Supertest)
  - 20+ Integration Tests (Complete flows)
  - Coverage: 23.66% (objetivo: 60%)

- ✅ **Storybook Component Library**
  - 3 Componentes documentados (Button, ProductCard, Form)
  - 16+ Stories interactivas
  - Hot reload development
  - Accessibility testing

- ✅ **Percy Visual Regression**
  - 4 Viewports (375, 768, 1280, 1920)
  - 10+ Escenarios de prueba
  - Pixel-perfect comparison
  - CI/CD integration ready

- ✅ **Code Quality Tools**
  - ESLint con reglas enterprise
  - Prettier auto-formatting
  - Git Hooks (Husky + lint-staged)
  - Pre-commit validation

### 🛡️ Security Enterprise

- ✅ **Helmet.js Security Headers**
  - Content-Security-Policy (CSP)
  - HTTP Strict Transport Security (HSTS - 1 año)
  - X-Frame-Options (DENY)
  - X-Content-Type-Options (nosniff)
  - X-XSS-Protection
  - Referrer-Policy
  - CORS Whitelist configurada

- ✅ **Rate Limiting (Redis-backed)**
  - General: 100 req/15min
  - Auth: 5 req/15min (anti brute-force)
  - Create: 20 req/hora
  - Search: 50 req/minuto
  - Public: 30 req/15min
  - Authenticated: 200 req/15min

- ✅ **Joi Input Validation**
  - 6 Schemas (Register, Login, Product, Order, Contact)
  - Chilean-specific patterns (phone, postal code)
  - Auto-sanitization (trim, lowercase)
  - Custom error messages en español

- ✅ **JWT Authentication**
  - Access + Refresh tokens
  - Secure HTTP-only cookies
  - Token rotation

### 📊 Observability & Monitoring

- ✅ **Winston Centralized Logging**
  - JSON structured logs
  - 5 Transports (Console, File, Error, Daily Rotation)
  - Log levels (error, warn, info, debug)
  - Retention: 14 días, max 20MB/file
  - Helpers: logRequest(), logDbError(), logExternalCall()

- ✅ **Request ID Tracking**
  - UUID v4 generation
  - Propagation to downstream services
  - Header: X-Request-ID
  - Complete request traceability

- ✅ **Health Check Endpoints**
  - `GET /health` - Liveness probe
  - `GET /ready` - Readiness probe (with dependency checks)
  - `GET /metrics` - Observability (uptime, memory, CPU)
  - Kubernetes-ready format

- ✅ **Swagger/OpenAPI 3.0 Documentation**
  - Interactive UI: http://localhost:3000/api-docs
  - 20+ Endpoints documented
  - 6 Schemas (Product, User, Order, Error, etc.)
  - Try It Out functionality
  - Security schemes (JWT Bearer + API Key)

### 🐳 Infrastructure & DevOps

- ✅ **Docker Compose Orchestration**
  - MongoDB 7.0
  - PostgreSQL 16
  - Redis 7
  - RabbitMQ 3.12
  - Healthchecks configurados
  - Volume persistence

- ✅ **NPM Scripts (58 total)**
  - Development: `dev`, `storybook`
  - Testing: `test`, `test:visual`, `test:all`, `test:watch`
  - Database: `db:up`, `db:down`, `db:logs`, `db:seed`
  - Quality: `lint`, `format`, `validate:all`

- ✅ **Automation Scripts**
  - `validate-all.sh` - 11 categorías de validación
  - `start-all.sh` - Levantar todos los servicios
  - `stop-all.sh` - Detener servicios
  - `check-detailed-status.sh` - Status de servicios

### 📱 Progressive Web App (PWA)

- ✅ **Instalable** en dispositivos móviles y desktop
- ✅ **Offline-first** con Service Worker inteligente
- ✅ **Caché estratégico** (cache-first para assets, network-first para API)
- ✅ **Manifest.json** completo con 8 tamaños de iconos
- ✅ **Shortcuts** de navegación rápida
- ✅ **Página offline** personalizada con reconexión automática

### 🎯 SEO & Performance

- ✅ **Lighthouse SEO**: 100/100
- ✅ **Lighthouse Performance**: 80/100
- ✅ **Open Graph** + **Twitter Cards** completos
- ✅ **Schema.org** structured data (FloristShop, LocalBusiness, Product)
- ✅ **Sitemap.xml** + **Robots.txt** optimizados
- ✅ **WebP images** (23 imágenes optimizadas)
- ✅ **Lazy loading** + **Async decoding**
- ✅ **Preconnect** DNS-prefetch para recursos externos

### 🇨🇱 Localización Chile

- ✅ **Email**: arreglosvictoriafloreria@gmail.com
- ✅ **Teléfono**: +56 9 6360 3177
- ✅ **Dirección**: Pajonales #6723, Huechuraba, Santiago
- ✅ **RUT**: 16123271-8
- ✅ **Locale**: es-CL, Moneda: CLP
- ✅ **Validación**: Chilean phone format, 7-digit postal codes
- ✅ **Redes sociales**: Facebook, Instagram configurados

---

## 🚀 Quick Start

> **💡 Para una guía detallada, consulta [docs/QUICK_START.md](./docs/QUICK_START.md)**

### Prerrequisitos

```bash
Node.js >= 22.x
npm >= 10.x
Docker >= 24.x (opcional)
Docker Compose >= 2.x (opcional)
```

### Inicio Rápido (2 minutos)

```bash
# 1. Clonar e instalar
git clone https://github.com/laloaggro/Flores-Victoria-.git
cd Flores-Victoria-
npm install

# 2. Verificar sistema
npm run check:ready     # Pre-verificación completa

# 3. Iniciar servicios
npm run dev:up          # Docker (recomendado)
# o
npm start               # Scripts locales

# 4. Verificar salud
npm run health          # Debe mostrar 100% saludable ✅
```

### Comandos Esenciales

```bash
# Diagnóstico
npm run health              # Health check completo
npm run ports:status        # Estado de puertos
npm run ports:dashboard     # Vista completa

# Gestión
npm run dev:up              # Iniciar con Docker
npm run dev:down            # Detener Docker
npm start                   # Iniciar local

# Mantenimiento
npm run logs:clean          # Limpiar logs
npm run predeploy           # Validar antes de deploy
```

### URLs Principales

```bash
# Admin Panel y Documentación
http://localhost:3021                      # Panel de Administración
http://localhost:3021/documentation.html   # Centro de Documentación
http://localhost:3021/control-center.html  # Centro de Control

# API Gateway y Servicios
http://localhost:3000/health               # API Gateway Health
http://localhost:3000/api/status           # Estado del Sistema
http://localhost:3002/ai/recommendations   # Servicio AI
http://localhost:3004/api/orders           # Servicio de Pedidos
```

## 📝 Notion Workspace - Documentación Colaborativa

> **🌸 Tu documentación ahora está lista para Notion!**

Toda la documentación del proyecto está preparada para importarse a Notion, con databases
interactivas, vistas personalizables y sincronización automatizada.

### 🚀 Quick Start Notion

```bash
# Wizard interactivo (abre Notion + guía paso a paso)
./scripts/start-notion-import.sh

# O verifica que todo esté listo primero
./scripts/notion-ready-check.sh

# Ver referencia rápida visual
cat NOTION_QUICK_REFERENCE.txt
```

### 📦 Contenido Disponible

- ✅ **9 archivos listos** para importar (CSVs, Markdown, JSON)
- ✅ **5 databases** estructuradas (Services, Ports, Tasks, Links, Env Vars)
- ✅ **Guía completa** paso a paso con wizard interactivo
- ✅ **Actualización automática** con scripts

### 📚 Documentación Notion

- 📖 **[NEXT_STEPS_NOTION.md](./NEXT_STEPS_NOTION.md)** - Plan completo de importación
- 🧙 **[NOTION_INTEGRATION_GUIDE.md](./docs/NOTION_INTEGRATION_GUIDE.md)** - Guía técnica detallada
  (400+ líneas)
- 📋 **[notion-exports/README.md](./docs/notion-exports/README.md)** - Quick start con ejemplos
- 🔍 **[NOTION_QUICK_REFERENCE.txt](./NOTION_QUICK_REFERENCE.txt)** - Referencia visual rápida

**🌐 Tu Workspace**:
[Notion - Flores Victoria](https://www.notion.so/Arreglo-Victoria-29738f5073b980e0a3ddf4dac759edd8)

---

## 📚 Documentación Completa

### Reportes y Guías

- 📊 **[REPORTE_VALIDACION_FINAL.md](./REPORTE_VALIDACION_FINAL.md)** - Validación completa del
  proyecto (21 features)
- 📖 **[COMPLETE_IMPLEMENTATION_REPORT.md](./COMPLETE_IMPLEMENTATION_REPORT.md)** - Documentación
  técnica detallada (800+ líneas)
- 🚀 **[DEV_QUICKSTART.md](./DEV_QUICKSTART.md)** - Guía rápida para desarrolladores
- 📋 **[DEVELOPMENT_GUIDE_COMPLETE.md](./DEVELOPMENT_GUIDE_COMPLETE.md)** - Guía completa de
  desarrollo
- ✅ **[VALIDATION_CHECKLIST.md](./VALIDATION_CHECKLIST.md)** - Checklist de validaciones

### API Documentation

### APIs y Servicios Activos

- 🛡️ **Admin Panel**: [http://localhost:3021](http://localhost:3021)
- 📚 **Documentación**:
  [http://localhost:3021/documentation.html](http://localhost:3021/documentation.html)
- 🤖 **AI Service**:
  [http://localhost:3002/ai/recommendations](http://localhost:3002/ai/recommendations)
- 🛒 **Order Service**: [http://localhost:3004/api/orders](http://localhost:3004/api/orders)
- 🔍 **Health Endpoints**:
  - `GET /health` - Liveness probe (todos los servicios)
  - `GET /api/orders` - Order management
  - `GET /ai/recommendations` - AI recommendations

### Component Documentation

- 📚 **Storybook**: [http://localhost:6006](http://localhost:6006)
- 🎨 **Componentes documentados**: Button, ProductCard, Form
- 📖 **Stories**: 16+ variantes interactivas

---

## 🧪 Testing

### Infraestructura de Testing (Microservices)

✅ **50 Integration Tests** distribuidos en 5 microservicios:

- `user-service`: 6/10 tests (32% coverage)
- `auth-service`: 11/11 tests (34% coverage)
- `product-service`: 12/12 tests (20% coverage)
- `cart-service`: 10/10 tests (48% coverage)
- `order-service`: 11/11 tests (52% coverage)

**Stack**: Jest 29.7.0 + Supertest 6.3.0

### Ejecutar Tests por Servicio

```bash
# User Service
cd microservices/user-service && npm test

# Auth Service
cd microservices/auth-service && npm test

# Product Service
cd microservices/product-service && npm test

# Cart Service
cd microservices/cart-service && npm test

# Order Service
cd microservices/order-service && npm test
```

### Ejecutar Todos los Tests

```bash
# Script automatizado con resumen
./run-all-tests.sh

# Modo verbose (ver todos los detalles)
./run-all-tests.sh --verbose
```

### Tests Frontend (Legacy)

```bash
# Unit Tests
npm test

# Tests con cobertura
npm run test:coverage

# Tests en watch mode
npm run test:watch

# Integration Tests
npm run test:integration

# Visual Regression (Percy)
npm run test:visual

# E2E Tests (Playwright)
npx playwright test

# Todos los tests
npm run test:all
```

### CI/CD

Los tests se ejecutan automáticamente en GitHub Actions en cada push/PR:

- ✅ 5 jobs paralelos (uno por microservicio)
- ✅ Node.js 20
- ✅ Cache de dependencias npm
- ✅ Upload de cobertura a Codecov

Ver: `.github/workflows/test.yml`

### Documentación Completa

📚 [TESTING_INFRASTRUCTURE.md](./TESTING_INFRASTRUCTURE.md) - Guía completa de testing

### Validación Completa

```bash
# Ejecutar todas las validaciones del proyecto
npm run validate:all

# Ver reporte en: validation-reports/validation-report-YYYYMMDD-HHMMSS.txt
```

---

## 🛠️ Comandos Principales

### Development

```bash
npm run dev              # Frontend dev server (Vite)
npm run storybook        # Component library (puerto 6006)
npm run lint             # ESLint
npm run lint:fix         # ESLint con auto-fix
npm run format           # Prettier (aplicar formato)
npm run format:check     # Prettier (verificar formato)
```

### Database Management

```bash
npm run db:up            # Levantar MongoDB, PostgreSQL, Redis, RabbitMQ
npm run db:down          # Detener todas las bases de datos
npm run db:logs          # Ver logs de containers
npm run db:seed          # Poblar datos de prueba
```

### Microservices

```bash
./start-all.sh           # Iniciar todos los servicios
./stop-all.sh            # Detener todos los servicios
./check-detailed-status.sh  # Ver estado detallado
```

### Testing

```bash
npm test                 # Jest unit tests
npm run test:visual      # Percy visual regression
npm run test:all         # Todos los tests
npm run validate:all     # Validación completa (11 categorías)
```

---

## 📊 Observabilidad

- ✅ **Jaeger** para trazado distribuido
- ✅ **Logs centralizados** en todos los servicios
- ✅ **Health checks** automatizados
- ✅ **Metrics** de performance

---

## 🚀 Quick Start

### Requisitos Previos

- Node.js 18+
- Docker & Docker Compose
- Python 3.8+ (para servidor de desarrollo)
- Git

### Instalación Rápida

```bash
# 1. Clonar repositorio
git clone https://github.com/laloaggro/Flores-Victoria-.git
cd Flores-Victoria-

# 2. Instalar dependencias
npm install

# 3. Iniciar servidor de desarrollo (Frontend)
cd frontend
python3 -m http.server 5173

# O usar npm
npm run dev
```

## 🛠️ Desarrollo

### Setup Inicial (Primera Vez)

```bash
# 1. Clonar el repositorio
git clone https://github.com/laloaggro/Flores-Victoria-.git
cd Flores-Victoria-

# 2. Ejecutar setup automático
./scripts/setup.sh
```

El script de setup:

- ✅ Verifica Docker y Docker Compose
- ✅ Configura permisos de scripts
- ✅ Crea archivo `.env.local`
- ✅ Construye imágenes Docker
- ✅ Inicia servicios
- ✅ Verifica health de servicios

### Uso Diario - Script `dev.sh`

El script `dev.sh` simplifica todas las operaciones de desarrollo:

```bash
# Iniciar servicios
./dev.sh start

# Ver estado
./dev.sh status

# Ver logs (todos los servicios)
./dev.sh logs

# Ver logs de un servicio específico
./dev.sh logs frontend
./dev.sh logs api-gateway

# Reiniciar servicios
./dev.sh restart

# Reconstruir servicios
./dev.sh rebuild

# Abrir servicios en navegador
./dev.sh open

# Ejecutar tests
./dev.sh test

# Acceder a shell de un servicio
./dev.sh shell frontend

# Detener servicios
./dev.sh stop

# Limpieza completa
./dev.sh clean

# Ver ayuda
./dev.sh help
```

### Scripts Adicionales

```bash
# Health check de todos los servicios
./scripts/health-check.sh

# Reporte de desarrollo completo
./scripts/dev-report.sh

# Tests completos
./scripts/test-full.sh

# Generar sitemap
./scripts/generate-sitemap.sh
```

### Desarrollo con Docker

```bash
# Iniciar stack completo
npm run dev:up

# Ver logs
npm run dev:logs

# Detener servicios
npm run dev:down
```

### URLs de Desarrollo

| Servicio       | URL                    | Descripción         |
| -------------- | ---------------------- | ------------------- |
| 🏠 Frontend    | http://localhost:5173  | Sitio principal     |
| 🌐 API Gateway | http://localhost:3000  | API REST            |
| 🛡️ Admin Panel | http://localhost:9000  | Panel admin         |
| 📊 Jaeger UI   | http://localhost:16686 | Trazado distribuido |

---

## 📦 Scripts NPM Disponibles

### Desarrollo

```bash
npm run dev              # Iniciar frontend
npm run dev:up           # Docker compose up
npm run dev:down         # Docker compose down
npm run dev:logs         # Ver logs de servicios
```

### Optimización

```bash
npm run optimize:images  # JPG/PNG → WebP + compresión
npm run webp:update      # Actualizar HTML con picture tags
npm run sitemap:generate # Generar sitemap.xml
```

### Testing & Validación

```bash
npm run validate:dev     # Validación automática (39 checks)
npm run validate:advanced # PWA/SEO/UX (49 checks)
npm run test:manual      # Checklist interactivo
npm run audit:lighthouse # Auditoría de performance
```

### Git Workflow

```bash
npm run prepare:commit   # Asistente interactivo para commit/push
```

---

## 📚 Documentación

### Documentos Principales

| Documento                                                                   | Descripción                               |
| --------------------------------------------------------------------------- | ----------------------------------------- |
| [📄 MEJORAS_AVANZADAS_2025.md](./MEJORAS_AVANZADAS_2025.md)                 | Guía técnica completa PWA/SEO/UX (v2.0.0) |
| [✅ VALIDACION_FINAL.md](./VALIDACION_FINAL.md)                             | Resumen de validación 100%                |
| [📊 RESUMEN_EJECUTIVO_FINAL.md](./RESUMEN_EJECUTIVO_FINAL.md)               | Cambios ejecutivos y métricas             |
| [🧪 VALIDACION_DESARROLLO.md](./VALIDACION_DESARROLLO.md)                   | Guía de testing manual                    |
| [🛠️ SCRIPTS_NPM.md](./SCRIPTS_NPM.md)                                       | Guía rápida de scripts                    |
| [📖 docs/GUIA_SCRIPTS_OPTIMIZACION.md](./docs/GUIA_SCRIPTS_OPTIMIZACION.md) | Scripts de optimización detallados        |

### Características Documentadas

- ✅ PWA: Manifest, Service Worker, iconos, offline
- ✅ SEO: Open Graph, Twitter Cards, Schema.org
- ✅ UX: Toast, loading, scroll-to-top, validación
- ✅ Performance: WebP, lazy loading, preconnect
- ✅ Scripts: Automatización completa
- ✅ Testing: Validación automática y manual
- Métricas con Prometheus
- Dashboards con Grafana
- Logging estructurado

### Infraestructura

- Dockerización de todos los servicios
- Despliegue con Docker Compose
- Manifiestos de Kubernetes
- Helm charts para despliegue sencillo

## Tecnologías Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript
- **Backend**: Node.js, Express.js
- **Bases de datos**: SQLite, MongoDB, PostgreSQL
- **Caché**: Redis
- **Mensajería**: RabbitMQ
- **Contenedores**: Docker, Docker Compose
- **Orquestación**: Kubernetes, Helm
- **Monitoreo**: Prometheus, Grafana, Jaeger
- **Pruebas**: Jest (unitarias)

## 🔐 Admin Site con SSO (Nuevo)

**Novedad (Octubre 2025):** Se implementó un **Admin Site** completo con reverse proxy y Single
Sign-On para centralizar toda la administración.

### Características

- ✅ **Reverse Proxy SSO** para Admin Panel (3010) y MCP Server (5050)
- ✅ **Cookies HttpOnly** con validación de rol admin
- ✅ **Health checks** exhaustivos de todos los servicios
- ✅ **Same-origin** para iframe sin problemas CORS
- ✅ **Rate limiting** ajustado (Gateway: 500 req/15min, Auth: 200 req/15min)
- ✅ **Scripts automatizados** de inicio/detención

### Inicio Rápido del Admin Site

```bash
# Iniciar todos los servicios + Admin Site
./scripts/start-all-with-admin.sh

# Acceder al Admin Site
# URL: http://localhost:9000
# Credenciales: admin@flores.local / admin123

# Detener todo
./scripts/stop-all-with-admin.sh
```

### Documentación Completa

- **Panel Administrativo:** [`ADMIN_PANEL_QUICKSTART.md`](ADMIN_PANEL_QUICKSTART.md) - Guía rápida
  del panel unificado
- **Colores por Ambiente:** [`ENVIRONMENT_COLORS_GUIDE.md`](ENVIRONMENT_COLORS_GUIDE.md) - Sistema
  visual de identificación
- **Arquitectura:** [`ANALISIS_ESTRUCTURA_PROYECTO.md`](ANALISIS_ESTRUCTURA_PROYECTO.md) - Análisis
  y reorganización
- **⚠️ Deprecaciones:** [`DEPRECATION_NOTICE.md`](DEPRECATION_NOTICE.md) - Componentes deprecados
  (admin-site, frontend/pages/admin)

---

## Modos de ejecución

Este proyecto ahora soporta tres modos de ejecución diferentes para adaptarse a distintas
necesidades de desarrollo y producción.

### Modo Admin Site (Recomendado para Administración)

```bash
./scripts/start-all-with-admin.sh
```

**Incluye:**

- Todos los servicios Docker (Gateway, Auth, Products, Frontend, Admin Panel)
- MCP Server (5050)
- Admin Site con proxy SSO (9000)

**Ventajas:**

- ✅ Single Sign-On con cookies HttpOnly
- ✅ Panel integrado sin CORS
- ✅ Health checks de todos los servicios
- ✅ Scripts automatizados todo-en-uno

### Modo Producción (por defecto)

```bash
./start-all.sh
```

Este es el modo tradicional que construye la aplicación y sirve los archivos estáticos a través de
nginx. Es el más adecuado para:

- Entornos de producción
- Pruebas finales
- Demostraciones

Ventajas:

- Simula el entorno de producción real
- Sirve archivos estáticos optimizados
- Mejor rendimiento en tiempo de ejecución

### Modo Desarrollo

```bash
./start-all.sh dev
```

Este modo utiliza los servidores de desarrollo con Hot Module Replacement (HMR) para una experiencia
de desarrollo más rápida. Es el más adecuado para:

- Desarrollo activo
- Desarrollo frontend
- Pruebas rápidas

Ventajas:

- Hot Module Replacement para actualizaciones en tiempo real
- No requiere reconstrucción continua del proyecto
- Mensajes de error más detallados

## Configuración de Puertos

El proyecto utiliza diferentes puertos para los servicios en los entornos de desarrollo y
producción. Para ver la configuración completa de puertos, consulta el documento
[PORTS_CONFIGURATION.md](PORTS_CONFIGURATION.md).

### Conflictos de Puertos

Si necesitas ejecutar ambos entornos (desarrollo y producción) simultáneamente, puedes usar la
configuración sin conflictos definida en el archivo `docker-compose.dev-conflict-free.yml`. Esta
configuración mapea los puertos de desarrollo a números diferentes para evitar conflictos con el
entorno de producción.

## Iniciar el proyecto

Para iniciar todos los servicios en modo producción (como actualmente):

```bash
./start-all.sh
```

Para iniciar todos los servicios en modo desarrollo (con Hot Module Replacement):

```bash
./start-all.sh dev
```

Para iniciar el entorno de desarrollo sin conflictos con producción:

```bash
docker-compose -f docker-compose.dev-conflict-free.yml up -d
```

### Prerrequisitos

- Docker y Docker Compose
- Node.js (para desarrollo local)
- Kubernetes (para despliegue en clúster)

### Desarrollo Local

1. Clonar el repositorio:

   ```bash
   git clone <repositorio-url>
   cd Flores-Victoria-
   ```

2. Iniciar la aplicación:

   ```bash
   docker-compose up -d
   ```

3. Acceder a la aplicación:
   - Frontend: http://localhost:5175
   - Admin Panel: http://localhost:3010

### Desarrollo con Monitoreo

```bash
./scripts/start-with-monitoring.sh
```

Esto iniciará además:

- Prometheus: http://localhost:9090
- Grafana: http://localhost:3000

### Despliegue en Kubernetes

#### Método 1: Usando scripts

```bash
./k8s/deploy-k8s.sh
```

#### Método 2: Usando Helm

```bash
helm install flores-victoria ./helm/flores-victoria
```

## Configuración de Docker

### Dockerfiles

Cada servicio tiene sus propios Dockerfiles para desarrollo y producción:

- `Dockerfile`: Configuración para entorno de producción
- `Dockerfile.dev`: Configuración para entorno de desarrollo

### Mejoras en Dockerfiles

Recientemente se han realizado mejoras en los Dockerfiles para resolver problemas de dependencias:

1. **Auth Service (`microservices/auth-service/Dockerfile.dev`)**:
   - Se añadió la copia del directorio `shared` que contiene módulos compartidos como logging,
     tracing, métricas y auditoría
   - Se modificó el comando de instalación para usar `--legacy-peer-deps` y resolver conflictos de
     dependencias

2. **Admin Panel (`admin-panel/Dockerfile.dev`)**:
   - Se corrigió la configuración de puertos para que coincidan interna y externamente (3010)
   - Se aseguró que el servicio escuche en el puerto correcto para evitar problemas de conexión

## Scripts Disponibles

El proyecto incluye una variedad de scripts útiles en el directorio `scripts/`:

- `start-all.sh`: Inicia todos los servicios
- `stop-all.sh`: Detiene todos los servicios
- `scripts/check-services.sh`: Verifica el estado de los servicios
- `scripts/check-critical-services.sh`: Verifica servicios críticos (prioriza auth-service)
- `scripts/backup-databases.sh`: Realiza copias de seguridad de las bases de datos
- `scripts/start-with-monitoring.sh`: Inicia el entorno con monitoreo
- `scripts/validate-system.sh`: Valida que todo el sistema esté funcionando correctamente

Para una lista completa de scripts y su documentación, consulta
[docs/SCRIPTS_DOCUMENTATION.md](docs/SCRIPTS_DOCUMENTATION.md).

## Documentación

### MCP — Integración rápida (Monitoring & Control Plane)

Hemos integrado un pequeño servidor MCP (Monitoring & Control Plane) para recibir eventos y
auditorías desde los microservicios.

- Documentación rápida: `docs/MCP_INTEGRATION_QUICKSTART.md`
- Dashboard local (temporalmente expuesto para pruebas): http://localhost:5051/dashboard.html
- Script de prueba: `scripts/send-mcp-test-events.sh` (envía 3 eventos al MCP expuesto)

Notas:

- El mapeo de puerto `5051:5050` en `docker-compose.yml` es temporal para pruebas locales; revierte
  cuando termines.
- Configura `MCP_URL` en cada servicio si necesitas apuntar a un MCP remoto.

La documentación completa se encuentra en el directorio [docs/](docs/):

- [Guía de Seguridad](docs/SECURITY_GUIDELINES.md)
- [Implementación de Trazado Distribuido](docs/DISTRIBUTED_TRACING_IMPLEMENTATION.md)
- [Configuración de Monitoreo](docs/MONITORING_SETUP.md)
- [Mejoras en Gestión de Secretos](docs/SECRET_MANAGEMENT_IMPROVEMENTS.md)
- [Resumen de Mejoras del Proyecto](docs/PROJECT_IMPROVEMENTS_SUMMARY.md)
- [Proceso de Release](docs/RELEASE_PROCESS.md)
- [Guía de Docker Compose](docs/DOCKER_COMPOSE_GUIDE.md)
- [Documentación de Scripts](docs/SCRIPTS_DOCUMENTATION.md)
- [Changelog](CHANGELOG.md)
- [Análisis del Marco Lógico (MML)](docs/MML_LOGICAL_FRAMEWORK_ANALYSIS.md)
- [Configuración de Puertos](PORTS_CONFIGURATION.md)

## 📁 Estructura del Proyecto

```
Flores-Victoria-/
├── 🎨 frontend/                        # Aplicación frontend PWA
│   ├── public/
│   │   ├── icons/                      # 10 iconos PWA (72px-512px)
│   │   ├── images/                     # Imágenes + WebP
│   │   ├── js/
│   │   │   ├── config/
│   │   │   │   └── business-config.js  # Datos de negocio (Chile)
│   │   │   ├── seo-manager.js          # SEO automático
│   │   │   ├── ux-enhancements.js      # UX components
│   │   │   └── sw-register.js          # Service Worker
│   │   ├── logo.svg                    # Logo profesional ✨
│   │   ├── manifest.json               # PWA manifest (es-CL)
│   │   ├── sw.js                       # Service Worker
│   │   ├── sitemap.xml                 # 23 URLs
│   │   └── checklist-validacion.html   # Testing interactivo
│   └── pages/                          # 20+ páginas HTML
│
├── 🔧 scripts/                         # Scripts de automatización
│   ├── optimize-images.sh              # WebP converter
│   ├── update-webp-references.sh       # HTML updater
│   ├── generate-sitemap.sh             # Sitemap generator
│   ├── lighthouse-audit.sh             # Performance audit
│   ├── validate-advanced.sh            # 49 checks PWA
│   ├── validate-development.sh         # 39 checks dev
│   ├── start-manual-testing.sh         # Testing assistant
│   ├── prepare-commit.sh               # Git workflow
│   └── pwa-tools/
│       └── generate-icons.js           # Icon generator
│
├── 🌐 microservices/                   # Backend services
│   ├── api-gateway/                    # Punto de entrada (3000)
│   ├── auth-service/                   # JWT + OAuth
│   ├── product-service/                # MongoDB catálogo
│   ├── order-service/                  # Gestión pedidos
│   ├── user-service/                   # Perfiles
│   ├── cart-service/                   # Carrito compras
│   ├── wishlist-service/               # Lista deseos
│   ├── review-service/                 # Reseñas
│   └── contact-service/                # Formularios
│
├── 🛡️ admin-panel/                     # Panel administración (9000)
├── 📊 monitoring/                      # Jaeger, Prometheus
├── 🐳 k8s/                             # Kubernetes manifests
├── ⎈ helm/                             # Helm charts
├── 🧪 tests/                           # Unit + Integration
├── 📚 docs/                            # Documentación técnica
│   ├── GUIA_SCRIPTS_OPTIMIZACION.md
│   └── ...
│
├── 📄 Documentos de Validación
│   ├── MEJORAS_AVANZADAS_2025.md       # Docs técnica v2.0.0
│   ├── VALIDACION_FINAL.md             # 100% validación
│   ├── VALIDACION_DESARROLLO.md        # Testing guide
│   ├── RESUMEN_EJECUTIVO_FINAL.md      # Executive summary
│   └── SCRIPTS_NPM.md                  # Scripts quick ref
│
├── docker-compose.yml                  # Producción
├── docker-compose.dev.yml              # Desarrollo
├── package.json                        # NPM scripts (12)
└── README.md                           # Este archivo
```

---

## 🤝 Contribuir

### Workflow de Contribución

1. **Fork** del repositorio
2. **Clonar** tu fork localmente
3. **Crear rama** para tu feature:
   ```bash
   git checkout -b feature/mi-nueva-funcionalidad
   ```
4. **Desarrollar** y hacer commits descriptivos
5. **Validar** antes de commit:
   ```bash
   npm run validate:dev
   npm run validate:advanced
   ```
6. **Preparar commit** con asistente:
   ```bash
   npm run prepare:commit
   ```
7. **Push** a tu fork:
   ```bash
   git push origin feature/mi-nueva-funcionalidad
   ```
8. **Crear Pull Request** en GitHub

### Estándares de Código

- ✅ Validación 100% antes de PR
- ✅ Lighthouse Performance > 70
- ✅ SEO = 100/100
- ✅ Documentación actualizada
- ✅ Scripts de testing pasando

---

## 📜 Licencia

Este proyecto está licenciado bajo la **Licencia MIT** - ver el archivo [LICENSE](LICENSE) para más
detalles.

---

## 📞 Contacto

### Arreglos Victoria - Florería

- 🌐 **Sitio Web**: [arreglosvictoria.com](#)
- 📧 **Email**: arreglosvictoriafloreria@gmail.com
- 📱 **Teléfono/WhatsApp**: +56 9 6360 3177
- 📍 **Dirección**: Pajonales #6723, Huechuraba, Santiago, Chile
- 🇨🇱 **RUT**: 16123271-8

### Redes Sociales

- 📘 [Facebook](https://www.facebook.com/profile.php?id=61578999845743)
- 📸 [Instagram](https://www.instagram.com/arreglosvictoria/)

### Equipo de Desarrollo

- 👨‍💻 **Lead Developer**: @laloaggro
- 📚 **Documentation**: @laloaggro
- 🔍 **Reviewers**: @laloaggro, @colaborador1

---

## 🎯 Roadmap

### ✅ Completado (Octubre 2025)

- [x] PWA completa con Service Worker
- [x] Logo profesional y branding
- [x] SEO 100/100 con Schema.org
- [x] Performance optimizado (WebP, lazy loading)
- [x] Datos de negocio reales (Chile)
- [x] Scripts de automatización
- [x] Validación 100% (150 checks)
- [x] Documentación completa

### 🚧 En Progreso

- [ ] Testing manual con checklist interactivo
- [ ] Screenshots PWA para manifest
- [ ] Pruebas en dispositivos reales
- [ ] Deploy a producción

### 📅 Próximas Funcionalidades

- [ ] Integración con pasarelas de pago chilenas
- [ ] Sistema de notificaciones push
- [ ] Chat en vivo con soporte
- [ ] App móvil nativa (React Native)
- [ ] Dashboard de analytics
- [ ] Programa de lealtad/puntos

---

## 📊 Changelog

### v2.0.0 Enterprise Edition (Octubre 22, 2025) - 🚀 Production-Ready

#### 🎯 Features Enterprise Implementadas (21 total)

**Testing & Quality (5)**

- ✅ Storybook 9.1.13 - Component documentation con 16+ historias
- ✅ Percy Visual Regression - Testing en 4 viewports
- ✅ Jest Unit Tests - 70+ tests unitarios
- ✅ Integration Tests - 25+ tests de flujos completos
- ✅ Validation Script - 11 categorías automatizadas

**Security (4)**

- ✅ Helmet.js - 8+ security headers (CSP, HSTS)
- ✅ Rate Limiting - 6 estrategias Redis-backed
- ✅ Joi Validation - 6 schemas con patterns chilenos
- ✅ CORS Whitelist - Validación de origen

**Observability (4)**

- ✅ Winston Logging - JSON centralized con daily rotation
- ✅ Request ID Tracking - UUID correlation
- ✅ Health Endpoints - /health, /ready, /metrics
- ✅ Swagger/OpenAPI 3.0 - 20+ endpoints documentados

**Infrastructure (4)**

- ✅ Docker Compose - 4 databases orquestadas
- ✅ Git Hooks - Husky + lint-staged
- ✅ NPM Scripts - 58 scripts totales
- ✅ Automation Scripts - validate-all.sh, start-all.sh

**Code Quality (3)**

- ✅ ESLint - Enterprise rules
- ✅ Prettier - Auto-formatting
- ✅ Pre-commit Hooks - Validación automática

**Documentation (1)**

- ✅ Complete Docs - 800+ líneas técnicas + reportes

#### � Métricas del Commit

- **643 archivos** modificados
- **17,552 líneas** agregadas
- **14,915 líneas** removidas
- **2 commits** exitosos a GitHub (47372df, 3946a19)

#### 🧪 Testing Coverage

- Unit Tests: 70+ (API Gateway, Validation)
- Integration Tests: 25+ (Complete flows)
- Visual Tests: 10+ escenarios Percy
- E2E Tests: Playwright configurado
- **Total Tests**: 95+

#### 🛡️ Security Improvements

- 8+ Security headers activos
- 6 Rate limiters implementados
- 6 Validation schemas (Chilean patterns)
- JWT Authentication mejorado
- Request correlation tracking

#### 📊 Performance & Quality

- Lighthouse Performance: 80/100
- Lighthouse SEO: 100/100
- Test Coverage: 60%+
- Linting: ESLint configured
- Formatting: Prettier applied

#### 📦 Nuevas Dependencias

Backend:

- swagger-ui-express, swagger-jsdoc, yamljs
- winston, winston-daily-rotate-file
- helmet, joi, express-validator
- express-rate-limit, rate-limit-redis, ioredis
- uuid

Testing:

- @percy/cli, @percy/playwright
- playwright
- jest, supertest

Dev Tools:

- @storybook/html, @storybook/addon-\*
- husky, lint-staged
- eslint, prettier

---

## 🙏 Agradecimientos

**Herramientas & Frameworks**

- **Vite** - Por el excelente build tool y dev server
- **Storybook** - Por la plataforma de documentación de componentes
- **Percy.io** - Por visual regression testing enterprise
- **Playwright** - Por E2E testing robusto
- **Winston** - Por logging centralizado profesional
- **Helmet.js** - Por security headers
- **Express** - Por el ecosistema de middleware
- **Joi** - Por validation schemas
- **Jest** - Por testing framework

**Comunidad Open Source**

- Por las herramientas increíbles y documentación
- Por los ejemplos y best practices
- Por mantener ecosistemas robustos

---

## 📞 Soporte & Contacto

### Negocio

- **Email**: arreglosvictoriafloreria@gmail.com
- **Teléfono**: +56 9 6360 3177
- **Dirección**: Pajonales #6723, Huechuraba, Santiago
- **RUT**: 16123271-8

### Desarrollo

- **GitHub**: [@laloaggro](https://github.com/laloaggro)
- **Issues**: [GitHub Issues](https://github.com/laloaggro/Flores-Victoria-/issues)
- **Pull Requests**: Bienvenidos (ver [Contribuir](#🤝-contribuir))

### Documentación

- 📊 [REPORTE_VALIDACION_FINAL.md](./REPORTE_VALIDACION_FINAL.md)
- 📖 [COMPLETE_IMPLEMENTATION_REPORT.md](./COMPLETE_IMPLEMENTATION_REPORT.md)
- 🚀 [DEV_QUICKSTART.md](./DEV_QUICKSTART.md)
- 📋 [VALIDATION_CHECKLIST.md](./VALIDATION_CHECKLIST.md)

---

## 📄 Licencia

Este proyecto es **privado** y está bajo licencia propietaria de **Flores Victoria**.

Todos los derechos reservados © 2025 Flores Victoria

---

<div align="center">

**🌸 Flores Victoria - Enterprise E-commerce Platform**

**Version 2.0.0 | Production-Ready | Santiago, Chile 🇨🇱**

[![Made with ❤️](https://img.shields.io/badge/Made%20with-%E2%9D%A4%EF%B8%8F-red)](https://github.com/laloaggro/Flores-Victoria-)
[![Production Ready](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)](./REPORTE_VALIDACION_FINAL.md)
[![21 Enterprise Features](https://img.shields.io/badge/Features-21%20Enterprise-blue)](./COMPLETE_IMPLEMENTATION_REPORT.md)
[![95+ Tests](https://img.shields.io/badge/Tests-95%2B%20Passing-brightgreen)](./tests)

**🎯 21 Enterprise Features | 🧪 95+ Tests | 🛡️ Security Hardened | 📊 Full Observability**

[⬆️ Volver arriba](#-flores-victoria---florería-enterprise)

---

_Desarrollado con excelencia por [@laloaggro](https://github.com/laloaggro)_

</div>
