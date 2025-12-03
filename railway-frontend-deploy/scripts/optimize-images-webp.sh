#!/bin/bash

##############################################################################
# Script de Optimización de Imágenes WebP - Fase 2
# Convierte todas las imágenes JPG/PNG a formato WebP con calidad 85
# Uso: ./optimize-images-webp.sh
##############################################################################

set -e

IMAGES_DIR="public/images"
QUALITY=85
COUNT=0

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🖼️  OPTIMIZACIÓN DE IMÁGENES A WEBP - FASE 2"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Verificar que cwebp está instalado
if ! command -v cwebp &> /dev/null; then
    echo "❌ Error: cwebp no está instalado"
    echo ""
    echo "Instalar con:"
    echo "  Ubuntu/Debian: sudo apt install webp"
    echo "  macOS: brew install webp"
    echo "  Fedora: sudo dnf install libwebp-tools"
    exit 1
fi

echo "✅ cwebp encontrado: $(cwebp -version | head -1)"
echo ""

# Función para convertir una imagen
convert_image() {
    local img="$1"
    local output="${img%.*}.webp"
    
    # Skip si ya existe WebP y es más nuevo que la fuente
    if [ -f "$output" ] && [ "$output" -nt "$img" ]; then
        echo "⏭️  Skip: $img (WebP ya existe y es más nuevo)"
        return
    fi
    
    echo "🔄 Convirtiendo: $img"
    
    if cwebp -q $QUALITY "$img" -o "$output" -quiet; then
        local original_size=$(stat -f%z "$img" 2>/dev/null || stat -c%s "$img")
        local webp_size=$(stat -f%z "$output" 2>/dev/null || stat -c%s "$output")
        local savings=$(( 100 - (webp_size * 100 / original_size) ))
        
        echo "✅ $output (${savings}% más pequeño)"
        ((COUNT++))
    else
        echo "❌ Error al convertir: $img"
    fi
}

# Buscar y convertir JPG
echo "📂 Buscando imágenes JPG..."
while IFS= read -r -d '' img; do
    convert_image "$img"
done < <(find "$IMAGES_DIR" -type f \( -iname "*.jpg" -o -iname "*.jpeg" \) ! -path "*/originals/*" ! -name "favicon.*" -print0)

echo ""
echo "📂 Buscando imágenes PNG..."
while IFS= read -r -d '' img; do
    convert_image "$img"
done < <(find "$IMAGES_DIR" -type f -iname "*.png" ! -path "*/originals/*" ! -name "favicon.*" ! -name "logo.png" ! -name "logo-watermark.png" -print0)

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Optimización completada"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Estadísticas:"
echo "   • Imágenes convertidas: $COUNT"
echo "   • Calidad WebP: ${QUALITY}%"
echo "   • Directorio: $IMAGES_DIR"
echo ""
echo "💡 Próximos pasos:"
echo "   1. Actualizar HTML para usar <picture> con WebP"
echo "   2. Agregar loading='lazy' a imágenes no críticas"
echo "   3. Preload de imagen LCP (hero)"
echo ""
