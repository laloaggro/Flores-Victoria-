# Operaciones comunes (Flores Victoria)

Este documento resume comandos y flujos frecuentes para operar la pila de servicios en Docker.

## Prerrequisitos

- Docker y Docker Compose instalados
- Archivo `.env` basado en `.env.example` (no subir secretos al repositorio)
- Contraseñas con caracteres especiales deben ir URL-encodeadas (ej: `/` → `%2F`, `+` → `%2B`)

## Arranque y estado

- Levantar todo el stack (en la carpeta del proyecto):
  - docker-compose up -d
- Ver estado de contenedores del stack:
  - docker ps --filter "name=flores-victoria" --format "table {{.Names}}\t{{.Status}}"
- Ver logs de un servicio:
  - docker logs -f flores-victoria-<service>

## Rebuilds y recreación selectiva

- Reconstruir y levantar un servicio sin tocar dependencias:
  - docker-compose up -d --build --no-deps <service>
- Forzar recreación de un servicio (sin reconstruir imagen):
  - docker-compose up -d --no-deps --force-recreate <service>

## Health checks manuales

- API Gateway: http://localhost:3000/health
- Frontend: http://localhost:5173/health (debe responder "OK")
- Admin Panel: http://localhost:3010/health

## Smoke test rápido

- Script: `scripts/smoke-test.sh`
  - Valida `/health` del Gateway, lista de productos, promociones (formato), Frontend y Admin Panel
  - Requiere `curl` y `jq` en el host

## Variables de entorno (.env)

- Usa `.env.example` como plantilla; no compartas el `.env` real
- Importante: URL-encodear contraseñas en URIs (MongoDB, RabbitMQ, etc.)
  - Ejemplo: `mongodb://admin:mi%2Fclave@mongodb:27017/db?authSource=admin`
- Redis en desarrollo: `REDIS_URL=redis://redis:6379` (sin auth) para evitar errores por caracteres
  especiales

## Problemas comunes y soluciones

- MongoParseError: Password contains unescaped characters
  - Causa: contraseña sin encode en la URI
  - Solución: aplicar `encodeURIComponent` y actualizar `.env`, luego recrear servicios dependientes
- Redis `ERR_INVALID_URL` en Node
  - Causa: contraseña con `/`, `@`, `:` sin encode
  - Solución: en dev usar `REDIS_URL` sin auth; en prod, URL-encodear la contraseña
- Healthcheck `unhealthy` en frontend/admin-panel
  - Causa: imagen base sólo tiene `curl`, no `wget`
  - Solución: usar healthcheck con `curl -f` (ya aplicado en `docker-compose.yml`)

## Endpoints útiles

- Productos: `GET http://localhost:3000/api/products?limit=2`
- Promociones: `GET http://localhost:3000/api/promotions`

## Tips

- Tras cambios en `.env`, recrea los servicios que dependan de esas variables
- Para diagnósticos rápidos: `docker ps`, `docker logs`, y el `smoke-test.sh`

---

Mantén este documento actualizado con tus flujos más usados. Si necesitas targets de Makefile para
simplificar, se pueden agregar en una mejora futura.
