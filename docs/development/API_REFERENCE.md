# Referencia de APIs

## Índice

1. [Visión General](#visión-general)
2. [API de Autenticación](#api-de-autenticación)
3. [API de Productos](#api-de-productos)
4. [API de Usuarios](#api-de-usuarios)
5. [API de Pedidos](#api-de-pedidos)
6. [API de Carrito](#api-de-carrito)
7. [API de Lista de Deseos](#api-de-lista-de-deseos)
8. [API de Reseñas](#api-de-reseñas)
9. [API de Contacto](#api-de-contacto)
10. [Codigos de Estado HTTP](#códigos-de-estado-http)
11. [Manejo de Errores](#manejo-de-errores)

## Visión General

Todas las APIs del sistema Flores Victoria siguen principios RESTful y utilizan JSON para la
serialización de datos. Las respuestas incluyen siempre un campo `success` que indica si la
operación fue exitosa, y un campo `data` o `error` con la información correspondiente.

### Formato de Respuesta General

```json
{
  "success": true,
  "data": {}
}

// O en caso de error:
{
  "success": false,
  "error": {
    "message": "Descripción del error",
    "code": "ERROR_CODE"
  }
}
```

### Autenticación

La mayoría de las APIs requieren autenticación mediante tokens JWT. El token debe enviarse en el
header `Authorization` con el formato `Bearer {token}`.

### Paginación

Las APIs que devuelven listas de elementos implementan paginación con los siguientes parámetros:

- `page`: Número de página (por defecto 1)
- `limit`: Elementos por página (por defecto 10, máximo 100)

## API de Autenticación

### Registro de Usuario

**POST** `/api/auth/register`

Registra un nuevo usuario en el sistema.

#### Request Body

```json
{
  "email": "usuario@ejemplo.com",
  "password": "contraseña_segura",
  "firstName": "Nombre",
  "lastName": "Apellido"
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "123456",
      "email": "usuario@ejemplo.com",
      "firstName": "Nombre",
      "lastName": "Apellido"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4..."
  }
}
```

### Inicio de Sesión

**POST** `/api/auth/login`

Inicia sesión con credenciales de usuario.

#### Request Body

```json
{
  "email": "usuario@ejemplo.com",
  "password": "contraseña_segura"
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "123456",
      "email": "usuario@ejemplo.com",
      "firstName": "Nombre",
      "lastName": "Apellido"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4..."
  }
}
```

### Renovar Token

**POST** `/api/auth/refresh`

Renueva el token de acceso utilizando el refresh token.

#### Request Body

```json
{
  "refreshToken": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4..."
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "bmV3IHJlZnJlc2ggdG9rZW4..."
  }
}
```

### Obtener Perfil

**GET** `/api/auth/profile`

Obtiene el perfil del usuario autenticado.

#### Headers

```
Authorization: Bearer {token}
```

#### Response

```json
{
  "success": true,
  "data": {
    "id": "123456",
    "email": "usuario@ejemplo.com",
    "firstName": "Nombre",
    "lastName": "Apellido",
    "createdAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### Actualizar Perfil

**PUT** `/api/auth/profile`

Actualiza el perfil del usuario autenticado.

#### Headers

```
Authorization: Bearer {token}
```

#### Request Body

```json
{
  "firstName": "Nuevo Nombre",
  "lastName": "Nuevo Apellido"
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "id": "123456",
    "email": "usuario@ejemplo.com",
    "firstName": "Nuevo Nombre",
    "lastName": "Nuevo Apellido",
    "updatedAt": "2023-01-02T00:00:00.000Z"
  }
}
```

## API de Productos

### Listar Productos

**GET** `/api/products`

Obtiene una lista de productos con paginación y filtros.

#### Query Parameters

- `page`: Número de página (por defecto 1)
- `limit`: Elementos por página (por defecto 10)
- `category`: Filtrar por categoría
- `search`: Buscar por nombre o descripción
- `minPrice`: Precio mínimo
- `maxPrice`: Precio máximo

#### Response

```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "507f1f77bcf86cd799439011",
        "name": "Ramo de Rosas",
        "description": "Hermoso ramo de rosas rojas",
        "price": 25.99,
        "category": "flores",
        "images": ["http://example.com/image1.jpg"],
        "stock": 10,
        "createdAt": "2023-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "pages": 10
    }
  }
}
```

### Obtener Producto por ID

**GET** `/api/products/{id}`

Obtiene un producto específico por su ID.

#### Response

```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Ramo de Rosas",
    "description": "Hermoso ramo de rosas rojas",
    "price": 25.99,
    "category": "flores",
    "images": ["http://example.com/image1.jpg"],
    "stock": 10,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### Crear Producto

**POST** `/api/products`

Crea un nuevo producto (requiere rol de administrador).

#### Headers

```
Authorization: Bearer {token}
```

#### Request Body

```json
{
  "name": "Nuevo Producto",
  "description": "Descripción del producto",
  "price": 29.99,
  "category": "flores",
  "stock": 15
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439012",
    "name": "Nuevo Producto",
    "description": "Descripción del producto",
    "price": 29.99,
    "category": "flores",
    "stock": 15,
    "createdAt": "2023-01-02T00:00:00.000Z"
  }
}
```

### Actualizar Producto

**PUT** `/api/products/{id}`

Actualiza un producto existente (requiere rol de administrador).

#### Headers

```
Authorization: Bearer {token}
```

#### Request Body

```json
{
  "name": "Producto Actualizado",
  "description": "Nueva descripción",
  "price": 35.99,
  "stock": 20
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439012",
    "name": "Producto Actualizado",
    "description": "Nueva descripción",
    "price": 35.99,
    "category": "flores",
    "stock": 20,
    "updatedAt": "2023-01-02T01:00:00.000Z"
  }
}
```

### Eliminar Producto

**DELETE** `/api/products/{id}`

Elimina un producto (requiere rol de administrador).

#### Headers

```
Authorization: Bearer {token}
```

#### Response

```json
{
  "success": true,
  "data": {
    "message": "Producto eliminado correctamente"
  }
}
```

## API de Usuarios

### Obtener Perfil de Usuario

**GET** `/api/users/{id}`

Obtiene el perfil público de un usuario.

#### Response

```json
{
  "success": true,
  "data": {
    "id": "123456",
    "firstName": "Nombre",
    "lastName": "Apellido",
    "memberSince": "2023-01-01T00:00:00.000Z"
  }
}
```

### Actualizar Perfil de Usuario

**PUT** `/api/users/{id}`

Actualiza el perfil del usuario (requiere autenticación como el usuario o administrador).

#### Headers

```
Authorization: Bearer {token}
```

#### Request Body

```json
{
  "firstName": "Nombre Actualizado",
  "lastName": "Apellido Actualizado",
  "phone": "+1234567890"
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "id": "123456",
    "firstName": "Nombre Actualizado",
    "lastName": "Apellido Actualizado",
    "phone": "+1234567890",
    "updatedAt": "2023-01-02T00:00:00.000Z"
  }
}
```

### Obtener Historial de Pedidos

**GET** `/api/users/{id}/orders`

Obtiene el historial de pedidos del usuario.

#### Headers

```
Authorization: Bearer {token}
```

#### Response

```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": "789012",
        "totalAmount": 50.99,
        "status": "delivered",
        "createdAt": "2023-01-01T10:00:00.000Z"
      }
    ]
  }
}
```

## API de Pedidos

### Crear Pedido

**POST** `/api/orders`

Crea un nuevo pedido.

#### Headers

```
Authorization: Bearer {token}
```

#### Request Body

```json
{
  "items": [
    {
      "productId": "507f1f77bcf86cd799439011",
      "quantity": 2
    }
  ],
  "shippingAddressId": "345678"
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "id": "789012",
    "userId": "123456",
    "items": [
      {
        "productId": "507f1f77bcf86cd799439011",
        "quantity": 2,
        "price": 25.99
      }
    ],
    "totalAmount": 51.98,
    "status": "pending",
    "shippingAddressId": "345678",
    "createdAt": "2023-01-02T00:00:00.000Z"
  }
}
```

### Obtener Pedido por ID

**GET** `/api/orders/{id}`

Obtiene un pedido específico.

#### Headers

```
Authorization: Bearer {token}
```

#### Response

```json
{
  "success": true,
  "data": {
    "id": "789012",
    "userId": "123456",
    "items": [
      {
        "productId": "507f1f77bcf86cd799439011",
        "productName": "Ramo de Rosas",
        "quantity": 2,
        "price": 25.99
      }
    ],
    "totalAmount": 51.98,
    "status": "pending",
    "shippingAddress": {
      "id": "345678",
      "street": "Calle Principal 123",
      "city": "Ciudad",
      "state": "Estado",
      "zipCode": "12345",
      "country": "País"
    },
    "createdAt": "2023-01-02T00:00:00.000Z"
  }
}
```

## API de Carrito

### Obtener Carrito

**GET** `/api/cart/{userId}`

Obtiene el carrito de un usuario.

#### Headers

```
Authorization: Bearer {token}
```

#### Response

```json
{
  "success": true,
  "data": {
    "userId": "123456",
    "items": [
      {
        "productId": "507f1f77bcf86cd799439011",
        "productName": "Ramo de Rosas",
        "quantity": 2,
        "price": 25.99,
        "subtotal": 51.98
      }
    ],
    "total": 51.98,
    "itemCount": 2
  }
}
```

### Agregar Item al Carrito

**POST** `/api/cart/{userId}/items`

Agrega un producto al carrito.

#### Headers

```
Authorization: Bearer {token}
```

#### Request Body

```json
{
  "productId": "507f1f77bcf86cd799439011",
  "quantity": 1
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "message": "Producto agregado al carrito"
  }
}
```

### Actualizar Cantidad de Item

**PUT** `/api/cart/{userId}/items/{productId}`

Actualiza la cantidad de un producto en el carrito.

#### Headers

```
Authorization: Bearer {token}
```

#### Request Body

```json
{
  "quantity": 3
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "message": "Cantidad actualizada"
  }
}
```

### Eliminar Item del Carrito

**DELETE** `/api/cart/{userId}/items/{productId}`

Elimina un producto del carrito.

#### Headers

```
Authorization: Bearer {token}
```

#### Response

```json
{
  "success": true,
  "data": {
    "message": "Producto eliminado del carrito"
  }
}
```

## API de Lista de Deseos

### Obtener Lista de Deseos

**GET** `/api/wishlist/{userId}`

Obtiene la lista de deseos de un usuario.

#### Headers

```
Authorization: Bearer {token}
```

#### Response

```json
{
  "success": true,
  "data": {
    "userId": "123456",
    "items": [
      {
        "productId": "507f1f77bcf86cd799439011",
        "productName": "Ramo de Rosas",
        "price": 25.99,
        "addedAt": "2023-01-01T10:00:00.000Z"
      }
    ]
  }
}
```

### Agregar Item a la Lista de Deseos

**POST** `/api/wishlist/{userId}/items`

Agrega un producto a la lista de deseos.

#### Headers

```
Authorization: Bearer {token}
```

#### Request Body

```json
{
  "productId": "507f1f77bcf86cd799439012"
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "message": "Producto agregado a la lista de deseos"
  }
}
```

### Eliminar Item de la Lista de Deseos

**DELETE** `/api/wishlist/{userId}/items/{productId}`

Elimina un producto de la lista de deseos.

#### Headers

```
Authorization: Bearer {token}
```

#### Response

```json
{
  "success": true,
  "data": {
    "message": "Producto eliminado de la lista de deseos"
  }
}
```

## API de Reseñas

### Crear Reseña

**POST** `/api/reviews`

Crea una nueva reseña para un producto.

#### Headers

```
Authorization: Bearer {token}
```

#### Request Body

```json
{
  "productId": "507f1f77bcf86cd799439011",
  "rating": 5,
  "comment": "Excelente producto, muy recomendado"
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "id": "987654",
    "userId": "123456",
    "productId": "507f1f77bcf86cd799439011",
    "rating": 5,
    "comment": "Excelente producto, muy recomendado",
    "createdAt": "2023-01-02T00:00:00.000Z"
  }
}
```

### Obtener Reseñas de un Producto

**GET** `/api/reviews/product/{productId}`

Obtiene las reseñas de un producto específico.

#### Response

```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "id": "987654",
        "user": {
          "firstName": "Nombre",
          "lastName": "Apellido"
        },
        "rating": 5,
        "comment": "Excelente producto, muy recomendado",
        "createdAt": "2023-01-02T00:00:00.000Z"
      }
    ]
  }
}
```

## API de Contacto

### Enviar Mensaje de Contacto

**POST** `/api/contact`

Envía un mensaje a través del formulario de contacto.

#### Request Body

```json
{
  "name": "Nombre del Cliente",
  "email": "cliente@ejemplo.com",
  "subject": "Consulta sobre productos",
  "message": "Me gustaría saber más sobre sus productos..."
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "message": "Mensaje enviado correctamente"
  }
}
```

## Códigos de Estado HTTP

| Código | Descripción                                        |
| ------ | -------------------------------------------------- |
| 200    | OK - Solicitud exitosa                             |
| 201    | Created - Recurso creado exitosamente              |
| 400    | Bad Request - Solicitud mal formada                |
| 401    | Unauthorized - No autenticado                      |
| 403    | Forbidden - No autorizado                          |
| 404    | Not Found - Recurso no encontrado                  |
| 409    | Conflict - Conflicto en el estado del recurso      |
| 500    | Internal Server Error - Error interno del servidor |

## Manejo de Errores

Todos los errores siguen un formato estándar:

```json
{
  "success": false,
  "error": {
    "message": "Descripción del error",
    "code": "ERROR_CODE",
    "details": {}
  }
}
```

### Códigos de Error Comunes

| Código                  | Descripción                                 |
| ----------------------- | ------------------------------------------- |
| VALIDATION_ERROR        | Error de validación en los datos de entrada |
| AUTHENTICATION_REQUIRED | Se requiere autenticación                   |
| ACCESS_DENIED           | Acceso denegado                             |
| RESOURCE_NOT_FOUND      | Recurso no encontrado                       |
| DATABASE_ERROR          | Error en la base de datos                   |
| NETWORK_ERROR           | Error de red                                |
| INTERNAL_ERROR          | Error interno del servidor                  |
