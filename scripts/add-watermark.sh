#!/bin/bash
# Script para añadir marca de agua a las imágenes de productos
# Flores Victoria - Add Watermark to Product Images

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
AI_IMAGES_DIR="$PROJECT_ROOT/services/ai-image-service/cache/images"
FRONTEND_IMAGES_DIR="$PROJECT_ROOT/frontend/public/images/productos"
LOGO_SOURCE="$PROJECT_ROOT/frontend/public/images/logo.png"
WATERMARK_LOGO="$PROJECT_ROOT/frontend/public/images/logo-watermark.png"

echo "═══════════════════════════════════════════════════════"
echo "  Flores Victoria - Add Watermark to Images"
echo "═══════════════════════════════════════════════════════"
echo ""

# Verificar ImageMagick
if ! command -v convert &> /dev/null; then
    echo "❌ Error: ImageMagick no está instalado"
    echo "   sudo apt-get install imagemagick"
    exit 1
fi

# Paso 1: Crear logo optimizado para marca de agua si no existe
if [ ! -f "$WATERMARK_LOGO" ]; then
    echo "📝 Creando logo optimizado para marca de agua..."
    
    if [ -f "$LOGO_SOURCE" ]; then
        # Redimensionar logo a 150px de ancho y añadir transparencia
        convert "$LOGO_SOURCE" \
            -resize 150x \
            -alpha set \
            -channel A -evaluate multiply 0.4 +channel \
            "$WATERMARK_LOGO"
        
        echo "✅ Logo de marca de agua creado: $WATERMARK_LOGO"
    else
        echo "❌ Error: No se encuentra el logo fuente: $LOGO_SOURCE"
        exit 1
    fi
else
    echo "✅ Logo de marca de agua ya existe: $WATERMARK_LOGO"
fi

echo ""

# Paso 2: Listar imágenes WebP originales con -v3
echo "📋 Imágenes WebP originales disponibles (-v3):"
ORIGINAL_IMAGES=()

while IFS= read -r img; do
    if [[ "$img" =~ -v3\.webp$ ]] && [[ ! "$img" =~ (thumb|medium) ]]; then
        ORIGINAL_IMAGES+=("$img")
    fi
done < <(find "$AI_IMAGES_DIR" -name "*.webp" 2>/dev/null)

echo "   Total encontradas: ${#ORIGINAL_IMAGES[@]}"
echo ""

if [ ${#ORIGINAL_IMAGES[@]} -eq 0 ]; then
    echo "❌ No se encontraron imágenes WebP con sufijo -v3"
    exit 1
fi

# Mostrar primeras 5
for i in "${!ORIGINAL_IMAGES[@]}"; do
    if [ $i -lt 5 ]; then
        filename=$(basename "${ORIGINAL_IMAGES[$i]}")
        echo "   - $filename"
    fi
done

if [ ${#ORIGINAL_IMAGES[@]} -gt 5 ]; then
    echo "   ... y $((${#ORIGINAL_IMAGES[@]} - 5)) más"
fi

echo ""

# Paso 3: Aplicar marca de agua y copiar al frontend
echo "🎨 Aplicando marca de agua a las imágenes..."
echo ""

PROCESSED=0
SKIPPED=0

for source_img in "${ORIGINAL_IMAGES[@]}"; do
    source_filename=$(basename "$source_img")
    
    # Generar nombre de destino (mantener nombre original con -v3)
    dest_filename="$source_filename"
    dest_path="$FRONTEND_IMAGES_DIR/$dest_filename"
    
    echo "   Procesando: $source_filename"
    
    # Verificar si ya existe en destino con marca de agua
    if [ -f "$dest_path" ]; then
        # Comparar tamaños (si son idénticos, probablemente ya tiene watermark)
        source_size=$(stat -f%z "$source_img" 2>/dev/null || stat -c%s "$source_img" 2>/dev/null)
        dest_size=$(stat -f%z "$dest_path" 2>/dev/null || stat -c%s "$dest_path" 2>/dev/null)
        
        if [ "$source_size" -ne "$dest_size" ]; then
            echo "      ⚠️  Ya existe pero difiere en tamaño, regenerando..."
        else
            echo "      ⏭️  Ya existe con mismo tamaño, omitiendo"
            ((SKIPPED++)) || true
            continue
        fi
    fi
    
    # Aplicar marca de agua
    temp_file="${dest_path}.temp.webp"
    
    if composite -gravity southeast -geometry +20+20 -dissolve 35% \
        "$WATERMARK_LOGO" "$source_img" "$temp_file" 2>/dev/null; then
        
        mv "$temp_file" "$dest_path"
        echo "      ✅ Marca de agua aplicada y guardada"
        ((PROCESSED++)) || true
    else
        echo "      ❌ Error al aplicar marca de agua"
        rm -f "$temp_file"
    fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Resumen:"
echo "   - Imágenes procesadas: $PROCESSED"
echo "   - Imágenes omitidas:   $SKIPPED"
echo "   - Total disponibles:   ${#ORIGINAL_IMAGES[@]}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ $PROCESSED -gt 0 ]; then
    echo "✅ Marca de agua aplicada exitosamente"
    echo ""
    echo "🔄 Siguiente paso: Reconstruir el contenedor frontend"
    echo "   cd $PROJECT_ROOT"
    echo "   docker-compose build frontend"
    echo "   docker-compose up -d frontend"
else
    echo "⚠️  No se procesaron nuevas imágenes"
fi

echo ""
