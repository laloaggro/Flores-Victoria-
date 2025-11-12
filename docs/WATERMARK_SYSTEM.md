# 🎨 Sistema de Marca de Agua - Flores Victoria

## Descripción

Sistema automático para aplicar la marca de agua del logo de Arreglos Victoria a todas las imágenes
generadas por IA.

## Características

- ✅ **Aplicación automática** de marca de agua al logo de Arreglos Victoria
- ✅ **Modo único**: Procesa todas las imágenes pendientes
- ✅ **Modo watch**: Monitorea y procesa nuevas imágenes automáticamente
- ✅ **Optimización**: Solo procesa imágenes que no tienen marca de agua
- ✅ **Logo transparente**: 40% de opacidad, 150px de ancho
- ✅ **Posición**: Esquina inferior derecha con margen de +20px

## Archivos

```
scripts/
├── add-watermark.sh      # Script completo para aplicar marca de agua
├── auto-watermark.sh     # Script automático con modo watch
└── verify-watermark.sh   # Verificar instalación de ImageMagick

frontend/public/images/
├── logo.png             # Logo original (300x301px)
└── logo-watermark.png   # Logo optimizado para marca de agua (150px, 40% opacidad)
```

## Uso

### 1. Aplicar marca de agua una vez (Manual)

```bash
cd /home/impala/Documentos/Proyectos/flores-victoria
bash scripts/add-watermark.sh
```

Este script:

- ✅ Verifica ImageMagick
- ✅ Crea logo optimizado si no existe
- ✅ Procesa todas las imágenes WebP v3
- ✅ Omite imágenes ya procesadas
- ✅ Muestra resumen detallado

**Salida esperada:**

```
═══════════════════════════════════════════════════════
  Flores Victoria - Add Watermark to Images
═══════════════════════════════════════════════════════

✅ Logo de marca de agua ya existe
📋 Imágenes WebP originales disponibles (-v3): 16
🎨 Aplicando marca de agua...
   ✅ Marca de agua aplicada: victoria-rosas-001-v3.webp
   ...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Resumen:
   - Imágenes procesadas: 16
   - Imágenes omitidas:   0
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 2. Modo automático único

```bash
cd /home/impala/Documentos/Proyectos/flores-victoria
bash scripts/auto-watermark.sh once
```

Procesa todas las imágenes pendientes una sola vez.

### 3. Modo monitor continuo (Recomendado para desarrollo)

```bash
cd /home/impala/Documentos/Proyectos/flores-victoria
bash scripts/auto-watermark.sh watch
```

Este modo:

- 🔍 Monitorea el directorio `services/ai-image-service/cache/images/`
- ⚡ Detecta automáticamente nuevas imágenes
- 🎨 Aplica marca de agua inmediatamente
- ♾️ Se ejecuta continuamente (Ctrl+C para detener)

**Requiere:** `inotify-tools`

```bash
sudo apt-get install inotify-tools
```

## Flujo de Trabajo

### Generación de Nuevas Imágenes AI

1. **Generar imagen AI** (automático o manual)

   ```
   services/ai-image-service/cache/images/victoria-flores-001-v3.webp
   ```

2. **Aplicar marca de agua**

   ```bash
   bash scripts/auto-watermark.sh once
   # o si está en modo watch, se aplica automáticamente
   ```

3. **Reconstruir frontend**

   ```bash
   docker-compose build frontend
   docker-compose up -d frontend
   ```

4. **Verificar resultado**
   - Imagen original: `services/ai-image-service/cache/images/` (~33KB)
   - Con marca de agua: `frontend/public/images/productos/` (~23KB optimizado)

## Configuración de la Marca de Agua

### Parámetros Actuales

```bash
# Logo
Archivo: frontend/public/images/logo-watermark.png
Ancho: 150px (proporcional)
Opacidad: 40% (transparencia 60%)

# Posición
Gravedad: southeast (esquina inferior derecha)
Margen: +20+20 (20px desde borde derecho y inferior)
Dissolve: 35% (fusión con imagen de fondo)
```

### Modificar Parámetros

Edita `scripts/add-watermark.sh` o `scripts/auto-watermark.sh`:

```bash
# Cambiar tamaño del logo (línea ~29)
convert "$LOGO_SOURCE" \
    -resize 200x \        # Cambiar de 150x a 200x
    -alpha set \
    -channel A -evaluate multiply 0.3 +channel \  # Cambiar opacidad de 0.4 a 0.3
    "$WATERMARK_LOGO"

# Cambiar posición (línea ~116)
composite -gravity southwest \    # Esquina inferior izquierda
    -geometry +30+30 \            # Cambiar margen de 20 a 30
    -dissolve 50% \               # Cambiar fusión de 35% a 50%
    "$WATERMARK_LOGO" "$source_img" "$temp_file"
```

**Opciones de gravedad:**

- `southeast` - Esquina inferior derecha (actual)
- `southwest` - Esquina inferior izquierda
- `northeast` - Esquina superior derecha
- `northwest` - Esquina superior izquierda
- `center` - Centro de la imagen

## Integración con CI/CD

### Opción 1: Hook de Git (Pre-push)

```bash
# .git/hooks/pre-push
#!/bin/bash
bash scripts/auto-watermark.sh once
```

### Opción 2: GitHub Actions

```yaml
# .github/workflows/watermark.yml
name: Apply Watermark
on:
  push:
    paths:
      - 'services/ai-image-service/cache/images/**'

jobs:
  watermark:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install ImageMagick
        run: sudo apt-get install -y imagemagick
      - name: Apply Watermark
        run: bash scripts/auto-watermark.sh once
      - name: Commit Changes
        run: |
          git config user.name "GitHub Actions"
          git config user.email "actions@github.com"
          git add frontend/public/images/productos/
          git commit -m "chore: apply watermark to AI images"
          git push
```

### Opción 3: Docker Compose Service

Agregar servicio watcher en `docker-compose.yml`:

```yaml
services:
  watermark-watcher:
    image: alpine:latest
    volumes:
      - ./scripts:/scripts
      - ./services/ai-image-service/cache/images:/images:ro
      - ./frontend/public/images/productos:/output
    command: |
      sh -c "apk add --no-cache imagemagick inotify-tools bash &&
             bash /scripts/auto-watermark.sh watch"
    restart: unless-stopped
```

## Troubleshooting

### Error: ImageMagick no está instalado

```bash
sudo apt-get update
sudo apt-get install -y imagemagick
```

### Error: Logo de marca de agua no encontrado

```bash
cd /home/impala/Documentos/Proyectos/flores-victoria
bash scripts/add-watermark.sh  # Crea el logo automáticamente
```

### Error: inotify-tools no está instalado (modo watch)

```bash
sudo apt-get install -y inotify-tools
```

### Error: Permiso denegado

```bash
chmod +x scripts/add-watermark.sh
chmod +x scripts/auto-watermark.sh
```

### Verificar que la marca de agua se aplicó correctamente

```bash
# Comparar tamaños (imagen con watermark debe ser menor)
ls -lh services/ai-image-service/cache/images/victoria-rosas-001-v3.webp
ls -lh frontend/public/images/productos/victoria-rosas-001-v3.webp

# Ver imagen directamente
xdg-open frontend/public/images/productos/victoria-rosas-001-v3.webp
```

## Estadísticas Actuales

- **Imágenes AI totales**: 84
- **Imágenes v3 (full size)**: 16
- **Con marca de agua aplicada**: 16/16 (100%)
- **Reducción de tamaño promedio**: ~30% (de 33KB a 23KB)
- **Logo marca de agua**: 32KB (150x150px, 40% opacidad)

## Próximas Mejoras

- [ ] Auto-rebuild de frontend después de aplicar marca de agua
- [ ] Servicio Docker dedicado para monitoreo continuo
- [ ] Configuración de posición/opacidad vía variables de entorno
- [ ] Soporte para múltiples formatos (PNG, JPEG)
- [ ] API endpoint para aplicar marca de agua on-demand
- [ ] Dashboard de monitoreo de imágenes procesadas

## Referencias

- **ImageMagick composite**: https://imagemagick.org/script/composite.php
- **inotify-tools**: https://github.com/inotify-tools/inotify-tools
- **WebP optimization**: https://developers.google.com/speed/webp

---

**Última actualización**: 27 de octubre de 2025 **Versión**: 1.0.0 **Autor**: Eduardo Garay
(@laloaggro)
