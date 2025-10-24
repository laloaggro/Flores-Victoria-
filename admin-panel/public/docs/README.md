# 📚 Documentación Flores Victoria

Sistema de documentación interactiva para el proyecto Flores Victoria.

## 🌟 Características

### Diseño Moderno
- ✅ **Dark/Light Theme**: Cambio dinámico de tema con persistencia en localStorage
- ✅ **Responsive**: Adaptado para desktop, tablet y móvil
- ✅ **Animaciones**: Transiciones suaves y efectos visuales
- ✅ **Tipografía**: Fuentes optimizadas para legibilidad

### Navegación Inteligente
- ✅ **Sidebar Navegable**: Menú lateral con categorías organizadas
- ✅ **Single Page App**: Navegación sin recargar la página
- ✅ **Hash Navigation**: URLs con #section para compartir
- ✅ **Breadcrumbs**: Navegación contextual

### Funcionalidades
- ✅ **Copy Code**: Botones para copiar código con un click
- ✅ **Syntax Highlighting**: Resaltado de código (cuando hljs está disponible)
- ✅ **Search**: Búsqueda en toda la documentación (Ctrl/Cmd + K)
- ✅ **Print-Friendly**: Formato optimizado para imprimir
- ✅ **External Links**: Se abren en nueva pestaña automáticamente

## 📁 Estructura

```
docs/
├── index.html          # Página principal de documentación
├── styles.css          # Estilos completos con sistema de diseño
├── script.js           # Funcionalidad interactiva
├── assets/
│   └── architecture-diagram.svg  # Diagrama de arquitectura
└── README.md           # Este archivo
```

## 🎨 Secciones Disponibles

### 🚀 Inicio Rápido
- Visión General
- Guía Rápida (10 minutos)
- Arquitectura del Sistema

### 🔧 Configuración
- Instalación Detallada
- Variables de Entorno
- Gestión de Puertos

### 📚 Servicios
- API Gateway (Puerto 3000)
- Auth Service (Puerto 3001)
- Payment Service (Puerto 3003)
- Order Service (Puerto 3002)
- Notification Service (Puerto 3004)
- Admin Panel (Puerto 3021)

### 🛠️ Scripts
- Comandos de Desarrollo
- Testing
- Validación de Enlaces

### 📖 Notion
- Setup de Notion (45 min)
- Workflow y Templates

### 🔍 Referencia
- ADRs (Architectural Decision Records)
- Troubleshooting
- Próximos Pasos

## 🎯 Cómo Usar

### Acceso Directo
1. Desde el Admin Panel: Click en **📚 Documentación**
2. URL directa: `http://localhost:3021/docs/index.html`

### Navegación
- **Sidebar**: Click en cualquier sección para navegar
- **Teclado**: Usa las flechas para moverte entre secciones
- **Búsqueda**: Presiona `Ctrl/Cmd + K` para buscar

### Tema
- Click en el botón 🌙/☀️ en el header
- El tema se guarda automáticamente

### Copiar Código
- Cada bloque de código tiene un botón "Copiar"
- Click para copiar al portapapeles
- Feedback visual cuando se copia

## 🔧 Personalización

### Cambiar Colores
Edita las variables CSS en `styles.css`:

```css
:root {
    --primary-color: #E91E63;    /* Rosa principal */
    --secondary-color: #9C27B0;  /* Morado secundario */
    --accent-color: #FF4081;     /* Acento */
    /* ... más colores */
}
```

### Agregar Secciones
1. Agrega un `<section>` en `index.html`:
```html
<section id="nueva-seccion" class="doc-section">
    <h2>🆕 Nueva Sección</h2>
    <!-- Contenido aquí -->
</section>
```

2. Agrega el link en el sidebar:
```html
<li><a href="#nueva-seccion" data-section="nueva-seccion">Nueva Sección</a></li>
```

### Modificar Scripts
El archivo `script.js` contiene todas las funcionalidades:
- `showSection()`: Muestra/oculta secciones
- `initSearch()`: Búsqueda
- `generateTOC()`: Tabla de contenidos
- Y más...

## 📊 Estadísticas

- **Peso total**: ~150KB (HTML + CSS + JS)
- **Tiempo de carga**: < 1 segundo
- **Secciones**: 15+
- **Comandos documentados**: 20+
- **Servicios documentados**: 6

## 🔗 Enlaces Relacionados

- [NOTION_SETUP_GUIDE.md](../../docs/NOTION_SETUP_GUIDE.md) - Guía de Notion
- [SIGUIENTE_PASO.md](../../docs/SIGUIENTE_PASO.md) - Próximos pasos
- [README.md](../../README.md) - README principal del proyecto
- [Panel de Control](../control-center.html) - Admin Panel

## 💡 Tips

### Performance
- La documentación carga todas las secciones pero solo muestra una
- Las imágenes usan lazy loading cuando es posible
- El código se resalta solo cuando `highlight.js` está disponible

### SEO
- Usa URLs con hash para compartir secciones específicas
- Meta tags optimizados
- Estructura semántica HTML5

### Accesibilidad
- Skip link para saltar al contenido
- Contraste WCAG AA compliant
- Navegación por teclado funcional
- Alt text en todas las imágenes

## 🐛 Problemas Conocidos

1. **Syntax Highlighting**: Requiere highlight.js (no incluido por defecto)
2. **Search**: Actualmente es básica, busca en todo el contenido
3. **Mobile**: El sidebar ocupa espacio en móvil (mejora futura)

## 📝 Changelog

### v1.0.0 (2025-10-24)
- ✅ Documentación inicial completa
- ✅ 15 secciones documentadas
- ✅ Sistema de temas dark/light
- ✅ Navegación SPA
- ✅ Copy code buttons
- ✅ Responsive design
- ✅ Integración con Admin Panel

## 🤝 Contribuir

Para agregar o mejorar la documentación:

1. Edita `index.html` para agregar contenido
2. Modifica `styles.css` para cambios visuales
3. Actualiza `script.js` para nueva funcionalidad
4. Testea en diferentes navegadores
5. Commit y push

## 📞 Soporte

Si encuentras errores o tienes sugerencias:
- Abre un issue en GitHub
- Revisa la sección de Troubleshooting
- Consulta los ADRs para decisiones técnicas

---

**Última actualización**: 24 de octubre de 2025  
**Versión**: 1.0.0  
**Autor**: Flores Victoria Team
