# Microservicios de Flores Victoria

Este directorio contiene todos los microservicios que conforman el sistema de gestión de arreglos florales Flores Victoria.

## Arquitectura

El sistema utiliza una arquitectura de microservicios para proporcionar una solución modular, escalable y mantenible. Cada servicio se ejecuta en su propio contenedor Docker y se comunica con otros servicios a través de una red Docker personalizada.

## Servicios incluidos

1. **API Gateway** - Punto de entrada único para todas las solicitudes
2. **Auth Service** - Gestión de autenticación y autorización
3. **User Service** - Gestión de usuarios y perfiles
4. **Product Service** - Catálogo y gestión de productos florales
5. **Cart Service** - Gestión de carritos de compra
6. **Order Service** - Procesamiento de pedidos
7. **Review Service** - Sistema de reseñas y calificaciones
8. **Wishlist Service** - Lista de deseos de usuarios
9. **Contact Service** - Gestión de consultas de contacto

## Bases de datos

- **PostgreSQL** - Base de datos relacional para datos estructurados
- **MongoDB** - Base de datos NoSQL para datos no estructurados
- **Redis** - Sistema de caché y almacenamiento temporal

## Servicios de mensajería

- **RabbitMQ** - Broker de mensajes para la comunicación asíncrona entre servicios

## Monitoreo y observabilidad

- **Prometheus** - Recopilación de métricas
- **Grafana** - Visualización de métricas
- **ELK Stack** - Logging centralizado (Elasticsearch, Logstash, Kibana)

## Requisitos

- Docker y Docker Compose
- Al menos 4GB de RAM disponibles
- 2GB de espacio en disco

## Instrucciones de despliegue

### Desarrollo

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

### Producción (Kubernetes)

Para desplegar en un entorno de producción, se recomienda utilizar Kubernetes. Los manifiestos se encuentran en el directorio `/kubernetes` en la raíz del proyecto.

## Puertos

Consultar el archivo [PORTS.md](PORTS.md) para obtener información detallada sobre los puertos utilizados por cada servicio.

## Variables de entorno

Cada servicio utiliza variables de entorno para su configuración. Consultar los archivos `.env` o `docker-compose.yml` para obtener más información.

## Problemas conocidos y soluciones

1. **Servicios reiniciándose constantemente**: Se han actualizado las configuraciones para resolver este problema.
2. **Problemas de conexión a bases de datos**: Se han mejorado los mecanismos de reconexión.
3. **Conflictos de puertos**: Se han resuelto los conflictos de puertos manteniendo consistencia entre puertos internos y externos.

## Contribuciones

Las contribuciones son bienvenidas. Por favor, sigue los estándares de codificación definidos en la documentación del proyecto.