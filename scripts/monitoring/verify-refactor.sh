#!/bin/bash
# ============================================================================
# Verificación de Refactorización de Componentes - Flores Victoria
# ============================================================================

set -e

echo "🔍 Verificación de Refactorización de Componentes"
echo "=================================================="
echo ""

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Contador de checks
TOTAL=0
PASSED=0

# Función para verificar
check() {
    TOTAL=$((TOTAL + 1))
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}   ✅ $1${NC}"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}   ❌ $1${NC}"
    fi
}

# 1. Verificar archivos CSS de componentes creados
echo -e "${BLUE}1️⃣  Verificando archivos CSS de componentes...${NC}"

FILES_CSS=(
    "/home/impala/Documentos/Proyectos/flores-victoria/frontend/css/components/dark-mode.css"
    "/home/impala/Documentos/Proyectos/flores-victoria/frontend/css/instant-search.css"
    "/home/impala/Documentos/Proyectos/flores-victoria/frontend/css/toast.css"
    "/home/impala/Documentos/Proyectos/flores-victoria/frontend/css/form-validator.css"
)

for file in "${FILES_CSS[@]}"; do
    if [ -f "$file" ]; then
        lines=$(wc -l < "$file")
        echo -e "${GREEN}   ✅ $(basename $file) - ${lines} líneas${NC}"
        PASSED=$((PASSED + 1))
    else
        echo -e "${YELLOW}   ⚠️  $(basename $file) - No encontrado${NC}"
    fi
    TOTAL=$((TOTAL + 1))
done

echo ""

# 2. Verificar que JS no tenga CSS inline
echo -e "${BLUE}2️⃣  Verificando que JS no tenga CSS embebido...${NC}"

if ! grep -q "document.createElement('style')" "/home/impala/Documentos/Proyectos/flores-victoria/frontend/js/components/dark-mode.js"; then
    echo -e "${GREEN}   ✅ dark-mode.js limpio (sin CSS inline)${NC}"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}   ❌ dark-mode.js aún tiene CSS inline${NC}"
fi
TOTAL=$((TOTAL + 1))

echo ""

# 3. Verificar integración en HTML
echo -e "${BLUE}3️⃣  Verificando integración en archivos HTML...${NC}"

# index.html
if grep -q "dark-mode.css" "/home/impala/Documentos/Proyectos/flores-victoria/frontend/index.html"; then
    echo -e "${GREEN}   ✅ index.html carga dark-mode.css${NC}"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}   ❌ index.html NO carga dark-mode.css${NC}"
fi
TOTAL=$((TOTAL + 1))

# catalog.html
if grep -q "dark-mode.css" "/home/impala/Documentos/Proyectos/flores-victoria/frontend/pages/catalog.html"; then
    echo -e "${GREEN}   ✅ catalog.html carga dark-mode.css${NC}"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}   ❌ catalog.html NO carga dark-mode.css${NC}"
fi
TOTAL=$((TOTAL + 1))

echo ""

# 4. Verificar orden correcto de carga (CSS antes de JS)
echo -e "${BLUE}4️⃣  Verificando orden de carga (CSS → JS)...${NC}"

# Extraer números de línea
INDEX_HTML="/home/impala/Documentos/Proyectos/flores-victoria/frontend/index.html"
CSS_LINE=$(grep -n "dark-mode.css" "$INDEX_HTML" | cut -d: -f1 | head -1)
JS_LINE=$(grep -n "dark-mode.js" "$INDEX_HTML" | cut -d: -f1 | head -1)

if [ -n "$CSS_LINE" ] && [ -n "$JS_LINE" ]; then
    if [ "$CSS_LINE" -lt "$JS_LINE" ]; then
        echo -e "${GREEN}   ✅ index.html: CSS (línea $CSS_LINE) antes de JS (línea $JS_LINE)${NC}"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}   ❌ index.html: JS carga antes que CSS${NC}"
    fi
else
    echo -e "${YELLOW}   ⚠️  No se pudo verificar orden en index.html${NC}"
fi
TOTAL=$((TOTAL + 1))

echo ""

# 5. Verificar tamaños de archivos
echo -e "${BLUE}5️⃣  Estadísticas de archivos refactorizados...${NC}"

echo -e "   ${BLUE}dark-mode.css:${NC}"
if [ -f "/home/impala/Documentos/Proyectos/flores-victoria/frontend/css/components/dark-mode.css" ]; then
    LINES=$(wc -l < "/home/impala/Documentos/Proyectos/flores-victoria/frontend/css/components/dark-mode.css")
    SIZE=$(du -h "/home/impala/Documentos/Proyectos/flores-victoria/frontend/css/components/dark-mode.css" | cut -f1)
    echo -e "      Líneas: ${GREEN}$LINES${NC}"
    echo -e "      Tamaño: ${GREEN}$SIZE${NC}"
fi

echo -e "   ${BLUE}dark-mode.js:${NC}"
if [ -f "/home/impala/Documentos/Proyectos/flores-victoria/frontend/js/components/dark-mode.js" ]; then
    LINES=$(wc -l < "/home/impala/Documentos/Proyectos/flores-victoria/frontend/js/components/dark-mode.js")
    SIZE=$(du -h "/home/impala/Documentos/Proyectos/flores-victoria/frontend/js/components/dark-mode.js" | cut -f1)
    echo -e "      Líneas: ${GREEN}$LINES${NC}"
    echo -e "      Tamaño: ${GREEN}$SIZE${NC}"
fi

echo ""

# 6. Buscar otros componentes con CSS inline
echo -e "${BLUE}6️⃣  Buscando otros componentes con CSS inline...${NC}"

COMPONENTS_DIR="/home/impala/Documentos/Proyectos/flores-victoria/frontend/js/components"
INLINE_CSS_FOUND=0

for js_file in "$COMPONENTS_DIR"/*.js; do
    if grep -q "document.createElement('style')" "$js_file"; then
        echo -e "${YELLOW}   ⚠️  $(basename $js_file) tiene CSS inline${NC}"
        INLINE_CSS_FOUND=$((INLINE_CSS_FOUND + 1))
    fi
done

if [ $INLINE_CSS_FOUND -eq 0 ]; then
    echo -e "${GREEN}   ✅ No se encontró CSS inline en ningún componente${NC}"
    PASSED=$((PASSED + 1))
else
    echo -e "${YELLOW}   ⚠️  $INLINE_CSS_FOUND componente(s) aún tienen CSS inline${NC}"
    echo -e "   ${BLUE}Componentes pendientes de refactorizar:${NC}"
    for js_file in "$COMPONENTS_DIR"/*.js; do
        if grep -q "document.createElement('style')" "$js_file"; then
            echo -e "      - $(basename $js_file)"
        fi
    done
fi
TOTAL=$((TOTAL + 1))

echo ""

# 7. Resultado final
echo "=================================================="
echo -e "${BLUE}📊 Resumen:${NC}"
echo -e "   Total de checks: ${BLUE}$TOTAL${NC}"
echo -e "   Pasados: ${GREEN}$PASSED${NC}"
echo -e "   Fallidos: ${RED}$((TOTAL - PASSED))${NC}"

PERCENTAGE=$(( (PASSED * 100) / TOTAL ))
echo -e "   Progreso: ${GREEN}${PERCENTAGE}%${NC}"

echo ""

if [ $PASSED -eq $TOTAL ]; then
    echo -e "${GREEN}✅ ¡Refactorización completada exitosamente!${NC}"
    exit 0
elif [ $PERCENTAGE -ge 80 ]; then
    echo -e "${YELLOW}⚠️  Refactorización casi completa (>80%)${NC}"
    exit 0
else
    echo -e "${RED}❌ Refactorización incompleta${NC}"
    exit 1
fi
