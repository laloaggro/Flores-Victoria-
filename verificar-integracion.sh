#!/bin/bash

echo "╔══════════════════════════════════════════════════════════╗"
echo "║   🔍 Verificación de Integraciones - Flores Victoria    ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

cd frontend

echo "1. Verificando archivos de componentes..."
echo ""

components=(
  "js/accessibility.js"
  "js/global-search.js"
  "js/form-validation.js"
  "css/global-search.css"
)

for component in "${components[@]}"; do
  if [ -f "$component" ]; then
    size=$(ls -lh "$component" | awk '{print $5}')
    echo -e "  ${GREEN}✓${NC} $component ($size)"
  else
    echo -e "  ${RED}✗${NC} $component - NO ENCONTRADO"
  fi
done

echo ""
echo "2. Verificando integraciones en páginas HTML..."
echo ""

# Check accessibility.js
echo -n "  accessibility.js en páginas: "
count=$(grep -l "accessibility.js" index.html pages/products.html pages/contact.html 2>/dev/null | wc -l)
echo -e "${GREEN}$count/3${NC} páginas"

# Check global-search
echo -n "  global-search en páginas: "
count=$(grep -l "global-search" index.html pages/products.html 2>/dev/null | wc -l)
echo -e "${GREEN}$count/2${NC} páginas"

# Check form-validation
echo -n "  form-validation.js: "
if grep -q "form-validation.js" pages/contact.html 2>/dev/null; then
  echo -e "${GREEN}✓${NC} Integrado en contact.html"
else
  echo -e "${RED}✗${NC} No encontrado"
fi

# Check data-validate
echo -n "  data-validate attribute: "
if grep -q "data-validate" pages/contact.html 2>/dev/null; then
  echo -e "${GREEN}✓${NC} Presente en formulario"
else
  echo -e "${RED}✗${NC} No encontrado"
fi

# Check JSON-LD schemas
echo -n "  JSON-LD schemas: "
count=$(grep -c "schema.org" index.html 2>/dev/null)
echo -e "${GREEN}$count${NC} schemas encontrados"

# Check search button
echo -n "  Botón de búsqueda: "
if grep -q "toggleSearch" index.html 2>/dev/null; then
  echo -e "${GREEN}✓${NC} Presente en header"
else
  echo -e "${RED}✗${NC} No encontrado"
fi

echo ""
echo "3. Tamaño total de componentes nuevos:"
echo ""

total_size=0
for component in "${components[@]}"; do
  if [ -f "$component" ]; then
    size=$(stat -c%s "$component")
    total_size=$((total_size + size))
  fi
done

total_kb=$((total_size / 1024))
echo -e "  Total: ${YELLOW}${total_kb}KB${NC}"

echo ""
echo "4. Archivos de documentación:"
echo ""

docs=(
  "../MEJORAS_AVANZADAS.md"
  "../INTEGRACION_COMPLETADA.md"
  "test-integration.html"
)

for doc in "${docs[@]}"; do
  if [ -f "$doc" ]; then
    echo -e "  ${GREEN}✓${NC} $(basename $doc)"
  else
    echo -e "  ${RED}✗${NC} $(basename $doc)"
  fi
done

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║                  ✅ Verificación Completa                ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
echo "Para probar las integraciones, abre:"
echo "  http://localhost:8080/test-integration.html"
echo ""
echo "O ejecuta:"
echo "  cd frontend && python3 -m http.server 8080"
echo ""
