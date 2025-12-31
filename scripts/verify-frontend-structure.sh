#!/bin/bash

# Script para verificar la estructura del frontend
# Este script verifica que los archivos importantes del frontend existan

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "🔍 Verificando estructura del frontend..."

# Verificar archivos críticos
CRITICAL_FILES=(
    "frontend/index.html"
    "frontend/package.json"
)

MISSING_FILES=0

for file in "${CRITICAL_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo -e "${RED}❌ Archivo crítico faltante: $file${NC}"
        MISSING_FILES=$((MISSING_FILES + 1))
    fi
done

if [ $MISSING_FILES -eq 0 ]; then
    echo -e "${GREEN}✅ Estructura del frontend verificada correctamente${NC}"
    exit 0
else
    echo -e "${RED}❌ Se encontraron $MISSING_FILES archivos críticos faltantes${NC}"
    exit 1
fi
