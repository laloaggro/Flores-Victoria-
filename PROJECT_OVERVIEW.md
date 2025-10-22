# Flores Victoria - E-commerce Platform

## Descripción General

Flores Victoria es una plataforma de comercio electrónico completa basada en microservicios para una
florería. Utiliza tecnologías modernas como Node.js, Express, MongoDB, PostgreSQL y Docker para
proporcionar una solución escalable y mantenible.

## Arquitectura de Microservicios

### Componentes Principales

1. **API Gateway** - Punto de entrada único para todas las solicitudes
2. **Auth Service** - Servicio de autenticación y autorización
3. **Product Service** - Gestión de productos florales
4. **User Service** - Gestión de usuarios y perfiles
5. **Order Service** - Procesamiento de pedidos
6. **Cart Service** - Gestión de carritos de compra
7. **Wishlist Service** - Lista de deseos de usuarios
8. **Review Service** - Sistema de reseñas y calificaciones
9. **Contact Service** - Gestión de consultas de contacto

### Infraestructura y Herramientas

- **Bases de Datos**:
  - MongoDB (NoSQL para datos flexibles)
  - PostgreSQL (relacional para datos estructurados)
  - Redis (almacén en memoria para sesiones y caché)

- **Mensajería**:
  - RabbitMQ (broker de mensajes AMQP)

- **Monitorización y Observabilidad**:
  - Prometheus (métricas)
  - Grafana (visualización de métricas)
  - Jaeger (tracing distribuido)
  - Stack ELK (Elasticsearch, Logstash, Kibana) para logging centralizado

- **Despliegue**:
  - Docker y Docker Compose para contenerización
  - Kubernetes para orquestación en producción
  - CI/CD con GitHub Actions

## Puertos y Configuración

### Bases de Datos

| Servicio   | Puerto Interno | Puerto Externo | Descripción             |
| ---------- | -------------- | -------------- | ----------------------- |
| PostgreSQL | 5432           | 5433           | Base de datos principal |
| Redis      | 6379           | 6380           | Caché y sesiones        |
| MongoDB    | 27017          | 27018          | Base de datos NoSQL     |

### Servicio de Mensajería

| Servicio | Puerto Interno | Puerto Externo | Descripción             |
| -------- | -------------- | -------------- | ----------------------- |
| RabbitMQ | 5672           | 5672           | Broker de mensajes AMQP |
| RabbitMQ | 15672          | 15672          | Interfaz web de gestión |

### Servicios de Monitoreo

| Servicio   | Puerto Interno | Puerto Externo | Descripción               |
| ---------- | -------------- | -------------- | ------------------------- |
| Prometheus | 9090           | 9090           | Sistema de monitoreo      |
| Grafana    | 3000           | 3009           | Visualización de métricas |
| Jaeger     | 16686          | 16686          | Interfaz web de tracing   |

### API Gateway y Microservicios

| Servicio         | Puerto Interno | Puerto Externo | Descripción                   |
| ---------------- | -------------- | -------------- | ----------------------------- |
| API Gateway      | 3000           | 3000           | Punto de entrada único        |
| Auth Service     | 3001           | 3001           | Servicio de autenticación     |
| Product Service  | 3002           | 3002           | Gestión de productos          |
| User Service     | 3003           | 3003           | Gestión de usuarios           |
| Order Service    | 3004           | 3004           | Gestión de pedidos            |
| Cart Service     | 3005           | 3005           | Gestión de carritos de compra |
| Wishlist Service | 3006           | 3006           | Lista de deseos               |
| Review Service   | 3007           | 3007           | Reseñas de productos          |
| Contact Service  | 3008           | 3008           | Formulario de contacto        |

### Interfaces de Usuario

| Servicio        | Puerto Interno | Puerto Externo | Descripción                   |
| --------------- | -------------- | -------------- | ----------------------------- |
| Frontend (Vite) | 5175           | 5175           | Interfaz de usuario principal |
| Admin Panel     | 3010           | 3010           | Panel de administración       |

## Variables de Entorno Importantes

### API Gateway

- `AUTH_SERVICE_URL=http://auth-service:3001`
- `PRODUCT_SERVICE_URL=http://product-service:3002`
- `USER_SERVICE_URL=http://user-service:3003`
- `ORDER_SERVICE_URL=http://order-service:3004`
- `CART_SERVICE_URL=http://cart-service:3005`
- `WISHLIST_SERVICE_URL=http://wishlist-service:3006`
- `REVIEW_SERVICE_URL=http://review-service:3007`
- `CONTACT_SERVICE_URL=http://contact-service:3008`

### Microservicios

- `AUTH_SERVICE_PORT=3001`
- `PRODUCT_SERVICE_PORT=3002`
- `USER_SERVICE_PORT=3003`
- `ORDER_SERVICE_PORT=3004`
- `CART_SERVICE_PORT=3005`
- `WISHLIST_SERVICE_PORT=3006`
- `REVIEW_SERVICE_PORT=3007`
- `CONTACT_SERVICE_PORT=3008`

## Comandos Importantes

### Iniciar el sistema

```bash
./start-all.sh
```

### Detener el sistema

```bash
./stop-all.sh
```

### Verificar estado de los servicios

```bash
docker compose ps
```

## URLs de Acceso

- **Frontend**: http://localhost:5175
- **Admin Panel**: http://localhost:3010
- **API Gateway**: http://localhost:3000
- **Grafana**: http://localhost:3009
- **Prometheus**: http://localhost:9090
- **Jaeger**: http://localhost:16686
- **RabbitMQ Management**: http://localhost:15672

## Monitoreo y Mantenimiento

El sistema incluye capacidades avanzadas de monitoreo y mantenimiento:

1. **Diagnósticos Automáticos**: El sistema ejecuta diagnósticos completos cada 25 horas para
   garantizar el correcto funcionamiento de todos los servicios.

2. **Gestión de Logs**: Todos los diagnósticos y operaciones se registran en archivos de log que se
   almacenan durante 2 semanas antes de ser automáticamente eliminados para conservar espacio.

3. **Detección de Problemas**: El sistema monitorea continuamente el estado de los servicios,
   puertos y recursos del sistema, registrando cualquier evento inusual para su posterior análisis.

4. **Limpieza Automática**: Los recursos no utilizados de Docker se limpian periódicamente para
   mantener un rendimiento óptimo del sistema.

Para configurar los diagnósticos programados, ejecute:

```bash
./scripts/setup-scheduled-diagnostics.sh
```

## Auto-Fix de Problemas

El sistema incluye capacidades avanzadas de auto-fix para resolver automáticamente problemas
comunes:

1. **Verificación y corrección de permisos**: Comprueba y corrige automáticamente los permisos de
   los scripts
2. **Reinicio de servicios con errores**: Reinicia automáticamente contenedores que hayan fallado
3. **Limpieza de recursos**: Elimina contenedores detenidos, imágenes colgadas y otros recursos no
   utilizados
4. **Verificación de dependencias**: Comprueba la existencia de módulos y dependencias críticas

Para ejecutar el auto-fix manualmente:

```bash
./scripts/auto-fix-issues.sh
```

O utilizar el sistema de mantenimiento interactivo:

```bash
./scripts/system-maintenance.sh
```

El sistema de auto-fix genera registros detallados en el directorio `logs/` que documentan todas las
acciones realizadas y cualquier problema encontrado o resuelto.

## Problemas Conocidos y Soluciones

1. **Inconsistencias en documentación**: Asegurarse de que todos los documentos estén sincronizados
   con la implementación real.
2. **Problemas de comunicación entre servicios**: Verificar que la red de Docker esté correctamente
   configurada.
3. **Errores de configuración de puertos**: Validar que los puertos definidos en docker-compose.yml
   coincidan con la documentación.

## Recomendaciones

1. **Mantener la documentación actualizada**: Cualquier cambio en la configuración debe reflejarse
   inmediatamente en este documento.
2. **Verificar regularmente la consistencia**: Realizar revisiones periódicas para asegurar que la
   implementación coincida con la documentación.
3. **Implementar pruebas automatizadas**: Crear pruebas que verifiquen la disponibilidad y
   funcionamiento correcto de todos los servicios.
