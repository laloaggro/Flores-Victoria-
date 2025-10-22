#!/bin/bash

# Script para generar íconos PWA desde el logo SVG
# Requiere ImageMagick (convert command)

LOGO_PATH="/home/impala/Documentos/Proyectos/flores-victoria/frontend/public/logo.svg"
ICONS_DIR="/home/impala/Documentos/Proyectos/flores-victoria/frontend/public/icons"

# Crear directorio de íconos si no existe
mkdir -p "$ICONS_DIR"

# Array de tamaños de íconos requeridos para PWA
SIZES=(72 96 128 144 152 192 384 512)

echo "🎨 Generando íconos PWA desde logo.svg..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Verificar si ImageMagick está instalado
if ! command -v convert &> /dev/null; then
    echo "❌ Error: ImageMagick no está instalado"
    echo "   Instala con: sudo apt-get install imagemagick"
    exit 1
fi

# Verificar si el logo existe
if [ ! -f "$LOGO_PATH" ]; then
    echo "❌ Error: Logo no encontrado en $LOGO_PATH"
    exit 1
fi

# Generar cada tamaño de ícono
for size in "${SIZES[@]}"; do
    output_file="${ICONS_DIR}/icon-${size}x${size}.png"
    echo "  📦 Generando ${size}x${size}px..."
    
    # Convertir SVG a PNG con el tamaño especificado
    # -background none: fondo transparente
    # -density 300: alta resolución para mejor calidad
    convert -background none -density 300 \
        -resize "${size}x${size}" \
        "$LOGO_PATH" \
        "$output_file"
    
    if [ $? -eq 0 ]; then
        echo "     ✓ Creado: $output_file"
    else
        echo "     ✗ Error al crear: $output_file"
    fi
done

# Generar favicon.ico (múltiples tamaños en un archivo)
echo ""
echo "  🌟 Generando favicon.ico..."
FAVICON_PATH="/home/impala/Documentos/Proyectos/flores-victoria/frontend/public/favicon.ico"

convert -background none -density 300 \
    "$LOGO_PATH" \
    -resize 16x16 \
    -define icon:auto-resize=16,32,48 \
    "$FAVICON_PATH"

if [ $? -eq 0 ]; then
    echo "     ✓ Creado: $FAVICON_PATH"
else
    echo "     ✗ Error al crear favicon.ico"
fi

# Generar apple-touch-icon (180x180)
echo ""
echo "  🍎 Generando apple-touch-icon.png..."
APPLE_ICON_PATH="/home/impala/Documentos/Proyectos/flores-victoria/frontend/public/apple-touch-icon.png"

convert -background none -density 300 \
    -resize 180x180 \
    "$LOGO_PATH" \
    "$APPLE_ICON_PATH"

if [ $? -eq 0 ]; then
    echo "     ✓ Creado: $APPLE_ICON_PATH"
else
    echo "     ✗ Error al crear apple-touch-icon.png"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Generación de íconos completada"
echo ""
echo "Íconos generados en: $ICONS_DIR"
echo "Total de archivos: $((${#SIZES[@]} + 2))"
echo ""
echo "Próximos pasos:"
echo "  1. Verifica que los íconos se vean correctamente"
echo "  2. Agrega las referencias en el HTML:"
echo "     <link rel=\"icon\" href=\"/favicon.ico\">"
echo "     <link rel=\"apple-touch-icon\" href=\"/apple-touch-icon.png\">"
echo "     <link rel=\"manifest\" href=\"/manifest.json\">"
