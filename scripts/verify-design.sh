#!/bin/bash

# Script de Verificación de Diseño Unificado
# Flores Victoria - v2.0
# Fecha: 22 de octubre de 2025

echo "=============================================="
echo "🌸 Verificación del Sistema de Diseño"
echo "   Arreglos Victoria v2.0"
echo "=============================================="
echo ""

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Contadores
PASSED=0
FAILED=0
WARNINGS=0

# Función para verificar archivo
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $2"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} $2"
        ((FAILED++))
    fi
}

# Función para verificar contenido
check_content() {
    if grep -q "$2" "$1" 2>/dev/null; then
        echo -e "${GREEN}✓${NC} $3"
        ((PASSED++))
    else
        echo -e "${YELLOW}⚠${NC} $3"
        ((WARNINGS++))
    fi
}

echo "📁 Verificando Estructura de Archivos..."
echo "-------------------------------------------"

# Verificar archivos CSS
check_file "frontend/public/css/design-system.css" "Sistema de diseño unificado"
check_file "frontend/public/css/base.css" "CSS base (reset)"
check_file "frontend/public/css/style.css" "Estilos del tema"
check_file "frontend/public/css/fixes.css" "Parches CSS"

# Verificar logo
check_file "frontend/public/logo.svg" "Logo SVG del frontend"
check_file "admin-site/assets/logo.svg" "Logo SVG del admin"

# Verificar páginas actualizadas
echo ""
echo "📄 Verificando Páginas Actualizadas..."
echo "-------------------------------------------"
check_file "frontend/index.html" "Página principal"
check_file "frontend/pages/admin.html" "Panel de administración"
check_file "frontend/pages/products.html" "Página de productos"

# Verificar contenido de páginas
echo ""
echo "🔍 Verificando Contenido de Páginas..."
echo "-------------------------------------------"

# Verificar que index.html use design-system.css
check_content "frontend/index.html" "design-system.css" "index.html incluye design-system.css"
check_content "frontend/index.html" "logo.svg" "index.html incluye logo"

# Verificar que admin.html esté corregido
check_content "frontend/pages/admin.html" "Panel de Administración" "admin.html tiene título correcto"
check_content "frontend/pages/admin.html" "admin-stat-card" "admin.html tiene tarjetas de estadísticas"
check_content "frontend/pages/admin.html" "loadStats()" "admin.html tiene JavaScript funcional"

# Verificar que products.html use design-system
check_content "frontend/pages/products.html" "design-system.css" "products.html incluye design-system.css"
check_content "frontend/pages/products.html" "logo.svg" "products.html incluye logo"

# Verificar variables CSS en design-system.css
echo ""
echo "🎨 Verificando Variables CSS..."
echo "-------------------------------------------"
check_content "frontend/public/css/design-system.css" "--primary: #2E7D32" "Color primario definido"
check_content "frontend/public/css/design-system.css" "--admin-primary: #667eea" "Color admin definido"
check_content "frontend/public/css/design-system.css" "--font-heading:" "Fuente heading definida"
check_content "frontend/public/css/design-system.css" "--space-" "Sistema de espaciado definido"
check_content "frontend/public/css/design-system.css" ".btn" "Componente botón definido"
check_content "frontend/public/css/design-system.css" ".card" "Componente card definido"

# Verificar documentación
echo ""
echo "📚 Verificando Documentación..."
echo "-------------------------------------------"
check_file "DESIGN_AUDIT_2025.md" "Documento de auditoría"

# Resumen
echo ""
echo "=============================================="
echo "📊 RESUMEN DE VERIFICACIÓN"
echo "=============================================="
echo -e "${GREEN}✓ Pasados:${NC} $PASSED"
echo -e "${YELLOW}⚠ Advertencias:${NC} $WARNINGS"
echo -e "${RED}✗ Fallidos:${NC} $FAILED"
echo ""

TOTAL=$((PASSED + WARNINGS + FAILED))
PERCENTAGE=$((PASSED * 100 / TOTAL))

echo "Completado: ${PERCENTAGE}%"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 ¡Verificación completada exitosamente!${NC}"
    echo ""
    echo "Próximos pasos sugeridos:"
    echo "1. Abrir http://localhost:5173 en el navegador"
    echo "2. Verificar que el logo se vea correctamente"
    echo "3. Revisar responsive design en móvil"
    echo "4. Aplicar cambios a páginas restantes"
    exit 0
else
    echo -e "${RED}⚠️  Se encontraron problemas${NC}"
    echo ""
    echo "Por favor revisa los archivos marcados con ✗"
    exit 1
fi
