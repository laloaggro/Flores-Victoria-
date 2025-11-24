# 🚀 Guía Rápida de Lighthouse Audits - Flores Victoria

## 📋 Checklist de Auditorías

Esta guía te ayudará a ejecutar Lighthouse audits en las 5 páginas principales del sitio.

---

## 🎯 Páginas a Auditar (Orden de Prioridad)

1. ✅ **Homepage** (http://localhost:5173/)
2. ✅ **Catálogo** (http://localhost:5173/pages/catalog.html)
3. ✅ **Detalle de Producto** (http://localhost:5173/pages/product-detail.html?id=1)
4. ✅ **Nosotros** (http://localhost:5173/pages/about.html)
5. ✅ **Contacto** (http://localhost:5173/pages/contact.html)

---

## 🛠️ Método 1: Chrome DevTools (Recomendado)

### Paso 1: Iniciar el Frontend

```bash
cd /home/impala/Documentos/Proyectos/flores-victoria
docker-compose -f docker-compose.dev-simple.yml up -d frontend
```

Verificar que esté corriendo:
```bash
docker-compose -f docker-compose.dev-simple.yml ps frontend
```

### Paso 2: Abrir Chrome DevTools

1. Abre Chrome/Edge en modo incógnito (Ctrl+Shift+N)
2. Navega a: http://localhost:5173/
3. Presiona F12 para abrir DevTools
4. Ve a la pestaña **"Lighthouse"**

### Paso 3: Configurar Lighthouse

**Configuración recomendada:**
- ✅ Mode: Navigation (default)
- ✅ Categories to check:
  - [x] Performance
  - [x] Accessibility
  - [x] Best Practices
  - [x] SEO
  - [ ] Progressive Web App (opcional)
- ✅ Device: Desktop
- ✅ Clear storage: ✓ (activado)

### Paso 4: Ejecutar Audit

1. Click en **"Analyze page load"**
2. Espera 20-30 segundos
3. Revisa los resultados

### Paso 5: Guardar Resultados

**Opción A - HTML Report:**
```
1. Click en el ícono de ⚙️ (arriba a la derecha)
2. Click "Save as HTML"
3. Guardar como: lighthouse-[pagina]-[fecha].html
```

**Opción B - JSON (para análisis):**
```
1. Click en el ícono de ⚙️
2. Click "Save as JSON"
3. Guardar como: lighthouse-[pagina]-[fecha].json
```

---

## 📊 Scores Objetivo

| Categoría | Objetivo | Mínimo Aceptable |
|-----------|----------|------------------|
| **Performance** | 90+ | 80 |
| **Accessibility** | 95+ | 90 |
| **Best Practices** | 95+ | 90 |
| **SEO** | 100 ✅ | 95 |

---

## 🎯 Auditoría Página por Página

### 1. Homepage (/)

**URL**: http://localhost:5173/

**Expectativas:**
- SEO: 100 (meta tags completos, LocalBusiness schema)
- Performance: 85-90 (imágenes, hero section)
- Accessibility: 95+ (contraste, labels)

**Puntos a revisar:**
- [ ] Structured data sin errores
- [ ] Imágenes con alt text
- [ ] Links con texto descriptivo
- [ ] Contraste de colores adecuado

**Comando para captura:**
```bash
# Si usas Lighthouse CLI
lighthouse http://localhost:5173/ \
  --output html \
  --output-path ./reports/lighthouse-homepage-$(date +%Y%m%d).html \
  --chrome-flags="--headless"
```

---

### 2. Catálogo (/pages/catalog.html)

**URL**: http://localhost:5173/pages/catalog.html

**Expectativas:**
- SEO: 100 (canonical, meta tags)
- Performance: 80-85 (múltiples imágenes de productos)
- Accessibility: 95+

**Puntos a revisar:**
- [ ] Lazy loading de imágenes funcionando
- [ ] Grid responsive
- [ ] Filtros accesibles
- [ ] Cards con enlaces descriptivos

---

### 3. Detalle de Producto (/pages/product-detail.html?id=1)

**URL**: http://localhost:5173/pages/product-detail.html?id=1

**Expectativas:**
- SEO: 95-100 (Product schema dinámico)
- Performance: 85-90 (galería de imágenes)
- Accessibility: 95+

**Puntos a revisar:**
- [ ] Product schema se genera correctamente
- [ ] Imágenes optimizadas
- [ ] Zoom de imagen accesible
- [ ] Botones con labels claros

**Nota**: Verificar que el Product schema se inyecte (ver en consola):
```javascript
document.querySelectorAll('script[type="application/ld+json"]')
```

---

### 4. Nosotros (/pages/about.html)

**URL**: http://localhost:5173/pages/about.html

**Expectativas:**
- SEO: 100 (canonical recién añadido)
- Performance: 90+ (menos imágenes)
- Accessibility: 95+

**Puntos a revisar:**
- [ ] Canonical URL presente
- [ ] Imágenes del equipo con alt
- [ ] Secciones semánticas (section, article)
- [ ] Historia bien estructurada

---

### 5. Contacto (/pages/contact.html)

**URL**: http://localhost:5173/pages/contact.html

**Expectativas:**
- SEO: 100
- Performance: 95+ (página simple)
- Accessibility: 95+ (formulario)

**Puntos a revisar:**
- [ ] Formulario accesible (labels)
- [ ] Validación clara
- [ ] Focus visible en inputs
- [ ] Mensajes de error descriptivos

---

## 🔍 Método 2: Lighthouse CLI (Opcional)

### Instalación (si no está instalado)

```bash
npm install -g lighthouse
```

### Ejecutar Audit Completo

```bash
# Crear directorio para reportes
mkdir -p reports/lighthouse

# Homepage
lighthouse http://localhost:5173/ \
  --output html \
  --output json \
  --output-path ./reports/lighthouse/homepage

# Catálogo
lighthouse http://localhost:5173/pages/catalog.html \
  --output html \
  --output-path ./reports/lighthouse/catalog

# Producto
lighthouse http://localhost:5173/pages/product-detail.html?id=1 \
  --output html \
  --output-path ./reports/lighthouse/product

# Nosotros
lighthouse http://localhost:5173/pages/about.html \
  --output html \
  --output-path ./reports/lighthouse/about

# Contacto
lighthouse http://localhost:5173/pages/contact.html \
  --output html \
  --output-path ./reports/lighthouse/contact
```

---

## 📈 Análisis de Resultados

### Interpretar Scores

**Performance (90+)**
- ✅ First Contentful Paint < 1.8s
- ✅ Largest Contentful Paint < 2.5s
- ✅ Total Blocking Time < 200ms
- ✅ Cumulative Layout Shift < 0.1

**Accessibility (95+)**
- ✅ Contraste de color >= 4.5:1
- ✅ Alt text en todas las imágenes
- ✅ Labels en todos los inputs
- ✅ ARIA correctamente usado

**Best Practices (95+)**
- ✅ HTTPS (en producción)
- ✅ No errores en consola
- ✅ Imágenes con aspect ratio
- ✅ No usa bibliotecas vulnerables

**SEO (100)**
- ✅ Meta description presente
- ✅ Canonical URL presente
- ✅ viewport configurado
- ✅ Tamaño de fuente legible
- ✅ Links con texto descriptivo
- ✅ Structured data válido

---

## 🐛 Problemas Comunes y Soluciones

### Performance Bajo (<80)

**Problema**: Imágenes grandes sin optimizar
```bash
# Solución: Optimizar imágenes con sharp o imagemin
npm install -g sharp-cli
sharp input.jpg -o output.webp --webp
```

**Problema**: JavaScript bloqueante
```html
<!-- Solución: Usar defer o async -->
<script src="/js/app.js" defer></script>
```

**Problema**: CSS no usado
```bash
# Solución: Usar PurgeCSS
npm install -g purgecss
purgecss --css style.css --content *.html --output dist/
```

### Accessibility Bajo (<90)

**Problema**: Contraste insuficiente
```css
/* Mal (ratio 3:1) */
color: #999;
background: #fff;

/* Bien (ratio 4.5:1+) */
color: #666;
background: #fff;
```

**Problema**: Inputs sin labels
```html
<!-- Mal -->
<input type="text" placeholder="Nombre">

<!-- Bien -->
<label for="nombre">Nombre:</label>
<input id="nombre" type="text" placeholder="Tu nombre">
```

**Problema**: Links sin texto
```html
<!-- Mal -->
<a href="/cart"><i class="fa fa-cart"></i></a>

<!-- Bien -->
<a href="/cart" aria-label="Ver carrito de compras">
  <i class="fa fa-cart"></i>
</a>
```

### SEO Bajo (<95)

**Problema**: Meta description faltante
- Verificar que cada página tenga `<meta name="description">`

**Problema**: Canonical faltante
- Verificar que páginas públicas tengan `<link rel="canonical">`

**Problema**: Structured data inválido
- Validar con https://validator.schema.org/

---

## 📊 Reporte de Resultados

### Template de Reporte

```markdown
# Lighthouse Audit Report - Flores Victoria
**Fecha**: [FECHA]
**Auditor**: [TU NOMBRE]

## Resultados Generales

| Página | Performance | Accessibility | Best Practices | SEO |
|--------|-------------|---------------|----------------|-----|
| Homepage | XX | XX | XX | XX |
| Catálogo | XX | XX | XX | XX |
| Producto | XX | XX | XX | XX |
| Nosotros | XX | XX | XX | XX |
| Contacto | XX | XX | XX | XX |
| **Promedio** | **XX** | **XX** | **XX** | **XX** |

## Problemas Encontrados

### Críticos (Score < 50)
- [ ] Ninguno encontrado

### Importantes (Score 50-80)
- [ ] Performance en Catálogo: 78/100
  - Causa: Imágenes sin optimizar
  - Solución: Comprimir imágenes y usar WebP

### Menores (Score 80-90)
- [ ] Accessibility en Homepage: 88/100
  - Causa: Contraste en algunos botones
  - Solución: Ajustar colores según WCAG

## Recomendaciones

1. **Alta Prioridad**:
   - Optimizar imágenes (WebP, lazy loading)
   - Corregir contrastes de color

2. **Media Prioridad**:
   - Implementar service worker (PWA)
   - Reducir JavaScript no usado

3. **Baja Prioridad**:
   - Mejorar cache de recursos estáticos
   - Implementar HTTP/2 push

## Próximos Pasos

- [ ] Implementar cambios recomendados
- [ ] Re-ejecutar audits
- [ ] Validar mejoras
```

---

## 🎯 Objetivos Post-Audit

### Corto Plazo (1 semana)
- [ ] Score Performance > 85 en todas las páginas
- [ ] Score Accessibility > 95 en todas las páginas
- [ ] Score SEO = 100 en todas las páginas

### Medio Plazo (1 mes)
- [ ] Performance > 90 (optimización de imágenes)
- [ ] Implementar PWA (Progressive Web App)
- [ ] Service Worker para cache offline

### Largo Plazo (3 meses)
- [ ] Core Web Vitals en "Good" range
- [ ] Lighthouse CI integrado en pipeline
- [ ] Monitoreo continuo de performance

---

## 🔗 Recursos Adicionales

- **Lighthouse Docs**: https://developers.google.com/web/tools/lighthouse
- **Web.dev Learn**: https://web.dev/learn
- **Core Web Vitals**: https://web.dev/vitals/
- **WCAG Guidelines**: https://www.w3.org/WAI/WCAG21/quickref/
- **Schema.org Validator**: https://validator.schema.org/

---

## ✅ Checklist Final

- [ ] Frontend corriendo en http://localhost:5173
- [ ] Chrome DevTools abierto
- [ ] Audits ejecutados en 5 páginas principales
- [ ] Reportes guardados en formato HTML
- [ ] Problemas documentados
- [ ] Plan de acción creado
- [ ] Scores promedio > 90%

---

**Preparado por**: GitHub Copilot  
**Fecha**: 24 de noviembre de 2025  
**Versión**: 1.0  
**Score SEO Actual**: 95%
