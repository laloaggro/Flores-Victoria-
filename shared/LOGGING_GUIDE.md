# Logging y Request ID - Guía de Uso

## Sistema de Logging Centralizado

El proyecto usa un sistema de logging centralizado ubicado en `shared/logging/logger.js` basado en
Winston.

### Crear un Logger por Servicio

```javascript
const { createLogger } = require('../../../shared/logging/logger');
const logger = createLogger('mi-servicio');

logger.info('Servidor iniciado', { port: 3000 });
logger.error('Error en conexión', new Error('timeout'));
```

### Niveles de Log

- `debug` - Información de depuración detallada
- `info` - Mensajes informativos generales
- `warn` - Advertencias que no impiden el funcionamiento
- `error` - Errores que requieren atención

### Variables de Entorno

| Variable          | Descripción                           | Valores                             | Default                                 |
| ----------------- | ------------------------------------- | ----------------------------------- | --------------------------------------- |
| `NODE_ENV`        | Entorno de ejecución                  | `development`, `production`, `test` | `development`                           |
| `LOG_LEVEL`       | Nivel mínimo de log                   | `debug`, `info`, `warn`, `error`    | Auto según NODE_ENV                     |
| `LOG_FORMAT`      | Formato de salida                     | `json`, `pretty`                    | `pretty` en dev, `json` en prod sin TTY |
| `LOG_FILE`        | Ruta para archivo de log              | Path absoluto                       | (ninguno, solo consola)                 |
| `LOG_MAX_SIZE_MB` | Tamaño máximo por archivo de log (MB) | Número                              | `10`                                    |
| `LOG_MAX_FILES`   | Cantidad máxima de archivos rotados   | Número                              | `5`                                     |
| `LOG_SILENT`      | Silenciar todos los logs              | `true`, `false`                     | `false`                                 |

### Redacción de Campos Sensibles

El logger redacta automáticamente campos sensibles en metadatos, incluyendo:

- `password`, `pass`, `pwd`
- `token`, `accessToken`, `refreshToken`
- `apiKey`, `api_key`
- `authorization`, `auth`
- `secret`, `clientSecret`, `privateKey`
- `stripeSecret`

Ejemplo:

```javascript
logger.info('Login exitoso', {
  user: { email: 'user@example.com', password: 'secret123' },
  token: 'abc123xyz',
});
// Output: password y token aparecerán como "[REDACTED]"
```

## Request ID (Correlation ID)

### Middleware de Request ID

El middleware `requestId` crea o propaga un identificador único por cada petición HTTP:

```javascript
const { requestId } = require('../../../shared/middleware/request-id');

app.use(requestId()); // debe ser lo primero en el middleware stack
```

**Qué hace:**

- Lee el header `x-request-id` entrante, o genera un UUID si no existe
- Expone `req.requestId` para uso en handlers
- Devuelve el header `x-request-id` en la respuesta

### Logger por Request

El helper `withLogger` adjunta un logger contextualizado a cada request:

```javascript
const { withLogger } = require('../../../shared/middleware/request-id');
const logger = createLogger('mi-servicio');

app.use(requestId()); // primero
app.use(withLogger(logger)); // segundo
```

**Uso en rutas:**

```javascript
app.get('/api/productos', (req, res) => {
  req.log.info('Listando productos', { limit: 10 });
  // El requestId se incluye automáticamente en cada log
  res.json({ productos: [] });
});
```

**Ventajas:**

- Trazabilidad end-to-end: todos los logs de una petición comparten el mismo requestId
- No necesitas pasar el requestId manualmente a cada llamada de log
- Propagación automática entre microservicios (header HTTP)

## Access Log

El middleware `accessLog` registra cada petición HTTP con:

- Método HTTP
- Path/URL
- Status code
- Duración en ms
- Content-Length (si está disponible)

```javascript
const { accessLog } = require('../../../shared/middleware/access-log');

app.use(requestId());
app.use(withLogger(logger));
app.use(accessLog(logger)); // después de withLogger
```

**Ejemplo de salida:**

```
2025-10-29 15:32:42 [INFO] [product-service] [req:a1b2c3d4]: HTTP access {"method":"GET","path":"/api/products","status":200,"durationMs":45}
```

## Estructura de Integración Recomendada

### En middleware/common.js de cada servicio

```javascript
const { requestId } = require('../../../../shared/middleware/request-id');

function applyCommonMiddleware(app) {
  app.use(requestId()); // lo primero
  app.use(helmet());
  app.use(cors());
  // ...resto del middleware
}
```

### En app.js de cada servicio

```javascript
const { createLogger } = require('../../../shared/logging/logger');
const { accessLog } = require('../../../shared/middleware/access-log');
const { withLogger } = require('../../../shared/middleware/request-id');

const logger = createLogger('nombre-servicio');
const app = express();

applyCommonMiddleware(app); // incluye requestId
app.use(withLogger(logger));
app.use(accessLog(logger));

// ...rutas y lógica del servicio
```

## Ejemplos de Uso

### Log básico en handler

```javascript
app.get('/health', (req, res) => {
  req.log.info('Health check solicitado');
  res.json({ status: 'OK' });
});
```

### Log con metadatos

```javascript
app.post('/api/orders', async (req, res) => {
  req.log.info('Creando pedido', { userId: req.user.id, items: req.body.items.length });

  try {
    const order = await createOrder(req.body);
    req.log.info('Pedido creado exitosamente', { orderId: order.id });
    res.json(order);
  } catch (error) {
    req.log.error('Error creando pedido', error);
    res.status(500).json({ error: 'Error interno' });
  }
});
```

### Propagación entre servicios

```javascript
// En api-gateway o un servicio que llama a otro
const axios = require('axios');

app.get('/api/productos/:id', async (req, res) => {
  req.log.info('Proxy a product-service', { productId: req.params.id });

  const response = await axios.get(`http://product-service:3002/products/${req.params.id}`, {
    headers: {
      'x-request-id': req.requestId, // propagar correlation ID
    },
  });

  res.json(response.data);
});
```

## Formato JSON en Producción

Para entornos de producción, configura:

```bash
export NODE_ENV=production
export LOG_FORMAT=json
export LOG_FILE=/var/log/mi-servicio.log
export LOG_MAX_SIZE_MB=20
export LOG_MAX_FILES=10
```

El formato JSON facilita la integración con sistemas de agregación de logs (ELK, Loki, CloudWatch,
etc.).

## Troubleshooting

### El requestId no aparece en los logs

Asegúrate de:

1. Aplicar `requestId()` antes que cualquier otro middleware
2. Usar `withLogger(logger)` después de `requestId()`
3. Llamar a `req.log.*` en vez de `logger.*` directamente en los handlers

### Los campos sensibles no se redactan

Verifica que:

1. Estés usando la versión actualizada de `shared/logging/logger.js`
2. Los campos sensibles estén en el objeto de metadatos, no en el mensaje string
3. El nombre del campo coincida con los listados en `SENSITIVE_KEYS`

### Performance

- El overhead del logger es mínimo (<1ms por log)
- La redacción profunda de metadatos se hace solo en JSON serialization
- Los logs `debug` no se procesan en producción (si LOG_LEVEL=info o superior)

---

**Servicios actualizados:** product-service, auth-service, user-service, order-service,
cart-service, contact-service

Para más detalles, revisa:

- `shared/logging/logger.js` - Implementación del logger
- `shared/middleware/request-id.js` - Middleware de correlation ID
- `shared/middleware/access-log.js` - Middleware de access logging
