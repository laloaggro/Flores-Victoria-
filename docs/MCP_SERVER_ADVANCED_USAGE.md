# Uso avanzado del MCP server / Advanced MCP Server Usage

## 1. Monitoreo de salud / Health monitoring

Puedes consultar el estado del MCP server desde cualquier microservicio o pipeline:

```bash
curl http://localhost:5050/health
```

## 2. Registro de eventos personalizados / Custom event logging

Envía cualquier evento relevante (despliegue, error, métrica, etc.):

```bash
curl -X POST http://localhost:5050/events \
  -H 'Content-Type: application/json' \
  -d '{"type": "deploy", "payload": {"service": "api-gateway", "status": "success"}}'
```

## 3. Automatización de reportes desde scripts

Utiliza el script `scripts/report-to-mcp.sh` para enviar resultados de tests, métricas o cualquier dato:

```bash
./scripts/report-to-mcp.sh "test-result" '{"suite": "unit", "passed": 14, "failed": 0}'
```

## 4. Integración en microservicios

Ejemplo en Node.js:
```js
const axios = require('axios');
axios.post('http://localhost:5050/events', {
  type: 'user-signup',
  payload: { userId: 'abc123', timestamp: Date.now() }
});
```

## 5. Auditoría de despliegues y cambios

Agrega en tus scripts de despliegue:
```bash
curl -X POST http://localhost:5050/audit \
  -H 'Content-Type: application/json' \
  -d '{"action": "deploy", "agent": "deploy-script", "details": "Despliegue de api-gateway"}'
```

## 6. Limpieza de contexto entre ejecuciones

```bash
curl -X POST http://localhost:5050/clear
```

## 7. Extensión de endpoints

Puedes agregar más endpoints en `mcp-server/server.js` para necesidades específicas (notificaciones, triggers, etc).

---

**Recomendación:** Documenta todos los flujos automáticos y su integración con MCP para facilitar la colaboración y el onboarding.
