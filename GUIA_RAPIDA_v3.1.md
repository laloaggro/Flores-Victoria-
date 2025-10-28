# 🚀 Guía Rápida: Nuevas Funcionalidades v3.1

## 📋 Índice Rápido
1. [Sistema de Promociones](#-sistema-de-promociones)
2. [Filtros de Productos](#-filtros-de-productos)
3. [Lista de Deseos](#-lista-de-deseos)
4. [Optimizaciones de Performance](#-optimizaciones-de-performance)

---

## 🎁 Sistema de Promociones

### Para Administradores

#### Crear una Promoción
1. Acceder a `admin-panel/promotions.html`
2. Click en **"Nueva Promoción"**
3. Completar el formulario:
   ```
   - Código: VERANO2025
   - Tipo: Porcentaje
   - Valor: 20
   - Fecha inicio: 01/01/2025
   - Fecha fin: 31/01/2025
   - Límite de usos: 100
   ```
4. Click **"Guardar"**

#### Tipos de Promociones Disponibles

**1. Descuento por Porcentaje**
```json
{
  "code": "SAVE20",
  "type": "percentage",
  "value": 20,
  "maxDiscount": 50
}
```
→ 20% de descuento, máximo $50

**2. Descuento Fijo**
```json
{
  "code": "FIXED10",
  "type": "fixed",
  "value": 10
}
```
→ $10 de descuento directo

**3. BOGO (Buy One Get One)**
```json
{
  "code": "BOGO50",
  "type": "BOGO",
  "value": 50
}
```
→ 50% en el segundo producto

**4. Envío Gratis**
```json
{
  "code": "FREESHIP",
  "type": "free_shipping",
  "minPurchase": 50
}
```
→ Envío gratis en compras > $50

### Para Clientes

#### Aplicar Promoción Manual
```javascript
// En la página del carrito
document.querySelector('#promo-code-input').value = 'VERANO2025';
document.querySelector('#apply-promo-btn').click();
```

#### Promoción Auto-aplicada
Las promociones elegibles se aplican automáticamente al carrito.

---

## 🔍 Filtros de Productos

### Uso en Frontend

#### Inicialización
```javascript
const filters = new ProductFilters({
  apiUrl: '/api/products',
  filtersContainer: '#filters-container',
  productsContainer: '#products-container',
  resultsPerPage: 12,
  defaultSort: 'newest'
});

filters.init();
```

#### Configurar Filtros Programáticamente
```javascript
// Filtrar por categoría
filters.setFilter('category', 'rosas');

// Filtrar por rango de precio
filters.setPriceRange(10, 50);

// Filtrar por color
filters.setFilter('color', 'rojo');

// Aplicar todos los filtros
filters.applyFilters();
```

#### Ordenamiento
```javascript
// Opciones disponibles:
filters.setFilter('sort', 'newest');     // Más recientes
filters.setFilter('sort', 'price-asc');  // Precio: menor a mayor
filters.setFilter('sort', 'price-desc'); // Precio: mayor a menor
filters.setFilter('sort', 'popular');    // Más populares
filters.setFilter('sort', 'name-asc');   // Nombre: A-Z
filters.setFilter('sort', 'name-desc');  // Nombre: Z-A
```

#### Cambiar Vista
```javascript
filters.setViewMode('grid'); // Vista de cuadrícula
filters.setViewMode('list'); // Vista de lista
```

### HTML de Ejemplo

```html
<!-- Contenedor de filtros -->
<aside id="filters-container"></aside>

<!-- Contenedor de productos -->
<main id="products-container"></main>

<!-- Modal Quick View -->
<div id="quick-view-modal"></div>

<!-- Scripts -->
<script src="js/product-filters.js"></script>
<link rel="stylesheet" href="css/product-filters.css">
```

---

## ❤️ Lista de Deseos

### Inicialización
```javascript
const wishlist = new WishlistManager();
```

### Operaciones Básicas

#### Agregar Producto
```javascript
wishlist.add({
  id: '123',
  name: 'Rosa Roja',
  price: 25,
  image: 'rosa.jpg'
});
```

#### Eliminar Producto
```javascript
wishlist.remove('123');
```

#### Toggle (Agregar/Eliminar)
```javascript
wishlist.toggle(productData);
```

#### Verificar si existe
```javascript
if (wishlist.has('123')) {
  console.log('Producto en favoritos');
}
```

#### Obtener todos
```javascript
const items = wishlist.getAll();
console.log(`${items.length} productos en favoritos`);
```

#### Limpiar todo
```javascript
wishlist.clear();
```

### Eventos Personalizados

```javascript
// Escuchar cuando se agrega
document.addEventListener('wishlist:add', (e) => {
  console.log('Agregado:', e.detail.product);
});

// Escuchar cuando se elimina
document.addEventListener('wishlist:remove', (e) => {
  console.log('Eliminado:', e.detail.productId);
});

// Escuchar cuando se limpia
document.addEventListener('wishlist:clear', () => {
  console.log('Wishlist limpiada');
});
```

### Sincronización con Servidor

El wishlist se sincroniza automáticamente cuando:
- El usuario inicia sesión
- Se agrega/elimina un producto
- Se restaura desde el servidor

```javascript
// Sincronizar manualmente
await wishlist.sync();
```

### UI Example

```html
<button class="wishlist-btn" data-product-id="123">
  <span class="heart">❤️</span>
</button>

<script>
document.querySelector('.wishlist-btn').addEventListener('click', (e) => {
  const productId = e.target.dataset.productId;
  wishlist.toggle({
    id: productId,
    name: 'Producto',
    price: 25,
    image: 'image.jpg'
  });
  
  // Actualizar UI
  e.target.classList.toggle('active');
});
</script>
```

---

## ⚡ Optimizaciones de Performance

### Lazy Loading de Imágenes

#### Uso Automático
```javascript
// Se inicializa automáticamente al cargar performance.js
// Todas las imágenes con class="lazy" se cargan diferidamente
```

#### HTML para Lazy Loading
```html
<img 
  class="lazy" 
  data-src="imagen-real.jpg" 
  src="placeholder.jpg" 
  alt="Descripción"
>
```

#### Uso Programático
```javascript
const lazyLoader = new LazyImageLoader('.lazy-image');
lazyLoader.observe();
```

### Imágenes Responsive

```javascript
const responsiveImages = new ResponsiveImages({
  selector: '.responsive-img',
  sizes: [400, 800, 1200, 1600]
});

responsiveImages.init();
```

### Code Splitting

```javascript
const splitter = new CodeSplitter();

// Cargar módulo bajo demanda
splitter.loadModule('checkout').then(module => {
  module.init();
});
```

### Cache Manager

#### Guardar en cache
```javascript
const cache = new CacheManager({
  maxSize: 50,        // Máximo 50 items
  defaultTTL: 3600000 // 1 hora
});

// Guardar datos
cache.set('products', productsData, 3600000);
```

#### Recuperar del cache
```javascript
const products = cache.get('products');
if (products) {
  // Usar datos del cache
} else {
  // Hacer fetch de datos
}
```

#### Limpiar cache
```javascript
cache.remove('products');  // Eliminar un item
cache.clear();             // Limpiar todo
```

### Performance Monitor

```javascript
const monitor = new PerformanceMonitor();

// Obtener métricas
const metrics = monitor.getMetrics();
console.log('FCP:', metrics.fcp);
console.log('LCP:', metrics.lcp);
console.log('FID:', metrics.fid);
console.log('CLS:', metrics.cls);

// Obtener timing de navegación
const timing = monitor.getNavigationTiming();
console.log('DOM loaded:', timing.domContentLoaded);
console.log('Page loaded:', timing.loadComplete);

// Recursos cargados
const resources = monitor.getResourceTiming();
resources.forEach(resource => {
  console.log(`${resource.name}: ${resource.duration}ms`);
});
```

---

## 🎨 Personalización CSS

### Variables CSS Disponibles

```css
:root {
  /* Colores primarios */
  --primary-color: #667eea;
  --primary-hover: #5568d3;
  
  /* Colores de estado */
  --success-color: #10b981;
  --error-color: #ef4444;
  --warning-color: #f59e0b;
  
  /* Espaciado */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  
  /* Bordes */
  --border-radius: 8px;
  --border-radius-lg: 12px;
  
  /* Sombras */
  --shadow-sm: 0 2px 8px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.1);
  --shadow-lg: 0 8px 24px rgba(0,0,0,0.12);
}
```

### Personalizar Colores

```css
/* Cambiar color primario */
.add-to-cart-btn {
  background: var(--primary-color);
}

.add-to-cart-btn:hover {
  background: var(--primary-hover);
}

/* Personalizar tarjetas de producto */
.product-card {
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
}
```

---

## 🔧 Troubleshooting

### Promociones no se aplican

**Problema**: El código promocional no funciona

**Soluciones**:
1. Verificar que la promoción esté activa
2. Comprobar fechas de validez
3. Revisar límites de uso
4. Validar monto mínimo de compra

```javascript
// Debug de promoción
fetch('/api/promotions/validate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ code: 'CODIGO' })
})
.then(r => r.json())
.then(data => console.log(data));
```

### Filtros no funcionan

**Problema**: Los filtros no muestran resultados

**Soluciones**:
1. Verificar que `apiUrl` sea correcto
2. Comprobar estructura de datos del API
3. Revisar console para errores

```javascript
// Debug de filtros
filters.filters; // Ver filtros activos
filters.products; // Ver productos cargados
```

### Wishlist no sincroniza

**Problema**: Los favoritos no se guardan en el servidor

**Soluciones**:
1. Verificar que el usuario esté autenticado
2. Comprobar endpoint del API
3. Revisar network tab para errores

```javascript
// Debug de wishlist
console.log('Auth token:', localStorage.getItem('authToken'));
console.log('Wishlist items:', wishlist.getAll());
```

### Imágenes no cargan (Lazy Loading)

**Problema**: Imágenes no se muestran

**Soluciones**:
1. Verificar que tengan class="lazy"
2. Comprobar data-src esté definido
3. Revisar si IntersectionObserver está disponible

```javascript
// Debug lazy loading
if ('IntersectionObserver' in window) {
  console.log('✅ IntersectionObserver disponible');
} else {
  console.log('❌ Usar fallback');
}
```

---

## 📞 Referencia Rápida

### Archivos Importantes

```
frontend/
├── js/
│   ├── promotion-manager.js      # Gestión de promociones
│   ├── product-filters.js        # Filtros de productos
│   ├── wishlist.js               # Lista de deseos
│   ├── performance.js            # Optimizaciones
│   └── components/
│       └── promotion-banners.js  # Banners
├── css/
│   ├── promotions.css            # Estilos promociones
│   └── product-filters.css       # Estilos filtros
└── productos.html                # Página de ejemplo

admin-panel/
├── promotions.html               # Admin de promociones
└── js/
    └── promotion-admin.js        # Lógica admin

microservices/
└── promotion-service/            # Microservicio
    ├── server.js
    ├── routes.js
    └── Dockerfile
```

### Puertos

```
API Gateway:        3000
Auth Service:       3001
Order Service:      3002
Payment Service:    3003
Promotion Service:  3019  ← NUEVO
MongoDB:            27017
```

---

**Última actualización**: Enero 2025  
**Versión**: 3.1.0
