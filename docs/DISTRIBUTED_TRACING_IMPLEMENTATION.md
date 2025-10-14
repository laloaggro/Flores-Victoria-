# Implementación de Trazabilidad Distribuida - Flores Victoria

## Resumen

Este documento describe la implementación de trazabilidad distribuida en el proyecto Flores Victoria utilizando Jaeger. Esta implementación permite rastrear solicitudes a través de múltiples microservicios, facilitando la identificación de cuellos de botella, errores y problemas de rendimiento.

## Tecnología Seleccionada

Se ha seleccionado Jaeger como la solución de trazabilidad distribuida por las siguientes razones:

1. **Compatibilidad**: Jaeger es compatible con el estándar OpenTracing
2. **Facilidad de implementación**: Ofrece una solución "all-in-one" para entornos de desarrollo
3. **Visualización**: Proporciona una interfaz web intuitiva para explorar trazas
4. **Adopción en la industria**: Ampliamente utilizado en entornos de producción

## Componentes Implementados

### 1. Servicio Jaeger

Se ha añadido el servicio Jaeger al archivo `docker-compose.yml`:

- Puerto 16686: Interfaz web de Jaeger
- Puertos UDP: Recepción de trazas desde los microservicios
- Configuración de health check

### 2. Biblioteca Compartida

Se ha creado una biblioteca compartida en `microservices/shared/tracing` que incluye:

- `index.js`: Inicialización del tracer de Jaeger
- `middleware.js`: Middleware de Express para trazas automáticas
- `package.json`: Dependencias necesarias (jaeger-client, opentracing)

### 3. Integración en Microservicios

Se han realizado modificaciones en el servicio de autenticación como ejemplo de implementación:

- Integración del tracer en el punto de entrada del servicio
- Uso del middleware de trazas en la aplicación Express
- Instrumentación manual de operaciones específicas

## Arquitectura de Trazas

### Flujo de Trazas

1. **Recepción de solicitud**: El middleware de trazas extrae el contexto de traza de los headers HTTP
2. **Creación de span raíz**: Se crea un span raíz para la solicitud entrante
3. **Propagación**: El contexto de traza se propaga a través de llamadas entre microservicios
4. **Spans hijos**: Se crean spans hijos para operaciones específicas
5. **Finalización**: Los spans se finalizan automáticamente al completar la solicitud

### Componentes Clave

- **Trace**: Representa una solicitud completa a través de múltiples servicios
- **Span**: Unidad de trabajo con nombre, tiempo de inicio y fin
- **Span raíz**: El span principal de una traza
- **Spans hijos**: Spans creados dentro del contexto de otro span

## Implementación Detallada

### Configuración del Tracer

```javascript
const { initTracer } = require('../../shared/tracing');
const opentracing = require('opentracing');

// Inicializar tracer
const tracer = initTracer('auth-service');
opentracing.initGlobalTracer(tracer);
```

### Middleware de Trazas

```javascript
// Agregar middleware de tracing
app.use(tracingMiddleware(require('opentracing').globalTracer()));
```

### Instrumentación Manual

```javascript
// Crear un span hijo para la operación de registro
const registerSpan = createChildSpan(req.span, 'register_user');
registerSpan.setTag('user.email', email);

// Registrar eventos y finalizar span
registerSpan.log({ 'event': 'user_registered', 'user.id': newUser.id });
registerSpan.finish();
```

## Beneficios

1. **Visibilidad**: Permite visualizar el flujo completo de solicitudes entre microservicios
2. **Diagnóstico**: Facilita la identificación de problemas de rendimiento y errores
3. **Optimización**: Permite identificar cuellos de botella en la arquitectura
4. **Monitoreo**: Proporciona métricas detalladas sobre el comportamiento del sistema

## Uso

### Visualización de Trazas

1. Iniciar todos los servicios: `docker-compose up -d`
2. Acceder a la interfaz web de Jaeger: http://localhost:16686
3. Buscar trazas por servicio, operación o tiempo

### Instrumentación de Otros Servicios

Para instrumentar otros microservicios, seguir estos pasos:

1. Añadir las variables de entorno al servicio en `docker-compose.yml`:
   ```yaml
   environment:
     - JAEGER_AGENT_HOST=jaeger
     - JAEGER_AGENT_PORT=6832
   ```

2. Añadir la dependencia del servicio Jaeger:
   ```yaml
   depends_on:
     - jaeger
   ```

3. Importar y usar el tracer en el punto de entrada del servicio:
   ```javascript
   const { initTracer } = require('../../shared/tracing');
   const opentracing = require('opentracing');
   
   const tracer = initTracer('service-name');
   opentracing.initGlobalTracer(tracer);
   ```

4. Agregar el middleware de trazas a la aplicación Express:
   ```javascript
   app.use(tracingMiddleware(require('opentracing').globalTracer()));
   ```

5. Instrumentar operaciones específicas según sea necesario:
   ```javascript
   const { createChildSpan } = require('../../../shared/tracing/middleware');
   
   const span = createChildSpan(req.span, 'operation_name');
   // ... operación ...
   span.finish();
   ```

## Pruebas

Para probar la implementación de trazabilidad distribuida:

```bash
# Iniciar todos los servicios
docker-compose up -d

# Realizar algunas solicitudes a los servicios
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Usuario de Prueba",
    "email": "test@example.com",
    "password": "password123"
  }'

# Ver las trazas en la interfaz web de Jaeger
# Abrir http://localhost:16686 en un navegador
```

## Consideraciones Futuras

1. **Muestreo**: Implementar estrategias de muestreo para entornos de producción
2. **Integración completa**: Instrumentar todos los microservicios
3. **Métricas**: Combinar trazas con métricas de Prometheus
4. **Alertas**: Configurar alertas basadas en patrones de trazas
5. **Seguridad**: Asegurar el acceso al servicio de Jaeger en entornos de producción