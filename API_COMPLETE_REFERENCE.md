# 📖 API Complete Reference - Flores Victoria

Documentación completa de todos los endpoints de los 5 microservices.

---

## 🔐 Authentication Service (Port 3003)

Base URL: `http://localhost:3003`

### POST /api/auth/register

Registrar nuevo usuario.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "Juan Pérez",
  "phone": "+34612345678"
}
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-v4",
      "email": "user@example.com",
      "name": "Juan Pérez",
      "role": "customer"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Errors:**

- `400` - Email ya registrado
- `400` - Validación fallida

---

### POST /api/auth/login

Iniciar sesión.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-v4",
      "email": "user@example.com",
      "name": "Juan Pérez"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Errors:**

- `401` - Credenciales inválidas
- `404` - Usuario no encontrado

---

### POST /api/auth/refresh

Refrescar token JWT.

**Headers:**

```
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### POST /api/auth/logout

Cerrar sesión (invalidar token).

**Headers:**

```
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

## 👤 User Service (Port 3004)

Base URL: `http://localhost:3004`

### GET /api/users/profile

Obtener perfil del usuario autenticado.

**Headers:**

```
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "uuid-v4",
    "email": "user@example.com",
    "name": "Juan Pérez",
    "phone": "+34612345678",
    "role": "customer",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### PUT /api/users/profile

Actualizar perfil del usuario.

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "name": "Juan Carlos Pérez",
  "phone": "+34687654321"
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "uuid-v4",
    "email": "user@example.com",
    "name": "Juan Carlos Pérez",
    "phone": "+34687654321"
  }
}
```

---

### POST /api/users/change-password

Cambiar contraseña.

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewSecurePass456!"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Errors:**

- `401` - Contraseña actual incorrecta
- `400` - Nueva contraseña no cumple requisitos

---

### GET /api/users/addresses

Listar direcciones del usuario.

**Headers:**

```
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-v4",
      "street": "Calle Principal 123",
      "city": "Madrid",
      "state": "Madrid",
      "postalCode": "28001",
      "country": "España",
      "isDefault": true
    }
  ]
}
```

---

### POST /api/users/addresses

Agregar nueva dirección.

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "street": "Av. Libertador 456",
  "city": "Barcelona",
  "state": "Cataluña",
  "postalCode": "08001",
  "country": "España",
  "isDefault": false
}
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "id": "uuid-v4",
    "street": "Av. Libertador 456",
    "city": "Barcelona",
    "state": "Cataluña",
    "postalCode": "08001",
    "country": "España",
    "isDefault": false
  }
}
```

---

### PUT /api/users/addresses/:id

Actualizar dirección existente.

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "street": "Av. Libertador 789",
  "isDefault": true
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "uuid-v4",
    "street": "Av. Libertador 789",
    "isDefault": true
  }
}
```

---

### DELETE /api/users/addresses/:id

Eliminar dirección.

**Headers:**

```
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "success": true,
  "message": "Address deleted successfully"
}
```

---

## 🛍️ Product Service (Port 3002)

Base URL: `http://localhost:3002`

### GET /api/products

Listar productos con filtros.

**Query Parameters:**

- `category` - Filtrar por categoría (flores, plantas, ramos, etc.)
- `minPrice` - Precio mínimo
- `maxPrice` - Precio máximo
- `inStock` - Solo productos en stock (true/false)
- `search` - Búsqueda por nombre/descripción
- `page` - Número de página (default: 1)
- `limit` - Productos por página (default: 20)
- `sortBy` - Campo de ordenamiento (name, price, createdAt)
- `sortOrder` - Orden (asc/desc)

**Example:**

```
GET /api/products?category=flores&inStock=true&page=1&limit=10
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "uuid-v4",
        "name": "Rosas Rojas Premium",
        "description": "Docena de rosas rojas importadas",
        "price": 49.99,
        "category": "flores",
        "stock": 25,
        "images": ["https://cdn.example.com/roses.jpg"],
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 45,
      "pages": 5
    }
  }
}
```

---

### GET /api/products/:id

Obtener detalles de un producto.

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "uuid-v4",
    "name": "Rosas Rojas Premium",
    "description": "Docena de rosas rojas importadas de Ecuador",
    "price": 49.99,
    "category": "flores",
    "stock": 25,
    "images": ["https://cdn.example.com/roses-1.jpg", "https://cdn.example.com/roses-2.jpg"],
    "dimensions": {
      "height": "45cm",
      "width": "30cm"
    },
    "care": "Mantener en agua fresca, cambiar agua cada 2 días",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-15T00:00:00.000Z"
  }
}
```

**Errors:**

- `404` - Producto no encontrado

---

### POST /api/products

Crear nuevo producto (Admin only).

**Headers:**

```
Authorization: Bearer <admin-token>
```

**Request Body:**

```json
{
  "name": "Orquídeas Blancas",
  "description": "Orquídeas phalaenopsis blancas",
  "price": 79.99,
  "category": "plantas",
  "stock": 10,
  "images": ["https://cdn.example.com/orchid.jpg"]
}
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "id": "uuid-v4",
    "name": "Orquídeas Blancas",
    "price": 79.99,
    "stock": 10
  }
}
```

**Errors:**

- `403` - No autorizado (requiere rol admin)
- `400` - Validación fallida

---

### PUT /api/products/:id

Actualizar producto (Admin only).

**Headers:**

```
Authorization: Bearer <admin-token>
```

**Request Body:**

```json
{
  "price": 69.99,
  "stock": 15
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "uuid-v4",
    "price": 69.99,
    "stock": 15
  }
}
```

---

### DELETE /api/products/:id

Eliminar producto (Admin only).

**Headers:**

```
Authorization: Bearer <admin-token>
```

**Response (200):**

```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

---

## 🛒 Cart Service (Port 3001)

Base URL: `http://localhost:3001`

### GET /api/cart

Obtener carrito del usuario.

**Headers:**

```
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "uuid-v4",
    "userId": "uuid-v4",
    "items": [
      {
        "id": "uuid-v4",
        "productId": "uuid-v4",
        "product": {
          "name": "Rosas Rojas Premium",
          "price": 49.99,
          "image": "https://cdn.example.com/roses.jpg"
        },
        "quantity": 2,
        "subtotal": 99.98
      }
    ],
    "total": 99.98,
    "itemsCount": 1,
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### POST /api/cart/items

Agregar producto al carrito.

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "productId": "uuid-v4",
  "quantity": 2
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "items": [...],
    "total": 99.98
  }
}
```

**Errors:**

- `400` - Stock insuficiente
- `404` - Producto no encontrado

---

### PUT /api/cart/items/:itemId

Actualizar cantidad de un item.

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "quantity": 3
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "items": [...],
    "total": 149.97
  }
}
```

---

### DELETE /api/cart/items/:itemId

Eliminar item del carrito.

**Headers:**

```
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "items": [],
    "total": 0
  }
}
```

---

### DELETE /api/cart

Vaciar carrito completo.

**Headers:**

```
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "success": true,
  "message": "Cart cleared successfully"
}
```

---

## 📦 Order Service (Port 3005)

Base URL: `http://localhost:3005`

### GET /api/orders

Listar órdenes del usuario.

**Headers:**

```
Authorization: Bearer <token>
```

**Query Parameters:**

- `status` - Filtrar por estado (pending, processing, shipped, delivered, cancelled)
- `page` - Número de página
- `limit` - Órdenes por página

**Response (200):**

```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": "uuid-v4",
        "orderNumber": "FV-2024-00123",
        "status": "delivered",
        "total": 149.97,
        "itemsCount": 3,
        "createdAt": "2024-01-10T00:00:00.000Z",
        "deliveredAt": "2024-01-12T14:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 15
    }
  }
}
```

---

### GET /api/orders/:id

Obtener detalles de una orden.

**Headers:**

```
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "uuid-v4",
    "orderNumber": "FV-2024-00123",
    "status": "delivered",
    "items": [
      {
        "productId": "uuid-v4",
        "product": {
          "name": "Rosas Rojas Premium",
          "image": "https://cdn.example.com/roses.jpg"
        },
        "quantity": 2,
        "price": 49.99,
        "subtotal": 99.98
      }
    ],
    "subtotal": 99.98,
    "shipping": 10.0,
    "tax": 16.5,
    "total": 126.48,
    "shippingAddress": {
      "street": "Calle Principal 123",
      "city": "Madrid",
      "postalCode": "28001"
    },
    "paymentMethod": "credit_card",
    "timeline": [
      {
        "status": "pending",
        "timestamp": "2024-01-10T10:00:00.000Z"
      },
      {
        "status": "processing",
        "timestamp": "2024-01-10T11:00:00.000Z"
      },
      {
        "status": "shipped",
        "timestamp": "2024-01-11T09:00:00.000Z",
        "trackingNumber": "TRACK123456"
      },
      {
        "status": "delivered",
        "timestamp": "2024-01-12T14:30:00.000Z"
      }
    ],
    "createdAt": "2024-01-10T10:00:00.000Z"
  }
}
```

---

### POST /api/orders

Crear nueva orden.

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "items": [
    {
      "productId": "uuid-v4",
      "quantity": 2
    }
  ],
  "shippingAddress": "uuid-v4",
  "paymentMethod": "credit_card",
  "notes": "Entregar entre 9-18h"
}
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "id": "uuid-v4",
    "orderNumber": "FV-2024-00124",
    "status": "pending",
    "total": 126.48
  }
}
```

**Errors:**

- `400` - Carrito vacío
- `400` - Stock insuficiente
- `404` - Dirección no encontrada

---

### PUT /api/orders/:id/status

Actualizar estado de orden (Admin only).

**Headers:**

```
Authorization: Bearer <admin-token>
```

**Request Body:**

```json
{
  "status": "shipped",
  "trackingNumber": "TRACK789012"
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "uuid-v4",
    "status": "shipped",
    "trackingNumber": "TRACK789012"
  }
}
```

---

### POST /api/orders/:id/cancel

Cancelar orden.

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "reason": "Ya no necesito el producto"
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "uuid-v4",
    "status": "cancelled",
    "cancelReason": "Ya no necesito el producto"
  }
}
```

**Errors:**

- `400` - Orden ya enviada (no se puede cancelar)

---

## 🔍 Health & Monitoring

Todos los servicios exponen endpoints de salud y métricas:

### GET /health

Health check endpoint.

**Response (200):**

```json
{
  "status": "healthy",
  "service": "auth-service",
  "timestamp": "2024-01-15T12:00:00.000Z",
  "uptime": 86400,
  "dependencies": {
    "database": "connected",
    "redis": "connected"
  }
}
```

---

### GET /metrics

Prometheus metrics endpoint.

**Response (200):**

```
# HELP http_requests_total Total HTTP requests
# TYPE http_requests_total counter
http_requests_total{method="GET",status="200"} 1543
http_requests_total{method="POST",status="201"} 234

# HELP http_request_duration_seconds HTTP request duration
# TYPE http_request_duration_seconds histogram
http_request_duration_seconds_bucket{le="0.1"} 1234
http_request_duration_seconds_bucket{le="0.5"} 1500
```

---

## 🔒 Authentication

Todos los endpoints (excepto `/health`, `/metrics`, `/api/auth/login`, `/api/auth/register`)
requieren JWT token:

**Header:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Token Expiration:** 24 horas

**Error Response (401):**

```json
{
  "success": false,
  "error": "Unauthorized",
  "message": "Token inválido o expirado"
}
```

---

## 📊 Rate Limiting

Todos los endpoints están limitados por tasa:

- **Auth endpoints:** 5 req/min
- **API endpoints:** 100 req/min
- **Admin endpoints:** 50 req/min

**Error Response (429):**

```json
{
  "success": false,
  "error": "Too Many Requests",
  "message": "Rate limit exceeded. Try again in 60 seconds"
}
```

---

## 🌐 CORS

CORS configurado para:

- `http://localhost:5173` (desarrollo)
- `https://flores-victoria.com` (producción)

---

**API Documentation v1.0** | Última actualización: Enero 2024
