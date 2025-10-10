# Documentación de la API del Servicio de Carrito

## Introducción

Esta es la documentación de la API del Servicio de Carrito de Flores Victoria. Esta API permite gestionar el carrito de compras de los usuarios, incluyendo agregar, actualizar, eliminar y vaciar items del carrito con autenticación JWT. El servicio utiliza Redis para almacenar los datos del carrito.

## Acceso a la Documentación

La documentación interactiva de la API está disponible en la ruta `/api-docs` del servicio cuando está en ejecución. Por ejemplo:

- Entorno de desarrollo: http://localhost:3005/api-docs

## Endpoints

### Carrito

#### Obtener el carrito del usuario

```
GET /api/cart
```

Encabezados:
```
Authorization: Bearer <token>
```

Respuesta:
```json
{
  "status": "success",
  "data": {
    "cart": {
      "userId": 1,
      "items": [
        {
          "productId": 1,
          "name": "Ramo de Rosas",
          "quantity": 2,
          "price": 25.99
        }
      ],
      "total": 51.98
    }
  }
}
```

#### Agregar un item al carrito

```
POST /api/cart/items
```

Encabezados:
```
Authorization: Bearer <token>
```

Cuerpo de la solicitud:
```json
{
  "productId": 1,
  "quantity": 2,
  "price": 25.99
}
```

Respuesta:
```json
{
  "status": "success",
  "message": "Producto agregado al carrito",
  "data": {
    "cart": {
      "userId": 1,
      "items": [
        {
          "productId": 1,
          "name": "Ramo de Rosas",
          "quantity": 2,
          "price": 25.99
        }
      ],
      "total": 51.98
    }
  }
}
```

#### Actualizar un item en el carrito

```
PUT /api/cart/items/{productId}
```

Encabezados:
```
Authorization: Bearer <token>
```

Cuerpo de la solicitud:
```json
{
  "quantity": 3
}
```

Respuesta:
```json
{
  "status": "success",
  "message": "Carrito actualizado",
  "data": {
    "cart": {
      "userId": 1,
      "items": [
        {
          "productId": 1,
          "name": "Ramo de Rosas",
          "quantity": 3,
          "price": 25.99
        }
      ],
      "total": 77.97
    }
  }
}
```

#### Eliminar un item del carrito

```
DELETE /api/cart/items/{productId}
```

Encabezados:
```
Authorization: Bearer <token>
```

Respuesta:
```json
{
  "status": "success",
  "message": "Producto eliminado del carrito",
  "data": {
    "cart": {
      "userId": 1,
      "items": [],
      "total": 0
    }
  }
}
```

#### Vaciar el carrito

```
DELETE /api/cart
```

Encabezados:
```
Authorization: Bearer <token>
```

Respuesta:
```json
{
  "status": "success",
  "message": "Carrito vaciado"
}
```

## Códigos de estado HTTP

- `200 OK`: La solicitud se ha completado exitosamente
- `201 Created`: El recurso se ha creado exitosamente
- `400 Bad Request`: La solicitud es inválida o faltan datos requeridos
- `401 Unauthorized`: No autorizado, falta token o token inválido
- `403 Forbidden`: Acceso prohibido al recurso solicitado
- `404 Not Found`: El recurso solicitado no se ha encontrado
- `500 Internal Server Error`: Ha ocurrido un error en el servidor

## Autenticación

La API utiliza tokens JWT para la autenticación. Después de iniciar sesión en el servicio de autenticación, se recibe un token que debe incluirse en el encabezado `Authorization` de las solicitudes:

```
Authorization: Bearer <token>
```

## Rate Limiting

La API implementa rate limiting para prevenir abusos. El límite actual es de 100 solicitudes por ventana de 15 minutos.

## Monitoreo

La API expone métricas en formato Prometheus en la ruta `/metrics`.

## Health Check

El endpoint de health check está disponible en `/health`.

## Errores

Todos los errores siguen el mismo formato:

```json
{
  "status": "error",
  "message": "Mensaje de error descriptivo"
}
```

## Errores Comunes y Soluciones

### Error de conexión a Redis
**Mensaje**: "Error interno del servidor"
**Causa**: El servidor Redis no está disponible o las credenciales son incorrectas
**Solución**:
1. Verificar que el servicio de Redis esté en ejecución
2. Comprobar las variables de entorno `REDIS_HOST` y `REDIS_PORT`
3. Verificar la conectividad de red entre el servicio y Redis

### Token inválido o expirado
**Mensaje**: "Token no proporcionado" o "Token inválido"
**Causa**: El token JWT no se proporcionó o es inválido/expirado
**Solución**:
1. Asegurarse de incluir el encabezado `Authorization: Bearer <token>`
2. Obtener un nuevo token iniciando sesión nuevamente

### Producto no encontrado en el carrito
**Mensaje**: "Producto no encontrado en el carrito"
**Causa**: Se intentó acceder a un producto que no existe en el carrito del usuario
**Solución**:
1. Verificar que el ID del producto sea correcto
2. Confirmar que el producto exista en el carrito

### Datos inválidos
**Mensaje**: "Datos de entrada inválidos"
**Causa**: Los datos proporcionados no cumplen con los requisitos esperados
**Solución**:
1. Verificar que se proporcionen todos los campos requeridos
2. Asegurarse de que los tipos de datos sean correctos
3. Validar que los valores estén dentro de los rangos permitidos