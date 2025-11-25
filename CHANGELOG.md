# Changelog - Flores Victoria

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [3.1.0] - 2025-11-25

### 🎉 Added - Oracle Cloud Free Tier Support

#### Infrastructure
- **Oracle Cloud Free Tier configuration** complete para deployment $0/mes
  - `docker-compose.free-tier.yml` - 9 servicios optimizados para 1GB RAM
  - VM.Standard.E2.1.Micro (1 OCPU, 1GB RAM, 200GB storage)
  - Total memory usage: ~950MB / 1024MB available

#### Documentation
- **FREE_TIER_DEPLOYMENT.md** - Guía completa de 700+ líneas
  - Parte 1: Crear cuenta Oracle Cloud
  - Parte 2: Crear VM instance
  - Parte 3: Configurar firewall (Security Lists)
  - Parte 4: Conectar via SSH y preparar VM
  - Parte 5: Optimizar para 1GB RAM (swap, swappiness)
  - Parte 6: Deploy de aplicación
  - Parte 7: Monitoreo y mantenimiento
  - Parte 8: Troubleshooting guide

#### Automation Tools
- **monitor-free-tier.sh** - Resource monitoring tool
  - Real-time RAM/CPU/Disk tracking
  - Docker container stats (top 5 by memory)
  - Configurable alerts (memory >85%, CPU >80%, disk >80%)
  - Continuous mode with color-coded output
  
- **quick-start-free-tier.sh** - Automated 5-minute deployment
  - 7-step deployment process
  - Prerequisite validation (Docker, memory, swap)
  - Interactive .env configuration
  - Pre-deploy validation execution
  - Post-deploy verification

#### Configuration
- **.env.free-tier.example** - Environment variables optimized for 1GB RAM
  - PostgreSQL: max_connections=20, shared_buffers=32MB
  - MongoDB: cache_size=0.1GB, oplog_size=50MB
  - Redis: maxmemory=50mb, no persistence (cache only)
  - Connection pools: max 5 (reduced from 10)
  - Cache TTL extended (up to 1 hour)
  - Log level: warn (reduced from info)
  - Workers: 1 per service
  - Features disabled: wishlist, reviews, analytics, notifications

#### Services Optimized
- **PostgreSQL (Alpine)**: 128MB RAM limit
- **MongoDB (Jammy)**: 150MB RAM limit
- **Redis (Alpine)**: 64MB RAM limit, no persistence
- **API Gateway**: 128MB RAM limit
- **Auth Service**: 96MB RAM limit
- **Product Service**: 96MB RAM limit
- **User Service**: 80MB RAM limit
- **Order Service**: 80MB RAM limit
- **Cart Service**: 64MB RAM limit
- **Nginx Frontend**: 64MB RAM limit

#### Performance Optimizations
- Healthcheck intervals: 30s (increased from 15s)
- Logging reduced: 5MB max files, 2 files retention
- Aggressive memory limits with OOM kill protection
- Restart policies: unless-stopped for all services

### 📝 Changed

#### Documentation Updates
- **README.md** - Actualizado con sección Oracle Cloud Free Tier
  - Nueva badge Oracle Cloud Free Tier
  - Sección "Elige tu Entorno" con comparación dev/free-tier/production
  - Enlaces a guía FREE_TIER_DEPLOYMENT.md
  - Versión actualizada a 3.1.0

- **environments/production/README.md** - Actualizado
  - Tabla comparativa Free Tier vs Producción Completa
  - Links a docker-compose.free-tier.yml
  - Documentación de scripts (monitor-free-tier.sh, validate-pre-deploy.sh)
  - Guía de uso de herramientas de monitoreo

### 🔧 Fixed
- Ningún bug fix en esta versión (feature release)

### 🚀 Infrastructure
- **Oracle Cloud VCN**: vcn-flores-victoria (10.0.0.0/16)
- **Oracle Cloud Subnet**: subnet-20251125-1626 (10.0.0.0/24, Public)
- **VM Configuration**: flores-victoria-free (ready to create)

### 📊 Metrics
- **New Files**: 5 (1,679 lines of code/documentation)
- **Modified Files**: 2 (README.md updates)
- **Total Changes**: +1,731 insertions, -2 deletions

---

## [3.0.0] - 2025-11-24

### 🎉 Major Release - Environments Reorganization

#### Infrastructure Overhaul
- **Complete environments restructuring**
  - `/environments/development/` - Desarrollo local
  - `/environments/production/` - Producción hardened
  - `/environments/shared/` - Componentes compartidos

#### Production Readiness
- `docker-compose.production.yml` - 35 microservicios configurados
- `generate-production-secrets.sh` - Generador de secretos seguros
- `backup-production.sh` - Sistema de backups automáticos
- `CHECKLIST_DEPLOY_ORACLE_CLOUD.md` - Guía de deployment

#### Security Enhancements
- Resource limits configurados en todos los servicios
- Puertos cerrados (solo Nginx expuesto)
- Healthchecks habilitados
- Logging rotativo
- Restart policies: unless-stopped

#### Documentation
- **ORACLE_CLOUD_SETUP_GUIDE.md** - Guía de configuración completa
- **ORACLE_CLOUD_DEPLOY_CHECKLIST.md** - Checklist de deployment
- **environments/README.md** - Documentación de estructura

### 📝 Changed
- Estructura de directorios completamente reorganizada
- Docker Compose files consolidados por entorno
- Configuraciones separadas por entorno (dev/prod)

---

## [2.0.0] - 2025-11-10

### 🎉 Added

#### Code Quality & Tooling
- **Pre-commit hooks** con Husky + lint-staged
  - Auto-formatting con Prettier
  - Linting con ESLint 8
  - Tests automáticos antes de commit

#### Optimization
- **node_modules optimization** - Reducción 26%
- **Modern JavaScript loops** - Migración for...of
- **ESLint configuration** - 72% reducción de errores

#### Accessibility
- **WCAG AA compliance** - 95%+ coverage
  - Navegación por teclado
  - ARIA labels completos
  - Alto contraste
  - Textos alternativos

#### PWA Features
- **Service Worker ES2020+**
- **Offline capability**
- **Cache strategies**

### 📊 Metrics
- **Test Suite**: 765 tests passing (93%)
- **Code Coverage**: 40.96%
- **Code Quality**: 9.2/10
- **Documentation**: 120+ guides

---

## [1.0.0] - 2025-10-01

### 🎉 Initial Release

#### Core Features
- **Microservices Architecture**: 11 servicios independientes
- **AI-Powered**: Generación de imágenes (HuggingFace, Leonardo, Replicate)
- **Containerized**: Docker + Kubernetes ready
- **Observability**: Grafana, Prometheus, ELK Stack, Jaeger
- **Testing**: Jest, Playwright, Percy visual regression

#### Services
- API Gateway
- Auth Service
- User Service
- Product Service
- Order Service
- Cart Service
- Wishlist Service
- Review Service
- Contact Service
- Notification Service

#### Databases
- PostgreSQL 16
- MongoDB 7.0
- Redis 6

#### Security
- JWT authentication
- Rate limiting with Redis
- Joi validation
- Trivy scanning
- CORS and Helmet configured

#### CI/CD
- 20+ GitHub Actions workflows
- Automated testing
- Automated builds
- Automated deployments

---

## Version History

- **3.1.0** (2025-11-25) - Oracle Cloud Free Tier support
- **3.0.0** (2025-11-24) - Environments reorganization
- **2.0.0** (2025-11-10) - Code quality & PWA
- **1.0.0** (2025-10-01) - Initial release

---

**Formato**: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)  
**Versionado**: [Semantic Versioning](https://semver.org/spec/v2.0.0.html)  
**Proyecto**: [Flores Victoria](https://github.com/laloaggro/Flores-Victoria-)
