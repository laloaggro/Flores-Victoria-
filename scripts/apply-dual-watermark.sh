#!/bin/bash
# Script para aplicar marca de agua doble: fondo completo + esquina
# Flores Victoria - Dual Watermark System

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
FRONTEND_IMAGES_DIR="$PROJECT_ROOT/frontend/public/images/productos"
LOGO_SVG="$PROJECT_ROOT/frontend/public/logo.svg"

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${CYAN}════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}  Flores Victoria - Dual Watermark System${NC}"
echo -e "${CYAN}  Fondo completo + Logo esquina${NC}"
echo -e "${CYAN}════════════════════════════════════════════════════════${NC}"
echo ""

# Verificar ImageMagick
if ! command -v convert &> /dev/null; then
    echo -e "${RED}❌ Error: ImageMagick no está instalado${NC}"
    exit 1
fi

# Verificar logo SVG
if [ ! -f "$LOGO_SVG" ]; then
    echo -e "${RED}❌ Error: Logo SVG no encontrado: $LOGO_SVG${NC}"
    exit 1
fi

echo -e "${YELLOW}📊 Configuración:${NC}"
echo "   Fondo: Logo SVG transparente (1536x1536px, 5% opacidad)"
echo "   Esquina: Logo PNG pequeño (250px, derecha abajo)"
echo "   Posición esquina: +30+30 desde borde"
echo ""

# Crear marca de agua de fondo completo (muy transparente)
WATERMARK_BG="$PROJECT_ROOT/frontend/public/images/logo-watermark-bg.png"
echo -e "${YELLOW}📝 Creando marca de agua de fondo completo...${NC}"

convert "$LOGO_SVG" \
    -resize 1536x1536 \
    -background none \
    -gravity center \
    -extent 1536x1536 \
    -alpha set \
    -channel A -evaluate multiply 0.05 +channel \
    "$WATERMARK_BG"

echo -e "${GREEN}   ✅ Fondo creado: $(du -h "$WATERMARK_BG" | cut -f1)${NC}"

# Crear logo de esquina (visible)
WATERMARK_CORNER="$PROJECT_ROOT/frontend/public/images/logo-watermark-corner.png"
echo -e "${YELLOW}📝 Creando logo de esquina...${NC}"

convert "$LOGO_SVG" \
    -resize 250x \
    -background none \
    -alpha set \
    -channel A -evaluate multiply 0.6 +channel \
    "$WATERMARK_CORNER"

echo -e "${GREEN}   ✅ Esquina creada: $(du -h "$WATERMARK_CORNER" | cut -f1)${NC}"
echo ""

# Procesar imágenes
IMAGES=()
while IFS= read -r img; do
    if [[ "$img" =~ victoria.*-v3\.webp$ ]]; then
        IMAGES+=("$img")
    fi
done < <(find "$FRONTEND_IMAGES_DIR" -name "victoria-*-v3.webp" -type f 2>/dev/null)

echo -e "${YELLOW}📋 Imágenes a procesar: ${#IMAGES[@]}${NC}"
echo ""

PROCESSED=0

for img in "${IMAGES[@]}"; do
    filename=$(basename "$img")
    echo -e "${CYAN}🎨 Procesando: $filename${NC}"
    
    temp_bg="${img}.bg.webp"
    temp_final="${img}.final.webp"
    
    # Paso 1: Aplicar fondo completo (muy transparente)
    if composite -gravity center \
        "$WATERMARK_BG" "$img" "$temp_bg" 2>&1; then
        
        echo -e "${GREEN}   ✅ Fondo aplicado${NC}"
        
        # Paso 2: Aplicar logo de esquina
        if composite -gravity southeast -geometry +30+30 \
            "$WATERMARK_CORNER" "$temp_bg" "$temp_final" 2>&1; then
            
            mv "$temp_final" "$img"
            
            size=$(identify -format "%wx%h" "$img")
            kb=$(du -k "$img" | cut -f1)
            
            echo -e "${GREEN}   ✅ Logo esquina aplicado${NC}"
            echo "   📐 Final: ${size} (${kb}KB)"
            echo ""
            
            ((PROCESSED++))
            rm -f "$temp_bg" "$temp_final"
        else
            echo -e "${RED}   ❌ Error al aplicar logo de esquina${NC}"
            echo ""
            rm -f "$temp_bg" "$temp_final"
        fi
    else
        echo -e "${RED}   ❌ Error al aplicar fondo${NC}"
        echo ""
        rm -f "$temp_bg" "$temp_final"
    fi
done

echo -e "${CYAN}════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}📊 Resumen:${NC}"
echo "   ✅ Procesadas: $PROCESSED/${#IMAGES[@]}"
echo -e "${CYAN}════════════════════════════════════════════════════════${NC}"
echo ""

if [ $PROCESSED -gt 0 ]; then
    echo -e "${YELLOW}🔄 Siguiente paso: Reconstruir frontend${NC}"
    echo "   docker-compose build frontend"
    echo "   docker-compose up -d frontend"
    echo ""
    echo -e "${GREEN}✅ Marca de agua doble aplicada${NC}"
    echo "   • Fondo completo: Logo SVG transparente (5% opacidad)"
    echo "   • Esquina: Logo visible 250px (60% opacidad)"
fi

echo ""
