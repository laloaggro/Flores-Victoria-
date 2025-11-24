# Guía de Validación de Schemas JSON-LD

## 🎯 Objetivo

Validar que todos los schemas JSON-LD implementados cumplan con las especificaciones de Schema.org y sean elegibles para rich snippets en Google.

## 📋 Schemas Implementados

### 1. LocalBusiness (FloristShop)
- **Ubicación**: `frontend/index.html`
- **Tipo**: `FloristShop` (subtipo de LocalBusiness)
- **Funcionalidad**: Knowledge Panel en Google

### 2. WebSite con SearchAction
- **Ubicación**: `frontend/index.html`
- **Tipo**: `WebSite`
- **Funcionalidad**: Sitelinks search box en resultados de Google

### 3. FAQPage
- **Ubicación**: `frontend/pages/faq.html`
- **Tipo**: `FAQPage`
- **Funcionalidad**: "People also ask" en resultados de búsqueda

### 4. Product
- **Ubicación**: `frontend/pages/product-detail.html`
- **Tipo**: `Product`
- **Funcionalidad**: Rich snippets con precio, rating, disponibilidad

## 🔍 Herramientas de Validación

### 1. Schema.org Validator (Oficial)

**URL**: https://validator.schema.org/

**Cómo usar:**
1. Inicia el servidor de desarrollo:
   ```bash
   docker-compose -f docker-compose.dev-simple.yml up -d frontend
   ```

2. Abre el navegador en:
   - http://localhost:5173 (Homepage - LocalBusiness + WebSite)
   - http://localhost:5173/pages/faq.html (FAQPage)
   - http://localhost:5173/pages/product-detail.html?id=1 (Product)

3. En cada página, copia el HTML completo:
   - Click derecho → "Ver código fuente de la página"
   - Ctrl+A → Ctrl+C

4. Pega el HTML en Schema.org Validator
5. Click en "VALIDATE"

**Qué verificar:**
- ✅ 0 errores
- ⚠️ Warnings son aceptables (propiedades opcionales)
- ❌ Errores deben corregirse

### 2. Google Rich Results Test (Oficial Google)

**URL**: https://search.google.com/test/rich-results

**Cómo usar:**
1. Método 1 - Por URL (requiere dominio público):
   - Ingresa la URL de producción
   - Click "PROBAR URL"

2. Método 2 - Por código (desarrollo local):
   - Copia el HTML completo de la página
   - Selecciona "CÓDIGO" en el validador
   - Pega el HTML
   - Click "PROBAR CÓDIGO"

**Qué verificar:**
- ✅ "La página es elegible para resultados enriquecidos"
- 🎨 Vista previa de cómo se verá en Google
- ⚠️ Campos recomendados vs requeridos

### 3. Validación Manual en DevTools

**Cómo verificar que los schemas se inyectan correctamente:**

```javascript
// Abre la consola del navegador (F12)

// Ver todos los schemas JSON-LD en la página
document.querySelectorAll('script[type="application/ld+json"]').forEach((script, i) => {
  console.log(`Schema ${i + 1}:`, JSON.parse(script.textContent));
});

// Verificar schema de producto específico
const productSchema = Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
  .find(s => JSON.parse(s.textContent)['@type'] === 'Product');
if (productSchema) {
  console.log('✅ Product Schema:', JSON.parse(productSchema.textContent));
} else {
  console.log('❌ Product Schema no encontrado');
}
```

## 📊 Checklist de Validación

### Homepage (index.html)

- [ ] **LocalBusiness Schema**
  - [ ] Tiene @type: "FloristShop"
  - [ ] Incluye nombre del negocio
  - [ ] Incluye dirección completa
  - [ ] Incluye teléfono y email
  - [ ] Incluye horarios de apertura
  - [ ] Incluye aggregate rating
  - [ ] Incluye links de redes sociales (sameAs)

- [ ] **WebSite Schema**
  - [ ] Tiene @type: "WebSite"
  - [ ] Incluye SearchAction
  - [ ] target tiene placeholder {search_term_string}
  - [ ] URL del sitio es correcta

### FAQ Page (faq.html)

- [ ] **FAQPage Schema**
  - [ ] Se genera automáticamente al cargar la página
  - [ ] Tiene @type: "FAQPage"
  - [ ] mainEntity es un array de Question
  - [ ] Cada Question tiene name y acceptedAnswer
  - [ ] acceptedAnswer tiene @type: "Answer" y text
  - [ ] Texto de respuestas NO contiene HTML

### Product Detail (product-detail.html)

- [ ] **Product Schema**
  - [ ] Se genera dinámicamente por cada producto
  - [ ] Tiene @type: "Product"
  - [ ] Incluye name, description, image
  - [ ] Incluye brand: "Flores Victoria"
  - [ ] **Offers** incluye:
    - [ ] price (formato decimal: "599.00")
    - [ ] priceCurrency: "MXN"
    - [ ] availability (InStock o OutOfStock)
    - [ ] priceValidUntil (fecha futura)
  - [ ] **aggregateRating** incluye:
    - [ ] ratingValue
    - [ ] reviewCount
    - [ ] bestRating: "5"
    - [ ] worstRating: "1"

## 🐛 Problemas Comunes y Soluciones

### Error: "Missing required field"

**Problema**: Schema.org reporta campo requerido faltante

**Solución**:
1. Verifica en la documentación de Schema.org cuáles son los campos obligatorios
2. Añade el campo faltante al objeto schema
3. Re-valida

### Error: "Invalid date format"

**Problema**: Fechas no siguen formato ISO 8601

**Solución**:
```javascript
// ❌ Incorrecto
"priceValidUntil": "2025-12-31 23:59:59"

// ✅ Correcto
"priceValidUntil": "2025-12-31"
```

### Error: "Invalid URL"

**Problema**: URLs relativas en lugar de absolutas

**Solución**:
```javascript
// ❌ Incorrecto
"image": "/images/product.jpg"

// ✅ Correcto
"image": "https://flores-victoria.com/images/product.jpg"
```

### Warning: "Recommended property missing"

**Problema**: Propiedad opcional no incluida

**Solución**: Las warnings no impiden rich snippets, pero añadir campos recomendados mejora la visibilidad:
- `image` (siempre recomendado)
- `review` (testimonios individuales)
- `priceRange` (rango de precios del negocio)

### Schema no se genera

**Problema**: El script JSON-LD no aparece en el HEAD

**Debugging**:
```javascript
// En la consola del navegador
// 1. Verificar que el producto cargó
console.log('Current product:', currentProduct);

// 2. Verificar que la función se ejecutó
console.log('Schemas en HEAD:', document.querySelectorAll('script[type="application/ld+json"]').length);

// 3. Verificar errores en consola
// Buscar mensajes de error en la consola
```

**Solución**:
- Verifica que la función se llama después de cargar los datos
- Verifica que no hay errores de JavaScript bloqueando la ejecución
- Usa `setTimeout()` si es necesario esperar el DOM

## 📈 Métricas de Éxito

### Inmediato (1-2 días)
- ✅ Validadores sin errores
- ✅ Schemas visibles en código fuente
- ✅ Console logs confirman inyección

### Corto Plazo (1-2 semanas)
- 📊 Google Search Console detecta structured data
- 📊 "Enhancements" report muestra páginas elegibles
- 📊 Rich Results Test muestra vista previa

### Medio Plazo (1-2 meses)
- 🎯 Rich snippets aparecen en búsquedas de marca
- 🎯 Knowledge Panel aparece para "Flores Victoria"
- 🎯 FAQs aparecen en "People also ask"

### Largo Plazo (3-6 meses)
- 📈 CTR aumenta 30-50% en resultados orgánicos
- 📈 Tráfico orgánico aumenta 40-60%
- 📈 Conversiones desde orgánico aumentan 20-30%

## 🚀 Siguientes Pasos Después de Validar

1. **Enviar a Google Search Console**
   - Solicita indexación de páginas actualizadas
   - Monitorea "Enhancements" report

2. **Crear más schemas**
   - BreadcrumbList para navegación
   - ItemList para catálogo de productos
   - Review para testimonios individuales

3. **Optimizar imágenes para rich snippets**
   - Mínimo: 1200×675px
   - Recomendado: 1200×1200px (ratio 1:1)
   - Formato: JPG o WebP

4. **Monitorear resultados**
   - Google Search Console > Enhancements
   - Google Analytics > Organic Traffic
   - Rankings en búsquedas clave

## 📚 Referencias

- **Schema.org Documentation**: https://schema.org/
- **Google Search Central**: https://developers.google.com/search/docs/appearance/structured-data
- **LocalBusiness**: https://schema.org/LocalBusiness
- **Product**: https://schema.org/Product
- **FAQPage**: https://schema.org/FAQPage
- **WebSite**: https://schema.org/WebSite

## 🎯 Checklist Final de Implementación

- [x] LocalBusiness schema implementado
- [x] WebSite schema implementado
- [x] FAQPage schema implementado
- [x] Product schema implementado
- [ ] Todos los schemas validados sin errores
- [ ] Rich Results Test muestra elegibilidad
- [ ] Schemas enviados a Google Search Console
- [ ] Monitoreo configurado en Analytics

---

**Última actualización**: 24 de noviembre de 2025
**Estado**: ✅ Implementación completa - Pendiente validación
