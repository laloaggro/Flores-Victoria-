# 🌸 Flores Victoria - Panel Administrativo Unificado

## 📋 Resumen

Panel administrativo enterprise unificado con navegación por tabs, 8 temas personalizables, y
métricas dinámicas en tiempo real.

**Versión**: 4.0.0  
**Última actualización**: 25 Octubre 2025  
**Puerto**: 3021 (fijo en todos los ambientes)

---

## 🎯 Características Principales

### ✨ Interfaz Unificada

- **Navegación por Tabs**: Sistema de navegación interno con hash (#dashboard, #control-center,
  etc.)
- **Sidebar Profesional**: Navegación principal con estados activos y accesibilidad (ARIA)
- **Diseño Responsivo**: Mobile-first con breakpoints en 768px y 1024px
- **Animaciones Suaves**: Transitions CSS y fade-in en actualizaciones

### 🎨 Sistema de Temas (8 variantes)

1. **Light** (default) - Tema claro profesional
2. **Dark** - Modo oscuro con alto contraste
3. **Ocean** - Azules y verdes oceánicos
4. **Forest** - Verdes naturales
5. **Retro** - Colores vintage cálidos
6. **NeoGlass** - Efecto glassmorphism
7. **CyberNight** - Neón cyber con brillos
8. **Minimal Pro** - Minimalista extremo

**Persistencia**: Los temas se guardan en `localStorage` y se aplican automáticamente al recargar.

### 📊 Secciones del Panel

#### 1. Dashboard (#dashboard)

- Hero header con estadísticas clave
- Tarjetas de acceso rápido a todas las secciones
- Métricas generales del sistema

#### 2. Centro de Control (#control-center)

- **Acciones Rápidas**: Botones para operaciones comunes
  - Reiniciar servicios
  - Desplegar actualización
- **Mini Métricas**: Tareas del día (hoy, pendientes, éxitos)
- **Estado de Servicios**: Indicadores visuales
  - API Gateway (online)
  - Auth Service (online)
  - AI Service (warning)
  - Payment Service (online)

#### 3. Analytics (#analytics)

- **KPIs en Tiempo Real**:
  - Usuarios activos (actualización cada 5s)
  - Órdenes procesadas
  - Tasa de conversión
  - Latencia promedio
- Tarjeta de resumen con enlace a análisis completo

#### 4. Logs (#logs)

- **Stream en Tiempo Real**: Nuevo log cada 8-15 segundos
- **Controles Profesionales**:
  - **Ventana Nueva**: Botón para abrir logs en ventana modal expandida (pantalla completa)
  - **Búsqueda**: Input de filtrado por palabra clave en tiempo real
  - **Filtro por Nivel**: Dropdown (ALL, DEBUG, INFO, WARN, ERROR)
  - **Filtro por Servicio**: Dropdown (ALL, API, Auth, Order, Payment, AI, Admin, System)
  - **Pause/Resume**: Control del stream en vivo (⏸/▶)
  - **Limpiar**: Botón para vaciar todos los logs con confirmación
  - **Exportar**: Descarga logs visibles a archivo .txt con timestamp
  - **Reset**: Restablecer todos los filtros
- **Ventana Modal de Logs**:
  - Modal de pantalla completa (90% viewport) con backdrop blur
  - Sincronización en tiempo real (1s) con el stream principal
  - Filtros independientes en la modal (búsqueda, nivel, servicio)
  - Contadores de logs totales y visibles
  - Header con indicador de entorno (DEV/TEST/PROD)
  - Cierre con botón, tecla ESC, o click en backdrop
  - Diseño responsive hasta 1400px de ancho
  - Fondo oscuro para mejor legibilidad de logs
- **Estadísticas Live**:
  - Contador de logs totales
  - Contador de logs visibles (post-filtrado)
  - Indicador visual cuando está pausado
- **Niveles con Color**:
  - `DEBUG` (azul): Información de desarrollo
  - `INFO` (verde): Operaciones normales
  - `WARN` (naranja): Advertencias
  - `ERROR` (rojo): Errores críticos
- **Logs por Entorno** (51 tipos únicos):
  - **Development** (15 logs): Hot reload, webpack, NPM, API mock, debugging
  - **Testing** (16 logs): Jest, Cypress, coverage, CI pipeline, load tests
  - **Production** (20 logs): Deploy, scaling, CDN, payments, monitoring, backups
- **Servicios Monitoreados**:
  - API Gateway, Auth, Payment, Order, AI Service, Admin Panel
  - Jest, Cypress, Lighthouse, Coverage, Load Test, CI Pipeline
  - Deploy, CDN, Auto Scaling, Email, Rate Limiter, Backup, Analytics
- **Auto-limpieza**: Mantiene solo las últimas 50 entradas
- **Filtrado Inteligente**: Los filtros se aplican en tiempo real mientras llegan nuevos logs

### 5. Monitoreo (#monitoring)

- **Salud de Servicios**:
  - Estado online/warning/offline por entorno (Dev/Test/Prod)
  - Consulta real de endpoints `/health` según `env-config.json`
  - Manejo de timeout y códigos HTTP (200=online, 4xx/5xx=warning, timeout=offline)
  - Latencia real por servicio (ms) + tooltip con URL y hora del último check
  - Uptime/memoria como valores de ejemplo para servicios demo
- **Métricas del Sistema** (actualización cada 5s):
  - CPU %
  - RAM %
  - Disco %
  - Red (transferencia)

#### 6. Documentación (#documentation)

- **Guías Rápidas**: Índice de enlaces
  - Arquitectura del sistema
  - Configuración de servicios
  - API Reference
  - Deployment Guide
- Enlace a documentación completa

#### 7. Backups (#backup)

- **Backups Recientes**: Lista de respaldos
  - Nombre del archivo
  - Fecha y hora
  - Tamaño
- Botones para crear nuevo backup y ver todos

#### 8. Changelog (#changelog)

- **Historial de Versiones**: Registro completo de cambios
  - v4.0.0 - Panel unificado, 8 temas, métricas dinámicas
  - v3.0.0 - PWA, servicio IA, WebAssembly
  - v2.0.0 - Microservicios, Docker, CI/CD
- **Categorías por versión**:
  - ✨ Nuevas Características
  - 🔧 Mejoras
  - 📚 Documentación
  - 🐛 Correcciones
- **Visual Timeline**: Badges con tipo de versión (major/minor/patch)

### 🌐 Selector de Entorno (Dev/Test/Prod)

- Selector fijo en top-right, junto al selector de temas.
- Estados: `dev` (Desarrollo), `test` (Testing), `prod` (Producción).
- Persistencia en `localStorage` (clave `panelEnv`).
- Configuración de endpoints via `admin-panel/public/config/env-config.json`.
- Uso actual: etiqueta entradas de Logs con el entorno y muestra un badge en los títulos.
- Monitoreo: actualiza “Salud de Servicios” para `apiGateway` y `orderService` usando `/health` del
  entorno seleccionado.
- Monitoreo: ahora también chequea `adminPanel` y muestra latencia real.

Estructura del archivo de configuración:

```
{
  "defaultEnv": "dev",
  "envs": {
    "dev":  { "label": "Desarrollo",  "services": { "adminPanel": "http://localhost:3021", "apiGateway": "http://localhost:4000",           "orderService": "http://localhost:4004" } },
    "test": { "label": "Testing",     "services": { "adminPanel": "http://localhost:3021", "apiGateway": "http://test.api.local",        "orderService": "http://test.api.local/orders" } },
    "prod": { "label": "Producción",  "services": { "adminPanel": "https://admin.floresvictoria.cl", "apiGateway": "https://api.floresvictoria.cl", "orderService": "https://api.floresvictoria.cl/orders" } }
  }
}
```

---

## 🔧 Arquitectura Técnica

### Stack

- **HTML5 + CSS3**: Estructura y estilos
- **JavaScript Vanilla**: Sin frameworks, máxima performance
- **CSS Variables**: Sistema de diseño basado en tokens
- **LocalStorage**: Persistencia de preferencias

### Estructura del Código

```
admin-panel/public/index.html
├── <head>
│   ├── Meta tags y viewport
│   ├── Google Fonts (Inter, JetBrains Mono)
│   ├── CSS Variables (Design System)
│   ├── Theme Variants (8 temas)
│   ├── Contrast Adjustments (dark/cybernight)
│   ├── Section Visibility (.section-panel)
│   └── Scripts (setTheme, métricas, logs)
├── <body>
│   ├── Theme Selector (fixed top-right)
│   ├── App Container
│   │   ├── Sidebar
│   │   │   ├── Header (logo + subtitle)
│   │   │   └── Navigation (3 secciones)
│   │   │       ├── Principal (Dashboard)
│   │   │       ├── Operación (Control, Analytics, Logs, Monitoring)
│   │   │       └── Soporte (Documentación, Backups)
│   │   └── Main Content
│   │       ├── Hero Header
│   │       └── Sections (7 tabs)
│   └── Scripts
│       ├── Hash Navigation
│       ├── Dynamic Metrics (5s interval)
│       └── Live Logs (8-15s interval)
```

### CSS Design System

**Variables Base**:

```css
--primary: #2563eb (blue-600) --secondary: #059669 (green-600) --accent: #d97706 (orange-600)
  --bg-body: #f8fafc (slate-50) --bg-sidebar: #ffffff --bg-card: #ffffff;
```

**Espaciado**:

```css
--space-1: 0.25rem (4px) --space-2: 0.5rem (8px) --space-4: 1rem (16px) --space-8: 2rem (32px)
  --space-16: 4rem (64px);
```

**Sombras**:

```css
--shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1) --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1)
  --shadow-2xl: 0 25px 50px rgba(0, 0, 0, 0.25) --shadow-colored: 0 20px 40px
  rgba(37, 99, 235, 0.25);
```

### JavaScript Modules

#### 1. Theme Management

```javascript
function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('panelTheme', theme);
}
```

#### 2. Navigation System

```javascript
function showSection(targetId) {
  // Hide all sections
  // Show target section
  // Update active state in sidebar
  // Update aria-selected
}
```

#### 3. Dynamic Metrics

```javascript
function updateMetrics() {
  // Hero stats (Servicios, Eventos)
  // Analytics KPIs (Usuarios, Órdenes, Conversión, Latency)
  // Control Center tasks
  // Monitoring system metrics
}
setInterval(updateMetrics, 5000);
```

#### 4. Live Logs

```javascript
function addLogEntry() {
  // Generate timestamp
  // Select random log message
  // Interpolate variables
  // Add to DOM with fade-in
  // Keep only last 20 entries
}
setInterval(addLogEntry, 8000 - 15000);
```

---

## 🚀 Deployment

### Configuración de Puertos

**Desarrollo** (`docker-compose.dev-conflict-free.yml`):

```yaml
admin-panel:
  ports:
    - '3021:3000'
```

**Producción** (`docker-compose.production.yml`):

```yaml
admin-panel:
  ports:
    - '3021:3000'
```

### Variables de Entorno

```env
# Admin Panel
ADMIN_PORT=3021
NODE_ENV=production
```

### Comandos Docker

```bash
# Desarrollo
docker-compose -f docker-compose.dev-conflict-free.yml up admin-panel

# Producción
docker-compose -f docker-compose.production.yml up -d admin-panel

# Logs
docker-compose logs -f admin-panel

# Rebuild
docker-compose build --no-cache admin-panel
```

---

## 📱 Accesibilidad (WCAG 2.1 AA)

### Implementado

- ✅ **ARIA Labels**: `aria-labelledby`, `aria-selected`
- ✅ **Roles Semánticos**: `role="region"`, `role="navigation"`
- ✅ **Contraste**: Ratios > 4.5:1 en todos los temas
- ✅ **Navegación por Teclado**: Tab, Enter, Space
- ✅ **Focus Visible**: Outline en elementos interactivos
- ✅ **Screen Reader**: Textos descriptivos y estructura semántica
- ✅ **Skip link**: Enlace "Saltar al contenido" al inicio del documento
- ✅ **Reduced Motion**: `@media (prefers-reduced-motion: reduce)` para minimizar animaciones

### Por Implementar

- ⏳ Live regions para actualizaciones dinámicas

---

## 🧪 Testing

### Manual Testing Checklist

**Navegación**:

- [ ] Sidebar links cambian de sección correctamente
- [ ] Hash en URL se actualiza (#dashboard, #logs, etc.)
- [ ] Botón Back/Forward del navegador funciona
- [ ] Links activos se marcan visualmente

**Temas**:

- [ ] Selector cambia tema inmediatamente
- [ ] Tema persiste después de recargar
- [ ] Contraste adecuado en dark/cybernight
- [ ] Todos los 8 temas funcionan

**Métricas Dinámicas**:

- [ ] Números se actualizan cada 5 segundos
- [ ] Valores son aleatorios pero realistas
- [ ] No hay errores en consola

**Logs en Vivo**:

- [ ] Nuevos logs aparecen cada 8-15 segundos
- [ ] Fade-in animation funciona
- [ ] Colores por nivel (INFO/WARN/ERROR)
- [ ] Solo últimas 20 entradas visibles

**Responsive**:

- [ ] Mobile (< 768px): Sidebar oculto, hamburger menu
- [ ] Tablet (768px - 1024px): Tarjetas en 1 columna
- [ ] Desktop (> 1024px): Layout completo

### Automated Testing (Pendiente)

```bash
# Unit tests
npm run test:unit

# E2E tests
npm run test:e2e

# Visual regression
npm run test:visual
```

---

## ✅ Validación de Integridad del HTML

Para prevenir que bloques de JavaScript queden incrustados accidentalmente dentro del marcado HTML
(por ejemplo, dentro del `<aside>` o listas), incluimos un validador simple:

Ubicación: `scripts/validate-admin-panel.sh`

Uso:

```bash
bash scripts/validate-admin-panel.sh
```

Qué valida:

- No existan tokens JS como `ENVIRONMENTS_DEFAULT`, `loadEnvConfig`, `setEnvironment(`,
  `getCurrentEnv(` o comentarios `//` fuera de `<script>...</script>`.

Resultado:

- ✅ "Admin Panel validation passed" cuando no hay fugas de código.
- ❌ Error con detalle del token si detecta una fuga.

Recomendación: Ejecutar antes y después de modificaciones en `admin-panel/public/index.html`, y en
CI.

---

## 📈 Métricas de Performance

### Lighthouse Score (Target)

- Performance: 95+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 90+

### Bundle Size

- HTML: ~50KB
- CSS: Inline (~30KB)
- JavaScript: Inline (~5KB)
- **Total**: ~85KB (sin minificar)

### Optimizaciones

- ✅ CSS inlined (0 requests externos)
- ✅ JS inlined (0 requests externos)
- ✅ Google Fonts preconnect
- ✅ Lazy loading de secciones (display:none)
- ⏳ Minificación HTML/CSS/JS
- ⏳ Gzip/Brotli compression

---

## 🔒 Seguridad

### Implementado

- ✅ CSP headers (configurado en servidor)
- ✅ No inline event handlers
- ✅ LocalStorage con validación
- ✅ Input sanitization en logs

### Recomendaciones

- 🔐 Autenticación JWT para acceso al panel
- 🔐 Rate limiting en endpoints
- 🔐 HTTPS obligatorio en producción
- 🔐 Session timeout

---

## 🛠️ Mantenimiento

### Actualización de Métricas

Editar función `updateMetrics()` en el `<script>` al final del archivo.

### Agregar Nuevo Tema

1. Añadir en `<style id="theme-variants">`:

```css
[data-theme='nuevo-tema'] {
  --primary: #color;
  --bg-body: #color;
  /* ... más variables */
}
```

2. Agregar opción en `<select id="themeSelector">`:

```html
<option value="nuevo-tema">Nuevo Tema</option>
```

### Agregar Nueva Sección

1. Añadir link en sidebar:

```html
<li class="nav-item">
  <a class="nav-link" href="#nueva-seccion" data-target="nueva-seccion">
    <span class="nav-icon">🆕</span>
    <span>Nueva Sección</span>
  </a>
</li>
```

2. Crear sección:

```html
<section
  id="nueva-seccion"
  class="content-section section-panel"
  role="region"
  aria-labelledby="section-nueva-seccion-title"
>
  <h2 id="section-nueva-seccion-title" class="page-title">🆕 Nueva Sección</h2>
  <!-- Contenido -->
</section>
```

### Agregar Nuevo Tipo de Log

Editar array `logMessages` en función `addLogEntry()`:

```javascript
{
    level: 'INFO',
    service: 'Nuevo Servicio',
    message: 'Mensaje de ejemplo',
    color: '#10b981'
}
```

---

## 📚 Referencias

- [CSS Variables](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [Web Accessibility](https://www.w3.org/WAI/WCAG21/quickref/)
- [LocalStorage API](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)

---

## 🤝 Contribuir

### Reportar Issues

- Usar template de issue en GitHub
- Incluir navegador y versión
- Screenshot si es problema visual
- Console logs si hay errores JS

### Pull Requests

1. Fork del repositorio
2. Crear branch: `feature/nueva-funcionalidad`
3. Commits descriptivos
4. Tests pasando (cuando estén implementados)
5. PR con descripción detallada

---

## 📝 Changelog

### [4.0.0] - 2025-10-25

#### Added

- ✨ Panel administrativo unificado con navegación por tabs
- ✨ Sistema de 8 temas con persistencia
- ✨ Métricas dinámicas (actualización cada 5s)
- ✨ Stream de logs en tiempo real (8-15s)
- ✨ Secciones: Dashboard, Control Center, Analytics, Logs, Monitoring, Documentación, Backups
- ✨ Sidebar con navegación principal y estados activos
- ✨ Ajustes de contraste para temas dark/cybernight
- ✨ Animaciones suaves y transiciones

#### Changed

- 🔄 Puerto unificado a 3021 en todos los ambientes
- 🔄 Estructura HTML limpia y semántica
- 🔄 CSS/JS movidos a head (eliminados del body)

#### Fixed

- 🐛 Cierre correcto de tags HTML
- 🐛 CSS duplicado eliminado
- 🐛 JS fragmentado consolidado

---

## 📧 Soporte

- **Email**: admin@floresvictoria.cl
- **GitHub Issues**: https://github.com/laloaggro/Flores-Victoria-/issues
- **Documentación**: Ver carpeta `docs/`

---

**Flores Victoria v4.0** - Panel Administrativo Enterprise  
Desarrollado con ❤️ en Santiago, Chile 🇨🇱
