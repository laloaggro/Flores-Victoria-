# ✅ Checklist de Validación - Admin Site SSO

**Proyecto:** Flores Victoria  
**Fecha:** 21 de octubre de 2025  
**Versión:** 1.0.0

Use este checklist para validar que todo funciona correctamente después de la implementación.

---

## 📋 Pre-requisitos

- [ ] Docker y Docker Compose instalados
- [ ] Node.js v18+ instalado
- [ ] Puerto 9000 disponible (Admin Site)
- [ ] Puertos 3000, 3001, 3009, 3010, 5050, 5173 disponibles
- [ ] Git repository actualizado

---

## 🚀 Validación de Inicio

### 1. Iniciar Sistema Completo

```bash
cd /home/impala/Documentos/Proyectos/flores-victoria
./scripts/start-all-with-admin.sh
```

**Esperado:**

```
✅ Docker services: api-gateway, auth-service, product-service, frontend, admin-panel
✅ MCP Server iniciado (PID: XXXX)
✅ Admin Site iniciado (PID: XXXX)
```

**Validación manual:**

- [ ] Script ejecuta sin errores
- [ ] Muestra mensaje "Todos los servicios iniciados"
- [ ] Lista URLs de servicios correctamente
- [ ] Logs en `/tmp/mcp-server.log` y `/tmp/admin-site.log` sin errores críticos

---

## 🏥 Health Checks

### 2. Validar Conectividad de Servicios

```bash
curl -s http://localhost:9000/health | jq
```

**Esperado:**

```json
{
  "ok": true,
  "services": {
    "gateway": { "ok": true, "status": 200 },
    "auth": { "ok": true, "status": 200 },
    "products": { "ok": true, "status": 200 },
    "adminPanel": { "ok": true, "status": 200 },
    "mcp": { "ok": true, "status": 200 }
  }
}
```

**Validación manual:**

- [ ] `"ok": true` en el response principal
- [ ] Todos los servicios con `"ok": true`
- [ ] Sin errores de timeout o conexión

### 3. Validar Servicios Individuales

```bash
curl -s http://localhost:3000/health | jq  # Gateway
curl -s http://localhost:3001/health | jq  # Auth
curl -s http://localhost:3009/health | jq  # Products
curl -s http://localhost:5050/health | jq  # MCP
```

**Esperado:** Todos retornan `200 OK` con `{"status":"ok"}` o similar

**Validación manual:**

- [ ] Gateway (3000) responde
- [ ] Auth (3001) responde
- [ ] Products (3009) responde
- [ ] MCP (5050) responde

---

## 🔐 Validación de Autenticación

### 4. Login con Credenciales Admin

```bash
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@flores.local","password":"admin123"}' | jq -r '.data.token')

echo "Token obtenido: ${TOKEN:0:50}..."
```

**Esperado:**

```
Token obtenido: simple_token_1_TIMESTAMP...
```

**Validación manual:**

- [ ] Token no es `null` ni vacío
- [ ] Token comienza con `simple_token_1_` (en dev, JWT real en prod)
- [ ] Sin error 429 (Too Many Requests)
- [ ] Sin error 401 (Unauthorized)

### 5. Setear Cookie HttpOnly

```bash
curl -s -X POST http://localhost:9000/auth/set-cookie \
  -H "Content-Type: application/json" \
  -d "{\"token\":\"$TOKEN\"}" \
  -c /tmp/admin-cookie.txt | jq
```

**Esperado:**

```json
{
  "ok": true,
  "user": {
    "id": 1,
    "name": "admin",
    "email": "admin@flores.local",
    "role": "admin"
  }
}
```

**Validación manual:**

- [ ] Response tiene `"ok": true`
- [ ] User tiene `"role": "admin"`
- [ ] Archivo `/tmp/admin-cookie.txt` creado
- [ ] Cookie contiene `admin_token`

### 6. Verificar Cookie en Archivo

```bash
cat /tmp/admin-cookie.txt | grep admin_token
```

**Esperado:**

```
localhost	FALSE	/	FALSE	0	admin_token	simple_token_1_TIMESTAMP
```

**Validación manual:**

- [ ] Cookie `admin_token` presente
- [ ] Path es `/`
- [ ] HttpOnly flag (no visible en este test, se valida en browser)

---

## 🔄 Validación de Proxy SSO

### 7. Acceder a Ruta Protegida con Cookie

```bash
curl -s http://localhost:9000/panel/ -b /tmp/admin-cookie.txt | head -20
```

**Esperado:**

```html
<!DOCTYPE html>
<html lang="es" data-theme="light">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Panel de Administración - Arreglos Victoria Florería</title>
    ...
  </head>
</html>
```

**Validación manual:**

- [ ] HTML del Admin Panel (3010) cargado
- [ ] Sin error 401 (cookie válida)
- [ ] Sin error 502 (proxy funcional)
- [ ] Header `Authorization` inyectado por proxy (validar logs si necesario)

### 8. Acceder a MCP vía Proxy

```bash
curl -s http://localhost:9000/mcp/ -b /tmp/admin-cookie.txt | head -20
```

**Esperado:** HTML del MCP dashboard (5050)

**Validación manual:**

- [ ] HTML del MCP cargado
- [ ] Sin errores de proxy
- [ ] Dashboard del MCP visible

### 9. Acceder a API vía Proxy

```bash
curl -s http://localhost:9000/api/auth/profile -b /tmp/admin-cookie.txt | jq
```

**Esperado:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "admin",
      "email": "admin@flores.local",
      "role": "admin"
    }
  }
}
```

**Validación manual:**

- [ ] Profile retorna user admin
- [ ] Authorization header funcionó (proxy inyectó desde cookie)
- [ ] Sin error 401

---

## 🌐 Validación en Browser

### 10. Acceder al Admin Site

1. Abrir browser en: http://localhost:9000
2. Hacer login con: `admin@flores.local` / `admin123`

**Esperado:**

- [ ] Home del admin-site carga
- [ ] Tarjetas de dashboards visibles
- [ ] Sin errores en Console del browser

### 11. Validar Cookie en DevTools

1. DevTools → Application → Cookies → `http://localhost:9000`
2. Buscar cookie `admin_token`

**Esperado:**

- [ ] Cookie `admin_token` existe
- [ ] Flags: `HttpOnly`, `SameSite=Lax`
- [ ] Path: `/`
- [ ] Expires: ~24h desde login

### 12. Acceder al Panel Integrado

1. En admin-site home, click en "Panel de Control"
2. URL: http://localhost:9000/pages/admin-panel.html

**Esperado:**

- [ ] Iframe carga el panel sin errores
- [ ] Sin errores CORS en Console
- [ ] Panel 3010 funcional dentro del iframe
- [ ] Same-origin (URL del iframe es `/panel/`, no `http://localhost:3010`)

### 13. Acceder a MCP Dashboard

1. En admin-site home, click en "MCP Dashboard"
2. URL: http://localhost:9000/pages/mcp-dashboard.html

**Esperado:**

- [ ] Dashboard MCP carga
- [ ] Gráficos visibles
- [ ] Auto-refresh funciona
- [ ] Sin errores en Console

### 14. Logout y Re-login

1. Click en botón "Logout" (si existe en UI) o ejecutar `logout()` en Console
2. Verificar redirect a login
3. Re-login con credenciales admin

**Esperado:**

- [ ] Logout limpia cookie (verificar en DevTools)
- [ ] Redirect a `/pages/login.html`
- [ ] Re-login setea nueva cookie
- [ ] Redirect a home del admin-site

---

## 🧪 Validación de Rate Limiting

### 15. Verificar Rate Limits Aumentados

```bash
# Enviar 10 requests rápidos (debe pasar sin 429)
for i in {1..10}; do
  curl -s -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@flores.local","password":"admin123"}' \
    | jq -r '.success'
  sleep 0.1
done
```

**Esperado:** Todos los requests retornan `true` (no 429)

**Validación manual:**

- [ ] Sin error 429 en 10 requests consecutivos
- [ ] Rate limit aumentado funciona (Gateway: 500/15min, Auth: 200/15min)

---

## 📊 Validación de Dashboard Terminal

### 16. Dashboard con Intervalo Configurable

```bash
# Test con intervalo default (5s)
timeout 12 ./scripts/dashboard.sh

# Test con intervalo custom (10s)
timeout 25 ./scripts/dashboard.sh --interval 10
```

**Esperado:**

```
╔══════════════════════════════════════════════════════════════════════════╗
║  FLORES VICTORIA - DASHBOARD EN TIEMPO REAL                          ║
║  Última actualización: HH:MM:SS · Intervalo: 5s                      ║
╚══════════════════════════════════════════════════════════════════════════╝

━━━ CONTENEDORES DOCKER ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ● API Gateway          RUNNING     CPU: 0.XX%  MEM: XX.XXMiB
  ● Auth Service         RUNNING     CPU: 0.XX%  MEM: XX.XXMiB
  ● Product Service      RUNNING     CPU: 0.XX%  MEM: XX.XXMiB
...
```

**Validación manual:**

- [ ] Dashboard muestra header con intervalo
- [ ] Intervalo default es 5s (legible)
- [ ] Intervalo custom funciona (`--interval 10`)
- [ ] Containers, health, endpoints visibles

---

## 🛑 Validación de Detención

### 17. Detener Sistema Completo

```bash
./scripts/stop-all-with-admin.sh
```

**Esperado:**

```
✅ Admin Site detenido (PID: XXXX)
✅ MCP Server detenido (PID: XXXX)
✅ Docker services detenidos
```

**Validación manual:**

- [ ] Script ejecuta sin errores
- [ ] Admin Site (9000) detenido
- [ ] MCP (5050) detenido
- [ ] Docker services down
- [ ] PIDs limpiados de `/tmp/*.pid`

### 18. Verificar Puertos Liberados

```bash
netstat -tuln | grep -E ":(3000|3001|3009|3010|5050|9000)"
```

**Esperado:** Sin output (puertos liberados)

**Validación manual:**

- [ ] Puerto 9000 libre
- [ ] Puerto 5050 libre
- [ ] Puertos Docker libres (3000, 3001, 3009, 3010)

---

## 📚 Validación de Documentación

### 19. Verificar Archivos de Documentación

```bash
ls -lh admin-site/ADMIN_SITE_SSO_GUIDE.md
ls -lh ADMIN_SITE_IMPLEMENTATION.md
ls -lh README_ADMIN_SITE.md
```

**Esperado:** Todos los archivos existen

**Validación manual:**

- [ ] `ADMIN_SITE_SSO_GUIDE.md` existe y es legible
- [ ] `ADMIN_SITE_IMPLEMENTATION.md` existe y es legible
- [ ] `README_ADMIN_SITE.md` existe y es legible
- [ ] README.md principal actualizado con sección Admin Site

---

## 🎯 Resumen de Validación

### Checklist General

**Inicio y Servicios:**

- [ ] Script `start-all-with-admin.sh` ejecuta sin errores
- [ ] Todos los servicios levantan correctamente
- [ ] Health checks retornan OK

**Autenticación:**

- [ ] Login obtiene token
- [ ] Cookie HttpOnly se setea correctamente
- [ ] Cookie visible en DevTools con flags correctos

**Proxy SSO:**

- [ ] `/panel/` carga Admin Panel (3010)
- [ ] `/mcp/` carga MCP dashboard (5050)
- [ ] `/api/*` proxea a Gateway (3000)
- [ ] Authorization header inyectado desde cookie

**Browser:**

- [ ] Admin Site home carga
- [ ] Login/logout funciona
- [ ] Panel integrado sin CORS
- [ ] MCP dashboard visible

**Rate Limiting:**

- [ ] Sin error 429 en requests consecutivos
- [ ] Gateway: 500 req/15min
- [ ] Auth: 200 req/15min

**Dashboard:**

- [ ] Dashboard terminal con intervalo 5s
- [ ] Intervalo configurable funciona

**Detención:**

- [ ] Script `stop-all-with-admin.sh` ejecuta sin errores
- [ ] Todos los servicios detenidos
- [ ] Puertos liberados

**Documentación:**

- [ ] Todos los archivos de docs creados
- [ ] README principal actualizado

---

## ✅ Resultado Final

Si todos los checks anteriores pasan:

**🎉 IMPLEMENTACIÓN EXITOSA**

El Admin Site con Reverse Proxy y SSO está completamente funcional y listo para uso.

---

## 🐛 Si Algo Falla

Consulta la sección de **Troubleshooting** en:

- `admin-site/ADMIN_SITE_SSO_GUIDE.md` (sección 9)
- `ADMIN_SITE_IMPLEMENTATION.md` (Testing Realizado)

O revisa los logs:

```bash
tail -f /tmp/admin-site.log
tail -f /tmp/mcp-server.log
docker compose logs -f api-gateway
docker compose logs -f auth-service
```

---

**Validación completada por:** **\*\***\_\_\_**\*\***  
**Fecha:** **\*\***\_\_\_**\*\***  
**Resultado:** [ ] ✅ PASS [ ] ❌ FAIL (ver notas)  
**Notas:**
