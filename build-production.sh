#!/bin/bash

##############################################################################
# Script de Build para Producción - Flores Victoria
# Minifica CSS, optimiza assets, prepara para deployment
##############################################################################

set -e  # Exit on error

echo "🚀 Iniciando build de producción..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Directorios
SOURCE_DIR="frontend/css"
OUTPUT_DIR="frontend/css/min"
TEMP_DIR=".build-temp"

# Crear directorio de salida
mkdir -p "$OUTPUT_DIR"
mkdir -p "$TEMP_DIR"

##############################################################################
# 1. MINIFICAR CSS
##############################################################################
echo -e "${YELLOW}📦 Minificando CSS...${NC}"

if ! command -v npx &> /dev/null; then
    echo -e "${RED}❌ Error: npm/npx no está instalado${NC}"
    exit 1
fi

# Verificar que las dependencias estén instaladas
if [ ! -d "node_modules/cssnano" ]; then
    echo "📥 Instalando dependencias..."
    npm install --save-dev postcss postcss-cli cssnano autoprefixer postcss-import
fi

# Procesar cada archivo CSS
CSS_COUNT=0
for file in "$SOURCE_DIR"/*.css; do
    if [ -f "$file" ]; then
        filename=$(basename "$file")
        echo "  Processing: $filename"
        
        npx postcss "$file" -o "$OUTPUT_DIR/$filename" --no-map
        
        # Mostrar reducción de tamaño
        original_size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file")
        minified_size=$(stat -f%z "$OUTPUT_DIR/$filename" 2>/dev/null || stat -c%s "$OUTPUT_DIR/$filename")
        reduction=$(echo "scale=1; (1 - $minified_size / $original_size) * 100" | bc)
        
        echo -e "  ${GREEN}✓${NC} $(basename $file): $(numfmt --to=iec-i --suffix=B $original_size) → $(numfmt --to=iec-i --suffix=B $minified_size) (-${reduction}%)"
        
        CSS_COUNT=$((CSS_COUNT + 1))
    fi
done

echo -e "${GREEN}✅ Minificados $CSS_COUNT archivos CSS${NC}\n"

##############################################################################
# 2. OPTIMIZAR IMÁGENES
##############################################################################
echo -e "${YELLOW}🖼️  Optimizando imágenes...${NC}"

if [ -f "optimize-images.js" ]; then
    node optimize-images.js
else
    echo -e "${YELLOW}⚠️  Script de optimización de imágenes no encontrado${NC}"
fi

##############################################################################
# 3. VERIFICAR ARCHIVOS
##############################################################################
echo -e "${YELLOW}🔍 Verificando archivos...${NC}"

# Contar archivos generados
total_css=$(find "$OUTPUT_DIR" -name "*.css" | wc -l)
echo -e "  ${GREEN}✓${NC} $total_css archivos CSS generados"

# Tamaño total
total_size=$(du -sh "$OUTPUT_DIR" | cut -f1)
echo -e "  ${GREEN}✓${NC} Tamaño total: $total_size"

##############################################################################
# 4. LIMPIAR ARCHIVOS TEMPORALES
##############################################################################
echo -e "${YELLOW}🧹 Limpiando archivos temporales...${NC}"
rm -rf "$TEMP_DIR"
echo -e "${GREEN}✓${NC} Limpieza completada"

##############################################################################
# RESUMEN
##############################################################################
echo ""
echo "============================================"
echo -e "${GREEN}✨ BUILD COMPLETADO${NC}"
echo "============================================"
echo "📦 CSS minificado: $OUTPUT_DIR/"
echo "🖼️  Imágenes optimizadas: frontend/images/"
echo ""
echo "Para usar en producción:"
echo "  1. Actualizar imports a /css/min/*.css"
echo "  2. Deploy carpetas: /css/min/, /images/"
echo "  3. Configurar cache headers en servidor"
echo "============================================"
