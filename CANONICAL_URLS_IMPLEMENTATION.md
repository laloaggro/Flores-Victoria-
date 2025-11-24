# 🔗 Implementación de Canonical URLs

## 📅 Fecha: 24 de noviembre de 2025

## 🎯 Objetivo
Agregar tags `<link rel="canonical">` a todas las páginas HTML para prevenir problemas de contenido duplicado y consolidar señales SEO.

---

## 📚 ¿Qué es una Canonical URL?

Una **canonical URL** indica a los motores de búsqueda cuál es la versión "oficial" o "preferida" de una página cuando existen múltiples URLs que muestran contenido similar o idéntico.

### Formato
```html
<link rel="canonical" href="https://flores-victoria.com/pages/catalog.html">
```

### ¿Por qué es importante?

✅ **Previene contenido duplicado**: Evita penalizaciones por páginas similares  
✅ **Consolida señales SEO**: Todos los backlinks se atribuyen a la URL canónica  
✅ **Mejora ranking**: Google sabe qué página indexar y rankear  
✅ **Unifica métricas**: Analytics más precisos sin duplicación  

---

## 🚨 Problemas que Resuelve

### Problema 1: Múltiples Versiones de URL

```
https://flores-victoria.com/index.html
https://flores-victoria.com/
https://www.flores-victoria.com/
http://flores-victoria.com/
```

**Solución**: Todas apuntan a `https://flores-victoria.com/`

### Problema 2: Query Parameters

```
/pages/catalog.html
/pages/catalog.html?sort=price
/pages/catalog.html?page=1
/pages/catalog.html?utm_source=facebook
```

**Solución**: Todas apuntan a `/pages/catalog.html`

### Problema 3: Trailing Slash

```
/pages/catalog.html
/pages/catalog.html/
```

**Solución**: Elegir una como canónica

---

## 📋 Estrategia de Implementación

### Reglas Generales

1. **Usar URLs absolutas**:
   ```html
   <!-- CORRECTO -->
   <link rel="canonical" href="https://flores-victoria.com/pages/catalog.html">
   
   <!-- INCORRECTO -->
   <link rel="canonical" href="/pages/catalog.html">
   ```

2. **Incluir protocolo HTTPS** (en producción):
   ```html
   <link rel="canonical" href="https://flores-victoria.com/">
   ```

3. **Sin trailing slash** (excepto homepage):
   ```html
   <!-- Homepage -->
   <link rel="canonical" href="https://flores-victoria.com/">
   
   <!-- Otras páginas -->
   <link rel="canonical" href="https://flores-victoria.com/pages/catalog.html">
   ```

4. **Ignorar query parameters** (generalmente):
   ```html
   <!-- URL actual: /catalog.html?page=2&sort=price -->
   <!-- Canonical apunta a versión sin params -->
   <link rel="canonical" href="https://flores-victoria.com/pages/catalog.html">
   ```

5. **Autocanonical** (página apunta a sí misma):
   - Sí, esto es correcto y recomendado
   - Previene futuros problemas si se agregan params

---

## 🗂️ Mapeo de URLs Canónicas

### Frontend Principal

| Archivo | Canonical URL |
|---------|---------------|
| `index.html` | `https://flores-victoria.com/` |
| `pages/catalog.html` | `https://flores-victoria.com/pages/catalog.html` |
| `pages/product-detail.html` | `https://flores-victoria.com/pages/product-detail.html?id=X` |
| `pages/cart.html` | `https://flores-victoria.com/pages/cart.html` |
| `pages/checkout.html` | `https://flores-victoria.com/pages/checkout.html` |
| `pages/account.html` | `https://flores-victoria.com/pages/account.html` |
| `pages/login.html` | `https://flores-victoria.com/pages/login.html` |
| `pages/register.html` | `https://flores-victoria.com/pages/register.html` |
| `pages/forgot-password.html` | `https://flores-victoria.com/pages/forgot-password.html` |
| `pages/contact.html` | `https://flores-victoria.com/pages/contact.html` |
| `pages/gallery.html` | `https://flores-victoria.com/pages/gallery.html` |
| `pages/wishlist.html` | `https://flores-victoria.com/pages/wishlist.html` |
| `pages/shipping-options.html` | `https://flores-victoria.com/pages/shipping-options.html` |
| `pages/faq.html` | `https://flores-victoria.com/pages/faq.html` |
| `pages/orders.html` | `https://flores-victoria.com/pages/orders.html` |
| `pages/profile.html` | `https://flores-victoria.com/pages/profile.html` |
| `pages/shipping.html` | `https://flores-victoria.com/pages/shipping.html` |
| `404.html` | `https://flores-victoria.com/404.html` |
| `offline.html` | `https://flores-victoria.com/offline.html` |

### Páginas Especiales

| Página | Canonical | Notas |
|--------|-----------|-------|
| `404.html` | **NO incluir canonical** | Google recomienda no usar canonical en páginas de error |
| `offline.html` | **NO incluir canonical** | Es una página funcional, no de contenido |
| `test-auth.html` | **NO incluir canonical** | Página de testing, debe tener `noindex` |
| `demo-microinteractions.html` | **Opcional** | Si es demo, considerar `noindex` |

---

## 🛠️ Implementación por Fases

### Fase 1: Páginas Estáticas (Canonical fijo)

Agregar canonical tag después de los meta tags existentes:

```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Flores Victoria</title>
    
    <!-- Meta tags existentes -->
    <meta name="description" content="...">
    <meta property="og:type" content="website">
    <!-- ... resto de meta tags ... -->
    
    <!-- ✨ NUEVO: Canonical URL -->
    <link rel="canonical" href="https://flores-victoria.com/pages/catalog.html">
    
    <!-- PWA -->
    <link rel="icon" href="/favicon.png">
    <!-- ... resto del HEAD ... -->
</head>
```

**Archivos a modificar (Batch 1)**:
- [x] index.html
- [ ] pages/catalog.html
- [ ] pages/cart.html
- [ ] pages/checkout.html
- [ ] pages/account.html

**Archivos a modificar (Batch 2)**:
- [ ] pages/login.html
- [ ] pages/register.html
- [ ] pages/forgot-password.html
- [ ] pages/contact.html
- [ ] pages/gallery.html

**Archivos a modificar (Batch 3)**:
- [ ] pages/wishlist.html
- [ ] pages/shipping-options.html
- [ ] pages/faq.html
- [ ] pages/orders.html
- [ ] pages/profile.html
- [ ] pages/shipping.html

---

### Fase 2: Páginas Dinámicas (Canonical dinámico)

Para páginas con parámetros (como `product-detail.html?id=1`), generar canonical dinámicamente:

#### Opción A: JavaScript en HEAD (Inline)

```html
<!-- En pages/product-detail.html -->
<script>
  // Generar canonical dinámicamente basado en URL actual
  (function() {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');
    
    if (productId) {
      const canonical = document.createElement('link');
      canonical.rel = 'canonical';
      canonical.href = `https://flores-victoria.com/pages/product-detail.html?id=${productId}`;
      document.head.appendChild(canonical);
    }
  })();
</script>
```

#### Opción B: Módulo JavaScript Reutilizable

**Crear**: `js/canonical-handler.js`

```javascript
/**
 * Canonical URL Handler
 * Genera y añade canonical tags dinámicamente
 */

const BASE_URL = 'https://flores-victoria.com';

/**
 * Establece canonical URL para la página actual
 * @param {string} path - Path relativo (ej: '/pages/catalog.html')
 * @param {Object} params - Query params a incluir (opcional)
 */
export function setCanonical(path, params = {}) {
  // Remover canonical existente si hay
  const existing = document.querySelector('link[rel="canonical"]');
  if (existing) {
    existing.remove();
  }
  
  // Construir URL
  let canonicalURL = `${BASE_URL}${path}`;
  
  // Agregar params si existen
  const paramString = new URLSearchParams(params).toString();
  if (paramString) {
    canonicalURL += `?${paramString}`;
  }
  
  // Crear e inyectar tag
  const link = document.createElement('link');
  link.rel = 'canonical';
  link.href = canonicalURL;
  document.head.appendChild(link);
  
  if (window.DEBUG) {
    console.log('✅ Canonical URL set:', canonicalURL);
  }
}

/**
 * Auto-establece canonical basado en URL actual
 * Ignora la mayoría de query params (utm_*, fbclid, etc.)
 */
export function autoSetCanonical() {
  const path = window.location.pathname;
  const params = new URLSearchParams(window.location.search);
  
  // Lista blanca de params a preservar en canonical
  const preserveParams = ['id', 'category', 'page'];
  const cleanParams = {};
  
  preserveParams.forEach(key => {
    if (params.has(key)) {
      cleanParams[key] = params.get(key);
    }
  });
  
  setCanonical(path, cleanParams);
}

// Auto-ejecución
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', autoSetCanonical);
} else {
  autoSetCanonical();
}
```

**Uso**:

```html
<!-- En product-detail.html -->
<script type="module">
  import { setCanonical } from '/js/canonical-handler.js';
  
  // Cuando se carga el producto
  const productId = new URLSearchParams(window.location.search).get('id');
  if (productId) {
    setCanonical('/pages/product-detail.html', { id: productId });
  }
</script>
```

---

### Fase 3: Canonical para Admin Panel

**Admin Panel** (`/admin-panel/*`) debe usar base URL diferente:

```html
<link rel="canonical" href="https://admin.flores-victoria.com/dashboard.html">
```

O si está en subdirectorio:

```html
<link rel="canonical" href="https://flores-victoria.com/admin/dashboard.html">
```

**Nota**: Admin panel generalmente debe tener `<meta name="robots" content="noindex, nofollow">` para no indexarse.

---

## 📝 Template de Canonical por Tipo de Página

### Homepage

```html
<!-- index.html -->
<link rel="canonical" href="https://flores-victoria.com/">
```

### Páginas de Contenido

```html
<!-- pages/catalog.html -->
<link rel="canonical" href="https://flores-victoria.com/pages/catalog.html">

<!-- pages/contact.html -->
<link rel="canonical" href="https://flores-victoria.com/pages/contact.html">
```

### Páginas con Filtros (sin incluir filtros en canonical)

```html
<!-- pages/catalog.html?category=roses&sort=price&page=2 -->
<!-- Canonical apunta a versión sin filtros -->
<link rel="canonical" href="https://flores-victoria.com/pages/catalog.html">
```

### Páginas de Producto (incluir ID)

```html
<!-- pages/product-detail.html?id=123 -->
<link rel="canonical" href="https://flores-victoria.com/pages/product-detail.html?id=123">
```

### Páginas de Usuario (incluir slug/ID)

```html
<!-- Si usuarios tienen perfiles públicos -->
<link rel="canonical" href="https://flores-victoria.com/pages/profile.html?user=johndoe">
```

### Páginas Privadas (sin canonical o con noindex)

```html
<!-- pages/account.html - área privada -->
<meta name="robots" content="noindex, nofollow">
<!-- No incluir canonical para páginas privadas -->
```

---

## 🔄 Casos Especiales

### 1. Paginación

**Opción A**: Self-referencing canonical (cada página apunta a sí misma)

```html
<!-- /pages/catalog.html?page=1 -->
<link rel="canonical" href="https://flores-victoria.com/pages/catalog.html?page=1">

<!-- /pages/catalog.html?page=2 -->
<link rel="canonical" href="https://flores-victoria.com/pages/catalog.html?page=2">
```

**Opción B**: Todas apuntan a página 1 (consolidar ranking)

```html
<!-- /pages/catalog.html?page=2 -->
<link rel="canonical" href="https://flores-victoria.com/pages/catalog.html">
```

**Recomendación**: Usar Opción A + rel="prev"/"next"

```html
<!-- Página 2 -->
<link rel="canonical" href="https://flores-victoria.com/pages/catalog.html?page=2">
<link rel="prev" href="https://flores-victoria.com/pages/catalog.html?page=1">
<link rel="next" href="https://flores-victoria.com/pages/catalog.html?page=3">
```

### 2. Filtros de Catálogo

```html
<!-- URL: /pages/catalog.html?category=roses&color=red&sort=price -->
<!-- Canonical: solo preservar category, ignorar sort -->
<link rel="canonical" href="https://flores-victoria.com/pages/catalog.html?category=roses">
```

### 3. Parámetros de Tracking

**SIEMPRE ignorar** en canonical:
- `utm_source`
- `utm_medium`
- `utm_campaign`
- `fbclid`
- `gclid`
- `ref`

```html
<!-- URL actual: /pages/catalog.html?utm_source=facebook&utm_campaign=spring -->
<!-- Canonical sin tracking params -->
<link rel="canonical" href="https://flores-victoria.com/pages/catalog.html">
```

### 4. Versiones AMP/Mobile

Si tuvieras versión AMP:

```html
<!-- En versión desktop -->
<link rel="canonical" href="https://flores-victoria.com/pages/product.html">
<link rel="amphtml" href="https://flores-victoria.com/pages/product.amp.html">

<!-- En versión AMP -->
<link rel="canonical" href="https://flores-victoria.com/pages/product.html">
```

**Nota**: Actualmente no tienes AMP, no aplicar.

---

## ✅ Checklist de Implementación

### Preparación
- [x] Definir dominio canónico: `https://flores-victoria.com`
- [x] Crear mapeo de URLs
- [ ] Decidir estrategia para query params

### Fase 1: Páginas Estáticas (15 páginas)
- [ ] index.html
- [ ] pages/catalog.html
- [ ] pages/cart.html
- [ ] pages/checkout.html
- [ ] pages/account.html
- [ ] pages/login.html
- [ ] pages/register.html
- [ ] pages/forgot-password.html
- [ ] pages/contact.html
- [ ] pages/gallery.html
- [ ] pages/wishlist.html
- [ ] pages/shipping-options.html
- [ ] pages/faq.html
- [ ] pages/orders.html
- [ ] pages/profile.html
- [ ] pages/shipping.html

### Fase 2: Canonical Dinámico
- [ ] Crear `js/canonical-handler.js`
- [ ] Integrar en pages/product-detail.html
- [ ] Integrar en pages/catalog.html (para filtros)
- [ ] Testing con diferentes query params

### Fase 3: Validación
- [ ] Verificar canonical en cada página (Chrome DevTools)
- [ ] Validar con: `document.querySelector('link[rel="canonical"]').href`
- [ ] Probar con diferentes query params
- [ ] Verificar que UTM params se ignoren
- [ ] Confirmar URLs absolutas (no relativas)

### Fase 4: Testing Avanzado
- [ ] Verificar en Google Search Console
- [ ] Revisar Coverage report (páginas indexadas)
- [ ] Confirmar que no hay warnings de canonical

---

## 🧪 Testing y Validación

### Test Manual en Chrome DevTools

```javascript
// Abrir Console (F12)

// 1. Verificar que existe canonical
const canonical = document.querySelector('link[rel="canonical"]');
console.log('Canonical found:', !!canonical);

// 2. Ver URL canonical
console.log('Canonical URL:', canonical?.href);

// 3. Verificar que es absoluta (incluye https://)
console.log('Is absolute:', canonical?.href.startsWith('https://'));

// 4. Comparar con URL actual
console.log('Current URL:', window.location.href);
console.log('Match:', canonical?.href === window.location.href);
```

### Test Automatizado

**Crear**: `tests/canonical-test.js`

```javascript
/**
 * Test de Canonical URLs
 * Ejecutar con: node tests/canonical-test.js
 */

const fs = require('fs');
const path = require('path');

const PAGES_DIR = path.join(__dirname, '../frontend/pages');
const BASE_URL = 'https://flores-victoria.com';

// Lista de páginas a verificar
const pages = [
  { file: '../frontend/index.html', expected: `${BASE_URL}/` },
  { file: 'catalog.html', expected: `${BASE_URL}/pages/catalog.html` },
  { file: 'cart.html', expected: `${BASE_URL}/pages/cart.html` },
  // ... más páginas
];

let passed = 0;
let failed = 0;

pages.forEach(({ file, expected }) => {
  const filePath = file.startsWith('../') 
    ? path.join(__dirname, file)
    : path.join(PAGES_DIR, file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ ${file} - File not found`);
    failed++;
    return;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const match = content.match(/<link rel="canonical" href="([^"]+)"/);
  
  if (!match) {
    console.log(`❌ ${file} - No canonical tag found`);
    failed++;
    return;
  }
  
  const canonical = match[1];
  
  if (canonical !== expected) {
    console.log(`❌ ${file}`);
    console.log(`   Expected: ${expected}`);
    console.log(`   Found: ${canonical}`);
    failed++;
  } else {
    console.log(`✅ ${file}`);
    passed++;
  }
});

console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
```

---

## 📊 Verificación en Google Search Console

### Después de Despliegue

1. **Index Coverage Report**:
   - Ir a: Search Console → Coverage
   - Verificar páginas indexadas vs canonical
   - No debe haber duplicados

2. **URL Inspection Tool**:
   - Inspeccionar URL específica
   - Ver "Canonical URL" detectada por Google
   - Debe coincidir con tu canonical tag

3. **Sitemaps**:
   - Enviar sitemap con URLs canónicas
   - Google preferirá URLs del sitemap

---

## 🚨 Troubleshooting

### Problema: Google ignora mi canonical

**Causas comunes**:
1. Canonical es relativa (debe ser absoluta)
2. Canonical apunta a 404
3. Canonical está después del contenido (debe estar en HEAD)
4. Hay múltiples canonical tags (solo debe haber 1)
5. Canonical en HTTP pero página es HTTPS

**Solución**: Verificar con Google URL Inspection Tool

### Problema: Páginas duplicadas en Search Console

**Causas**:
1. Canonical no implementado
2. Canonical incorrecta
3. Sitemap incluye URLs no canónicas

**Solución**:
```xml
<!-- sitemap.xml - solo incluir URLs canónicas -->
<url>
  <loc>https://flores-victoria.com/pages/catalog.html</loc>
  <!-- NO incluir: catalog.html?page=2 -->
</url>
```

### Problema: Canonical dinámica no se genera

**Verificar**:
```javascript
// Chrome Console
document.querySelectorAll('link[rel="canonical"]').length
// Debe ser exactamente 1
```

**Solución**: Revisar que script se ejecuta antes de que Google crawlee.

---

## 📈 Métricas de Éxito

### Antes de Canonical
- Páginas indexadas: ~30
- Páginas duplicadas: 5-10
- Señales SEO dispersas

### Después de Canonical (3-6 meses)
- Páginas indexadas: 25-30 (consolidadas)
- Páginas duplicadas: 0
- Ranking mejorado +10-15 posiciones para keywords principales

---

## 🔄 Mantenimiento

### Al Agregar Nueva Página

1. Agregar canonical tag en HEAD
2. Usar URL absoluta con HTTPS
3. Incluir en tests/canonical-test.js
4. Verificar en staging antes de producción

### Al Cambiar Estructura de URLs

1. Actualizar todos los canonical tags afectados
2. Configurar redirects 301 desde URLs antiguas
3. Enviar nuevo sitemap a Google
4. Monitorear en Search Console

---

## 📚 Recursos

- **Google Guide**: https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
- **Moz**: https://moz.com/learn/seo/canonicalization
- **Ahrefs**: https://ahrefs.com/blog/canonical-tags/

---

**Documento creado**: 24 de noviembre de 2025  
**Última actualización**: 24 de noviembre de 2025  
**Prioridad**: MEDIA-ALTA 🔥  
**Tiempo estimado**: 2-3 horas  
**Dificultad**: ⭐⭐☆☆☆

---

## 🚀 Próximo Paso

Después de implementar canonical URLs, continuar con:
1. **JSON-LD Structured Data** (ver `JSON_LD_IMPLEMENTATION_PLAN.md`)
2. **Open Graph Images** (crear 20 imágenes 1200×630px)
3. **Sitemap XML** (generar dinámicamente)
