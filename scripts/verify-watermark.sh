#!/bin/bash
# Script para verificar y añadir marca de agua a las imágenes de productos
# Flores Victoria - Image Watermark Processor

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
AI_IMAGES_DIR="/home/impala/Documentos/Proyectos/flores-victoria/services/ai-image-service/cache/images"
FRONTEND_IMAGES_DIR="/home/impala/Documentos/Proyectos/flores-victoria/frontend/public/images/productos"
WATERMARK_LOGO="/home/impala/Documentos/Proyectos/flores-victoria/frontend/public/images/logo-watermark.png"

echo "═══════════════════════════════════════════════════════"
echo "  Flores Victoria - Image Watermark Verification"
echo "═══════════════════════════════════════════════════════"
echo ""

# Verificar si ImageMagick está instalado
if ! command -v convert &> /dev/null; then
    echo "❌ Error: ImageMagick no está instalado"
    echo "   Instalar con: sudo apt-get install imagemagick"
    exit 1
fi

echo "✅ ImageMagick disponible"

# Verificar directorios
if [ ! -d "$AI_IMAGES_DIR" ]; then
    echo "❌ Error: No se encuentra el directorio de imágenes AI: $AI_IMAGES_DIR"
    exit 1
fi

if [ ! -d "$FRONTEND_IMAGES_DIR" ]; then
    echo "⚠️  Creando directorio de imágenes frontend: $FRONTEND_IMAGES_DIR"
    mkdir -p "$FRONTEND_IMAGES_DIR"
fi

echo "✅ Directorios verificados"
echo ""

# Listar imágenes WebP disponibles en AI service
echo "📋 Imágenes WebP disponibles en AI service:"
WEBP_COUNT=$(ls -1 "$AI_IMAGES_DIR"/*.webp 2>/dev/null | grep -v "thumb\|medium" | wc -l)
echo "   Total: $WEBP_COUNT archivos (sin thumbnails ni medium)"
echo ""

# Listar primeras 10 imágenes
ls -1 "$AI_IMAGES_DIR"/*.webp 2>/dev/null | grep -v "thumb\|medium" | head -10 | while read img; do
    filename=$(basename "$img")
    size=$(du -h "$img" | cut -f1)
    echo "   - $filename ($size)"
done

if [ $WEBP_COUNT -gt 10 ]; then
    echo "   ... y $((WEBP_COUNT - 10)) más"
fi
echo ""

# Verificar imágenes actuales en frontend
echo "📋 Imágenes actuales en frontend:"
FRONTEND_COUNT=$(ls -1 "$FRONTEND_IMAGES_DIR"/*.webp 2>/dev/null | wc -l)
echo "   Total: $FRONTEND_COUNT archivos WebP"
echo ""

# Función para verificar si una imagen tiene marca de agua (análisis simple)
check_watermark() {
    local image="$1"
    # Usar identify para obtener comentarios/metadata
    local metadata=$(identify -verbose "$image" 2>/dev/null | grep -i "comment\|copyright\|watermark" || true)
    
    if [ -n "$metadata" ]; then
        return 0  # Tiene metadata que podría indicar marca de agua
    else
        return 1  # No tiene metadata evidente
    fi
}

# Verificar algunas imágenes
echo "🔍 Verificando presencia de marca de agua en imágenes del frontend:"
CHECKED=0
WITH_WATERMARK=0

for img in "$FRONTEND_IMAGES_DIR"/*.webp; do
    if [ -f "$img" ]; then
        filename=$(basename "$img")
        if check_watermark "$img"; then
            echo "   ✓ $filename - posible marca de agua detectada"
            ((WITH_WATERMARK++)) || true
        else
            echo "   ✗ $filename - sin metadata de marca de agua"
        fi
        ((CHECKED++)) || true
        
        # Limitar a 5 verificaciones para no saturar
        if [ $CHECKED -ge 5 ]; then
            break
        fi
    fi
done

echo ""
echo "📊 Resumen de verificación:"
echo "   - Imágenes verificadas: $CHECKED"
echo "   - Con posible marca de agua: $WITH_WATERMARK"
echo "   - Sin marca de agua evidente: $((CHECKED - WITH_WATERMARK))"
echo ""

# Opciones siguientes
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Opciones disponibles:"
echo ""
echo "1. Las imágenes en $AI_IMAGES_DIR"
echo "   ya tienen el sufijo '-v3' que indica versión procesada"
echo ""
echo "2. Para añadir marca de agua manualmente a una imagen:"
echo "   convert input.webp \\"
echo "     -gravity southeast \\"
echo "     -pointsize 20 -fill 'rgba(255,255,255,0.5)' \\"
echo "     -annotate +10+10 'Flores Victoria' \\"
echo "     output.webp"
echo ""
echo "3. Si existe un logo en $WATERMARK_LOGO:"
echo "   composite -gravity southeast -geometry +10+10 \\"
echo "     logo-watermark.png input.webp output.webp"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Verificar si existe un logo para marca de agua
if [ -f "$WATERMARK_LOGO" ]; then
    echo "✅ Logo de marca de agua encontrado: $WATERMARK_LOGO"
    echo ""
    read -p "¿Desea aplicar la marca de agua a todas las imágenes del frontend? (s/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        echo ""
        echo "🎨 Aplicando marca de agua..."
        PROCESSED=0
        
        for img in "$FRONTEND_IMAGES_DIR"/*.webp; do
            if [ -f "$img" ]; then
                filename=$(basename "$img")
                temp_file="${img}.temp.webp"
                
                echo "   Procesando: $filename"
                
                # Aplicar marca de agua con composite
                if composite -gravity southeast -geometry +10+10 -dissolve 30% \
                    "$WATERMARK_LOGO" "$img" "$temp_file" 2>/dev/null; then
                    
                    mv "$temp_file" "$img"
                    echo "   ✓ Marca de agua aplicada"
                    ((PROCESSED++)) || true
                else
                    echo "   ✗ Error al procesar"
                    rm -f "$temp_file"
                fi
            fi
        done
        
        echo ""
        echo "✅ Proceso completado: $PROCESSED imágenes procesadas"
    else
        echo "Operación cancelada"
    fi
else
    echo "⚠️  No se encontró logo de marca de agua en: $WATERMARK_LOGO"
    echo "   Las imágenes WebP en $AI_IMAGES_DIR"
    echo "   con sufijo '-v3' ya deberían tener marca de agua aplicada"
    echo ""
    echo "   Recomendación: Verificar visualmente las imágenes en el navegador"
fi

echo ""
echo "✅ Verificación completada"
