# 📚 API Documentation - Flores Victoria v3.0

> Documentación completa de la API REST del sistema de e-commerce Flores Victoria

## 🌐 URL Base

```
Desarrollo:  http://localhost:3000/api
Producción:  https://flores-victoria.com/api
```

## 🔐 Autenticación

La mayoría de los endpoints requieren autenticación mediante JWT.

### Obtener Token

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "usuario@ejemplo.com",
  "password": "contraseña"
}
```

**Respuesta:**

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user_123",
    "name": "Juan Pérez",
    "email": "usuario@ejemplo.com"
  }
}
```

### Usar Token

Incluir en todas las peticiones autenticadas:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

---

## 📦 Productos

### Listar Productos

```http
GET /api/products
```

**Query Parameters:**

- `page` (number): Número de página (default: 1)
- `limit` (number): Productos por página (default: 12, max: 100)
- `category` (string): Filtrar por categoría
- `minPrice` (number): Precio mínimo
- `maxPrice` (number): Precio máximo
- `search` (string): Búsqueda por texto
- `sort` (string): Ordenar por campo (price, name, created)
- `order` (string): asc o desc

**Ejemplo:**

```bash
curl "http://localhost:3000/api/products?category=rosas&limit=10&sort=price&order=asc"
```

**Respuesta:**

```json
{
  "success": true,
  "products": [
    {
      "_id": "product_123",
      "name": "Ramo de Rosas Rojas",
      "description": "Hermoso ramo de 12 rosas rojas",
      "price": 45000,
      "category": "rosas",
      "images": ["passion-eterna-1.jpg"],
      "stock": 15,
      "featured": true
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "pages": 5
  }
}
```

### Obtener Producto

```http
GET /api/products/:id
```

**Respuesta:**

```json
{
  "success": true,
  "product": {
    "_id": "product_123",
    "name": "Ramo de Rosas Rojas",
    "description": "Hermoso ramo de 12 rosas rojas frescas",
    "price": 45000,
    "category": "rosas",
    "images": ["passion-eterna-1.jpg", "passion-eterna-2.jpg"],
    "stock": 15,
    "featured": true,
    "tags": ["romántico", "aniversario", "san valentín"],
    "createdAt": "2025-10-01T10:00:00Z",
    "updatedAt": "2025-10-28T12:00:00Z"
  }
}
```

### Crear Producto (Admin)

```http
POST /api/products
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Ramo de Tulipanes",
  "description": "Hermoso ramo de tulipanes holandeses",
  "price": 35000,
  "category": "tulipanes",
  "stock": 20,
  "images": ["tulipanes-1.jpg"],
  "tags": ["primavera", "colorido"]
}
```

---

## 🤖 Recomendaciones IA

### Recomendaciones Personalizadas

```http
GET /api/ai/recommendations/:userId
```

**Query Parameters:**

- `limit` (number): Número de recomendaciones (default: 5, max: 20)

**Ejemplo:**

```bash
curl "http://localhost:3000/api/ai/recommendations/user_123?limit=5"
```

**Respuesta:**

```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "productId": "product_456",
        "name": "Ramo de Lirios",
        "confidence": 0.92,
        "reason": "Basado en tus compras anteriores",
        "price": 40000,
        "category": "lirios"
      }
    ],
    "metadata": {
      "algorithm": "collaborative-filtering",
      "generated": "2025-10-28T13:00:00Z"
    }
  }
}
```

### Productos Similares

```http
GET /api/ai/similar/:productId
```

**Query Parameters:**

- `limit` (number): Número de productos similares (default: 5)

**Respuesta:**

```json
{
  "success": true,
  "data": {
    "sourceProduct": {
      "id": "product_123",
      "name": "Ramo de Rosas Rojas"
    },
    "similar": [
      {
        "productId": "product_789",
        "name": "Ramo de Rosas Rosadas",
        "similarity": 0.95,
        "price": 42000
      }
    ]
  }
}
```

### Productos en Tendencia

```http
GET /api/ai/trending
```

**Query Parameters:**

- `limit` (number): Número de productos (default: 10)
- `period` (string): day, week, month (default: week)

**Respuesta:**

```json
{
  "success": true,
  "data": {
    "trending": [
      {
        "productId": "product_321",
        "name": "Arreglo Primaveral",
        "views": 1250,
        "purchases": 45,
        "trend": "rising"
      }
    ],
    "period": "week"
  }
}
```

### Productos por Ocasión

```http
GET /api/ai/occasion/:occasion
```

**Ocasiones disponibles:**

- `birthday` - Cumpleaños
- `anniversary` - Aniversario
- `valentine` - San Valentín
- `mothers-day` - Día de la Madre
- `wedding` - Bodas
- `funeral` - Funeral

**Ejemplo:**

```bash
curl "http://localhost:3000/api/ai/occasion/birthday?limit=10"
```

---

## 🖼️ Procesamiento de Imágenes (WASM)

### Información del Servicio

```http
GET /api/wasm/info
```

**Respuesta:**

```json
{
  "service": "Flores Victoria WebAssembly Image Processor",
  "version": "1.0.0",
  "endpoints": {
    "health": "GET /health",
    "process": "POST /process",
    "optimize": "POST /optimize",
    "thumbnail": "POST /thumbnail",
    "enhance": "POST /enhance"
  },
  "limits": {
    "maxFileSize": 67108864,
    "supportedFormats": ["image/jpeg", "image/png", "image/webp"],
    "maxImageDimensions": "4096x4096"
  }
}
```

### Procesar Imagen

```http
POST /api/wasm/process
Content-Type: multipart/form-data

image: <archivo>
operations: [
  {
    "type": "resize",
    "width": 800,
    "height": 600
  },
  {
    "type": "filters",
    "filters": {
      "brightness": 1.1,
      "contrast": 1.05,
      "saturation": 1.2
    }
  }
]
```

**Operaciones disponibles:**

- `resize` - Cambiar tamaño
- `crop` - Recortar
- `filters` - Aplicar filtros (brightness, contrast, saturation, sharpness)
- `blur` - Desenfocar
- `equalize` - Ecualizar
- `edges` - Detección de bordes

**Respuesta:**

```json
{
  "success": true,
  "data": {
    "width": 800,
    "height": 600,
    "format": "jpeg",
    "size": 125847,
    "operations": 2
  },
  "processing": {
    "engine": "wasm",
    "timestamp": "2025-10-28T13:10:00Z"
  }
}
```

### Optimizar para Web

```http
POST /api/wasm/optimize
Content-Type: multipart/form-data

image: <archivo>
maxWidth: 1920
quality: 0.85
```

**Respuesta:** Imagen optimizada (binary)

### Generar Thumbnail

```http
POST /api/wasm/thumbnail
Content-Type: multipart/form-data

image: <archivo>
size: 300
```

**Respuesta:** Thumbnail (binary)

### Mejorar Producto

```http
POST /api/wasm/enhance
Content-Type: multipart/form-data

image: <archivo>
```

Aplica mejoras automáticas: +5% brillo, +20% saturación, sharpening, normalización.

---

## 💳 Pagos

### Health Check

```http
GET /api/payments/health
```

**Respuesta:**

```json
{
  "status": "OK",
  "service": "payment-service",
  "environment": "production",
  "port": 3018,
  "metrics": {
    "totalPayments": 150,
    "totalRefunds": 5,
    "supportedCurrencies": ["USD", "EUR", "MXN", "CLP"],
    "supportedMethods": ["credit_card", "debit_card", "paypal", "stripe", "bank_transfer"]
  }
}
```

### Crear Pago

```http
POST /api/payments/payments
Content-Type: application/json

{
  "amount": 50000,
  "currency": "CLP",
  "method": "credit_card",
  "customer": {
    "name": "Juan Pérez",
    "email": "juan@ejemplo.com",
    "phone": "+56912345678"
  },
  "metadata": {
    "orderId": "order_123",
    "products": ["product_456"]
  }
}
```

**Respuesta (Exitosa):**

```json
{
  "success": true,
  "message": "Payment processed successfully",
  "payment": {
    "transactionId": "TXN-1730117400-ABC123",
    "amount": 50000,
    "currency": "CLP",
    "method": "credit_card",
    "status": "completed",
    "processedAt": "2025-10-28T13:30:00Z"
  }
}
```

**Respuesta (Fallida):**

```json
{
  "success": false,
  "error": "Payment failed",
  "payment": {
    "transactionId": "TXN-1730117400-ABC123",
    "status": "failed",
    "errorCode": "DECLINED",
    "errorMessage": "Payment declined by gateway"
  }
}
```

### Consultar Pago

```http
GET /api/payments/payments/:transactionId
```

**Respuesta:**

```json
{
  "transactionId": "TXN-1730117400-ABC123",
  "amount": 50000,
  "currency": "CLP",
  "method": "credit_card",
  "status": "completed",
  "customer": {
    "name": "Juan Pérez",
    "email": "juan@ejemplo.com"
  },
  "metadata": {
    "orderId": "order_123"
  },
  "createdAt": "2025-10-28T13:30:00Z",
  "processedAt": "2025-10-28T13:30:02Z",
  "gatewayTransactionId": "GTW-ABC123DEF456"
}
```

### Listar Pagos

```http
GET /api/payments/payments
```

**Query Parameters:**

- `status` (string): pending, processing, completed, failed, refunded, cancelled
- `method` (string): credit_card, debit_card, paypal, stripe, bank_transfer
- `currency` (string): USD, EUR, MXN, CLP
- `limit` (number): Resultados por página (default: 50, max: 100)
- `offset` (number): Offset para paginación

**Ejemplo:**

```bash
curl "http://localhost:3000/api/payments/payments?status=completed&limit=20"
```

**Respuesta:**

```json
{
  "total": 150,
  "limit": 20,
  "offset": 0,
  "payments": [
    {
      "transactionId": "TXN-1730117400-ABC123",
      "amount": 50000,
      "currency": "CLP",
      "method": "credit_card",
      "status": "completed",
      "createdAt": "2025-10-28T13:30:00Z"
    }
  ]
}
```

### Procesar Reembolso

```http
POST /api/payments/payments/:transactionId/refund
Content-Type: application/json

{
  "amount": 50000,
  "reason": "Solicitud del cliente"
}
```

**Respuesta:**

```json
{
  "success": true,
  "message": "Refund processed successfully",
  "refund": {
    "refundId": "RFD-1730117500-XYZ789",
    "transactionId": "TXN-1730117400-ABC123",
    "amount": 50000,
    "currency": "CLP",
    "reason": "Solicitud del cliente",
    "status": "completed"
  }
}
```

### Estadísticas

```http
GET /api/payments/stats
```

**Respuesta:**

```json
{
  "total": {
    "payments": 150,
    "refunds": 5
  },
  "byStatus": {
    "completed": 140,
    "failed": 5,
    "pending": 3,
    "refunded": 2
  },
  "byMethod": {
    "credit_card": 80,
    "debit_card": 40,
    "paypal": 20,
    "bank_transfer": 10
  },
  "byCurrency": {
    "CLP": 120,
    "USD": 20,
    "EUR": 10
  },
  "totalAmount": {
    "CLP": 6000000,
    "USD": 1500,
    "EUR": 800
  }
}
```

---

## 🎨 Generación de Imágenes con IA

### Generar Imagen

```http
POST /api/ai-images/generate
Content-Type: application/json

{
  "prompt": "beautiful red roses bouquet, professional photography, high quality",
  "width": 512,
  "height": 512,
  "model": "FLUX.1-schnell",
  "provider": "huggingface"
}
```

**Proveedores disponibles:**

- `huggingface` - Hugging Face (rápido, recomendado)
- `ai-horde` - AI Horde (gratuito, más lento)

**Modelos Hugging Face:**

- `FLUX.1-schnell` - Rápido (default)
- `FLUX.1-dev` - Mejor calidad
- `stable-diffusion-xl-base-1.0` - SDXL

**Respuesta:**

```json
{
  "success": true,
  "imageUrl": "http://localhost:3000/generated/image_123.png",
  "metadata": {
    "provider": "huggingface",
    "model": "FLUX.1-schnell",
    "prompt": "beautiful red roses bouquet...",
    "width": 512,
    "height": 512,
    "generatedAt": "2025-10-28T13:40:00Z"
  }
}
```

### Presets Disponibles

```http
GET /api/ai-images/presets
```

**Respuesta:**

```json
{
  "presets": [
    {
      "id": "roses-romantic",
      "name": "Rosas Románticas",
      "prompt": "elegant red roses bouquet, romantic atmosphere, soft lighting",
      "category": "roses"
    },
    {
      "id": "mixed-spring",
      "name": "Primavera Mixta",
      "prompt": "colorful spring flowers mix, vibrant colors, fresh",
      "category": "mixed"
    }
  ]
}
```

---

## 📊 Códigos de Estado HTTP

| Código | Significado           | Descripción                          |
| ------ | --------------------- | ------------------------------------ |
| 200    | OK                    | Solicitud exitosa                    |
| 201    | Created               | Recurso creado exitosamente          |
| 400    | Bad Request           | Solicitud inválida                   |
| 401    | Unauthorized          | No autenticado                       |
| 403    | Forbidden             | Sin permisos                         |
| 404    | Not Found             | Recurso no encontrado                |
| 422    | Unprocessable Entity  | Validación fallida                   |
| 429    | Too Many Requests     | Rate limit excedido                  |
| 500    | Internal Server Error | Error del servidor                   |
| 503    | Service Unavailable   | Servicio temporalmente no disponible |

---

## 🚦 Rate Limiting

El API Gateway implementa rate limiting para proteger los servicios:

- **Desarrollo**: 2000 requests / 15 minutos por IP
- **Producción**: 500 requests / 15 minutos por IP

Headers de respuesta:

```
X-RateLimit-Limit: 500
X-RateLimit-Remaining: 495
X-RateLimit-Reset: 1730118000
```

---

## 🔍 Ejemplos de Uso

### cURL

```bash
# Listar productos
curl "http://localhost:3000/api/products?limit=5"

# Login
curl -X POST "http://localhost:3000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Recomendaciones
curl "http://localhost:3000/api/ai/recommendations/guest?limit=3"

# Crear pago
curl -X POST "http://localhost:3000/api/payments/payments" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 45000,
    "currency": "CLP",
    "method": "credit_card",
    "customer": {"name": "Test User", "email": "test@test.com"}
  }'
```

### JavaScript (Fetch)

```javascript
// Obtener productos
const response = await fetch('http://localhost:3000/api/products?limit=10');
const data = await response.json();

// Crear pago
const payment = await fetch('http://localhost:3000/api/payments/payments', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    amount: 50000,
    currency: 'CLP',
    method: 'credit_card',
    customer: {
      name: 'Juan Pérez',
      email: 'juan@example.com',
    },
  }),
});
const result = await payment.json();
```

---

## 🆘 Soporte

Para problemas con la API:

- **Documentación completa**: Ver `CONNECTIVITY_GUIDE.md`
- **Health Checks**: Todos los servicios tienen `/health`
- **Logs**: `docker logs flores-victoria-<servicio>`

---

## 🎉 Promociones (v3.1.0+)

### Listar Promociones

**Endpoint**: `GET /api/promotions`

**Descripción**: Obtiene todas las promociones activas con paginación.

**Query Parameters**: | Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------| | `status` | string | No | Filtrar por estado:
`active`, `inactive`, `scheduled`, `expired` | | `type` | string | No | Filtrar por tipo:
`percentage`, `fixed`, `bogo`, `free_shipping` | | `page` | number | No | Número de página
(default: 1) | | `limit` | number | No | Items por página (default: 10, max: 100) |

**Request**:

```http
GET /api/promotions?status=active&limit=20
Authorization: Bearer <token>
```

**Response 200**:

```json
{
  "promotions": [
    {
      "_id": "67203a5b8f4e9a001f7d6c21",
      "code": "VERANO2025",
      "name": "Descuento de Verano",
      "description": "15% de descuento en todos los productos",
      "type": "percentage",
      "discount": 15,
      "startDate": "2025-01-01T00:00:00.000Z",
      "endDate": "2025-03-31T23:59:59.000Z",
      "isActive": true,
      "usageCount": 45,
      "maxUses": 1000,
      "minPurchase": 30000,
      "applicableTo": {
        "products": ["prod_123", "prod_456"],
        "categories": ["rosas", "tulipanes"]
      },
      "createdAt": "2025-01-01T10:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 15,
    "page": 1,
    "pages": 2,
    "limit": 20
  }
}
```

---

### Crear Promoción

**Endpoint**: `POST /api/promotions`

**Descripción**: Crea una nueva promoción (requiere rol admin).

**Headers**:

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:

```json
{
  "code": "NAVIDAD2025",
  "name": "Promoción Navideña",
  "description": "25% de descuento en arreglos navideños",
  "type": "percentage",
  "discount": 25,
  "startDate": "2025-12-01T00:00:00.000Z",
  "endDate": "2025-12-31T23:59:59.000Z",
  "isActive": true,
  "maxUses": 500,
  "minPurchase": 50000,
  "applicableTo": {
    "categories": ["arreglos", "bouquets"]
  }
}
```

**Response 201**:

```json
{
  "success": true,
  "promotion": {
    "_id": "67203b2c9e1a7b002c8d3f45",
    "code": "NAVIDAD2025",
    "name": "Promoción Navideña",
    "description": "25% de descuento en arreglos navideños",
    "type": "percentage",
    "discount": 25,
    "startDate": "2025-12-01T00:00:00.000Z",
    "endDate": "2025-12-31T23:59:59.000Z",
    "isActive": true,
    "usageCount": 0,
    "maxUses": 500,
    "minPurchase": 50000,
    "applicableTo": {
      "categories": ["arreglos", "bouquets"]
    },
    "createdAt": "2025-10-28T15:30:00.000Z"
  }
}
```

**Response 400** (código duplicado):

```json
{
  "error": "Código de promoción ya existe"
}
```

**Response 401** (no autenticado):

```json
{
  "error": "No autorizado"
}
```

---

### Obtener Promoción por ID

**Endpoint**: `GET /api/promotions/:id`

**Request**:

```http
GET /api/promotions/67203a5b8f4e9a001f7d6c21
Authorization: Bearer <token>
```

**Response 200**:

```json
{
  "promotion": {
    "_id": "67203a5b8f4e9a001f7d6c21",
    "code": "VERANO2025",
    "name": "Descuento de Verano",
    "type": "percentage",
    "discount": 15,
    "isActive": true,
    "usageCount": 45
  }
}
```

**Response 404**:

```json
{
  "error": "Promoción no encontrada"
}
```

---

### Validar Código de Promoción

**Endpoint**: `POST /api/promotions/validate`

**Descripción**: Valida si un código de promoción es aplicable a un carrito.

**Request**:

```http
POST /api/promotions/validate
Content-Type: application/json

{
  "code": "VERANO2025",
  "cartTotal": 75000,
  "items": [
    {
      "productId": "prod_123",
      "category": "rosas",
      "quantity": 2,
      "price": 25000
    },
    {
      "productId": "prod_456",
      "category": "tulipanes",
      "quantity": 1,
      "price": 25000
    }
  ]
}
```

**Response 200** (válido):

```json
{
  "valid": true,
  "promotion": {
    "code": "VERANO2025",
    "type": "percentage",
    "discount": 15
  },
  "discountAmount": 11250,
  "finalTotal": 63750
}
```

**Response 400** (no válido):

```json
{
  "valid": false,
  "error": "Promoción expirada",
  "code": "EXPIRED"
}
```

**Códigos de Error**:

- `NOT_FOUND`: Código no existe
- `EXPIRED`: Promoción vencida
- `INACTIVE`: Promoción desactivada
- `MAX_USES_REACHED`: Uso máximo alcanzado
- `MIN_PURCHASE_NOT_MET`: Compra mínima no alcanzada (requiere ${minPurchase})
- `NOT_APPLICABLE`: Promoción no aplica a los productos del carrito

---

### Actualizar Promoción

**Endpoint**: `PUT /api/promotions/:id`

**Descripción**: Actualiza una promoción existente (requiere rol admin).

**Request**:

```http
PUT /api/promotions/67203a5b8f4e9a001f7d6c21
Authorization: Bearer <token>
Content-Type: application/json

{
  "discount": 20,
  "maxUses": 1500,
  "isActive": true
}
```

**Response 200**:

```json
{
  "success": true,
  "promotion": {
    "_id": "67203a5b8f4e9a001f7d6c21",
    "code": "VERANO2025",
    "discount": 20,
    "maxUses": 1500,
    "isActive": true,
    "updatedAt": "2025-10-28T16:00:00.000Z"
  }
}
```

---

### Eliminar Promoción

**Endpoint**: `DELETE /api/promotions/:id`

**Descripción**: Elimina una promoción (soft delete, marca como inactiva).

**Request**:

```http
DELETE /api/promotions/67203a5b8f4e9a001f7d6c21
Authorization: Bearer <token>
```

**Response 200**:

```json
{
  "success": true,
  "message": "Promoción eliminada exitosamente"
}
```

---

### Activar/Desactivar Promoción

**Endpoint**: `PATCH /api/promotions/:id/toggle`

**Descripción**: Cambia el estado activo/inactivo de una promoción.

**Request**:

```http
PATCH /api/promotions/67203a5b8f4e9a001f7d6c21/toggle
Authorization: Bearer <token>
```

**Response 200**:

```json
{
  "success": true,
  "isActive": false,
  "message": "Promoción desactivada"
}
```

---

### Obtener Estadísticas de Promoción

**Endpoint**: `GET /api/promotions/:id/stats`

**Descripción**: Obtiene estadísticas de uso de una promoción.

**Response 200**:

```json
{
  "promotion": {
    "code": "VERANO2025",
    "usageCount": 45,
    "maxUses": 1000,
    "usagePercentage": 4.5
  },
  "stats": {
    "totalDiscount": 506250,
    "averageDiscount": 11250,
    "totalOrders": 45,
    "conversionRate": 12.5
  },
  "topProducts": [
    {
      "productId": "prod_123",
      "name": "Rosas Rojas",
      "uses": 28
    },
    {
      "productId": "prod_456",
      "name": "Tulipanes Amarillos",
      "uses": 17
    }
  ]
}
```

---

### Tipos de Promociones

#### 1. **Porcentaje** (`percentage`)

```json
{
  "type": "percentage",
  "discount": 15
}
```

Descuento del 15% sobre el total.

#### 2. **Monto Fijo** (`fixed`)

```json
{
  "type": "fixed",
  "discount": 10000
}
```

Descuento de $10,000 CLP.

#### 3. **BOGO** (`bogo`)

```json
{
  "type": "bogo",
  "discount": 50
}
```

Compra 2, paga 1 (o descuento en el segundo ítem).

#### 4. **Envío Gratis** (`free_shipping`)

```json
{
  "type": "free_shipping",
  "discount": 0
}
```

Elimina costo de envío.

---

### Esquema de Datos: Promotion

```typescript
interface Promotion {
  _id: string;
  code: string; // Código único (ej: "VERANO2025")
  name: string; // Nombre descriptivo
  description?: string; // Descripción detallada
  type: 'percentage' | 'fixed' | 'bogo' | 'free_shipping';
  discount: number; // Valor del descuento
  startDate: Date; // Fecha de inicio
  endDate: Date; // Fecha de fin
  isActive: boolean; // Estado activo/inactivo
  usageCount: number; // Contador de usos
  maxUses?: number; // Máximo de usos permitidos
  minPurchase?: number; // Compra mínima requerida (CLP)
  maxDiscount?: number; // Descuento máximo (para percentages)
  applicableTo?: {
    products?: string[]; // IDs de productos específicos
    categories?: string[]; // Categorías aplicables
  };
  excludedProducts?: string[]; // Productos excluidos
  createdAt: Date;
  updatedAt: Date;
}
```

---

### Ejemplos de Uso Común

#### Promoción de Bienvenida

```bash
curl -X POST http://localhost:3000/api/promotions \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "BIENVENIDA10",
    "name": "Bienvenida 10% OFF",
    "type": "percentage",
    "discount": 10,
    "startDate": "2025-01-01",
    "endDate": "2025-12-31",
    "isActive": true,
    "maxUses": 10000
  }'
```

#### Validar en Checkout

```bash
curl -X POST http://localhost:3000/api/promotions/validate \
  -H "Content-Type: application/json" \
  -d '{
    "code": "BIENVENIDA10",
    "cartTotal": 50000,
    "items": [...]
  }'
```

---

**Última actualización**: 28 de octubre de 2025  
**Versión API**: 3.1.1
