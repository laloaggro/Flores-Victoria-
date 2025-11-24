# ✅ Checklist de Validación SEO Externa - Flores Victoria

## 🎯 Objetivo

Validar la implementación SEO con herramientas oficiales externas para asegurar que todo está correcto antes de ir a producción.

---

## 📋 Herramientas de Validación

### 1. Schema.org Validator ⭐⭐⭐⭐⭐

**URL**: https://validator.schema.org/

**Qué valida**: Structured data (JSON-LD schemas)

**Cómo usar**:
1. Inicia el frontend: `docker-compose -f docker-compose.dev-simple.yml up -d`
2. Abre la página a validar en el navegador
3. Click derecho → "Ver código fuente de la página"
4. Ctrl+A (seleccionar todo) → Ctrl+C (copiar)
5. Ve a https://validator.schema.org/
6. Pega el HTML completo
7. Click "VALIDATE"

**Páginas a validar**:
- [ ] **Homepage** - LocalBusiness + WebSite schemas
  - URL: http://localhost:5173/
  - Schemas esperados: FloristShop, WebSite
  - ✅ Sin errores
  
- [ ] **FAQ** - FAQPage schema
  - URL: http://localhost:5173/pages/faq.html
  - Schema esperado: FAQPage
  - ✅ Sin errores
  
- [ ] **Product Detail** - Product schema
  - URL: http://localhost:5173/pages/product-detail.html?id=1
  - Schema esperado: Product
  - ✅ Sin errores

**Resultado esperado**: ✅ 0 errores, posibles warnings (propiedades opcionales)

---

### 2. Google Rich Results Test ⭐⭐⭐⭐⭐

**URL**: https://search.google.com/test/rich-results

**Qué valida**: Eligibilidad para rich snippets en Google

**Método A - Por Código (Desarrollo)**:
1. Copia el HTML completo de la página
2. Ve a https://search.google.com/test/rich-results
3. Selecciona pestaña "CÓDIGO"
4. Pega el HTML
5. Click "PROBAR CÓDIGO"

**Método B - Por URL (Producción)**:
1. Una vez en producción, ingresa la URL pública
2. Click "PROBAR URL"
3. Espera análisis (30-60 segundos)

**Páginas críticas**:
- [ ] Homepage (LocalBusiness/FloristShop)
- [ ] Product Detail (Product schema con precio, rating, disponibilidad)
- [ ] FAQ (FAQPage schema)

**Resultado esperado**: 
- ✅ "La página es elegible para resultados enriquecidos"
- 🎨 Vista previa de cómo se verá en Google

---

### 3. Facebook Debugger ⭐⭐⭐⭐

**URL**: https://developers.facebook.com/tools/debug/

**Qué valida**: Open Graph tags para compartir en Facebook

**Método A - Desarrollo (ngrok)**:
```bash
# Instalar ngrok si no lo tienes
npm install -g ngrok

# Crear túnel público temporal
ngrok http 5173

# Copiar la URL (ejemplo: https://abc123.ngrok.io)
# Usar esa URL en Facebook Debugger
```

**Método B - Producción**:
1. Ve a https://developers.facebook.com/tools/debug/
2. Ingresa tu URL de producción
3. Click "Debug"
4. Revisa preview y errores

**Páginas a validar**:
- [ ] Homepage
- [ ] Catálogo
- [ ] Product Detail
- [ ] Blog

**Qué revisar**:
- ✅ og:title presente y correcto
- ✅ og:description presente (máx 300 caracteres)
- ✅ og:image carga correctamente (1200×630px recomendado)
- ✅ og:url es absoluta (https://...)
- ✅ og:type apropiado (website/product)

**Resultado esperado**: Vista previa correcta sin errores

---

### 4. Twitter Card Validator ⭐⭐⭐⭐

**URL**: https://cards-dev.twitter.com/validator

**Qué valida**: Twitter Cards para compartir en Twitter/X

**Método A - Desarrollo (ngrok)**:
```bash
# Usar mismo túnel de Facebook
ngrok http 5173
```

**Método B - Producción**:
1. Ve a https://cards-dev.twitter.com/validator
2. Ingresa URL de producción
3. Click "Preview card"

**Páginas a validar**:
- [ ] Homepage
- [ ] Product Detail
- [ ] Blog posts

**Qué revisar**:
- ✅ twitter:card = "summary_large_image"
- ✅ twitter:title presente
- ✅ twitter:description presente
- ✅ twitter:image carga (ratio 2:1 preferido)
- ✅ Preview se ve bien

**Resultado esperado**: Card preview correcta

---

### 5. Google PageSpeed Insights ⭐⭐⭐⭐

**URL**: https://pagespeed.web.dev/

**Qué valida**: Performance, SEO, Accessibility, Best Practices

**Cómo usar** (requiere URL pública):
1. Ve a https://pagespeed.web.dev/
2. Ingresa URL de producción
3. Analiza Mobile y Desktop
4. Revisa Core Web Vitals

**Métricas objetivo**:
- ✅ Performance: 85+ Mobile, 90+ Desktop
- ✅ SEO: 100
- ✅ Accessibility: 95+
- ✅ Best Practices: 95+

**Nota**: En desarrollo usa Lighthouse en Chrome DevTools (ver LIGHTHOUSE_QUICK_START.md)

---

### 6. Google Search Console ⭐⭐⭐⭐⭐

**URL**: https://search.google.com/search-console

**Qué hace**: Monitorea indexación, errores, performance en Google

**Setup (solo en producción)**:

#### Paso 1: Verificar propiedad
1. Ve a https://search.google.com/search-console
2. Click "Añadir propiedad"
3. Ingresa tu dominio (flores-victoria.com)
4. Verifica con método HTML tag o DNS

#### Paso 2: Enviar sitemap.xml
```bash
# URL del sitemap (actualizar en producción)
https://flores-victoria.com/sitemap.xml
```
1. En Search Console → Sitemaps
2. Ingresa URL del sitemap
3. Click "ENVIAR"

#### Paso 3: Solicitar indexación
1. URL Inspection tool
2. Ingresa cada URL importante
3. Click "Solicitar indexación"

**URLs prioritarias**:
- [ ] Homepage (/)
- [ ] Catálogo (/pages/catalog.html)
- [ ] Nosotros (/pages/about.html)
- [ ] Contacto (/pages/contact.html)
- [ ] FAQ (/pages/faq.html)

#### Paso 4: Monitorear
- **Cobertura**: Ver páginas indexadas/excluidas
- **Mejoras**: Rich snippets detectados
- **Experiencia**: Core Web Vitals
- **Rendimiento**: Clicks, impresiones, CTR

---

## 📊 Matriz de Validación

| Herramienta | Prioridad | Homepage | Catalog | Product | About | FAQ | Blog |
|-------------|-----------|----------|---------|---------|-------|-----|------|
| Schema.org | Alta | ✅ | ⚪ | ✅ | ⚪ | ✅ | ⚪ |
| Rich Results | Alta | ✅ | ⚪ | ✅ | ⚪ | ✅ | ⚪ |
| Facebook | Media | ✅ | ✅ | ✅ | ⚪ | ⚪ | ✅ |
| Twitter | Media | ✅ | ⚪ | ✅ | ⚪ | ⚪ | ✅ |
| PageSpeed | Alta | ✅ | ✅ | ✅ | ✅ | ✅ | ⚪ |
| Search Console | Alta | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

**Leyenda**:
- ✅ = Debe validarse
- ⚪ = Opcional

---

## 🔍 Checklist de Pre-Producción

### Structured Data (JSON-LD)
- [ ] Schema.org Validator sin errores
- [ ] Google Rich Results Test muestra eligibilidad
- [ ] LocalBusiness schema validado
- [ ] Product schema validado (con precio, rating, disponibilidad)
- [ ] FAQPage schema validado
- [ ] WebSite schema con SearchAction validado

### Meta Tags & Social
- [ ] Todas las páginas tienen meta description (150-160 caracteres)
- [ ] Todas las páginas tienen canonical URL o noindex
- [ ] Open Graph tags completos (title, description, image, url, type)
- [ ] Twitter Cards completos (card, title, description, image)
- [ ] Facebook Debugger muestra preview correcta
- [ ] Twitter Card Validator muestra preview correcta

### Performance & SEO
- [ ] Lighthouse SEO score = 100 en todas las páginas
- [ ] Lighthouse Performance > 85 en páginas principales
- [ ] Lighthouse Accessibility > 95 en todas las páginas
- [ ] sitemap.xml actualizado y accesible
- [ ] robots.txt configurado correctamente
- [ ] No hay errores 404 en links internos
- [ ] Imágenes optimizadas (WebP, lazy loading)

### Google Search Console (Post-Producción)
- [ ] Propiedad verificada
- [ ] Sitemap.xml enviado
- [ ] URLs principales indexadas
- [ ] Sin errores de cobertura
- [ ] Rich snippets detectados
- [ ] Core Web Vitals en rango "Good"

---

## 🐛 Troubleshooting

### Schema.org Validator muestra errores

**Error común**: "Missing required field"
```javascript
// Solución: Añadir campo faltante
{
  "@type": "Product",
  "name": "Rosas Rojas", // ✅
  "offers": {
    "price": "599.00", // ✅ Añadir
    "priceCurrency": "MXN" // ✅ Añadir
  }
}
```

### Facebook Debugger no carga imagen

**Causa**: URL relativa o imagen muy pequeña

```html
<!-- ❌ Mal -->
<meta property="og:image" content="/images/logo.jpg">

<!-- ✅ Bien -->
<meta property="og:image" content="https://flores-victoria.com/images/logo-1200x630.jpg">
```

**Requisitos de imagen OG**:
- Tamaño mínimo: 200×200px
- Tamaño recomendado: 1200×630px
- Formato: JPG, PNG, WebP
- Peso máximo: 8MB
- Ratio: 1.91:1 (Facebook), 2:1 (Twitter)

### Google Rich Results Test no detecta schemas

**Causa**: Schema se genera dinámicamente con JavaScript

**Solución**: 
1. Espera a que la página cargue completamente
2. Copia HTML después de que JS se ejecute
3. O usa "PROBAR URL" en producción (Googlebot ejecuta JS)

### PageSpeed Insights score bajo

**Performance < 80**:
- Optimizar imágenes (WebP, compresión)
- Implementar lazy loading
- Minimizar CSS/JS
- Usar CDN

**SEO < 100**:
- Revisar meta tags faltantes
- Verificar canonical URLs
- Asegurar viewport configurado
- Validar structured data

---

## 📅 Timeline de Validación

### Pre-Lanzamiento (Desarrollo)
1. **Semana 1**: 
   - ✅ Schema.org Validator (homepage, faq, product)
   - ✅ Lighthouse audits locales

2. **Semana 2**:
   - ⏳ Google Rich Results Test
   - ⏳ Facebook/Twitter validation (con ngrok)

### Post-Lanzamiento (Producción)
3. **Día 1-7**:
   - [ ] Verificar propiedad en Search Console
   - [ ] Enviar sitemap.xml
   - [ ] Solicitar indexación de URLs principales
   - [ ] PageSpeed Insights en todas las páginas

4. **Semana 2-4**:
   - [ ] Monitorear Search Console diariamente
   - [ ] Verificar que schemas se detecten
   - [ ] Revisar Core Web Vitals
   - [ ] Analizar primeros clicks/impresiones

5. **Mes 2-3**:
   - [ ] Rich snippets activos (2-4 semanas)
   - [ ] Knowledge Panel visible (4-8 semanas)
   - [ ] Análisis de tráfico orgánico
   - [ ] Ajustes basados en datos

---

## 🎯 Criterios de Éxito

### Mínimo Viable
- ✅ Schema.org: 0 errores críticos
- ✅ Google Rich Results: Elegible
- ✅ Lighthouse SEO: 100
- ✅ Open Graph: Preview correcta

### Objetivo Ideal
- ✅ Todos los criterios mínimos
- ✅ PageSpeed: 90+ Desktop, 85+ Mobile
- ✅ Accessibility: 95+
- ✅ Search Console: 0 errores de cobertura
- ✅ Rich snippets activos en 2-4 semanas

### Excelencia
- ✅ Todos los criterios anteriores
- ✅ Knowledge Panel visible
- ✅ Core Web Vitals en "Good"
- ✅ Top 3 en búsquedas clave (3-6 meses)
- ✅ CTR > 5% en búsquedas orgánicas

---

## 📝 Template de Reporte

```markdown
# Reporte de Validación Externa - Flores Victoria
**Fecha**: [FECHA]
**Validado por**: [NOMBRE]

## Resultados

### Schema.org Validator
- Homepage: ✅/❌ - [Errores: X]
- FAQ: ✅/❌ - [Errores: X]
- Product: ✅/❌ - [Errores: X]

### Google Rich Results Test
- Homepage (LocalBusiness): ✅/❌
- Product Detail: ✅/❌
- FAQ: ✅/❌

### Social Media
- Facebook Debugger: ✅/❌
- Twitter Card Validator: ✅/❌

### Performance
- PageSpeed Desktop: XX/100
- PageSpeed Mobile: XX/100

### Search Console (Post-Producción)
- URLs indexadas: X/Y
- Rich snippets detectados: ✅/❌
- Errores de cobertura: X

## Problemas Encontrados
1. [Descripción]
   - Causa: [...]
   - Solución: [...]

## Próximos Pasos
- [ ] Acción 1
- [ ] Acción 2

## Notas
[Observaciones adicionales]
```

---

**Preparado por**: GitHub Copilot  
**Fecha**: 24 de noviembre de 2025  
**Score SEO Actual**: 95%  
**Estado**: Listo para validación externa
