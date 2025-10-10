# Puertos utilizados en el sistema de microservicios

Este documento define los puertos utilizados por cada servicio en el sistema para evitar conflictos y confusiones.

## Bases de Datos

| Servicio    | Puerto Interno | Puerto Externo | Descripción              |
|-------------|----------------|----------------|--------------------------|
| PostgreSQL  | 5432           | 5433           | Base de datos principal  |
| Redis       | 6379           | 6380           | Caché y sesiones         |
| MongoDB     | 27017          | 27018          | Base de datos NoSQL      |

## Servicio de Mensajería

| Servicio    | Puerto Interno | Puerto Externo | Descripción              |
|-------------|----------------|----------------|--------------------------|
| RabbitMQ    | 5672           | 5672           | Broker de mensajes AMQP  |
| RabbitMQ    | 15672          | 15672          | Interfaz web de gestión   |
| RabbitMQ    | 15692          | 15692          | Métricas para Prometheus |

## Exportadores de Métricas

| Servicio             | Puerto Interno | Puerto Externo | Descripción                         |
|----------------------|----------------|----------------|-------------------------------------|
| PostgreSQL Exporter  | 9187           | 9187           | Exportador de métricas de PostgreSQL|
| Redis Exporter       | 9121           | 9121           | Exportador de métricas de Redis     |
| MongoDB Exporter     | 9216           | 9216           | Exportador de métricas de MongoDB   |

## Servicios de Monitoreo

| Servicio    | Puerto Interno | Puerto Externo | Descripción              |
|-------------|----------------|----------------|--------------------------|
| Prometheus  | 9090           | 9090           | Sistema de monitoreo     |
| Grafana     | 3000           | 3009           | Visualización de métricas|

## API Gateway

| Servicio     | Puerto Interno | Puerto Externo | Descripción              |
|--------------|----------------|----------------|--------------------------|
| API Gateway  | 3000           | 3000           | Punto de entrada único   |

## Microservicios

| Servicio         | Puerto Interno | Puerto Externo | Descripción                    |
|------------------|----------------|----------------|--------------------------------|
| Auth Service     | 3001           | 3001           | Servicio de autenticación      |
| Product Service  | 3002           | 3002           | Gestión de productos           |
| User Service     | 3003           | 3003           | Gestión de usuarios            |
| Order Service    | 3004           | 3004           | Gestión de pedidos             |
| Cart Service     | 3005           | 3005           | Gestión de carritos de compra  |
| Wishlist Service | 3006           | 3006           | Lista de deseos                |
| Review Service   | 3007           | 3007           | Reseñas de productos           |
| Contact Service  | 3008           | 3008           | Formulario de contacto         |

## Notas importantes

1. Todos los puertos externos están mapeados a puertos internos con el mismo número, excepto donde se indica lo contrario.
2. Los puertos externos para bases de datos se han incrementado en 1 para evitar conflictos con instancias locales.
3. Los puertos para servicios de monitoreo y exportadores siguen los estándares de la industria.
4. Los microservicios utilizan puertos consecutivos desde el 3001 al 3008 para facilitar la identificación.
5. Los puertos de RabbitMQ se mantienen igual interna y externamente para facilitar la conexión desde otros servicios.

## Variables de entorno

Para configurar los puertos de los servicios, se pueden utilizar las siguientes variables de entorno:

- `AUTH_SERVICE_PORT=3001`
- `PRODUCT_SERVICE_PORT=3002`
- `USER_SERVICE_PORT=3003`
- `ORDER_SERVICE_PORT=3004`
- `CART_SERVICE_PORT=3005`
- `WISHLIST_SERVICE_PORT=3006`
- `REVIEW_SERVICE_PORT=3007`
- `CONTACT_SERVICE_PORT=3008`

Esto permite personalizar los puertos sin modificar el código fuente.

## Problemas conocidos

1. **RabbitMQ**: Se han resuelto los problemas de puertos al mantener los mismos puertos internos y externos, lo que simplifica la configuración de conexión.
2. **Servicios reiniciándose**: Se han actualizado las configuraciones de Docker y los archivos de código para resolver problemas de reinicio constante en los servicios de autenticación y productos.