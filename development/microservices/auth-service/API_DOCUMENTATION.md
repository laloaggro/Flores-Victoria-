# Documentación de la API del Servicio de Autenticación

## Introducción

Esta es la documentación de la API del Servicio de Autenticación de Flores Victoria. Esta API permite gestionar la autenticación de usuarios en el sistema, incluyendo registro, inicio de sesión, cierre de sesión y obtención de perfil de usuario.

## Acceso a la Documentación

La documentación interactiva de la API está disponible en la ruta `/api-docs` del servicio cuando está en ejecución. Por ejemplo:

- Entorno de desarrollo: http://localhost:3001/api-docs

## Endpoints

### Registro de usuarios

#### Registrar un nuevo usuario

```
POST /api/auth/register
```

Cuerpo de la solicitud:
```json
{
  "username": "nombre_de_usuario",
  "email": "usuario@example.com",
  "password": "contraseña_segura"
}
```

Respuesta:
```json
{
  "status": "success",
  "message": "Usuario registrado exitosamente",
  "data": {
    "user": {
      "username": "nombre_de_usuario",
      "email": "usuario@example.com"
    }
  }
}
```

### Inicio de sesión

#### Iniciar sesión de un usuario

```
POST /api/auth/login
```

Cuerpo de la solicitud:
```json
{
  "email": "usuario@example.com",
  "password": "contraseña_segura"
}
```

Respuesta:
```json
{
  "status": "success",
  "message": "Inicio de sesión exitoso",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "nombre_de_usuario",
      "email": "usuario@example.com"
    }
  }
}
```

### Cierre de sesión

#### Cerrar sesión de un usuario

```
POST /api/auth/logout
```

Respuesta:
```json
{
  "status": "success",
  "message": "Sesión cerrada exitosamente"
}
```

### Perfil de usuario

#### Obtener el perfil del usuario autenticado

```
GET /api/auth/profile
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
      "username": "nombre_de_usuario",
      "email": "usuario@example.com"
    }
  }
}
```

## Códigos de estado HTTP

- `200 OK`: La solicitud se ha completado exitosamente
- `201 Created`: El recurso se ha creado exitosamente
- `400 Bad Request`: La solicitud es inválida o faltan datos requeridos
- `401 Unauthorized`: No autorizado, falta token o token inválido
- `404 Not Found`: El recurso solicitado no se ha encontrado
- `409 Conflict`: Conflicto, por ejemplo email ya registrado
- `500 Internal Server Error`: Ha ocurrido un error en el servidor

## Autenticación

La API utiliza tokens JWT para la autenticación. Después de iniciar sesión, se recibe un token que debe incluirse en el encabezado `Authorization` de las solicitudes que lo requieran:

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