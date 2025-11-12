# 🚀 Quick Start - Sistema de Promociones

## ⚡ Inicio Rápido (2 minutos)

### 1. Verificar Servicios

```bash
# Health checks
curl http://localhost:3000/health              # API Gateway
curl http://localhost:3019/health              # Promotion Service
```

**Respuesta esperada**: `{"status":"ok"}`

---

### 2. Listar Promociones

```bash
curl http://localhost:3000/api/promotions | jq .
```

**Respuesta**:

```json
{
  "promotions": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "pages": 1
  }
}
```

---

### 3. Crear Promoción

```bash
curl -X POST http://localhost:3000/api/promotions \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Bienvenida 2025",
    "code": "BIENVENIDA20",
    "description": "20% descuento para nuevos clientes",
    "type": "percentage",
    "value": 20,
    "startDate": "2025-01-01",
    "endDate": "2025-12-31",
    "isActive": true,
    "autoApply": false
  }' | jq .
```

---

### 4. Validar Código

```bash
curl -X POST http://localhost:3000/api/promotions/validate \
  -H "Content-Type: application/json" \
  -d '{
    "code": "BIENVENIDA20",
    "cartTotal": 1000
  }' | jq .
```

**Respuesta exitosa**:

```json
{
  "valid": true,
  "promotion": { ... },
  "discount": 200
}
```

---

## 📊 Todos los Endpoints

### Gestión de Promociones

| Endpoint              | Método | Descripción           |
| --------------------- | ------ | --------------------- |
| `/api/promotions`     | GET    | Listar con paginación |
| `/api/promotions`     | POST   | Crear nueva           |
| `/api/promotions/:id` | GET    | Obtener una           |
| `/api/promotions/:id` | PUT    | Actualizar            |
| `/api/promotions/:id` | DELETE | Eliminar              |

### Validación y Uso

| Endpoint                   | Método | Descripción    |
| -------------------------- | ------ | -------------- |
| `/api/promotions/validate` | POST   | Validar código |
| `/api/promotions/active`   | GET    | Solo activas   |
| `/api/promotions/:id/use`  | POST   | Registrar uso  |

### Analytics

| Endpoint                    | Método | Descripción         |
| --------------------------- | ------ | ------------------- |
| `/api/promotions/:id/stats` | GET    | Estadísticas de una |
| `/api/promotions/analytics` | GET    | Analytics general   |

---

## 🧪 Testing

### Tests Automatizados

```bash
# Todos los tests con coverage
npm test

# Solo promociones
npm run test:promotion

# Watch mode
npm run test:watch

# CI/CD
npm run test:ci
```

### Validación de Endpoints

```bash
# Script bash completo
chmod +x scripts/test-promotion-endpoints.sh
./scripts/test-promotion-endpoints.sh
```

### Performance Benchmark

Abrir en navegador:

```
frontend/performance-benchmark.html
```

---

## 🎨 Uso en Frontend

### Inicializar Manager

```javascript
const promoManager = new PromotionManager();
await promoManager.init();
```

### Auto-aplicar Promociones

```javascript
// Se aplican automáticamente al cargar
// Verifica: promoManager.activePromotions
```

### Validar Código Manual

```javascript
const result = await promoManager.validateCode('BIENVENIDA20');
if (result.valid) {
  console.log('Descuento:', result.discount);
  promoManager.applyPromotion(result.promotion);
}
```

### Aplicar al Carrito

```javascript
const cart = {
  subtotal: 1000,
  items: [...]
};

const discount = promoManager.calculateDiscount(cart);
const total = cart.subtotal - discount;
```

---

## 🎁 Tipos de Promociones

### 1. Porcentaje

```json
{
  "type": "percentage",
  "value": 20,
  "maxDiscountAmount": 500
}
```

- Descuento del 20%
- Máximo $500 de descuento

### 2. Monto Fijo

```json
{
  "type": "fixed",
  "value": 100,
  "minPurchaseAmount": 500
}
```

- $100 de descuento
- Compra mínima: $500

### 3. BOGO (Buy One Get One)

```json
{
  "type": "bogo",
  "value": 1
}
```

- Compra 1, lleva 2
- value = cantidad gratis

### 4. Envío Gratis

```json
{
  "type": "free_shipping",
  "minPurchaseAmount": 300
}
```

- Envío gratis
- Compra mínima: $300

---

## 🔧 Configuración Avanzada

### Límites de Uso

```json
{
  "usageLimit": 100, // Límite total
  "perUserLimit": 1 // Límite por usuario
}
```

### Aplicabilidad

```json
{
  "applicableCategories": ["flores", "ramos"],
  "applicableProducts": ["prod-123"],
  "excludedProducts": ["prod-456"]
}
```

### Stacking

```json
{
  "stackable": true, // Se puede combinar
  "priority": 10 // Mayor = primero
}
```

### Auto-aplicación

```json
{
  "autoApply": true // Se aplica automáticamente
}
```

---

## 📈 Analytics y Reportes

### Estadísticas de Promoción

```bash
curl http://localhost:3000/api/promotions/:id/stats | jq .
```

**Métricas**:

- Usos totales
- Tasa de conversión
- Revenue generado
- Descuento promedio

### Analytics General

```bash
curl http://localhost:3000/api/promotions/analytics | jq .
```

**Datos**:

- Top promociones
- Performance por tipo
- Tendencias de uso

---

## 🛠️ Troubleshooting

### Problema: 404 en endpoints

**Solución**:

```bash
# Verificar servicios corriendo
docker ps | grep -E "api-gateway|promotion"

# Reiniciar si es necesario
docker-compose restart api-gateway promotion-service
```

### Problema: Error de autenticación MongoDB

**Solución**:

```bash
# Verificar variable de entorno
docker-compose config | grep MONGODB_URI

# Debe incluir: mongodb://root:rootpassword@...?authSource=admin
```

### Problema: Promoción no se aplica

**Checklist**:

- [ ] `isActive: true`
- [ ] Fechas válidas (startDate < ahora < endDate)
- [ ] `usageLimit` no alcanzado
- [ ] `minPurchaseAmount` cumplido
- [ ] Producto/categoría aplicable

---

## 📚 Documentación Completa

- **Resumen Final**: `RESUMEN_FINAL_v3.1.md`
- **Implementación**: `IMPLEMENTACION_COMPLETADA_v3.1.md`
- **Guía Rápida**: `GUIA_RAPIDA_v3.1.md`
- **Testing**: `TESTING_VALIDATION_SUMMARY.md`
- **Pendientes**: `PENDIENTES_MENORES_COMPLETADOS.md`

---

## 🎯 Próximos Pasos

1. ✅ Sistema funcionando
2. ✅ Endpoints validados
3. 🔄 Ejecutar tests completos
4. 🔄 Benchmarking de performance
5. 🔄 Documentar API completa
6. 🔄 E2E testing

---

**¡Sistema listo para producción!** 🚀

**Versión**: 3.1.1  
**Fecha**: 28 de Octubre 2025
