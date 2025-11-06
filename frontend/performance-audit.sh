#!/bin/bash

# Performance Audit Report
# Análisis completo de performance del frontend

FRONTEND_DIR="/home/impala/Documentos/Proyectos/flores-victoria/frontend"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   AUDITORÍA DE PERFORMANCE - FRONTEND              ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════╝${NC}"
echo ""

# ==================== ANÁLISIS DE JAVASCRIPT ====================

echo -e "${GREEN}📦 ANÁLISIS DE JAVASCRIPT${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "Componentes JS:"
du -sh "$FRONTEND_DIR/js/components"/*.js | sort -hr | while read size file; do
    filename=$(basename "$file")
    if [ "$size" = "12K" ] || [ "$size" = "16K" ]; then
        echo -e "  ${YELLOW}⚠️  $size - $filename${NC}"
    else
        echo -e "  ✅ $size - $filename"
    fi
done

TOTAL_JS_SIZE=$(du -sh "$FRONTEND_DIR/js/components" | cut -f1)
echo ""
echo -e "📊 Total componentes JS: ${GREEN}$TOTAL_JS_SIZE${NC}"
echo ""

# Líneas de código por componente
echo "Líneas de código:"
wc -l "$FRONTEND_DIR/js/components"/*.js | sort -rn | head -12 | while read lines file; do
    if [ "$file" != "total" ]; then
        filename=$(basename "$file" 2>/dev/null || echo "")
        if [ -n "$filename" ]; then
            if [ "$lines" -gt 300 ]; then
                echo -e "  ${YELLOW}⚠️  $lines líneas - $filename${NC}"
            else
                echo -e "  ✅ $lines líneas - $filename"
            fi
        fi
    fi
done
echo ""

# ==================== ANÁLISIS DE CSS ====================

echo -e "${GREEN}🎨 ANÁLISIS DE CSS${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "Archivos CSS más grandes:"
du -sh "$FRONTEND_DIR/css"/*.css | sort -hr | head -10 | while read size file; do
    filename=$(basename "$file")
    size_kb=${size%K}
    
    if [ "$size" = "92K" ] || [ "$size" = "88K" ] || [ "$size" = "84K" ]; then
        echo -e "  ${RED}🔴 $size - $filename (CRÍTICO)${NC}"
    elif [ "$size_kb" -gt 15 ] 2>/dev/null; then
        echo -e "  ${YELLOW}⚠️  $size - $filename (optimizable)${NC}"
    else
        echo -e "  ✅ $size - $filename"
    fi
done

TOTAL_CSS_SIZE=$(du -sh "$FRONTEND_DIR/css" | cut -f1)
echo ""
echo -e "📊 Total CSS: ${GREEN}$TOTAL_CSS_SIZE${NC}"
echo ""

# Líneas de CSS
echo "Archivos CSS por líneas:"
wc -l "$FRONTEND_DIR/css"/*.css | sort -rn | head -11 | while read lines file; do
    if [ "$file" != "total" ]; then
        filename=$(basename "$file" 2>/dev/null || echo "")
        if [ -n "$filename" ]; then
            if [ "$lines" -gt 1000 ]; then
                echo -e "  ${RED}🔴 $lines líneas - $filename${NC}"
            elif [ "$lines" -gt 500 ]; then
                echo -e "  ${YELLOW}⚠️  $lines líneas - $filename${NC}"
            else
                echo -e "  ✅ $lines líneas - $filename"
            fi
        fi
    fi
done
echo ""

# ==================== ANÁLISIS DE PÁGINAS ====================

echo -e "${GREEN}📄 ANÁLISIS DE PÁGINAS HTML${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

TOTAL_PAGES=$(find "$FRONTEND_DIR/pages" -name "*.html" -type f | wc -l)
PAGES_WITH_BUNDLE=$(grep -l "common-bundle.js" "$FRONTEND_DIR/pages"/**/*.html "$FRONTEND_DIR/pages"/*.html 2>/dev/null | wc -l)
PAGES_WITH_MAIN_CSS=$(grep -l "main.css" "$FRONTEND_DIR/pages"/**/*.html "$FRONTEND_DIR/pages"/*.html 2>/dev/null | wc -l)

echo "Total páginas: $TOTAL_PAGES"
echo "Usando common-bundle.js: $PAGES_WITH_BUNDLE ($(( PAGES_WITH_BUNDLE * 100 / TOTAL_PAGES ))%)"
echo "Usando main.css: $PAGES_WITH_MAIN_CSS ($(( PAGES_WITH_MAIN_CSS * 100 / TOTAL_PAGES ))%)"
echo ""

# Páginas más grandes
echo "Páginas HTML más grandes:"
find "$FRONTEND_DIR/pages" -name "*.html" -type f -exec du -sh {} \; | sort -hr | head -10 | while read size file; do
    filename=$(echo "$file" | sed "s|$FRONTEND_DIR/||")
    size_kb=${size%K}
    
    if [ "$size_kb" -gt 50 ] 2>/dev/null; then
        echo -e "  ${YELLOW}⚠️  $size - $filename${NC}"
    else
        echo -e "  ✅ $size - $filename"
    fi
done
echo ""

# ==================== RECOMENDACIONES ====================

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}💡 RECOMENDACIONES DE OPTIMIZACIÓN${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${RED}🔴 CRÍTICO${NC}"
echo "  1. style.css (92K) - Dividir en módulos más pequeños"
echo "  2. Eliminar CSS no utilizado con PurgeCSS"
echo "  3. Minificar todos los archivos CSS/JS en producción"
echo ""

echo -e "${YELLOW}⚠️  IMPORTANTE${NC}"
echo "  4. Implementar lazy loading para componentes no críticos"
echo "  5. Usar CSS critical inline en <head>"
echo "  6. Comprimir imágenes y usar WebP"
echo "  7. Implementar service worker para caching"
echo ""

echo -e "${GREEN}✅ BUENAS PRÁCTICAS${NC}"
echo "  8. Sistema modular ya implementado (main.css, common-bundle.js)"
echo "  9. Componentes pequeños y reutilizables"
echo "  10. Validación de formularios unificada"
echo ""

# ==================== MÉTRICAS ESTIMADAS ====================

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}📊 MÉTRICAS ESTIMADAS${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo "Tamaños actuales (sin minificar):"
echo "  • JS Total: $TOTAL_JS_SIZE"
echo "  • CSS Total: $TOTAL_CSS_SIZE"
echo ""

echo "Estimación con minificación:"
echo "  • JS minificado: ~40KB (reducción 30-40%)"
echo "  • CSS minificado: ~160KB (reducción 30-40%)"
echo ""

echo "Estimación con gzip:"
echo "  • JS gzipped: ~15KB (reducción 70-80%)"
echo "  • CSS gzipped: ~50KB (reducción 70-80%)"
echo ""

echo -e "${GREEN}✨ Objetivo: First Contentful Paint < 1.5s${NC}"
echo -e "${GREEN}✨ Objetivo: Time to Interactive < 3.5s${NC}"
echo ""

# ==================== PRÓXIMOS PASOS ====================

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎯 PRÓXIMOS PASOS${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo "1. Configurar PurgeCSS para eliminar CSS no usado"
echo "2. Implementar minificación en build process"
echo "3. Configurar service worker para caching"
echo "4. Optimizar y convertir imágenes a WebP"
echo "5. Implementar lazy loading de imágenes"
echo "6. Ejecutar Lighthouse en páginas principales"
echo "7. Configurar CDN para assets estáticos"
echo ""

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
