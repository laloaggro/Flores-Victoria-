#!/bin/bash

###############################################################################
# PurgeCSS Script - Eliminar CSS No Utilizado
# Reduce el tamaño del CSS eliminando selectores no usados
#
# Uso: ./purgecss-optimize.sh
###############################################################################

set -e  # Salir si hay error

echo "🧹 Iniciando PurgeCSS - Eliminación de CSS no utilizado..."
echo ""

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Crear directorio de salida si no existe
mkdir -p dist/css

echo -e "${BLUE}📊 Tamaños ANTES de PurgeCSS:${NC}"
echo ""

# Función para mostrar tamaño de archivo
show_size() {
  if [ -f "$1" ]; then
    size=$(stat -c%s "$1" 2>/dev/null || stat -f%z "$1" 2>/dev/null)
    size_kb=$((size / 1024))
    echo "  $1: ${size_kb}KB"
  fi
}

# Mostrar tamaños originales
show_size "css/main.css"
show_size "css/styles.css"
show_size "css/critical.css"
show_size "css/lazy-loading.css"

echo ""
echo -e "${YELLOW}🔍 Analizando archivos HTML y JS...${NC}"

# Ejecutar PurgeCSS
npx purgecss --config purgecss.config.js

echo ""
echo -e "${GREEN}✅ PurgeCSS completado${NC}"
echo ""
echo -e "${BLUE}📊 Tamaños DESPUÉS de PurgeCSS:${NC}"
echo ""

# Mostrar tamaños optimizados
show_size "dist/css/main.css"
show_size "dist/css/styles.css"
show_size "dist/css/critical.css"
show_size "dist/css/lazy-loading.css"

# Calcular reducción total
if [ -f "css/main.css" ] && [ -f "dist/css/main.css" ]; then
  original=$(stat -c%s "css/main.css" 2>/dev/null || stat -f%z "css/main.css" 2>/dev/null)
  optimized=$(stat -c%s "dist/css/main.css" 2>/dev/null || stat -f%z "dist/css/main.css" 2>/dev/null)
  
  if [ "$original" -gt 0 ]; then
    reduction=$((100 - (optimized * 100 / original)))
    saved=$((original - optimized))
    saved_kb=$((saved / 1024))
    
    echo ""
    echo -e "${GREEN}💾 Reducción total: ${reduction}% (~${saved_kb}KB ahorrados)${NC}"
  fi
fi

echo ""
echo -e "${YELLOW}📝 Archivos optimizados guardados en: dist/css/${NC}"
echo ""
echo "✅ Proceso completado con éxito!"
