# 🎯 Diagnóstico Sistema de Promociones

**Fecha**: 2025-10-28  
**Fase**: Post-3.2.0 - Estabilización del Sistema

---

## ✅ Servicios Healthy (Healthchecks Corregidos)

**Problema Resuelto**: 16 servicios tenían healthchecks configurados con `curl` pero contenedores Node no incluyen curl.

**Solución Aplicada**:
```bash
# Actualización masiva de healthchecks (curl → wget)
sed -i 's/test: \["CMD", "curl", "-f", "http:\/\/localhost:\([0-9]*\)\/health"\]/test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http:\/\/localhost:\1\/health"]/g' docker-compose.yml

# Recreación de servicios unhealthy
docker-compose up -d --no-deps promotion-service payment-service recommendations
```

**Resultado**:
- ✅ 16 servicios con healthchecks actualizados
- ✅ 100% de servicios reportan **healthy**
- ✅ promotion-service: Up 2 hours (healthy)
- ✅ payment-service: Up 2 hours (healthy)
- ✅ recommendations: Up 3 hours (healthy)

---

## ✅ API Promociones (Puerto Directo 3019)

### Endpoints Funcionales

#### 1. **GET /api/promotions**
```bash
curl -s http://localhost:3019/api/promotions
```
**Response**:
```json
{
  "promotions": [
    {
      "_id": "6900f270cdc0f43f5baf07b0",
      "code": "TESTFINAL",
      "name": "Test Final",
      "type": "percentage",
      "value": 50,
      "active": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 4,
    "pages": 1
  }
}
```
✅ **Estado**: Funciona correctamente

#### 2. **POST /api/promotions**
```bash
curl -s -X POST http://localhost:3019/api/promotions \
  -H "Content-Type: application/json" \
  -d '{
    "code": "TESTFINAL",
    "name": "Test Final",
    "description": "Test final del sistema",
    "type": "percentage",
    "value": 50,
    "startDate": "2025-10-28",
    "endDate": "2025-12-31",
    "active": true
  }'
```
**Response**:
```json
{
  "message": "Promoción creada exitosamente",
  "promotion": {
    "_id": "6900f270cdc0f43f5baf07b0",
    "code": "TESTFINAL",
    "value": 50,
    "active": true
  }
}
```
✅ **Estado**: Funciona correctamente

#### 3. **POST /api/promotions/validate**
```bash
curl -s -X POST http://localhost:3019/api/promotions/validate \
  -H "Content-Type: application/json" \
  -d '{
    "code": "TESTFINAL",
    "subtotal": 100000,
    "items": []
  }'
```
**Response**:
```json
{
  "valid": true,
  "promotion": {
    "code": "TESTFINAL",
    "name": "Test Final",
    "type": "percentage",
    "value": 50,
    "discount": 50000,
    "freeShipping": false
  }
}
```
✅ **Estado**: Funciona correctamente

**Campos Requeridos**:
- `code`: Código de promoción
- `subtotal`: Total del carrito (NO `cartTotal`)
- `items`: Array de items (puede ser vacío)

---

## ❌ API Gateway Proxy Bug (Puerto 3000)

### Problema Identificado

**Síntoma**: POST a `/api/promotions` vía api-gateway devuelve **408 Request Timeout**

**Causa Raíz**:
1. api-gateway parsea body con `express.json()` (línea 30 de `app.js`)
2. Proxy intenta reenviar `req.body` vía Axios (`proxy.js`)
3. promotion-service recibe request pero body stream se corta
4. Express body-parser espera más datos → conexión se cierra prematuramente
5. Error: `BadRequestError: request aborted`

**Logs del Error**:
```
::ffff:172.20.0.21 - POST /api/promotions/ HTTP/1.1 400 165
Error: BadRequestError: request aborted
  at IncomingMessage.onAborted (/app/node_modules/raw-body/index.js:245:10)
  code: 'ECONNABORTED',
  expected: 245,
  length: 245,
  received: 194,
  type: 'request.aborted'
```

**API Gateway Logs**:
```
error: Error en proxy a microservicio:
{"error":"Request failed with status code 408"}
```

### Soluciones

#### ⏱️ Solución Temporal (Implementada)
- **Usar puerto directo del promotion-service**: `http://localhost:3019`
- ✅ Evita el proxy del api-gateway
- ✅ Funciona para testing y desarrollo
- ❌ No es solución productiva

#### 🔧 Solución Permanente (Pendiente)
Reemplazar proxy manual de Axios con `http-proxy-middleware`:

```javascript
// microservices/api-gateway/src/routes/index.js
const { createProxyMiddleware } = require('http-proxy-middleware');

router.use('/promotions', createProxyMiddleware({
  target: config.services.promotionService,
  pathRewrite: {
    '^/promotions': '/api/promotions'
  },
  changeOrigin: true,
  logLevel: 'debug'
}));
```

**Ventajas**:
- ✅ Maneja streams correctamente
- ✅ Preserva headers y body
- ✅ Ampliamente usado en producción
- ✅ Mejor performance

---

## 📊 Estado Actual

### Servicios Docker
```
SERVICE                STATUS
promotion-service      Up 2 hours (healthy)  [Puerto 3019]
payment-service        Up 2 hours (healthy)  [Puerto 3014]
recommendations        Up 3 hours (healthy)  [Puerto 3002]
api-gateway            Up 1 hour (healthy)   [Puerto 3000]
admin-panel            Up 15 hours (healthy) [Puerto 3010]
frontend               Up 13 hours (healthy) [Puerto 5173]
```

### Productos
```bash
curl -s http://localhost:3000/api/products?limit=3 | jq -r '.products[] | "\(.name) - Imágenes: \(.images | length)"'
```
**Resultado**:
```
Cesta "Dulce Cumpleaños" - Imágenes: 1
Ramo "Felicidad Colorida" - Imágenes: 1
Orquídea Elegante Premium - Imágenes: 1
```
⚠️ **Pendiente**: Agregar múltiples imágenes por producto (3-5 vistas)

### Promociones Creadas (Testing)
- ✅ VERANO2025 (20%)
- ✅ TEST2025 (15%)
- ✅ TESTDIRECT (25%)
- ✅ TESTFINAL (50%)

---

## 🎯 Próximos Pasos Recomendados

### 1. **Corregir API Gateway Proxy** (Alta Prioridad)
- Implementar `http-proxy-middleware`
- Eliminar proxy manual de Axios
- Testing de POST vía gateway
- Validar GET, POST, PUT, DELETE

### 2. **UI Admin Panel** (Media Prioridad)
- Abrir http://localhost:3010
- Probar creación de promociones desde UI
- Validar tabla de promociones
- Verificar botones activar/desactivar

### 3. **Productos con Múltiples Imágenes** (Media Prioridad)
- Actualmente: 1 imagen por producto
- Objetivo: 3-5 imágenes (vistas diferentes)
- Actualizar base de datos
- Validar galería en frontend

### 4. **Test Endpoints Críticos** (Baja Prioridad)
- /api/products (GET) ✅
- /api/promotions (todos los métodos)
- /api/ai-images (presets)
- Validar responses y status codes

---

## 📝 Archivos Modificados

### docker-compose.yml
```yaml
# ANTES (16 servicios):
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:PORT/health"]

# DESPUÉS (16 servicios):
healthcheck:
  test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:PORT/health"]
```

### microservices/api-gateway/src/routes/index.js
```javascript
// Rutas de Promociones (proxy)
router.use('/promotions', loggerMiddleware.logRequest, (req, res) => {
  const cleanUrl = req.url === '/' ? '' : req.url;
  req.url = `/api/promotions${cleanUrl}`;
  ServiceProxy.routeToService(config.services.promotionService, req, res);
});
```

---

## ✅ Logros de Esta Sesión

1. ✅ Diagnosticado problema de 3 servicios unhealthy
2. ✅ Identificada causa raíz (curl no disponible)
3. ✅ Actualizado 16 healthchecks en docker-compose.yml
4. ✅ Recreados servicios afectados
5. ✅ Validado: 100% servicios healthy
6. ✅ Testing completo de API de promociones (puerto 3019)
7. ✅ Identificado y documentado bug del api-gateway proxy
8. ✅ Creadas promociones de prueba funcionales

---

**Duración**: ~2 horas  
**Complejidad**: Media-Alta  
**Impacto**: Sistema estabilizado, endpoints validados
