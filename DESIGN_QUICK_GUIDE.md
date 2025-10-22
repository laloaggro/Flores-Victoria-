# 🎨 Guía Rápida del Sistema de Diseño Unificado
## Flores Victoria v2.0

---

## ✅ Lo que se completó hoy

### 1. **Sistema de Diseño Centralizado** 🎯
- ✅ Creado `design-system.css` con 120+ variables CSS
- ✅ Paleta de colores unificada (verde naturaleza + púrpura admin)
- ✅ Componentes reutilizables (botones, cards, badges, alerts)
- ✅ Sistema de espaciado y tipografía consistente
- ✅ Soporte completo para modo oscuro

### 2. **Páginas Corregidas** 📄
- ✅ **admin.html** - Reconstruido completamente (tenía header duplicado)
- ✅ **index.html** - Logo agregado + sistema de diseño
- ✅ **products.html** - Logo agregado + sistema de diseño

### 3. **Documentación** 📚
- ✅ Auditoría completa en `DESIGN_AUDIT_2025.md`
- ✅ Script de verificación `scripts/verify-design.sh`
- ✅ Esta guía rápida

---

## 🚀 Cómo usar el nuevo sistema

### Incluir en cualquier página HTML:

```html
<!-- En el <head> -->
<link rel="stylesheet" href="/css/design-system.css">
<link rel="stylesheet" href="/css/base.css">
<link rel="stylesheet" href="/css/style.css">
```

### Agregar el logo:

```html
<div class="logo">
    <img src="/logo.svg" alt="Arreglos Victoria" width="50" height="50">
    <h1>Arreglos Victoria</h1>
</div>
```

### Usar componentes:

```html
<!-- Botones -->
<button class="btn btn-primary">Acción Principal</button>
<button class="btn btn-secondary">Acción Secundaria</button>
<button class="btn btn-admin">Panel Admin</button>

<!-- Tarjetas -->
<div class="card">
    <h3>Título de la tarjeta</h3>
    <p>Contenido...</p>
</div>

<!-- Insignias -->
<span class="badge badge-success">Activo</span>
<span class="badge badge-warning">Pendiente</span>
<span class="badge badge-danger">Cancelado</span>

<!-- Alertas -->
<div class="alert alert-success">
    ¡Operación exitosa!
</div>
```

### Variables CSS disponibles:

```css
/* Colores */
var(--primary)          /* Verde principal */
var(--secondary)        /* Rosa suave */
var(--admin-primary)    /* Púrpura admin */

/* Espaciado */
var(--space-4)          /* 1rem (16px) */
var(--space-6)          /* 1.5rem (24px) */

/* Tipografía */
var(--text-lg)          /* 1.125rem (18px) */
var(--font-bold)        /* 700 */

/* Sombras */
var(--shadow-md)        /* Sombra mediana */

/* Bordes */
var(--radius-lg)        /* 0.75rem */
```

---

## 🎨 Paleta de Colores

### Frontend (Verde Naturaleza)
```
🟢 Primary:   #2E7D32 (Verde bosque)
🌸 Secondary: #D4B0C7 (Rosa suave)
🍃 Accent:    #A2C9A5 (Verde menta)
```

### Admin Panel (Púrpura Profesional)
```
🟣 Admin Primary:   #667eea (Púrpura vibrante)
🟪 Admin Secondary: #764ba2 (Púrpura profundo)
💜 Admin Accent:    #9F7AEA (Lila)
```

### Semánticos
```
✅ Success: #10B981 (Verde)
⚠️  Warning: #F59E0B (Amarillo)
❌ Danger:  #EF4444 (Rojo)
ℹ️  Info:    #3B82F6 (Azul)
```

---

## 📐 Sistema de Espaciado

```
space-1:  4px   ▪
space-2:  8px   ▪▪
space-3:  12px  ▪▪▪
space-4:  16px  ▪▪▪▪
space-6:  24px  ▪▪▪▪▪▪
space-8:  32px  ▪▪▪▪▪▪▪▪
space-12: 48px  ▪▪▪▪▪▪▪▪▪▪▪▪
```

**Uso:** `padding: var(--space-4);` o clases `.p-4`, `.mt-6`, `.mb-8`

---

## 🔤 Tipografía

### Familias
- **Headings:** Playfair Display (serif)
- **Body:** Poppins (sans-serif)

### Tamaños
```
text-xs:   12px  (Etiquetas pequeñas)
text-sm:   14px  (Texto secundario)
text-base: 16px  (Texto normal)
text-lg:   18px  (Texto grande)
text-xl:   20px  (Subtítulos)
text-2xl:  24px  (Títulos pequeños)
text-3xl:  30px  (Títulos medianos)
text-4xl:  36px  (Títulos grandes)
```

### Pesos
```
font-light:    300
font-normal:   400
font-medium:   500
font-semibold: 600
font-bold:     700
```

---

## 📱 Responsive Design

### Breakpoints
```
sm:  640px   (Tablets pequeñas)
md:  768px   (Tablets)
lg:  1024px  (Laptops)
xl:  1280px  (Desktops)
```

### Clases responsive
```html
<div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4">
    <!-- 1 columna en móvil, 3 en tablet, 4 en desktop -->
</div>
```

---

## 🌙 Modo Oscuro

### Activar modo oscuro:

```javascript
// JavaScript
document.documentElement.setAttribute('data-theme', 'dark');

// Alternar
const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
```

### Colores modo oscuro:
- Fondo: `#0F172A`
- Tarjetas: `#1E293B`
- Texto: `#E2E8F0`

---

## 📋 Ejemplos Completos

### Página básica con el nuevo sistema:

```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mi Página - Arreglos Victoria</title>
    
    <!-- Sistema de diseño -->
    <link rel="stylesheet" href="/css/design-system.css">
    <link rel="stylesheet" href="/css/base.css">
    <link rel="stylesheet" href="/css/style.css">
</head>
<body>
    <header class="header">
        <div class="container">
            <div class="logo">
                <img src="/logo.svg" alt="Arreglos Victoria" width="50" height="50">
                <h1>Arreglos Victoria</h1>
            </div>
        </div>
    </header>
    
    <main>
        <div class="container py-8">
            <div class="card">
                <h2 class="text-2xl font-bold mb-4">Título</h2>
                <p>Contenido...</p>
                <button class="btn btn-primary mt-4">Acción</button>
            </div>
        </div>
    </main>
    
    <footer class="footer">
        <div class="container text-center py-6">
            <p>&copy; 2025 Arreglos Victoria</p>
        </div>
    </footer>
</body>
</html>
```

### Grid de productos:

```html
<div class="container">
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="card">
            <img src="producto1.jpg" alt="Producto 1">
            <h3 class="text-xl font-semibold mt-4">Ramo de Rosas</h3>
            <p class="text-secondary mt-2">$29.990</p>
            <button class="btn btn-primary mt-4 w-full">Comprar</button>
        </div>
        <!-- Más productos... -->
    </div>
</div>
```

---

## ✨ Utilidades CSS más usadas

### Layout
```css
.flex              /* display: flex */
.flex-col          /* flex-direction: column */
.items-center      /* align-items: center */
.justify-between   /* justify-content: space-between */
.gap-4             /* gap: 1rem */
```

### Espaciado
```css
.p-4               /* padding: 1rem */
.py-6              /* padding-top/bottom: 1.5rem */
.px-8              /* padding-left/right: 2rem */
.mt-4              /* margin-top: 1rem */
.mb-6              /* margin-bottom: 1.5rem */
```

### Texto
```css
.text-center       /* text-align: center */
.text-lg           /* font-size: 1.125rem */
.font-bold         /* font-weight: 700 */
```

### Visibilidad
```css
.hidden            /* display: none */
.w-full            /* width: 100% */
.h-full            /* height: 100% */
```

---

## 🔧 Herramientas y Scripts

### Verificar implementación:
```bash
./scripts/verify-design.sh
```

### Ver servidor de desarrollo:
```bash
cd frontend
npm run dev
# Abre http://localhost:5173
```

---

## 📚 Recursos Adicionales

1. **Auditoría completa:** Ver `DESIGN_AUDIT_2025.md`
2. **Código fuente:** Ver `frontend/public/css/design-system.css`
3. **Ejemplo funcional:** Ver `frontend/pages/admin.html`

---

## 🎯 Próximos Pasos

### Para desarrolladores:

1. **Revisar visualmente:**
   - Abrir http://localhost:5173
   - Navegar a http://localhost:5173/pages/admin.html
   - Verificar que el logo se vea bien

2. **Aplicar a más páginas:**
   - about.html
   - contact.html
   - login.html
   - register.html

3. **Crear componentes reutilizables:**
   - Header component
   - Footer component
   - Product card component

### Para diseñadores:

1. Revisar paleta de colores
2. Validar accesibilidad (contraste)
3. Crear guía de estilo visual

---

## ❓ FAQ

**P: ¿Tengo que actualizar todas las páginas ahora?**  
R: No, el sistema es compatible hacia atrás. Puedes actualizar progresivamente.

**P: ¿Cómo cambio los colores?**  
R: Edita las variables en `design-system.css`, líneas 11-40.

**P: ¿Puedo usar mis propios componentes?**  
R: Sí, el sistema es extensible. Agrega tus clases personalizadas.

**P: ¿Funciona en navegadores antiguos?**  
R: Sí, usa variables CSS (soportadas desde 2016) y fallbacks automáticos.

---

## 📞 Soporte

Si encuentras problemas:
1. Revisa la consola del navegador (F12)
2. Verifica que los archivos CSS estén cargando
3. Consulta la documentación en `DESIGN_AUDIT_2025.md`

---

**Última actualización:** 22 de octubre de 2025  
**Versión:** 2.0  
**Estado:** ✅ Activo y en producción
