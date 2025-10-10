# Documentación de la API del Servicio de Contacto

## Introducción

Esta es la documentación de la API del Servicio de Contacto de Flores Victoria. Esta API permite a los usuarios enviar mensajes a través del formulario de contacto del sitio web. Los mensajes se almacenan en una base de datos MongoDB y se envían por correo electrónico al equipo de la empresa.

## Acceso a la Documentación

La documentación interactiva de la API está disponible en la ruta `/api-docs` del servicio cuando está en ejecución. Por ejemplo:

- Entorno de desarrollo: http://localhost:3008/api-docs

## Endpoints

### Contacto

#### Enviar un mensaje a través del formulario de contacto

```
POST /api/contact
```

Cuerpo de la solicitud:
```json
{
  "name": "Juan Pérez",
  "email": "juan.perez@example.com",
  "subject": "Consulta sobre productos",
  "message": "Me gustaría saber más sobre sus productos disponibles."
}
```

Respuesta:
```json
{
  "status": "success",
  "message": "Mensaje enviado exitosamente"
}
```

## Códigos de estado HTTP

- `200 OK`: El mensaje se ha enviado exitosamente
- `400 Bad Request`: La solicitud es inválida o faltan datos requeridos
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

### Error de envío de correo electrónico
**Mensaje**: "Error interno del servidor"
**Causa**: El servicio de correo electrónico no está configurado correctamente o no está disponible
**Solución**:
1. Verificar las variables de entorno `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`
2. Comprobar que el servicio SMTP esté disponible
3. Verificar que las credenciales sean correctas

### Datos inválidos
**Mensaje**: "Nombre, email, asunto y mensaje son requeridos"
**Causa**: Los datos proporcionados no cumplen con los requisitos esperados
**Solución**:
1. Verificar que se proporcionen todos los campos requeridos
2. Asegurarse de que el formato del email sea válido
3. Validar que los valores no estén vacíos