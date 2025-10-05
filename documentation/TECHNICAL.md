# Documentación Técnica Detallada - Arreglos Victoria

## 1. Tecnologías Utilizadas

### Frontend
- **Vite**: Bundler y servidor de desarrollo
- **HTML/CSS/JavaScript**: Tecnologías base

### Backend y Microservicios
- **Node.js**: Entorno de ejecución JavaScript
- **Express.js**: Framework web para Node.js
- **MongoDB**: Base de datos NoSQL
- **PostgreSQL**: Base de datos relacional
- **Redis**: Sistema de caché
- **RabbitMQ**: Message broker

### Infraestructura
- **Docker**: Contenerización
- **docker-compose**: Orquestación de contenedores
- **Prometheus**: Métricas
- **Grafana**: Visualización de métricas

## 2. Estructura del Proyecto

```
arreglos-victoria/
├── frontend/              # Aplicación cliente
├── microservices/         # Microservicios
│   ├── api-gateway/       # Gateway de API
│   ├── auth-service/      # Servicio de autenticación
│   ├── user-service/      # Servicio de usuarios
│   ├── product-service/   # Servicio de productos
│   ├── cart-service/      # Servicio de carrito
│   ├── order-service/     # Servicio de órdenes
│   ├── review-service/    # Servicio de reseñas
│   ├── contact-service/   # Servicio de contacto
│   ├── wishlist-service/  # Servicio de lista de deseos
│   └── shared/            # Componentes compartidos
├── documentation/         # Documentación del proyecto
└── docker-compose.yml     # Configuración de despliegue
```

## 3. Especificaciones de Microservicios

### API Gateway
- **Puerto**: 8000
- **Función**: Enrutamiento de solicitudes, autenticación básica
- **Tecnologías**: Node.js, Express

### Auth Service
- **Puerto**: 3001
- **Función**: Registro, inicio de sesión, gestión de tokens JWT
- **Endpoints principales**:
  - POST /register - Registro de nuevos usuarios
  - POST /login - Inicio de sesión
  - POST /logout - Cierre de sesión
  - GET /verify - Verificación de tokens

### User Service
- **Puerto**: 3002
- **Función**: Gestión de perfiles de usuario
- **Endpoints principales**:
  - GET /users/:id - Obtener información de usuario
  - PUT /users/:id - Actualizar perfil de usuario
  - DELETE /users/:id - Eliminar cuenta de usuario

### Product Service
- **Puerto**: 3003
- **Función**: Catálogo de productos
- **Endpoints principales**:
  - GET /products - Listar productos
  - GET /products/:id - Obtener detalles de producto
  - POST /products - Crear nuevo producto (admin)
  - PUT /products/:id - Actualizar producto (admin)
  - DELETE /products/:id - Eliminar producto (admin)

### Cart Service
- **Puerto**: 3004
- **Función**: Manejo del carrito de compras
- **Endpoints principales**:
  - GET /cart - Obtener carrito del usuario
  - POST /cart/items - Agregar item al carrito
  - PUT /cart/items/:id - Actualizar cantidad de item
  - DELETE /cart/items/:id - Eliminar item del carrito
  - DELETE /cart - Vaciar carrito

### Order Service
- **Puerto**: 3005
- **Función**: Procesamiento de órdenes
- **Endpoints principales**:
  - POST /orders - Crear nueva orden
  - GET /orders - Listar órdenes del usuario
  - GET /orders/:id - Obtener detalles de orden
  - PUT /orders/:id/status - Actualizar estado de orden (admin)

### Review Service
- **Puerto**: 3006
- **Función**: Sistema de reseñas
- **Endpoints principales**:
  - POST /reviews - Crear nueva reseña
  - GET /reviews/product/:productId - Obtener reseñas de producto
  - PUT /reviews/:id - Actualizar reseña
  - DELETE /reviews/:id - Eliminar reseña

### Contact Service
- **Puerto**: 3007
- **Función**: Formulario de contacto
- **Endpoints principales**:
  - POST /contact - Enviar mensaje de contacto

### Wishlist Service
- **Puerto**: 3008
- **Función**: Lista de deseos
- **Endpoints principales**:
  - GET /wishlist - Obtener lista de deseos
  - POST /wishlist/items - Agregar item a lista de deseos
  - DELETE /wishlist/items/:id - Eliminar item de lista de deseos

## 4. Bases de Datos

### MongoDB
- **Uso principal**: Almacenamiento de productos, usuarios, órdenes
- **Colecciones**:
  - users: Información de usuarios
  - products: Catálogo de productos
  - orders: Órdenes de compra
  - reviews: Reseñas de productos

### PostgreSQL
- **Uso principal**: Almacenamiento de datos transaccionales
- **Tablas**:
  - cart_items: Items en carritos de usuarios
  - wishlist_items: Items en listas de deseos

### Redis
- **Uso principal**: Caché de datos frecuentes
- **Datos cacheados**:
  - Información de productos populares
  - Sesiones de usuario

## 5. Message Broker (RabbitMQ)

### Colas
- **order.notifications**: Notificaciones de nuevas órdenes
- **user.events**: Eventos relacionados con usuarios
- **product.events**: Eventos relacionados con productos

## 6. Variables de Entorno

Cada microservicio utiliza variables de entorno para su configuración. Estas se definen en archivos `.env` o se pasan al ejecutar los contenedores Docker.

## 7. Despliegue con Docker

El proyecto utiliza docker-compose para orquestar todos los servicios. Los archivos principales son:
- `docker-compose.yml`: Configuración de producción
- `docker-compose.dev.yml`: Configuración de desarrollo

## 8. Monitoreo

### Prometheus
- **Puerto**: 9090
- **Función**: Recopilación de métricas de todos los servicios

### Grafana
- **Puerto**: 3000
- **Función**: Visualización de métricas en dashboards

## 9. Seguridad

- Autenticación con JWT
- Validación de entrada en todos los endpoints
- Rate limiting para prevenir abusos
- HTTPS en producción