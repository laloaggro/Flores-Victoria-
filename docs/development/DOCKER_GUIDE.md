# Guía de Docker Compose

Este proyecto usa dos configuraciones principales de Docker Compose.

## Diagramas de Arquitectura

Arquitectura en desarrollo (stack ligero):

![Arquitectura Desarrollo](./docs/diagrams/architecture-dev.v2.svg)

Arquitectura en producción (stack completo):

![Arquitectura Producción](./docs/diagrams/architecture-prod.v2.svg)

## Desarrollo local (ligero)

Usa el gateway, auth-service, product-service y frontend.

- Archivo: `docker-compose.dev.yml`
- Levantar:

```bash
docker compose -f docker-compose.dev.yml up --build
```

## Producción local / stack completo

Todos los servicios, base de datos, monitoreo, etc.

- Archivo: `docker-compose.prod.yml`
- Levantar:

```bash
docker compose -f docker-compose.prod.yml up --build
```

## Notas

- Los archivos antiguos `docker-compose.dev-simple.yml` y `docker-compose.yml` permanecen por
  compatibilidad temporal.
- **Recomendación**: usa `docker-compose.dev.yml` para desarrollo y `docker-compose.prod.yml` para
  producción local.
- El API Gateway expone:
  - `http://localhost:3000/api/auth/*` → auth-service
  - `http://localhost:3000/api/products/*` → product-service
  - `http://localhost:3000/api/users/profile` → auth-service (compatibilidad)
- El frontend corre en `http://localhost:5173` (dev) o `http://localhost:5175` (prod).

## Scripts npm sugeridos (opcional)

Puedes agregar a tu `package.json`:

```json
"scripts": {
  "dev:stack": "docker compose -f docker-compose.dev.yml up --build",
  "prod:stack": "docker compose -f docker-compose.prod.yml up --build",
  "dev:down": "docker compose -f docker-compose.dev.yml down",
  "prod:down": "docker compose -f docker-compose.prod.yml down"
}
```
