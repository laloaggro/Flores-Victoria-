# Documentación de la API del Servicio de Reseñas

## Introducción

Esta es la documentación de la API del Servicio de Reseñas de Flores Victoria. Esta API permite gestionar las reseñas de productos del sistema, incluyendo creación, consulta, actualización y eliminación de reseñas. El servicio utiliza MongoDB para almacenar los datos de las reseñas.

## Acceso a la Documentación

La documentación interactiva de la API está disponible en la ruta `/api-docs` del servicio cuando está en ejecución. Por ejemplo:

- Entorno de desarrollo: http://localhost:3007/api-docs

## Endpoints

### Reseñas

#### Obtener todas las reseñas

```
GET /api/reviews
```

Parámetros de consulta opcionales:
- `page`: Número de página (por defecto: 1)
- `limit`: Cantidad de reseñas por página (por defecto: 10)
- `productId`: Filtrar reseñas por ID de producto

Respuesta:
```json
{
  "status": "success",
  "data": {
    "reviews": [
      {
        "id": "507f1f77bcf86cd799439011",
        "productId": "1",
        "userId": "1",
        "rating": 5,
        "comment": "Excelente arreglo floral, muy bonito y fresco",
        "createdAt": "2023-01-01T00:00:00.000Z",
        "updatedAt": "2023-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

#### Obtener una reseña por ID

```
GET /api/reviews/{id}
```

Respuesta:
```json
{
  "status": "success",
  "data": {
    "review": {
      "id": "507f1f77bcf86cd799439011",
      "productId": "1",
      "userId": "1",
      "rating": 5,
      "comment": "Excelente arreglo floral, muy bonito y fresco",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  }
}
```

#### Crear una nueva reseña

```
POST /api/reviews
```

Cuerpo de la solicitud:
```json
{
  "productId": "1",
  "userId": "1",
  "rating": 5,
  "comment": "Excelente arreglo floral, muy bonito y fresco"
}
```

Respuesta:
```json
{
  "status": "success",
  "message": "Reseña creada exitosamente",
  "data": {
    "review": {
      "id": "507f1f77bcf86cd799439012",
      "productId": "1",
      "userId": "1",
      "rating": 5,
      "comment": "Excelente arreglo floral, muy bonito y fresco",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  }
}
```

#### Actualizar una reseña

```
PUT /api/reviews/{id}
```

Cuerpo de la solicitud:
```json
{
  "rating": 4,
  "comment": "Buen arreglo floral, aunque se pudo hacer mejor"
}
```

Respuesta:
```json
{
  "status": "success",
  "message": "Reseña actualizada exitosamente",
  "data": {
    "review": {
      "id": "507f1f77bcf86cd799439011",
      "productId": "1",
      "userId": "1",
      "rating": 4,
      "comment": "Buen arreglo floral, aunque se pudo hacer mejor",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-02T00:00:00.000Z"
    }
  }
}
```

#### Eliminar una reseña

```
DELETE /api/reviews/{id}
```

Respuesta:
```json
{
  "status": "success",
  "message": "Reseña eliminada correctamente"
}
```

## Códigos de estado HTTP

- `200 OK`: La solicitud se ha completado exitosamente
- `201 Created`: El recurso se ha creado exitosamente
- `400 Bad Request`: La solicitud es inválida o faltan datos requeridos
- `404 Not Found`: El recurso solicitado no se ha encontrado
- `500 Internal Server Error`: Ha ocurrido un error en el servidor

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

### Error de conexión a la base de datos
**Mensaje**: "Error interno del servidor"
**Causa**: La base de datos MongoDB no está disponible o las credenciales son incorrectas
**Solución**:
1. Verificar que el servicio de MongoDB esté en ejecución
2. Comprobar las variables de entorno `MONGODB_URI`
3. Verificar la conectividad de red entre el servicio y la base de datos

### Reseña no encontrada
**Mensaje**: "Reseña no encontrada"
**Causa**: Se intentó acceder a una reseña que no existe
**Solución**:
1. Verificar que el ID de la reseña sea correcto
2. Confirmar que la reseña exista en la base de datos

### Datos inválidos
**Mensaje**: "Datos de entrada inválidos"
**Causa**: Los datos proporcionados no cumplen con los requisitos esperados
**Solución**:
1. Verificar que se proporcionen todos los campos requeridos
2. Asegurarse de que los tipos de datos sean correctos
3. Validar que los valores estén dentro de los rangos permitidos (por ejemplo, rating entre 1 y 5)