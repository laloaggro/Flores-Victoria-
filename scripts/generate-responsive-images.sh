#!/bin/bash

# Generate Responsive Images - Crear múltiples tamaños para srcset
# Flores Victoria - Performance Optimization

set -e

echo "📸 Generando imágenes responsive..."

IMAGES_DIR="frontend/images"
SIZES=(320 480 768 1024 1280 1920)

# Función para generar versión responsive
generate_responsive() {
    local input="$1"
    local width="$2"
    local filename=$(basename "$input" | sed 's/\.[^.]*$//')
    local dir=$(dirname "$input")
    local ext="${input##*.}"
    
    # Output en WebP
    local output="${dir}/${filename}-${width}w.webp"
    
    if [ -f "$output" ]; then
        return
    fi
    
    echo "  → ${filename}.${ext} @ ${width}px"
    
    # Redimensionar y convertir a WebP
    convert "$input" \
        -resize "${width}x>" \
        -quality 85 \
        -strip \
        "$output"
}

# Contar imágenes a procesar
total_images=$(find "$IMAGES_DIR" -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" \) | wc -l)
echo "📁 Imágenes encontradas: $total_images"
echo ""

# Procesar cada imagen
count=0
find "$IMAGES_DIR" -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" \) | while read image; do
    count=$((count + 1))
    echo "[$count/$total_images] $(basename "$image")"
    
    for size in "${SIZES[@]}"; do
        generate_responsive "$image" "$size"
    done
done

# Contar imágenes generadas
generated=$(find "$IMAGES_DIR" -name "*-*w.webp" | wc -l)

echo ""
echo "✅ Imágenes responsive generadas!"
echo "📊 Resultados:"
echo "   Originales: $total_images"
echo "   Responsive generadas: $generated"
echo "   Tamaños: ${SIZES[@]}"
echo ""
echo "💡 Uso en HTML:"
echo '   <img srcset="image-320w.webp 320w, image-480w.webp 480w, image-768w.webp 768w"'
echo '        sizes="(max-width: 768px) 100vw, 50vw"'
echo '        src="image-768w.webp">'
