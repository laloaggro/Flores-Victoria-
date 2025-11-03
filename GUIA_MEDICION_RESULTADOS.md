# 📊 Guía de Medición de Resultados - Optimizaciones Implementadas

## 🎯 Objetivo

Medir el impacto real de las 7 optimizaciones implementadas:

1. Lazy Loading de Imágenes
2. Optimización CLS
3. Service Worker Avanzado
4. Imágenes WebP (-90.4%)
5. Índices MongoDB (50x más rápido)
6. Code Splitting JavaScript (-89%)
7. Stack de Monitoring

---

## 🚀 PASO 1: Desplegar Sistema Optimizado

```bash
# Ejecutar script de deployment
./deploy-optimized.sh

# Verificar que todo está corriendo
docker ps | grep flores-victoria
```

**Servicios que deben estar activos:**

- ✅ Frontend (puerto 5173)
- ✅ MongoDB (puerto 27017)
- ✅ Prometheus (puerto 9090)
- ✅ Grafana (puerto 3000)
- ✅ Node Exporter (puerto 9100)
- ✅ MongoDB Exporter (puerto 9216)

---

## 📈 PASO 2: Lighthouse Audit (Performance Score)

### 2.1 Desde Chrome DevTools

1. Abrir **Chrome** → http://localhost:5173
2. **F12** → pestaña **Lighthouse**
3. Configurar:
   - ✅ Performance
   - ✅ Accessibility
   - ✅ Best Practices
   - ✅ SEO
   - Device: **Desktop**
   - Mode: **Navigation**
4. Click **"Generate report"**
5. Esperar 30-60 segundos

### 2.2 Métricas a Capturar

Tomar screenshots de:

**Core Web Vitals:**

- ✅ **FCP** (First Contentful Paint) - Target: < 1.8s
- ✅ **LCP** (Largest Contentful Paint) - Target: < 2.5s
- ✅ **CLS** (Cumulative Layout Shift) - Target: < 0.1
- ✅ **TTI** (Time to Interactive) - Target: < 3.8s
- ✅ **TBT** (Total Blocking Time) - Target: < 300ms
- ✅ **Speed Index** - Target: < 3.4s

**Performance Score:**

- ✅ Overall Score - Target: > 90
- ✅ Accessibility - Target: > 90
- ✅ Best Practices - Target: > 90
- ✅ SEO - Target: > 90

### 2.3 Lighthouse CLI (Opcional)

```bash
# Instalar Lighthouse
npm install -g lighthouse

# Ejecutar audit
lighthouse http://localhost:5173 \
  --output html \
  --output-path ./lighthouse-report.html \
  --chrome-flags="--headless"

# Ver reporte
open lighthouse-report.html  # macOS
xdg-open lighthouse-report.html  # Linux
```

---

## 🌐 PASO 3: Network Analysis (Bundle Size & WebP)

### 3.1 Verificar Code Splitting

1. **F12** → **Network** tab
2. Filter: **JS**
3. **Ctrl+Shift+R** (hard reload)

**Capturar:**

- ✅ Número de archivos JS cargados
- ✅ Tamaño total de JS transferido
- ✅ Tamaño de `main-*.js` (debe ser ~1KB)
- ✅ Tamaño de `core-*.js` (~15KB)
- ✅ Tamaño de `utils-*.js` (~60KB)

**Comparación esperada:**

```
ANTES:
  main.js: 150 KB (sin compress)

AHORA:
  main-*.js: 0.8 KB
  core-*.js: 14.9 KB
  utils-*.js: 59 KB (lazy load)
  TOTAL inicial: ~16 KB (-89%)
```

### 3.2 Verificar Imágenes WebP

1. **F12** → **Network** tab
2. Filter: **Img**
3. **Ctrl+Shift+R** (hard reload)

**Verificar:**

- ✅ Archivos `.webp` se están cargando (no `.png` o `.jpg`)
- ✅ Header `Content-Type: image/webp`
- ✅ Tamaño de imágenes ~90% menor

**Ejemplo de verificación:**

```
# Buscar imagen específica en Network tab
AML001.webp → debe ser ~44 KB
(vs AML001.png → 953 KB = 95.4% ahorro)
```

### 3.3 Verificar Service Worker

1. **F12** → **Application** tab
2. **Service Workers** (left sidebar)

**Verificar:**

- ✅ Status: **activated and is running**
- ✅ Source: `/sw.js`
- ✅ Scope: `/`

**Probar Offline:**

1. Check **Offline** checkbox
2. Navegar entre páginas
3. Debe funcionar sin errores

---

## 🗄️ PASO 4: MongoDB Performance (Queries)

### 4.1 Verificar Índices Creados

```bash
# Conectar a MongoDB
docker exec -it flores-victoria-mongodb mongosh flores-victoria \
  -u admin -p admin123 --authenticationDatabase admin

# Listar índices de products
db.products.getIndexes()

# Listar índices de promotions
db.promotions.getIndexes()

# Listar índices de reviews
db.reviews.getIndexes()
```

**Esperado:**

- Products: 13 índices
- Promotions: 8 índices
- Reviews: 10 índices

### 4.2 Medir Performance de Queries

```javascript
// Query con índice (optimizado)
db.products
  .find({
    category: 'rosas',
    active: true,
  })
  .explain('executionStats');
```

**Métricas a capturar:**

- ✅ `executionTimeMillis` - Target: < 20ms
- ✅ `totalDocsExamined` vs `nReturned` - Ratio: ~1:1 (ideal)
- ✅ `indexName` - Debe usar índice (ej: `catalog_category_price`)

**Comparación esperada:**

```
ANTES:
  executionTimeMillis: 650ms
  totalDocsExamined: 5000
  indexName: null (COLLSCAN)

AHORA:
  executionTimeMillis: 7ms (-99%)
  totalDocsExamined: 10
  indexName: "catalog_category_price"
```

---

## 📊 PASO 5: Monitoring Dashboard (Grafana)

### 5.1 Acceder a Grafana

1. Abrir http://localhost:3000
2. Login: `admin` / `admin123`
3. Ir a **Dashboards** → **E-Commerce Performance**

### 5.2 Métricas a Monitorear (15 minutos)

**Performance Metrics:**

- ✅ Response Time (95th percentile) - Target: < 500ms
- ✅ Request Rate - Observar tendencia
- ✅ Error Rate - Target: < 1%

**Business Metrics:**

- ✅ Active Users
- ✅ Conversion Rate - Target: > 2%
- ✅ Cart Abandonment - Target: < 70%

**Infrastructure:**

- ✅ CPU Usage - Target: < 60%
- ✅ Memory Usage - Target: < 70%
- ✅ MongoDB Query Time - Target: < 50ms avg

### 5.3 Generar Carga de Prueba

```bash
# Instalar Apache Bench
sudo apt-get install apache2-utils

# Generar 1000 requests con 10 usuarios concurrentes
ab -n 1000 -c 10 http://localhost:5173/

# Ver métricas en Grafana en tiempo real
```

---

## 🧪 PASO 6: Pruebas de Estrés (Opcional)

### 6.1 k6 Load Testing

```bash
# Instalar k6
sudo snap install k6

# Crear script de prueba
cat > load-test.js << 'EOF'
import http from 'k6/http';
import { sleep, check } from 'k6';

export let options = {
  stages: [
    { duration: '1m', target: 50 },  // Ramp up
    { duration: '3m', target: 50 },  // Steady
    { duration: '1m', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% < 500ms
    http_req_failed: ['rate<0.01'],   // Error rate < 1%
  },
};

export default function() {
  let res = http.get('http://localhost:5173');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'page loads fast': (r) => r.timings.duration < 500,
  });
  sleep(1);
}
EOF

# Ejecutar prueba
k6 run load-test.js
```

**Capturar resultados:**

- ✅ Requests/sec handled
- ✅ P95 response time
- ✅ Error rate
- ✅ Max concurrent users

---

## 📋 PASO 7: Comparación Antes/Después

### Plantilla de Resultados

```markdown
## 📊 RESULTADOS DE OPTIMIZACIÓN

### Lighthouse Score

| Métrica     | ANTES  | DESPUÉS | Mejora   |
| ----------- | ------ | ------- | -------- |
| Performance | 70     | \_\_\_  | +\_\_\_% |
| FCP         | 404ms  | \_\_\_  | -\_\_\_% |
| LCP         | 404ms  | \_\_\_  | -\_\_\_% |
| TTI         | 1500ms | \_\_\_  | -\_\_\_% |
| CLS         | 0.154  | \_\_\_  | -\_\_\_% |

### Bundle Size

| Asset         | ANTES  | DESPUÉS | Reducción |
| ------------- | ------ | ------- | --------- |
| main.js       | 150 KB | \_\_\_  | -\_\_\_%  |
| Total inicial | 150 KB | \_\_\_  | -\_\_\_%  |

### Imágenes

| Métrica          | ANTES  | DESPUÉS | Ahorro   |
| ---------------- | ------ | ------- | -------- |
| Total            | 169 MB | \_\_\_  | -\_\_\_% |
| Ejemplo (AML001) | 953 KB | \_\_\_  | -\_\_\_% |

### MongoDB Queries

| Métrica       | ANTES | DESPUÉS | Mejora   |
| ------------- | ----- | ------- | -------- |
| Query time    | 650ms | \_\_\_  | -\_\_\_% |
| Docs examined | 5000  | \_\_\_  | -\_\_\_% |

### Conclusión

- ✅ Performance mejorado: \_\_\_%
- ✅ Bundle reducido: \_\_\_%
- ✅ Imágenes optimizadas: \_\_\_%
- ✅ DB queries más rápidas: \_\_\_x
```

---

## 📸 PASO 8: Capturas de Pantalla

**Tomar screenshots de:**

1. ✅ Lighthouse report completo
2. ✅ Network tab mostrando bundles JS
3. ✅ Network tab mostrando imágenes WebP
4. ✅ Service Worker activado
5. ✅ MongoDB explain() output
6. ✅ Grafana dashboard con métricas
7. ✅ Performance tab de DevTools

---

## 🎯 Checklist Final

- [ ] Lighthouse score > 90
- [ ] FCP < 1.8s
- [ ] LCP < 2.5s
- [ ] CLS < 0.1
- [ ] Bundle inicial < 20KB
- [ ] Imágenes WebP cargando
- [ ] Service Worker activo
- [ ] Offline mode funcional
- [ ] MongoDB usando índices
- [ ] Query time < 20ms
- [ ] Grafana mostrando métricas
- [ ] Sin errores en consola
- [ ] Screenshots tomados
- [ ] Reporte documentado

---

## 📤 PASO 9: Generar Reporte Final

```bash
# Crear carpeta de resultados
mkdir -p results/$(date +%Y%m%d)

# Mover screenshots
mv *.png results/$(date +%Y%m%d)/

# Copiar lighthouse report
cp lighthouse-report.html results/$(date +%Y%m%d)/

# Exportar dashboard de Grafana
curl -u admin:admin123 \
  http://localhost:3000/api/dashboards/db/ecommerce-performance \
  > results/$(date +%Y%m%d)/grafana-dashboard.json

# Crear resumen
cat > results/$(date +%Y%m%d)/SUMMARY.md << 'EOF'
# Resultados de Optimización - Flores Victoria

Fecha: $(date)

## Métricas Principales
[Pegar aquí los resultados de la tabla]

## Screenshots
- lighthouse.png
- network-bundles.png
- network-webp.png
- grafana-dashboard.png

## Conclusión
[Escribir conclusión]
EOF

echo "✅ Reporte generado en: results/$(date +%Y%m%d)/"
```

---

## 🚀 Tips Adicionales

### Caché del Navegador

Para pruebas precisas, **siempre hacer hard reload**:

- **Ctrl+Shift+R** (Chrome/Firefox)
- O click derecho en reload → "Empty Cache and Hard Reload"

### Múltiples Pruebas

Ejecutar Lighthouse **3 veces** y promediar resultados para mayor precisión.

### Condiciones Consistentes

- Mismo hardware
- Mismo navegador
- Misma red
- Sin otras tabs abiertas

### Modo Incógnito

Usar **modo incógnito** para evitar interferencia de extensiones.

---

**¿Listo para medir?** Ejecuta `./deploy-optimized.sh` y sigue esta guía paso a paso.
