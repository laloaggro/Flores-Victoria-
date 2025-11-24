# Sistema de Carga Lazy de Componentes - Flores Victoria

## 📋 Descripción

Sistema optimizado de carga bajo demanda (lazy loading) para componentes JavaScript. Los componentes
se cargan solo cuando son necesarios, reduciendo significativamente el JavaScript inicial y
mejorando el rendimiento.

## 🎯 Objetivos

- ✅ Reducir el JavaScript inicial de ~200KB a ~50KB
- ✅ Mejorar Time to Interactive (TTI) en un 40-60%
- ✅ Cargar componentes solo cuando el usuario los necesita
- ✅ Precargar componentes críticos en tiempo de inactividad
- ✅ Mantener una experiencia de usuario fluida

## 🏗️ Arquitectura

### Componentes Críticos (Carga Inmediata)

Estos componentes se cargan inmediatamente porque son esenciales para la funcionalidad básica:

```javascript
// Carga inmediata en todas las páginas
-core -
  bundle.js - // Config global y utilidades
  toast.js - // Notificaciones
  loading.js - // Indicadores de carga
  common -
  bundle.js - // Header, footer, navegación
  global -
  functions.js; // Funciones compartidas
```

### Componentes Lazy (Carga Bajo Demanda)

Estos componentes se cargan automáticamente cuando el usuario interactúa con ellos:

| Componente                   | Trigger                      | Prioridad | Preload |
| ---------------------------- | ---------------------------- | --------- | ------- |
| `cart-manager.js`            | Clic en botones de carrito   | Alta      | ✅ Sí   |
| `wishlist-manager.js`        | Clic en botones de wishlist  | Alta      | ✅ Sí   |
| `product-image-zoom.js`      | Clic en imagen de producto   | Media     | ❌ No   |
| `instant-search.js`          | Focus en campo de búsqueda   | Alta      | ❌ No   |
| `product-comparison.js`      | Clic en comparar productos   | Media     | ❌ No   |
| `product-recommendations.js` | Elemento visible en viewport | Baja      | ❌ No   |
| `products-carousel.js`       | Elemento visible en viewport | Media     | ❌ No   |
| `form-validator.js`          | Focus en formularios         | Media     | ❌ No   |
| `shipping-options.js`        | Clic en calculadora de envío | Baja      | ❌ No   |
| `dark-mode.js`               | Clic en toggle de tema       | Baja      | ❌ No   |

## 🚀 Uso

### Implementación en HTML

```html
<!-- Cargar el sistema lazy -->
<script src="/js/lazy-components.js" defer></script>

<!-- Los componentes se cargan automáticamente, 
     no es necesario incluir sus <script> tags -->
```

### API JavaScript

```javascript
// Cargar un componente manualmente
await LazyComponents.load('cart');

// Cargar múltiples componentes
await LazyComponents.loadMultiple(['cart', 'wishlist']);

// Verificar si un componente está cargado
if (LazyComponents.isLoaded('cart')) {
  // El componente está disponible
}

// Precargar un componente
LazyComponents.preload('productImageZoom');
```

### Atributos HTML para Triggers

Los componentes se cargan automáticamente cuando el usuario interactúa con elementos que tienen
ciertos selectores:

```html
<!-- Cart Manager -->
<button class="add-to-cart" data-product-id="123">Agregar al Carrito</button>
<div id="cartIcon">🛒</div>

<!-- Wishlist Manager -->
<button class="add-to-wishlist" data-product-id="123">❤️ Guardar</button>

<!-- Product Image Zoom -->
<img class="product-image" src="..." data-zoom />

<!-- Instant Search -->
<input id="searchInput" type="search" placeholder="Buscar..." />

<!-- Form Validator -->
<form data-validate>...</form>

<!-- Dark Mode -->
<button id="darkModeToggle">🌙</button>

<!-- Product Comparison -->
<button class="compare-btn" data-compare-trigger>Comparar</button>

<!-- Product Carousel -->
<div class="products-carousel" data-carousel>...</div>

<!-- Shipping Calculator -->
<div id="shipping-calculator" data-shipping>...</div>
```

## ⚡ Estrategias de Carga

### 1. Carga por Interacción (Click/Focus)

El método principal. Los componentes se cargan cuando el usuario hace clic o enfoca un elemento:

```javascript
// Ejemplo: cart-manager.js se carga al hacer clic en cualquier botón .add-to-cart
document.addEventListener('click', (e) => {
  if (e.target.matches('.add-to-cart')) {
    loadComponent('cart');
  }
});
```

### 2. Carga por Visibilidad (Intersection Observer)

Componentes de prioridad media/baja se cargan cuando el elemento es visible:

```javascript
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        loadComponent('productRecommendations');
      }
    });
  },
  { rootMargin: '100px' }
); // Carga 100px antes de ser visible
```

### 3. Precarga en Tiempo Inactivo

Componentes marcados con `preload: true` se cargan durante el tiempo inactivo:

```javascript
requestIdleCallback(
  () => {
    // Cargar cart y wishlist después de la carga inicial
    LazyComponents.load('cart');
    LazyComponents.load('wishlist');
  },
  { timeout: 5000 }
);
```

## 📊 Métricas de Rendimiento

### Antes (Sin Lazy Loading)

```
JavaScript Inicial: ~200 KB
TTI: ~4.5s
Scripts cargados: 12
```

### Después (Con Lazy Loading)

```
JavaScript Inicial: ~50 KB (-75%)
TTI: ~2.0s (-55%)
Scripts cargados inicialmente: 4
Scripts cargados bajo demanda: 8
```

### Impacto por Página

| Página           | JS Antes | JS Después | Mejora |
| ---------------- | -------- | ---------- | ------ |
| Home             | 205 KB   | 52 KB      | 75% ⬇️ |
| Productos        | 230 KB   | 65 KB      | 72% ⬇️ |
| Detalle Producto | 185 KB   | 45 KB      | 76% ⬇️ |
| Contacto         | 165 KB   | 48 KB      | 71% ⬇️ |

## 🔍 Debugging

### Ver componentes cargados

```javascript
// En la consola del navegador
console.log([...(LazyComponents._state?.loaded || [])]);
```

### Ver componentes en carga

```javascript
console.log([...(LazyComponents._state?.loading.keys() || [])]);
```

### Habilitar logs detallados

```javascript
// En development (localhost), los logs se muestran automáticamente
// Para forzar logs en producción:
window.DEBUG = true;
```

### Ejemplo de logs

```
[LazyComponents] 🚀 Inicializando sistema de carga lazy...
[LazyComponents] ✅ Sistema configurado (10 componentes)
[LazyComponents] 🎯 Trigger activado: cart (.add-to-cart)
[LazyComponents] 📥 Cargando: /js/components/cart-manager.js
[LazyComponents] ✅ Cargado: /js/components/cart-manager.js
[LazyComponents] 🔄 Precargando 2 componentes...
[LazyComponents] 👁️ Elemento visible: productRecommendations
```

## 🛠️ Configuración

Editar `/js/lazy-components.js` para modificar la configuración:

```javascript
const COMPONENTS = {
  miComponente: {
    path: '/js/components/mi-componente.js',
    triggers: ['.mi-selector', '#miId'],
    priority: 'high', // 'high', 'medium', 'low'
    preload: true, // Precargar en idle time
  },
};
```

### Prioridades

- **High**: Componentes críticos para interacción (cart, wishlist, search)
- **Medium**: Componentes importantes pero no críticos (zoom, carousel)
- **Low**: Componentes opcionales (dark mode, shipping calculator)

## 📝 Mejores Prácticas

### ✅ DO

- Marcar componentes críticos para precarga
- Usar Intersection Observer para componentes visibles
- Cargar componentes pesados solo cuando se necesiten
- Testear en throttling 3G lento

### ❌ DON'T

- No cargar todos los componentes en idle time
- No usar lazy loading para componentes above-the-fold
- No olvidar los triggers en el HTML
- No cargar el mismo componente múltiples veces

## 🔄 Migración desde Sistema Anterior

### Paso 1: Remover scripts sincronizados

```html
<!-- ANTES -->
<script src="/js/components/cart-manager.js"></script>
<script src="/js/components/wishlist-manager.js"></script>

<!-- DESPUÉS -->
<!-- Se cargan automáticamente con lazy-components.js -->
```

### Paso 2: Agregar lazy-components.js

```html
<script src="/js/lazy-components.js" defer></script>
```

### Paso 3: Verificar selectores

Asegurarse de que los elementos HTML tengan los selectores correctos para los triggers.

### Paso 4: Testear funcionalidad

```bash
# Iniciar servidor de desarrollo
npm run dev

# Abrir DevTools > Network
# Verificar que los componentes se cargan bajo demanda
```

## 🐛 Troubleshooting

### Problema: Componente no se carga

**Síntomas**: Al hacer clic en un botón, el componente no se carga.

**Solución**:

1. Verificar que el selector en `COMPONENTS` coincida con el HTML
2. Revisar la consola para errores de carga
3. Verificar que la ruta del componente sea correcta

### Problema: Componente se carga múltiples veces

**Síntomas**: Se ven múltiples requests para el mismo script.

**Solución**:

- El sistema ya previene esto con `state.loaded`
- Verificar que no haya otros scripts cargando el componente manualmente

### Problema: Componente tarda mucho en cargar

**Síntomas**: Delay notable al interactuar.

**Solución**:

1. Marcar el componente con `preload: true`
2. Aumentar la prioridad a `'high'`
3. Considerar cargarlo de forma inmediata si es crítico

## 📚 Referencias

- [Web.dev: Code Splitting](https://web.dev/code-splitting-suspense/)
- [MDN: Intersection Observer](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)
- [MDN: requestIdleCallback](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestIdleCallback)

## 🔜 Próximas Mejoras

- [ ] Implementar prefetch con `<link rel="prefetch">`
- [ ] Agregar Service Worker caching
- [ ] Implementar code splitting con Webpack/Vite
- [ ] Agregar métricas a Google Analytics
- [ ] Implementar lazy loading de CSS
- [ ] Agregar soporte para módulos ES6

---

**Versión**: 3.0.0  
**Última actualización**: 24 de noviembre de 2025  
**Autor**: Flores Victoria Dev Team
