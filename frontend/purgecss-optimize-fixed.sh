#!/bin/bash
set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🧹 PurgeCSS - Optimización de CSS${NC}"
echo ""

# Crear directorio de salida
mkdir -p dist/css

# Archivos CSS a procesar
CSS_FILES=(
  "base.css"
  "theme.css"
  "components.css"
  "design-system.css"
  "animations.css"
  "style.css"
  "lazy-loading.css"
  "mobile-responsive.css"
)

# Función para obtener tamaño de archivo
get_size() {
  if [[ "$OSTYPE" == "darwin"* ]]; then
    stat -f%z "$1" 2>/dev/null || echo "0"
  else
    stat -c%s "$1" 2>/dev/null || echo "0"
  fi
}

# Función para formatear tamaño
format_size() {
  local size=$1
  if [ $size -ge 1048576 ]; then
    echo "$(( size / 1048576 ))MB"
  elif [ $size -ge 1024 ]; then
    echo "$(( size / 1024 ))KB"
  else
    echo "${size}B"
  fi
}

total_before=0
total_after=0

echo -e "${BLUE}📊 Procesando archivos CSS...${NC}"
echo ""

for file in "${CSS_FILES[@]}"; do
  if [ -f "css/$file" ]; then
    before=$(get_size "css/$file")
    total_before=$((total_before + before))
    
    echo -e "  Processing ${file}..."
    npx purgecss --css "css/$file" \
      --content '**/*.html' 'js/**/*.js' 'pages/**/*.html' 'js/components/**/*.js' \
      --output dist/css/ \
      --safelist html body active show hide fade open closed visible invisible \
      2>/dev/null || true
    
    if [ -f "dist/css/$file" ]; then
      after=$(get_size "dist/css/$file")
      total_after=$((total_after + after))
      
      reduction=$(( 100 - (after * 100 / before) ))
      echo -e "  ${GREEN}✓${NC} ${file}: $(format_size $before) → $(format_size $after) (-${reduction}%)"
    fi
  fi
done

echo ""
echo -e "${GREEN}✅ Optimización completada${NC}"
echo ""
echo -e "${BLUE}📊 Resumen:${NC}"
echo -e "  Total antes:   $(format_size $total_before)"
echo -e "  Total después: $(format_size $total_after)"

if [ $total_before -gt 0 ]; then
  saved=$((total_before - total_after))
  percent=$(( 100 - (total_after * 100 / total_before) ))
  echo -e "  ${GREEN}Ahorrado:      $(format_size $saved) (-${percent}%)${NC}"
fi

echo ""
echo -e "${BLUE}📁 Archivos guardados en: dist/css/${NC}"
