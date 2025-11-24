# 📖 Guía de Referencias Rápidas - Scripts Maestros

Esta guía proporciona ejemplos rápidos de uso para los scripts maestros consolidados.

## 🎯 Scripts Maestros Disponibles

### 1. services-manager.sh

**Ubicación:** `scripts/utilities/services-manager.sh`

**Descripción:** Gestión unificada de todos los servicios del proyecto (Docker, Frontend, Admin Panel).

#### Uso Básico

```bash
# Iniciar todos los servicios
./scripts/utilities/services-manager.sh start all

# Detener todos los servicios
./scripts/utilities/services-manager.sh stop all

# Reiniciar servicios
./scripts/utilities/services-manager.sh restart all

# Ver estado de servicios
./scripts/utilities/services-manager.sh status
```

#### Targets Disponibles

```bash
# Servicios core (BD, Redis, RabbitMQ)
./scripts/utilities/services-manager.sh start core

# Backend (microservicios)
./scripts/utilities/services-manager.sh start backend

# Frontend (Vite dev server)
./scripts/utilities/services-manager.sh start frontend

# Admin Panel
./scripts/utilities/services-manager.sh start admin

# Monitoreo (Prometheus, Grafana, Jaeger)
./scripts/utilities/services-manager.sh start monitoring
```

#### Ejemplos Comunes

```bash
# Desarrollo: Iniciar backend + frontend
./scripts/utilities/services-manager.sh start core
./scripts/utilities/services-manager.sh start backend
./scripts/utilities/services-manager.sh start frontend

# Producción: Todo
./scripts/utilities/services-manager.sh start all

# Debug: Reiniciar solo backend
./scripts/utilities/services-manager.sh restart backend
```

---

### 2. test-runner.sh

**Ubicación:** `scripts/utilities/test-runner.sh`

**Descripción:** Ejecución consolidada de tests con soporte para cobertura.

#### Uso Básico

```bash
# Ejecutar todos los tests
./scripts/utilities/test-runner.sh all

# Tests con cobertura
./scripts/utilities/test-runner.sh all yes

# Solo tests unitarios
./scripts/utilities/test-runner.sh unit

# Solo tests e2e
./scripts/utilities/test-runner.sh e2e
```

#### Modos Disponibles

```bash
# Todos los tests
./scripts/utilities/test-runner.sh all [coverage]

# Tests unitarios
./scripts/utilities/test-runner.sh unit [coverage]

# Tests end-to-end
./scripts/utilities/test-runner.sh e2e [coverage]

# Tests del frontend
./scripts/utilities/test-runner.sh frontend [coverage]

# Tests del backend
./scripts/utilities/test-runner.sh backend [coverage]

# Tests de microservicios
./scripts/utilities/test-runner.sh services [coverage]
```

#### Ejemplos Comunes

```bash
# CI/CD: Tests completos con cobertura
./scripts/utilities/test-runner.sh all yes

# Desarrollo: Tests rápidos sin cobertura
./scripts/utilities/test-runner.sh unit

# Pre-commit: Tests del componente modificado
./scripts/utilities/test-runner.sh frontend

# Debug: Tests específicos con cobertura
./scripts/utilities/test-runner.sh backend yes
```

---

### 3. verify-all.sh

**Ubicación:** `scripts/monitoring/verify-all.sh`

**Descripción:** Suite unificada de verificación del sistema.

#### Uso Básico

```bash
# Verificar todo el sistema
./scripts/monitoring/verify-all.sh all

# Verificar solo frontend
./scripts/monitoring/verify-all.sh frontend

# Verificar solo backend
./scripts/monitoring/verify-all.sh backend
```

#### Targets Disponibles

```bash
# Todo el sistema
./scripts/monitoring/verify-all.sh all

# Build del frontend
./scripts/monitoring/verify-all.sh frontend

# Microservicios backend
./scripts/monitoring/verify-all.sh backend

# Admin panel
./scripts/monitoring/verify-all.sh admin

# URLs y endpoints
./scripts/monitoring/verify-all.sh urls

# Archivos de configuración
./scripts/monitoring/verify-all.sh config

# Tests de integración
./scripts/monitoring/verify-all.sh integration
```

#### Ejemplos Comunes

```bash
# Pre-deploy: Verificar todo
./scripts/monitoring/verify-all.sh all

# Post-build: Verificar frontend
./scripts/monitoring/verify-all.sh frontend

# Health check: Verificar URLs
./scripts/monitoring/verify-all.sh urls

# Config check: Verificar configuración
./scripts/monitoring/verify-all.sh config

# Integration: Verificar comunicación entre servicios
./scripts/monitoring/verify-all.sh integration
```

---

## 🔄 Flujos de Trabajo Comunes

### Desarrollo Diario

```bash
# 1. Iniciar servicios necesarios
./scripts/utilities/services-manager.sh start core
./scripts/utilities/services-manager.sh start backend
./scripts/utilities/services-manager.sh start frontend

# 2. Trabajar en el código...

# 3. Ejecutar tests
./scripts/utilities/test-runner.sh unit

# 4. Al finalizar
./scripts/utilities/services-manager.sh stop all
```

### Pre-Commit

```bash
# 1. Ejecutar tests del componente modificado
./scripts/utilities/test-runner.sh frontend

# 2. Verificar el build
./scripts/monitoring/verify-all.sh frontend

# 3. Si todo OK, hacer commit
git add .
git commit -m "feat: nueva funcionalidad"
```

### Deploy a Producción

```bash
# 1. Ejecutar suite completa de tests
./scripts/utilities/test-runner.sh all yes

# 2. Verificar todo el sistema
./scripts/monitoring/verify-all.sh all

# 3. Si pasa todo, deploy
./scripts/deploy/deploy-oracle-cloud.sh

# 4. Post-deploy: verificar URLs
./scripts/monitoring/verify-all.sh urls
```

### Debug de Problemas

```bash
# 1. Ver estado de servicios
./scripts/utilities/services-manager.sh status

# 2. Verificar configuración
./scripts/monitoring/verify-all.sh config

# 3. Verificar integración
./scripts/monitoring/verify-all.sh integration

# 4. Reiniciar servicios problemáticos
./scripts/utilities/services-manager.sh restart backend
```

---

## 📝 Notas

- Todos los scripts tienen salida con colores para mejor legibilidad
- Los scripts maestros incluyen sistema de ayuda: agrega `--help` al comando
- Los logs se muestran en tiempo real cuando es apropiado
- Códigos de salida estándar: 0 = éxito, 1 = error

## 🔗 Referencias

- [services-manager.sh](../../scripts/utilities/services-manager.sh)
- [test-runner.sh](../../scripts/utilities/test-runner.sh)
- [verify-all.sh](../../scripts/monitoring/verify-all.sh)
- [DIRECTORY_STRUCTURE.md](../DIRECTORY_STRUCTURE.md)

---

**Última actualización:** 24 de noviembre de 2025
