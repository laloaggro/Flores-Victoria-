# Desarrollo - Flores Victoria

Este directorio contiene todos los archivos necesarios para el entorno de desarrollo del proyecto Flores Victoria.

## Estructura

- `microservices/`: Contiene todos los microservicios del sistema
- `docker-compose.yml`: Configuración de Docker Compose para el entorno de desarrollo

## Instrucciones de Despliegue

### Requisitos Previos
- Docker y Docker Compose instalados
- Al menos 4GB de RAM disponibles
- 2GB de espacio en disco

### Iniciar el Entorno de Desarrollo

```bash
# Construir y ejecutar todos los servicios
docker-compose up --build

# Ejecutar en segundo plano
docker-compose up -d --build

# Ver estado de los servicios
docker-compose ps

# Ver logs de un servicio específico
docker-compose logs <nombre-del-servicio>

# Detener todos los servicios
docker-compose down
```

## Servicios Incluidos

1. **Bases de Datos**:
   - MongoDB (NoSQL)
   - PostgreSQL (Relacional)
   - Redis (Caché)

2. **Servicios de Mensajería**:
   - RabbitMQ

3. **Microservicios**:
   - API Gateway
   - Auth Service
   - User Service
   - Product Service
   - Cart Service
   - Order Service
   - Wishlist Service
   - Review Service
   - Contact Service

## Puertos

Consultar el archivo [microservices/PORTS.md](microservices/PORTS.md) para obtener información detallada sobre los puertos utilizados por cada servicio.

## Variables de Entorno

Cada servicio utiliza variables de entorno para su configuración. Consultar los archivos `.env` o `docker-compose.yml` para obtener más información.

## Problemas Conocidos y Soluciones

1. **Servicios reiniciándose constantemente**: Se han actualizado las configuraciones para resolver este problema.
2. **Problemas de conexión a bases de datos**: Se han mejorado los mecanismos de reconexión.
3. **Conflictos de puertos**: Se han resuelto los conflictos de puertos manteniendo consistencia entre puertos internos y externos.