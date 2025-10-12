# API Gateway - Documentación Técnica

## Descripción General

El API Gateway actúa como punto de entrada único para todas las solicitudes de los clientes hacia los microservicios del sistema Flores Victoria. Es responsable de enrutar las solicitudes a los servicios apropiados, manejar la autenticación, implementar límites de tasa, registrar solicitudes y proporcionar un punto de agregación para respuestas complejas.

## Tecnologías

- Node.js
- Express.js
- JWT (para autenticación)
- Express Rate Limit (para límites de tasa)

## Arquitectura

### Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────┐
│                    Cliente (Web/App)                        │
└─────────────────────────────┬───────────────────────────────┘
                              │
                    ┌─────────▼─────────┐
                    │   API Gateway     │
                    │     (:8000)       │
                    └─────────┬─────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ Auth         │    │ Product      │    │ User         │
│ Service      │    │ Service      │    │ Service      │
│ (:3001)      │    │ (:3002)      │    │ (:3003)      │
└──────────────┘    └──────────────┘    └──────────────┘

        ▼                     ▼                     ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ Order        │    │ Cart         │    │ Wishlist     │
│ Service      │    │ Service      │    │ Service      │
│ (:3004)      │    │ (:3005)      │    │ (:3006)      │
└──────────────┘    └──────────────┘    └──────────────┘

        ▼                     ▼                     ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ Review       │    │ Contact      │    │              │
│ Service      │    │ Service      │    │              │
│ (:3007)      │    │ (:3008)      │    │              │
└──────────────┘    └──────────────┘    └──────────────┘
```

## Middleware

### Autenticación
- Verifica tokens JWT en las solicitudes protegidas
- Decodifica el token y agrega la información del usuario al objeto `req`
- Rechaza solicitudes con tokens inválidos o expirados

### Límites de Tasa
- Implementa límites de tasa para prevenir abusos
- Configuración por defecto: 100 solicitudes por ventana de 15 minutos
- Excluye solicitudes locales (127.0.0.1) de los límites

### Métricas
- Registra métricas de solicitudes HTTP
- Mide tiempos de respuesta
- Expone métricas en formato Prometheus

### Logging
- Registra todas las solicitudes entrantes
- Registra errores y eventos importantes
- Proporciona información de depuración

## Rutas

### Autenticación
- `POST /api/auth/register` → Auth Service
- `POST /api/auth/login` → Auth Service
- `GET /api/auth/verify` → Auth Service

### Usuarios
- `GET /api/users/profile` → User Service
- `PUT /api/users/profile` → User Service
- `DELETE /api/users/profile` → User Service

### Productos
- `GET /api/products` → Product Service
- `GET /api/products/:id` → Product Service
- `POST /api/products` → Product Service
- `PUT /api/products/:id` → Product Service
- `DELETE /api/products/:id` → Product Service

### Carrito
- `GET /api/cart` → Cart Service
- `POST /api/cart/items` → Cart Service
- `PUT /api/cart/items/:productId` → Cart Service
- `DELETE /api/cart/items/:productId` → Cart Service
- `DELETE /api/cart` → Cart Service

### Órdenes
- `POST /api/orders` → Order Service
- `GET /api/orders` → Order Service
- `GET /api/orders/:id` → Order Service
- `PUT /api/orders/:id/status` → Order Service

### Lista de Deseos
- `GET /api/wishlist` → Wishlist Service
- `POST /api/wishlist/items` → Wishlist Service
- `DELETE /api/wishlist/items/:productId` → Wishlist Service
- `DELETE /api/wishlist` → Wishlist Service

### Reseñas
- `GET /api/reviews/product/:productId` → Review Service
- `POST /api/reviews/product/:productId` → Review Service
- `PUT /api/reviews/:id` → Review Service
- `DELETE /api/reviews/:id` → Review Service

### Contacto
- `POST /api/contacts` → Contact Service
- `GET /api/contacts` → Contact Service
- `GET /api/contacts/:id` → Contact Service
- `PUT /api/contacts/:id` → Contact Service
- `DELETE /api/contacts/:id` → Contact Service

## Seguridad

### CORS
- Implementa políticas de CORS para permitir solicitudes desde el frontend
- Configurado para permitir solicitudes desde el dominio del frontend

### Helmet
- Utiliza Helmet para proteger contra vulnerabilidades web conocidas
- Establece cabeceras HTTP seguras

### Límites de Tasa
- Previene ataques de fuerza bruta y abusos
- Configurable por servicio o ruta

## Configuración

### Variables de Entorno
- `PORT`: Puerto en el que escucha el API Gateway (por defecto: 8000)
- `JWT_SECRET`: Secreto para verificar los tokens JWT
- `AUTH_SERVICE_URL`: URL del servicio de autenticación
- `USER_SERVICE_URL`: URL del servicio de usuarios
- `PRODUCT_SERVICE_URL`: URL del servicio de productos
- `ORDER_SERVICE_URL`: URL del servicio de órdenes
- `CART_SERVICE_URL`: URL del servicio de carrito
- `WISHLIST_SERVICE_URL`: URL del servicio de lista de deseos
- `REVIEW_SERVICE_URL`: URL del servicio de reseñas
- `CONTACT_SERVICE_URL`: URL del servicio de contacto

## Despliegue

### Docker
El API Gateway se puede desplegar usando Docker con el siguiente comando:

```bash
docker build -t floresvictoria/api-gateway .
docker run -p 8000:8000 --env-file .env floresvictoria/api-gateway
```

### Kubernetes
En Kubernetes, el API Gateway se despliega como un Deployment con un Service asociado. Ver [k8s/production/api-gateway.yaml](file:///home/impala/Documentos/Proyectos/Flores-Victoria-/k8s/production/api-gateway.yaml) para más detalles.

## Monitoreo

### Métricas
El API Gateway expone métricas en el endpoint `/metrics` en formato Prometheus.

### Health Check
El API Gateway proporciona un endpoint de health check en `/health`.

## Pruebas

### Pruebas Unitarias
Las pruebas unitarias se encuentran en [tests/unit-tests/api-gateway.test.js](file:///home/impala/Documentos/Proyectos/Flores-Victoria-/tests/unit-tests/api-gateway.test.js).

### Cobertura
- Middleware de autenticación: 100%
- Middleware de límites de tasa: 100%
- Middleware de métricas: 100%
- Rutas: 100%
- Manejo de errores: 100%

## Consideraciones de Rendimiento

### Proxy HTTP
- Utiliza un proxy HTTP eficiente para enrutar solicitudes a los microservicios
- Mantiene conexiones persistentes cuando es posible

### Caché
- No implementa caché directamente, pero permite que los microservicios implementen su propia caché

### Concurrencia
- Puede manejar múltiples solicitudes concurrentes gracias a la naturaleza no bloqueante de Node.js

## Problemas Conocidos

### Limitaciones
1. No implementa autenticación de dos factores
2. No tiene sistema de circuit breaker
3. No registra auditoría de todas las solicitudes

## Mejoras Futuras

1. Implementar autenticación de dos factores
2. Añadir sistema de circuit breaker para manejar fallos de microservicios
3. Registrar auditoría de todas las solicitudes
4. Implementar agregación de respuestas de múltiples servicios
5. Añadir compresión de respuestas HTTP