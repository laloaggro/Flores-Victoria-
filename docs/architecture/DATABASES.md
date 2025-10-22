# Infraestructura y Bases de Datos

## Índice

1. [Visión General](#visión-general)
2. [MongoDB](#mongodb)
3. [PostgreSQL](#postgresql)
4. [Redis](#redis)
5. [RabbitMQ](#rabbitmq)
6. [Jaeger](#jaeger)
7. [Prometheus](#prometheus)
8. [Grafana](#grafana)
9. [Consideraciones de Seguridad](#consideraciones-de-seguridad)
10. [Backup y Recuperación](#backup-y-recuperación)

## Visión General

La infraestructura del sistema Flores Victoria utiliza múltiples tecnologías de almacenamiento y
mensajería para satisfacer las diferentes necesidades de los microservicios. Cada tecnología se ha
seleccionado basándose en sus fortalezas específicas para cada caso de uso.

## MongoDB

### Descripción

Base de datos NoSQL orientada a documentos utilizada por el Product Service para almacenar
información de productos debido a su esquema flexible.

### Características

- Almacenamiento de documentos JSON
- Esquema flexible
- Alta disponibilidad
- Escalabilidad horizontal

### Uso Principal

- Productos
- Categorías
- Imágenes de productos

### Configuración

```yaml
# En docker-compose.yml
mongodb:
  image: mongo:4.4
  container_name: flores-victoria-mongodb
  restart: unless-stopped
  environment:
    MONGO_INITDB_ROOT_USERNAME: root
    MONGO_INITDB_ROOT_PASSWORD: rootpassword
  ports:
    - '27018:27017'
  volumes:
    - mongodb-data:/data/db
  networks:
    - app-network
```

### Variables de Entorno

```env
MONGODB_URI=mongodb://root:rootpassword@mongodb:27017/flores_victoria
```

### Esquema de Datos

```javascript
// Colección de productos
{
  _id: ObjectId,
  name: String,
  description: String,
  price: Number,
  category: String,
  images: [String],
  stock: Number,
  createdAt: Date,
  updatedAt: Date
}

// Colección de categorías
{
  _id: ObjectId,
  name: String,
  description: String,
  parentId: ObjectId, // Para subcategorías
  createdAt: Date
}
```

## PostgreSQL

### Descripción

Base de datos relacional utilizada por el User Service y Auth Service para almacenar información
estructurada de usuarios.

### Características

- ACID compliance
- Relaciones entre tablas
- Transacciones
- SQL avanzado

### Uso Principal

- Usuarios
- Perfiles
- Historial de pedidos
- Direcciones

### Configuración

```yaml
# En docker-compose.yml
postgres:
  image: postgres:13
  container_name: flores-victoria-postgres
  restart: unless-stopped
  environment:
    POSTGRES_USER: flores_user
    POSTGRES_PASSWORD: flores_password
    POSTGRES_DB: flores_db
  ports:
    - '5433:5432'
  volumes:
    - postgres-data:/var/lib/postgresql/data
  networks:
    - app-network
```

### Variables de Entorno

```env
DB_HOST=postgres
DB_PORT=5432
DB_NAME=flores_db
DB_USER=flores_user
DB_PASSWORD=flores_password
```

### Esquema de Datos

```sql
-- Tabla de usuarios
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de direcciones
CREATE TABLE addresses (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  street VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(100),
  zip_code VARCHAR(20),
  country VARCHAR(100),
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de pedidos
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  total_amount DECIMAL(10, 2),
  status VARCHAR(50),
  shipping_address_id INTEGER REFERENCES addresses(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Redis

### Descripción

Almacén en memoria utilizado por Cart Service y Wishlist Service para operaciones rápidas de
lectura/escritura.

### Características

- Almacenamiento en memoria
- Estructuras de datos avanzadas
- Alta velocidad
- Publicación/Suscripción

### Uso Principal

- Carritos de compra
- Listas de deseos
- Sesiones de usuario
- Caché de datos

### Configuración

```yaml
# En docker-compose.yml
redis:
  image: redis:6-alpine
  container_name: flores-victoria-redis
  restart: unless-stopped
  ports:
    - '6380:6379'
  volumes:
    - redis-data:/data
  networks:
    - app-network
```

### Variables de Entorno

```env
REDIS_HOST=redis
REDIS_PORT=6379
```

### Estructura de Datos

```javascript
// Carrito de compras
// Key: cart:{userId}
// Type: HASH
{
  "{productId}": "{quantity}",
  "507f1f77bcf86cd799439011": "2",
  "507f1f77bcf86cd799439012": "1"
}

// Lista de deseos
// Key: wishlist:{userId}
// Type: SET
["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439013"]
```

## RabbitMQ

### Descripción

Broker de mensajes AMQP para comunicación asíncrona entre microservicios.

### Características

- Mensajería asíncrona
- Colas de mensajes
- Garantía de entrega
- Interfaz web de gestión

### Uso Principal

- Notificaciones
- Procesamiento en segundo plano
- Desacoplamiento de servicios

### Configuración

```yaml
# En docker-compose.yml
rabbitmq:
  image: rabbitmq:3-management-alpine
  container_name: flores-victoria-rabbitmq
  restart: unless-stopped
  ports:
    - '5672:5672'
    - '15672:15672'
  environment:
    - RABBITMQ_DEFAULT_USER=admin
    - RABBITMQ_DEFAULT_PASS=adminpassword
  networks:
    - app-network
  volumes:
    - rabbitmq-data:/var/lib/rabbitmq
```

### Variables de Entorno

```env
RABBITMQ_URL=amqp://admin:adminpassword@rabbitmq:5672
```

### Colas y Exchanges

```javascript
// Cola para notificaciones por email
const NOTIFICATION_QUEUE = 'notifications.email';

// Exchange para eventos de pedido
const ORDER_EXCHANGE = 'orders.events';

// Routing keys
const ORDER_CREATED = 'order.created';
const ORDER_UPDATED = 'order.updated';
const ORDER_CANCELLED = 'order.cancelled';
```

## Jaeger

### Descripción

Sistema de tracing distribuido para monitorear solicitudes a través de múltiples microservicios.

### Características

- Seguimiento de solicitudes
- Análisis de latencia
- Visualización de dependencias
- Búsqueda y filtrado de trazas

### Uso

- Identificar cuellos de botella
- Monitorear rendimiento
- Depurar problemas complejos

### Configuración

```yaml
# En docker-compose.yml
jaeger:
  image: jaegertracing/all-in-one:latest
  container_name: flores-victoria-jaeger
  restart: unless-stopped
  ports:
    - '5775:5775/udp'
    - '6831:6831/udp'
    - '6832:6832/udp'
    - '5778:5778'
    - '16686:16686'
    - '14268:14268'
    - '14250:14250'
  networks:
    - app-network
  environment:
    - COLLECTOR_ZIPKIN_HTTP_PORT=9411
```

### Variables de Entorno para Microservicios

```env
JAEGER_AGENT_HOST=jaeger
JAEGER_AGENT_PORT=6832
```

## Prometheus

### Descripción

Sistema de monitoreo y alerta basado en métricas.

### Características

- Recopilación de métricas
- Sistema de alertas
- Consultas poderosas (PromQL)
- Integración con múltiples servicios

### Uso

- Monitoreo de recursos
- Alertas de rendimiento
- Métricas de negocio

### Configuración

Prometheus se configura mediante archivos de configuración que especifican los endpoints de métricas
de cada servicio.

### Métricas Comunes

```javascript
// Contador de solicitudes HTTP
http_requests_total{method="GET", endpoint="/api/products"}

// Histograma de duración de solicitudes
http_request_duration_seconds_bucket{le="0.05"}

// Gauge de usuarios activos
active_users_count
```

## Grafana

### Descripción

Plataforma de análisis y visualización de métricas.

### Características

- Dashboards personalizados
- Visualizaciones avanzadas
- Integración con múltiples fuentes de datos
- Alertas visuales

### Uso

- Visualización de métricas del sistema
- Dashboards de rendimiento
- Monitoreo en tiempo real

### Configuración

Grafana se configura mediante dashboards que consumen datos de Prometheus y otras fuentes.

## Consideraciones de Seguridad

### Autenticación de Bases de Datos

- Todas las bases de datos requieren autenticación
- Se utilizan credenciales fuertes
- Las credenciales se almacenan en variables de entorno

### Cifrado

- Comunicación cifrada entre servicios cuando es posible
- Almacenamiento seguro de contraseñas (hashing)
- Protección de datos sensibles

### Acceso Restringido

- Puertos expuestos solo cuando es necesario
- Redes Docker aisladas
- Control de acceso basado en roles

## Backup y Recuperación

### Estrategias de Backup

- Backups automáticos diarios de bases de datos
- Retención de backups por 30 días
- Almacenamiento en ubicación separada

### Procedimientos de Recuperación

- Scripts automatizados para restauración
- Pruebas periódicas de recuperación
- Documentación de procedimientos de emergencia

### Herramientas de Backup

- `pg_dump` para PostgreSQL
- `mongodump` para MongoDB
- Snapshots de volúmenes Docker para Redis
