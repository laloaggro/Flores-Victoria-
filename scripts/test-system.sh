#!/bin/bash

###############################################################################
# Script para ejecutar pruebas completas del sistema Flores Victoria
#
# Uso: ./test-system.sh
#
# Este script ejecuta:
# - Pruebas de conectividad de servicios
# - Pruebas de autenticación
# - Pruebas de productos
# - Pruebas de frontend
# - Pruebas de integración
###############################################################################

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     PRUEBAS DEL SISTEMA FLORES VICTORIA                    ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Ejecutar el script de prueba en Node.js
node "$(dirname "$0")/test-complete-system.js"

exit_code=$?

if [ $exit_code -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✓ Todas las pruebas pasaron exitosamente${NC}"
    echo ""
else
    echo ""
    echo -e "${RED}✗ Algunas pruebas fallaron${NC}"
    echo ""
    exit 1
fi
