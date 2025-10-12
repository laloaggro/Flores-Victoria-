# Estándar de Manejo de Errores - Flores Victoria

## Introducción

Este documento define el estándar de manejo de errores para todos los microservicios en el proyecto Flores Victoria. El objetivo es proporcionar una experiencia consistente para los consumidores de la API y facilitar la depuración y el mantenimiento del sistema.

## Formato de Respuesta de Error

Todas las respuestas de error seguirán un formato consistente:

```json
{
  "status": "fail|error",
  "message": "Mensaje descriptivo del error"
}
```

### Campos

- **status**: Indica el tipo de error:
  - `fail`: Errores del cliente (4xx)
  - `error`: Errores del servidor (5xx)
  
- **message**: Mensaje descriptivo del error en español

### Ejemplos

```json
// Error 400 - Solicitud incorrecta
{
  "status": "fail",
  "message": "Nombre, email y contraseña son requeridos"
}

// Error 401 - No autorizado
{
  "status": "fail",
  "message": "Token no proporcionado"
}

// Error 404 - No encontrado
{
  "status": "fail",
  "message": "Usuario no encontrado"
}

// Error 500 - Error interno del servidor
{
  "status": "error",
  "message": "Error al registrar usuario"
}
```

## Clases de Error

### Errores del Cliente (4xx)

- **400 Bad Request**: Solicitud mal formada o datos inválidos
- **401 Unauthorized**: Falta de autenticación o credenciales inválidas
- **403 Forbidden**: Acceso denegado
- **404 Not Found**: Recurso no encontrado
- **429 Too Many Requests**: Límite de tasa excedido

### Errores del Servidor (5xx)

- **500 Internal Server Error**: Error interno del servidor
- **502 Bad Gateway**: Error en servicio upstream
- **503 Service Unavailable**: Servicio temporalmente no disponible

## Implementación

### Middleware de Manejo de Errores

Se ha creado un middleware de manejo de errores estándar en [microservices/shared/middlewares/errorHandler.js](file:///home/impala/Documentos/Proyectos/Flores-Victoria-/microservices/shared/middlewares/errorHandler.js):

```javascript
const { AppError, globalErrorHandler } = require('../shared/middlewares/errorHandler');
```

### Clase de Error Personalizada

Se ha creado una clase `AppError` para crear errores operacionales:

```javascript
// Crear un nuevo error
const error = new AppError('Mensaje de error', statusCode);

// Ejemplo
next(new AppError('Token inválido', 401));
```

## Prácticas Recomendadas

1. **Siempre usar el middleware de manejo de errores**: No enviar respuestas de error directamente desde las rutas
2. **Ser descriptivo pero no excesivamente informativo**: Evitar revelar detalles internos del sistema en errores 500
3. **Mantener consistencia en los mensajes**: Usar el mismo lenguaje y formato en todos los servicios
4. **Loggear errores apropiadamente**: Registrar errores 500 para diagnóstico posterior

## Integración con Microservicios

### User Service

El User Service ya ha sido actualizado para usar el nuevo estándar de manejo de errores:

1. Usa `AppError` para crear errores operacionales
2. Pasa errores al middleware con `next()`
3. Sigue el formato de respuesta estándar

### Otros Servicios

Se recomienda actualizar los demás servicios para seguir este estándar:

1. Importar el middleware de manejo de errores
2. Reemplazar respuestas de error directas con `next(new AppError(...))`
3. Agregar el middleware de manejo de errores global al final de la cadena de middlewares

## Beneficios

1. **Consistencia**: Todos los servicios devuelven errores en el mismo formato
2. **Mantenibilidad**: Cambios en el manejo de errores se aplican globalmente
3. **Experiencia del desarrollador**: Los consumidores de la API saben qué esperar
4. **Depuración**: Formato estandarizado facilita el diagnóstico de problemas

## Próximos Pasos

1. Actualizar todos los microservicios para usar este estándar
2. Crear pruebas unitarias para verificar el manejo de errores
3. Documentar el estándar en la documentación de la API