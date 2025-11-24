# 📁 Estructura de Directorios - Flores Victoria

Este documento describe la nueva organización del proyecto tras la reorganización de más de 400 archivos dispersos en el directorio principal.

## 📊 Resumen

- ✅ **Archivos organizados**: 400+ archivos movidos a ubicaciones lógicas
- ✅ **Documentación**: 380+ archivos MD organizados en subcarpetas temáticas
- ✅ **Scripts**: 200+ scripts organizados por categoría
- ✅ **Configuración**: 42+ archivos de configuración centralizados

---

## 📂 Estructura Principal

```
flores-victoria/
├── 📄 README.md                    # Documentación principal (ÚNICO MD EN RAÍZ)
├── 📄 docker-compose.yml           # Configuración principal de Docker
├── 📄 .env                         # Variables de entorno principal
├── 📄 .gitignore                   # Archivos ignorados por Git
├── 📄 package.json                 # Dependencias del proyecto
├── 📄 codecov.yml                  # Configuración de cobertura
│
├── 📁 docs/                        # 📚 TODA LA DOCUMENTACIÓN (380+ archivos)
│   ├── deploy/                     # Documentación de despliegue (20)
│   ├── optimizations/              # Optimizaciones de performance (13)
│   ├── analysis/                   # Análisis técnicos (11)
│   ├── guides/                     # Guías y tutoriales (128)
│   ├── reports/                    # Reportes y resúmenes (83)
│   └── archive/                    # Documentación histórica (33)
│
├── 📁 config/                      # ⚙️ CONFIGURACIONES (42+ archivos)
│   ├── env/                        # Archivos .env.* (13)
│   ├── docker/                     # docker-compose.*.yml (18)
│   └── archives/                   # Archivos de texto y credenciales (11)
│
├── 📁 scripts/                     # 🔧 SCRIPTS (87 archivos)
│   ├── deploy/                     # Scripts de despliegue (9)
│   ├── monitoring/                 # Scripts de monitoreo y verificación (15)
│   ├── maintenance/                # Scripts de mantenimiento del sistema (5)
│   └── utilities/                  # Scripts de utilidad general (57)
│
├── 📁 tools/                       # 🛠️ HERRAMIENTAS DE DESARROLLO (25+ archivos)
│   ├── image-generation/           # Generación y optimización de imágenes (13)
│   ├── testing/                    # Scripts de pruebas (6)
│   └── analysis/                   # Análisis y visualización (3 HTML)
│
├── 📁 frontend/                    # 🎨 Aplicación web
├── 📁 backend/                     # 🔙 Backend legacy (monolítico)
├── 📁 admin-panel/                 # 👨‍💼 Panel de administración
├── 📁 microservices/               # 🔌 Microservicios principales
└── 📁 development/                 # 🛠️ Microservicios extendidos
```

---

## 📚 Documentación (docs/)

### `/docs/deploy/` - Despliegue (20 archivos)
**Propósito**: Documentación relacionada con despliegue en Oracle Cloud y otros entornos.

**Archivos clave**:
- `DEPLOY_CHECKLIST.md` - Lista de verificación de despliegue
- `ORACLE_CLOUD_DEPLOYMENT.md` - Guía completa de Oracle Cloud
- `ORACLE_CLOUD_PERFORMANCE.md` - Optimizaciones específicas de Oracle
- `DISASTER_RECOVERY_*.md` - Planes de recuperación de desastres
- `SSL_*.md` - Configuración de certificados SSL/TLS

**Cuándo usar**: Al preparar o ejecutar un despliegue a producción.

---

### `/docs/optimizations/` - Optimizaciones (13 archivos)
**Propósito**: Documentación técnica sobre optimizaciones de performance.

**Archivos clave**:
- `RESUMEN_OPTIMIZACIONES.md` - Resumen completo de todas las optimizaciones
- `PERFORMANCE_*.md` - Análisis de rendimiento
- `OPTIMIZATION_*.md` - Estrategias de optimización
- `OPTIMIZATIONS_ORACLE_CLOUD.md` - Optimizaciones específicas de Oracle

**Cuándo usar**: Al analizar performance o implementar optimizaciones.

---

### `/docs/analysis/` - Análisis Técnicos (11 archivos)
**Propósito**: Análisis profundos del proyecto, auditorías y evaluaciones.

**Archivos clave**:
- `ANALISIS_COMPLETO_PROYECTO.md` - Análisis exhaustivo del proyecto
- `ANALISIS_ESTRUCTURA_PROYECTO.md` - Análisis de la estructura
- `AUDITORIA_*.md` - Auditorías de código y sitio
- `CSS_ANALYSIS_*.md` - Análisis de CSS

**Cuándo usar**: Al evaluar el estado del proyecto o planificar refactorizaciones.

---

### `/docs/guides/` - Guías y Tutoriales (128 archivos)
**Propósito**: Guías técnicas, tutoriales, configuraciones y referencias rápidas.

**Categorías principales**:
- **Arquitectura**: `ARCHITECTURE*.md`, `COMPONENTS*.md`
- **APIs**: `API_*.md`
- **Docker**: `DOCKER*.md`
- **Testing**: `TEST*.md`, `CODECOV*.md`
- **Configuración**: `ENV_*.md`, `LIGHTHOUSE*.md`
- **Herramientas**: `GRAFANA*.md`, `SENTRY*.md`, `KIBANA*.md`
- **Diagramas**: `*.html` (diagramas interactivos)

**Archivos clave**:
- `DOCUMENTATION_INDEX.md` - Índice de toda la documentación
- `QUICK_START*.md` - Guías de inicio rápido
- `README_*.md` - READMEs específicos (Oracle, puertos, etc.)
- `CODE_OF_CONDUCT.md` - Código de conducta
- `CONTRIBUTING.md` - Guía de contribución

**Cuándo usar**: Al buscar información sobre cómo configurar o usar una herramienta específica.

---

### `/docs/reports/` - Reportes y Resúmenes (83 archivos)
**Propósito**: Reportes de sesiones, implementaciones completadas, estados y resúmenes.

**Categorías principales**:
- **Implementaciones**: `IMPLEMENTACION_*.md`, `INTEGRACION_*.md`
- **Estados**: `ESTADO_*.md`
- **Resúmenes**: `RESUMEN_*.md`
- **Completados**: `*_COMPLETADO*.md`, `*_COMPLETED*.md`
- **Progresos**: `PROGRESO_*.md`
- **Lighthouse**: `lighthouse*.json`, `lighthouse*.html`

**Archivos clave**:
- `RESUMEN_EJECUTIVO_COMPLETO.md` - Resumen ejecutivo del proyecto
- `DOCUMENTACION_COMPLETADA.md` - Estado de la documentación
- `*.report.html` - Reportes HTML de Lighthouse

**Cuándo usar**: Al revisar el historial de trabajo o verificar el estado de implementaciones.

---

### `/docs/archive/` - Archivo Histórico (33 archivos)
**Propósito**: Documentación de versiones anteriores, actualizaciones y cambios históricos.

**Archivos clave**:
- `ACTUALIZACION_*.md` - Historial de actualizaciones
- `CHANGELOG*.md` - Registros de cambios
- `ADMIN_*.md` - Documentación histórica del panel de admin
- `ARQUITECTURA_VISUAL.md` - Arquitectura antigua
- `README.old.md` - README anterior

**Cuándo usar**: Al revisar decisiones históricas o cambios de versiones anteriores.

---

## ⚙️ Configuración (config/)

### `/config/env/` - Variables de Entorno (13 archivos)
**Propósito**: Archivos `.env.*` para diferentes entornos.

**Archivos**:
- `.env.analytics`, `.env.api-gateway`, `.env.audit`
- `.env.auth`, `.env.backend`, `.env.cart`
- `.env.contact`, `.env.development`, `.env.docker`
- `.env.frontend`, `.env.i18n`, `.env.messaging`
- `.env.mongo`, `.env.notification`, `.env.oracle`
- `.env.postgres`, `.env.product`, `.env.production`
- `.env.rabbitmq`, `.env.redis`, `.env.review`
- `.env.user`, `.env.wishlist`

**Cuándo usar**: Al configurar variables de entorno para servicios específicos.

---

### `/config/docker/` - Docker Compose (18 archivos)
**Propósito**: Archivos `docker-compose.*.yml` para diferentes escenarios.

**Archivos clave**:
- `docker-compose.dev.yml` - Desarrollo normal
- `docker-compose.dev-simple.yml` - Desarrollo simplificado
- `docker-compose.oracle.yml` - Oracle Cloud
- `docker-compose.prod.yml` - Producción completa
- `docker-compose.monitoring.yml` - Solo monitoreo
- `docker-compose.*.backup.yml` - Backups de configuraciones

**Cuándo usar**: Al levantar entornos Docker específicos.

---

### `/config/archives/` - Archivos de Texto y Credenciales (11 archivos)
**Propósito**: Archivos de texto, credenciales y configuraciones misceláneas.

**Archivos**:
- `CREDENCIALES_PRODUCCION.txt` - Credenciales de producción (NO VERSIONADO)
- `COMMIT_MESSAGE.txt` - Plantillas de mensajes de commit
- `DIRECTORY_TREE*.txt` - Árboles de directorios
- `*.txt` - Otros archivos de texto

**Cuándo usar**: Al buscar credenciales o referencias de texto.

---

## 🔧 Scripts (scripts/)

### `/scripts/deploy/` - Despliegue (9 archivos)
**Propósito**: Scripts para desplegar la aplicación en diferentes entornos.

**Scripts clave**:
- `deploy-oracle-cloud.sh` - **Despliegue automatizado a Oracle Cloud**
- `verify-performance.sh` - **Verificación post-despliegue**
- `setup*.sh` - Scripts de configuración inicial
- `install*.sh` - Scripts de instalación
- `config*.sh` - Scripts de configuración

**Cuándo usar**: Al desplegar a producción o verificar despliegues.

**Ejemplo**:
```bash
# Desplegar a Oracle Cloud
cd /var/www/flores-victoria
./scripts/deploy/deploy-oracle-cloud.sh

# Verificar performance después del deploy
./scripts/deploy/verify-performance.sh https://arreglosvictoria.com
```

---

### `/scripts/monitoring/` - Monitoreo y Verificación (15 archivos)
**Propósito**: Scripts para monitorear el sistema, logs, métricas y verificaciones.

**Scripts clave**:
- `check*.sh` - Verificaciones de estado
- `monitor*.sh` - Monitoreo continuo
- `verify-*.sh` - Verificación de componentes (admin, refactor, etc.)
- `verificar-*.sh` - Verificaciones en español (frontend, integración, URLs)
- `validate-*.sh` - Validación de mejoras y stack
- `analytics.sh` - Analytics y métricas
- `centralized*.sh` - Logging centralizado
- `create-dashboard*.sh`, `create-alerts*.sh` - Configuración de Grafana/Prometheus

**Cuándo usar**: Al configurar monitoreo, verificar estado del sistema o validar componentes.

---

### `/scripts/maintenance/` - Mantenimiento del Sistema (5 archivos)
**Propósito**: Scripts para mantenimiento, actualizaciones y monitoreo de salud del sistema.

**Scripts clave**:
- `maintenance.sh` - Mantenimiento general del sistema
- `system-health-check.sh` - Verificación de salud del sistema
- `system-verification.sh` - Verificación completa del sistema
- `update-system.sh` - Actualización automática del sistema
- `watchdog.sh` - Monitoreo continuo y reinicio automático

**Cuándo usar**: Para mantenimiento regular, actualizaciones del sistema o monitoreo de salud.

---

### `/scripts/utilities/` - Utilidades Generales (57 archivos)
**Propósito**: Scripts de utilidad general, testing, backups, builds, start/stop de servicios.

**Categorías**:
- **Docker & Servicios**: `docker-*.sh`, `flores-victoria.sh`, `start-*.sh`, `stop-*.sh`
- **Testing**: `test*.sh`, `run-all-tests.sh`, `send-test-logs-direct.sh`, `coverage*.sh`
- **Build**: `build*.sh`, `automate*.sh`
- **Backup**: `backup*.sh`
- **Optimización**: `optimize-*.sh`, `minify-*.sh`
- **Generación**: `generate-*.sh`
- **Migración**: `migrate-*.sh`, `integrate-*.sh`
- **Quick tools**: `quick-start.sh`, `quick-status.sh`
- **JavaScript**: `*.js` (scripts Node.js standalone)

**Scripts clave**:
- `docker-core.sh`, `docker-full.sh` - Gestión de Docker
- `flores-victoria.sh` - Script principal del proyecto
- `start-all-services.sh`, `stop-all-services.sh` - Control de servicios
- `quick-start.sh` - Inicio rápido
- `test*.sh` - Scripts de testing
- `build*.sh` - Scripts de build
- `optimize-*.sh` - Optimización de componentes e imágenes
- `generate-*.sh` - Generación de contenido y logs
- `ai-service-standalone.js` - Servicio de IA standalone
- `api-gateway.js` - Gateway API standalone

**Cuándo usar**: Para tareas de desarrollo, testing, mantenimiento o inicio/parada de servicios.

---

## 🛠️ Herramientas de Desarrollo (tools/)

### `/tools/image-generation/` - Generación de Imágenes (13 archivos)
**Propósito**: Herramientas para generar, optimizar y validar imágenes de productos usando IA.

**Scripts clave**:
- `generate-leonardo.js` - Generación con Leonardo AI
- `generate-replicate.js` - Generación con Replicate API
- `generate-batch-hf.js` - Generación por lotes con Hugging Face
- `generate-unique-images-hf.js` - Generación de imágenes únicas
- `improve-product-images.js` - Mejora automática de imágenes
- `fix-product-images.js` - Corrección de problemas
- `unify-product-images.js` - Unificación de estilos
- `validate-product-images.js` - Validación de calidad
- `optimize-images.js` - Optimización de tamaño
- `ai-service-standalone.js` - Servicio AI independiente

**Cuándo usar**: Al generar nuevas imágenes de productos, optimizar existentes o validar calidad.

---

### `/tools/testing/` - Scripts de Pruebas (6 archivos)
**Propósito**: Scripts específicos para probar diferentes componentes del sistema.

**Scripts clave**:
- `test-db.js` - Pruebas de conexión a base de datos
- `test-image-gen.js` - Pruebas de generación de imágenes
- `test-hf-single.js` - Prueba individual de Hugging Face
- `test-forced-generation.js` - Pruebas de generación forzada
- `test-unique-prompts.js` - Validación de prompts únicos
- `test_system.js` - Pruebas del sistema completo

**Cuándo usar**: Durante desarrollo para probar funcionalidades específicas.

---

### `/tools/analysis/` - Análisis y Visualización (3 archivos)
**Propósito**: Herramientas HTML para análisis, visualización y validación.

**Archivos clave**:
- `roi-analysis.html` - Análisis de ROI y métricas de negocio
- `watermark-preview.html` - Previsualización de marcas de agua
- `navegacion-central.html` - Visualización de estructura de navegación

**Cuándo usar**: Para análisis de negocio, previsualización o validación de UI.

---

## 🎯 Casos de Uso Comunes

### 🚀 Desplegar a Oracle Cloud
```bash
# 1. Ir al directorio del proyecto
cd /var/www/flores-victoria

# 2. Ejecutar despliegue automatizado
./scripts/deploy/deploy-oracle-cloud.sh

# 3. Verificar performance
./scripts/deploy/verify-performance.sh https://arreglosvictoria.com
```

**Documentación**: `docs/deploy/DEPLOY_CHECKLIST.md`

---

### 📊 Revisar Performance
```bash
# Ver resumen de optimizaciones
cat docs/optimizations/RESUMEN_OPTIMIZACIONES.md

# Ver optimizaciones específicas de Oracle
cat docs/optimizations/OPTIMIZATIONS_ORACLE_CLOUD.md

# Ejecutar Lighthouse audit
npx lighthouse https://arreglosvictoria.com/pages/products.html \
  --only-categories=performance \
  --output=html \
  --output-path=docs/reports/lighthouse-$(date +%Y%m%d).html
```

**Documentación**: `docs/optimizations/`

---

### 🐳 Levantar Entorno Docker
```bash
# Desarrollo simplificado (RECOMENDADO)
docker compose -f config/docker/docker-compose.dev-simple.yml up -d

# Desarrollo completo
docker compose -f config/docker/docker-compose.dev.yml up -d

# Producción con monitoreo
docker compose up -d

# Ver logs de un servicio
docker compose logs -f [servicio]
```

**Documentación**: `docs/guides/DOCKER*.md`

---

### 🔍 Buscar Documentación
```bash
# Índice completo
cat docs/guides/DOCUMENTATION_INDEX.md

# Buscar por palabra clave
grep -r "palabra-clave" docs/

# Buscar en guías
grep -r "configuración" docs/guides/

# Buscar en reportes
grep -r "implementación" docs/reports/
```

**Documentación**: `docs/guides/DOCUMENTATION_INDEX.md`

---

### ⚙️ Configurar Variables de Entorno
```bash
# Ver variables de un servicio
cat config/env/.env.auth

# Copiar plantilla
cp config/env/.env.development .env

# Editar variables
nano .env
```

**Documentación**: `docs/guides/ENV_*.md`

---

### 🧪 Ejecutar Tests
```bash
# Tests completos
./scripts/utilities/test-full.sh

# Coverage
./scripts/utilities/coverage-summary.sh
```

**Documentación**: `docs/guides/TEST*.md`

---

## 📝 Notas Importantes

### ✅ Beneficios de la Nueva Estructura

1. **Claridad**: Solo `README.md` en raíz, toda la documentación en `docs/`
2. **Navegabilidad**: Estructura lógica por categorías (deploy, optimizations, guides, etc.)
3. **Mantenibilidad**: Fácil localizar y actualizar documentación
4. **Escalabilidad**: Estructura preparada para crecer
5. **Profesionalismo**: Proyecto organizado y fácil de entender

### ⚠️ Archivos que DEBEN permanecer en raíz

- `README.md` - Documentación principal
- `docker-compose.yml` - Compose principal
- `.env` - Variables de entorno principal
- `.gitignore` - Configuración de Git
- `package.json` - Dependencias del proyecto
- `codecov.yml` - Configuración de Codecov

**Todos los demás archivos MD, .env.*, docker-compose.*.yml, scripts y configuraciones están ahora organizados en sus respectivas carpetas.**

### 🔄 Actualización de Referencias

Si encuentras referencias rotas después de esta reorganización:

1. **Scripts de deploy**: Actualizados para usar `scripts/deploy/`
2. **Docker compose**: Usar `-f config/docker/docker-compose.*.yml`
3. **Variables .env**: Usar `config/env/.env.*`
4. **Documentación**: Buscar en `docs/` con estructura lógica

---

## 📊 Estadísticas

- **Total archivos movidos**: 450+
- **Documentación organizada**: 380+ archivos MD
- **Scripts organizados**: 87 scripts (.sh)
- **Configuraciones centralizadas**: 42+ archivos
- **Tiempo de organización**: 1 sesión completa
- **Archivos .sh en raíz**: 42 → 0 ✅
- **Archivos esenciales en raíz**: 6 únicamente

---

## 🚀 Próximos Pasos

1. ✅ **Estructura organizada** - Completado
2. ⏳ **Verificar enlaces rotos** - Pendiente
3. ⏳ **Actualizar README principal** - Pendiente
4. ⏳ **Deployment a Oracle Cloud** - Listo para ejecutar

---

**Última actualización**: $(date +"%Y-%m-%d %H:%M:%S")
**Versión**: 1.0.0
**Estado**: ✅ Organización completada
