#!/bin/bash

###############################################################################
# Script de Optimización de Imágenes para Flores Victoria
# 
# Convierte imágenes JPG/PNG a WebP con compresión inteligente
# Genera thumbnails para vistas previas
# Mantiene originales como fallback
# 
# Requisitos:
#   - cwebp (instalado vía: sudo apt-get install webp)
#   - imagemagick (para resize): sudo apt-get install imagemagick
# 
# Uso:
#   chmod +x optimize-images.sh
#   ./optimize-images.sh
###############################################################################

set -e  # Exit on error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuración
IMAGES_DIR="frontend/images"
QUALITY=80  # Calidad WebP (0-100, 80 es buen balance)
THUMB_SIZE=300  # Tamaño de thumbnails
BACKUP_DIR="backups/images-original-$(date +%Y%m%d)"

# Contadores
CONVERTED=0
THUMBNAILS=0
SKIPPED=0
ERRORS=0
TOTAL_SAVED=0

echo -e "${BLUE}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   🖼️  OPTIMIZADOR DE IMÁGENES - FLORES VICTORIA              ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Verificar dependencias
echo -e "${YELLOW}Verificando dependencias...${NC}"

if ! command -v cwebp &> /dev/null; then
    echo -e "${RED}❌ cwebp no está instalado${NC}"
    echo -e "   Instalar con: ${GREEN}sudo apt-get install webp${NC}"
    exit 1
fi

if ! command -v convert &> /dev/null; then
    echo -e "${RED}❌ ImageMagick no está instalado${NC}"
    echo -e "   Instalar con: ${GREEN}sudo apt-get install imagemagick${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Todas las dependencias instaladas${NC}"
echo ""

# Crear backup de imágenes originales
echo -e "${YELLOW}Creando backup en: ${BACKUP_DIR}${NC}"
mkdir -p "$BACKUP_DIR"

# Función para convertir imagen a WebP
convert_to_webp() {
    local input="$1"
    local output="${input%.*}.webp"
    local basename=$(basename "$input")
    
    # Skip si ya existe WebP
    if [ -f "$output" ]; then
        echo -e "  ${YELLOW}⏭️  Skip: ${basename} (ya existe)${NC}"
        ((SKIPPED++))
        return
    fi
    
    # Obtener tamaño original
    local original_size=$(stat -f%z "$input" 2>/dev/null || stat -c%s "$input")
    
    # Backup original
    cp "$input" "$BACKUP_DIR/"
    
    # Convertir a WebP
    if cwebp -q $QUALITY "$input" -o "$output" &> /dev/null; then
        local webp_size=$(stat -f%z "$output" 2>/dev/null || stat -c%s "$output")
        local saved=$((original_size - webp_size))
        local percent=$((100 - (webp_size * 100 / original_size)))
        
        TOTAL_SAVED=$((TOTAL_SAVED + saved))
        
        echo -e "  ${GREEN}✅ ${basename}${NC}"
        echo -e "     Original: $(numfmt --to=iec-i --suffix=B $original_size) → WebP: $(numfmt --to=iec-i --suffix=B $webp_size) (${GREEN}-${percent}%${NC})"
        
        ((CONVERTED++))
    else
        echo -e "  ${RED}❌ Error: ${basename}${NC}"
        ((ERRORS++))
    fi
}

# Función para generar thumbnail
generate_thumbnail() {
    local input="$1"
    local dirname=$(dirname "$input")
    local basename=$(basename "$input")
    local filename="${basename%.*}"
    local extension="${basename##*.}"
    local thumb="${dirname}/${filename}-thumb.webp"
    
    # Skip si ya existe thumbnail
    if [ -f "$thumb" ]; then
        return
    fi
    
    # Generar thumbnail cuadrado
    if convert "$input" -resize "${THUMB_SIZE}x${THUMB_SIZE}^" \
              -gravity center -extent "${THUMB_SIZE}x${THUMB_SIZE}" \
              -quality $QUALITY "$thumb" &> /dev/null; then
        ((THUMBNAILS++))
        echo -e "     ${BLUE}🖼️  Thumbnail generado${NC}"
    fi
}

# Procesar imágenes
echo -e "${BLUE}Procesando imágenes en: ${IMAGES_DIR}${NC}"
echo ""

# Encontrar todas las imágenes JPG y PNG
find "$IMAGES_DIR" -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" \) | while read -r image; do
    echo -e "${BLUE}Procesando: $(basename "$image")${NC}"
    
    # Convertir a WebP
    convert_to_webp "$image"
    
    # Generar thumbnail si es imagen de producto
    if [[ "$image" == *"/productos/"* ]] || [[ "$image" == *"/products/"* ]]; then
        generate_thumbnail "$image"
    fi
    
    echo ""
done

# Resumen final
echo ""
echo -e "${BLUE}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                    📊 RESUMEN DE OPTIMIZACIÓN                 ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "  ${GREEN}✅ Convertidas a WebP:${NC}   $CONVERTED imágenes"
echo -e "  ${BLUE}🖼️  Thumbnails creados:${NC}   $THUMBNAILS"
echo -e "  ${YELLOW}⏭️  Omitidas:${NC}            $SKIPPED"
echo -e "  ${RED}❌ Errores:${NC}              $ERRORS"
echo ""
echo -e "  ${GREEN}💾 Espacio ahorrado:${NC}     $(numfmt --to=iec-i --suffix=B $TOTAL_SAVED)"
echo ""
echo -e "  ${BLUE}📁 Backup guardado en:${NC}   $BACKUP_DIR"
echo ""

# Recomendaciones
echo -e "${YELLOW}📋 PRÓXIMOS PASOS:${NC}"
echo ""
echo -e "  1. ${GREEN}Actualizar HTML${NC} para usar imágenes WebP:"
echo -e "     ${BLUE}<picture>${NC}"
echo -e "       ${BLUE}<source srcset=\"imagen.webp\" type=\"image/webp\">${NC}"
echo -e "       ${BLUE}<img src=\"imagen.jpg\" alt=\"...\">${NC}"
echo -e "     ${BLUE}</picture>${NC}"
echo ""
echo -e "  2. ${GREEN}Configurar servidor${NC} para servir WebP automáticamente"
echo -e "     (Nginx, Apache con mod_rewrite, o CDN)"
echo ""
echo -e "  3. ${GREEN}Eliminar originales${NC} una vez verificado que WebP funciona:"
echo -e "     ${BLUE}find $IMAGES_DIR -type f \( -name '*.jpg' -o -name '*.png' \) -delete${NC}"
echo ""
echo -e "${GREEN}✨ Optimización completada exitosamente!${NC}"
echo ""
