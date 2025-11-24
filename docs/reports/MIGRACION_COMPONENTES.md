# 🔄 Plan de Migración de Componentes Estáticos → Dinámicos

## 📊 Estado Actual

### Páginas con Headers Estáticos (12)
- ✅ `pages/products.html` - **MIGRADO**
- ⏳ `pages/cart.html`
- ⏳ `pages/checkout.html` (2 headers)
- ⏳ `pages/contact.html`
- ⏳ `pages/wishlist.html`
- ⏳ `pages/faq.html`
- ⏳ `pages/about.html`
- ⏳ `pages/catalog.html`
- ⏳ `pages/blog.html`
- ⏳ `pages/gallery.html`
- ⏳ `pages/testimonials.html`
- ⏳ `pages/demo-microinteractions.html`

### index.html
- ⚠️ Header-root comentado, necesita activación

---

## 🎯 Estrategia de Migración

### Opción 1: Migración Manual (Recomendada para control)
Reemplazar manualmente en cada página:

**Buscar:**
```html
<header class="header">
    <!-- todo el contenido del header -->
</header>
```

**Reemplazar con:**
```html
<div id="header-root"></div>
```

### Opción 2: Script Automático
Crear script bash para reemplazar automáticamente.

---

## ✅ Checklist de Migración por Página

### Cada página debe tener:
```html
<head>
    <!-- ... otros meta tags ... -->
    <meta name="version" content="2.0.0">
</head>
<body>
    <!-- Header dinámico -->
    <div id="header-root"></div>
    
    <!-- Breadcrumbs dinámico -->
    <div id="breadcrumbs-root"></div>
    
    <!-- Contenido de la página -->
    
    <!-- Footer dinámico -->
    <div id="footer-root"></div>
    
    <!-- Scripts -->
    <script src="/js/components/common-bundle.js"></script>
</body>
```

---

## 🚀 Prioridades de Migración

### Alta Prioridad (páginas principales)
1. ⏳ `index.html` - Página principal
2. ⏳ `pages/catalog.html` - Catálogo de productos
3. ⏳ `pages/cart.html` - Carrito de compras
4. ⏳ `pages/checkout.html` - Proceso de pago
5. ⏳ `pages/contact.html` - Formulario de contacto

### Media Prioridad (páginas de contenido)
6. ⏳ `pages/about.html` - Sobre nosotros
7. ⏳ `pages/blog.html` - Blog
8. ⏳ `pages/gallery.html` - Galería
9. ⏳ `pages/wishlist.html` - Lista de deseos

### Baja Prioridad (páginas secundarias)
10. ⏳ `pages/faq.html` - Preguntas frecuentes
11. ⏳ `pages/testimonials.html` - Testimonios
12. ⏳ `pages/demo-microinteractions.html` - Demo

---

## 🔧 Beneficios de la Migración

### Ventajas
- ✅ Código DRY (Don't Repeat Yourself)
- ✅ Actualizaciones centralizadas
- ✅ Consistencia en navegación
- ✅ Menos líneas de código HTML
- ✅ Mejora de mantenibilidad
- ✅ Carga dinámica optimizada

### Consideraciones
- ⚠️ Requiere JavaScript habilitado
- ⚠️ Pequeño delay en renderizado inicial (< 100ms)
- ⚠️ Necesita common-bundle.js cargado

---

## 📝 Notas Técnicas

### Components Loader prioriza:
1. **Esenciales (0ms delay):** header, footer, breadcrumbs, toast
2. **Opcionales (1s delay):** whatsapp, loading

### Fallback Automático
Si falla el code splitting, carga todos los componentes en modo legacy.

---

## 🎯 Próximos Pasos

### Opción A: Migración Completa
Migrar las 12 páginas restantes de una vez.

### Opción B: Migración Gradual
Migrar por prioridades (Alta → Media → Baja).

### Opción C: Enfoque Híbrido
Migrar solo páginas críticas, mantener secundarias estáticas.

---

**¿Qué enfoque prefieres?**
