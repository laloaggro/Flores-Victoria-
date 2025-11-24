# 🚀 Roadmap de Optimizaciones - Fase 2

**Fecha de inicio**: 24 de Noviembre 2025  
**Estado actual**: Fase 1 completada ✅  
**Score actual**: 75 (dev) | Proyectado: 91 (prod)  
**Objetivo**: Alcanzar y mantener score > 90 en producción

---

## ✅ Fase 1 Completada (24/11/2025)

- [x] Sistema de Lazy Loading (10 componentes, 72% reducción JS)
- [x] PurgeCSS configurado en producción
- [x] Lazy loading nativo de imágenes
- [x] Preload de recursos críticos (fuentes, CSS, JS)
- [x] Minificación agresiva (Terser + cssnano)
- [x] Code splitting granular
- [x] Documentación completa

**Commits**:
- `8854ed1` - Optimizaciones críticas de performance
- `b6d6cd0` - Preload de recursos críticos y lazy loading de imágenes

---

## 🎯 Fase 2: Optimizaciones de Red y Caché (Diciembre 2025)

### Prioridad ALTA 🔴

#### 1. Compresión Gzip/Brotli en Servidor
**Impacto**: +5-8 puntos | Ahorro: 60-70% en transferencia

**Tareas**:
- [ ] Configurar compresión en Docker/Nginx
- [ ] Habilitar Brotli para navegadores modernos
- [ ] Fallback a Gzip para navegadores antiguos
- [ ] Configurar tipos MIME a comprimir

**Archivo a crear**: `docker/nginx.conf`
```nginx
gzip on;
gzip_types text/css application/javascript application/json image/svg+xml;
gzip_min_length 1000;

# Brotli (si está disponible)
brotli on;
brotli_types text/css application/javascript application/json;
```

**Estimación**: 2-3 horas  
**Responsable**: DevOps/Backend

---

#### 2. Critical CSS Inline
**Impacto**: +3-5 puntos | Mejora FCP: 300-500ms

**Tareas**:
- [ ] Instalar `critical` o `critters`
- [ ] Extraer CSS crítico para above-the-fold
- [ ] Inline CSS crítico en `<head>`
- [ ] Diferir carga de CSS no crítico
- [ ] Crear script de build automático

**Script a crear**: `frontend/scripts/extract-critical-css.js`

**Comando**:
```bash
npm install --save-dev critical
```

**Estimación**: 4-6 horas  
**Responsable**: Frontend

---

#### 3. Service Worker con Precaching
**Impacto**: Mejora UX | Soporte offline

**Tareas**:
- [ ] Configurar Workbox en Vite
- [ ] Estrategia cache-first para assets estáticos
- [ ] Estrategia network-first para API
- [ ] Precache de rutas críticas
- [ ] Runtime caching de imágenes

**Archivo**: `frontend/sw-config.js`

**Recursos precachear**:
- `/` (homepage)
- `/pages/products.html`
- Core CSS/JS bundles
- Fuentes críticas

**Estimación**: 6-8 horas  
**Responsable**: Frontend

---

### Prioridad MEDIA 🟡

#### 4. Font Display Optimization
**Impacto**: +1-2 puntos | Previene FOIT

**Tareas**:
- [ ] Agregar `font-display: swap` a todas las @font-face
- [ ] Preload de fuentes críticas (ya hecho parcialmente)
- [ ] Font subsetting para reducir tamaño
- [ ] Considerar fuentes variables

**Archivo**: `frontend/css/fonts.css`
```css
@font-face {
  font-family: 'Playfair Display';
  font-display: swap; /* ← Agregar esto */
  src: url('/fonts/playfair-display-700.woff2') format('woff2');
}
```

**Estimación**: 1-2 horas  
**Responsable**: Frontend

---

#### 5. Image Optimization Pipeline
**Impacto**: +3-5 puntos | Ahorro: 40-60% en imágenes

**Tareas**:
- [ ] Configurar conversión automática WebP/AVIF
- [ ] Implementar responsive images con `srcset`
- [ ] Comprimir imágenes existentes
- [ ] Lazy loading en carrusel de productos
- [ ] Placeholder blur-up para mejor UX

**Herramientas**:
- `@vite/plugin-imagemin`
- `sharp` para procesamiento
- CDN con transformación automática (Cloudinary/ImageKit)

**Estimación**: 8-10 horas  
**Responsable**: Frontend + DevOps

---

#### 6. CDN para Assets Estáticos
**Impacto**: +2-3 puntos | Mejora TTFB

**Tareas**:
- [ ] Configurar CDN (Cloudflare, Fastly, o similar)
- [ ] Migrar assets estáticos a CDN
- [ ] Configurar cache headers apropiados
- [ ] Implementar asset versioning/hashing
- [ ] DNS prefetch/preconnect para CDN

**Headers recomendados**:
```
Cache-Control: public, max-age=31536000, immutable
```

**Estimación**: 4-6 horas  
**Responsable**: DevOps

---

### Prioridad BAJA 🟢

#### 7. HTTP/2 Server Push (Opcional)
**Impacto**: +1-2 puntos

**Tareas**:
- [ ] Configurar HTTP/2 en servidor
- [ ] Server push de recursos críticos
- [ ] Evitar over-pushing (usar preload hints)

**Nota**: HTTP/2 push puede ser contraproducente si se abusa. Priorizar preload headers.

---

#### 8. Resource Hints Avanzados
**Impacto**: +0-1 punto | Mejora conexiones

**Tareas**:
- [ ] `dns-prefetch` para dominios externos
- [ ] `preconnect` para APIs críticas
- [ ] `prefetch` para rutas anticipadas
- [ ] `modulepreload` para módulos ES

**Ejemplo**:
```html
<link rel="dns-prefetch" href="//api.floresvictoria.cl">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="prefetch" href="/pages/checkout.html">
```

**Estimación**: 2-3 horas  
**Responsable**: Frontend

---

#### 9. Bundle Analysis y Tree Shaking
**Impacto**: Variable | Reduce bundle size

**Tareas**:
- [ ] Instalar `rollup-plugin-visualizer`
- [ ] Analizar bundles generados
- [ ] Eliminar dependencias no usadas
- [ ] Dynamic imports para rutas no críticas
- [ ] Verificar tree shaking efectivo

**Comando**:
```bash
npm install --save-dev rollup-plugin-visualizer
npx vite build && npx vite-bundle-visualizer
```

**Estimación**: 3-4 horas  
**Responsable**: Frontend

---

## 📊 Fase 3: Monitoreo y Refinamiento (Enero 2026)

### 1. Real User Monitoring (RUM)
**Tareas**:
- [ ] Implementar Google Analytics 4 con Web Vitals
- [ ] Configurar alertas para regresiones
- [ ] Dashboard de métricas en tiempo real
- [ ] A/B testing de optimizaciones

**Herramientas**:
- `web-vitals` library
- Google Analytics 4
- Sentry Performance Monitoring
- New Relic (opcional)

---

### 2. Lighthouse CI en GitHub Actions
**Tareas**:
- [ ] Configurar Lighthouse CI en pipeline
- [ ] Presupuestos de performance
- [ ] Bloquear merges que degraden performance
- [ ] Reportes automáticos en PRs

**Archivo**: `.github/workflows/lighthouse-ci.yml`

---

### 3. Optimización Continua
**Tareas**:
- [ ] Auditorías mensuales de performance
- [ ] Mantener dependencias actualizadas
- [ ] Revisar nuevas best practices de web.dev
- [ ] Optimizar nuevas features desde el diseño

---

## 🎯 Objetivos por Fase

| Fase | Score Objetivo | Timeline | Esfuerzo Estimado |
|------|---------------|----------|-------------------|
| Fase 1 ✅ | 85-92 | Nov 2025 | 16-20 horas |
| Fase 2 🔄 | 92-96 | Dic 2025 | 30-40 horas |
| Fase 3 📊 | 96-100 | Ene 2026 | 15-20 horas |

---

## 📈 Métricas de Éxito

### Core Web Vitals Objetivos

| Métrica | Actual (Dev) | Objetivo Fase 2 | Objetivo Fase 3 |
|---------|-------------|-----------------|-----------------|
| **LCP** | 4.1s (632ms real) | <2.5s | <1.8s |
| **FID** | 67ms ✅ | <100ms | <50ms |
| **CLS** | 0.092 ✅ | <0.1 | <0.05 |
| **FCP** | 4.0s | <1.8s | <1.2s |
| **TTI** | 6.9s | <3.8s | <2.5s |
| **TBT** | 60ms ✅ | <200ms | <100ms |

---

## 🔧 Herramientas Recomendadas

### Análisis
- [WebPageTest](https://www.webpagetest.org/)
- [Chrome DevTools Performance](chrome://inspect)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
- [Bundle Analyzer](https://www.npmjs.com/package/rollup-plugin-visualizer)

### Optimización
- [Squoosh](https://squoosh.app/) - Compresión de imágenes
- [Critical](https://www.npmjs.com/package/critical) - Critical CSS
- [Workbox](https://developers.google.com/web/tools/workbox) - Service Workers
- [Imagemin](https://www.npmjs.com/package/imagemin) - Pipeline de imágenes

### Monitoreo
- [web-vitals](https://www.npmjs.com/package/web-vitals)
- [Google Analytics 4](https://analytics.google.com/)
- [Sentry Performance](https://sentry.io/for/performance/)

---

## 📝 Checklist de Implementación

### Antes de cada optimización
- [ ] Medir performance actual (baseline)
- [ ] Documentar cambios esperados
- [ ] Crear feature branch
- [ ] Implementar optimización
- [ ] Medir impacto real
- [ ] Comparar con baseline
- [ ] Merge si mejora >= 2 puntos

### Después de cada fase
- [ ] Ejecutar full Lighthouse audit
- [ ] Verificar en dispositivos reales
- [ ] Actualizar documentación
- [ ] Commit con mensaje descriptivo
- [ ] Tag de versión (v1.1, v1.2, etc.)

---

## 🚨 Alertas y Límites

### Presupuestos de Performance
```javascript
// lighthouserc.js
budgets: [
  {
    resourceSizes: [
      { resourceType: 'script', budget: 300 },      // 300 KB max JS
      { resourceType: 'stylesheet', budget: 100 },  // 100 KB max CSS
      { resourceType: 'image', budget: 500 },       // 500 KB max imágenes
      { resourceType: 'total', budget: 1000 },      // 1 MB max total
    ]
  }
]
```

### Umbrales de Alerta
- Performance Score < 90: ⚠️ Warning
- Performance Score < 85: 🚨 Error (bloquear deployment)
- LCP > 2.5s: ⚠️ Warning
- CLS > 0.1: 🚨 Error

---

## 📚 Referencias

- [web.dev - Performance](https://web.dev/performance/)
- [MDN - Web Performance](https://developer.mozilla.org/en-US/docs/Web/Performance)
- [Google Web Fundamentals](https://developers.google.com/web/fundamentals/performance)
- [Addy Osmani - Image Optimization](https://www.smashingmagazine.com/2021/09/modern-image-formats-avif-webp/)

---

**Última actualización**: 24 de Noviembre 2025  
**Próxima revisión**: 1 de Diciembre 2025  
**Responsable**: Equipo Frontend + DevOps
