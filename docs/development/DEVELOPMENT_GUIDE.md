# Guía de Desarrollo - Flores Victoria

## Introducción

Esta guía explica cómo configurar y trabajar con el entorno de desarrollo del proyecto Flores
Victoria. El proyecto utiliza una arquitectura de microservicios con múltiples tecnologías frontend
y backend.

## Requisitos Previos

- Docker y Docker Compose
- Node.js (versión 16 o superior)
- npm o yarn
- Git

## Estructura del Proyecto

```
flores-victoria/
├── admin-panel/           # Panel de administración (React)
├── frontend/              # Tienda online (Vite)
├── microservices/         # Microservicios backend
│   ├── api-gateway/       # Gateway de la API
│   ├── auth-service/      # Servicio de autenticación
│   ├── cart-service/      # Servicio del carrito
│   ├── contact-service/   # Servicio de contacto
│   ├── order-service/     # Servicio de órdenes
│   ├── product-service/   # Servicio de productos
│   ├── review-service/    # Servicio de reseñas
│   ├── user-service/      # Servicio de usuarios
│   └── wishlist-service/  # Servicio de lista de deseos
├── monitoring/            # Configuración de monitoreo
└── shared/                # Código compartido entre microservicios
```

## Modos de Ejecución

### Documentación Privada (solo local)

- Ubicación: `docs/private/`
- Política: todo el contenido de `docs/private/` está ignorado por git (no se sube al remoto).
- Placeholder: se mantiene `docs/private/.gitkeep` para que exista la carpeta.
- Plantilla: usa `docs/templates/sensitive-doc-template.md` y cópiala a `docs/private/`.

Sugerencias:

- No guardes secretos en archivos versionados.
- Usa variables de entorno (.env) y gestores de secretos.
- Si necesitas compartir, utiliza un canal seguro (no por commit).

## Diagramas de Arquitectura

Arquitectura en desarrollo (stack ligero):

![Arquitectura Desarrollo](./docs/diagrams/architecture-dev.v2.svg)

Arquitectura en producción (stack completo):

![Arquitectura Producción](./docs/diagrams/architecture-prod.v2.svg)

---

### Modo Producción

Este modo construye y ejecuta todos los servicios tal como se ejecutarían en producción:

```bash
./start-all.sh
```

Este comando:

1. Construye todas las imágenes Docker
2. Crea y ejecuta todos los contenedores
3. Sirve los frontends a través de nginx desde archivos estáticos

Los servicios estarán disponibles en:

- Tienda online: http://localhost:5175
- Panel de administración: http://localhost:3010
- API Gateway: http://localhost:3000

### Modo Desarrollo

Este modo proporciona un entorno de desarrollo con Hot Module Replacement (HMR) usando
docker-compose.dev.yml y scripts npm:

```bash
npm run dev:up        # Levantar sin rebuild
# o
npm run dev:stack     # Levantar con --build
```

Servicios en desarrollo:

- Tienda online (Vite): http://localhost:5173
- Panel de administración: http://localhost:3010
- API Gateway: http://localhost:3000
- Auth Service: http://localhost:3001
- Product Service: http://localhost:3009

Comandos útiles:

```bash
npm run dev:ps             # Estado de servicios
npm run dev:logs           # Logs de todos
npm run dev:logs:gateway   # Logs solo gateway
npm run dev:restart:auth   # Reiniciar auth-service
npm run dev:down           # Detener todo
npm run dev:clean          # Limpiar volúmenes y huérfanos
```

## Desarrollo Frontend

### Tienda Online (frontend)

Ubicación: `./frontend/`

Tecnologías:

- Vite
- JavaScript/TypeScript
- TailwindCSS

Para trabajar exclusivamente en el frontend:

```bash
cd frontend
npm run dev
```

### Panel de Administración (admin-panel)

Ubicación: `./admin-panel/`

Tecnologías:

- Vite
- JavaScript/TypeScript
- TailwindCSS

Para trabajar exclusivamente en el panel de administración:

```bash
cd admin-panel
npm run dev
```

## Desarrollo Backend

### Microservicios

Cada microservicio se puede ejecutar independientemente:

```bash
cd microservices/product-service
npm start
```

### API Gateway

El API Gateway se encuentra en `./microservices/api-gateway/` y es responsable de enrutar las
solicitudes a los microservicios correspondientes.

## Pruebas

### Pruebas Unitarias

Para ejecutar pruebas unitarias en un microservicio específico:

```bash
cd microservices/product-service
npm test
```

### Pruebas End-to-End

Las pruebas E2E se pueden ejecutar con Cypress:

```bash
cd frontend
npm run test:e2e
```

## Monitorización

### Prometheus

Prometheus está disponible en http://localhost:9090

### Grafana

Grafana está disponible en http://localhost:3009

### Jaeger (Tracing)

Jaeger está disponible en http://localhost:16686

## Solución de Problemas

### Problemas Comunes

1. **Puertos ocupados**: Usa las herramientas de gestión de puertos:
   ```bash
   npm run ports:status        # Ver puertos en uso
   npm run ports:who -- 3021   # Identificar quién usa un puerto
   npm run ports:kill -- 3021  # Matar proceso local
   ```

2. **Problemas de red Docker**: Si los contenedores no pueden comunicarse:
   ```bash
   docker network prune
   # o verificar estado
   npm run health
   ```

3. **Errores de dependencias**: Si hay problemas con las dependencias de Node.js:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **Sistema no arranca**: Ejecuta la pre-verificación:
   ```bash
   npm run check:ready
   ```

### Logs

Para ver los logs de un servicio específico:

```bash
# Docker Compose
docker compose logs <nombre-del-servicio>

# NPM Scripts
npm run logs:tail              # Todos los logs en tiempo real
npm run logs:errors            # Solo errores
npm run logs:stats             # Estadísticas de logs

# Limpiar logs antiguos
npm run logs:clean
```

---

## Herramientas de Desarrollo

### Health Check

Verifica el estado de todos los servicios:

```bash
# Check único
npm run health

# Monitoreo continuo (cada 30s)
npm run health:watch
```

**Salida esperada**: 100% saludable con 12/12 servicios OK

### Gestión de Puertos

Sistema profesional para gestionar puertos sin conflictos:

```bash
# Estado actual
npm run ports:status           # Development
npm run ports:status:prod      # Production

# Dashboard completo
npm run ports:dashboard

# Diagnóstico
npm run ports:who -- 3021      # Quién usa el puerto
npm run ports:suggest          # Sugerir puertos libres

# Validación
npm run ports:validate:cli     # Verificar sin conflictos
```

**Documentación completa**: Ver `docs/PORTS_PROFESSIONAL_GUIDE.md`

### Pre-Start Check

Verifica que todo esté listo antes de iniciar:

```bash
npm run check:ready
```

Verifica:
- Node.js y npm instalados
- Docker disponible
- Configuración de puertos
- Dependencias instaladas
- Puertos críticos disponibles
- Estructura de directorios

### Comandos de Inicio Rápido

```bash
# Verificar primero
npm run check:ready

# Iniciar con Docker (recomendado)
npm run dev:up

# Verificar salud
npm run health

# Dashboard completo
npm run ports:dashboard
```

---

## Mejores Prácticas

1. **Pre-verificación**: Ejecuta `npm run check:ready` antes de iniciar

2. **Monitoreo**: Usa `npm run health:watch` durante desarrollo activo

3. **Commits atómicos**: Realiza commits pequeños y con mensajes descriptivos

4. **Nombres de ramas**: Usa nombres descriptivos:
   - `feature/nueva-funcionalidad`
   - `bugfix/correccion-error`
   - `hotfix/correccion-urgente`

5. **Variables de entorno**: No commitees secretos. Los archivos `.env*` están ignorados

6. **Pruebas**: Escribe pruebas para nuevas funcionalidades

7. **Documentación**: Actualiza la documentación cuando se modifica la funcionalidad

8. **Validación Pre-Deploy**: `npm run predeploy` valida automáticamente antes de desplegar

9. **Limpieza periódica**: Ejecuta `npm run logs:clean` semanalmente

10. **Gestión de puertos**: Consulta `npm run ports:status` si hay conflictos

---

## Recursos Adicionales

- **Quick Start**: `docs/QUICK_START.md` - Guía de inicio rápido
- **Gestión de Puertos**: `docs/PORTS_PROFESSIONAL_GUIDE.md` - CLI y herramientas
- **Troubleshooting**: `docs/TROUBLESHOOTING.md` - Solución de problemas
- **API Documentation**: http://localhost:3000/api-docs (cuando está corriendo)
- **Technical Docs**: `docs/TECHNICAL_DOCUMENTATION.md` - Arquitectura completa
