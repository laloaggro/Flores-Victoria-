#!/bin/bash
# ==============================================================================
# Script Maestro de Optimización - Flores Victoria
# Ejecuta análisis, limpieza, refactorización y validaciones automáticas
# Uso: bash scripts/optimize-project.sh
# ==============================================================================

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

function print_section() {
  echo -e "${YELLOW}\n==============================="
  echo -e "$1"
  echo -e "===============================${NC}\n"
}

print_section "1. Lint y Formato (ESLint + Prettier)"
npm run lint || echo -e "${RED}Linting falló${NC}"
npm run format || echo -e "${RED}Formateo falló${NC}"

print_section "2. Limpieza de dependencias y archivos obsoletos"
npm prune
npm dedupe
find . -type f -name "*.log" -delete
find . -type f -name "*~" -delete
find . -type f -name "#*#" -delete

print_section "3. Optimización de imágenes y assets"
if [ -f scripts/optimize-images.sh ]; then
  bash scripts/optimize-images.sh
else
  echo -e "${YELLOW}No se encontró optimize-images.sh${NC}"
fi

print_section "4. Validación de tests automáticos"
npm test || echo -e "${RED}Algunos tests fallaron${NC}"

print_section "5. Limpieza de código obsoleto y comentarios"
if [ -f scripts/remove-console-logs.sh ]; then
  bash scripts/remove-console-logs.sh
else
  echo -e "${YELLOW}No se encontró remove-console-logs.sh${NC}"
fi

print_section "6. Reporte de mejoras y advertencias"
if [ -f scripts/check-critical-services.sh ]; then
  bash scripts/check-critical-services.sh
else
  echo -e "${YELLOW}No se encontró check-critical-services.sh${NC}"
fi

print_section "Optimización completa finalizada"
echo -e "${GREEN}✓ Proyecto optimizado. Revisa los reportes y logs generados.${NC}"
