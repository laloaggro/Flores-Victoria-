# Scripts de Gestión del Sitio Web - Flores Victoria

Este directorio contiene todos los scripts necesarios para gestionar el sitio web de Flores
Victoria, incluyendo el panel de administración, frontend, servicios backend y operaciones de
Docker.

## 📋 Tabla de Contenidos

- [Scripts del Panel de Administración](#scripts-del-panel-de-administración)
- [Script Maestro de Gestión Web](#script-maestro-de-gestión-web)
- [Otros Scripts Disponibles](#otros-scripts-disponibles)
- [Uso Rápido](#uso-rápido)

---

## 🎯 Scripts del Panel de Administración

### `admin-start.sh`

Inicia el panel de administración en modo desarrollo o producción.

```bash
# Modo desarrollo (por defecto)
./scripts/admin-start.sh

# Modo desarrollo (explícito)
./scripts/admin-start.sh dev

# Modo producción
./scripts/admin-start.sh prod
```

**Puerto:** 3010  
**URL:** http://localhost:3010

---

### `admin-stop.sh`

Detiene el panel de administración y limpia procesos relacionados.

```bash
./scripts/admin-stop.sh
```

Detiene:

- Proceso en puerto 3010
- Procesos nodemon relacionados con admin-panel
- Limpia recursos

---

### `admin-restart.sh`

Reinicia el panel de administración.

```bash
# Reiniciar en modo desarrollo
./scripts/admin-restart.sh

# Reiniciar en modo producción
./scripts/admin-restart.sh prod
```

---

### `admin-status.sh`

Muestra el estado completo del panel de administración.

```bash
./scripts/admin-status.sh
```

**Información mostrada:**

- ✓ Estado del servicio (corriendo/detenido)
- ✓ PID y puerto
- ✓ Procesos nodemon
- ✓ Conectividad HTTP
- ✓ Archivos del proyecto
- ✓ Páginas disponibles
- ✓ Estado Docker (si aplica)
- ✓ Uso de recursos (CPU/RAM)

**Páginas disponibles:**

- Dashboard: http://localhost:3010/
- Productos: http://localhost:3010/products/
- Pedidos: http://localhost:3010/orders/
- Usuarios: http://localhost:3010/users/
- Reportes: http://localhost:3010/reports/
- Configuración: http://localhost:3010/settings/
- Reseñas: http://localhost:3010/reviews/
- Lista de Deseos: http://localhost:3010/wishlist/

---

### `admin-logs.sh`

Muestra los logs del panel de administración.

```bash
# Mostrar últimas 50 líneas
./scripts/admin-logs.sh

# Seguir logs en tiempo real
./scripts/admin-logs.sh follow
./scripts/admin-logs.sh -f
```

**Ubicación de logs:** `admin-panel/logs/admin-panel.log`

---

## 🚀 Script Maestro de Gestión Web

### `web-manager.sh`

Script maestro que centraliza todas las operaciones de gestión del sitio web.

```bash
./scripts/web-manager.sh [comando] [opciones]
```

### Comandos Disponibles

#### Panel de Administración

```bash
# Iniciar
./scripts/web-manager.sh admin:start [dev|prod]

# Detener
./scripts/web-manager.sh admin:stop

# Reiniciar
./scripts/web-manager.sh admin:restart [dev|prod]

# Estado
./scripts/web-manager.sh admin:status

# Logs
./scripts/web-manager.sh admin:logs [follow]
```

#### Frontend

```bash
# Iniciar
./scripts/web-manager.sh frontend:start [dev|prod]

# Detener
./scripts/web-manager.sh frontend:stop

# Reiniciar
./scripts/web-manager.sh frontend:restart [dev|prod]
```

#### Servicios

```bash
# Iniciar todos los servicios
./scripts/web-manager.sh services:start [dev|prod]

# Detener todos los servicios
./scripts/web-manager.sh services:stop

# Reiniciar todos los servicios
./scripts/web-manager.sh services:restart [dev|prod]

# Estado de servicios
./scripts/web-manager.sh services:status
```

#### Docker

```bash
# Levantar contenedores
./scripts/web-manager.sh docker:up [dev|prod]

# Detener contenedores
./scripts/web-manager.sh docker:down

# Ver logs
./scripts/web-manager.sh docker:logs [servicio]

# Listar contenedores
./scripts/web-manager.sh docker:ps
```

#### Utilidades

```bash
# Estado general del sistema
./scripts/web-manager.sh status

# Verificación de salud
./scripts/web-manager.sh health

# Limpiar archivos temporales
./scripts/web-manager.sh clean

# Ayuda
./scripts/web-manager.sh help
```

---

## 📦 Otros Scripts Disponibles

### Desarrollo y Testing

#### `start-dev.sh`

Inicia el entorno de desarrollo completo.

```bash
./scripts/start-dev.sh
```

#### `test-full.sh`

Ejecuta la suite completa de tests.

```bash
./scripts/test-full.sh
```

#### `test-smoke.sh`

Ejecuta tests de humo rápidos.

```bash
./scripts/test-smoke.sh
```

#### `test-system.sh`

Tests de integración del sistema.

```bash
./scripts/test-system.sh
```

---

### Validación y Diagnóstico

#### `validate-all.sh`

Validación completa del sistema.

```bash
./scripts/validate-all.sh
```

#### `validate-site.sh`

Validación del sitio web.

```bash
./scripts/validate-site.sh
```

#### `health-check.sh`

Verificación de salud de servicios.

```bash
./scripts/health-check.sh
```

#### `advanced-diagnostics.sh`

Diagnóstico avanzado del sistema.

```bash
./scripts/advanced-diagnostics.sh
```

---

### Mantenimiento

#### `system-maintenance.sh`

Mantenimiento automático del sistema.

```bash
./scripts/system-maintenance.sh
```

#### `cleanup-logs.sh`

Limpia logs antiguos.

```bash
./scripts/cleanup-logs.sh
```

#### `backup-databases.sh`

Respaldo de bases de datos.

```bash
./scripts/backup-databases.sh
```

---

### Documentación

#### `update-documentation.sh`

Actualiza la documentación del proyecto.

```bash
./scripts/update-documentation.sh
```

#### `generate-openapi.sh`

Genera documentación OpenAPI.

```bash
./scripts/generate-openapi.sh
```

---

### PWA y Optimización

#### `generate-pwa-icons.sh`

Genera iconos PWA en diferentes tamaños.

```bash
./scripts/generate-pwa-icons.sh
```

#### `optimize-images.sh`

Optimiza imágenes del proyecto.

```bash
./scripts/optimize-images.sh
```

#### `lighthouse-audit.sh`

Ejecuta auditoría Lighthouse.

```bash
./scripts/lighthouse-audit.sh
```

---

## 🎯 Uso Rápido

### Levantar el proyecto en desarrollo

```bash
# Opción 1: Script maestro
./scripts/web-manager.sh services:start dev

# Opción 2: Script directo
./start-all.sh dev
```

### Panel de Administración

```bash
# Ver estado
./scripts/web-manager.sh admin:status

# Iniciar solo el admin panel
./scripts/admin-start.sh dev

# Ver logs en tiempo real
./scripts/admin-logs.sh follow
```

### Verificar todo está funcionando

```bash
# Estado general
./scripts/web-manager.sh status

# Salud de servicios
./scripts/web-manager.sh health

# Validación completa
./scripts/validate-all.sh
```

### Detener todo

```bash
# Opción 1: Script maestro
./scripts/web-manager.sh services:stop

# Opción 2: Script directo
./stop-all.sh
```

---

## 🔧 Servicios y Puertos

| Servicio        | Puerto | URL                   |
| --------------- | ------ | --------------------- |
| Frontend        | 5173   | http://localhost:5173 |
| Admin Panel     | 3010   | http://localhost:3010 |
| API Gateway     | 3000   | http://localhost:3000 |
| Auth Service    | 3001   | http://localhost:3001 |
| Product Service | 3009   | http://localhost:3009 |

---

## 📝 Notas

- **Modo desarrollo:** Incluye hot-reload, source maps, logs detallados
- **Modo producción:** Optimizado, minificado, sin source maps
- **Logs:** Se guardan en `admin-panel/logs/` y directorios específicos de servicios
- **Docker:** Los servicios pueden ejecutarse en contenedores o localmente

---

## 🆘 Solución de Problemas

### El admin panel no inicia

```bash
# Ver estado detallado
./scripts/admin-status.sh

# Verificar puerto 3010
lsof -ti:3010

# Ver logs
./scripts/admin-logs.sh
```

### Puerto en uso

```bash
# Detener servicio en el puerto
./scripts/admin-stop.sh

# O manualmente
kill $(lsof -ti:3010)
```

### Limpieza completa

```bash
# Limpiar temporales
./scripts/web-manager.sh clean

# Reinstalar dependencias
cd admin-panel && rm -rf node_modules && npm install
```

---

## 📚 Documentación Adicional

- [DEVELOPMENT_GUIDE.md](../DEVELOPMENT_GUIDE.md) - Guía de desarrollo
- [DOCKER_GUIDE.md](../DOCKER_GUIDE.md) - Guía de Docker
- [TECHNICAL_DOCUMENTATION.md](../TECHNICAL_DOCUMENTATION.md) - Documentación técnica
- [SCRIPTS_NPM.md](../SCRIPTS_NPM.md) - Scripts NPM disponibles

---

## ✅ Verificación de Scripts

Para verificar que todos los scripts tienen permisos de ejecución:

```bash
ls -la scripts/*.sh | grep -v "^-rwxr"
```

Si algún script no tiene permisos, ejecutar:

```bash
chmod +x scripts/*.sh
```

---

**Última actualización:** 22 de octubre de 2025  
**Versión:** 2.0.0
