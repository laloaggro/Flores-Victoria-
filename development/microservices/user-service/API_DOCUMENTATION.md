# Documentación de la API del Servicio de Usuarios

## Introducción

Esta es la documentación de la API del Servicio de Usuarios de Flores Victoria. Esta API permite gestionar los usuarios del sistema, incluyendo operaciones CRUD (Crear, Leer, Actualizar, Eliminar) con autenticación JWT.

## Acceso a la Documentación

La documentación interactiva de la API está disponible en la ruta `/api-docs` del servicio cuando está en ejecución. Por ejemplo:

- Entorno de desarrollo: http://localhost:3003/api-docs

## Endpoints

### Usuarios

#### Obtener todos los usuarios

```
GET /api/users
```

Encabezados:
```
Authorization: Bearer <token>
```

Parámetros de consulta opcionales:
- `page`: Número de página (por defecto: 1)
- `limit`: Cantidad de usuarios por página (por defecto: 10)

Respuesta:
```json
{
  "status": "success",
  "data": {
    "users": [
      {
        "id": 1,
        "username": "juanperez",
        "email": "juan@example.com",
        "firstName": "Juan",
        "lastName": "Perez",
        "createdAt": "2023-01-01T00:00:00.000Z",
        "updatedAt": "2023-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

#### Obtener un usuario por ID

```
GET /api/users/{id}
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
    "user": {
      "id": 1,
      "username": "juanperez",
      "email": "juan@example.com",
      "firstName": "Juan",
      "lastName": "Perez",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  }
}
```

#### Actualizar un usuario

```
PUT /api/users/{id}
```

Encabezados:
```
Authorization: Bearer <token>
```

Cuerpo de la solicitud:
```json
{
  "username": "juanperez_actualizado",
  "email": "juan_actualizado@example.com",
  "firstName": "Juan Actualizado",
  "lastName": "Perez Actualizado"
}
```

Respuesta:
```json
{
  "status": "success",
  "message": "Usuario actualizado exitosamente",
  "data": {
    "user": {
      "id": 1,
      "username": "juanperez_actualizado",
      "email": "juan_actualizado@example.com",
      "firstName": "Juan Actualizado",
      "lastName": "Perez Actualizado",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-02T00:00:00.000Z"
    }
  }
}
```

#### Eliminar un usuario

```
DELETE /api/users/{id}
```

Encabezados:
```
Authorization: Bearer <token>
```

Respuesta:
```json
{
  "status": "success",
  "message": "Usuario eliminado correctamente"
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

### Error de conexión a la base de datos
**Mensaje**: "Error interno del servidor"
**Causa**: La base de datos PostgreSQL no está disponible o las credenciales son incorrectas
**Solución**:
1. Verificar que el servicio de PostgreSQL esté en ejecución
2. Comprobar las variables de entorno `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER` y `DB_PASSWORD`
3. Verificar la conectividad de red entre el servicio y la base de datos

### Token inválido o expirado
**Mensaje**: "Token no proporcionado" o "Token inválido"
**Causa**: El token JWT no se proporcionó o es inválido/expirado
**Solución**:
1. Asegurarse de incluir el encabezado `Authorization: Bearer <token>`
2. Obtener un nuevo token iniciando sesión nuevamente

### Usuario no encontrado
**Mensaje**: "Usuario no encontrado"
**Causa**: Se intentó acceder a un usuario que no existe
**Solución**:
1. Verificar que el ID del usuario sea correcto
2. Confirmar que el usuario exista en la base de datos