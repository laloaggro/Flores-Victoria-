# 🔧 Guía Profesional de Gestión de Puertos

**Flores Victoria v3.0** - Herramientas CLI para gestión de puertos sin conflictos

---

## 📋 Índice

1. [Introducción](#introducción)
2. [Instalación](#instalación)
3. [Comandos Disponibles](#comandos-disponibles)
4. [Ejemplos de Uso](#ejemplos-de-uso)
5. [Ports Enforcer](#ports-enforcer)
6. [Configuración](#configuración)
7. [Solución de Problemas](#solución-de-problemas)

---

## Introducción

El sistema de gestión de puertos profesional de Flores Victoria incluye:

- **Ports CLI** - Herramienta de línea de comandos para inspeccionar, validar y gestionar puertos
- **Ports Enforcer** - Sistema de verificación previa que garantiza disponibilidad de puertos
- **Port Manager** - Configuración centralizada en `config/ports.json`
- **Scripts NPM** - Accesos directos para operaciones comunes

### ¿Por qué usar estas herramientas?

- ✅ Evita conflictos de puertos entre servicios
- ✅ Identifica qué proceso/contenedor ocupa un puerto
- ✅ Mata procesos locales o detiene contenedores de forma segura
- ✅ Sugiere puertos libres automáticamente
- ✅ Valida configuración sin conflictos entre ambientes

---

## Instalación

Las herramientas ya están incluidas en el proyecto. Solo necesitas:

```bash
cd /ruta/a/flores-victoria
npm install
```

---

## Comandos Disponibles

### 1. Estado de Puertos

Muestra qué puertos están en uso y quién los ocupa.

```bash
# Ambiente de desarrollo
npm run ports:status

# Producción
npm run ports:status:prod

# Testing
npm run ports:status:test
```

**Salida ejemplo:**
```
🔎 Puertos (development)
Servicio                   Puerto   Estado     Ocupado por
--------------------------------------------------------------------------------
admin-panel                3021     EN USO     docker:flores-victoria-admin-panel
main-site                  3000     EN USO     proc:node#2602793
order-service              3004     EN USO     docker:flores-victoria-order-service
documentation              3080     LIBRE
```

### 2. Identificar Dueño de un Puerto

Muestra qué proceso o contenedor está usando un puerto específico.

```bash
npm run ports:who -- 3021
```

**Salida ejemplo:**
```json
{
  "processes": [],
  "containers": [
    {
      "id": "c8773381b7f4",
      "name": "flores-victoria-admin-panel",
      "ports": "0.0.0.0:3021->3021/tcp"
    }
  ]
}
```

### 3. Matar Procesos en un Puerto

Termina procesos locales (no Docker) que estén usando un puerto.

```bash
npm run ports:kill -- 3021
```

**Nota:** Este comando NO mata contenedores Docker. Si detecta Docker, te sugerirá usar otra herramienta.

### 4. Sugerir Puertos Libres

Encuentra puertos disponibles en el rango configurado.

```bash
npm run ports:suggest
```

**Salida ejemplo:**
```
3001
3003
3005
3006
3007
```

### 5. Validar Configuración

Verifica que no haya conflictos de puertos entre ambientes (dev/prod/test).

```bash
npm run ports:validate:cli
```

**Salida esperada:**
```
✅ No hay conflictos de puertos entre ambientes
```

### 6. Exportar Estado como JSON

Genera un reporte completo en formato JSON.

```bash
npm run ports:export:json
```

### 7. Dashboard Rápido

Vista combinada: estado de puertos + contenedores Docker activos.

```bash
npm run ports:dashboard
```

---

## Ejemplos de Uso

### Escenario 1: ¿Por qué no puedo iniciar el admin panel?

```bash
# 1. Verifica qué está usando el puerto 3021
npm run ports:who -- 3021

# Si es Docker:
docker stop flores-victoria-admin-panel

# Si es un proceso local:
npm run ports:kill -- 3021

# 2. Ahora inicia el servicio
npm run admin:start
```

### Escenario 2: Necesito un puerto libre para un nuevo servicio

```bash
# Sugiere 5 puertos libres
npm run ports:suggest

# Usa el primero disponible en tu configuración
```

### Escenario 3: Verificar antes de desplegar

```bash
# Validar que la configuración no tiene conflictos
npm run ports:validate:cli

# Ver estado actual de todos los puertos
npm run ports:status

# Generar reporte para auditoría
npm run ports:export:json > ports-audit-$(date +%Y%m%d).json
```

### Escenario 4: Debugging rápido

```bash
# Dashboard completo
npm run ports:dashboard

# Salida:
# - Estado de cada puerto (libre/ocupado)
# - Proceso o contenedor que lo usa
# - Lista de contenedores Docker activos
```

---

## Ports Enforcer

Sistema de verificación previa que garantiza que un puerto esté disponible antes de ejecutar un comando.

### Uso Básico

```bash
bash ./scripts/ports-enforcer.sh <servicio> <ambiente> [--action=...] -- <comando>
```

### Acciones Disponibles

1. **abort** (por defecto) - Aborta si el puerto está ocupado
2. **kill-local** - Mata procesos locales y continúa
3. **stop-docker** - Detiene contenedores Docker y continúa
4. **auto-next** - Usa el siguiente puerto libre automáticamente

### Ejemplos

#### 1. Abortar si el puerto está ocupado

```bash
bash ./scripts/ports-enforcer.sh admin-panel development --action=abort -- \
  node admin-panel/server.js
```

#### 2. Matar procesos locales automáticamente

```bash
bash ./scripts/ports-enforcer.sh admin-panel development --action=kill-local -- \
  node admin-panel/server.js
```

#### 3. Detener contenedores Docker y continuar

```bash
bash ./scripts/ports-enforcer.sh admin-panel development --action=stop-docker -- \
  node admin-panel/server.js
```

#### 4. Usar puerto alternativo si está ocupado

```bash
bash ./scripts/ports-enforcer.sh admin-panel development --action=auto-next -- \
  node admin-panel/server.js
```

### Usar con NPM

Ya existe un script preconfigurado:

```bash
npm run admin:start:enforced
```

Este comando abortará si el puerto 3021 está ocupado.

---

## Configuración

### Archivo Central: `config/ports.json`

Todos los puertos están definidos en un solo archivo:

```json
{
  "development": {
    "core": {
      "ai-service": 3013,
      "order-service": 3004,
      "admin-panel": 3021
    },
    "frontend": {
      "main-site": 3000,
      "documentation": 3080
    }
  },
  "production": { ... },
  "testing": { ... }
}
```

### Rangos de Puertos

- **Development**: 3000-3999, 9090
- **Production**: 4000-4999, 9091
- **Testing**: 5000-5999, 9092

### Generar Archivos .env

Los puertos se exportan automáticamente a archivos `.env`:

```bash
npm run ports:env:dev    # Genera .env.development
npm run ports:env:prod   # Genera .env.production
npm run ports:env:test   # Genera .env.testing
```

**Contenido ejemplo de `.env.development`:**
```bash
# 🔧 PORT CONFIGURATION - DEVELOPMENT

AI_SERVICE_PORT=3013
ORDER_SERVICE_PORT=3004
ADMIN_PANEL_PORT=3021
MAIN_SITE_PORT=3000
DOCUMENTATION_PORT=3080
...
```

---

## Solución de Problemas

### Error: "address already in use"

```bash
# 1. Identifica qué está usando el puerto
npm run ports:who -- 3021

# 2. Si es un contenedor Docker:
docker stop <nombre-contenedor>

# 3. Si es un proceso local:
npm run ports:kill -- 3021

# 4. Si no sabes qué hacer:
npm run ports:dashboard
```

### Puerto ocupado por proceso desconocido

```bash
# Ver información detallada del puerto
node scripts/ports-cli.js who 3021

# Matar todos los procesos del puerto (⚠️ usar con cuidado)
sudo lsof -ti:3021 | xargs kill -9
```

### Conflictos de configuración

```bash
# Validar configuración
npm run ports:validate:cli

# Si hay conflictos, edita config/ports.json
# y vuelve a validar
```

### El enforcer no funciona

```bash
# Verifica que los scripts tengan permisos de ejecución
chmod +x scripts/ports-enforcer.sh
chmod +x scripts/ports-cli.js

# Ejecuta en modo debug
bash -x ./scripts/ports-enforcer.sh admin-panel development -- echo "test"
```

---

## Comandos Avanzados

### Usar Port Manager directamente

```bash
# Mostrar configuración completa
node scripts/port-manager.js show all

# Obtener puerto de un servicio
node scripts/port-manager.js get development admin-panel
# Output: 3021

# Verificar disponibilidad
node scripts/port-manager.js check development
```

### CLI Completo

```bash
# Ver todas las opciones
node scripts/ports-cli.js help

# Estado detallado
node scripts/ports-cli.js status development

# Sugerir 10 puertos libres desde el 3000
node scripts/ports-cli.js suggest 3000 10

# Validar configuración
node scripts/ports-cli.js validate

# Exportar a JSON
node scripts/ports-cli.js export-json production > prod-ports.json
```

---

## Integración con Scripts Existentes

### En start-all.sh

```bash
# Validar puertos antes de iniciar
npm run ports:validate:cli || {
  echo "❌ Conflictos de puertos detectados"
  exit 1
}

# Verificar disponibilidad
npm run ports:check:dev || {
  echo "⚠️ Algunos puertos están ocupados"
  npm run ports:status
}
```

### En CI/CD

```bash
# Pre-deploy: validar configuración
npm run ports:validate:cli

# Health check: exportar estado
npm run ports:export:json > artifacts/ports-status.json
```

---

## Referencia Rápida

| Comando | Descripción |
|---------|-------------|
| `npm run ports:status` | Estado de puertos (dev) |
| `npm run ports:who -- <port>` | Quién usa el puerto |
| `npm run ports:kill -- <port>` | Matar proceso local |
| `npm run ports:suggest` | Sugerir puertos libres |
| `npm run ports:validate:cli` | Validar configuración |
| `npm run ports:dashboard` | Dashboard completo |
| `npm run ports:export:json` | Exportar a JSON |
| `npm run admin:start:enforced` | Admin con verificación |

---

## Recursos

- **Configuración**: `config/ports.json`
- **Port Manager**: `scripts/port-manager.js`
- **Ports CLI**: `scripts/ports-cli.js`
- **Enforcer**: `scripts/ports-enforcer.sh`
- **Dashboard**: `scripts/ports-status.sh`
- **Documentación**: `docs/PORTS_MANAGEMENT_PROFESSIONAL.md`

---

**Última actualización**: Enero 2025  
**Versión**: 3.0  
**Mantenedor**: Eduardo Garay (@laloaggro)
