# Sistema de Logging Mejorado

Sistema de logging estructurado con Winston, log rotation y contexto de request.

## Características

- **Log rotation** automático con winston-daily-rotate-file
- **Múltiples transports**: Console, File
- **Formato estructurado** JSON para agregación
- **Request ID tracking** para rastreo de requests
- **Niveles por ambiente**: debug en dev, error en prod
- **Logs separados**: error.log y combined.log

## Uso

### Básico

```javascript
const { createLogger } = require('../../shared/logging/logger');

const logger = createLogger('mi-servicio');

logger.info('Servidor iniciado', { port: 3000 });
logger.error('Error de conexión', { error: err.message });
```

### Con Request ID

```javascript
const requestLogger = logger.withRequestId(req.id);
requestLogger.info('Usuario autenticado', { userId: user.id });
```

## Configuración

Variables de entorno:

```bash
LOG_LEVEL=info           # debug, info, warn, error
LOG_DIR=logs             # Directorio de logs
ENABLE_LOG_ROTATION=true # Activar rotation
NODE_ENV=production      # Ambiente
```

## Rotación de Logs

- **Error logs**: 14 días, 20MB por archivo
- **Combined logs**: 7 días, 20MB por archivo
- **Formato**: `error-2025-11-21.log`

---

**Versión**: 3.0.0
