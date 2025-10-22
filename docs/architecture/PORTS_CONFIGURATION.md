# Configuración de Puertos del Proyecto Flores Victoria

Este documento define los puertos utilizados en los entornos de desarrollo y producción para todos
los servicios del proyecto Flores Victoria.

## Entorno de Desarrollo

| Servicio         | Puerto Interno | Puerto Externo | URL de Acceso          |
| ---------------- | -------------- | -------------- | ---------------------- |
| API Gateway      | 3000           | 3000           | http://localhost:3000  |
| Auth Service     | 3001           | 3001           | http://localhost:3001  |
| Product Service  | 3009           | 3009           | http://localhost:3009  |
| User Service     | 3003           | 3003           | http://localhost:3003  |
| Order Service    | 3004           | 3004           | http://localhost:3004  |
| Cart Service     | 3005           | 3005           | http://localhost:3005  |
| Wishlist Service | 3006           | 3006           | http://localhost:3006  |
| Review Service   | 3007           | 3007           | http://localhost:3007  |
| Contact Service  | 3008           | 3008           | http://localhost:3008  |
| Frontend (Dev)   | 5173           | 5173           | http://localhost:5173  |
| Admin Panel      | 3010           | 3010           | http://localhost:3010  |
| MongoDB          | 27017          | 27018          | localhost:27018        |
| PostgreSQL       | 5432           | 5433           | localhost:5433         |
| Redis            | 6379           | 6380           | localhost:6380         |
| RabbitMQ         | 5672/15672     | 5672/15672     | http://localhost:15672 |
| Jaeger           | Múltiples      | Múltiples      | http://localhost:16686 |

## Entorno de Desarrollo Sin Conflictos (Alternativo)

Para ejecutar el entorno de desarrollo simultáneamente con el entorno de producción, se puede usar
el archivo `docker-compose.dev-conflict-free.yml` que mapea los puertos de forma diferente:

| Servicio         | Puerto Interno | Puerto Externo | URL de Acceso          |
| ---------------- | -------------- | -------------- | ---------------------- |
| API Gateway      | 3000           | 4000           | http://localhost:4000  |
| Auth Service     | 3001           | 4001           | http://localhost:4001  |
| Product Service  | 3009           | 4009           | http://localhost:4009  |
| User Service     | 3003           | 4003           | http://localhost:4003  |
| Order Service    | 3004           | 4004           | http://localhost:4004  |
| Cart Service     | 3005           | 4005           | http://localhost:4005  |
| Wishlist Service | 3006           | 4006           | http://localhost:4006  |
| Review Service   | 3007           | 4007           | http://localhost:4007  |
| Contact Service  | 3008           | 4008           | http://localhost:4008  |
| Frontend (Dev)   | 5173           | 5173           | http://localhost:5173  |
| Admin Panel      | 3010           | 4010           | http://localhost:4010  |
| MongoDB          | 27017          | 27018          | localhost:27018        |
| PostgreSQL       | 5432           | 5433           | localhost:5433         |
| Redis            | 6379           | 6380           | localhost:6380         |
| RabbitMQ         | 5672/15672     | 5672/15672     | http://localhost:15672 |
| Jaeger           | Múltiples      | Múltiples      | http://localhost:16686 |

## Entorno de Producción

| Servicio         | Puerto Interno | Puerto Externo | URL de Acceso          |
| ---------------- | -------------- | -------------- | ---------------------- |
| API Gateway      | 3000           | 3000           | http://localhost:3000  |
| Auth Service     | 3001           | 3001           | http://localhost:3001  |
| Product Service  | 3009           | 3009           | http://localhost:3009  |
| User Service     | 3003           | 3003           | http://localhost:3003  |
| Order Service    | 3004           | 3004           | http://localhost:3004  |
| Cart Service     | 3005           | 3005           | http://localhost:3005  |
| Wishlist Service | 3006           | 3006           | http://localhost:3006  |
| Review Service   | 3007           | 3007           | http://localhost:3007  |
| Contact Service  | 3008           | 3008           | http://localhost:3008  |
| Frontend         | 5175           | 5175           | http://localhost:5175  |
| Admin Panel      | 3010           | 3010           | http://localhost:3010  |
| MongoDB          | 27017          | 27018          | localhost:27018        |
| PostgreSQL       | 5432           | 5433           | localhost:5433         |
| Redis            | 6379           | 6380           | localhost:6380         |
| RabbitMQ         | 5672/15672     | 5672/15672     | http://localhost:15672 |
| Jaeger           | Múltiples      | Múltiples      | http://localhost:16686 |

## Notas de Configuración

### Frontend

- En desarrollo, el frontend se ejecuta en el puerto 5173 con proxy al API Gateway en el puerto 3000
- En producción, el frontend se ejecuta en el puerto 5175 y se comunica directamente con el API
  Gateway

### API Gateway

- El API Gateway enruta todas las solicitudes a los microservicios correspondientes
- Todas las solicitudes del frontend deben pasar a través del API Gateway
- Las rutas de la API comienzan con el prefijo `/api`

### Microservicios

- Cada microservicio se ejecuta en su propio puerto dedicado
- Todos los microservicios se comunican con el API Gateway y entre sí a través de la red interna de
  Docker
- En desarrollo, los puertos están expuestos para facilitar la depuración
- En producción, solo el API Gateway y los servicios web principales están expuestos públicamente

### Auth Service

- El servicio de autenticación utiliza módulos compartidos del directorio `shared` para logging,
  tracing, métricas y auditoría
- Se requiere montar el directorio `shared` en el contenedor para que las dependencias se resuelvan
  correctamente

### Admin Panel

- El panel de administración se ejecuta en el puerto 3010 tanto interna como externamente
- En el entorno de desarrollo sin conflictos, se mapea al puerto 4010 externamente

## Variables de Entorno

### Desarrollo

```bash
# En los archivos docker-compose
NODE_ENV=development
```

### Producción

```bash
# En los archivos docker-compose
NODE_ENV=production
```

## Comandos para Iniciar los Entornos

### Desarrollo (puertos estándar)

```bash
# Iniciar entorno de desarrollo
./start-all.sh dev

# Detener entorno de desarrollo
./stop-all.sh
```

### Desarrollo (sin conflictos con producción)

```bash
# Iniciar entorno de desarrollo sin conflictos
docker-compose -f docker-compose.dev-conflict-free.yml up -d

# Detener entorno de desarrollo sin conflictos
docker-compose -f docker-compose.dev-conflict-free.yml down
```

### Producción

```bash
# Iniciar entorno de producción
./start-all.sh

# Detener entorno de producción
./stop-all.sh
```
