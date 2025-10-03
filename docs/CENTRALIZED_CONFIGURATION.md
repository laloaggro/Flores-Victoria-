# Configuración Centralizada

## Visión General

Este documento describe el sistema de configuración centralizada implementado para los microservicios de Flores Victoria. La configuración centralizada permite gestionar de manera uniforme los parámetros de todos los servicios, facilitando el mantenimiento y la administración del sistema.

## Estructura de Configuración

La configuración se encuentra en `microservices/shared/config/index.js` y está organizada en las siguientes secciones:

### Bases de Datos
Configuración para todas las bases de datos utilizadas en el sistema:
- PostgreSQL
- MongoDB
- Redis

### RabbitMQ
Configuración para el broker de mensajes.

### Seguridad
Parámetros de seguridad como secretos JWT y configuración de hashing.

### Rate Limiting
Configuración para limitar las solicitudes a los servicios.

### Logging
Configuración del sistema de registro.

### Servicios
URLs de todos los microservicios para facilitar la comunicación entre ellos.

## Variables de Entorno

Todas las configuraciones pueden ser sobreescritas mediante variables de entorno. Las variables de entorno siguen el patrón:

```
NOMBRE_SERVICIO_NOMBRE_PARAMETRO
```

Por ejemplo:
- `POSTGRES_HOST`
- `JWT_SECRET`
- `PRODUCT_SERVICE_URL`

## Uso en los Servicios

Para utilizar la configuración en un servicio, simplemente importar el módulo:

```javascript
const config = require('../../shared/config');

// Acceder a la configuración
const dbConfig = config.databases.postgres;
const jwtSecret = config.security.jwtSecret;
```

## Beneficios

1. **Consistencia**: Todos los servicios utilizan la misma configuración base
2. **Mantenibilidad**: Cambios en un solo lugar afectan a todos los servicios
3. **Flexibilidad**: Posibilidad de sobreescribir configuraciones mediante variables de entorno
4. **Seguridad**: Gestión centralizada de secretos

## Buenas Prácticas

1. Utilizar variables de entorno para valores sensibles o específicos de entorno
2. Mantener valores por defecto razonables para facilitar el desarrollo local
3. Documentar todas las variables de entorno utilizadas
4. No incluir secretos directamente en el código fuente

## Futuras Mejoras

1. Integración con un servicio de configuración como Consul o Spring Cloud Config
2. Recarga automática de configuraciones sin reiniciar servicios
3. Validación de configuraciones al inicio de los servicios
4. Encriptación de valores sensibles en la configuración