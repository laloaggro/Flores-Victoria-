#!/bin/bash

# Script de verificación rápida post-reorganización
# Verifica que la nueva estructura esté correcta

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo "╔══════════════════════════════════════════════════════════════════════╗"
echo "║     🔍 VERIFICACIÓN RÁPIDA POST-REORGANIZACIÓN                      ║"
echo "╚══════════════════════════════════════════════════════════════════════╝"
echo ""

ERRORS=0
WARNINGS=0

# Función para verificar directorio
check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✓${NC} $2"
    else
        echo -e "${RED}✗${NC} $2"
        ((ERRORS++))
    fi
}

# Función para verificar archivo
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $2"
    else
        echo -e "${YELLOW}⚠${NC} $2"
        ((WARNINGS++))
    fi
}

# Función para contar archivos
count_files() {
    COUNT=$(find "$1" -maxdepth 1 -type f 2>/dev/null | wc -l)
    echo -e "${BLUE}ℹ${NC} $2: $COUNT archivos"
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📁 VERIFICANDO ESTRUCTURA DE CARPETAS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

check_dir "docs" "Carpeta docs/ existe"
check_dir "docs/deploy" "Carpeta docs/deploy/ existe"
check_dir "docs/guides" "Carpeta docs/guides/ existe"
check_dir "docs/analysis" "Carpeta docs/analysis/ existe"
check_dir "docs/optimizations" "Carpeta docs/optimizations/ existe"
check_dir "docs/reports" "Carpeta docs/reports/ existe"
check_dir "docs/archive" "Carpeta docs/archive/ existe"

echo ""
check_dir "config" "Carpeta config/ existe"
check_dir "config/env" "Carpeta config/env/ existe"
check_dir "config/docker" "Carpeta config/docker/ existe"

echo ""
check_dir "scripts" "Carpeta scripts/ existe"
check_dir "scripts/deploy" "Carpeta scripts/deploy/ existe"
check_dir "scripts/monitoring" "Carpeta scripts/monitoring/ existe"
check_dir "scripts/maintenance" "Carpeta scripts/maintenance/ existe"
check_dir "scripts/utilities" "Carpeta scripts/utilities/ existe"
check_dir "scripts/.archive" "Carpeta scripts/.archive/ existe"

echo ""
check_dir "tools" "Carpeta tools/ existe"
check_dir "tools/image-generation" "Carpeta tools/image-generation/ existe"
check_dir "tools/testing" "Carpeta tools/testing/ existe"
check_dir "tools/analysis" "Carpeta tools/analysis/ existe"

echo ""
check_dir "backups" "Carpeta backups/ unificada existe"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📄 VERIFICANDO ARCHIVOS CLAVE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

check_file "README.md" "README.md en root"
check_file "DIRECTORY_STRUCTURE.md" "DIRECTORY_STRUCTURE.md"
check_file "DOCS_INDEX.md" "DOCS_INDEX.md"
check_file "docker-compose.yml" "docker-compose.yml"
check_file "package.json" "package.json"

echo ""
check_file "tools/README.md" "tools/README.md"
check_file "docs/guides/MIGRATION_GUIDE.md" "MIGRATION_GUIDE.md"
check_file "docs/guides/SCRIPTS_QUICK_REFERENCE.md" "SCRIPTS_QUICK_REFERENCE.md"
check_file "docs/guides/POST_REORGANIZATION_CHECKLIST.md" "POST_REORGANIZATION_CHECKLIST.md"

echo ""
check_file "scripts/utilities/services-manager.sh" "services-manager.sh (script maestro)"
check_file "scripts/utilities/test-runner.sh" "test-runner.sh (script maestro)"
check_file "scripts/monitoring/verify-all.sh" "verify-all.sh (script maestro)"

echo ""
check_file "config/jest.config.js" "jest.config.js en config/"
check_file "config/playwright.config.js" "playwright.config.js en config/"
check_file "config/eslint.config.js" "eslint.config.js en config/"

echo ""
check_file "frontend/public/sw.js" "sw.js en frontend/public/"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 ESTADÍSTICAS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

count_files "." "Root directory"
count_files "docs" "docs/"
count_files "config" "config/"
count_files "scripts" "scripts/"
count_files "tools" "tools/"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎯 RESULTADO"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ Verificación EXITOSA - Estructura correcta${NC}"
    echo ""
    echo "El proyecto está correctamente organizado y listo para usar."
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  Verificación con ADVERTENCIAS${NC}"
    echo ""
    echo "Errores críticos: $ERRORS"
    echo "Advertencias: $WARNINGS"
    echo ""
    echo "Algunas verificaciones opcionales fallaron, pero la estructura básica es correcta."
    exit 0
else
    echo -e "${RED}❌ Verificación FALLIDA${NC}"
    echo ""
    echo "Errores críticos: $ERRORS"
    echo "Advertencias: $WARNINGS"
    echo ""
    echo "Hay problemas críticos en la estructura. Revisa los errores marcados arriba."
    exit 1
fi
