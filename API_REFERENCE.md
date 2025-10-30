# 📡 API Reference - Flores Victoria

## Tabla de Contenidos

- [Información General](#información-general)
- [Autenticación](#autenticación)
- [Auth Service](#auth-service)
- [Product Service](#product-service)
- [Cart Service](#cart-service)
- [Order Service](#order-service)
- [User Service](#user-service)
- [Contact Service](#contact-service)
- [Review Service](#review-service)
- [Wishlist Service](#wishlist-service)
- [Códigos de Estado](#códigos-de-estado)
- [Rate Limiting](#rate-limiting)

---

## Información General

**Base URL**: `http://localhost:3000`  
**Formato**: JSON  
**Codificación**: UTF-8  
**Autenticación**: JWT Bearer Token

### Headers Comunes

```http
Content-Type: application/json
Authorization: Bearer <jwt_token>
X-Request-ID: <uuid>
```

### Respuesta Estándar

```json
{
  "success": true,
  "data": { ... },
  "message": "Success message",
  "timestamp": "2025-10-15T10:30:00.000Z"
}
```

### Respuesta de Error

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format",
    "details": [...]
  },
  "timestamp": "2025-10-15T10:30:00.000Z"
}
```

---

## Autenticación

Todos los endpoints (excepto registro y login) requieren JWT token:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Obtener Token

```http
POST /api/auth/login
```

**Respuesta**:

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGc...",
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "role": "customer"
    }
  }
}
```

---

## Auth Service

**Base URL**: `/api/auth`

### Registro de Usuario

```http
POST /api/auth/register
```

**Request Body**:

```json
{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "password": "SecurePass123!",
  "phone": "+52 55 1234 5678"
}
```

**Response** (201 Created):

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "name": "Juan Pérez",
      "email": "juan@example.com",
      "phone": "+52 55 1234 5678",
      "role": "customer",
      "createdAt": "2025-10-15T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "User registered successfully"
}
```

### Login

```http
POST /api/auth/login
```

**Request Body**:

```json
{
  "email": "juan@example.com",
  "password": "SecurePass123!"
}
```

**Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "name": "Juan Pérez",
      "email": "juan@example.com",
      "role": "customer"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "24h"
  }
}
```

### Logout

```http
POST /api/auth/logout
Authorization: Bearer <token>
```

**Response** (200 OK):

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### Refresh Token

```http
POST /api/auth/refresh
Authorization: Bearer <refresh_token>
```

**Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "24h"
  }
}
```

### Verificar Email

```http
GET /api/auth/verify-email/:token
```

**Response** (200 OK):

```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

### Recuperar Contraseña

```http
POST /api/auth/forgot-password
```

**Request Body**:

```json
{
  "email": "juan@example.com"
}
```

**Response** (200 OK):

```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

### Restablecer Contraseña

```http
POST /api/auth/reset-password/:token
```

**Request Body**:

```json
{
  "password": "NewSecurePass123!",
  "confirmPassword": "NewSecurePass123!"
}
```

**Response** (200 OK):

```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

---

## Product Service

**Base URL**: `/api/products`

### Listar Productos

```http
GET /api/products
```

**Query Parameters**:

- `page` (number, default: 1): Número de página
- `limit` (number, default: 20): Productos por página
- `category` (string): Filtrar por categoría
- `minPrice` (number): Precio mínimo
- `maxPrice` (number): Precio máximo
- `search` (string): Búsqueda por nombre/descripción
- `sort` (string): `price_asc`, `price_desc`, `name_asc`, `name_desc`, `newest`

**Ejemplo**:

```http
GET /api/products?category=rosas&minPrice=100&maxPrice=500&sort=price_asc&page=1&limit=10
```

**Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "prod_123",
        "name": "Rosas Rojas Premium",
        "description": "Docena de rosas rojas frescas",
        "price": 299.0,
        "originalPrice": 399.0,
        "discount": 25,
        "category": "rosas",
        "images": [
          "https://example.com/images/rosas-rojas-1.jpg",
          "https://example.com/images/rosas-rojas-2.jpg"
        ],
        "stock": 50,
        "rating": 4.8,
        "reviewCount": 124,
        "tags": ["romantico", "aniversario", "regalo"],
        "featured": true,
        "createdAt": "2025-10-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalProducts": 48,
      "hasMore": true
    }
  }
}
```

### Obtener Producto por ID

```http
GET /api/products/:id
```

**Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "id": "prod_123",
    "name": "Rosas Rojas Premium",
    "description": "Docena de rosas rojas frescas importadas de Ecuador...",
    "price": 299.00,
    "originalPrice": 399.00,
    "discount": 25,
    "category": "rosas",
    "images": [...],
    "stock": 50,
    "rating": 4.8,
    "reviewCount": 124,
    "specifications": {
      "quantity": "12 rosas",
      "color": "Rojo",
      "size": "50-60 cm",
      "origin": "Ecuador",
      "careInstructions": "Cambiar agua cada 2 días"
    },
    "relatedProducts": ["prod_124", "prod_125"],
    "tags": ["romantico", "aniversario", "regalo"],
    "featured": true,
    "createdAt": "2025-10-15T10:30:00.000Z",
    "updatedAt": "2025-10-15T10:30:00.000Z"
  }
}
```

### Buscar Productos

```http
GET /api/products/search?q=rosas+rojas
```

**Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "results": [...],
    "total": 15,
    "query": "rosas rojas"
  }
}
```

### Productos Destacados

```http
GET /api/products/featured
```

**Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "products": [...]
  }
}
```

### Categorías

```http
GET /api/products/categories
```

**Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": "cat_1",
        "name": "Rosas",
        "slug": "rosas",
        "description": "Rosas de todos los colores",
        "image": "https://example.com/categories/rosas.jpg",
        "productCount": 48,
        "featured": true
      },
      {
        "id": "cat_2",
        "name": "Arreglos Florales",
        "slug": "arreglos-florales",
        "description": "Arreglos personalizados",
        "image": "https://example.com/categories/arreglos.jpg",
        "productCount": 32,
        "featured": true
      }
    ]
  }
}
```

### Crear Producto (Admin)

```http
POST /api/products
Authorization: Bearer <admin_token>
```

**Request Body**:

```json
{
  "name": "Tulipanes Blancos",
  "description": "Ramo de 20 tulipanes blancos",
  "price": 249.0,
  "category": "tulipanes",
  "images": ["url1", "url2"],
  "stock": 30,
  "tags": ["bodas", "elegante"]
}
```

**Response** (201 Created):

```json
{
  "success": true,
  "data": {
    "id": "prod_456",
    "name": "Tulipanes Blancos",
    ...
  },
  "message": "Product created successfully"
}
```

### Actualizar Producto (Admin)

```http
PUT /api/products/:id
Authorization: Bearer <admin_token>
```

**Request Body**:

```json
{
  "price": 279.0,
  "stock": 25
}
```

**Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "id": "prod_456",
    "price": 279.00,
    "stock": 25,
    ...
  },
  "message": "Product updated successfully"
}
```

### Eliminar Producto (Admin)

```http
DELETE /api/products/:id
Authorization: Bearer <admin_token>
```

**Response** (200 OK):

```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

---

## Cart Service

**Base URL**: `/api/cart`  
**Autenticación**: Requerida

### Obtener Carrito

```http
GET /api/cart
Authorization: Bearer <token>
```

**Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "userId": "user_123",
    "items": [
      {
        "productId": "prod_123",
        "name": "Rosas Rojas Premium",
        "price": 299.0,
        "quantity": 2,
        "image": "https://example.com/images/rosas-rojas-1.jpg",
        "subtotal": 598.0
      }
    ],
    "subtotal": 598.0,
    "tax": 95.68,
    "shipping": 50.0,
    "total": 743.68,
    "itemCount": 2
  }
}
```

### Añadir al Carrito

```http
POST /api/cart/items
Authorization: Bearer <token>
```

**Request Body**:

```json
{
  "productId": "prod_123",
  "quantity": 2
}
```

**Response** (201 Created):

```json
{
  "success": true,
  "data": {
    "cart": { ... },
    "addedItem": {
      "productId": "prod_123",
      "quantity": 2
    }
  },
  "message": "Item added to cart"
}
```

### Actualizar Cantidad

```http
PUT /api/cart/items/:productId
Authorization: Bearer <token>
```

**Request Body**:

```json
{
  "quantity": 5
}
```

**Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "cart": { ... }
  },
  "message": "Cart updated"
}
```

### Eliminar del Carrito

```http
DELETE /api/cart/items/:productId
Authorization: Bearer <token>
```

**Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "cart": { ... }
  },
  "message": "Item removed from cart"
}
```

### Limpiar Carrito

```http
DELETE /api/cart
Authorization: Bearer <token>
```

**Response** (200 OK):

```json
{
  "success": true,
  "message": "Cart cleared"
}
```

---

## Order Service

**Base URL**: `/api/orders`  
**Autenticación**: Requerida

### Crear Orden

```http
POST /api/orders
Authorization: Bearer <token>
```

**Request Body**:

```json
{
  "items": [
    {
      "productId": "prod_123",
      "quantity": 2,
      "price": 299.00
    }
  ],
  "shippingAddress": {
    "fullName": "Juan Pérez",
    "street": "Av. Reforma 123",
    "city": "Ciudad de México",
    "state": "CDMX",
    "postalCode": "01000",
    "country": "México",
    "phone": "+52 55 1234 5678"
  },
  "billingAddress": { ... },
  "paymentMethod": "card",
  "deliveryDate": "2025-10-20",
  "deliveryTime": "10:00-12:00",
  "giftMessage": "Feliz cumpleaños!"
}
```

**Response** (201 Created):

```json
{
  "success": true,
  "data": {
    "orderId": "order_789",
    "orderNumber": "FV-2025-001234",
    "status": "pending",
    "items": [...],
    "subtotal": 598.00,
    "tax": 95.68,
    "shipping": 50.00,
    "total": 743.68,
    "shippingAddress": { ... },
    "paymentMethod": "card",
    "deliveryDate": "2025-10-20",
    "deliveryTime": "10:00-12:00",
    "createdAt": "2025-10-15T10:30:00.000Z"
  },
  "message": "Order created successfully"
}
```

### Listar Órdenes del Usuario

```http
GET /api/orders
Authorization: Bearer <token>
```

**Query Parameters**:

- `page` (number, default: 1)
- `limit` (number, default: 10)
- `status` (string): `pending`, `confirmed`, `shipped`, `delivered`, `cancelled`

**Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "orderId": "order_789",
        "orderNumber": "FV-2025-001234",
        "status": "shipped",
        "total": 743.68,
        "itemCount": 2,
        "deliveryDate": "2025-10-20",
        "createdAt": "2025-10-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalOrders": 28
    }
  }
}
```

### Obtener Orden por ID

```http
GET /api/orders/:id
Authorization: Bearer <token>
```

**Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "orderId": "order_789",
    "orderNumber": "FV-2025-001234",
    "status": "shipped",
    "items": [
      {
        "productId": "prod_123",
        "name": "Rosas Rojas Premium",
        "quantity": 2,
        "price": 299.00,
        "subtotal": 598.00,
        "image": "https://example.com/images/rosas-rojas-1.jpg"
      }
    ],
    "subtotal": 598.00,
    "tax": 95.68,
    "shipping": 50.00,
    "total": 743.68,
    "shippingAddress": { ... },
    "billingAddress": { ... },
    "paymentMethod": "card",
    "paymentStatus": "paid",
    "deliveryDate": "2025-10-20",
    "deliveryTime": "10:00-12:00",
    "trackingNumber": "TRACK123456",
    "history": [
      {
        "status": "pending",
        "timestamp": "2025-10-15T10:30:00.000Z",
        "note": "Order created"
      },
      {
        "status": "confirmed",
        "timestamp": "2025-10-15T11:00:00.000Z",
        "note": "Payment confirmed"
      },
      {
        "status": "shipped",
        "timestamp": "2025-10-18T09:00:00.000Z",
        "note": "Order shipped"
      }
    ],
    "createdAt": "2025-10-15T10:30:00.000Z",
    "updatedAt": "2025-10-18T09:00:00.000Z"
  }
}
```

### Cancelar Orden

```http
POST /api/orders/:id/cancel
Authorization: Bearer <token>
```

**Request Body**:

```json
{
  "reason": "Cambié de opinión"
}
```

**Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "orderId": "order_789",
    "status": "cancelled",
    "cancelReason": "Cambié de opinión",
    "refundStatus": "pending"
  },
  "message": "Order cancelled successfully"
}
```

### Actualizar Estado (Admin)

```http
PATCH /api/orders/:id/status
Authorization: Bearer <admin_token>
```

**Request Body**:

```json
{
  "status": "shipped",
  "trackingNumber": "TRACK123456",
  "note": "Enviado vía FedEx"
}
```

**Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "orderId": "order_789",
    "status": "shipped",
    "trackingNumber": "TRACK123456"
  },
  "message": "Order status updated"
}
```

---

## User Service

**Base URL**: `/api/users`  
**Autenticación**: Requerida

### Obtener Perfil

```http
GET /api/users/me
Authorization: Bearer <token>
```

**Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "phone": "+52 55 1234 5678",
    "avatar": "https://example.com/avatars/user_123.jpg",
    "addresses": [
      {
        "id": "addr_1",
        "fullName": "Juan Pérez",
        "street": "Av. Reforma 123",
        "city": "Ciudad de México",
        "state": "CDMX",
        "postalCode": "01000",
        "country": "México",
        "phone": "+52 55 1234 5678",
        "isDefault": true
      }
    ],
    "preferences": {
      "newsletter": true,
      "promotions": true,
      "language": "es"
    },
    "createdAt": "2025-01-15T10:30:00.000Z"
  }
}
```

### Actualizar Perfil

```http
PUT /api/users/me
Authorization: Bearer <token>
```

**Request Body**:

```json
{
  "name": "Juan Carlos Pérez",
  "phone": "+52 55 9876 5432",
  "preferences": {
    "newsletter": false
  }
}
```

**Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "name": "Juan Carlos Pérez",
    ...
  },
  "message": "Profile updated successfully"
}
```

### Añadir Dirección

```http
POST /api/users/me/addresses
Authorization: Bearer <token>
```

**Request Body**:

```json
{
  "fullName": "Juan Pérez",
  "street": "Calle Insurgentes 456",
  "city": "Guadalajara",
  "state": "Jalisco",
  "postalCode": "44100",
  "country": "México",
  "phone": "+52 33 1234 5678",
  "isDefault": false
}
```

**Response** (201 Created):

```json
{
  "success": true,
  "data": {
    "address": {
      "id": "addr_2",
      ...
    }
  },
  "message": "Address added successfully"
}
```

### Actualizar Dirección

```http
PUT /api/users/me/addresses/:addressId
Authorization: Bearer <token>
```

**Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "address": { ... }
  },
  "message": "Address updated successfully"
}
```

### Eliminar Dirección

```http
DELETE /api/users/me/addresses/:addressId
Authorization: Bearer <token>
```

**Response** (200 OK):

```json
{
  "success": true,
  "message": "Address deleted successfully"
}
```

### Cambiar Contraseña

```http
PUT /api/users/me/password
Authorization: Bearer <token>
```

**Request Body**:

```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewSecurePass123!",
  "confirmPassword": "NewSecurePass123!"
}
```

**Response** (200 OK):

```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

## Contact Service

**Base URL**: `/api/contact`

### Enviar Mensaje de Contacto

```http
POST /api/contact
```

**Request Body**:

```json
{
  "name": "María González",
  "email": "maria@example.com",
  "phone": "+52 55 1234 5678",
  "subject": "Consulta sobre envío",
  "message": "¿Hacen envíos a Monterrey?",
  "category": "shipping"
}
```

**Response** (201 Created):

```json
{
  "success": true,
  "data": {
    "contactId": "contact_456",
    "name": "María González",
    "email": "maria@example.com",
    "subject": "Consulta sobre envío",
    "status": "pending",
    "createdAt": "2025-10-15T10:30:00.000Z"
  },
  "message": "Your message has been sent. We'll respond within 24 hours."
}
```

### Listar Mensajes (Admin)

```http
GET /api/contact
Authorization: Bearer <admin_token>
```

**Query Parameters**:

- `status`: `pending`, `responded`, `resolved`
- `category`: `general`, `shipping`, `products`, `technical`

**Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "contactId": "contact_456",
        "name": "María González",
        "email": "maria@example.com",
        "subject": "Consulta sobre envío",
        "status": "pending",
        "createdAt": "2025-10-15T10:30:00.000Z"
      }
    ],
    "pagination": { ... }
  }
}
```

### Responder Mensaje (Admin)

```http
POST /api/contact/:id/respond
Authorization: Bearer <admin_token>
```

**Request Body**:

```json
{
  "response": "Sí, hacemos envíos a toda la República Mexicana. El costo es de $150 MXN."
}
```

**Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "contactId": "contact_456",
    "status": "responded",
    "response": "Sí, hacemos envíos...",
    "respondedAt": "2025-10-15T14:00:00.000Z"
  },
  "message": "Response sent successfully"
}
```

---

## Review Service

**Base URL**: `/api/reviews`

### Crear Reseña

```http
POST /api/reviews
Authorization: Bearer <token>
```

**Request Body**:

```json
{
  "productId": "prod_123",
  "rating": 5,
  "title": "¡Excelente calidad!",
  "comment": "Las rosas llegaron frescas y hermosas. Muy recomendado.",
  "orderId": "order_789"
}
```

**Response** (201 Created):

```json
{
  "success": true,
  "data": {
    "reviewId": "review_101",
    "productId": "prod_123",
    "userId": "user_123",
    "userName": "Juan Pérez",
    "rating": 5,
    "title": "¡Excelente calidad!",
    "comment": "Las rosas llegaron frescas y hermosas. Muy recomendado.",
    "verified": true,
    "helpful": 0,
    "createdAt": "2025-10-15T10:30:00.000Z"
  },
  "message": "Review submitted successfully"
}
```

### Listar Reseñas de un Producto

```http
GET /api/reviews/product/:productId
```

**Query Parameters**:

- `page` (number, default: 1)
- `limit` (number, default: 10)
- `sort`: `newest`, `oldest`, `highest`, `lowest`, `helpful`

**Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "productId": "prod_123",
    "averageRating": 4.8,
    "totalReviews": 124,
    "ratingDistribution": {
      "5": 98,
      "4": 20,
      "3": 4,
      "2": 1,
      "1": 1
    },
    "reviews": [
      {
        "reviewId": "review_101",
        "userId": "user_123",
        "userName": "Juan Pérez",
        "userAvatar": "https://example.com/avatars/user_123.jpg",
        "rating": 5,
        "title": "¡Excelente calidad!",
        "comment": "Las rosas llegaron frescas y hermosas...",
        "verified": true,
        "helpful": 15,
        "createdAt": "2025-10-15T10:30:00.000Z"
      }
    ],
    "pagination": { ... }
  }
}
```

### Marcar Reseña como Útil

```http
POST /api/reviews/:id/helpful
Authorization: Bearer <token>
```

**Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "reviewId": "review_101",
    "helpful": 16
  },
  "message": "Review marked as helpful"
}
```

### Actualizar Reseña

```http
PUT /api/reviews/:id
Authorization: Bearer <token>
```

**Request Body**:

```json
{
  "rating": 4,
  "title": "Muy buena calidad",
  "comment": "Actualicé mi opinión..."
}
```

**Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "reviewId": "review_101",
    ...
  },
  "message": "Review updated successfully"
}
```

### Eliminar Reseña

```http
DELETE /api/reviews/:id
Authorization: Bearer <token>
```

**Response** (200 OK):

```json
{
  "success": true,
  "message": "Review deleted successfully"
}
```

---

## Wishlist Service

**Base URL**: `/api/wishlist`  
**Autenticación**: Requerida

### Obtener Lista de Deseos

```http
GET /api/wishlist
Authorization: Bearer <token>
```

**Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "userId": "user_123",
    "items": [
      {
        "productId": "prod_123",
        "name": "Rosas Rojas Premium",
        "price": 299.0,
        "image": "https://example.com/images/rosas-rojas-1.jpg",
        "inStock": true,
        "rating": 4.8,
        "addedAt": "2025-10-15T10:30:00.000Z"
      }
    ],
    "itemCount": 5
  }
}
```

### Añadir a Lista de Deseos

```http
POST /api/wishlist/items
Authorization: Bearer <token>
```

**Request Body**:

```json
{
  "productId": "prod_123"
}
```

**Response** (201 Created):

```json
{
  "success": true,
  "data": {
    "wishlist": { ... },
    "addedItem": {
      "productId": "prod_123"
    }
  },
  "message": "Item added to wishlist"
}
```

### Eliminar de Lista de Deseos

```http
DELETE /api/wishlist/items/:productId
Authorization: Bearer <token>
```

**Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "wishlist": { ... }
  },
  "message": "Item removed from wishlist"
}
```

### Limpiar Lista de Deseos

```http
DELETE /api/wishlist
Authorization: Bearer <token>
```

**Response** (200 OK):

```json
{
  "success": true,
  "message": "Wishlist cleared"
}
```

### Mover a Carrito

```http
POST /api/wishlist/items/:productId/move-to-cart
Authorization: Bearer <token>
```

**Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "cart": { ... },
    "wishlist": { ... }
  },
  "message": "Item moved to cart"
}
```

---

## Códigos de Estado

| Código  | Descripción           | Uso                                    |
| ------- | --------------------- | -------------------------------------- |
| **200** | OK                    | Request exitoso (GET, PUT, PATCH)      |
| **201** | Created               | Recurso creado exitosamente (POST)     |
| **204** | No Content            | Request exitoso sin contenido (DELETE) |
| **400** | Bad Request           | Datos inválidos o faltantes            |
| **401** | Unauthorized          | Token JWT faltante o inválido          |
| **403** | Forbidden             | Sin permisos para el recurso           |
| **404** | Not Found             | Recurso no encontrado                  |
| **409** | Conflict              | Conflicto (ej: email duplicado)        |
| **422** | Unprocessable Entity  | Validación falló                       |
| **429** | Too Many Requests     | Rate limit excedido                    |
| **500** | Internal Server Error | Error del servidor                     |
| **503** | Service Unavailable   | Servicio temporalmente no disponible   |

---

## Rate Limiting

**Límites por IP**:

- Endpoints públicos: 100 requests / 15 minutos
- Endpoints autenticados: 1000 requests / 15 minutos
- Endpoints de búsqueda: 50 requests / minuto

**Headers de Rate Limit**:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1697365200
```

**Respuesta al exceder límite** (429):

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "retryAfter": 900
  }
}
```

---

## Paginación

Todos los endpoints que retornan listas soportan paginación:

**Query Parameters**:

- `page` (number, default: 1): Número de página
- `limit` (number, default: 20): Items por página

**Respuesta**:

```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 10,
      "totalItems": 195,
      "itemsPerPage": 20,
      "hasMore": true,
      "nextPage": 2,
      "prevPage": null
    }
  }
}
```

---

## Webhooks (Próximamente)

Para recibir notificaciones de eventos en tiempo real:

**Eventos disponibles**:

- `order.created`
- `order.status_updated`
- `order.cancelled`
- `payment.completed`
- `payment.failed`

---

## SDKs y Ejemplos

### JavaScript/TypeScript

```javascript
const FloresVictoriaAPI = require('@flores-victoria/sdk');

const client = new FloresVictoriaAPI({
  baseURL: 'http://localhost:3000',
  token: 'your_jwt_token'
});

// Listar productos
const products = await client.products.list({ category: 'rosas' });

// Añadir al carrito
await client.cart.addItem({ productId: 'prod_123', quantity: 2 });

// Crear orden
const order = await client.orders.create({ ... });
```

### cURL Examples

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"SecurePass123!"}'

# Listar productos
curl http://localhost:3000/api/products?category=rosas

# Añadir al carrito
curl -X POST http://localhost:3000/api/cart/items \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"productId":"prod_123","quantity":2}'
```

---

**Última actualización**: Octubre 2025  
**Versión API**: v1.0.0  
**Mantenido por**: Equipo Flores Victoria

Para reportar problemas o sugerir mejoras:
[GitHub Issues](https://github.com/flores-victoria/api/issues)
