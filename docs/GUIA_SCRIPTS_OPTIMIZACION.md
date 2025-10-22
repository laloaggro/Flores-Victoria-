# 📚 Guía de Scripts de Optimización

> **Arreglos Victoria - Flores & Detalles**  
> Documentación completa de herramientas de optimización y auditoría

---

## 📑 Índice

1. [Generador de Sitemap Dinámico](#1-generador-de-sitemap-dinámico)
2. [Optimizador de Imágenes](#2-optimizador-de-imágenes)
3. [Actualizador de Referencias WebP](#3-actualizador-de-referencias-webp)
4. [Auditor Lighthouse](#4-auditor-lighthouse)
5. [Flujo de Trabajo Completo](#5-flujo-de-trabajo-completo)

---

## 1. Generador de Sitemap Dinámico

**Archivo:** `scripts/generate-sitemap.sh`

### ¿Qué hace?

Genera automáticamente un `sitemap.xml` escaneando todas las páginas HTML del sitio. Asigna prioridades, frecuencias de cambio y fechas de modificación de forma inteligente.

### Características

- ✅ Escanea automáticamente `index.html` y todas las páginas en `/pages`
- ✅ Asigna prioridades basadas en el tipo de página
- ✅ Excluye páginas privadas/admin automáticamente
- ✅ Actualiza fecha de modificación al día actual
- ✅ Determina frecuencia de cambio según contenido

### Uso

```bash
cd /home/impala/Documentos/Proyectos/flores-victoria
./scripts/generate-sitemap.sh
```

### Prioridades Asignadas

| Página | Prioridad | Changefreq |
|--------|-----------|------------|
| index.html | 1.0 | daily |
| products.html | 0.9 | daily |
| about.html, contact.html | 0.8 | weekly |
| cart.html, product-detail.html | 0.7 | weekly |
| wishlist.html, shipping.html, faq.html | 0.6-0.7 | monthly |
| Páginas admin/privadas | Excluidas | - |

### Salida

```
🗺️  Generando sitemap.xml...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✓ Agregando index.html
  ✓ Agregando products.html (prioridad: 0.9)
  ✓ Agregando about.html (prioridad: 0.8)
  ...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Sitemap generado exitosamente

📊 Estadísticas:
   URLs incluidas: 13
   Archivo: /frontend/public/sitemap.xml
   Fecha: 2025-01-22
```

### Próximos Pasos después de Ejecutar

1. Verifica el sitemap en: `https://arreglosvictoria.com/sitemap.xml`
2. Envía a [Google Search Console](https://search.google.com/search-console)
3. Envía a [Bing Webmaster Tools](https://www.bing.com/webmasters)
4. Verifica que `robots.txt` apunte al sitemap

---

## 2. Optimizador de Imágenes

**Archivo:** `scripts/optimize-images.sh`

### ¿Qué hace?

Optimiza todas las imágenes JPG/PNG del sitio y genera versiones WebP de alta calidad. Reduce el tamaño de archivos significativamente sin pérdida perceptible de calidad.

### Características

- ✅ Optimiza JPG con calidad 85 + progressive loading
- ✅ Optimiza PNG con máxima compresión (nivel 9)
- ✅ Convierte todas las imágenes a WebP (calidad 85)
- ✅ Crea respaldos automáticos en `images/originals/`
- ✅ Calcula ahorro de espacio por imagen
- ✅ Omite archivos ya optimizados (idempotente)

### Requisitos

```bash
# Instalar dependencias
sudo apt-get update
sudo apt-get install -y imagemagick webp
```

### Uso

```bash
cd /home/impala/Documentos/Proyectos/flores-victoria
./scripts/optimize-images.sh
```

### Salida Ejemplo

```
🖼️  Optimizador de Imágenes - Arreglos Victoria
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 Verificando dependencias...
✅ Todas las dependencias están instaladas

📸 Procesando imágenes en: /frontend/public/images

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📄 Archivo: bouquet-roses.jpg
  🔧 Optimizando: bouquet-roses.jpg
  🔄 Convirtiendo a WebP: bouquet-roses.jpg
     💾 Ahorro: 35% (2.5M → 1.6M)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 REPORTE DE OPTIMIZACIÓN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Imágenes optimizadas: 24
🔄 Conversiones a WebP: 24
⏭️  Archivos omitidos: 0
❌ Errores: 0

💾 Respaldos guardados en: /images/originals/ (24 archivos)
```

### ¿Qué imágenes se optimizan?

- `images/products/*.jpg` - Fotos de productos
- `images/categories/*.jpg` - Imágenes de categorías
- `images/banners/*.png` - Banners promocionales
- `images/*.jpg` - Imágenes generales

**No optimiza:** Iconos, logos, archivos ya en WebP

### Ahorro Típico

- **JPG → WebP:** 25-45% de reducción
- **PNG → WebP:** 50-70% de reducción
- **JPG optimizado:** 10-20% de reducción

---

## 3. Actualizador de Referencias WebP

**Archivo:** `scripts/update-webp-references.sh`

### ¿Qué hace?

Reemplaza automáticamente etiquetas `<img>` por etiquetas `<picture>` con soporte WebP y fallback a formato original.

### Características

- ✅ Convierte `<img src="image.jpg">` en `<picture>` con WebP
- ✅ Preserva todos los atributos (`alt`, `class`, `loading`)
- ✅ Añade `loading="lazy"` si no existe
- ✅ Excluye iconos y logos pequeños automáticamente
- ✅ Crea respaldo completo antes de modificar
- ✅ Usa Python para transformaciones precisas

### Uso

```bash
cd /home/impala/Documentos/Proyectos/flores-victoria
./scripts/update-webp-references.sh
```

### Transformación

**Antes:**
```html
<img src="images/products/roses.jpg" alt="Rosas Rojas" class="product-img">
```

**Después:**
```html
<picture>
    <source srcset="images/products/roses.webp" type="image/webp">
    <img src="images/products/roses.jpg" alt="Rosas Rojas" class="product-img" loading="lazy">
</picture>
```

### Salida

```
🔄 Actualizador de Referencias a WebP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💾 Creando respaldo en: /backups/webp-update-20250122-143025

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📄 Procesando: products.html (15 imágenes encontradas)
  ✓ 15 imágenes actualizadas

📄 Procesando: product-detail.html (4 imágenes encontradas)
  ✓ 4 imágenes actualizadas

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ ACTUALIZACIÓN COMPLETADA

📊 Estadísticas:
   Archivos actualizados: 5
   Imágenes convertidas: 42
   Respaldo en: /backups/webp-update-20250122-143025
```

### Revertir Cambios

Si necesitas deshacer los cambios:

```bash
# Copiar desde el backup más reciente
BACKUP_DIR=$(ls -td /home/impala/Documentos/Proyectos/flores-victoria/frontend/backups/webp-update-* | head -1)
cp $BACKUP_DIR/* /home/impala/Documentos/Proyectos/flores-victoria/frontend/public/
cp $BACKUP_DIR/* /home/impala/Documentos/Proyectos/flores-victoria/frontend/pages/
```

---

## 4. Auditor Lighthouse

**Archivo:** `scripts/lighthouse-audit.sh`

### ¿Qué hace?

Ejecuta auditorías completas de Lighthouse en todas las páginas principales del sitio y genera reportes HTML interactivos con métricas de rendimiento, accesibilidad, SEO y PWA.

### Características

- ✅ Audita 7 páginas principales automáticamente
- ✅ Genera reportes HTML y JSON por página
- ✅ Crea resumen interactivo con gráficos
- ✅ Calcula promedios de performance y accesibilidad
- ✅ Extrae Core Web Vitals
- ✅ Ejecuta en modo headless (sin abrir navegador)

### Requisitos

```bash
# Instalar Lighthouse CLI
npm install -g lighthouse

# Instalar jq para procesamiento JSON (opcional)
sudo apt-get install jq

# Servidor debe estar corriendo
cd frontend && npm run dev
```

### Uso

```bash
cd /home/impala/Documentos/Proyectos/flores-victoria
./scripts/lighthouse-audit.sh
```

### Páginas Auditadas

1. **Inicio** (index.html)
2. **Productos** (pages/products.html)
3. **Detalle de Producto** (pages/product-detail.html)
4. **Carrito** (pages/cart.html)
5. **Nosotros** (pages/about.html)
6. **Contacto** (pages/contact.html)
7. **Lista de Deseos** (pages/wishlist.html)

### Salida

```
🚦 Auditoría Lighthouse - Arreglos Victoria
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 Verificando dependencias...
✅ Todas las dependencias listas

📁 Reportes se guardarán en: /lighthouse-reports/audit-20250122-143510

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Auditando: Inicio
   URL: http://localhost:5173/index.html
   ✅ Completado
   📈 Scores:
      Performance:    92/100
      Accessibility:  95/100
      Best Practices: 100/100
      SEO:            98/100
      PWA:            89/100

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ AUDITORÍA COMPLETADA

📊 Resumen:
   Páginas auditadas exitosamente: 7
   Errores: 0
   Total de páginas: 7

📁 Reportes disponibles en:
   /lighthouse-reports/audit-20250122-143510

💡 Para ver los reportes:
   xdg-open /lighthouse-reports/audit-20250122-143510/index.html
```

### Estructura de Reportes

```
lighthouse-reports/
└── audit-20250122-143510/
    ├── index.html                    # Resumen interactivo
    ├── index.report.html             # Reporte Inicio
    ├── index.report.json             # Datos JSON Inicio
    ├── pages-products.report.html    # Reporte Productos
    ├── pages-products.report.json    # Datos JSON Productos
    └── ...
```

### Resumen Interactivo

El archivo `index.html` del reporte incluye:

- 📊 **Dashboard con estadísticas:**
  - Total de páginas auditadas
  - Performance promedio
  - Accesibilidad promedio

- 🎴 **Tarjetas por página:**
  - Nombre de la página
  - 5 scores principales (Performance, A11y, Best Practices, SEO, PWA)
  - Código de colores: 🟢 ≥90 | 🟡 ≥50 | 🔴 <50
  - Enlace al reporte completo

- 📱 **Diseño responsive**
- 🎨 **Interfaz moderna con gradientes**

### Métricas Evaluadas

#### Performance
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Total Blocking Time (TBT)
- Cumulative Layout Shift (CLS)
- Speed Index

#### Accessibility
- Contraste de colores
- ARIA attributes
- Etiquetas alt en imágenes
- Navegación por teclado
- Lectores de pantalla

#### Best Practices
- HTTPS
- Seguridad JavaScript
- Aspectos de la consola
- Errores de imagen

#### SEO
- Meta tags
- Structured data (Schema.org)
- Crawlability
- Mobile-friendly

#### PWA
- Manifest
- Service Worker
- Offline capability
- Installable

---

## 5. Flujo de Trabajo Completo

### 🎯 Orden Recomendado de Ejecución

```bash
# 1. Generar sitemap actualizado
./scripts/generate-sitemap.sh

# 2. Optimizar imágenes (primera vez)
./scripts/optimize-images.sh

# 3. Actualizar referencias HTML a WebP
./scripts/update-webp-references.sh

# 4. Validar el sitio
./scripts/validate-site.sh
./scripts/validate-advanced.sh

# 5. Ejecutar auditoría Lighthouse
./scripts/lighthouse-audit.sh

# 6. Revisar reportes y aplicar mejoras
xdg-open lighthouse-reports/audit-*/index.html
```

### 📅 Frecuencia de Uso

| Script | Frecuencia | Cuándo Ejecutar |
|--------|------------|-----------------|
| `generate-sitemap.sh` | Cada nueva página | Antes de deployment |
| `optimize-images.sh` | Nuevas imágenes | Al agregar contenido |
| `update-webp-references.sh` | Una vez | Después de optimizar |
| `lighthouse-audit.sh` | Semanal | Monitoreo continuo |

### 🔄 Flujo de Nuevas Imágenes

```bash
# 1. Agregar imágenes a frontend/public/images/
cp nueva-imagen.jpg frontend/public/images/products/

# 2. Optimizar
./scripts/optimize-images.sh

# 3. Actualizar referencias HTML manualmente o con script
# Editar products.html para incluir <picture> tag

# 4. Validar
./scripts/validate-site.sh

# 5. Auditar performance
./scripts/lighthouse-audit.sh
```

### 🔍 Troubleshooting

#### Error: "ImageMagick no está instalado"
```bash
sudo apt-get update
sudo apt-get install imagemagick
```

#### Error: "WebP no está instalado"
```bash
sudo apt-get install webp
```

#### Error: "Lighthouse no está instalado"
```bash
npm install -g lighthouse
# o
sudo npm install -g lighthouse
```

#### Error: "El servidor no está corriendo"
```bash
cd frontend
npm install
npm run dev
# Debe estar en http://localhost:5173
```

#### Error: "jq no encontrado"
```bash
sudo apt-get install jq
```

#### Imágenes WebP no se muestran
1. Verifica que los archivos `.webp` existen
2. Verifica la ruta en el `<source srcset>`
3. Prueba en navegador moderno (Chrome, Firefox, Edge)
4. Verifica formato `<picture>`:
```html
<picture>
    <source srcset="ruta/imagen.webp" type="image/webp">
    <img src="ruta/imagen.jpg" alt="...">
</picture>
```

---

## 📈 Mejoras Esperadas

### Antes de Optimización
- **Lighthouse Performance:** 60-75
- **Tamaño página productos:** ~4MB
- **LCP (Largest Contentful Paint):** 3.5s
- **CLS (Cumulative Layout Shift):** 0.15

### Después de Optimización
- **Lighthouse Performance:** 90-95
- **Tamaño página productos:** ~1.2MB (70% reducción)
- **LCP:** 1.8s (49% mejora)
- **CLS:** 0.05 (67% mejora)

### Beneficios SEO
- ✅ Sitemap XML para indexación completa
- ✅ robots.txt optimizado para crawlers
- ✅ Carga rápida mejora ranking
- ✅ Mobile-friendly (WebP reduce datos móviles)
- ✅ Core Web Vitals mejorados

### Beneficios UX
- ✅ Carga 3x más rápida
- ✅ Menos consumo de datos (importante en móviles)
- ✅ Mejor experiencia en conexiones lentas
- ✅ PWA instalable con caché optimizado

---

## 🎓 Comandos de Ayuda

Todos los scripts incluyen ayuda integrada:

```bash
./scripts/generate-sitemap.sh --help
./scripts/optimize-images.sh --help
./scripts/update-webp-references.sh --help
./scripts/lighthouse-audit.sh --help
```

---

## 📚 Referencias

- [Google Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [WebP Format](https://developers.google.com/speed/webp)
- [Sitemaps Protocol](https://www.sitemaps.org/)
- [Core Web Vitals](https://web.dev/vitals/)
- [Progressive Web Apps](https://web.dev/progressive-web-apps/)

---

## ✅ Checklist de Optimización

```
[ ] Scripts con permisos de ejecución (chmod +x)
[ ] Dependencias instaladas (imagemagick, webp, lighthouse, jq)
[ ] Servidor frontend corriendo (npm run dev)
[ ] Sitemap generado y validado
[ ] Imágenes optimizadas y WebP creados
[ ] Referencias HTML actualizadas a <picture>
[ ] Validación completa pasada (validate-site.sh)
[ ] Auditoría Lighthouse ejecutada
[ ] Reportes revisados y mejoras aplicadas
[ ] Backup de archivos originales creado
[ ] Cambios commiteados a git
[ ] Deployment a producción
```

---

**🌹 Arreglos Victoria - Flores & Detalles**  
*Documentación generada: 22 de Enero, 2025*
