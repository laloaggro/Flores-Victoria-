# Flores Victoria - Frontend

Tienda online de flores desarrollada con Vite, TypeScript y optimizada para máximo rendimiento.

## 🚀 Estado del Proyecto

**Versión:** 3.0.0  
**Performance Score:** 73-78/100  
**Tests:** 401/401 passing  
**Optimizaciones Completadas:** 14 sprints (Nov 2025)

## 📊 Métricas de Rendimiento

| Métrica                        | Valor | Estado |
| ------------------------------ | ----- | ------ |
| First Contentful Paint (FCP)   | 6.2s  | ✅     |
| Largest Contentful Paint (LCP) | 7.1s  | ⚠️     |
| Speed Index                    | 6.2s  | ✅     |
| Total Blocking Time (TBT)      | 141ms | ✅     |
| Cumulative Layout Shift (CLS)  | 0     | ✅     |

## 🛠️ Tecnologías

- **Framework:** Vite 5.4.11
- **Lenguaje:** TypeScript 5.6.3
- **Estilos:** CSS moderno + PurgeCSS
- **Tests:** Vitest + Testing Library
- **Imágenes:** WebP (88% coverage, 163 imágenes)
- **Fuentes:** Self-hosted (@fontsource)

## 📁 Estructura del Proyecto

```
frontend/
├── public/              # Assets estáticos
│   ├── images/         # 163 WebP + 3 JPG fallbacks
│   ├── js/             # JavaScript optimizado
│   └── sw.js           # Service Worker v3
├── css/                # Hojas de estilo
│   ├── base.css        # Reset + variables
│   ├── style.css       # Estilos principales
│   ├── critical.css    # CSS crítico inline
│   ├── fonts.css       # Fuentes auto-hospedadas
│   └── lazy-loading.css
├── js/                 # Módulos JavaScript
│   ├── main.js         # Punto de entrada
│   ├── utils.js        # Utilidades
│   └── components/     # Componentes UI
├── __tests__/          # Tests unitarios e integración
├── vite.config.js      # Configuración Vite
└── package.json        # Dependencias

```

## ⚡ Optimizaciones Implementadas

### Sprint 4 (Nov 2025) - Optimización Agresiva ✅

1. **Self-Hosted Fonts**
   - Instalado `@fontsource` packages
   - Eliminado Google Fonts CDN
   - Reducida latencia de red

2. **WebP-Only Strategy**
   - 163 imágenes WebP (88% coverage)
   - 3 JPG fallbacks esenciales
   - 15 JPG redundantes eliminados

3. **Code Cleanup**
   - 2.7MB backup directory eliminado
   - 25 archivos temporales removidos
   - 4 CSS con hashes limpiados

### Optimizaciones Anteriores (Sprints 1-3)

- ✅ Code Splitting (8 chunks)
- ✅ Lazy Loading (imágenes, componentes)
- ✅ Critical CSS inline
- ✅ Service Worker v3 (network-first)
- ✅ PurgeCSS (CSS no usado)
- ✅ Resource Hints (preconnect, dns-prefetch)
- ✅ Build optimizations (minificación, tree-shaking)
- ✅ Async/Defer scripts
- ✅ Async Font Awesome
- ✅ WebP image optimization

## 🚦 Getting Started

### Instalación

```bash
npm install
```

### Desarrollo

```bash
npm run dev
# Server: http://localhost:5173
```

### Build de Producción

```bash
npm run build
# Output: dist/
```

### Testing

```bash
npm test                # Run all tests
npm run test:coverage   # With coverage report
```

### Linting

```bash
npm run lint            # ESLint check
npm run lint:fix        # Auto-fix issues
```

## 📦 Scripts Disponibles

| Script            | Descripción            |
| ----------------- | ---------------------- |
| `npm run dev`     | Servidor de desarrollo |
| `npm run build`   | Build optimizado       |
| `npm run preview` | Preview del build      |
| `npm test`        | Run tests              |
| `npm run lint`    | Check linting          |
| `npm run format`  | Format code (Prettier) |

## 🖼️ Gestión de Imágenes

### Formato WebP Preferido

- **Total:** 163 imágenes WebP
- **Categorías:** 18 WebP
- **Productos:** 112 WebP
- **Avatares:** 6 WebP
- **Demos:** 4 WebP

### Fallbacks JPG Esenciales

Solo 3 archivos JPG mantenidos como fallback para navegadores sin soporte WebP:

- `images/categories/arrangements.jpg`
- `images/categories/bouquets.jpg`
- `images/categories/decorations.jpg`

## ⚙️ Configuración

### Vite

- Build target: ES2020
- Code splitting automático
- Minificación: Terser
- Source maps en desarrollo

### PurgeCSS

- Eliminación de CSS no usado
- Safelist para clases dinámicas
- Modo agresivo disponible

### Service Worker

- Estrategia: network-first
- Cache assets estáticos
- Offline fallback

## 🧪 Testing

- **Framework:** Vitest
- **DOM Testing:** @testing-library/dom
- **Coverage:** 401/401 tests passing
- **Integration:** Happy-dom environment

## 📊 Performance Budget

| Recurso    | Límite | Actual    |
| ---------- | ------ | --------- |
| JavaScript | 300KB  | ~200KB ✅ |
| CSS        | 100KB  | ~70KB ✅  |
| Imágenes   | 2MB    | ~900KB ✅ |
| Total      | 5MB    | ~1.2MB ✅ |

## 🔄 Próximas Mejoras

1. ⏳ Reducir LCP a <2.5s
2. ⏳ Implementar HTTP/2 push
3. ⏳ Optimizar Font Awesome subsetting
4. ⏳ A/B testing lazy loading strategies

## 📚 Documentación Adicional

- [OPTIMIZACIONES.md](./OPTIMIZACIONES.md) - Historial completo de optimizaciones
- [MANTENIMIENTO.md](./MANTENIMIENTO.md) - Guía de mantenimiento

## 🐛 Issues Conocidos

- Build warning en `/js/main.js` (no afecta producción)
- Font Awesome icons sin subset (67 iconos, revisión pendiente)

## 📝 Changelog

Ver [OPTIMIZACIONES.md](./OPTIMIZACIONES.md) para historial detallado.

### v3.0.0 (Nov 7, 2025)

- ✅ Self-hosted fonts
- ✅ WebP-only strategy
- ✅ Code cleanup (3MB removed)
- ✅ Performance 73-78/100

## 👥 Contribución

1. Fork el proyecto
2. Crear feature branch (`git checkout -b feature/amazing`)
3. Commit cambios (`git commit -m 'Add amazing feature'`)
4. Push al branch (`git push origin feature/amazing`)
5. Abrir Pull Request

## 📄 Licencia

Todos los derechos reservados - Flores Victoria © 2025

---

**Última actualización:** Nov 7, 2025  
**Mantenido por:** Flores Victoria Dev Team
