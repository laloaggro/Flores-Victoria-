# Arquitectura de Microservicios

## Índice

1. [Visión General](#visión-general)
2. [API Gateway](#api-gateway)
3. [Auth Service](#auth-service)
4. [Product Service](#product-service)
5. [User Service](#user-service)
6. [Order Service](#order-service)
7. [Cart Service](#cart-service)
8. [Wishlist Service](#wishlist-service)
9. [Review Service](#review-service)
10. [Contact Service](#contact-service)
11. [Comunicación entre Servicios](#comunicación-entre-servicios)
12. [Gestión de Configuración](#gestión-de-configuración)

## Visión General

El sistema Flores Victoria está construido sobre una arquitectura de microservicios que permite
escalar, mantener y desplegar componentes de forma independiente. Cada microservicio se ejecuta en
su propio contenedor Docker y tiene responsabilidades específicas.

## API Gateway

### Descripción

El API Gateway actúa como punto de entrada único para todas las solicitudes del cliente. Se encarga
de enrutar las solicitudes a los microservicios correspondientes, manejar CORS, autenticación básica
y balanceo de carga.

### Funciones Principales

- Enrutamiento de solicitudes
- Autenticación y autorización inicial
- Agregación de respuestas de múltiples servicios
- Manejo de CORS
- Balanceo de carga
- Logging de solicitudes
- Rate limiting

### Endpoints

- `GET /api/products/*` → Product Service
- `POST /api/auth/*` → Auth Service
- `GET /api/users/*` → User Service
- `POST /api/orders/*` → Order Service
- `GET /api/cart/*` → Cart Service
- `GET /api/wishlist/*` → Wishlist Service
- `POST /api/reviews/*` → Review Service
- `POST /api/contact/*` → Contact Service

### Variables de Entorno

```env
API_GATEWAY_PORT=3000
AUTH_SERVICE_URL=http://auth-service:3001
PRODUCT_SERVICE_URL=http://product-service:3002
USER_SERVICE_URL=http://user-service:3003
ORDER_SERVICE_URL=http://order-service:3004
CART_SERVICE_URL=http://cart-service:3005
WISHLIST_SERVICE_URL=http://wishlist-service:3006
REVIEW_SERVICE_URL=http://review-service:3007
CONTACT_SERVICE_URL=http://contact-service:3008
```

## Auth Service

### Descripción

Servicio de autenticación y autorización. Gestiona el registro de usuarios, inicio de sesión,
generación y validación de tokens JWT, recuperación de contraseñas y gestión de roles.

### Funciones Principales

- Registro de nuevos usuarios
- Inicio de sesión y generación de tokens JWT
- Validación de tokens en solicitudes protegidas
- Gestión de roles y permisos
- Recuperación de contraseñas
- Integración con OAuth para autenticación social

### Endpoints

- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Inicio de sesión
- `POST /api/auth/refresh` - Renovación de token
- `GET /api/auth/profile` - Obtener perfil de usuario
- `PUT /api/auth/profile` - Actualizar perfil de usuario
- `POST /api/auth/forgot-password` - Solicitar recuperación de contraseña
- `POST /api/auth/reset-password` - Restablecer contraseña

### Variables de Entorno

```env
AUTH_SERVICE_PORT=3001
JWT_SECRET=secreto_para_firmar_tokens
JWT_EXPIRES_IN=24h
DB_HOST=postgres
DB_PORT=5432
DB_NAME=flores_db
DB_USER=flores_user
DB_PASSWORD=flores_password
```

## Product Service

### Descripción

Gestiona todo lo relacionado con los productos del catálogo. Almacena información de productos en
MongoDB para aprovechar la flexibilidad del esquema.

### Funciones Principales

- Creación, lectura, actualización y eliminación de productos
- Gestión de categorías y subcategorías
- Búsqueda y filtrado de productos
- Gestión de inventario
- Imágenes y descripciones de productos

### Endpoints

- `GET /api/products` - Listar productos
- `GET /api/products/:id` - Obtener producto por ID
- `POST /api/products` - Crear nuevo producto
- `PUT /api/products/:id` - Actualizar producto
- `DELETE /api/products/:id` - Eliminar producto
- `GET /api/categories` - Listar categorías
- `POST /api/categories` - Crear nueva categoría

### Variables de Entorno

```env
PRODUCT_SERVICE_PORT=3002
MONGODB_URI=mongodb://mongodb:27017/flores_victoria
```

## User Service

### Descripción

Gestiona perfiles de usuarios y preferencias. Se conecta a PostgreSQL para almacenar información
estructurada de usuarios.

### Funciones Principales

- Gestión de perfiles de usuario
- Almacenamiento de preferencias del usuario
- Historial de pedidos del usuario
- Direcciones de envío
- Información de contacto

### Endpoints

- `GET /api/users/:id` - Obtener perfil de usuario
- `PUT /api/users/:id` - Actualizar perfil de usuario
- `GET /api/users/:id/orders` - Obtener historial de pedidos
- `POST /api/users/:id/addresses` - Agregar dirección de envío
- `GET /api/users/:id/wishlist` - Obtener lista de deseos

### Variables de Entorno

```env
USER_SERVICE_PORT=3003
DB_HOST=postgres
DB_PORT=5432
DB_NAME=flores_db
DB_USER=flores_user
DB_PASSWORD=flores_password
```

## Order Service

### Descripción

Procesamiento de pedidos. Gestiona todo el ciclo de vida de los pedidos desde su creación hasta la
finalización.

### Funciones Principales

- Creación y procesamiento de pedidos
- Gestión de estados de pedido (pendiente, procesando, enviado, entregado, cancelado)
- Cálculo de totales y descuentos
- Integración con sistemas de pago
- Generación de facturas

### Endpoints

- `GET /api/orders` - Listar pedidos
- `GET /api/orders/:id` - Obtener pedido por ID
- `POST /api/orders` - Crear nuevo pedido
- `PUT /api/orders/:id/status` - Actualizar estado de pedido
- `GET /api/orders/user/:userId` - Obtener pedidos de un usuario

### Variables de Entorno

```env
ORDER_SERVICE_PORT=3004
```

## Cart Service

### Descripción

Gestiona carritos de compra de usuarios. Utiliza Redis para almacenamiento en memoria caché,
permitiendo operaciones rápidas.

### Funciones Principales

- Agregar productos al carrito
- Eliminar productos del carrito
- Actualizar cantidades
- Calcular totales
- Persistencia temporal de carritos

### Endpoints

- `GET /api/cart/:userId` - Obtener carrito de usuario
- `POST /api/cart/:userId/items` - Agregar item al carrito
- `PUT /api/cart/:userId/items/:productId` - Actualizar cantidad de item
- `DELETE /api/cart/:userId/items/:productId` - Eliminar item del carrito
- `DELETE /api/cart/:userId` - Vaciar carrito

### Variables de Entorno

```env
CART_SERVICE_PORT=3005
REDIS_HOST=redis
REDIS_PORT=6379
```

## Wishlist Service

### Descripción

Lista de deseos de usuarios. Similar al carrito, utiliza Redis para almacenamiento en caché.

### Funciones Principales

- Agregar productos a la lista de deseos
- Eliminar productos de la lista de deseos
- Listar productos en la lista de deseos

### Endpoints

- `GET /api/wishlist/:userId` - Obtener lista de deseos
- `POST /api/wishlist/:userId/items` - Agregar item a la lista de deseos
- `DELETE /api/wishlist/:userId/items/:productId` - Eliminar item de la lista de deseos

### Variables de Entorno

```env
WISHLIST_SERVICE_PORT=3006
REDIS_HOST=redis
REDIS_PORT=6379
```

## Review Service

### Descripción

Sistema de reseñas y calificaciones de productos.

### Funciones Principales

- Crear reseñas de productos
- Calificar productos
- Listar reseñas de productos
- Moderación de reseñas

### Endpoints

- `GET /api/reviews/product/:productId` - Obtener reseñas de un producto
- `POST /api/reviews` - Crear nueva reseña
- `PUT /api/reviews/:id` - Actualizar reseña
- `DELETE /api/reviews/:id` - Eliminar reseña

### Variables de Entorno

```env
REVIEW_SERVICE_PORT=3007
```

## Contact Service

### Descripción

Gestión de consultas de contacto. Permite a los usuarios enviar mensajes a través de formularios de
contacto.

### Funciones Principales

- Recepción de mensajes de contacto
- Envío de correos electrónicos
- Almacenamiento de consultas

### Endpoints

- `POST /api/contact` - Enviar mensaje de contacto

### Variables de Entorno

```env
CONTACT_SERVICE_PORT=3008
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_contraseña_de_aplicacion
```

## Comunicación entre Servicios

### Protocolos de Comunicación

- **HTTP/REST**: Comunicación síncrona entre API Gateway y microservicios
- **AMQP/RabbitMQ**: Comunicación asíncrona para notificaciones y procesamiento en segundo plano
- **gRPC** (futuro): Para comunicación de alto rendimiento entre servicios internos

### Patrones de Comunicación

1. **Síncrona**: Cliente → API Gateway → Microservicio
2. **Asíncrona**: Microservicio → RabbitMQ → Otro Microservicio/Consumidor

### Manejo de Errores

- Códigos de estado HTTP estándar
- Mensajes de error estructurados
- Circuit Breaker para prevenir fallos en cascada
- Retry policies con backoff exponencial

## Gestión de Configuración

### Variables de Entorno

Cada microservicio utiliza variables de entorno para su configuración. Estas se definen en el
archivo `.env` y se pasan a los contenedores a través de docker-compose.

### Configuración Compartida

- URLs de otros servicios
- Credenciales de bases de datos
- Configuración de mensajería
- Configuración de monitorización
- Configuración de seguridad

### Mejores Prácticas

- No almacenar secretos en el código
- Utilizar secretos de Docker/Kubernetes en producción
- Validar configuraciones al inicio
- Proporcionar valores por defecto razonables
