# Documentación de la API del Servicio de Lista de Deseos

## Introducción

Esta es la documentación de la API del Servicio de Lista de Deseos de Flores Victoria. Esta API permite gestionar la lista de deseos de los usuarios, incluyendo agregar, eliminar y vaciar items de la lista con autenticación JWT. El servicio utiliza Redis para almacenar los datos de la lista de deseos.

## Acceso a la Documentación

La documentación interactiva de la API está disponible en la ruta `/api-docs` del servicio cuando está en ejecución. Por ejemplo:

- Entorno de desarrollo: http://localhost:3006/api-docs

## Endpoints

### Lista de Deseos

#### Obtener la lista de deseos del usuario

```
GET /api/wishlist
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
    "wishlist": {
      "userId": 1,
      "items": [
        {
          "productId": 1,
          "name": "Ramo de Rosas",
          "price": 25.99
        }
      ]
    }
  }
}
```

#### Agregar un item a la lista de deseos

```
POST /api/wishlist/items
```

Encabezados:
```
Authorization: Bearer <token>
```

Cuerpo de la solicitud:
```json
{
  "productId": 1,
  "name": "Ramo de Rosas",
  "price": 25.99
}
```

Respuesta:
```json
{
  "status": "success",
  "message": "Producto agregado a la lista de deseos",
  "data": {
    "wishlist": {
      "userId": 1,
      "items": [
        {
          "productId": 1,
          "name": "Ramo de Rosas",
          "price": 25.99
        }
      ]
    }
  }
}
```

#### Eliminar un item de la lista de deseos

```
DELETE /api/wishlist/items/{productId}
```

Encabezados:
```
Authorization: Bearer <token>
```

Respuesta:
```json
{
  "status": "success",
  "message": "Producto eliminado de la lista de deseos",
  "data": {
    "wishlist": {
      "userId": 1,
      "items": []
    }
  }
}
```

#### Vaciar la lista de deseos

```
DELETE /api/wishlist
```

Encabezados:
```
Authorization: Bearer <token>
```

Respuesta:
```json
{
  "status": "success",
  "message": "Lista de deseos vaciada"
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

### Producto no encontrado en la lista de deseos
**Mensaje**: "Producto no encontrado en la lista de deseos"
**Causa**: Se intentó acceder a un producto que no existe en la lista de deseos del usuario
**Solución**:
1. Verificar que el ID del producto sea correcto
2. Confirmar que el producto exista en la lista de deseos

### Datos inválidos
**Mensaje**: "Datos de entrada inválidos"
**Causa**: Los datos proporcionados no cumplen con los requisitos esperados
**Solución**:
1. Verificar que se proporcionen todos los campos requeridos
2. Asegurarse de que los tipos de datos sean correctos
3. Validar que los valores estén dentro de los rangos permitidos