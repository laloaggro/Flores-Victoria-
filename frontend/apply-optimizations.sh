#!/bin/bash

# Script para aplicar optimizaciones a todas las páginas HTML
# Agrega lazy-loading.css, sw-register.js y lazy-load.js

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   APLICANDO OPTIMIZACIONES A PÁGINAS HTML         ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════╝${NC}"
echo ""

FRONTEND_DIR="/home/impala/Documentos/Proyectos/flores-victoria/frontend"
PAGES_DIR="$FRONTEND_DIR/pages"
PROCESSED=0
SKIPPED=0

# Función para verificar si ya tiene las optimizaciones
has_optimizations() {
    local file=$1
    if grep -q "lazy-loading.css" "$file" && \
       grep -q "sw-register.js" "$file" && \
       grep -q "lazy-load.js" "$file"; then
        return 0  # Ya tiene optimizaciones
    else
        return 1  # No tiene optimizaciones
    fi
}

# Función para aplicar optimizaciones
apply_optimizations() {
    local file=$1
    local filename=$(basename "$file")
    
    echo -e "${YELLOW}  • Procesando: $filename${NC}"
    
    # Crear backup
    cp "$file" "$file.bak"
    
    # 1. Agregar lazy-loading.css después de design-system.css o style.css
    if ! grep -q "lazy-loading.css" "$file"; then
        sed -i '/<link rel="stylesheet" href=".*design-system.css">/a\    <link rel="stylesheet" href="/css/lazy-loading.css">' "$file"
        if [ $? -ne 0 ]; then
            # Intentar después de style.css si design-system.css no existe
            sed -i '/<link rel="stylesheet" href=".*style.css">/a\    <link rel="stylesheet" href="/css/lazy-loading.css">' "$file"
        fi
        echo "    ✓ Agregado lazy-loading.css"
    fi
    
    # 2. Agregar sw-register.js en el <head> si no existe
    if ! grep -q "sw-register.js" "$file"; then
        # Buscar el cierre de </head> y agregar antes
        sed -i 's|</head>|    <!-- Service Worker Registration -->\n    <script src="/js/sw-register.js" defer></script>\n</head>|' "$file"
        echo "    ✓ Agregado sw-register.js"
    fi
    
    # 3. Agregar lazy-load.js antes del cierre de </body>
    if ! grep -q "lazy-load.js" "$file"; then
        sed -i 's|</body>|    <!-- Lazy Loading de Imágenes -->\n    <script src="/js/utils/lazy-load.js" defer></script>\n</body>|' "$file"
        echo "    ✓ Agregado lazy-load.js"
    fi
    
    # 4. Actualizar imágenes para usar lazy loading (si no tienen loading="lazy")
    # Buscar img tags sin loading="lazy" y agregarlo
    sed -i 's|<img \([^>]*\)>|<img \1 loading="lazy">|g' "$file"
    # Limpiar duplicados de loading="lazy"
    sed -i 's|loading="lazy"[[:space:]]*loading="lazy"|loading="lazy"|g' "$file"
    
    echo -e "${GREEN}    ✅ Optimizaciones aplicadas${NC}"
    echo ""
}

# Procesar index.html
echo -e "${BLUE}📄 Procesando index.html${NC}"
if has_optimizations "$FRONTEND_DIR/index.html"; then
    echo -e "${GREEN}  ✓ Ya tiene optimizaciones${NC}"
    ((SKIPPED++))
else
    apply_optimizations "$FRONTEND_DIR/index.html"
    ((PROCESSED++))
fi
echo ""

# Procesar todas las páginas en pages/
echo -e "${BLUE}📁 Procesando páginas en /pages/${NC}"
for page in "$PAGES_DIR"/*.html; do
    if [ -f "$page" ]; then
        if has_optimizations "$page"; then
            echo -e "${GREEN}  ✓ $(basename "$page") - Ya optimizado${NC}"
            ((SKIPPED++))
        else
            apply_optimizations "$page"
            ((PROCESSED++))
        fi
    fi
done

# Resumen
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}📊 RESUMEN${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "  Páginas procesadas: ${GREEN}$PROCESSED${NC}"
echo -e "  Páginas omitidas:   ${YELLOW}$SKIPPED${NC}"
echo -e "  Total:              $((PROCESSED + SKIPPED))"
echo ""
echo -e "${GREEN}✅ Optimizaciones aplicadas exitosamente${NC}"
echo ""
echo -e "${YELLOW}💡 Próximos pasos:${NC}"
echo "  1. Revisar cambios con: git diff"
echo "  2. Probar el sitio: npm run dev o vite"
echo "  3. Ejecutar Lighthouse para verificar mejoras"
echo "  4. Commit cambios: git add -A && git commit"
echo ""
echo -e "${BLUE}📝 Notas:${NC}"
echo "  • Backups creados con extensión .bak"
echo "  • Lazy loading agregado a todas las imágenes"
echo "  • Service Worker se registrará automáticamente"
echo "  • Las imágenes cargarán cuando entren en viewport"
echo ""
