# 🔧 Guía de Troubleshooting - MCP Server

Esta guía te ayudará a diagnosticar y resolver problemas comunes en el MCP Server.

---

## 📋 Tabla de Contenidos

1. [Problemas de Inicio](#problemas-de-inicio)
2. [Problemas de Endpoints](#problemas-de-endpoints)
3. [Problemas de Autenticación](#problemas-de-autenticación)
4. [Problemas de Docker](#problemas-de-docker)
5. [Problemas de Métricas](#problemas-de-métricas)
6. [Problemas de Rendimiento](#problemas-de-rendimiento)

---

## Problemas de Inicio

### El servidor no arranca

**Síntoma:**

```bash
docker compose up -d mcp-server
# No hay logs, el contenedor se cae inmediatamente
```

**Diagnóstico:**

```bash
# Ver logs del contenedor
docker compose logs mcp-server

# Ver si el contenedor está corriendo
docker compose ps mcp-server
```

**Causas Comunes:**

#### 1. Error de Sintaxis en server.js

**Error:**

```
SyntaxError: Unexpected token '}'
    at Module._compile (internal/modules/cjs/loader.js:895:18)
```

**Solución:**

```bash
# Validar sintaxis
node -c server.js

# Si hay errores, revisar el archivo
# Buscar:
# - Paréntesis sin cerrar: ( } en vez de ) }
# - Comillas sin cerrar: "texto sin cerrar
# - Comas faltantes en objetos
```

#### 2. Puerto en Uso

**Error:**

```
Error: listen EADDRINUSE: address already in use :::5050
```

**Solución:**

```bash
# Opción 1: Matar el proceso que usa el puerto
lsof -ti:5050 | xargs kill -9

# Opción 2: Cambiar el puerto
# En docker-compose.yml:
ports:
  - "5051:5050"  # Cambiar puerto externo
```

#### 3. Variables de Entorno Faltantes

**Error:**

```
Error: MCP_DASHBOARD_USER is not defined
```

**Solución:**

```bash
# Crear archivo .env
cat > .env << EOF
MCP_DASHBOARD_USER=admin
MCP_DASHBOARD_PASS=admin123
NODE_ENV=development
EOF

# Reiniciar contenedor
docker compose restart mcp-server
```

---

## Problemas de Endpoints

### Endpoint devuelve 404

**Síntoma:**

```bash
curl http://localhost:5050/metrics/prometheus
# Output: Cannot GET /metrics/prometheus
```

**Diagnóstico:**

```bash
# Ver rutas registradas
docker exec mcp-server node -e "
const app = require('./server.js');
app._router.stack
  .filter(r => r.route)
  .forEach(r => console.log(Object.keys(r.route.methods)[0].toUpperCase(), r.route.path));
"
```

**Causas Comunes:**

#### 1. Orden de Middleware Incorrecto

**Problema:**

```javascript
// ❌ MALO: static files primero
app.use(express.static('public'));
app.get('/api/users', ...);  // Nunca se ejecuta si public/api/users existe

// ✅ BUENO: endpoints API primero
app.get('/api/users', ...);
app.use(express.static('public'));
```

**Solución:**

```javascript
// En server.js, mover todos los endpoints ANTES de:
app.use(express.static('public'));
app.get('/', basicAuth, ...);  // Ruta catch-all al final
```

#### 2. Typo en la Ruta

**Problema:**

```javascript
// Definido como:
app.get('/metrcis/prometheus', ...);  // Typo: metrcis

// Llamado como:
curl http://localhost:5050/metrics/prometheus  // 404
```

**Solución:** Revisar spelling de rutas cuidadosamente.

---

## Problemas de Autenticación

### Credenciales Correctas pero 401

**Síntoma:**

```bash
curl http://localhost:5050/dashboard -u admin:admin123
# Output: {"error":"Unauthorized"}
```

**Diagnóstico:**

```javascript
// Agregar logs en basicAuth middleware
function basicAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  console.log('Auth header:', authHeader);

  if (!authHeader) {
    console.log('No auth header provided');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const [username, password] = credentials.split(':');
  console.log('Username:', username);
  console.log('Password:', password);
  console.log('Expected:', validUser, validPass);

  // ...
}
```

**Causas Comunes:**

#### 1. Variables de Entorno No Cargadas

**Problema:**

```javascript
const validUser = process.env.MCP_DASHBOARD_USER; // undefined
const validPass = process.env.MCP_DASHBOARD_PASS; // undefined
```

**Solución:**

```bash
# Verificar variables de entorno
docker exec mcp-server env | grep MCP

# Si no existen, agregarlas
# En docker-compose.yml:
environment:
  - MCP_DASHBOARD_USER=admin
  - MCP_DASHBOARD_PASS=admin123
```

#### 2. Base64 Mal Codificado

**Problema:**

```bash
# Encoding incorrecto
echo -n "admin:admin123" | base64
# YWRtaW46YWRtaW4xMjM=

# Pero el cliente envía algo diferente
```

**Solución:**

```bash
# Usar -u flag de curl (maneja base64 automáticamente)
curl http://localhost:5050/dashboard -u admin:admin123
```

---

## Problemas de Docker

### Contenedor se reinicia constantemente

**Síntoma:**

```bash
docker compose ps mcp-server
# State: Restarting (Exit 1)
```

**Diagnóstico:**

```bash
# Ver últimos 50 logs
docker compose logs --tail 50 mcp-server

# Ver health check
docker inspect mcp-server | grep -A 10 Health
```

**Causas Comunes:**

#### 1. Health Check Falla

**Problema:**

```yaml
healthcheck:
  test: ['CMD', 'curl', '-f', 'http://localhost:5050/health']
  interval: 10s
  retries: 3
```

**Solución:**

```bash
# Verificar manualmente
docker exec mcp-server curl -f http://localhost:5050/health

# Si falla, revisar:
# 1. ¿El servidor está corriendo?
# 2. ¿El puerto es correcto?
# 3. ¿curl está instalado en el contenedor?

# Alternativa: usar wget
healthcheck:
  test: ["CMD", "wget", "--spider", "-q", "http://localhost:5050/health"]
```

#### 2. Build Caché Corrupto

**Problema:** Cambios en código no se reflejan en el contenedor.

**Solución:**

```bash
# Rebuild sin caché
docker compose build --no-cache mcp-server
docker compose up -d mcp-server
```

---

## Problemas de Métricas

### /metrics/prometheus devuelve JSON en vez de texto

**Síntoma:**

```bash
curl http://localhost:5050/metrics/prometheus
# Output: {"healthyServices":9,"totalServices":9,...}
```

**Diagnóstico:**

```bash
# Verificar Content-Type
curl -I http://localhost:5050/metrics/prometheus
# Content-Type: application/json  ❌ Debería ser text/plain
```

**Causas Comunes:**

#### 1. Ruta Incorrecta Procesada

**Problema:**

```javascript
// El endpoint /metrics se ejecuta en vez de /metrics/prometheus
app.get('/metrics', (req, res) => {
  res.json(metrics); // Este se ejecuta
});

app.get('/metrics/prometheus', (req, res) => {
  res.type('text/plain').send(prometheusText); // Nunca se ejecuta
});
```

**Solución:**

```javascript
// Definir rutas específicas PRIMERO
app.get('/metrics/prometheus', (req, res) => {
  res.type('text/plain').send(prometheusText);
});

app.get('/metrics', (req, res) => {
  res.json(metrics);
});
```

#### 2. Prometheus No Hace Scraping

**Síntoma:** Prometheus no recopila métricas del MCP Server.

**Diagnóstico:**

```bash
# Verificar targets en Prometheus
curl http://localhost:9090/api/v1/targets

# Verificar configuración
docker exec prometheus cat /etc/prometheus/prometheus.yml
```

**Solución:**

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'mcp-server'
    static_configs:
      - targets: ['mcp-server:5050'] # Usar nombre del servicio Docker
    metrics_path: '/metrics/prometheus'
```

---

## Problemas de Rendimiento

### Alto Uso de Memoria

**Síntoma:**

```bash
docker stats mcp-server
# MEM USAGE: 800MB / 1GB (80%)
```

**Diagnóstico:**

```javascript
// Agregar logging de tamaño del contexto
console.log('Events count:', context.events.length);
console.log('Audits count:', context.audit.length);
console.log('Memory usage:', process.memoryUsage());
```

**Causas Comunes:**

#### 1. Arrays Creciendo Sin Límite

**Problema:**

```javascript
// Los arrays crecen infinitamente
context.events.push(event); // Nunca se limpia
context.audit.push(auditLog); // Nunca se limpia
```

**Solución:**

```javascript
// Limitar tamaño de arrays
const MAX_EVENTS = 10000;

app.post('/events', (req, res) => {
  context.events.push(event);

  // Mantener solo los últimos MAX_EVENTS
  if (context.events.length > MAX_EVENTS) {
    context.events = context.events.slice(-MAX_EVENTS);
  }

  res.json(event);
});
```

#### 2. Memory Leak en Listeners

**Problema:**

```javascript
// Crear listeners sin límite
app.get('/subscribe', (req, res) => {
  eventEmitter.on('event', (data) => {
    res.write(data); // Listener nunca se remueve
  });
});
```

**Solución:**

```javascript
app.get('/subscribe', (req, res) => {
  const listener = (data) => {
    res.write(data);
  };

  eventEmitter.on('event', listener);

  // Remover listener cuando se cierra la conexión
  req.on('close', () => {
    eventEmitter.off('event', listener);
  });
});
```

---

## Comandos Útiles de Diagnóstico

### Logs

```bash
# Ver logs en tiempo real
docker compose logs -f mcp-server

# Últimas 100 líneas
docker compose logs --tail 100 mcp-server

# Logs con timestamps
docker compose logs -t mcp-server

# Filtrar por nivel
docker compose logs mcp-server | grep ERROR
```

### Estado del Contenedor

```bash
# Ver estado
docker compose ps mcp-server

# Ver detalles completos
docker inspect mcp-server

# Ver procesos dentro del contenedor
docker exec mcp-server ps aux

# Ver uso de recursos
docker stats mcp-server --no-stream
```

### Debugging Interactivo

```bash
# Entrar al contenedor
docker exec -it mcp-server sh

# Probar endpoint desde dentro
docker exec mcp-server curl http://localhost:5050/health

# Ver archivos
docker exec mcp-server ls -la

# Ver variables de entorno
docker exec mcp-server env
```

### Network

```bash
# Ver puertos expuestos
docker port mcp-server

# Test de conectividad
docker exec mcp-server ping -c 3 auth-service

# Ver DNS
docker exec mcp-server nslookup auth-service
```

---

## Checklist de Debugging

Cuando algo no funciona, sigue este checklist:

- [ ] ¿El contenedor está corriendo? (`docker compose ps`)
- [ ] ¿Hay errores en los logs? (`docker compose logs`)
- [ ] ¿El puerto está correcto? (`docker port mcp-server`)
- [ ] ¿Las variables de entorno están configuradas? (`docker exec mcp-server env`)
- [ ] ¿La sintaxis del código es correcta? (`node -c server.js`)
- [ ] ¿El endpoint está definido? (revisar `server.js`)
- [ ] ¿El orden de middleware es correcto? (revisar `server.js`)
- [ ] ¿Las credenciales son correctas? (probar con curl -u)
- [ ] ¿Hay conflictos de puertos? (`lsof -ti:5050`)
- [ ] ¿El health check funciona? (`curl http://localhost:5050/health`)

---

## Soporte

Si el problema persiste después de revisar esta guía:

1. **Recopila información:**

   ```bash
   # Logs
   docker compose logs mcp-server > logs.txt

   # Estado
   docker compose ps > status.txt

   # Configuración
   cat docker-compose.yml > config.txt
   ```

2. **Abre un issue en GitHub** con:
   - Descripción del problema
   - Pasos para reproducir
   - Logs adjuntos
   - Versión del sistema

3. **Contacta al equipo:**
   - 📧 Email: support@flores-victoria.com
   - 💬 Slack: #mcp-server-help
