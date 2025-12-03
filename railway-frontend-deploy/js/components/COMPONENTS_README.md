# Componentes Unificados - Sistema Completo

## 📋 Descripción

Sistema completo de componentes reutilizables para Flores Victoria. Todos los componentes están
centralizados para actualizaciones instantáneas en todo el sitio.

## 🎯 Componentes Disponibles

### Componentes Estructurales

- **header-component.js** - Navegación principal con menú móvil y estados activos
- **footer-component.js** - Pie de página con enlaces y información de contacto
- **breadcrumbs.js** - Navegación de migas de pan automática

### Componentes de UI

- **toast.js** - Notificaciones tipo toast (success, error, info, warning)
- **loading.js** - Indicador de carga global con overlay
- **whatsapp-cta.js** - Botón flotante de WhatsApp

### Componentes Meta

- **head-meta.js** - Meta tags unificados (SEO, Open Graph, PWA)
- **common-bundle.js** - Bundle que carga todos los componentes comunes

## 📦 Bundle Unificado (Recomendado)

La forma más simple es usar el **common-bundle.js** que carga header, footer y WhatsApp
automáticamente:

```html
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Mi Página - Flores Victoria</title>
    <link rel="stylesheet" href="/css/style.css" />
  </head>
  <body>
    <!-- Header automático -->
    <div id="header-root"></div>

    <!-- Tu contenido -->
    <main>
      <h1>Contenido de la página</h1>
    </main>

    <!-- Footer automático -->
    <div id="footer-root"></div>

    <!-- Un solo script carga todo -->
    <script src="/js/components/common-bundle.js"></script>
  </body>
</html>
```

## 🚀 Uso Individual de Componentes

## 🚀 Uso Individual de Componentes

### Toast Notifications

```javascript
// Mostrar notificación de éxito
ToastComponent.success('¡Producto agregado al carrito!');

// Mostrar error
ToastComponent.error('Error al procesar el pedido');

// Info con duración personalizada (en ms)
ToastComponent.info('Procesando...', 6000);

// Warning
ToastComponent.warning('Stock limitado');
```

### Loading Spinner

```javascript
// Mostrar loading
LoadingComponent.show();

// Con mensaje personalizado
LoadingComponent.show('Procesando pago...');

// Ocultar loading
LoadingComponent.hide();

// Ejemplo en petición AJAX
async function fetchProducts() {
  LoadingComponent.show('Cargando productos...');
  try {
    const response = await fetch('/api/products');
    const data = await response.json();
    ToastComponent.success('Productos cargados');
  } catch (error) {
    ToastComponent.error('Error al cargar productos');
  } finally {
    LoadingComponent.hide();
  }
}
```

### WhatsApp CTA

```javascript
// Ya se monta automáticamente con common-bundle.js
// Personalización en common-bundle.js línea 12
window.FloresVictoriaConfig = {
  whatsappNumber: '56963603177',
  // ...
};
```

### Head Meta (para SEO)

```html
<script src="/js/components/head-meta.js"></script>
<script>
  HeadMetaComponent.inject({
    title: 'Arreglos Florales Premium',
    description: 'Los mejores arreglos florales de Santiago',
    keywords: ['flores', 'arreglos', 'santiago'],
    image: '/images/og-image.jpg',
    path: '/pages/products.html',
  });
</script>
```

### Breadcrumbs

```html
<!-- Insertar div donde quieres las breadcrumbs -->
<div id="breadcrumbs-root"></div>

<!-- Cargar el componente -->
<script src="/js/components/breadcrumbs.js"></script>
```

## 🛠️ Utilidades Globales

El `common-bundle.js` incluye utilidades útiles:

```javascript
// Formatear precio
const price = FloresVictoriaUtils.formatPrice(25990); // "$25.990"

// Abrir WhatsApp
FloresVictoriaUtils.openWhatsApp('Quiero el ramo de rosas');

// Scroll suave
FloresVictoriaUtils.scrollTo('#productos', -80);

// Debounce
const searchDebounced = FloresVictoriaUtils.debounce(search, 300);

// Throttle
const scrollThrottled = FloresVictoriaUtils.throttle(onScroll, 100);

// Detectar móvil
if (FloresVictoriaUtils.isMobile()) {
  console.log('Es dispositivo móvil');
}

// Copiar al portapapeles
await FloresVictoriaUtils.copyToClipboard('Código: FLORES2025');
```

## 📝 Conversión de Páginas Existentes

### Antes (index.html):

```html
<body>
  <footer class="site-footer">
    <!-- Todo el HTML del footer -->
  </footer>
</body>
```

### Después (index.html):

```html
<body>
  <!-- Solo incluir el contenedor -->
  <div id="footer-root"></div>

  <!-- Y el script -->
  <script src="/js/components/footer-component.js"></script>
</body>
```

## 🔧 Personalización

### Modificar el Footer

Edita `/js/components/footer-component.js`:

```javascript
const FooterComponent = {
  render() {
    return `
      <footer class="site-footer">
        <!-- Modifica aquí el HTML del footer -->
        <!-- Los cambios se aplicarán a TODAS las páginas -->
      </footer>
    `;
  },
};
```

### Modificar el Header

Edita `/js/components/header-component.js` de la misma manera.

## ✅ Ventajas

1. **Un solo lugar para editar**: Cambias el footer/header una vez y se actualiza en todas las
   páginas
2. **Consistencia garantizada**: Todas las páginas tendrán exactamente el mismo footer/header
3. **Fácil mantenimiento**: No necesitas buscar y reemplazar en múltiples archivos
4. **Año dinámico**: El copyright se actualiza automáticamente cada año
5. **Navegación activa**: El menú resalta automáticamente la página actual

## 📦 Archivos Creados

```
frontend/
├── js/
│   └── components/
│       ├── header-component.js  (Header unificado)
│       ├── footer-component.js  (Footer unificado)
│       └── COMPONENTS_README.md (Este archivo)
```

## 🔄 Migración Paso a Paso

1. **Respaldar** tus archivos actuales
2. **Reemplazar** el HTML del footer con `<div id="footer-root"></div>`
3. **Agregar** el script: `<script src="/js/components/footer-component.js"></script>`
4. **Probar** la página
5. **Repetir** para todas las páginas

## 💡 Ejemplo Completo

Ver `frontend/examples/page-with-components.html` para un ejemplo completo de uso.

## 🐛 Solución de Problemas

**El footer no aparece:**

- Verifica que el script esté cargando correctamente (revisa la consola)
- Asegúrate de que el `id="footer-root"` sea correcto
- El script debe estar DESPUÉS del `<div id="footer-root"></div>`

**Los estilos no se aplican:**

- Verifica que `/css/style.css` esté cargado
- Los estilos del footer están en `style.css` (busca `.site-footer`)

**El año no se actualiza:**

- El componente usa `new Date().getFullYear()` automáticamente

## 📞 Soporte

Para dudas o problemas, revisa la documentación en `frontend/MANTENIMIENTO.md`
