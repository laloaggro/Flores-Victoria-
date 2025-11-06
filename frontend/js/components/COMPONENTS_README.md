# Componentes Unificados - Header y Footer

## 📋 Descripción

Este sistema permite tener un header y footer unificados en todas las páginas del sitio. Cualquier cambio que hagas en los componentes se reflejará automáticamente en todas las páginas.

## 🚀 Instalación Rápida

### Opción 1: Uso Básico (Recomendado)

1. **Incluye los scripts en tus páginas HTML:**

```html
<!DOCTYPE html>
<html lang="es">
<head>
    <!-- ... tus meta tags y CSS ... -->
</head>
<body>
    <!-- Header dinámico -->
    <div id="header-root"></div>
    
    <!-- Tu contenido principal -->
    <main>
        <!-- ... contenido de la página ... -->
    </main>
    
    <!-- Footer dinámico -->
    <div id="footer-root"></div>
    
    <!-- Scripts al final del body -->
    <script src="/js/components/header-component.js"></script>
    <script src="/js/components/footer-component.js"></script>
</body>
</html>
```

### Opción 2: Uso con Template Base

Crea un archivo `template.html` base:

```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>%%TITLE%% - Flores Victoria</title>
    
    <!-- Estilos -->
    <link rel="stylesheet" href="/css/base.css">
    <link rel="stylesheet" href="/css/style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
    <!-- Header Unificado -->
    <div id="header-root"></div>
    
    <!-- Contenido Principal -->
    <main id="main-content">
        %%CONTENT%%
    </main>
    
    <!-- Footer Unificado -->
    <div id="footer-root"></div>
    
    <!-- Scripts -->
    <script src="/js/components/header-component.js"></script>
    <script src="/js/components/footer-component.js"></script>
    %%EXTRA_SCRIPTS%%
</body>
</html>
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
  }
};
```

### Modificar el Header

Edita `/js/components/header-component.js` de la misma manera.

## ✅ Ventajas

1. **Un solo lugar para editar**: Cambias el footer/header una vez y se actualiza en todas las páginas
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
