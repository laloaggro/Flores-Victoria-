#!/bin/bash

# Production Optimization Script
# Minifica y optimiza CSS/JS para producción

set -e

FRONTEND_DIR="$(cd "$(dirname "$0")" && pwd)"
DIST_DIR="$FRONTEND_DIR/dist"
DATE=$(date +%Y%m%d-%H%M%S)

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   PRODUCTION OPTIMIZATION                          ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════╝${NC}"
echo ""

# Verificar dependencias
if ! command -v npx &> /dev/null; then
    echo -e "${YELLOW}⚠️  npm/npx no encontrado. Instalando dependencias...${NC}"
    exit 1
fi

# Instalar herramientas si no existen
echo -e "${GREEN}📦 Verificando herramientas...${NC}"
npm list terser clean-css-cli &>/dev/null || npm install --save-dev terser clean-css-cli

# Limpiar dist
if [ -d "$DIST_DIR" ]; then
    echo -e "${YELLOW}🗑️  Limpiando build anterior...${NC}"
    rm -rf "$DIST_DIR"
fi

# Crear estructura
echo -e "${GREEN}📁 Creando directorios...${NC}"
mkdir -p "$DIST_DIR"/{css,js/components,pages}

# Copiar HTML
echo -e "${GREEN}📄 Copiando HTML...${NC}"
cp -r "$FRONTEND_DIR/pages"/* "$DIST_DIR/pages/"

# Minificar JavaScript
echo -e "${GREEN}⚡ Minificando JavaScript...${NC}"
TOTAL_JS_ORIGINAL=0
TOTAL_JS_MIN=0

for jsfile in "$FRONTEND_DIR/js/components"/*.js; do
    [ -f "$jsfile" ] || continue
    filename=$(basename "$jsfile")
    echo "  • $filename"
    
    # Tamaño original
    size_original=$(stat -c%s "$jsfile" 2>/dev/null)
    TOTAL_JS_ORIGINAL=$((TOTAL_JS_ORIGINAL + size_original))
    
    # Minificar
    npx terser "$jsfile" \
        --compress drop_console=true,drop_debugger=true \
        --mangle \
        --output "$DIST_DIR/js/components/$filename"
    
    if [ $? -ne 0 ]; then
        echo "    ❌ Error minificando $filename"
        continue
    fi
    
    # Tamaño minificado
    size_min=$(stat -c%s "$DIST_DIR/js/components/$filename" 2>/dev/null)
    TOTAL_JS_MIN=$((TOTAL_JS_MIN + size_min))
    
    reduction=$(( (size_original - size_min) * 100 / size_original ))
    echo "    Original: $(numfmt --to=iec $size_original) → Min: $(numfmt --to=iec $size_min) (${reduction}% reducción)"
done

# Minificar CSS
echo ""
echo -e "${GREEN}🎨 Minificando CSS...${NC}"
TOTAL_CSS_ORIGINAL=0
TOTAL_CSS_MIN=0

for cssfile in "$FRONTEND_DIR/css"/*.css; do
    [ -f "$cssfile" ] || continue
    filename=$(basename "$cssfile")
    echo "  • $filename"
    
    # Tamaño original
    size_original=$(stat -c%s "$cssfile" 2>/dev/null)
    TOTAL_CSS_ORIGINAL=$((TOTAL_CSS_ORIGINAL + size_original))
    
    # Minificar
    npx clean-css-cli \
        -O 2 \
        --output "$DIST_DIR/css/$filename" \
        "$cssfile"
    
    if [ $? -ne 0 ]; then
        echo "    ❌ Error minificando $filename"
        continue
    fi
    
    # Tamaño minificado
    size_min=$(stat -c%s "$DIST_DIR/css/$filename" 2>/dev/null)
    TOTAL_CSS_MIN=$((TOTAL_CSS_MIN + size_min))
    
    reduction=$(( (size_original - size_min) * 100 / size_original ))
    echo "    Original: $(numfmt --to=iec $size_original) → Min: $(numfmt --to=iec $size_min) (${reduction}% reducción)"
done

# Estadísticas finales
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}📊 RESUMEN DE OPTIMIZACIÓN${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

JS_REDUCTION=$(( (TOTAL_JS_ORIGINAL - TOTAL_JS_MIN) * 100 / TOTAL_JS_ORIGINAL ))
CSS_REDUCTION=$(( (TOTAL_CSS_ORIGINAL - TOTAL_CSS_MIN) * 100 / TOTAL_CSS_ORIGINAL ))
TOTAL_REDUCTION=$(( ((TOTAL_JS_ORIGINAL + TOTAL_CSS_ORIGINAL) - (TOTAL_JS_MIN + TOTAL_CSS_MIN)) * 100 / (TOTAL_JS_ORIGINAL + TOTAL_CSS_ORIGINAL) ))

echo "JavaScript:"
echo "  Original:  $(numfmt --to=iec $TOTAL_JS_ORIGINAL)"
echo "  Minificado: $(numfmt --to=iec $TOTAL_JS_MIN)"
echo "  Reducción: ${JS_REDUCTION}%"
echo ""
echo "CSS:"
echo "  Original:  $(numfmt --to=iec $TOTAL_CSS_ORIGINAL)"
echo "  Minificado: $(numfmt --to=iec $TOTAL_CSS_MIN)"
echo "  Reducción: ${CSS_REDUCTION}%"
echo ""
echo "Total:"
echo "  Original:  $(numfmt --to=iec $((TOTAL_JS_ORIGINAL + TOTAL_CSS_ORIGINAL)))"
echo "  Minificado: $(numfmt --to=iec $((TOTAL_JS_MIN + TOTAL_CSS_MIN)))"
echo "  Reducción: ${TOTAL_REDUCTION}%"
echo ""

# Crear reporte
cat > "$DIST_DIR/OPTIMIZATION_REPORT.md" << EOF
# Optimization Report
**Fecha:** $(date)

## Tamaños

### JavaScript
- **Original:** $(numfmt --to=iec $TOTAL_JS_ORIGINAL)
- **Minificado:** $(numfmt --to=iec $TOTAL_JS_MIN)
- **Reducción:** ${JS_REDUCTION}%

### CSS
- **Original:** $(numfmt --to=iec $TOTAL_CSS_ORIGINAL)
- **Minificado:** $(numfmt --to=iec $TOTAL_CSS_MIN)
- **Reducción:** ${CSS_REDUCTION}%

### Total
- **Original:** $(numfmt --to=iec $((TOTAL_JS_ORIGINAL + TOTAL_CSS_ORIGINAL)))
- **Minificado:** $(numfmt --to=iec $((TOTAL_JS_MIN + TOTAL_CSS_MIN)))
- **Reducción:** ${TOTAL_REDUCTION}%

## Optimizaciones Aplicadas
✅ JavaScript minificado (Terser)
✅ CSS minificado (clean-css)
✅ Console.log removidos
✅ Debugger statements removidos
✅ Espacios en blanco optimizados
✅ Comentarios removidos

## Próximos Pasos
1. Configurar gzip en servidor (70-80% reducción adicional)
2. Implementar service worker para caching
3. Configurar CDN para assets
4. Implementar lazy loading de imágenes
5. Usar WebP para imágenes

## Mejora Estimada con Gzip
- JavaScript: ~$(numfmt --to=iec $((TOTAL_JS_MIN * 20 / 100)))
- CSS: ~$(numfmt --to=iec $((TOTAL_CSS_MIN * 20 / 100)))
- Total: ~$(numfmt --to=iec $(((TOTAL_JS_MIN + TOTAL_CSS_MIN) * 20 / 100)))
EOF

echo -e "${GREEN}✅ Optimización completada!${NC}"
echo -e "${GREEN}📁 Archivos en: $DIST_DIR${NC}"
echo -e "${YELLOW}📄 Reporte: $DIST_DIR/OPTIMIZATION_REPORT.md${NC}"
echo ""
echo -e "${BLUE}💡 Tip: Habilita gzip en tu servidor para 70-80% de reducción adicional${NC}"
