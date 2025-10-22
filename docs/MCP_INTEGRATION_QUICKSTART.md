MCP Integration — Quickstart

## Resumen

Este documento resume cómo acceder al MCP (Monitoring & Control Plane) localmente, cómo enviar
eventos de prueba y cómo usar el endpoint de salud `/check-services`.

## Acceder al dashboard

Si ejecutas los servicios con `docker compose up -d`, el `mcp-server` está configurado para exponer
el dashboard en el puerto 5051 del host (mapa 5051:5050) para pruebas locales.

- Abrir en el navegador: http://localhost:5051/dashboard.html

Nota: Si tienes otro proceso local ocupando 5051 cambia el mapeo en `docker-compose.yml` o usa un
puerto libre.

## Enviar un evento de prueba

Puedes enviar un evento desde cualquier contenedor que tenga `axios` instalado (por ejemplo
`api-gateway`). Desde tu host puedes usar:

```bash
# Desde el host (requiere que el puerto del container esté expuesto a host)
curl -X POST http://localhost:5051/events -H "Content-Type: application/json" \
  -d '{"type":"manual_test","payload":{"service":"manual","message":"prueba manual"}}'

# Desde dentro de un contenedor (sin exponer puerto al host)
docker compose exec -T api-gateway node -e 'const axios=require("axios"); axios.post("http://mcp-server:5050/events",{type:"test_event",payload:{service:"api-gateway",message:"prueba desde container",ts:Date.now()}}).then(r=>console.log(r.status)).catch(e=>console.error(e.message));'
```

## Ver logs del MCP

Para ver los eventos recibidos por el MCP (logs):

```bash
docker compose logs --no-color --tail 200 mcp-server
```

## Comprobar salud de servicios

Dentro de la red de Docker el endpoint `/check-services` se ejecuta desde `mcp-server` y comprueba
los hostnames de los servicios:

```bash
# Desde el host (si expones puerto):
curl http://localhost:5051/check-services?createIssues=false | jq '.'

# Desde dentro de un contenedor en la red (recomendado para pruebas):
docker compose exec -T api-gateway node -e 'const axios=require("axios"); axios.get("http://mcp-server:5050/check-services?createIssues=false").then(r=>console.log(JSON.stringify(r.data))).catch(e=>console.error(e.message));'
```

## Notas y recomendaciones

- El mapeo de puerto se añadió temporalmente para facilitar pruebas locales; reviértelo o coméntalo
  si ejecutas un MCP en el host.
- `MCP_URL` puede configurarse en cada servicio para apuntar a un MCP remoto o local.
- Para producción, usa un mecanismo seguro (secrets) para tokens y no expongas puertos innecesarios.

## Archivo relacionado

- `mcp-server/dashboard.html`
- `mcp-server/server.js`
- `mcp-server/health-check.js`

Hecho.
