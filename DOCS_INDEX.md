# 📚 Índice de Documentación - Flores Victoria

> Guía rápida para navegar toda la documentación del proyecto

## 🚀 Inicio Rápido

- **[README.md](./README.md)** - Documentación principal del proyecto
- **[DIRECTORY_STRUCTURE.md](./DIRECTORY_STRUCTURE.md)** - Mapa completo de la estructura

## ⭐ Documentación Reciente (Nueva)

- **[MIGRATION_GUIDE.md](docs/guides/MIGRATION_GUIDE.md)** - Guía de migración para actualizar referencias
- **[SCRIPTS_QUICK_REFERENCE.md](docs/guides/SCRIPTS_QUICK_REFERENCE.md)** - Referencia rápida de scripts maestros
- **[POST_REORGANIZATION_CHECKLIST.md](docs/guides/POST_REORGANIZATION_CHECKLIST.md)** - Checklist de verificación completo
- **[tools/README.md](tools/README.md)** - Documentación de herramientas de desarrollo

## 📁 Documentación por Categoría

### 🚢 Deploy y Producción
**Ubicación**: `docs/deploy/` (20 archivos)

Archivos principales:
- **[DEPLOY_CHECKLIST.md](./docs/deploy/DEPLOY_CHECKLIST.md)** - Lista de verificación completa
- **[ORACLE_CLOUD_DEPLOYMENT.md](./docs/deploy/ORACLE_CLOUD_DEPLOYMENT.md)** - Guía completa Oracle Cloud
- **[ORACLE_CLOUD_PERFORMANCE.md](./docs/deploy/ORACLE_CLOUD_PERFORMANCE.md)** - Optimizaciones específicas

### ⚡ Optimizaciones de Performance
**Ubicación**: `docs/optimizations/` (13 archivos)

Archivo principal:
- **[RESUMEN_OPTIMIZACIONES.md](./docs/optimizations/RESUMEN_OPTIMIZACIONES.md)** - Resumen completo de todas las optimizaciones

### 📊 Análisis y Auditorías
**Ubicación**: `docs/analysis/` (11 archivos)

Archivo principal:
- **[ANALISIS_COMPLETO_PROYECTO.md](./docs/analysis/ANALISIS_COMPLETO_PROYECTO.md)** - Análisis exhaustivo del proyecto

### 📖 Guías y Tutoriales
**Ubicación**: `docs/guides/` (128 archivos)

Archivos principales:
- **[ARCHITECTURE.md](./docs/guides/ARCHITECTURE.md)** - Arquitectura del sistema
- **[API_REFERENCE.md](./docs/guides/API_REFERENCE.md)** - Referencia completa de APIs
- **[DOCUMENTATION_INDEX.md](./docs/guides/DOCUMENTATION_INDEX.md)** - Índice detallado de guías
- **[TESTING_GUIDE.md](./docs/guides/TESTING_GUIDE.md)** - Guía completa de testing

### 📋 Reportes y Estado
**Ubicación**: `docs/reports/` (83 archivos)

Archivos principales:
- **[RESUMEN_EJECUTIVO_COMPLETO.md](./docs/reports/RESUMEN_EJECUTIVO_COMPLETO.md)** - Resumen ejecutivo del proyecto
- **[DOCUMENTACION_COMPLETADA.md](./docs/reports/DOCUMENTACION_COMPLETADA.md)** - Estado de la documentación

### 🗄️ Archivo Histórico
**Ubicación**: `docs/archive/` (33+ archivos)

Contiene versiones anteriores y documentación histórica.

## 🔧 Scripts

### Deploy
- `scripts/deploy-oracle-cloud.sh` - Deploy automatizado a Oracle Cloud
- `scripts/deploy/deploy-oracle.sh` - Deploy alternativo

### Monitoreo
- `scripts/verify-performance.sh` - Verificación de performance
- `scripts/monitoring/` - Scripts de verificación (15)

### Mantenimiento
- `scripts/maintenance/` - Scripts de mantenimiento (5)

### Utilidades
- `scripts/utilities/` - Scripts de utilidad general (57)

## ⚙️ Configuración

### Variables de Entorno
**Ubicación**: `config/env/` (13 archivos)

### Docker Compose
**Ubicación**: `config/docker/` (18 archivos)

## 🎯 Casos de Uso Comunes

### Quiero desplegar a producción
1. Lee: `docs/deploy/DEPLOY_CHECKLIST.md`
2. Sigue: `docs/deploy/ORACLE_CLOUD_DEPLOYMENT.md`
3. Ejecuta: `./scripts/deploy-oracle-cloud.sh`

### Quiero optimizar performance
1. Lee: `docs/optimizations/RESUMEN_OPTIMIZACIONES.md`
2. Lee: `docs/deploy/ORACLE_CLOUD_PERFORMANCE.md`

### Quiero entender la arquitectura
1. Lee: `docs/guides/ARCHITECTURE.md`
2. Lee: `docs/analysis/ANALISIS_COMPLETO_PROYECTO.md`

### Quiero configurar el entorno
1. Lee: `docs/guides/ENV_CONFIGURATION.md`
2. Copia: `config/env/.env.development`

### Quiero ejecutar tests
1. Lee: `docs/guides/TESTING_GUIDE.md`
2. Ejecuta: `./scripts/utilities/test-full.sh`

## 📊 Estadísticas

- **Total documentos**: 380+ archivos
- **Guías**: 128 archivos
- **Reportes**: 83 archivos
- **Scripts**: 87 archivos
- **Configuraciones**: 42+ archivos

## 🔗 Enlaces Rápidos

- [GitHub Repository](https://github.com/laloaggro/Flores-Victoria-)
- [Issues](https://github.com/laloaggro/Flores-Victoria-/issues)
- [Pull Requests](https://github.com/laloaggro/Flores-Victoria-/pulls)

---

**Última actualización**: $(date +"%Y-%m-%d")
**Versión**: 1.0.0
