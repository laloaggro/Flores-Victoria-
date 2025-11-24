#!/bin/bash
# Script para crear build de producción sin logs
# Elimina console.log, logger.debug, y comentarios de debug

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}🏗️  Build de Producción - Flores Victoria${NC}"
echo ""

# 1. Verificar que no hay cambios sin commitear
if [ -n "$(git status --porcelain)" ]; then
  echo -e "${YELLOW}⚠️  Hay cambios sin commitear. Hazlo antes de build de producción.${NC}"
  read -p "¿Continuar de todos modos? (y/N): " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

# 2. Instalar dependencias si es necesario
echo -e "${GREEN}📦 Verificando dependencias...${NC}"
if [ ! -d "node_modules" ]; then
  npm install
fi

# 3. Limpiar build anterior
echo -e "${GREEN}🧹 Limpiando builds anteriores...${NC}"
rm -rf frontend/dist
rm -rf dist

# 4. Crear directorio temporal para archivos procesados
echo -e "${GREEN}🔧 Preparando archivos para producción...${NC}"
TEMP_DIR="temp_build_$(date +%s)"
mkdir -p "$TEMP_DIR/frontend"

# Copiar estructura
cp -r frontend/* "$TEMP_DIR/frontend/"

# 5. Eliminar console.log y logger.debug de archivos JS
echo -e "${GREEN}🗑️  Eliminando logs de desarrollo...${NC}"

find "$TEMP_DIR/frontend" -name "*.js" -type f | while read file; do
  # Eliminar console.log, console.debug, console.info
  sed -i '/^[[:space:]]*console\.log(/d' "$file"
  sed -i '/^[[:space:]]*console\.debug(/d' "$file"
  sed -i '/^[[:space:]]*console\.info(/d' "$file"
  
  # Eliminar logger.debug
  sed -i '/^[[:space:]]*logger\.debug(/d' "$file"
  
  # Mantener console.warn y console.error
  
  # Eliminar comentarios // DEBUG:
  sed -i '/^[[:space:]]*\/\/[[:space:]]*DEBUG:/d' "$file"
done

echo "   ✅ Logs de desarrollo eliminados"

# 6. Establecer NODE_ENV=production
export NODE_ENV=production

# 7. Build con Vite (si aplica)
if [ -f "frontend/package.json" ]; then
  echo -e "${GREEN}⚡ Building con Vite...${NC}"
  cd frontend
  npm run build
  cd ..
else
  # Si no hay Vite, mover archivos procesados
  mv "$TEMP_DIR/frontend" dist
fi

# 8. Minificar HTML
echo -e "${GREEN}📦 Minificando HTML...${NC}"
if command -v html-minifier &> /dev/null; then
  find dist -name "*.html" -type f | while read file; do
    html-minifier --collapse-whitespace --remove-comments --minify-css true --minify-js true "$file" -o "$file.min"
    mv "$file.min" "$file"
  done
  echo "   ✅ HTML minificado"
else
  echo "   ⚠️  html-minifier no instalado, omitiendo"
fi

# 9. Comprimir assets
echo -e "${GREEN}🗜️  Comprimiendo assets...${NC}"
if command -v gzip &> /dev/null; then
  find dist -type f \( -name "*.js" -o -name "*.css" -o -name "*.html" \) | while read file; do
    gzip -k -9 "$file"
  done
  echo "   ✅ Assets comprimidos con gzip"
fi

# 10. Limpiar temporal
rm -rf "$TEMP_DIR"

# 11. Reporte final
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ BUILD DE PRODUCCIÓN COMPLETADO${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if [ -d "dist" ]; then
  DIST_SIZE=$(du -sh dist | cut -f1)
  FILE_COUNT=$(find dist -type f | wc -l)
  
  echo "📁 Directorio: dist/"
  echo "📊 Tamaño total: $DIST_SIZE"
  echo "📄 Archivos: $FILE_COUNT"
  echo ""
  
  # Mostrar estructura
  echo "🌳 Estructura:"
  tree -L 2 dist/ 2>/dev/null || find dist -type d | head -20
  echo ""
fi

echo "🚀 Listo para desplegar:"
echo "   - Sin logs de desarrollo"
echo "   - Assets minificados"
echo "   - Archivos comprimidos (gzip)"
echo ""
echo "📝 Siguiente paso:"
echo "   Deploy: ./scripts/deploy-production.sh"
echo "   O subir dist/ a tu servidor"
