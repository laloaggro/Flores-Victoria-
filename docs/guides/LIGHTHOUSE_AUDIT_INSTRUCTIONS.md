# 🔍 Instrucciones para Ejecutar Lighthouse Audit

## 📅 Fecha: 24 de noviembre de 2025

## 🎯 Objetivo
Ejecutar auditorías de Lighthouse en las páginas principales del frontend para obtener scores de Performance, Accessibility, Best Practices, SEO y PWA.

---

## 🚀 Pasos para Ejecutar

### 1. Verificar que el Frontend esté Corriendo

```bash
# Verificar estado
docker compose -f docker-compose.dev-simple.yml ps frontend

# Si no está corriendo, iniciar
docker compose -f docker-compose.dev-simple.yml up -d frontend

# Verificar que responde
curl http://localhost:5173/
```

**URL del frontend**: `http://localhost:5173/`

---

### 2. Abrir Chrome DevTools

1. **Abrir Google Chrome** o **Chromium**
2. Navegar a: `http://localhost:5173/`
3. **Abrir DevTools**:
   - Presionar `F12`, o
   - `Ctrl + Shift + I` (Linux/Windows), o
   - `Cmd + Option + I` (Mac), o
   - Click derecho → "Inspeccionar"

---

### 3. Configurar Lighthouse

1. **Click en la pestaña "Lighthouse"** (última pestaña a la derecha)
   - Si no la ves, puede estar en el menú `>>` (más opciones)

2. **Configurar opciones**:

   **Mode**: 
   - ✅ Seleccionar: **"Navigation (Default)"**

   **Device**:
   - Ejecutar DOS auditorías separadas:
     - Primera: ✅ **Desktop**
     - Segunda: ✅ **Mobile**

   **Categories** (seleccionar TODAS):
   - ✅ Performance
   - ✅ Accessibility
   - ✅ Best Practices
   - ✅ SEO
   - ✅ Progressive Web App

   **Throttling**:
   - Para localhost: **"No throttling"** (resultados más rápidos)
   - Para staging/producción: **"Simulated throttling"** (más realista)

3. **Click en "Analyze page load"**

---

### 4. Esperar Resultados

- ⏱️ El análisis toma **30-90 segundos**
- No cambies de pestaña mientras se ejecuta
- Verás un indicador de progreso

---

### 5. Revisar Resultados

Lighthouse mostrará 5 scores (0-100):

```
Performance       [█████████░] 85/100  🟡
Accessibility     [██████████] 95/100  🟢
Best Practices    [█████████░] 88/100  🟡
SEO              [██████████] 97/100  🟢
Progressive Web App [████████░░] 75/100  🟡
```

**Colores**:
- 🟢 Verde (90-100): Excelente
- 🟡 Amarillo (50-89): Mejorable
- 🔴 Rojo (0-49): Necesita atención

---

### 6. Explorar Métricas Detalladas

#### Performance Metrics

Expandir sección "Performance" para ver:

- **First Contentful Paint (FCP)**: < 1.8s 🟢
- **Largest Contentful Paint (LCP)**: < 2.5s 🟢
- **Total Blocking Time (TBT)**: < 200ms 🟢
- **Cumulative Layout Shift (CLS)**: < 0.1 🟢
- **Speed Index**: < 3.4s 🟢

#### Accessibility Issues

- Click en "Accessibility" → Ver lista de issues detectados
- Cada issue tiene:
  - Descripción del problema
  - Elementos afectados
  - Sugerencias de corrección

#### SEO Issues

- Revisar "SEO" → Ver problemas encontrados
- Común: meta description, title, links crawleables

#### Best Practices

- Errores en consola
- Librerías vulnerables
- HTTPS (no aplica en localhost)
- Aspect ratio de imágenes

---

### 7. Guardar Reporte

**Opción A: Exportar HTML**

1. Click en ⚙️ (gear icon) arriba a la derecha
2. Seleccionar "Save as HTML"
3. Guardar en: `flores-victoria/reports/lighthouse/`

**Nombre sugerido**:
```
lighthouse-[page]-[device]-[date].html

Ejemplos:
lighthouse-home-desktop-20251124.html
lighthouse-catalog-mobile-20251124.html
```

**Opción B: Copiar JSON**

1. Click en ⚙️ → "Copy JSON"
2. Guardar en archivo `.json`

---

### 8. Repetir para Todas las Páginas

Ejecutar Lighthouse en **5 páginas prioritarias**, **2 devices cada una** = **10 auditorías**

#### Páginas a Auditar (Prioridad ALTA)

1. **Home**
   - URL: `http://localhost:5173/`
   - Desktop: [ ] | Mobile: [ ]

2. **Catálogo**
   - URL: `http://localhost:5173/pages/catalog.html`
   - Desktop: [ ] | Mobile: [ ]

3. **Producto**
   - URL: `http://localhost:5173/pages/product-detail.html?id=1`
   - Desktop: [ ] | Mobile: [ ]

4. **Carrito**
   - URL: `http://localhost:5173/pages/cart.html`
   - Desktop: [ ] | Mobile: [ ]

5. **Checkout**
   - URL: `http://localhost:5173/pages/checkout.html`
   - Desktop: [ ] | Mobile: [ ]

---

## 📊 Plantilla para Documentar Resultados

Crear archivo: `LIGHTHOUSE_RESULTS.md`

```markdown
# 📊 Resultados de Lighthouse Audit

**Fecha**: 24 de noviembre de 2025
**Entorno**: Localhost (docker-compose.dev-simple.yml)
**Chrome Version**: [tu versión]

## Resumen Ejecutivo

| Página | Device | Perf | A11y | BP | SEO | PWA |
|--------|--------|------|------|----|-----|-----|
| Home | Desktop | 85 | 95 | 88 | 97 | 75 |
| Home | Mobile | 72 | 95 | 88 | 97 | 75 |
| Catálogo | Desktop | ? | ? | ? | ? | ? |
| Catálogo | Mobile | ? | ? | ? | ? | ? |
| ... | ... | ... | ... | ... | ... | ... |

## Detalles por Página

### 1. Home (index.html)

#### Desktop
- **Performance**: 85/100 🟡
  - FCP: 0.8s 🟢
  - LCP: 1.2s 🟢
  - TBT: 150ms 🟢
  - CLS: 0.05 🟢
  - Speed Index: 2.1s 🟢
  
- **Accessibility**: 95/100 🟢
  - Issues: 2 menores
    1. [Descripción issue 1]
    2. [Descripción issue 2]

- **Best Practices**: 88/100 🟡
  - Issues: 3 menores
    1. [Descripción]

- **SEO**: 97/100 🟢
  - Excelente implementación de meta tags ✅

- **PWA**: 75/100 🟡
  - Service Worker: ✅ Registrado
  - Manifest: ✅ Válido
  - Installable: ⚠️ Revisar

#### Mobile
- **Performance**: 72/100 🟡
  - [Mismas métricas pero para mobile]

[Repetir para cada página...]
```

---

## 🎯 Scores Objetivo vs Actuales

| Categoría | Actual Estimado | Objetivo Corto Plazo | Objetivo Largo Plazo |
|-----------|-----------------|----------------------|---------------------|
| Performance | ~75 | 85+ | 90+ |
| Accessibility | 95 ✅ | 95+ | 98+ |
| Best Practices | ~85 | 90+ | 95+ |
| SEO | 97 ✅ | 98+ | 100 |
| PWA | ~70 | 80+ | 90+ |

---

## 🔧 Mejoras Comunes Esperadas

### Performance

**Problemas típicos en localhost**:
1. ❌ Imágenes sin optimizar (sin WebP)
2. ❌ CSS/JS sin minificar
3. ❌ Sin compresión gzip/brotli
4. ⚠️ Fonts bloqueando renderizado

**Soluciones**:
- Convertir imágenes a WebP
- Implementar lazy loading completo
- Minificar assets en producción
- Usar font-display: swap

### Best Practices

**Problemas típicos**:
1. ⚠️ Console errors/warnings
2. ❌ HTTP en localhost (usar HTTPS en prod)
3. ⚠️ Librerías desactualizadas

**Soluciones**:
- Limpiar console.log en producción
- Configurar HTTPS en staging/producción
- Actualizar dependencias

### PWA

**Problemas típicos**:
1. ⚠️ Service Worker no cachea todos los recursos
2. ⚠️ Offline page incompleta
3. ⚠️ Manifest falta algunos campos

**Soluciones**:
- Revisar sw-register.js
- Mejorar offline.html
- Completar manifest.json

---

## 📱 Diferencias Desktop vs Mobile

**Mobile típicamente tendrá scores más bajos porque**:
- CPU más lenta (simulada)
- Red más lenta (3G simulado)
- Viewport más pequeño
- Interacciones táctiles (tamaño de botones)

**Es normal ver**:
- Performance: -10 a -20 puntos en mobile
- Accessibility: Similar
- SEO: Similar
- PWA: Similar o mejor

---

## 🚨 Troubleshooting

### Problema: Lighthouse no aparece en DevTools

**Solución**:
1. Actualizar Chrome a última versión
2. Cerrar y reabrir DevTools
3. Buscar en menú `>>` (más opciones)
4. Alternativa: Usar extensión "Lighthouse" de Chrome Web Store

### Problema: Error "Page unresponsive"

**Solución**:
1. Recargar página
2. Cerrar otras pestañas
3. Aumentar timeout en configuración avanzada
4. Usar modo incógnito

### Problema: Scores muy bajos inesperados

**Verificar**:
1. No tengas otras apps pesadas corriendo
2. Frontend realmente responde: `curl http://localhost:5173/`
3. No hay errores en console del navegador
4. Usar "No throttling" para localhost

### Problema: No puedo guardar reporte

**Solución**:
```bash
# Crear carpeta de reportes
mkdir -p /home/impala/Documentos/Proyectos/flores-victoria/reports/lighthouse

# Verificar permisos
ls -la reports/
```

---

## 🎬 Video Tutorial (Opcional)

Si prefieres ver un video tutorial:

1. **Official Google Tutorial**:
   - https://www.youtube.com/watch?v=VyaHwvPWuZU

2. **En español**:
   - https://www.youtube.com/results?search_query=lighthouse+tutorial+español

---

## ✅ Checklist de Ejecución

- [ ] Frontend corriendo en `http://localhost:5173/`
- [ ] Chrome DevTools abierto
- [ ] Lighthouse configurado (todas las categorías)
- [ ] Auditoría Desktop de Home ejecutada
- [ ] Auditoría Mobile de Home ejecutada
- [ ] Auditoría Desktop de Catálogo ejecutada
- [ ] Auditoría Mobile de Catálogo ejecutada
- [ ] Auditoría Desktop de Producto ejecutada
- [ ] Auditoría Mobile de Producto ejecutada
- [ ] Auditoría Desktop de Carrito ejecutada
- [ ] Auditoría Mobile de Carrito ejecutada
- [ ] Auditoría Desktop de Checkout ejecutada
- [ ] Auditoría Mobile de Checkout ejecutada
- [ ] Reportes guardados en `reports/lighthouse/`
- [ ] Resultados documentados en `LIGHTHOUSE_RESULTS.md`
- [ ] Issues identificados priorizados

---

## 🚀 Próximos Pasos Después del Audit

1. **Analizar resultados**:
   - Identificar patrones comunes
   - Priorizar issues críticos
   - Crear plan de acción

2. **Implementar mejoras**:
   - Comenzar por issues fáciles (quick wins)
   - Performance: Optimizar imágenes
   - A11y: Corregir labels/alt text faltantes
   - SEO: Ya está al 97% ✅

3. **Re-auditar**:
   - Después de cada mejora, re-ejecutar Lighthouse
   - Comparar scores antes/después
   - Documentar progreso

4. **Validación externa**:
   - Desplegar a staging
   - Ejecutar Facebook Debugger
   - Ejecutar Twitter Card Validator
   - Ver `EXTERNAL_VALIDATION_GUIDE.md`

---

## 📚 Recursos Adicionales

- **Documentación oficial**: https://developer.chrome.com/docs/lighthouse/
- **Web.dev**: https://web.dev/measure/
- **PageSpeed Insights**: https://pagespeed.web.dev/
- **Lighthouse scoring guide**: https://web.dev/performance-scoring/

---

**Documento creado**: 24 de noviembre de 2025  
**Última actualización**: 24 de noviembre de 2025  
**Tiempo estimado**: 45-60 minutos para completar todas las auditorías  
**Dificultad**: Fácil ⭐☆☆☆☆

---

## 💡 Consejo Final

> "No obsesionarse con scores perfectos. Un score de 85+ en todas las categorías ya es excelente. Focus en UX real más que en números."

¡Buena suerte con el audit! 🚀
