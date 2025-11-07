# 🚀 Optimizaciones de Performance - Flores Victoria Frontend

**Última actualización**: 7 de Noviembre de 2025  
**Performance Score**: 72-77/100 (estimado) | Baseline: 56/100 (+35% mejora)

---

## 📊 Resumen Ejecutivo

Se implementaron **12 optimizaciones mayores** en 3 sprints, logrando:

- **Performance**: 56 → 72-77/100 (+35%)
- **CLS**: 0.203 → 0.003 (98.5% mejora)
- **FCP**: ~6.0s → ~4.8-5.0s (-1.2s, -20%)
- **LCP**: ~6.8s → ~5.8-6.0s (-1.0s, -14%)

---

## ✅ Optimizaciones Implementadas

### 1. Critical CSS Inline (Sprint 1)

**Commit**: `6fac0f7`  
**Impacto**: +3-5 puntos Performance

**Qué se hizo**:

- ✅ 70+ líneas CSS crítico inline en `<head>`
- ✅ Diferido `design-system.css` y `lazy-loading.css` con media print trick
- ✅ Removido link bloqueante duplicado de Font Awesome
- ✅ -3 recursos render-blocking

**Cómo mantenerlo**:

```html
<!-- Mantener este patrón para CSS no crítico -->
<link
  rel="preload"
  as="style"
  onload="this.onload=null;this.rel='stylesheet'"
  href="/css/archivo.css"
  media="print"
/>
```

---

### 2. Picture Element + WebP (Sprint 1)

**Commit**: `72bfff6`  
**Impacto**: +15-20 puntos en gallery.html

**Qué se hizo**:

- ✅ 12 imágenes gallery optimizadas con WebP q=80
- ✅ Picture element con fallback JPEG
- ✅ Responsive srcset (400w, 600w, 800w)
- ✅ Sizes attribute para layout hints

**Ejemplo**:

```html
<picture>
  <source
    srcset="image.webp?w=400 400w, image.webp?w=600 600w"
    sizes="(max-width: 640px) 100vw, 50vw"
    type="image/webp"
  />
  <img src="image.jpg?w=600" loading="lazy" alt="..." width="600" height="600" />
</picture>
```

**Cómo mantenerlo**:

- Usar WebP con quality 80 para balance calidad/tamaño
- Siempre incluir width/height para evitar CLS
- loading="lazy" para imágenes below-the-fold

---

### 3. Defer JavaScript (Sprint 1)

**Commit**: `2a51e9f`  
**Impacto**: +2-3 puntos Performance

**Qué se hizo**:

- ✅ `common-bundle.js` con defer
- ✅ Auth script diferido
- ✅ Modulepreload para dependencias críticas

**Scripts defer**:

```html
<script defer src="/js/components/common-bundle.js"></script>
```

---

### 4. Terser Minification (Sprint 1)

**Commit**: `d5bfd35`  
**Impacto**: -30-40% tamaño JS

**Configuración vite.config.js**:

```javascript
terserOptions: {
  compress: {
    drop_console: true,      // Quita console.log en prod
    drop_debugger: true,
    pure_funcs: ['console.log'],
    passes: 2                 // Múltiples pases optimización
  },
  mangle: { safari10: true }
}
```

**Cómo mantenerlo**:

- NO modificar vite.config.js sin probar build
- `npm run build` antes de cada deploy

---

### 5. Font Subsetting + Optimizations (Sprint 1)

**Commit**: `d5bfd35`  
**Impacto**: -2 weights, faster font loading

**Qué se hizo**:

- ✅ Reducido weights: Playfair (400,600,700) | Poppins (400,500,600)
- ✅ display=optional para mejor FCP (actualizado Sprint 2)
- ✅ Async loading con preload

**Google Fonts URL**:

```
?family=Playfair+Display:wght@400;600;700&family=Poppins:wght@400;500;600&display=optional
```

**Cómo mantenerlo**:

- NO agregar más weights sin justificación
- `display=optional` previene flash invisible text (FOIT)

---

### 6. Lazy Load Observer (Sprint 1)

**Commit**: `d5bfd35`  
**Impacto**: Reduce payload inicial

**Qué se hizo**:

- ✅ IntersectionObserver integrado en common-bundle.js
- ✅ Carga imágenes solo cuando visibles
- ✅ 50px margin para preload suave

**Uso**:

```html
<img data-src="image.jpg" alt="..." class="lazy-load" />
```

---

### 7. Resource Hints Avanzados (Sprint 2)

**Commit**: `85c30d0`  
**Impacto**: +1-2 puntos, navegación -50-100ms

**Qué se hizo**:

```html
<!-- Preconnect para imágenes externas -->
<link rel="preconnect" href="https://images.unsplash.com" />
<link rel="dns-prefetch" href="https://images.unsplash.com" />

<!-- Prefetch navegación anticipada -->
<link rel="prefetch" href="/pages/products.html" as="document" />
<link rel="prefetch" href="/pages/gallery.html" as="document" />
```

**Cómo mantenerlo**:

- Agregar preconnect para dominios externos críticos
- Prefetch solo para páginas con alta probabilidad de navegación

---

### 8. Service Worker Offline-First (Sprint 2)

**Commit**: `85c30d0`  
**Impacto**: +5-10 puntos, repeat visits ~80% faster

**Archivo**: `/public/sw.js` (existente, versión v2.0.0)  
**Registro**: `/src/main.js` (automático en window.load)

**Estrategias de Cache**:

1. **Static Assets** (CSS/JS/fonts): Cache First
2. **HTML/API**: Network First con fallback
3. **Images**: Stale While Revalidate

**Límites**:

- Imágenes: 50 max
- Recursos dinámicos: 30 max

**Cómo actualizar**:

1. Cambiar `CACHE_VERSION` en sw.js
2. Service Worker auto-detecta y actualiza
3. Usuario recarga para activar

**Validar**:

```
DevTools → Application → Service Workers
```

---

### 9. Compresión Brotli/Gzip (Sprint 2)

**Commit**: `85c30d0` (validado)  
**Impacto**: +1 punto, -84-86% transferencias

**Resultados**:

- `style.css`: 72KB → 9.8KB Brotli (86.4%)
- `catalog.html`: 55KB → 8.5KB Brotli (84.5%)

**Configuración vite.config.js**:

```javascript
viteCompression({
  algorithm: 'brotliCompress',
  ext: '.br',
  threshold: 10240, // 10KB threshold
});
```

**Cómo mantenerlo**:

- Build genera automáticamente .br y .gz
- Server debe servir versión comprimida si browser soporta

---

### 10. Font Display Optional (Sprint 2)

**Commit**: Pendiente  
**Impacto**: FCP -100-200ms

**Qué se hizo**:

- ✅ Cambiado `display=swap` → `display=optional`
- ✅ Mejor FCP (no bloquea render esperando fonts)

**Trade-off**:

- ✅ Pro: FCP más rápido
- ⚠️ Con: Puede no cargar fuentes en conexiones lentas

---

---

### 11. Preload LCP Image (Sprint 3)

**Commit**: `d5ceabb`  
**Impacto**: LCP -200-400ms, +1-2 puntos Performance

**Qué se hizo**:

- ✅ Preload de imagen hero/LCP: `/images/categories/bouquets-ai.webp`
- ✅ `fetchpriority="high"` para prioridad máxima
- ✅ Type attribute: `type="image/webp"`

**Código**:

```html
<!-- En <head>, después de preload CSS -->
<link
  rel="preload"
  as="image"
  href="/images/categories/bouquets-ai.webp"
  type="image/webp"
  fetchpriority="high"
/>
```

**Cómo mantenerlo**:

- Identificar imagen LCP con DevTools → Performance → Largest Contentful Paint
- Preload solo la imagen crítica (hero/above-the-fold)
- Usar fetchpriority="high" solo para recursos críticos (máximo 2-3)

---

### 12. Bundle Analyzer (Sprint 3)

**Commit**: `d5ceabb`  
**Impacto**: Visibilidad de bundle size, oportunidades de optimización

**Qué se hizo**:

- ✅ Instalado `rollup-plugin-visualizer` (23 packages)
- ✅ Configurado treemap visual en `vite.config.js`
- ✅ Genera `dist/bundle-analysis.html` en cada build

**Configuración** (`vite.config.js`):

```javascript
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    // En producción
    visualizer({
      filename: 'dist/bundle-analysis.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
      template: 'treemap',
    }),
  ],
});
```

**Cómo usarlo**:

```bash
npm run build
# Abrir dist/bundle-analysis.html en navegador
# Identificar chunks grandes para code splitting
```

**Próximo paso**: Code splitting basado en rutas si hay chunks > 200KB

## 📈 Core Web Vitals - Before/After

| Métrica         | Baseline | Sprint 2  | Sprint 3  | Mejora Total |
| --------------- | -------- | --------- | --------- | ------------ |
| **Performance** | 56/100   | 70-75/100 | 72-77/100 | +35% ✅      |
| **CLS**         | 0.203    | 0.003     | 0.003     | 98.5% ✅     |
| **FCP**         | ~6.0s    | ~5.0s     | ~4.8-5.0s | -20% ✅      |
| **LCP**         | ~6.8s    | ~6.2s     | ~5.8-6.0s | -14% ✅      |
| **TBT**         | ~87ms    | ~87ms     | ~87ms     | Estable      |

---

## 🔧 Cómo Validar Optimizaciones

### 1. Service Worker

```bash
# Abrir DevTools → Application → Service Workers
# Debe mostrar: "Status: activated and is running"
```

### 2. Lighthouse Audit

```bash
cd frontend
npx lighthouse http://localhost:5173 --view
```

### 3. Build de Producción

```bash
npm run build
# Verificar archivos .br y .gz en dist/
ls -lh dist/**/*.{br,gz}
```

### 4. Network Tab (DevTools)

- Verify Brotli: Response Headers → `content-encoding: br`
- Check SW cache: Disable cache, reload, check "from ServiceWorker"

---

## 🚀 Próximas Optimizaciones (Opcionales)

### High Impact

1. **CDN para Assets Estáticos** (+5-10 puntos)
   - Cloudflare/Netlify CDN
   - Edge caching global

2. **HTTP/2 Server Push** (+2-3 puntos)
   - Push CSS/JS crítico
   - Requiere server config

3. **Image CDN con auto-optimization** (+3-5 puntos)
   - Cloudinary/Imgix
   - Auto WebP/AVIF

### Medium Impact

4. **Code Splitting avanzado** (+2-3 puntos)
   - Dynamic imports por ruta
   - Route-based chunking

5. **Critical CSS automático** (+1-2 puntos)
   - critical package en build
   - Por página específica

### Low Impact (refinamiento)

6. **Font Awesome Subsetting** (+1-2 puntos)
   - 67 iconos únicos usados (~4% total)
   - Generar subset personalizado
   - Reducción estimada: -200KB

7. **Resource Hints DNS prefetch adicionales** (+0.5 puntos)
   - Más dominios externos

---

## 📝 Checklist Pre-Deploy

- [ ] `npm run build` exitoso
- [ ] Verificar archivos .br/.gz generados
- [ ] Service Worker version actualizada
- [ ] Lighthouse audit ≥70/100
- [ ] Tests passing (401/401)
- [ ] Git commit con mensaje descriptivo

---

## 🐛 Troubleshooting

### Service Worker no se registra

```javascript
// Verificar en consola
navigator.serviceWorker.getRegistrations().then(console.log);
```

### Build falla con URI malformed

- Verificar que Google Fonts URL no tenga caracteres especiales
- Usar solo `display=optional` sin parámetro `text=`

### Lighthouse Chrome interstitial error

- Problema conocido con Lighthouse + Vite dev server
- Usar PageSpeed Insights online: https://pagespeed.web.dev/
- O hacer audit en build de producción

### CSS no carga (media print trick)

```html
<!-- Verificar que tenga onload -->
<link rel="preload" as="style" onload="this.onload=null;this.rel='stylesheet'" href="..." />
```

---

## 📚 Referencias

- [Web.dev - Optimize Web Vitals](https://web.dev/vitals/)
- [MDN - Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Vite - Build Optimizations](https://vitejs.dev/guide/build.html)
- [Google Fonts - display parameter](https://developers.google.com/fonts/docs/css2#use_font-display)

---

**Mantenido por**: Equipo de Desarrollo  
**Última revisión**: Sprint 2 - Nov 7, 2025
