# Changelog - Flores Victoria

Todos los cambios notables del proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), y este proyecto
adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### 🔧 En Desarrollo

- Integración con pasarela de pagos
- Sistema de cupones y descuentos
- Notificaciones push
- App móvil (React Native)

---

## [4.1.0] - 2025-12-30

### ✅ Testing & Quality Improvements

#### Test Coverage Improvements (8 microservicios mejorados)

- **user-service**: 20.4% → 67.24% (+46.84%) ⭐
  - Fixed 10 @flores-victoria/shared imports to relative paths
  - Installed swagger dependencies
  - All 7 test suites passing (122 tests)
- **contact-service**: 45.79% → 67.34% (+21.55%) ⭐
  - Fixed 6 shared imports
  - Created comprehensive tests for app, auth, database, server
  - 8 test suites passing (111 tests)
- **wishlist-service**: 31.27% → 63.63% (+32.36%) ⭐
  - Fixed 2 shared imports
  - Created tests for app (75%), redis (48.71%), routes, server
  - 10 test suites passing (133 tests)
- **cart-service**: 34% → 58.23% (+24.23%)
  - 16/16 test suites passing (186 tests)
  - Comprehensive integration tests
- **review-service**: 0% → 57.94% (+57.94%)
  - Created mcp-helper.js with 100% coverage
  - 11/11 test suites passing (161 tests)
- **product-service**: 16% → 53.57% (+37.57%)
  - Fixed import paths and timeouts
  - Improved test infrastructure
- **notification-service**: 45.83% → 54.54% (+8.71%)
  - email.service.js at 100% coverage
  - config.js and logger.simple.js at 100%
  - 3 test suites passing (69 tests)
- **order-service**: 31.05% → 38.3% (+7.25%)
  - mcp-helper.js at 100% coverage
  - Fixed 4 shared imports
  - 186 tests passing

#### Fixed Issues

- Corrected 29+ @flores-victoria/shared imports to relative paths across all services
- Removed orphaned mcp-helper test files
- Installed missing dependencies (swagger-jsdoc, swagger-ui-express)
- Fixed test timeouts and configurations

#### Statistics

- **Average coverage**: ~57.5% across 8 services
- **Total tests**: 900+ tests passing
- **Test suites**: 60+ suites configured
- **Commits**: 8 well-documented feature commits

---

## [4.0.0] - 2025-02-15

### 🎉 Added - Railway Production Deployment

#### Deployment

- **Railway full deployment** - 13 servicios en producción
  - Frontend: https://frontend-v2-production-7508.up.railway.app
  - API Gateway: https://api-gateway-production-b02f.up.railway.app
  - Todos los microservicios operativos

#### Fixes

- **Order Service**: Reescritura completa de `app.simple.js`
  - Rutas CRUD completas para pedidos
  - Integración con MongoDB
  - Middleware de autenticación JWT
  - Fallback a almacenamiento en memoria
- **Review Service**: Agregado `jsonwebtoken` a dependencias
  - Corregido error de módulo faltante
  - POST de reseñas funcionando

- **API Gateway**: Actualización de URLs de servicios
  - ORDER_SERVICE_URL corregido a `order-service-copy.railway.internal`
  - Todas las rutas de proxy funcionando

#### Documentation

- **README.md**: Reescritura completa
  - Badges de CI/CD, codecov, licencia
  - Arquitectura con diagrama ASCII
  - Guía de instalación paso a paso
  - Documentación de API
  - URLs de producción

- **CONTRIBUTING.md**: Guía de contribución
  - Código de conducta
  - Flujo de trabajo Git
  - Convención de commits
  - Estándares de código

- **SECURITY.md**: Política de seguridad
  - Proceso de reporte de vulnerabilidades
  - Prácticas de seguridad implementadas
  - Checklist de seguridad

- **docs/**: Documentación completa reorganizada
  - `docs/api/API_REFERENCE.md`: Documentación completa de API
  - `docs/architecture/overview.md`: Arquitectura del sistema
  - `docs/deployment/railway.md`: Guía de deploy en Railway

#### Validated Endpoints (E2E Testing)

| Endpoint                   | Método          | Estado          |
| -------------------------- | --------------- | --------------- |
| `/api/products`            | GET             | ✅ 91 productos |
| `/api/auth/register`       | POST            | ✅              |
| `/api/auth/login`          | POST            | ✅              |
| `/api/cart`                | GET/POST/DELETE | ✅              |
| `/api/wishlist`            | GET/POST        | ✅              |
| `/api/reviews/product/:id` | GET/POST        | ✅              |
| `/api/orders`              | GET/POST        | ✅              |

---

## [3.1.0] - 2025-11-25

### 🎉 Added - Oracle Cloud Free Tier Support

#### Infrastructure

- **Oracle Cloud Free Tier configuration** completa para deployment $0/mes
  - `docker-compose.free-tier.yml` - 9 servicios optimizados para 1GB RAM
  - VM.Standard.E2.1.Micro (1 OCPU, 1GB RAM, 200GB storage)

#### Documentation

- **FREE_TIER_DEPLOYMENT.md** - Guía completa de deployment
  - Creación de cuenta Oracle Cloud
  - Configuración de VM y firewall
  - Optimización para 1GB RAM
  - Monitoreo y mantenimiento

#### Automation Tools

- **monitor-free-tier.sh** - Monitoreo de recursos
- **quick-start-free-tier.sh** - Deployment automatizado

---

## [3.0.0] - 2025-11-24

### 🎉 Added - Microservices Architecture

#### Architecture

- **Migración a microservicios** completa
  - API Gateway como punto de entrada
  - 10+ servicios independientes
  - Comunicación inter-servicios via HTTP

#### Services

- **auth-service**: Autenticación JWT
- **user-service**: Gestión de usuarios
- **product-service**: Catálogo de productos
- **cart-service**: Carrito de compras
- **order-service**: Gestión de pedidos
- **review-service**: Reseñas de productos
- **wishlist-service**: Lista de deseos
- **contact-service**: Formularios de contacto
- **notification-service**: Notificaciones

#### DevOps

- Docker Compose para desarrollo local
- CI/CD con GitHub Actions
- Codecov para cobertura de tests

---

## [2.0.0] - 2025-10-15

### 🎉 Added - Backend Node.js

#### Backend

- **API REST** con Express.js
- **PostgreSQL** para datos relacionales
- **MongoDB** para productos y reseñas
- **Redis** para cache y sesiones

#### Features

- Sistema de autenticación completo
- CRUD de productos
- Carrito persistente
- Sistema de pedidos

---

## [1.0.0] - 2025-09-01

### 🎉 Initial Release

#### Frontend

- **HTML5/CSS3/JavaScript** vanilla
- Diseño responsive
- Catálogo de productos
- Carrito de compras (localStorage)

#### Features

- Página principal con productos destacados
- Catálogo por categorías
- Vista de producto individual
- Carrito de compras básico
- Formulario de contacto

---

## Convención de Versiones

- **MAJOR**: Cambios incompatibles de API
- **MINOR**: Funcionalidades nuevas compatibles
- **PATCH**: Correcciones de bugs

## Links

- [Repositorio](https://github.com/laloaggro/Flores-Victoria-)
- [Issues](https://github.com/laloaggro/Flores-Victoria-/issues)
- [Releases](https://github.com/laloaggro/Flores-Victoria-/releases)
