# Configuración de Notificaciones (Slack / Discord)

Este documento explica cómo configurar las notificaciones del MCP Server para que envíe alertas a
Slack y/o Discord.

## 1) Obtener Webhooks

### Slack

1. En Slack, ve a "Apps" → "Manage apps" → "Create New App".
2. Selecciona "From scratch".
3. En "Incoming Webhooks", activa la integración y crea un webhook para el canal deseado.
4. Copia la URL del webhook.

### Discord

1. En Discord, ve al servidor y canal donde quieras las alertas.
2. Ve a "Integraciones" → "Webhooks" → "Crear webhook".
3. Copia la URL del webhook.

## 2) Local (.env) o en producción

Puedes configurar las variables en un archivo `.env` local en el directorio `mcp-server` o como
secrets en tu entorno de despliegue (GitHub Secrets para Actions, variables en Docker/K8s para
despliegue).

Ejemplo `.env` (no subir esto a Git):

```
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/AAA/BBB/CCC
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/XXX/YYY
PORT=5050
MCP_URL=http://localhost:5050
```

## 3) GitHub Actions

Si quieres que los workflows envíen notificaciones desde el MCP Server (o que el MCP registre
eventos), añade estas secrets en tu repositorio:

- `SLACK_WEBHOOK_URL`
- `DISCORD_WEBHOOK_URL`

Cómo añadir GitHub Secret:

- Ve a `Settings` → `Secrets` → `Actions` → `New repository secret`.
- Añade las claves con su valor.

## 4) Validación

1. Inicia el MCP Server:

```bash
cd mcp-server
node server.js
```

2. Envía una prueba (si SLACK_WEBHOOK_URL está configurado):

```bash
curl -X POST http://localhost:5050/events -H "Content-Type: application/json" -d '{"type":"test-notification","payload":{"message":"Prueba de notificación MCP"}}'
```

3. Revisa los logs del servidor (`/tmp/mcp-server.log`) y el canal de Slack/Discord.

## 5) Notas

- Las notificaciones son opcionales: si no configuras webhooks, el sistema seguirá funcionando.
- Para producción, guarda las URLs en GitHub Secrets y no en el repositorio.

---

Si quieres, puedo añadir una acción de prueba que verifique y envíe una notificación de prueba al
crear un secret. ¿Lo añadimos?
