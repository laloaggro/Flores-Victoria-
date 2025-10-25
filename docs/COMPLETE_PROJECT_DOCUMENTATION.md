# Documentación Completa del Proyecto Flores Victoria v3.0

**Fecha de actualización:** 24 de Octubre de 2025  
**Estado:** ✅ **Servicios Core Operativos** (Admin Panel, AI Service, Order Service)

## Índice

1. [Descripción General](#descripción-general)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Microservicios](#microservicios)
   - [API Gateway](#api-gateway)
   - [Auth Service](#auth-service)
   - [Product Service](#product-service)
   - [User Service](#user-service)
   - [Order Service](#order-service)
   - [Cart Service](#cart-service)
   - [Wishlist Service](#wishlist-service)
   - [Review Service](#review-service)
   - [Contact Service](#contact-service)
4. [Infraestructura y Bases de Datos](#infraestructura-y-bases-de-datos)
   - [MongoDB](#mongodb)
   - [PostgreSQL](#postgresql)
   - [Redis](#redis)
   - [RabbitMQ](#rabbitmq)
5. [Interfaces de Usuario](#interfaces-de-usuario)
   - [Frontend](#frontend)
   - [Panel de Administración](#panel-de-administración)
6. [Monitorización y Observabilidad](#monitorización-y-observabilidad)
   - [Jaeger](#jaeger)
   - [Prometheus](#prometheus)
   - [Grafana](#grafana)
7. [Configuración y Variables de Entorno](#configuración-y-variables-de-entorno)
8. [Despliegue](#despliegue)
9. [Scripts y Utilidades](#scripts-y-utilidades)
10. [Flujos de Trabajo](#flujos-de-trabajo)

## Descripción General

Flores Victoria es una plataforma de comercio electrónico completa basada en microservicios para una
florería. Utiliza tecnologías modernas como Node.js, Express, MongoDB, PostgreSQL y Docker para
proporcionar una solución escalable y mantenible.

La plataforma permite a los usuarios navegar por productos florales, realizar pedidos, gestionar
carritos de compras, dejar reseñas, y más. Para el personal administrativo, proporciona un panel de
control completo para gestionar productos, pedidos, usuarios y contenido.

## Arquitectura del Sistema

La arquitectura del sistema se basa en microservicios independientes que se comunican a través de
una API Gateway. Cada microservicio tiene su propia base de datos y responsabilidades específicas,
siguiendo el principio de separación de preocupaciones.

```
Clientes
    ↓
Frontend (Vue.js/HTML/CSS/JS) ←→ API Gateway ←→ Microservicios
    ↓                                  ↓
Panel Admin                    Bases de Datos (MongoDB, PostgreSQL, Redis)
                               Mensajería (RabbitMQ)
                               Monitorización (Jaeger, Prometheus, Grafana)
```

### Componentes Principales

1. **Admin Panel** ✅ - Interfaz de gestión administrativa (Puerto 3021)
2. **AI Service** ✅ - Sistema de recomendaciones e IA (Puerto 3002)
3. **Order Service** ✅ - Gestión de pedidos y transacciones (Puerto 3004)
4. **Frontend** 🔄 - Interfaz de usuario para clientes (En desarrollo)
5. **API Gateway** 🔄 - Punto de entrada único (En planificación)
6. **Bases de Datos** 🔄 - Almacenamiento persistente (Simulado)
7. **Sistema de Mensajería** 🔄 - Comunicación asíncrona (Planificado)
8. **Monitorización** 🔄 - Observabilidad del sistema (Básica)

## Microservicios

### API Gateway

**Puerto**: 3000 **Descripción**: Punto de entrada único para todas las solicitudes de la API. Se
encarga de enrutar las solicitudes a los microservicios correspondientes, manejar CORS,
autenticación básica y balanceo de carga.

**Funciones principales**:

- Enrutamiento de solicitudes
- Autenticación y autorización inicial
- Agregación de respuestas de múltiples servicios
- Manejo de CORS
- Balanceo de carga
- Logging de solicitudes

**Variables de entorno**:

- `API_GATEWAY_PORT=3000`
- `AUTH_SERVICE_URL=http://auth-service:3001`
- `PRODUCT_SERVICE_URL=http://product-service:3002`
- `USER_SERVICE_URL=http://user-service:3003`
- `ORDER_SERVICE_URL=http://order-service:3004`
- `CART_SERVICE_URL=http://cart-service:3005`
- `WISHLIST_SERVICE_URL=http://wishlist-service:3006`
- `REVIEW_SERVICE_URL=http://review-service:3007`
- `CONTACT_SERVICE_URL=http://contact-service:3008`

### AI Service ✅ ACTIVO

**Puerto**: 3002 **Descripción**: Sistema de inteligencia artificial para recomendaciones de productos, 
chatbot de atención al cliente y análisis de comportamiento de usuarios.

**Estado**: ✅ **COMPLETAMENTE FUNCIONAL**  
**URL**: http://localhost:3002/ai/recommendations  
**Health Check**: http://localhost:3002/health

**Funciones principales implementadas**:

- ✅ Sistema de recomendaciones inteligentes
- ✅ Chatbot de atención al cliente
- ✅ Analytics y métricas de uso
- ✅ API REST completa
- ✅ Respuestas en tiempo real

**Endpoints principales**:

- `GET /health` - Health check del servicio
- `GET /ai/recommendations` - Obtener recomendaciones de productos
- `POST /ai/chat` - Interactuar con chatbot
- `GET /ai/analytics` - Obtener métricas y analytics

**Variables de entorno**:

- `AI_SERVICE_PORT=3002`
- `NODE_ENV=development`

### Auth Service

**Puerto**: 3001 **Descripción**: Servicio de autenticación y autorización. Gestiona el registro de
usuarios, inicio de sesión, generación y validación de tokens JWT, recuperación de contraseñas y
gestión de roles.

**Funciones principales**:

- Registro de nuevos usuarios
- Inicio de sesión y generación de tokens JWT
- Validación de tokens en solicitudes protegidas
- Gestión de roles y permisos
- Recuperación de contraseñas
- Integración con OAuth para autenticación social

**Endpoints principales**:

- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Inicio de sesión
- `POST /api/auth/refresh` - Renovación de token
- `GET /api/auth/profile` - Obtener perfil de usuario
- `PUT /api/auth/profile` - Actualizar perfil de usuario

**Variables de entorno**:

- `AUTH_SERVICE_PORT=3001`
- `JWT_SECRET=secreto_para_firmar_tokens`
- `JWT_EXPIRES_IN=24h`

### Product Service

**Puerto**: 3002 **Descripción**: Gestiona todo lo relacionado con los productos del catálogo.
Almacena información de productos en MongoDB para aprovechar la flexibilidad del esquema.

**Funciones principales**:

- Creación, lectura, actualización y eliminación de productos
- Gestión de categorías y subcategorías
- Búsqueda y filtrado de productos
- Gestión de inventario
- Imágenes y descripciones de productos

**Endpoints principales**:

- `GET /api/products` - Listar productos
- `GET /api/products/:id` - Obtener producto por ID
- `POST /api/products` - Crear nuevo producto
- `PUT /api/products/:id` - Actualizar producto
- `DELETE /api/products/:id` - Eliminar producto
- `GET /api/categories` - Listar categorías

**Variables de entorno**:

- `PRODUCT_SERVICE_PORT=3002`
- `MONGODB_URI=mongodb://mongodb:27017/flores_victoria`

### User Service

**Puerto**: 3003 **Descripción**: Gestiona perfiles de usuarios y preferencias. Se conecta a
PostgreSQL para almacenar información estructurada de usuarios.

**Funciones principales**:

- Gestión de perfiles de usuario
- Almacenamiento de preferencias del usuario
- Historial de pedidos del usuario
- Direcciones de envío
- Información de contacto

**Endpoints principales**:

- `GET /api/users/:id` - Obtener perfil de usuario
- `PUT /api/users/:id` - Actualizar perfil de usuario
- `GET /api/users/:id/orders` - Obtener historial de pedidos
- `POST /api/users/:id/addresses` - Agregar dirección de envío
- `GET /api/users/:id/wishlist` - Obtener lista de deseos

**Variables de entorno**:

- `USER_SERVICE_PORT=3003`
- `DB_HOST=postgres`
- `DB_PORT=5432`
- `DB_NAME=flores_db`
- `DB_USER=flores_user`
- `DB_PASSWORD=flores_password`

### Order Service ✅ ACTIVO

**Puerto**: 3004 **Descripción**: Procesamiento de pedidos. Gestiona todo el ciclo de vida de los
pedidos desde su creación hasta la finalización.

**Estado**: ✅ **COMPLETAMENTE FUNCIONAL**  
**URL**: http://localhost:3004/api/orders  
**Health Check**: http://localhost:3004/health

**Funciones principales implementadas**:

- ✅ Creación y procesamiento de pedidos
- ✅ Gestión de estados de pedido (Pendiente, En preparación, En camino, Completado, Cancelado)
- ✅ Cálculo automático de totales
- ✅ Validación de datos de entrada
- ✅ API REST completa con CRUD operations
- ✅ Simulación de datos realistas

**Endpoints principales**:

- `GET /api/orders` - Listar pedidos
- `GET /api/orders/:id` - Obtener pedido por ID
- `POST /api/orders` - Crear nuevo pedido
- `PUT /api/orders/:id/status` - Actualizar estado de pedido
- `GET /api/orders/user/:userId` - Obtener pedidos de un usuario

**Variables de entorno**:

- `ORDER_SERVICE_PORT=3004`

### Cart Service

**Puerto**: 3005 **Descripción**: Gestiona carritos de compra de usuarios. Utiliza Redis para
almacenamiento en memoria caché, permitiendo operaciones rápidas.

**Funciones principales**:

- Agregar productos al carrito
- Eliminar productos del carrito
- Actualizar cantidades
- Calcular totales
- Persistencia temporal de carritos

**Endpoints principales**:

- `GET /api/cart/:userId` - Obtener carrito de usuario
- `POST /api/cart/:userId/items` - Agregar item al carrito
- `PUT /api/cart/:userId/items/:productId` - Actualizar cantidad de item
- `DELETE /api/cart/:userId/items/:productId` - Eliminar item del carrito
- `DELETE /api/cart/:userId` - Vaciar carrito

**Variables de entorno**:

- `CART_SERVICE_PORT=3005`
- `REDIS_HOST=redis`
- `REDIS_PORT=6379`

### Wishlist Service

**Puerto**: 3006 **Descripción**: Lista de deseos de usuarios. Similar al carrito, utiliza Redis
para almacenamiento en caché.

**Funciones principales**:

- Agregar productos a la lista de deseos
- Eliminar productos de la lista de deseos
- Listar productos en la lista de deseos

**Endpoints principales**:

- `GET /api/wishlist/:userId` - Obtener lista de deseos
- `POST /api/wishlist/:userId/items` - Agregar item a la lista de deseos
- `DELETE /api/wishlist/:userId/items/:productId` - Eliminar item de la lista de deseos

**Variables de entorno**:

- `WISHLIST_SERVICE_PORT=3006`
- `REDIS_HOST=redis`
- `REDIS_PORT=6379`

### Review Service

**Puerto**: 3007 **Descripción**: Sistema de reseñas y calificaciones de productos.

**Funciones principales**:

- Crear reseñas de productos
- Calificar productos
- Listar reseñas de productos
- Moderación de reseñas

**Endpoints principales**:

- `GET /api/reviews/product/:productId` - Obtener reseñas de un producto
- `POST /api/reviews` - Crear nueva reseña
- `PUT /api/reviews/:id` - Actualizar reseña
- `DELETE /api/reviews/:id` - Eliminar reseña

**Variables de entorno**:

- `REVIEW_SERVICE_PORT=3007`

### Contact Service

**Puerto**: 3008 **Descripción**: Gestión de consultas de contacto. Permite a los usuarios enviar
mensajes a través de formularios de contacto.

**Funciones principales**:

- Recepción de mensajes de contacto
- Envío de correos electrónicos
- Almacenamiento de consultas

**Endpoints principales**:

- `POST /api/contact` - Enviar mensaje de contacto

**Variables de entorno**:

- `CONTACT_SERVICE_PORT=3008`
- `EMAIL_HOST=smtp.gmail.com`
- `EMAIL_PORT=587`
- `EMAIL_SECURE=false`
- `EMAIL_USER=tu_email@gmail.com`
- `EMAIL_PASS=tu_contraseña_de_aplicacion`

## Infraestructura y Bases de Datos

### MongoDB

**Puerto interno**: 27017 **Puerto externo**: 27018 **Descripción**: Base de datos NoSQL utilizada
por el Product Service para almacenar información de productos debido a su esquema flexible.

**Características**:

- Almacenamiento de documentos JSON
- Esquema flexible
- Alta disponibilidad
- Escalabilidad horizontal

**Uso principal**:

- Productos
- Categorías
- Imágenes de productos

### PostgreSQL

**Puerto interno**: 5432 **Puerto externo**: 5433 **Descripción**: Base de datos relacional
utilizada por el User Service y Auth Service para almacenar información estructurada de usuarios.

**Características**:

- ACID compliance
- Relaciones entre tablas
- Transacciones
- SQL avanzado

**Uso principal**:

- Usuarios
- Perfiles
- Historial de pedidos
- Direcciones

### Redis

**Puerto interno**: 6379 **Puerto externo**: 6380 **Descripción**: Almacén en memoria utilizado por
Cart Service y Wishlist Service para operaciones rápidas de lectura/escritura.

**Características**:

- Almacenamiento en memoria
- Estructuras de datos avanzadas
- Alta velocidad
- Publicación/Suscripción

**Uso principal**:

- Carritos de compra
- Listas de deseos
- Sesiones de usuario
- Caché de datos

### RabbitMQ

**Puerto interno AMQP**: 5672 **Puerto externo AMQP**: 5672 **Puerto interno Management**: 15672
**Puerto externo Management**: 15672 **Descripción**: Broker de mensajes AMQP para comunicación
asíncrona entre microservicios.

**Características**:

- Mensajería asíncrona
- Colas de mensajes
- Garantía de entrega
- Interfaz web de gestión

**Uso principal**:

- Notificaciones
- Procesamiento en segundo plano
- Desacoplamiento de servicios

## Interfaces de Usuario

### Frontend

**Puerto**: 5175 **Tecnología**: HTML, CSS, JavaScript (Vite) **Descripción**: Interfaz de usuario
principal para clientes. Permite navegar por productos, realizar compras, gestionar cuentas y más.

**Componentes principales**:

- Página de inicio
- Catálogo de productos
- Detalles de producto
- Carrito de compras
- Proceso de checkout
- Perfil de usuario
- Historial de pedidos
- Lista de deseos
- Formulario de contacto

**Características**:

- Diseño responsive
- Optimizado para móviles
- Accesible
- Rápido y eficiente

### Panel de Administración

**Puerto**: 3010 **Tecnología**: HTML, CSS, JavaScript **Descripción**: Interfaz para gestión
administrativa. Permite a los administradores gestionar productos, pedidos, usuarios y contenido.

**Páginas principales**:

- Dashboard de administración
- Gestión de productos
- Gestión de pedidos
- Gestión de usuarios
- Estadísticas y reportes

**Características**:

- Interfaz intuitiva
- Funciones de administración completas
- Seguridad reforzada
- Acceso restringido

## Monitorización y Observabilidad

### Jaeger

**Puerto UI**: 16686 **Puerto collector**: 14268 **Descripción**: Sistema de tracing distribuido
para monitorear solicitudes a través de múltiples microservicios.

**Características**:

- Seguimiento de solicitudes
- Análisis de latencia
- Visualización de dependencias
- Búsqueda y filtrado de trazas

**Uso**:

- Identificar cuellos de botella
- Monitorear rendimiento
- Depurar problemas complejos

### Prometheus

**Puerto**: 9090 **Descripción**: Sistema de monitoreo y alerta basado en métricas.

**Características**:

- Recopilación de métricas
- Sistema de alertas
- Consultas poderosas (PromQL)
- Integración con múltiples servicios

**Uso**:

- Monitoreo de recursos
- Alertas de rendimiento
- Métricas de negocio

### Grafana

**Puerto**: 3009 **Descripción**: Plataforma de análisis y visualización de métricas.

**Características**:

- Dashboards personalizados
- Visualizaciones avanzadas
- Integración con múltiples fuentes de datos
- Alertas visuales

**Uso**:

- Visualización de métricas del sistema
- Dashboards de rendimiento
- Monitoreo en tiempo real

## Configuración y Variables de Entorno

El proyecto utiliza variables de entorno para la configuración. Estas se definen en el archivo
`.env` y se pasan a los contenedores a través de docker-compose.

### Variables principales

**API Gateway**:

```
AUTH_SERVICE_URL=http://auth-service:3001
PRODUCT_SERVICE_URL=http://product-service:3002
USER_SERVICE_URL=http://user-service:3003
ORDER_SERVICE_URL=http://order-service:3004
CART_SERVICE_URL=http://cart-service:3005
WISHLIST_SERVICE_URL=http://wishlist-service:3006
REVIEW_SERVICE_URL=http://review-service:3007
CONTACT_SERVICE_URL=http://contact-service:3008
```

**Microservicios**:

```
AUTH_SERVICE_PORT=3001
PRODUCT_SERVICE_PORT=3002
USER_SERVICE_PORT=3003
ORDER_SERVICE_PORT=3004
CART_SERVICE_PORT=3005
WISHLIST_SERVICE_PORT=3006
REVIEW_SERVICE_PORT=3007
CONTACT_SERVICE_PORT=3008
```

**Bases de datos**:

```
MONGO_INITDB_ROOT_USERNAME=root
MONGO_INITDB_ROOT_PASSWORD=rootpassword
POSTGRES_USER=flores_user
POSTGRES_PASSWORD=flores_password
POSTGRES_DB=flores_db
REDIS_HOST=redis
REDIS_PORT=6379
```

**Sistema de mensajería**:

```
RABBITMQ_DEFAULT_USER=admin
RABBITMQ_DEFAULT_PASS=adminpassword
```

### Admin Panel ✅ ACTIVO

**Puerto**: 3020 **Descripción**: Panel de administración centralizado con centro de documentación 
integrado para gestión y monitoreo del sistema.

**Estado**: ✅ **COMPLETAMENTE FUNCIONAL**  
**URL**: http://localhost:3021  
**Documentación**: http://localhost:3021/documentation.html  
**Health Check**: http://localhost:3021/health

**Funcionalidades principales implementadas**:

- ✅ Panel de administración completo
- ✅ Centro de documentación integrado  
- ✅ Monitoreo básico de sistema
- ✅ Gestión centralizada de servicios
- ✅ Interfaz web responsive

**Archivos servidos**:

- Dashboard principal de administración
- Centro de documentación completo
- Assets estáticos (CSS, JS, imágenes)
- Reportes y análisis básicos

## Despliegue

### Modo Desarrollo (Servicios Core)

Para iniciar los servicios principales en modo desarrollo:

```bash
# Opción 1: Script npm
npm run start:core

# Opción 2: Script bash
./start-core-services.sh

# Opción 3: Servicios individuales
npm run start:admin    # Admin Panel (3021)
npm run start:ai       # AI Service (3002)  
npm run start:orders   # Order Service (3004)
```

### Docker Compose (Completo)

Para desplegar con Docker Compose:

```bash
docker-compose up -d
```

### Kubernetes

El proyecto incluye manifiestos de Kubernetes y Helm charts para despliegue en clústeres.

## Scripts y Utilidades

### Scripts principales ACTIVOS

- ✅ `start-core-services.sh`: Inicia servicios core (AI, Orders, Admin)
- ✅ `verificacion-final.sh`: Verificación completa de servicios activos
- ✅ `verificar-urls.sh`: Verifica URLs y endpoints del sistema
- `start-all.sh`: Inicia todos los servicios del sistema
- `stop-all.sh`: Detiene todos los servicios del sistema

### Directorios importantes

- `scripts/`: Contiene scripts de utilidad
- `docs/`: Documentación del proyecto
- `shared/`: Componentes compartidos entre microservicios
- `logs/`: Archivos de registro del sistema
- `backups/`: Copias de seguridad de bases de datos

## Flujos de Trabajo

### Registro de usuario

1. Usuario accede al frontend
2. Usuario hace clic en "Registrarse"
3. Usuario completa el formulario de registro
4. Frontend envía solicitud a API Gateway
5. API Gateway enruta a Auth Service
6. Auth Service crea usuario en PostgreSQL
7. Auth Service devuelve token JWT
8. Frontend almacena token y redirige al usuario

### Compra de producto

1. Usuario navega por productos en el frontend
2. Usuario selecciona un producto
3. Usuario agrega producto al carrito
4. Carrito se almacena en Redis
5. Usuario procede al checkout
6. Usuario confirma pedido
7. Frontend envía solicitud a API Gateway
8. API Gateway enruta a Order Service
9. Order Service crea pedido en su almacenamiento
10. Order Service envía notificación a través de RabbitMQ
11. Sistema de notificaciones procesa mensaje
12. Usuario recibe confirmación de pedido

### Administración de productos

1. Administrador accede al panel de administración
2. Administrador navega a "Gestión de productos"
3. Administrador crea/edita/elimina productos
4. Panel admin envía solicitud a API Gateway
5. API Gateway enruta a Product Service
6. Product Service actualiza MongoDB
7. Cambios se reflejan inmediatamente en el frontend

Esta documentación proporciona una visión completa del proyecto Flores Victoria, detallando todos
sus componentes, servicios, funciones y flujos de trabajo. Sirve como referencia para
desarrolladores, administradores y cualquier persona involucrada en el proyecto.
