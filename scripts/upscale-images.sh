#!/bin/bash
# Script para mejorar la calidad de imágenes AI duplicando resolución
# Flores Victoria - Upscale AI Images

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
AI_IMAGES_DIR="$PROJECT_ROOT/services/ai-image-service/cache/images"
FRONTEND_IMAGES_DIR="$PROJECT_ROOT/frontend/public/images/productos"
WATERMARK_LOGO="$PROJECT_ROOT/frontend/public/images/logo-watermark.png"

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${CYAN}════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}  Flores Victoria - Upscale AI Images (2x Quality)${NC}"
echo -e "${CYAN}════════════════════════════════════════════════════════${NC}"
echo ""

# Verificar ImageMagick
if ! command -v convert &> /dev/null; then
    echo -e "${RED}❌ Error: ImageMagick no está instalado${NC}"
    echo "   sudo apt-get install imagemagick"
    exit 1
fi

# Verificar logo de marca de agua
if [ ! -f "$WATERMARK_LOGO" ]; then
    echo -e "${RED}❌ Error: Logo de marca de agua no encontrado${NC}"
    exit 1
fi

echo -e "${YELLOW}📊 Configuración:${NC}"
echo "   Resolución original: 768x768px"
echo "   Resolución nueva:    1536x1536px (2x)"
echo "   Método:             Lanczos (alta calidad)"
echo "   Formato:            WebP optimizado"
echo "   Marca de agua:      Sí (300px, 40% opacidad)"
echo ""

# Crear logo de marca de agua en alta resolución
WATERMARK_LOGO_HD="$PROJECT_ROOT/frontend/public/images/logo-watermark-hd.png"

if [ ! -f "$WATERMARK_LOGO_HD" ]; then
    echo -e "${YELLOW}📝 Creando logo HD para marca de agua (300px)...${NC}"
    LOGO_SOURCE="$PROJECT_ROOT/frontend/public/images/logo.png"
    
    if [ -f "$LOGO_SOURCE" ]; then
        convert "$LOGO_SOURCE" \
            -resize 300x \
            -alpha set \
            -channel A -evaluate multiply 0.4 +channel \
            "$WATERMARK_LOGO_HD"
        
        echo -e "${GREEN}   ✅ Logo HD creado: $(du -h "$WATERMARK_LOGO_HD" | cut -f1)${NC}"
    else
        echo -e "${RED}   ❌ Logo fuente no encontrado${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ Logo HD ya existe: $(du -h "$WATERMARK_LOGO_HD" | cut -f1)${NC}"
fi

echo ""

# Buscar imágenes v3
IMAGES=()
while IFS= read -r img; do
    if [[ "$img" =~ -v3\.webp$ ]] && [[ ! "$img" =~ (thumb|medium) ]]; then
        IMAGES+=("$img")
    fi
done < <(find "$AI_IMAGES_DIR" -name "*.webp" -type f 2>/dev/null)

echo -e "${YELLOW}📋 Imágenes encontradas: ${#IMAGES[@]}${NC}"
echo ""

if [ ${#IMAGES[@]} -eq 0 ]; then
    echo -e "${RED}❌ No se encontraron imágenes para procesar${NC}"
    exit 1
fi

PROCESSED=0
FAILED=0

for source_img in "${IMAGES[@]}"; do
    filename=$(basename "$source_img")
    dest_path="$FRONTEND_IMAGES_DIR/$filename"
    
    echo -e "${CYAN}🎨 Procesando: $filename${NC}"
    
    # Obtener tamaño original
    original_size=$(identify -format "%wx%h" "$source_img")
    original_kb=$(du -k "$source_img" | cut -f1)
    
    echo "   📐 Original: ${original_size} (${original_kb}KB)"
    
    # Crear versión de alta calidad
    temp_upscaled="${dest_path}.upscaled.webp"
    temp_final="${dest_path}.final.webp"
    
    # Paso 1: Upscale a 1536x1536 con Lanczos (mejor calidad)
    if convert "$source_img" \
        -filter Lanczos \
        -resize 1536x1536 \
        -quality 95 \
        -define webp:lossless=false \
        -define webp:method=6 \
        "$temp_upscaled" 2>&1; then
        
        echo -e "${GREEN}   ✅ Escalado a 1536x1536 (Lanczos)${NC}"
        
        # Paso 2: Aplicar marca de agua HD
        if composite -gravity southeast -geometry +40+40 -dissolve 35% \
            "$WATERMARK_LOGO_HD" "$temp_upscaled" "$temp_final" 2>&1; then
            
            # Mover al destino final
            mv "$temp_final" "$dest_path"
            
            # Obtener tamaño final
            final_size=$(identify -format "%wx%h" "$dest_path")
            final_kb=$(du -k "$dest_path" | cut -f1)
            
            echo -e "${GREEN}   ✅ Marca de agua aplicada${NC}"
            echo "   📐 Final: ${final_size} (${final_kb}KB)"
            echo "   📈 Incremento: $((final_kb - original_kb))KB (+$((final_kb * 100 / original_kb - 100))%)"
            echo ""
            
            ((PROCESSED++))
            
            # Limpiar archivos temporales
            rm -f "$temp_upscaled" "$temp_final"
        else
            echo -e "${RED}   ❌ Error al aplicar marca de agua${NC}"
            echo ""
            ((FAILED++))
            rm -f "$temp_upscaled" "$temp_final"
        fi
    else
        echo -e "${RED}   ❌ Error al escalar imagen${NC}"
        echo ""
        ((FAILED++))
        rm -f "$temp_upscaled" "$temp_final"
    fi
done

echo -e "${CYAN}════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}📊 Resumen:${NC}"
echo "   ✅ Procesadas exitosamente: $PROCESSED"
if [ $FAILED -gt 0 ]; then
    echo -e "   ${RED}❌ Fallidas: $FAILED${NC}"
fi
echo "   📁 Total: ${#IMAGES[@]}"
echo -e "${CYAN}════════════════════════════════════════════════════════${NC}"
echo ""

if [ $PROCESSED -gt 0 ]; then
    echo -e "${YELLOW}🔄 Siguiente paso: Reconstruir frontend${NC}"
    echo "   cd $PROJECT_ROOT"
    echo "   docker-compose build frontend"
    echo "   docker-compose up -d frontend"
    echo ""
    
    echo -e "${GREEN}✅ Calidad mejorada a 1536x1536px (2x resolución)${NC}"
else
    echo -e "${RED}⚠️  No se procesaron imágenes${NC}"
fi

echo ""
