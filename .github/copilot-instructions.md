# AI Agent Instructions for Flores Victoria E-commerce Platform

## Project Overview
Flores Victoria is a microservices-based e-commerce platform for a flower shop. Key components:

- **Frontend**: HTML5/CSS3/JavaScript web interface
- **API Gateway**: Central entry point for all requests
- **Microservices**: Auth, User, Product, Order, Cart, Wishlist, Review, Contact services
- **Data Layer**: PostgreSQL (structured), MongoDB (unstructured), Redis (cache)
- **Message Broker**: RabbitMQ for async communication
- **Observability**: Jaeger, Prometheus, Grafana

## Development Workflow

### Service Development
1. Microservices are in `development/microservices/[service-name]`
2. Each service has its own Dockerfile and package.json
3. Use Docker Compose for local development:
```bash
docker compose --env-file .env -f development/docker-compose.yml up -d [service-name]
```

### Database Access
- PostgreSQL: Port 5433 (User: flores_user, DB: flores_db)
- MongoDB: Port 27018 (Root credentials in docker-compose.yml)
- Redis: Port 6380

## Key Architectural Patterns

### Service Communication
- Synchronous: REST APIs through API Gateway
- Asynchronous: RabbitMQ event-driven communication
- Inter-service authentication using JWT tokens

### Data Management
- User/Auth data: PostgreSQL for ACID compliance
- Product catalog: MongoDB for flexible schema
- Session/Cache: Redis for performance
- File uploads: Local storage with configurable cloud options

### Error Handling Convention
1. HTTP status codes for REST endpoints
```instructions
# Instrucciones para agentes IA — Plataforma Flores Victoria

## Resumen del proyecto
Flores Victoria es una plataforma de comercio electrónico construida con arquitectura de microservicios para una florería. Componentes clave:

- **Frontend**: Interfaz web (HTML5/CSS3/JavaScript)
- **API Gateway**: Punto de entrada central para las API
- **Microservicios**: auth, user, product, order, cart, wishlist, review, contact
- **Capa de datos**: PostgreSQL (datos estructurados), MongoDB (noSQL), Redis (cache)
- **Broker de mensajes**: RabbitMQ para comunicación asíncrona
- **Observabilidad**: Jaeger, Prometheus, Grafana

## Flujo de desarrollo

### Desarrollo de servicios
1. Los microservicios están en `development/microservices/[nombre-del-servicio]` (p. ej. `development/microservices/auth-service`).
2. Cada servicio suele tener su propio `Dockerfile` y `package.json`.
3. Para desarrollo local usamos Docker Compose:
```bash
docker compose --env-file .env -f development/docker-compose.yml up -d [nombre-del-servicio]
```

### Acceso a bases de datos (local)
- PostgreSQL: puerto 5433 (usuario: `flores_user`, base: `flores_db`)
- MongoDB: puerto 27018 (credenciales root en `development/docker-compose.yml`)
- Redis: puerto 6380

## Patrones arquitectónicos importantes

### Comunicación entre servicios
- Síncrona: endpoints REST que pasan por el API Gateway
- Asíncrona: eventos en RabbitMQ para desacoplar procesos
- Autenticación inter-servicio basada en JWT (ver `auth-service`)

### Gestión de datos
- Datos críticos del usuario/autenticación: PostgreSQL (ACID)
- Catálogo de productos: MongoDB (esquema flexible)
- Sesiones/caché: Redis para rendimiento
- Subida de archivos: almacenamiento local con posibilidad de configurar proveedores en el futuro

### Convención de errores
1. Usar códigos HTTP apropiados en los endpoints REST.
2. Respuesta de error estructurada (ejemplo común):
```json
{
  "error": true,
  "message": "Mensaje legible para el usuario",
  "code": "CÓDIGO_TECNICO"
}
```

## Tareas comunes de desarrollo

### Añadir nuevos endpoints
1. Crear la ruta en `src/routes/` del servicio correspondiente.
2. Implementar la lógica en `src/controllers/`.
3. Añadir validaciones en `src/validators/` si existe esa carpeta.
4. Si el endpoint debe exponerse públicamente, actualizar rutas en `api-gateway/src/routes/`.

### Probar cambios
1. Ejecutar tests del servicio: `npm test` dentro del directorio del servicio.
2. Usar los endpoints de healthcheck para comprobar el servicio: `curl -X GET http://localhost:3001/api/[service]/health`.
3. Vigilar logs en tiempo real: `docker compose logs -f [nombre-del-servicio]`.

## Archivos clave para contexto
- `development/docker-compose.yml`: configuración de servicios, puertos, dependencias y healthchecks.
- `[servicio]/server.js` (p. ej. `development/microservices/auth-service/server.js`): arranque del servicio y middleware.
- `api-gateway/src/routes/`: mapeo de rutas expuestas y proxy a microservicios.
- `.env.example` o `.env`: variables de entorno necesarias.

## Notas rápidas
- Comprobar siempre el estado de los healthchecks tras desplegar o reconstruir servicios.
- Usar trazado distribuido (Jaeger) para depurar llamadas entre servicios.
- Seguir las convenciones de manejo de errores ya presentes en el código al añadir comportamientos nuevos.
```