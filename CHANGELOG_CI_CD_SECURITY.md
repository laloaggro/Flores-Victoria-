# Changelog - Actualización CI/CD, Seguridad y DevOps

**Fecha**: 11 de noviembre de 2025  
**Versión**: 4.0.0

## 🎯 Resumen Ejecutivo

Actualización major del stack tecnológico, pipelines CI/CD y seguridad para establecer consistencia entre entornos y preparar el proyecto para producción enterprise.

## ✨ Mejoras Principales

### 🚀 CI/CD Enhancements

#### Nuevos Workflows
- **E2E Testing con Playwright** (`.github/workflows/e2e-playwright.yml`)
  - Levanta stack dev completo con Docker Compose
  - Espera frontend (5173) y API Gateway (3000/health)
  - Ejecuta tests E2E en múltiples navegadores
  - Sube reportes HTML y resultados crudos
  - Captura logs de Docker en caso de fallo
  - Concurrency control para evitar runs paralelos
  - Teardown automático del stack

- **Node Version Matrix** (`.github/workflows/ci-matrix.yml`)
  - Tests en Node 18, 20 y 22
  - Servicios de DB completos (Postgres 16, Mongo 7, Redis 7)
  - Coverage por versión de Node
  - Permite detectar incompatibilidades tempranas

- **Container Image Scanning** (`.github/workflows/container-scan.yml`)
  - Escaneo Trivy de 12 servicios:
    - api-gateway, auth-service, product-service, user-service
    - order-service, cart-service, wishlist-service, review-service
    - contact-service, promotion-service, frontend, admin-panel
  - Detección de vulnerabilidades CRITICAL y HIGH
  - Reportes JSON por servicio
  - Ejecución semanal automática + en PRs

- **SBOM Generation** (`.github/workflows/sbom.yml`)
  - Generación de Software Bill of Materials (SPDX)
  - Usando Anchore Syft
  - Traceabilidad de dependencias para compliance

#### Deploy Real Implementado
- **Staging deploy** (`deploy.yml`)
  - Netlify CLI integration
  - Deploy automático a staging en push a main
  - Health checks post-deploy
  - Variables desde GitHub Secrets

- **Production deploy** (`deploy.yml`)
  - Deploy con flag `--prod`
  - Health checks con timeouts
  - Notificaciones de éxito/fallo

### 🏗️ Infraestructura

#### Standardización Node.js 22
**Archivos modificados**: 11 Dockerfiles
- `microservices/api-gateway/Dockerfile`: 18-alpine → 22-alpine
- `microservices/auth-service/Dockerfile`: 18 → 22-alpine
- `microservices/product-service/Dockerfile`: 18 → 22-alpine
- `microservices/user-service/Dockerfile`: 18 → 22-alpine
- `microservices/order-service/Dockerfile`: 16-alpine → 22-alpine
- `microservices/cart-service/Dockerfile`: 16-alpine → 22-alpine
- `microservices/wishlist-service/Dockerfile`: 16-alpine → 22-alpine
- `microservices/review-service/Dockerfile`: 18-alpine → 22-alpine
- `microservices/contact-service/Dockerfile`: 16-alpine → 22-alpine
- `frontend/Dockerfile`: 16-alpine → 22-alpine
- `admin-panel/Dockerfile`: 16-alpine → 22-alpine

**Workflows actualizados**: 4 archivos
- `.github/workflows/ci.yml`: Node 20 → 22
- `.github/workflows/deploy.yml`: Node 20 → 22
- `.github/workflows/security.yml`: Node 20 → 22
- `.github/workflows/e2e-playwright.yml`: Node 20 → 22

#### Actualización de Bases de Datos
**Docker Compose modificados**: 2 archivos
- `docker-compose.yml`:
  - postgres:13 → postgres:16-alpine
  - mongo:4.4 → mongo:7.0
- `docker-compose.prod.yml`:
  - postgres:13 → postgres:16-alpine
  - mongo:4.4 → mongo:7.0

### 🔐 Seguridad

#### Gestión de Secretos Mejorada
**Archivo extendido**: `docker-compose.secrets.yml`

Nuevos secretos agregados:
- `mongo_password` - Contraseña de MongoDB
- `jwt_secret` - Secret para tokens JWT
- `email_password` - Contraseña SMTP
- `stripe_secret` - Stripe Secret Key
- `paypal_secret` - PayPal Client Secret
- `transbank_secret` - Transbank Secret Key

**Script helper creado**: `scripts/setup-secrets.sh`
- Generación automática de secretos seguros (openssl)
- Modo interactivo para secretos externos
- Validación de longitud mínima
- Permisos restrictivos (700/600)
- `.gitignore` automático
- README de documentación

Servicios configurados para usar secretos:
- postgres, mongodb
- auth-service, api-gateway (JWT)
- contact-service (SMTP)
- payment-service (Stripe, PayPal, Transbank)

### 📦 Configuración

#### Netlify Unificado
**Cambio**: Eliminado `netlify.toml` raíz, consolidado en `frontend/netlify.toml`

Estrategia de caché unificada:
- HTML: `max-age=3600, must-revalidate` (balance performance/frescura)
- Assets/JS/CSS: `max-age=31536000, immutable` (1 año)
- Imágenes/Fonts/Icons: `max-age=31536000, immutable`
- robots.txt/sitemap.xml: `max-age=86400` (1 día)
- SPA fallback reactivado
- Headers de seguridad completos

## 📋 Archivos Nuevos

1. `.github/workflows/e2e-playwright.yml` - Tests E2E automatizados
2. `.github/workflows/ci-matrix.yml` - Matrix de versiones Node
3. `.github/workflows/container-scan.yml` - Escaneo de imágenes
4. `.github/workflows/sbom.yml` - Generación de SBOM
5. `scripts/setup-secrets.sh` - Helper de secretos
6. `MIGRATION_GUIDE_NODE22.md` - Guía de migración
7. `CI_CD_SECURITY_REPORT_2025-11-11.md` - Reporte de auditoría
8. `CHANGELOG_CI_CD_SECURITY.md` - Este archivo

## 📋 Archivos Modificados

### Docker
- 11 Dockerfiles (todos los microservicios + frontend + admin)
- 2 docker-compose files (base + prod)
- 1 docker-compose.secrets.yml (extendido)

### CI/CD
- `.github/workflows/ci.yml` (Node 22, Postgres 16, Mongo 7)
- `.github/workflows/deploy.yml` (Netlify CLI real)
- `.github/workflows/security.yml` (Node 22)
- `.github/workflows/e2e-playwright.yml` (mejorado)

### Configuración
- `frontend/netlify.toml` (unificado y corregido)
- ~~`netlify.toml`~~ (eliminado - duplicado)

## 🔄 Migración Requerida

### Para Desarrolladores
```bash
# 1. Actualizar Node local
nvm install 22 && nvm use 22

# 2. Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install

# 3. Recrear contenedores
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d

# 4. Verificar
npm test
```

### Para CI/CD
✅ **No se requiere acción** - Automático en próximo push

### Para Producción
Ver `MIGRATION_GUIDE_NODE22.md` para plan detallado.

**Acción requerida antes de merge**:
1. Crear GitHub Secrets:
   - `NETLIFY_AUTH_TOKEN`
   - `NETLIFY_SITE_ID` (producción)
   - `NETLIFY_STAGING_SITE_ID` (staging)
   - `CODECOV_TOKEN` (si aún no existe)

## 📊 Métricas de Mejora

| Aspecto | Antes | Ahora | Mejora |
|---------|-------|-------|--------|
| **Node versions** | 3 versiones (16/18/20) | 1 versión (22) | ✅ 100% consistente |
| **DB versions** | Inconsistentes (CI vs Prod) | Consistentes (16/7) | ✅ Mismo entorno |
| **Trivy scanning** | 1 servicio | 12 servicios | ✅ +1100% cobertura |
| **Secrets management** | 1 secreto (postgres) | 7 secretos | ✅ +600% cobertura |
| **E2E en CI** | ❌ No | ✅ Sí (Playwright) | ✅ Tests automatizados |
| **Deploy real** | ❌ Placeholder | ✅ Netlify CLI | ✅ Entrega continua |
| **SBOM** | ❌ No | ✅ Sí (SPDX) | ✅ Compliance |

## 🚨 Breaking Changes

### Node.js 22
- Algunas APIs deprecadas en versiones anteriores ya no están disponibles
- Bcrypt necesita rebuild: `npm rebuild bcrypt`
- Fetch API ahora es nativa (puede causar conflictos con node-fetch)

### PostgreSQL 16
- Método de autenticación `md5` deprecado
- Usar `scram-sha-256` en configuraciones de conexión

### MongoDB 7.0
- Algunos operadores de agregación cambiaron sintaxis
- Mejor performance en queries complejos

Ver `MIGRATION_GUIDE_NODE22.md` para detalles completos.

## ✅ Testing

Todos los cambios fueron validados:
- ✅ Sintaxis de workflows (GitHub Actions validator)
- ✅ Dockerfiles construyen sin errores
- ✅ docker-compose syntax válida
- ✅ Scripts ejecutables con permisos correctos
- ⏳ Pendiente: Ejecución real en CI (próximo push)

## 📚 Documentación Agregada

1. **MIGRATION_GUIDE_NODE22.md**
   - Guía paso a paso de migración
   - Breaking changes detallados
   - Rollback procedures
   - Checklist de verificación

2. **CI_CD_SECURITY_REPORT_2025-11-11.md**
   - Auditoría completa del estado actual
   - Hallazgos y riesgos
   - Quick wins identificados
   - Plan de acción 2-4 semanas

## 🎯 Próximos Pasos Recomendados

### Corto Plazo (1-2 semanas)
1. Monitorear CI/CD después del merge
2. Ejecutar `scripts/setup-secrets.sh` en producción
3. Configurar GitHub Secrets de Netlify
4. Verificar que E2E tests pasan consistentemente

### Mediano Plazo (2-4 semanas)
1. Subir cobertura de tests de 23% a 35%+
2. Corregir tests ignorados en `jest.config.js`
3. Añadir Percy visual testing
4. Implementar circuit breakers en API Gateway

### Largo Plazo (1-3 meses)
1. Instrumentación completa de Jaeger tracing
2. Dashboards de Grafana configurados
3. Alertas de Prometheus activas
4. Cobertura de tests ≥60%

## 🙏 Créditos

**Implementado por**: Eduardo Garay (@laloaggro)  
**Fecha**: 11 de noviembre de 2025  
**Scope**: CI/CD, Seguridad, DevOps, Infraestructura

---

Para más detalles técnicos, ver:
- `MIGRATION_GUIDE_NODE22.md` - Guía de migración
- `CI_CD_SECURITY_REPORT_2025-11-11.md` - Auditoría completa
- `ARCHITECTURE.md` - Arquitectura del sistema
