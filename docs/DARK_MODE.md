# 🎨 DARK MODE & RESPONSIVE DESIGN - FLORES VICTORIA v3.0

## 📋 Tabla de Contenidos

- [Características](#características)
- [Implementación](#implementación)
- [Uso](#uso)
- [Variables CSS](#variables-css)
- [Compatibilidad](#compatibilidad)
- [Personalización](#personalización)

---

## ✨ Características

### 🌙 Dark Mode
- **Auto-detección**: Detecta automáticamente la preferencia del sistema (`prefers-color-scheme`)
- **Persistencia**: Guarda la preferencia en `localStorage`
- **Toggle suave**: Transiciones suaves entre temas (0.3s)
- **Botón flotante**: Control de tema siempre visible
- **Eventos**: Dispara evento `themechange` para integración con otros componentes

### 📱 Responsive Design
- **Mobile-first**: Diseño optimizado para dispositivos móviles
- **Breakpoints**: 768px para tablet/desktop
- **Touch-friendly**: Botones y controles adaptados para pantallas táctiles
- **Viewport optimizado**: Meta tags correctos para scaling

---

## 🚀 Implementación

### 1. Archivos CSS
```html
<link rel="stylesheet" href="/css/dark-mode.css">
```

### 2. Script JavaScript
```html
<script src="/js/theme-toggle.js"></script>
```

### 3. Meta Tags (en `<head>`)
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes">
<meta name="theme-color" content="#3b82f6" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#1a1d23" media="(prefers-color-scheme: dark)">
<meta name="color-scheme" content="light dark">
```

---

## 📖 Uso

### Toggle Automático
El botón de cambio de tema se crea automáticamente si no existe:

```javascript
// El ThemeManager se inicializa automáticamente
const themeManager = new ThemeManager();
```

### Toggle Manual
```javascript
// Cambiar tema programáticamente
themeManager.toggle();
```

### Obtener Tema Actual
```javascript
// Ver tema activo
console.log(themeManager.theme); // 'dark' o 'light'
```

### Escuchar Cambios de Tema
```javascript
window.addEventListener('themechange', (event) => {
  console.log('Nuevo tema:', event.detail.theme);
});
```

---

## 🎨 Variables CSS

### Light Mode (Default)
```css
:root {
  --bg-primary: #ffffff;
  --bg-secondary: #f8f9fa;
  --text-primary: #212529;
  --accent: #0d6efd;
  --success: #28a745;
  --warning: #ffc107;
  --danger: #dc3545;
}
```

### Dark Mode
```css
[data-theme="dark"] {
  --bg-primary: #1a1d23;
  --bg-secondary: #22262e;
  --text-primary: #e9ecef;
  --accent: #4dabf7;
  --success: #51cf66;
  --warning: #ffd43b;
  --danger: #ff6b6b;
}
```

### Usar Variables
```css
.mi-componente {
  background: var(--bg-primary);
  color: var(--text-primary);
  border-color: var(--border-color);
}
```

---

## 🔧 Personalización

### Cambiar Colores
Edita las variables en `:root` y `[data-theme="dark"]` en `/css/dark-mode.css`:

```css
[data-theme="dark"] {
  --bg-primary: #0d1117;     /* GitHub dark background */
  --accent: #58a6ff;         /* GitHub accent blue */
}
```

### Añadir Nuevas Variables
```css
:root {
  --my-custom-color: #ff5733;
}

[data-theme="dark"] {
  --my-custom-color: #c70039;
}
```

### Modificar Transiciones
```css
:root {
  --transition-fast: 0.1s ease;    /* Más rápido */
  --transition-normal: 0.5s ease;  /* Más lento */
}
```

---

## 📱 Responsive Breakpoints

### Mobile (< 768px)
```css
@media (max-width: 768px) {
  .container {
    padding: var(--spacing-md);
  }
  
  .btn {
    width: 100%;
  }
}
```

### Tablet/Desktop (≥ 768px)
Estilos por defecto aplican para pantallas grandes.

---

## ✅ Compatibilidad

### Navegadores Soportados
- ✅ Chrome/Edge 88+
- ✅ Firefox 85+
- ✅ Safari 14+
- ✅ Opera 74+

### Características Usadas
- CSS Variables (Custom Properties)
- `prefers-color-scheme` media query
- localStorage API
- data attributes (`data-theme`)

---

## 🎯 Componentes Incluidos

### 1. Cards
```html
<div class="card">
  <div class="card-header">Título</div>
  <p>Contenido...</p>
</div>
```

### 2. Buttons
```html
<button class="btn btn-primary">Primario</button>
<button class="btn btn-success">Éxito</button>
<button class="btn btn-danger">Peligro</button>
```

### 3. Forms
```html
<div class="form-group">
  <label class="form-label">Nombre</label>
  <input type="text" class="form-control">
</div>
```

### 4. Tables
```html
<table class="table">
  <thead>
    <tr><th>Columna 1</th></tr>
  </thead>
  <tbody>
    <tr><td>Datos</td></tr>
  </tbody>
</table>
```

### 5. Badges
```html
<span class="badge badge-success">Activo</span>
<span class="badge badge-warning">Pendiente</span>
<span class="badge badge-danger">Error</span>
```

---

## 🔍 Debugging

### Verificar Tema Almacenado
```javascript
console.log(localStorage.getItem('theme'));
```

### Resetear Tema
```javascript
localStorage.removeItem('theme');
location.reload();
```

### Ver Preferencia del Sistema
```javascript
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
console.log('Sistema prefiere dark mode:', prefersDark);
```

---

## 🎓 Ejemplos

### Crear Toggle Personalizado
```html
<button onclick="themeManager.toggle()">
  Cambiar Tema 🌗
</button>
```

### Aplicar Tema Específico
```javascript
// Forzar dark mode
themeManager.setTheme('dark');

// Forzar light mode
themeManager.setTheme('light');
```

### Integrar con React/Vue
```javascript
// React Hook
useEffect(() => {
  const handleThemeChange = (e) => {
    setTheme(e.detail.theme);
  };
  
  window.addEventListener('themechange', handleThemeChange);
  return () => window.removeEventListener('themechange', handleThemeChange);
}, []);
```

---

## 📊 Performance

### Métricas
- **Carga inicial**: ~2KB (CSS + JS minificado)
- **Transiciones**: Hardware-accelerated con `transform`
- **localStorage**: < 10 bytes
- **Render time**: < 16ms (60fps)

### Optimizaciones
- CSS Variables evitan duplicación de código
- Transiciones solo en propiedades necesarias
- Script se ejecuta después del DOM

---

## 🚨 Troubleshooting

### El tema no persiste
```javascript
// Verificar que localStorage funciona
localStorage.setItem('test', '1');
console.log(localStorage.getItem('test')); // debe mostrar '1'
```

### Colores no cambian
```css
/* Asegúrate de usar var() para todos los colores */
.elemento {
  background: var(--bg-primary);  /* ✅ Correcto */
  background: #ffffff;            /* ❌ Incorrecto */
}
```

### Botón no aparece
```javascript
// Crear manualmente si es necesario
themeManager.createToggleButton();
```

---

## 📚 Recursos Adicionales

- [MDN: CSS Variables](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
- [MDN: prefers-color-scheme](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme)
- [Web.dev: Color Scheme](https://web.dev/color-scheme/)

---

## 🎉 Próximas Mejoras

- [ ] Temas adicionales (high contrast, sepia)
- [ ] Sincronización entre pestañas
- [ ] Transiciones personalizables
- [ ] Modo automático (hora del día)
- [ ] Accesibilidad mejorada (keyboard navigation)

---

**Versión**: 3.0  
**Última actualización**: Octubre 2025  
**Autor**: Flores Victoria Team
