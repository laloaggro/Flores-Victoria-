#!/bin/bash

# Script para migrar de style.css a main.css
# Reemplaza las referencias a style.css con critical.css + main.css

set -e

FRONTEND_DIR="/home/impala/Documentos/Proyectos/flores-victoria/frontend"
PAGES_DIR="$FRONTEND_DIR/pages"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}=== Migración a main.css ===${NC}"

MIGRATED=0

# Encontrar todas las páginas que usan style.css
while IFS= read -r file; do
    RELATIVE_PATH="${file#$FRONTEND_DIR/}"
    echo -e "${GREEN}🔄 Procesando: $RELATIVE_PATH${NC}"
    
    # Reemplazar style.css con critical.css inline + main.css
    sed -i 's|<link rel="stylesheet" href="\.\./css/style\.css">|<link rel="stylesheet" href="../css/critical.css">\n    <link rel="stylesheet" href="../css/main.css">|g' "$file"
    
    # También manejar rutas sin ../
    sed -i 's|<link rel="stylesheet" href="css/style\.css">|<link rel="stylesheet" href="css/critical.css">\n    <link rel="stylesheet" href="css/main.css">|g' "$file"
    
    MIGRATED=$((MIGRATED + 1))
    echo "  ✅ Migrado"
    
done < <(grep -l 'href=.*style\.css' "$PAGES_DIR"/*.html "$PAGES_DIR"/**/*.html 2>/dev/null)

echo ""
echo -e "${GREEN}✅ Migración completada${NC}"
echo "Total migrado: $MIGRATED archivos"
echo ""
echo "Beneficios:"
echo "  • critical.css (inline) para first paint rápido"
echo "  • main.css carga todos los estilos modularmente"
echo "  • Mejor organización y mantenibilidad"
