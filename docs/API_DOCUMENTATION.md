# 📚 Documentación Completa de APIs - Flores Victoria v3.0

## 🌟 **Resumen Ejecutivo**

Flores Victoria v3.0 es una plataforma enterprise de e-commerce con arquitectura de microservicios
que proporciona APIs RESTful completas para la gestión integral de un negocio de flores. El sistema
incluye autenticación JWT, balanceador de carga, monitoreo avanzado y escalabilidad horizontal.

---

## 🏗️ **Arquitectura del Sistema**

### **Componentes Principales**

- **API Gateway** (Puerto 3000) - Punto de entrada unificado
- **Admin Panel** (Puerto 3021) - Panel de administración web
- **Microservicios Especializados** (Puertos 3001-3009)
- **Bases de Datos** - PostgreSQL, MongoDB, Redis
- **Monitoreo** - Prometheus, Grafana, Jaeger

### **Stack Tecnológico**

- **Backend**: Node.js, Express.js
- **Bases de Datos**: PostgreSQL 13, MongoDB 4.4, Redis 6
- **Containerización**: Docker, Docker Compose
- **Monitoreo**: Prometheus, Grafana, Jaeger
- **Message Queue**: RabbitMQ
- **Frontend**: HTML5, CSS3, JavaScript ES6+

---

## 🔐 **Autenticación y Seguridad**

### **Auth Service** - `http://localhost:3001`

#### **Endpoints de Autenticación**

##### `POST /api/auth/register`

**Descripción**: Registro de nuevos usuarios **Parámetros**:

```json
{
  "email": "usuario@ejemplo.com",
  "password": "contraseña123",
  "firstName": "Nombre",
  "lastName": "Apellido",
  "phone": "+56912345678"
}
```

**Respuesta**:

```json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "user": {
    "id": "uuid",
    "email": "usuario@ejemplo.com",
    "firstName": "Nombre",
    "lastName": "Apellido"
  },
  "token": "jwt_token_here"
}
```

##### `POST /api/auth/login`

**Descripción**: Inicio de sesión **Parámetros**:

```json
{
  "email": "usuario@ejemplo.com",
  "password": "contraseña123"
}
```

**Respuesta**:

```json
{
  "success": true,
  "message": "Login exitoso",
  "user": {
    "id": "uuid",
    "email": "usuario@ejemplo.com",
    "role": "user"
  },
  "token": "jwt_token_here",
  "expiresIn": "24h"
}
```

##### `POST /api/auth/refresh`

**Descripción**: Renovar token JWT **Headers**: `Authorization: Bearer <token>` **Respuesta**:

```json
{
  "success": true,
  "token": "new_jwt_token",
  "expiresIn": "24h"
}
```

##### `POST /api/auth/logout`

**Descripción**: Cerrar sesión **Headers**: `Authorization: Bearer <token>` **Respuesta**:

```json
{
  "success": true,
  "message": "Logout exitoso"
}
```

---

## 👥 **Gestión de Usuarios**

### **User Service** - `http://localhost:3003`

#### **Endpoints de Usuarios**

##### `GET /api/users/profile`

**Descripción**: Obtener perfil del usuario autenticado **Headers**: `Authorization: Bearer <token>`
**Respuesta**:

```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "usuario@ejemplo.com",
    "firstName": "Nombre",
    "lastName": "Apellido",
    "phone": "+56912345678",
    "address": {
      "street": "Calle Principal 123",
      "city": "Santiago",
      "region": "Metropolitana",
      "zipCode": "12345"
    },
    "preferences": {
      "notifications": true,
      "newsletter": false
    },
    "createdAt": "2023-10-24T00:00:00Z",
    "updatedAt": "2023-10-24T00:00:00Z"
  }
}
```

##### `PUT /api/users/profile`

**Descripción**: Actualizar perfil de usuario **Headers**: `Authorization: Bearer <token>`
**Parámetros**:

```json
{
  "firstName": "Nuevo Nombre",
  "lastName": "Nuevo Apellido",
  "phone": "+56987654321",
  "address": {
    "street": "Nueva Calle 456",
    "city": "Valparaíso",
    "region": "Valparaíso",
    "zipCode": "54321"
  }
}
```

##### `GET /api/users/orders`

**Descripción**: Obtener historial de pedidos del usuario **Headers**:
`Authorization: Bearer <token>` **Query Params**: `?page=1&limit=10&status=completed` **Respuesta**:

```json
{
  "success": true,
  "orders": [
    {
      "id": "order_uuid",
      "orderNumber": "FV-2023-001",
      "status": "completed",
      "total": 45000,
      "items": [
        {
          "productId": "product_uuid",
          "name": "Ramo de Rosas Rojas",
          "quantity": 1,
          "price": 35000
        }
      ],
      "shippingAddress": {
        "street": "Calle Principal 123",
        "city": "Santiago"
      },
      "createdAt": "2023-10-20T10:00:00Z",
      "deliveredAt": "2023-10-21T14:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

---

## 🛍️ **Catálogo de Productos**

### **Product Service** - `http://localhost:3009`

#### **Endpoints de Productos**

##### `GET /api/products`

**Descripción**: Obtener catálogo de productos **Query Params**:

- `?page=1&limit=12`
- `?category=ramos&minPrice=10000&maxPrice=50000`
- `?search=rosas&sortBy=price&sortOrder=asc`
- `?available=true&featured=true`

**Respuesta**:

```json
{
  "success": true,
  "products": [
    {
      "id": "product_uuid",
      "name": "Ramo de Rosas Rojas Premium",
      "description": "Hermoso ramo de 24 rosas rojas ecuatorianas...",
      "price": 45000,
      "salePrice": 35000,
      "category": "ramos",
      "subcategory": "rosas",
      "tags": ["premium", "rosas", "amor", "san-valentin"],
      "images": [
        {
          "url": "/images/products/ramo-rosas-001.jpg",
          "alt": "Ramo de Rosas Rojas",
          "isPrimary": true
        }
      ],
      "specifications": {
        "flowers": ["24 Rosas Rojas"],
        "size": "Grande",
        "care": "Cambiar agua cada 2 días",
        "duration": "7-10 días"
      },
      "inventory": {
        "stock": 15,
        "available": true,
        "reservedStock": 2
      },
      "seo": {
        "slug": "ramo-rosas-rojas-premium",
        "metaTitle": "Ramo de Rosas Rojas Premium - Flores Victoria",
        "metaDescription": "Ramo premium de 24 rosas rojas ecuatorianas..."
      },
      "ratings": {
        "average": 4.8,
        "count": 127
      },
      "createdAt": "2023-08-15T00:00:00Z",
      "updatedAt": "2023-10-20T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 156,
    "pages": 13
  },
  "filters": {
    "categories": ["ramos", "arreglos", "plantas", "ocasiones"],
    "priceRange": {
      "min": 5000,
      "max": 150000
    },
    "brands": ["Flores Victoria", "Premium Collection"]
  }
}
```

##### `GET /api/products/:id`

**Descripción**: Obtener detalles de un producto específico **Parámetros**: `id` - UUID del producto
**Respuesta**:

```json
{
  "success": true,
  "product": {
    "id": "product_uuid",
    "name": "Ramo de Rosas Rojas Premium",
    "description": "Hermoso ramo de 24 rosas rojas ecuatorianas de primera calidad, perfectas para expresar amor y pasión. Incluye papel de regalo elegante y tarjeta personalizada.",
    "longDescription": "Este exquisito ramo está compuesto por 24 rosas rojas ecuatorianas cuidadosamente seleccionadas...",
    "price": 45000,
    "salePrice": 35000,
    "category": "ramos",
    "subcategory": "rosas",
    "tags": ["premium", "rosas", "amor", "san-valentin"],
    "images": [
      {
        "id": "img_uuid_1",
        "url": "/images/products/ramo-rosas-001.jpg",
        "thumbnailUrl": "/images/products/thumbs/ramo-rosas-001.jpg",
        "alt": "Ramo de Rosas Rojas Premium",
        "isPrimary": true,
        "order": 1
      }
    ],
    "specifications": {
      "flowers": ["24 Rosas Rojas Ecuatorianas"],
      "size": "Grande (50cm aprox)",
      "care": "Cambiar agua cada 2 días, cortar tallos en diagonal",
      "duration": "7-10 días con cuidado adecuado",
      "packaging": "Papel kraft premium y lazo satinado"
    },
    "inventory": {
      "stock": 15,
      "available": true,
      "reservedStock": 2,
      "lowStockThreshold": 5,
      "lastRestocked": "2023-10-20T08:00:00Z"
    },
    "shipping": {
      "weight": 800,
      "dimensions": {
        "length": 60,
        "width": 25,
        "height": 25
      },
      "freeShipping": true,
      "sameDay": true,
      "expressDelivery": true
    },
    "reviews": [
      {
        "id": "review_uuid",
        "userId": "user_uuid",
        "userName": "María González",
        "rating": 5,
        "title": "Hermoso ramo",
        "comment": "Las rosas llegaron frescas y hermosas...",
        "images": ["/images/reviews/review-001.jpg"],
        "verified": true,
        "helpful": 12,
        "createdAt": "2023-10-18T00:00:00Z"
      }
    ],
    "relatedProducts": ["related_product_uuid_1", "related_product_uuid_2"],
    "seo": {
      "slug": "ramo-rosas-rojas-premium",
      "metaTitle": "Ramo de Rosas Rojas Premium - Flores Victoria",
      "metaDescription": "Ramo premium de 24 rosas rojas ecuatorianas de primera calidad. Envío gratis y mismo día en Santiago.",
      "canonicalUrl": "/productos/ramo-rosas-rojas-premium"
    },
    "analytics": {
      "views": 1250,
      "purchases": 89,
      "conversionRate": 7.12,
      "wishlistAdds": 156
    }
  }
}
```

##### `POST /api/products` (Admin)

**Descripción**: Crear nuevo producto **Headers**: `Authorization: Bearer <admin_token>`
**Parámetros**:

```json
{
  "name": "Nuevo Producto",
  "description": "Descripción del producto",
  "price": 25000,
  "category": "ramos",
  "subcategory": "tulipanes",
  "tags": ["nuevo", "primavera"],
  "specifications": {
    "flowers": ["12 Tulipanes Amarillos"],
    "size": "Mediano"
  },
  "inventory": {
    "stock": 10
  }
}
```

---

## 🛒 **Carrito de Compras**

### **Cart Service** - `http://localhost:3005`

#### **Endpoints del Carrito**

##### `GET /api/cart`

**Descripción**: Obtener carrito del usuario **Headers**: `Authorization: Bearer <token>`
**Respuesta**:

```json
{
  "success": true,
  "cart": {
    "id": "cart_uuid",
    "userId": "user_uuid",
    "items": [
      {
        "id": "cart_item_uuid",
        "productId": "product_uuid",
        "product": {
          "name": "Ramo de Rosas Rojas",
          "price": 35000,
          "salePrice": 35000,
          "image": "/images/products/ramo-rosas-001.jpg"
        },
        "quantity": 2,
        "personalizations": {
          "message": "Feliz Aniversario",
          "deliveryDate": "2023-10-25",
          "giftWrap": true
        },
        "subtotal": 70000
      }
    ],
    "summary": {
      "itemsCount": 2,
      "subtotal": 70000,
      "shipping": 5000,
      "discount": 0,
      "tax": 13300,
      "total": 88300
    },
    "coupons": [],
    "shippingAddress": {
      "street": "Calle Principal 123",
      "city": "Santiago",
      "region": "Metropolitana"
    },
    "deliveryOptions": {
      "standard": {
        "price": 5000,
        "estimatedDays": "2-3"
      },
      "express": {
        "price": 8000,
        "estimatedDays": "1"
      },
      "sameDay": {
        "price": 12000,
        "estimatedHours": "2-4"
      }
    },
    "updatedAt": "2023-10-24T10:30:00Z"
  }
}
```

##### `POST /api/cart/items`

**Descripción**: Agregar producto al carrito **Headers**: `Authorization: Bearer <token>`
**Parámetros**:

```json
{
  "productId": "product_uuid",
  "quantity": 1,
  "personalizations": {
    "message": "Con amor",
    "deliveryDate": "2023-10-25",
    "giftWrap": true
  }
}
```

##### `PUT /api/cart/items/:itemId`

**Descripción**: Actualizar cantidad en el carrito **Headers**: `Authorization: Bearer <token>`
**Parámetros**:

```json
{
  "quantity": 3
}
```

##### `DELETE /api/cart/items/:itemId`

**Descripción**: Eliminar producto del carrito **Headers**: `Authorization: Bearer <token>`

##### `POST /api/cart/coupon`

**Descripción**: Aplicar cupón de descuento **Headers**: `Authorization: Bearer <token>`
**Parámetros**:

```json
{
  "couponCode": "DESCUENTO10"
}
```

---

## 📦 **Gestión de Pedidos**

### **Order Service** - `http://localhost:3004`

#### **Endpoints de Pedidos**

##### `POST /api/orders`

**Descripción**: Crear nuevo pedido **Headers**: `Authorization: Bearer <token>` **Parámetros**:

```json
{
  "cartId": "cart_uuid",
  "shippingAddress": {
    "firstName": "Juan",
    "lastName": "Pérez",
    "email": "juan@email.com",
    "phone": "+56912345678",
    "street": "Av. Providencia 1234",
    "apartment": "Depto 56",
    "city": "Santiago",
    "region": "Metropolitana",
    "zipCode": "12345",
    "country": "Chile"
  },
  "billingAddress": {
    "firstName": "Juan",
    "lastName": "Pérez",
    "email": "juan@email.com",
    "phone": "+56912345678",
    "street": "Av. Providencia 1234",
    "city": "Santiago",
    "region": "Metropolitana",
    "zipCode": "12345",
    "country": "Chile"
  },
  "deliveryOptions": {
    "type": "standard",
    "date": "2023-10-26",
    "timeSlot": "morning",
    "specialInstructions": "Dejar en portería"
  },
  "paymentMethod": {
    "type": "credit_card",
    "cardId": "card_uuid"
  },
  "guestEmail": null
}
```

**Respuesta**:

```json
{
  "success": true,
  "order": {
    "id": "order_uuid",
    "orderNumber": "FV-2023-001",
    "status": "pending_payment",
    "userId": "user_uuid",
    "items": [
      {
        "productId": "product_uuid",
        "name": "Ramo de Rosas Rojas",
        "quantity": 2,
        "price": 35000,
        "subtotal": 70000,
        "personalizations": {
          "message": "Con amor"
        }
      }
    ],
    "summary": {
      "subtotal": 70000,
      "shipping": 5000,
      "tax": 13300,
      "discount": 0,
      "total": 88300
    },
    "shippingAddress": {
      "firstName": "Juan",
      "lastName": "Pérez",
      "street": "Av. Providencia 1234",
      "city": "Santiago"
    },
    "deliveryInfo": {
      "type": "standard",
      "estimatedDate": "2023-10-26",
      "timeSlot": "morning"
    },
    "payment": {
      "method": "credit_card",
      "status": "pending",
      "transactionId": null
    },
    "timeline": [
      {
        "status": "created",
        "timestamp": "2023-10-24T10:00:00Z",
        "note": "Pedido creado"
      }
    ],
    "createdAt": "2023-10-24T10:00:00Z"
  },
  "paymentUrl": "https://payment.gateway.com/pay/xyz123"
}
```

##### `GET /api/orders/:id`

**Descripción**: Obtener detalles de un pedido **Headers**: `Authorization: Bearer <token>`
**Respuesta**:

```json
{
  "success": true,
  "order": {
    "id": "order_uuid",
    "orderNumber": "FV-2023-001",
    "status": "in_preparation",
    "trackingNumber": "FV123456789",
    "items": [
      {
        "productId": "product_uuid",
        "name": "Ramo de Rosas Rojas Premium",
        "image": "/images/products/ramo-rosas-001.jpg",
        "quantity": 2,
        "price": 35000,
        "subtotal": 70000
      }
    ],
    "summary": {
      "subtotal": 70000,
      "shipping": 5000,
      "tax": 13300,
      "total": 88300
    },
    "shippingAddress": {
      "firstName": "Juan",
      "lastName": "Pérez",
      "street": "Av. Providencia 1234",
      "city": "Santiago",
      "phone": "+56912345678"
    },
    "deliveryInfo": {
      "type": "standard",
      "estimatedDate": "2023-10-26",
      "timeSlot": "morning",
      "carrier": "Flores Victoria Delivery",
      "driverName": "Carlos González",
      "driverPhone": "+56987654321"
    },
    "payment": {
      "method": "credit_card",
      "status": "completed",
      "transactionId": "TXN123456",
      "paidAt": "2023-10-24T10:05:00Z"
    },
    "timeline": [
      {
        "status": "created",
        "timestamp": "2023-10-24T10:00:00Z",
        "note": "Pedido creado",
        "location": "Sistema"
      },
      {
        "status": "payment_confirmed",
        "timestamp": "2023-10-24T10:05:00Z",
        "note": "Pago confirmado",
        "location": "Sistema"
      },
      {
        "status": "in_preparation",
        "timestamp": "2023-10-24T11:00:00Z",
        "note": "Preparando pedido",
        "location": "Taller Principal"
      }
    ],
    "notifications": {
      "sms": true,
      "email": true,
      "whatsapp": false
    },
    "estimatedDelivery": {
      "date": "2023-10-26",
      "timeWindow": "09:00-13:00"
    }
  }
}
```

##### `GET /api/orders`

**Descripción**: Obtener lista de pedidos del usuario **Headers**: `Authorization: Bearer <token>`
**Query Params**: `?page=1&limit=10&status=completed&dateFrom=2023-10-01&dateTo=2023-10-31`

##### `PUT /api/orders/:id/cancel`

**Descripción**: Cancelar pedido **Headers**: `Authorization: Bearer <token>` **Parámetros**:

```json
{
  "reason": "changed_mind",
  "details": "Decidí posponer el regalo"
}
```

---

## ❤️ **Lista de Deseos**

### **Wishlist Service** - `http://localhost:3006`

#### **Endpoints de Lista de Deseos**

##### `GET /api/wishlist`

**Descripción**: Obtener lista de deseos del usuario **Headers**: `Authorization: Bearer <token>`
**Respuesta**:

```json
{
  "success": true,
  "wishlist": {
    "id": "wishlist_uuid",
    "userId": "user_uuid",
    "items": [
      {
        "id": "wishlist_item_uuid",
        "productId": "product_uuid",
        "product": {
          "name": "Ramo de Rosas Blancas",
          "price": 40000,
          "salePrice": 32000,
          "image": "/images/products/ramo-rosas-blancas.jpg",
          "available": true,
          "rating": 4.7
        },
        "addedAt": "2023-10-20T14:30:00Z",
        "notes": "Para el cumpleaños de mamá"
      }
    ],
    "itemsCount": 1,
    "totalValue": 32000,
    "updatedAt": "2023-10-20T14:30:00Z"
  }
}
```

##### `POST /api/wishlist/items`

**Descripción**: Agregar producto a lista de deseos **Headers**: `Authorization: Bearer <token>`
**Parámetros**:

```json
{
  "productId": "product_uuid",
  "notes": "Para ocasión especial"
}
```

##### `DELETE /api/wishlist/items/:itemId`

**Descripción**: Eliminar producto de lista de deseos **Headers**: `Authorization: Bearer <token>`

---

## ⭐ **Reseñas y Calificaciones**

### **Review Service** - `http://localhost:3007`

#### **Endpoints de Reseñas**

##### `GET /api/reviews/product/:productId`

**Descripción**: Obtener reseñas de un producto **Query Params**:
`?page=1&limit=10&rating=5&sortBy=newest` **Respuesta**:

```json
{
  "success": true,
  "reviews": [
    {
      "id": "review_uuid",
      "userId": "user_uuid",
      "userName": "María González",
      "userAvatar": "/images/avatars/user-001.jpg",
      "rating": 5,
      "title": "Excelente calidad",
      "comment": "Las flores llegaron frescas y hermosas. El ramo superó mis expectativas.",
      "images": [
        {
          "url": "/images/reviews/review-001.jpg",
          "thumbnailUrl": "/images/reviews/thumbs/review-001.jpg"
        }
      ],
      "verified": true,
      "helpful": 12,
      "notHelpful": 1,
      "response": {
        "from": "Flores Victoria",
        "message": "¡Muchas gracias por tu reseña María! Nos alegra saber que el ramo cumplió con tus expectativas.",
        "createdAt": "2023-10-19T10:00:00Z"
      },
      "createdAt": "2023-10-18T15:20:00Z",
      "updatedAt": "2023-10-18T15:20:00Z"
    }
  ],
  "summary": {
    "averageRating": 4.8,
    "totalReviews": 127,
    "distribution": {
      "5": 89,
      "4": 28,
      "3": 7,
      "2": 2,
      "1": 1
    },
    "verifiedPercentage": 95.3
  },
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 127,
    "pages": 13
  }
}
```

##### `POST /api/reviews`

**Descripción**: Crear nueva reseña **Headers**: `Authorization: Bearer <token>` **Parámetros**:

```json
{
  "productId": "product_uuid",
  "orderId": "order_uuid",
  "rating": 5,
  "title": "Excelente producto",
  "comment": "Muy satisfecho con la compra. Recomendado 100%",
  "images": ["base64_image_1", "base64_image_2"]
}
```

##### `PUT /api/reviews/:id/helpful`

**Descripción**: Marcar reseña como útil **Headers**: `Authorization: Bearer <token>`
**Parámetros**:

```json
{
  "helpful": true
}
```

---

## 📞 **Contacto y Soporte**

### **Contact Service** - `http://localhost:3008`

#### **Endpoints de Contacto**

##### `POST /api/contact/message`

**Descripción**: Enviar mensaje de contacto **Parámetros**:

```json
{
  "firstName": "Juan",
  "lastName": "Pérez",
  "email": "juan@email.com",
  "phone": "+56912345678",
  "subject": "Consulta sobre productos",
  "message": "Hola, me gustaría saber más sobre sus arreglos florales personalizados.",
  "category": "product_inquiry",
  "urgency": "medium",
  "orderNumber": "FV-2023-001",
  "preferredContact": "email"
}
```

**Respuesta**:

```json
{
  "success": true,
  "ticket": {
    "id": "ticket_uuid",
    "ticketNumber": "CS-2023-001",
    "status": "open",
    "priority": "medium",
    "category": "product_inquiry",
    "assignedTo": null,
    "estimatedResponse": "2023-10-24T18:00:00Z",
    "createdAt": "2023-10-24T12:00:00Z"
  },
  "message": "Tu mensaje ha sido recibido. Te responderemos dentro de 6 horas."
}
```

##### `GET /api/contact/tickets/:id`

**Descripción**: Obtener detalles de ticket de soporte **Headers**: `Authorization: Bearer <token>`
**Respuesta**:

```json
{
  "success": true,
  "ticket": {
    "id": "ticket_uuid",
    "ticketNumber": "CS-2023-001",
    "status": "in_progress",
    "priority": "medium",
    "category": "product_inquiry",
    "subject": "Consulta sobre productos",
    "messages": [
      {
        "id": "message_uuid",
        "from": "customer",
        "message": "Hola, me gustaría saber más sobre sus arreglos florales personalizados.",
        "attachments": [],
        "createdAt": "2023-10-24T12:00:00Z"
      },
      {
        "id": "message_uuid_2",
        "from": "support",
        "agentName": "Ana Martínez",
        "message": "Hola Juan, gracias por contactarnos. Te cuento que ofrecemos...",
        "attachments": [
          {
            "name": "catalogo-personalizado.pdf",
            "url": "/downloads/catalogo-personalizado.pdf"
          }
        ],
        "createdAt": "2023-10-24T14:30:00Z"
      }
    ],
    "assignedTo": {
      "name": "Ana Martínez",
      "email": "ana.martinez@floresvictoria.cl",
      "avatar": "/images/staff/ana-martinez.jpg"
    },
    "createdAt": "2023-10-24T12:00:00Z",
    "updatedAt": "2023-10-24T14:30:00Z"
  }
}
```

---

## 🔄 **API Gateway - Endpoints Consolidados**

### **Gateway Service** - `http://localhost:3000`

El API Gateway actúa como punto de entrada único y enruta las peticiones a los microservicios
correspondientes:

#### **Estructura de Endpoints**

```
/api/auth/*          → Auth Service (3001)
/api/users/*         → User Service (3003)
/api/products/*      → Product Service (3009)
/api/cart/*          → Cart Service (3005)
/api/orders/*        → Order Service (3004)
/api/wishlist/*      → Wishlist Service (3006)
/api/reviews/*       → Review Service (3007)
/api/contact/*       → Contact Service (3008)
/api/analytics/*     → Analytics endpoints
/api/search/*        → Search functionality
/api/recommendations/* → Recommendation engine
```

#### **Middleware del Gateway**

- **Rate Limiting**: 100 requests/min por IP
- **CORS**: Configurado para dominios autorizados
- **Compression**: Gzip habilitado
- **Logging**: Registro completo de peticiones
- **Health Check**: `/health` endpoint
- **Authentication**: Verificación JWT automática
- **Request/Response Transformation**: Normalización de datos

#### **Health Check**

##### `GET /health`

**Respuesta**:

```json
{
  "status": "healthy",
  "timestamp": "2023-10-24T12:00:00Z",
  "services": {
    "auth-service": "healthy",
    "user-service": "healthy",
    "product-service": "healthy",
    "cart-service": "healthy",
    "order-service": "healthy",
    "wishlist-service": "healthy",
    "review-service": "healthy",
    "contact-service": "healthy"
  },
  "database": {
    "postgresql": "connected",
    "mongodb": "connected",
    "redis": "connected"
  },
  "uptime": "2 days, 14 hours, 32 minutes"
}
```

---

## 📊 **Monitoreo y Analytics**

### **Endpoints de Monitoreo**

##### `GET /api/analytics/dashboard`

**Descripción**: Métricas generales del sistema **Headers**: `Authorization: Bearer <admin_token>`
**Respuesta**:

```json
{
  "success": true,
  "metrics": {
    "orders": {
      "today": 45,
      "week": 312,
      "month": 1247,
      "revenue": {
        "today": 1250000,
        "week": 8750000,
        "month": 35600000
      }
    },
    "products": {
      "total": 156,
      "active": 142,
      "lowStock": 8,
      "outOfStock": 3
    },
    "users": {
      "total": 2847,
      "active": 1234,
      "new": 23
    },
    "performance": {
      "averageResponseTime": "245ms",
      "uptime": "99.9%",
      "errorRate": "0.1%"
    }
  },
  "charts": {
    "salesTrend": [
      {
        "date": "2023-10-24",
        "sales": 1250000,
        "orders": 45
      }
    ],
    "topProducts": [
      {
        "productId": "product_uuid",
        "name": "Ramo de Rosas Rojas",
        "sales": 89,
        "revenue": 3115000
      }
    ]
  }
}
```

---

## 🚀 **Webhooks y Eventos**

### **Sistema de Webhooks**

#### **Configuración de Webhooks**

##### `POST /api/webhooks/register`

**Headers**: `Authorization: Bearer <admin_token>` **Parámetros**:

```json
{
  "url": "https://miapp.com/webhook",
  "events": ["order.created", "order.completed", "payment.successful"],
  "secret": "webhook_secret_key",
  "active": true
}
```

#### **Eventos Disponibles**

- `order.created` - Nuevo pedido creado
- `order.updated` - Pedido actualizado
- `order.completed` - Pedido completado
- `order.cancelled` - Pedido cancelado
- `payment.successful` - Pago exitoso
- `payment.failed` - Pago fallido
- `product.created` - Producto creado
- `product.updated` - Producto actualizado
- `product.low_stock` - Stock bajo
- `user.registered` - Usuario registrado
- `review.created` - Nueva reseña

#### **Formato de Payload**

```json
{
  "id": "event_uuid",
  "event": "order.completed",
  "timestamp": "2023-10-24T12:00:00Z",
  "data": {
    "orderId": "order_uuid",
    "orderNumber": "FV-2023-001",
    "userId": "user_uuid",
    "total": 88300,
    "status": "completed"
  },
  "signature": "sha256=hash_signature"
}
```

---

## 🔧 **Utilidades y Herramientas**

### **Endpoints de Utilidad**

##### `GET /api/utils/countries`

**Descripción**: Lista de países disponibles **Respuesta**:

```json
{
  "success": true,
  "countries": [
    {
      "code": "CL",
      "name": "Chile",
      "regions": [
        {
          "code": "RM",
          "name": "Región Metropolitana",
          "cities": ["Santiago", "Las Condes", "Providencia"]
        }
      ]
    }
  ]
}
```

##### `GET /api/utils/currencies`

**Descripción**: Monedas soportadas **Respuesta**:

```json
{
  "success": true,
  "currencies": [
    {
      "code": "CLP",
      "name": "Peso Chileno",
      "symbol": "$",
      "default": true
    },
    {
      "code": "USD",
      "name": "Dólar Americano",
      "symbol": "$",
      "exchangeRate": 900
    }
  ]
}
```

##### `POST /api/utils/upload`

**Descripción**: Subir archivo **Headers**: `Authorization: Bearer <token>` **Content-Type**:
`multipart/form-data` **Parámetros**: `file` (archivo) **Respuesta**:

```json
{
  "success": true,
  "file": {
    "id": "file_uuid",
    "originalName": "imagen.jpg",
    "filename": "uploads/2023/10/24/uuid-imagen.jpg",
    "url": "/uploads/2023/10/24/uuid-imagen.jpg",
    "thumbnailUrl": "/uploads/2023/10/24/thumbs/uuid-imagen.jpg",
    "size": 245760,
    "mimeType": "image/jpeg",
    "uploadedAt": "2023-10-24T12:00:00Z"
  }
}
```

---

## 📋 **Códigos de Estado HTTP**

### **Códigos de Respuesta Estándar**

| Código | Descripción           | Uso                                  |
| ------ | --------------------- | ------------------------------------ |
| 200    | OK                    | Operación exitosa                    |
| 201    | Created               | Recurso creado exitosamente          |
| 400    | Bad Request           | Datos inválidos en la petición       |
| 401    | Unauthorized          | Token inválido o ausente             |
| 403    | Forbidden             | Sin permisos para la operación       |
| 404    | Not Found             | Recurso no encontrado                |
| 409    | Conflict              | Conflicto con estado actual          |
| 422    | Unprocessable Entity  | Validación de datos fallida          |
| 429    | Too Many Requests     | Límite de rate limiting excedido     |
| 500    | Internal Server Error | Error interno del servidor           |
| 502    | Bad Gateway           | Error de gateway/proxy               |
| 503    | Service Unavailable   | Servicio temporalmente no disponible |

### **Estructura de Respuesta de Error**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Los datos proporcionados no son válidos",
    "details": [
      {
        "field": "email",
        "message": "El email no tiene un formato válido"
      },
      {
        "field": "password",
        "message": "La contraseña debe tener al menos 8 caracteres"
      }
    ],
    "timestamp": "2023-10-24T12:00:00Z",
    "requestId": "req_uuid"
  }
}
```

---

## 🔒 **Autenticación JWT**

### **Estructura del Token**

```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "sub": "user_uuid",
    "email": "usuario@ejemplo.com",
    "role": "user",
    "permissions": ["read:products", "write:cart", "read:orders"],
    "iat": 1635062400,
    "exp": 1635148800,
    "iss": "flores-victoria-api",
    "aud": "flores-victoria-app"
  }
}
```

### **Roles y Permisos**

#### **Roles Disponibles**

- `super_admin` - Acceso completo al sistema
- `admin` - Gestión de productos, pedidos y usuarios
- `manager` - Gestión de productos y pedidos
- `support` - Acceso a tickets y soporte al cliente
- `user` - Usuario final con acceso básico

#### **Sistema de Permisos**

```
products:
  - read:products (ver catálogo)
  - write:products (crear/editar productos)
  - delete:products (eliminar productos)

orders:
  - read:orders (ver pedidos)
  - write:orders (crear/editar pedidos)
  - cancel:orders (cancelar pedidos)

users:
  - read:users (ver usuarios)
  - write:users (crear/editar usuarios)
  - delete:users (eliminar usuarios)

analytics:
  - read:analytics (ver métricas)
  - export:analytics (exportar reportes)
```

---

## 📚 **SDKs y Librerías**

### **SDK JavaScript**

```javascript
// Instalación
npm install @flores-victoria/api-sdk

// Uso básico
import FloresVictoriaAPI from '@flores-victoria/api-sdk';

const api = new FloresVictoriaAPI({
  baseURL: 'http://localhost:3000/api',
  apiKey: 'your_api_key'
});

// Autenticación
const { user, token } = await api.auth.login({
  email: 'usuario@ejemplo.com',
  password: 'password123'
});

// Productos
const products = await api.products.list({
  page: 1,
  limit: 12,
  category: 'ramos'
});

// Carrito
await api.cart.addItem({
  productId: 'product_uuid',
  quantity: 1
});

// Pedidos
const order = await api.orders.create({
  cartId: 'cart_uuid',
  shippingAddress: { /* ... */ }
});
```

### **SDK PHP**

```php
// Instalación
composer require flores-victoria/api-sdk

// Uso básico
use FloresVictoria\SDK\Client;

$client = new Client([
    'base_url' => 'http://localhost:3000/api',
    'api_key' => 'your_api_key'
]);

// Productos
$products = $client->products()->list([
    'page' => 1,
    'limit' => 12,
    'category' => 'ramos'
]);

// Pedidos
$order = $client->orders()->create([
    'cartId' => 'cart_uuid',
    'shippingAddress' => [/* ... */]
]);
```

---

## 🧪 **Testing**

### **Endpoints de Testing**

##### `GET /api/test/ping`

**Descripción**: Verificar conectividad básica **Respuesta**:

```json
{
  "success": true,
  "message": "pong",
  "timestamp": "2023-10-24T12:00:00Z"
}
```

##### `POST /api/test/echo`

**Descripción**: Devolver datos enviados (útil para testing) **Parámetros**: Cualquier JSON
**Respuesta**:

```json
{
  "success": true,
  "echo": {
    "data": "los_datos_enviados",
    "timestamp": "2023-10-24T12:00:00Z"
  }
}
```

### **Colección Postman**

Disponible en: `/docs/postman/Flores-Victoria-API.postman_collection.json`

### **Swagger/OpenAPI**

Documentación interactiva disponible en: `http://localhost:3000/docs`

---

## 🔍 **Búsqueda y Filtros**

### **API de Búsqueda**

##### `GET /api/search`

**Descripción**: Búsqueda global en la plataforma **Query Params**:

- `q` - Término de búsqueda
- `type` - Tipo de resultado (products, orders, users)
- `filters` - Filtros adicionales en JSON
- `page` - Página (default: 1)
- `limit` - Límite de resultados (default: 20)

**Ejemplo**:

```
GET /api/search?q=rosas rojas&type=products&filters={"price":{"min":20000,"max":50000}}&page=1&limit=12
```

**Respuesta**:

```json
{
  "success": true,
  "query": "rosas rojas",
  "results": {
    "products": [
      {
        "id": "product_uuid",
        "name": "Ramo de Rosas Rojas Premium",
        "price": 35000,
        "image": "/images/products/ramo-rosas-001.jpg",
        "rating": 4.8,
        "relevanceScore": 0.95
      }
    ]
  },
  "suggestions": ["rosas rojas premium", "ramo rosas rojas", "flores rojas"],
  "facets": {
    "categories": [
      {
        "name": "ramos",
        "count": 23
      }
    ],
    "priceRanges": [
      {
        "range": "20000-50000",
        "count": 18
      }
    ]
  },
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 23,
    "pages": 2
  },
  "searchTime": "0.045s"
}
```

---

## 📈 **Analytics y Reportes**

### **Endpoints de Analytics**

##### `GET /api/analytics/sales`

**Headers**: `Authorization: Bearer <admin_token>` **Query Params**:
`?period=month&startDate=2023-10-01&endDate=2023-10-31` **Respuesta**:

```json
{
  "success": true,
  "period": "month",
  "data": {
    "totalSales": 35600000,
    "totalOrders": 1247,
    "averageOrderValue": 28553,
    "topProducts": [
      {
        "productId": "product_uuid",
        "name": "Ramo de Rosas Rojas",
        "sales": 3115000,
        "orders": 89
      }
    ],
    "salesByDay": [
      {
        "date": "2023-10-01",
        "sales": 1200000,
        "orders": 42
      }
    ],
    "salesByCategory": [
      {
        "category": "ramos",
        "sales": 18500000,
        "percentage": 52
      }
    ]
  }
}
```

##### `GET /api/analytics/customers`

**Headers**: `Authorization: Bearer <admin_token>` **Respuesta**:

```json
{
  "success": true,
  "data": {
    "totalCustomers": 2847,
    "newCustomers": 156,
    "activeCustomers": 1234,
    "customerRetention": 68.5,
    "lifetimeValue": {
      "average": 125000,
      "median": 89000
    },
    "segments": [
      {
        "name": "VIP",
        "count": 456,
        "percentage": 16
      },
      {
        "name": "Regular",
        "count": 1243,
        "percentage": 44
      }
    ]
  }
}
```

---

## 🚦 **Rate Limiting**

### **Límites por Endpoint**

| Endpoint             | Límite        | Ventana | Aplicado por |
| -------------------- | ------------- | ------- | ------------ |
| `/api/auth/login`    | 5 requests    | 15 min  | IP           |
| `/api/auth/register` | 3 requests    | 60 min  | IP           |
| `/api/products`      | 100 requests  | 60 min  | IP           |
| `/api/cart/*`        | 50 requests   | 60 min  | Usuario      |
| `/api/orders`        | 20 requests   | 60 min  | Usuario      |
| `/api/search`        | 30 requests   | 60 min  | IP           |
| Global               | 1000 requests | 60 min  | IP           |

### **Headers de Rate Limiting**

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1635148800
X-RateLimit-RetryAfter: 3600
```

---

## 🌍 **Internacionalización**

### **Idiomas Soportados**

- `es` - Español (default)
- `en` - Inglés

### **Headers de Idioma**

```
Accept-Language: es-CL,es;q=0.9,en;q=0.8
```

### **Respuestas Multiidioma**

```json
{
  "success": true,
  "message": {
    "es": "Producto agregado al carrito exitosamente",
    "en": "Product added to cart successfully"
  },
  "data": {
    "name": {
      "es": "Ramo de Rosas Rojas",
      "en": "Red Roses Bouquet"
    }
  }
}
```

---

## 📊 **Base de Datos**

### **PostgreSQL - Datos Transaccionales**

**Host**: `localhost:5433` **Database**: `flores_db`

#### **Tablas Principales**

- `users` - Información de usuarios
- `orders` - Pedidos y transacciones
- `order_items` - Items de pedidos
- `payments` - Información de pagos
- `addresses` - Direcciones de envío
- `coupons` - Cupones de descuento
- `reviews` - Reseñas de productos

### **MongoDB - Datos No-Relacionales**

**Host**: `localhost:27018` **Database**: `microservices_db`

#### **Colecciones Principales**

- `products` - Catálogo de productos
- `carts` - Carritos de compra
- `wishlists` - Listas de deseos
- `search_logs` - Logs de búsqueda
- `analytics_events` - Eventos de analytics
- `notifications` - Notificaciones

### **Redis - Cache y Sesiones**

**Host**: `localhost:6380`

#### **Estructura de Keys**

- `session:user_id` - Sesiones de usuario
- `cart:user_id` - Cache de carritos
- `product:product_id` - Cache de productos
- `search:query_hash` - Cache de búsquedas
- `rate_limit:ip` - Rate limiting por IP

---

## 🔧 **Variables de Entorno**

### **Archivo .env**

```bash
# Aplicación
NODE_ENV=production
PORT=3000
APP_NAME="Flores Victoria"
APP_URL=http://localhost:3000

# Base de Datos
DATABASE_URL=postgresql://flores_user:password@localhost:5433/flores_db
MONGODB_URL=mongodb://localhost:27018/microservices_db
REDIS_URL=redis://localhost:6380

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRES_IN=7d

# Servicios Externos
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@floresvictoria.cl
SMTP_PASS=your_email_password

# Pasarelas de Pago
WEBPAY_ENVIRONMENT=integration
WEBPAY_COMMERCE_CODE=597055555532
WEBPAY_API_KEY=579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C

# Storage
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
S3_BUCKET=flores-victoria-assets

# Monitoreo
PROMETHEUS_ENABLED=true
JAEGER_ENDPOINT=http://localhost:14268/api/traces
SENTRY_DSN=your_sentry_dsn

# Analytics
GOOGLE_ANALYTICS_ID=GA_TRACKING_ID
FACEBOOK_PIXEL_ID=FB_PIXEL_ID

# Notificaciones
ONESIGNAL_APP_ID=your_onesignal_app_id
ONESIGNAL_API_KEY=your_onesignal_api_key
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
```

---

## 🚀 **Deployment**

### **Comandos de Despliegue**

#### **Desarrollo**

```bash
# Iniciar servicios de desarrollo
npm run dev

# Iniciar con Docker
docker-compose -f docker-compose.dev.yml up -d
```

#### **Producción**

```bash
# Construir para producción
npm run build

# Iniciar servicios de producción
docker-compose -f docker-compose.prod.yml up -d

# Escalar servicios
docker-compose up -d --scale product-service=3 --scale order-service=2
```

### **Health Checks**

Todos los servicios incluyen health checks automáticos:

```bash
# Verificar estado de todos los servicios
curl http://localhost:3000/health

# Verificar servicio específico
curl http://localhost:3001/health
```

---

## 📞 **Soporte**

### **Contacto Técnico**

- **Email**: dev@floresvictoria.cl
- **Slack**: #api-support
- **Documentación**: http://localhost:3000/docs
- **Status Page**: http://status.floresvictoria.cl

### **SLA y Disponibilidad**

- **Uptime**: 99.9% garantizado
- **Response Time**: < 500ms promedio
- **Support**: 24/7 para clientes enterprise

---

## 📝 **Changelog de API**

### **v3.0.0** (2023-10-24)

- ✅ Arquitectura de microservicios completa
- ✅ Sistema de autenticación JWT
- ✅ API Gateway con rate limiting
- ✅ Monitoreo avanzado con Prometheus
- ✅ Documentación Swagger/OpenAPI
- ✅ SDKs para JavaScript y PHP
- ✅ Sistema de webhooks
- ✅ Cache con Redis
- ✅ Base de datos multi-engine
- ✅ Internacionalización ES/EN

### **Próximas Versiones**

- **v3.1.0**: GraphQL API
- **v3.2.0**: Real-time subscriptions
- **v3.3.0**: AI-powered recommendations
- **v4.0.0**: Serverless architecture

---

## 🎯 **Casos de Uso Comunes**

### **1. Flujo Completo de Compra**

```javascript
// 1. Autenticación
const auth = await api.post('/api/auth/login', {
  email: 'cliente@email.com',
  password: 'password123',
});

// 2. Buscar productos
const products = await api.get('/api/products?category=ramos&limit=12');

// 3. Agregar al carrito
const cartItem = await api.post('/api/cart/items', {
  productId: 'product_uuid',
  quantity: 1,
});

// 4. Revisar carrito
const cart = await api.get('/api/cart');

// 5. Crear pedido
const order = await api.post('/api/orders', {
  cartId: cart.id,
  shippingAddress: {
    /* ... */
  },
});

// 6. Confirmar pago
const payment = await api.post('/api/payments', {
  orderId: order.id,
  paymentMethod: 'credit_card',
});
```

### **2. Gestión de Inventario (Admin)**

```javascript
// 1. Obtener productos con stock bajo
const lowStock = await api.get('/api/products?stock_lt=5');

// 2. Actualizar stock
await api.put('/api/products/product_uuid', {
  inventory: { stock: 25 },
});

// 3. Crear nuevo producto
const newProduct = await api.post('/api/products', {
  name: 'Nuevo Ramo',
  price: 35000,
  category: 'ramos',
});
```

### **3. Análisis de Ventas**

```javascript
// 1. Métricas generales
const dashboard = await api.get('/api/analytics/dashboard');

// 2. Ventas por período
const sales = await api.get('/api/analytics/sales?period=month');

// 3. Productos más vendidos
const topProducts = await api.get('/api/analytics/products/top?limit=10');
```

---

Esta documentación cubre todos los aspectos principales de la API de Flores Victoria v3.0. Para
información más detallada sobre endpoints específicos, consulta la documentación interactiva en
`/docs` o contacta al equipo de desarrollo.

**Última actualización**: 24 de Octubre, 2023  
**Versión de API**: v3.0.0  
**Status**: ✅ Producción
