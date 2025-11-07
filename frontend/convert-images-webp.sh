#!/bin/bash

# Script para convertir imágenes JPG/PNG a WebP
# Mantiene archivos originales como fallback

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   CONVERSIÓN DE IMÁGENES A WEBP                   ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════╝${NC}"
echo ""

FRONTEND_DIR="/home/impala/Documentos/Proyectos/flores-victoria/frontend"
IMAGES_DIR="$FRONTEND_DIR/images"
QUALITY=80
TOTAL_ORIGINAL=0
TOTAL_WEBP=0
COUNT=0
SKIPPED=0

# Verificar que cwebp esté instalado
if ! command -v cwebp &> /dev/null; then
    echo -e "${RED}❌ Error: cwebp no está instalado${NC}"
    echo "Instalar con: sudo apt-get install webp"
    exit 1
fi

# Función para convertir imagen
convert_to_webp() {
    local input=$1
    local output="${input%.*}.webp"
    
    # Si ya existe WebP y es más nuevo que el original, skip
    if [ -f "$output" ] && [ "$output" -nt "$input" ]; then
        echo -e "${YELLOW}  ⊘ Omitido (ya existe y es reciente)${NC}"
        ((SKIPPED++))
        return
    fi
    
    # Obtener tamaño original
    local size_original=$(stat -c%s "$input" 2>/dev/null)
    
    # Convertir
    if cwebp -q $QUALITY "$input" -o "$output" &> /dev/null; then
        local size_webp=$(stat -c%s "$output" 2>/dev/null)
        local reduction=$(( (size_original - size_webp) * 100 / size_original ))
        
        TOTAL_ORIGINAL=$((TOTAL_ORIGINAL + size_original))
        TOTAL_WEBP=$((TOTAL_WEBP + size_webp))
        ((COUNT++))
        
        echo -e "${GREEN}  ✓ Convertido: $(basename "$output")${NC}"
        echo "    Original: $(numfmt --to=iec $size_original) → WebP: $(numfmt --to=iec $size_webp) (${reduction}% reducción)"
    else
        echo -e "${RED}  ✗ Error convirtiendo $(basename "$input")${NC}"
    fi
}

# Buscar y convertir JPG
echo -e "${BLUE}🖼️  Convirtiendo imágenes JPG...${NC}"
echo ""
while IFS= read -r -d '' image; do
    echo "Procesando: $(basename "$image")"
    convert_to_webp "$image"
done < <(find "$IMAGES_DIR" -type f \( -iname "*.jpg" -o -iname "*.jpeg" \) -print0)

echo ""
echo -e "${BLUE}🖼️  Convirtiendo imágenes PNG...${NC}"
echo ""
while IFS= read -r -d '' image; do
    echo "Procesando: $(basename "$image")"
    convert_to_webp "$image"
done < <(find "$IMAGES_DIR" -type f -iname "*.png" -print0)

# Resumen
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}📊 RESUMEN DE CONVERSIÓN${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "  Imágenes convertidas: ${GREEN}$COUNT${NC}"
echo -e "  Imágenes omitidas:    ${YELLOW}$SKIPPED${NC}"

if [ $COUNT -gt 0 ]; then
    local total_reduction=$(( (TOTAL_ORIGINAL - TOTAL_WEBP) * 100 / TOTAL_ORIGINAL ))
    echo ""
    echo -e "  Tamaño original total: $(numfmt --to=iec $TOTAL_ORIGINAL)"
    echo -e "  Tamaño WebP total:     $(numfmt --to=iec $TOTAL_WEBP)"
    echo -e "  Reducción total:       ${GREEN}${total_reduction}%${NC}"
    echo -e "  Ahorro:                $(numfmt --to=iec $((TOTAL_ORIGINAL - TOTAL_WEBP)))"
fi

echo ""
echo -e "${GREEN}✅ Conversión completada${NC}"
echo ""
echo -e "${YELLOW}💡 Próximos pasos:${NC}"
echo "  1. Verificar imágenes WebP en $IMAGES_DIR"
echo "  2. Las páginas HTML ya usan <picture> con WebP como primera opción"
echo "  3. Los navegadores modernos cargarán WebP automáticamente"
echo "  4. Navegadores antiguos usarán JPG/PNG como fallback"
echo ""
echo -e "${BLUE}📝 Nota:${NC}"
echo "  • Archivos originales (JPG/PNG) se mantienen como fallback"
echo "  • WebP ofrece ~30-40% menos peso con igual calidad"
echo "  • Soportado en 95%+ de navegadores modernos"
echo ""
