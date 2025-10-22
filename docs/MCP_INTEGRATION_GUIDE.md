# Guía de integración MCP server / MCP Server Integration Guide

## 1. Uso en microservicios / Usage in microservices

Importa el helper MCP en cualquier microservicio:

```js
const { registerEvent, registerAudit } = require('../shared/mcp-helper');

// Registrar evento
registerEvent('user-signup', { userId: 'abc123', timestamp: Date.now() });

// Registrar auditoría
registerAudit('create-user', 'api-gateway', 'Nuevo usuario creado');
```

## 2. Reporte automático en tests / Automatic reporting in tests

Al finalizar los tests, reporta el resultado:

```js
const { registerEvent } = require('../shared/mcp-helper');

// Ejemplo en Jest
afterAll(async () => {
  await registerEvent('test-result', { suite: 'unit', passed: 14, failed: 0 });
});
```

## 3. Auditoría en scripts de despliegue / Audit in deploy scripts

Agrega en tu script:

```js
const { registerAudit } = require('../shared/mcp-helper');
registerAudit('deploy', 'deploy-script', 'Despliegue de api-gateway');
```

## 4. Configuración de MCP_URL

Puedes definir la URL del MCP server con la variable de entorno `MCP_URL`.

## 5. Documenta la integración

Incluye ejemplos y recomendaciones en la documentación de cada microservicio.

---

**Recomendación:** Integra MCP en todos los flujos automáticos y registra auditoría de acciones
clave para trazabilidad y control.
