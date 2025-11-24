# 🏗️ Plan de Implementación JSON-LD Structured Data

## 📅 Fecha: 24 de noviembre de 2025

## 🎯 Objetivo
Implementar datos estructurados JSON-LD (Schema.org) para mejorar la visibilidad en buscadores y habilitar rich snippets (resultados enriquecidos) en Google.

---

## 📚 ¿Qué es JSON-LD?

**JSON-LD** = JSON for Linking Data

Es un formato para incluir datos estructurados en páginas web que los motores de búsqueda pueden entender. Permite:

✅ **Rich Snippets**: Resultados enriquecidos con imágenes, precios, reviews  
✅ **Knowledge Graphs**: Información destacada en panel lateral de Google  
✅ **Voice Search**: Mejores respuestas en búsquedas por voz  
✅ **Better CTR**: Mayor tasa de clics desde resultados de búsqueda  

---

## 🎯 Schemas a Implementar

### 1. LocalBusiness (Prioridad: ALTA)

**Dónde**: `index.html` (homepage)  
**Propósito**: Información del negocio físico/online

```json
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": "https://flores-victoria.com/#business",
  "name": "Flores Victoria",
  "image": "https://flores-victoria.com/images/logo-1200x630.jpg",
  "description": "Arreglos florales exquisitos para toda ocasión. Entrega a domicilio en 24 horas. Rosas, tulipanes, bouquets únicos y personalizados.",
  "url": "https://flores-victoria.com/",
  "telephone": "+52-XXX-XXX-XXXX",
  "email": "contacto@flores-victoria.com",
  "priceRange": "$$",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "[Calle y número]",
    "addressLocality": "[Ciudad]",
    "addressRegion": "[Estado]",
    "postalCode": "[Código Postal]",
    "addressCountry": "MX"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "[latitud]",
    "longitude": "[longitud]"
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": "09:00",
      "closes": "19:00"
    },
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": "Saturday",
      "opens": "10:00",
      "closes": "16:00"
    }
  ],
  "sameAs": [
    "https://www.facebook.com/floresvictoria",
    "https://www.instagram.com/floresvictoria",
    "https://twitter.com/floresvictoria"
  ],
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "127"
  }
}
</script>
```

**Datos a actualizar**:
- [ ] Teléfono real
- [ ] Dirección completa
- [ ] Coordenadas GPS (obtener de Google Maps)
- [ ] Horarios de atención
- [ ] URLs de redes sociales
- [ ] Rating promedio (de sistema de reviews)

---

### 2. Product (Prioridad: ALTA)

**Dónde**: `pages/product-detail.html`  
**Propósito**: Información de productos individuales

```json
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Product",
  "@id": "https://flores-victoria.com/pages/product-detail.html?id=1",
  "name": "Rosas Rojas Premium - Bouquet de 12",
  "image": [
    "https://flores-victoria.com/images/products/rosas-rojas-1.jpg",
    "https://flores-victoria.com/images/products/rosas-rojas-2.jpg",
    "https://flores-victoria.com/images/products/rosas-rojas-3.jpg"
  ],
  "description": "Elegante bouquet de 12 rosas rojas premium importadas. Perfectas para expresar amor y pasión. Incluye tarjeta personalizada y presentación de lujo.",
  "sku": "PROD-001",
  "brand": {
    "@type": "Brand",
    "name": "Flores Victoria"
  },
  "offers": {
    "@type": "Offer",
    "url": "https://flores-victoria.com/pages/product-detail.html?id=1",
    "priceCurrency": "MXN",
    "price": "599.00",
    "priceValidUntil": "2025-12-31",
    "availability": "https://schema.org/InStock",
    "seller": {
      "@type": "Organization",
      "name": "Flores Victoria"
    }
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "reviewCount": "47",
    "bestRating": "5",
    "worstRating": "1"
  },
  "review": [
    {
      "@type": "Review",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": "5",
        "bestRating": "5"
      },
      "author": {
        "@type": "Person",
        "name": "María González"
      },
      "reviewBody": "Hermosas rosas, llegaron frescas y puntuales. Excelente presentación.",
      "datePublished": "2025-11-20"
    }
  ]
}
</script>
```

**Implementación dinámica**:
```javascript
// En product-detail.js
function generateProductSchema(product) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `https://flores-victoria.com/pages/product-detail.html?id=${product.id}`,
    "name": product.name,
    "image": product.images.map(img => `https://flores-victoria.com${img}`),
    "description": product.description,
    "sku": product.sku,
    "offers": {
      "@type": "Offer",
      "priceCurrency": "MXN",
      "price": product.price.toFixed(2),
      "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
    }
  };
  
  // Inyectar en HEAD
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(schema);
  document.head.appendChild(script);
}
```

---

### 3. BreadcrumbList (Prioridad: MEDIA)

**Dónde**: Todas las páginas con breadcrumbs  
**Propósito**: Mostrar navegación jerárquica en resultados de búsqueda

```json
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Inicio",
      "item": "https://flores-victoria.com/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Catálogo",
      "item": "https://flores-victoria.com/pages/catalog.html"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Rosas Rojas Premium",
      "item": "https://flores-victoria.com/pages/product-detail.html?id=1"
    }
  ]
}
</script>
```

**Generación dinámica**:
```javascript
// En common-bundle.js o breadcrumb component
function generateBreadcrumbSchema() {
  const breadcrumbs = document.querySelectorAll('.breadcrumb a, .breadcrumb span');
  const items = Array.from(breadcrumbs).map((el, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": el.textContent.trim(),
    "item": el.href || window.location.href
  }));
  
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items
  };
  
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(schema);
  document.head.appendChild(script);
}

// Ejecutar cuando breadcrumbs estén listos
if (document.querySelector('.breadcrumb')) {
  generateBreadcrumbSchema();
}
```

---

### 4. FAQPage (Prioridad: MEDIA)

**Dónde**: `pages/faq.html`  
**Propósito**: Aparecer en sección "People also ask" de Google

```json
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "¿Cuál es el tiempo de entrega?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Realizamos entregas en 24 horas para la zona metropolitana. Para áreas foráneas el tiempo puede extenderse a 48-72 horas."
      }
    },
    {
      "@type": "Question",
      "name": "¿Puedo personalizar mi arreglo floral?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Sí, ofrecemos personalización completa. Puedes elegir tipos de flores, colores, tamaño del arreglo y agregar mensajes personalizados."
      }
    },
    {
      "@type": "Question",
      "name": "¿Cuáles son los métodos de pago?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Aceptamos tarjetas de crédito, débito, transferencias bancarias y pago contra entrega en efectivo."
      }
    }
  ]
}
</script>
```

**Generación desde HTML existente**:
```javascript
// En faq.js
function generateFAQSchema() {
  const faqItems = document.querySelectorAll('.faq-item');
  const questions = Array.from(faqItems).map(item => ({
    "@type": "Question",
    "name": item.querySelector('.faq-question')?.textContent.trim(),
    "acceptedAnswer": {
      "@type": "Answer",
      "text": item.querySelector('.faq-answer')?.textContent.trim()
    }
  }));
  
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": questions
  };
  
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(schema);
  document.head.appendChild(script);
}
```

---

### 5. WebSite con SearchAction (Prioridad: MEDIA)

**Dónde**: `index.html`  
**Propósito**: Habilitar búsqueda en Sitelinks de Google

```json
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": "https://flores-victoria.com/#website",
  "url": "https://flores-victoria.com/",
  "name": "Flores Victoria",
  "description": "Arreglos florales para toda ocasión",
  "publisher": {
    "@type": "Organization",
    "@id": "https://flores-victoria.com/#business"
  },
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://flores-victoria.com/pages/catalog.html?search={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
}
</script>
```

---

### 6. ItemList (Catálogo de Productos) (Prioridad: BAJA)

**Dónde**: `pages/catalog.html`  
**Propósito**: Indicar lista de productos en catálogo

```json
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "ItemList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "item": {
        "@type": "Product",
        "name": "Rosas Rojas Premium",
        "url": "https://flores-victoria.com/pages/product-detail.html?id=1",
        "image": "https://flores-victoria.com/images/products/rosas-rojas.jpg",
        "offers": {
          "@type": "Offer",
          "priceCurrency": "MXN",
          "price": "599.00"
        }
      }
    }
    // ... más productos
  ]
}
</script>
```

---

## 📋 Plan de Implementación

### Fase 1: Schemas Estáticos (2-3 horas)

**Archivos a modificar**:

1. **index.html**
   - [ ] Agregar LocalBusiness schema
   - [ ] Agregar WebSite schema con SearchAction
   - [ ] Actualizar con datos reales del negocio

2. **pages/faq.html**
   - [ ] Agregar FAQPage schema
   - [ ] Extraer Q&A del HTML actual
   - [ ] Validar con Schema Validator

3. **pages/contact.html**
   - [ ] Agregar ContactPage schema (opcional)
   - [ ] Incluir medios de contacto estructurados

**Commits**:
```bash
git commit -m "feat(seo): add LocalBusiness and WebSite JSON-LD schemas to homepage"
git commit -m "feat(seo): add FAQPage structured data to FAQ page"
```

---

### Fase 2: Schemas Dinámicos (4-5 horas)

**Archivos a crear/modificar**:

1. **js/schema-generator.js** (nuevo archivo)
   ```javascript
   // Utilidad para generar schemas dinámicamente
   export function injectSchema(schema) {
     const script = document.createElement('script');
     script.type = 'application/ld+json';
     script.textContent = JSON.stringify(schema, null, 2);
     document.head.appendChild(script);
   }
   
   export function generateProductSchema(product) { /* ... */ }
   export function generateBreadcrumbSchema() { /* ... */ }
   export function generateFAQSchema() { /* ... */ }
   ```

2. **pages/product-detail.html + js**
   - [ ] Modificar product-detail.js para generar Product schema
   - [ ] Incluir reviews si existen
   - [ ] Manejar productos sin stock

3. **Todas las páginas con breadcrumbs**
   - [ ] Agregar generación de BreadcrumbList
   - [ ] Integrar con componente breadcrumb existente

4. **pages/catalog.html**
   - [ ] Generar ItemList con productos visibles
   - [ ] Actualizar al cambiar filtros/paginación

**Commits**:
```bash
git commit -m "feat(seo): add schema generator utility with Product and Breadcrumb schemas"
git commit -m "feat(seo): integrate dynamic schema generation in product pages"
```

---

### Fase 3: Validación y Testing (1-2 horas)

**Herramientas a usar**:

1. **Schema Markup Validator**
   - URL: https://validator.schema.org/
   - Validar cada tipo de schema

2. **Google Rich Results Test**
   - URL: https://search.google.com/test/rich-results
   - Verificar elegibilidad para rich snippets

3. **Testing manual**:
   ```bash
   # Ver schemas en página
   document.querySelectorAll('script[type="application/ld+json"]').forEach(s => 
     console.log(JSON.parse(s.textContent))
   );
   ```

**Checklist de validación**:
- [ ] Todos los schemas pasan Schema Validator sin errores
- [ ] Rich Results Test muestra "Page is eligible for rich results"
- [ ] No hay schemas duplicados (@id únicos)
- [ ] Datos coinciden con contenido visible
- [ ] URLs son absolutas (no relativas)

---

## 🎨 Ejemplo Completo: index.html

```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🌺 Flores Victoria - Arreglos Florales Exquisitos</title>
    
    <!-- Meta tags (ya implementados) -->
    <meta name="description" content="...">
    <meta property="og:type" content="website">
    <!-- ... resto de meta tags ... -->
    
    <!-- JSON-LD: LocalBusiness -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "@id": "https://flores-victoria.com/#business",
      "name": "Flores Victoria",
      "image": "https://flores-victoria.com/images/logo-1200x630.jpg",
      "description": "Arreglos florales exquisitos para toda ocasión",
      "url": "https://flores-victoria.com/",
      "telephone": "+52-XXX-XXX-XXXX",
      "priceRange": "$$",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Ciudad",
        "addressCountry": "MX"
      },
      "sameAs": [
        "https://www.facebook.com/floresvictoria",
        "https://www.instagram.com/floresvictoria"
      ]
    }
    </script>
    
    <!-- JSON-LD: WebSite con SearchAction -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": "https://flores-victoria.com/#website",
      "url": "https://flores-victoria.com/",
      "name": "Flores Victoria",
      "publisher": {
        "@type": "Organization",
        "@id": "https://flores-victoria.com/#business"
      },
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://flores-victoria.com/pages/catalog.html?search={search_term_string}"
        },
        "query-input": "required name=search_term_string"
      }
    }
    </script>
    
    <!-- Resto del HEAD -->
    <link rel="stylesheet" href="/css/style.css">
</head>
<body>
    <!-- Contenido de la página -->
</body>
</html>
```

---

## 🔧 Archivos a Crear

### 1. js/schema-generator.js

```javascript
/**
 * Schema Generator Utility
 * Genera y añade schemas JSON-LD dinámicamente
 */

/**
 * Inyecta un schema en el HEAD
 * @param {Object} schema - Schema JSON-LD a inyectar
 */
export function injectSchema(schema) {
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(schema, null, 2);
  document.head.appendChild(script);
  
  if (window.DEBUG) {
    console.log('✅ Schema inyectado:', schema['@type']);
  }
}

/**
 * Genera Product schema desde objeto producto
 * @param {Object} product - Datos del producto
 * @returns {Object} Schema Product
 */
export function generateProductSchema(product) {
  const baseURL = window.location.origin;
  
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${baseURL}/pages/product-detail.html?id=${product.id}`,
    "name": product.name,
    "image": product.images?.map(img => `${baseURL}${img}`) || [],
    "description": product.description || '',
    "sku": product.sku || `PROD-${product.id}`,
    "brand": {
      "@type": "Brand",
      "name": "Flores Victoria"
    },
    "offers": {
      "@type": "Offer",
      "url": `${baseURL}/pages/product-detail.html?id=${product.id}`,
      "priceCurrency": "MXN",
      "price": product.price.toFixed(2),
      "priceValidUntil": new Date(Date.now() + 90*24*60*60*1000).toISOString().split('T')[0],
      "availability": product.stock > 0 
        ? "https://schema.org/InStock" 
        : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": "Flores Victoria"
      }
    }
  };
}

/**
 * Genera BreadcrumbList desde DOM
 * @returns {Object} Schema BreadcrumbList
 */
export function generateBreadcrumbSchema() {
  const breadcrumbEl = document.querySelector('.breadcrumb');
  if (!breadcrumbEl) return null;
  
  const baseURL = window.location.origin;
  const items = [];
  
  breadcrumbEl.querySelectorAll('a, span').forEach((el, index) => {
    const text = el.textContent.trim();
    const href = el.getAttribute('href');
    
    if (text) {
      items.push({
        "@type": "ListItem",
        "position": index + 1,
        "name": text,
        "item": href ? `${baseURL}${href}` : window.location.href
      });
    }
  });
  
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items
  };
}

/**
 * Genera FAQPage desde DOM
 * @returns {Object} Schema FAQPage
 */
export function generateFAQSchema() {
  const faqItems = document.querySelectorAll('.faq-item, .accordion-item');
  if (faqItems.length === 0) return null;
  
  const questions = Array.from(faqItems).map(item => {
    const question = item.querySelector('.faq-question, .accordion-header, h3, h4');
    const answer = item.querySelector('.faq-answer, .accordion-body, p');
    
    if (!question || !answer) return null;
    
    return {
      "@type": "Question",
      "name": question.textContent.trim(),
      "acceptedAnswer": {
        "@type": "Answer",
        "text": answer.textContent.trim()
      }
    };
  }).filter(q => q !== null);
  
  if (questions.length === 0) return null;
  
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": questions
  };
}

/**
 * Auto-inyecta breadcrumb schema si existe en la página
 */
export function autoInjectBreadcrumb() {
  const schema = generateBreadcrumbSchema();
  if (schema) {
    injectSchema(schema);
  }
}

/**
 * Auto-inyecta FAQ schema si existe en la página
 */
export function autoInjectFAQ() {
  const schema = generateFAQSchema();
  if (schema) {
    injectSchema(schema);
  }
}

// Auto-ejecución para breadcrumbs (presente en todas las páginas)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', autoInjectBreadcrumb);
} else {
  autoInjectBreadcrumb();
}
```

### 2. Integrar en product-detail.js

```javascript
// Añadir al final del archivo product-detail.js existente
import { generateProductSchema, injectSchema } from './schema-generator.js';

// Cuando se carga el producto
async function loadProduct(productId) {
  const product = await fetchProduct(productId);
  
  // ... código existente para renderizar producto ...
  
  // Generar e inyectar schema
  const schema = generateProductSchema(product);
  injectSchema(schema);
}
```

---

## ✅ Checklist de Implementación

### Preparación
- [ ] Recopilar datos reales del negocio (dirección, teléfono, horarios)
- [ ] Crear carpeta `js/schemas/` para utilidades
- [ ] Backup del código actual

### Fase 1: Schemas Estáticos
- [ ] LocalBusiness en index.html
- [ ] WebSite con SearchAction en index.html
- [ ] FAQPage en faq.html
- [ ] Validar con Schema Validator
- [ ] Commit: "feat(seo): add static JSON-LD schemas"

### Fase 2: Utilidad Generadora
- [ ] Crear `js/schema-generator.js`
- [ ] Implementar `generateProductSchema()`
- [ ] Implementar `generateBreadcrumbSchema()`
- [ ] Implementar `generateFAQSchema()`
- [ ] Tests unitarios (opcional)
- [ ] Commit: "feat(seo): add schema generator utility"

### Fase 3: Integración Dinámica
- [ ] Integrar en product-detail.js
- [ ] Integrar breadcrumbs en todas las páginas
- [ ] Integrar en catalog.html (ItemList)
- [ ] Commit: "feat(seo): integrate dynamic schemas in product and catalog"

### Fase 4: Validación
- [ ] Validar con Schema.org Validator
- [ ] Validar con Google Rich Results Test
- [ ] Testing manual en Chrome Console
- [ ] Verificar no hay duplicados
- [ ] Commit: "test(seo): validate all JSON-LD schemas"

### Fase 5: Documentación
- [ ] Actualizar README con schemas implementados
- [ ] Crear guía de mantenimiento
- [ ] Documentar cómo agregar nuevos schemas

---

## 📊 Impacto Esperado

### Corto Plazo (1-3 meses)
- ✅ Validación en Rich Results Test
- ✅ Schemas visibles en Google Search Console
- 📈 Mejora de CTR +5-10% (rich snippets más atractivos)

### Medio Plazo (3-6 meses)
- 🌟 Aparición en "People also ask" (FAQ)
- 🌟 Productos con estrellas en resultados de búsqueda
- 📈 Mejora de tráfico orgánico +15-20%

### Largo Plazo (6-12 meses)
- 🏆 Knowledge Graph en búsquedas de marca
- 🏆 Sitelinks con búsqueda integrada
- 📈 Mejora de conversión +10-15%

---

## 🚨 Errores Comunes a Evitar

### ❌ URLs Relativas
```json
// MAL
"url": "/pages/product.html"

// BIEN
"url": "https://flores-victoria.com/pages/product.html"
```

### ❌ Datos Inconsistentes
```json
// El precio en schema debe coincidir con el precio visible
"price": "599.00"  // ← Debe ser igual al mostrado en la página
```

### ❌ Schemas Duplicados
```json
// Usar @id para referenciar entidades
{
  "@id": "https://flores-victoria.com/#business",
  // ...
}

// Luego referenciar:
{
  "publisher": {
    "@id": "https://flores-victoria.com/#business"
  }
}
```

### ❌ HTML Dentro de Campos de Texto
```json
// MAL
"description": "<p>Hermosas rosas <strong>premium</strong></p>"

// BIEN
"description": "Hermosas rosas premium"
```

### ❌ Fechas en Formato Incorrecto
```json
// MAL
"priceValidUntil": "31/12/2025"

// BIEN
"priceValidUntil": "2025-12-31"  // ISO 8601
```

---

## 📚 Recursos

### Documentación
- **Schema.org**: https://schema.org/
- **Google Search Central**: https://developers.google.com/search/docs/appearance/structured-data
- **JSON-LD Playground**: https://json-ld.org/playground/

### Herramientas
- **Schema Validator**: https://validator.schema.org/
- **Rich Results Test**: https://search.google.com/test/rich-results
- **Structured Data Linter**: http://linter.structured-data.org/

### Tutoriales
- **Google Guide**: https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data
- **Schema.org Getting Started**: https://schema.org/docs/gs.html

---

## ⏱️ Estimación de Tiempo

| Fase | Tiempo | Dificultad |
|------|--------|------------|
| Preparación | 30 min | ⭐☆☆☆☆ |
| Schemas Estáticos | 2-3 hrs | ⭐⭐☆☆☆ |
| Utilidad Generadora | 2-3 hrs | ⭐⭐⭐☆☆ |
| Integración Dinámica | 2-3 hrs | ⭐⭐⭐☆☆ |
| Validación | 1-2 hrs | ⭐⭐☆☆☆ |
| **TOTAL** | **8-12 hrs** | ⭐⭐⭐☆☆ |

---

## 🚀 Próximos Pasos Después de JSON-LD

1. **Canonical URLs**: Agregar `<link rel="canonical">` a todas las páginas
2. **Open Graph Images**: Crear 20 imágenes 1200×630px
3. **Sitemap XML**: Generar sitemap.xml dinámico
4. **Robots.txt**: Configurar crawling inteligente
5. **Google Search Console**: Monitorear rich results

---

**Documento creado**: 24 de noviembre de 2025  
**Última actualización**: 24 de noviembre de 2025  
**Prioridad**: ALTA 🔥  
**ROI Esperado**: ALTO ⭐⭐⭐⭐⭐
