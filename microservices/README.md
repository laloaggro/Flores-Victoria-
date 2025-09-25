# Microservicios - Arreglos Victoria

## Arquitectura

Esta es la implementación de la arquitectura de microservicios para Arreglos Victoria utilizando tecnologías gratuitas de código abierto.

## Microservicios Implementados

1. **API Gateway** - Punto de entrada único para todas las solicitudes
2. **Auth Service** - Servicio de autenticación y autorización
3. **Product Service** - Servicio de gestión de productos
4. **User Service** - Servicio de gestión de usuarios
5. **Order Service** - Servicio de gestión de pedidos
6. **Cart Service** - Servicio de carrito de compras
7. **Wishlist Service** - Servicio de lista de deseos
8. **Review Service** - Servicio de reseñas
9. **Contact Service** - Servicio de contacto

## Tecnologías Utilizadas

- **Node.js + Express** - Para todos los microservicios
- **Docker + Docker Compose** - Para contenerización y orquestación
- **PostgreSQL** - Base de datos relacional para datos estructurados
- **MongoDB** - Base de datos NoSQL para datos flexibles
- **Redis** - Almacén en memoria para sesiones, cache y colas

## Componentes Compartidos

El directorio `shared` contiene componentes reutilizables:

- **Circuit Breaker** - Para manejo de fallos
- **HTTP Client** - Cliente HTTP con circuit breaker
- **Message Queue** - Sistema de colas de mensajes
- **Cache Manager** - Sistema de caching
- **Validation** - Sistema de validación de entrada
- **Security** - Utilidades de seguridad (OAuth, API Keys)
- **Monitoring** - Métricas para Prometheus
- **Tracing** - Sistema de tracing distribuido
- **Health Checks** - Sistema de verificación de salud
- **Compression** - Compresión de respuestas
- **Database Optimizer** - Optimizaciones de consultas

## Iniciar los Microservicios

### Prerrequisitos

- Docker y Docker Compose instalados
- Node.js (para desarrollo local)

### Iniciar en Modo Desarrollo

```bash
# Dar permisos de ejecución a los scripts
chmod +x start-all.sh stop-all.sh

# Iniciar todos los microservicios
./start-all.sh
```

O manualmente:

```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

### Iniciar en Modo Producción

```bash
docker-compose up -d
```

## Detener los Microservicios

```bash
./stop-all.sh
```

O manualmente:

```bash
docker-compose down
```

## Puertos

- **API Gateway**: 3000
- **Auth Service**: 3001
- **Product Service**: 3002
- **User Service**: 3003
- **Order Service**: 3004
- **Cart Service**: 3005
- **Wishlist Service**: 3006
- **Review Service**: 3007
- **Contact Service**: 3008
- **PostgreSQL**: 5432
- **MongoDB**: 27017
- **Redis**: 6379

## Variables de Entorno

Copiar el archivo `.env.example` a `.env` y configurar las variables según sea necesario:

```bash
cp .env.example .env
```

## Verificación

Para verificar que todos los servicios están funcionando:

```bash
docker-compose ps
```

Para ver los logs:

```bash
docker-compose logs -f
```

## Pruebas

Para probar la API, se pueden usar comandos curl o herramientas como Postman.

Ejemplo de registro de usuario:

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Usuario de Prueba",
    "email": "test@example.com",
    "password": "password123"
  }'
```

Ejemplo de login:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

## Monitoreo

Los microservicios incluyen métricas para Prometheus. Se pueden acceder en:

- `/metrics` en cada microservicio

## Health Checks

Cada microservicio incluye un endpoint de health check en:

- `/health` o `/api/health`

## Futuras Mejoras

1. **Service Discovery** - Implementar descubrimiento automático de servicios
2. **Load Balancer** - Agregar balanceador de carga
3. **API Gateway Avanzado** - Implementar funcionalidades avanzadas
4. **Event Sourcing** - Implementar patrón de event sourcing
5. **CQRS** - Implementar patrón CQRS para operaciones complejas