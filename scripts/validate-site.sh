#!/bin/bash

# ========================================
# VALIDACIÓN COMPLETA DEL SITIO - FLORES VICTORIA
# Fecha: Enero 2025
# ========================================

echo "🔍 INICIANDO VALIDACIÓN COMPLETA DEL SITIO FLORES VICTORIA"
echo "==========================================================="
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PASS=0
FAIL=0
WARN=0

# Función para verificar archivos
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $2"
        ((PASS++))
        return 0
    else
        echo -e "${RED}✗${NC} $2 - Archivo no encontrado: $1"
        ((FAIL++))
        return 1
    fi
}

# Función para verificar contenido
check_content() {
    if grep -q "$2" "$1" 2>/dev/null; then
        echo -e "${GREEN}✓${NC} $3"
        ((PASS++))
        return 0
    else
        echo -e "${RED}✗${NC} $3"
        ((FAIL++))
        return 1
    fi
}

echo "📁 1. VERIFICANDO ARCHIVOS PRINCIPALES"
echo "--------------------------------------"

# Sistema de diseño
check_file "frontend/public/css/design-system.css" "Sistema de diseño CSS"
check_file "frontend/public/logo.svg" "Logo corporativo SVG"

# Scripts de utilidad
check_file "frontend/public/js/components-loader.js" "Components Loader"
check_file "frontend/public/js/image-optimizer.js" "Image Optimizer"
check_file "frontend/public/js/accessibility-enhancer.js" "Accessibility Enhancer"

# Componentes
check_file "frontend/components/header.html" "Header component"
check_file "frontend/components/footer.html" "Footer component"

# Documentación
check_file "DESIGN_AUDIT_2025.md" "Auditoría de diseño"
check_file "DESIGN_QUICK_GUIDE.md" "Guía rápida"
check_file "MEJORAS_COMPLETADAS_2025.md" "Resumen de mejoras"

echo ""
echo "🌐 2. VERIFICANDO PÁGINAS HTML"
echo "-------------------------------"

PAGES=(
    "index.html:Página principal"
    "pages/products.html:Productos"
    "pages/about.html:Nosotros"
    "pages/contact.html:Contacto"
    "pages/login.html:Login"
    "pages/register.html:Registro"
    "pages/admin.html:Admin"
    "pages/cart.html:Carrito"
    "pages/checkout.html:Checkout"
    "pages/wishlist.html:Wishlist"
    "pages/profile.html:Perfil"
    "pages/orders.html:Pedidos"
    "pages/order-detail.html:Detalle pedido"
    "pages/admin-products.html:Admin productos"
    "pages/admin-orders.html:Admin pedidos"
    "pages/admin-users.html:Admin usuarios"
    "pages/forgot-password.html:Recuperar contraseña"
    "pages/new-password.html:Nueva contraseña"
    "pages/shipping.html:Envíos"
    "pages/product-detail.html:Detalle producto"
)

for page in "${PAGES[@]}"; do
    IFS=':' read -r file desc <<< "$page"
    check_file "frontend/$file" "$desc"
done

echo ""
echo "🎨 3. VERIFICANDO INTEGRACIÓN DEL SISTEMA DE DISEÑO"
echo "---------------------------------------------------"

for page in "${PAGES[@]}"; do
    IFS=':' read -r file desc <<< "$page"
    if [ -f "frontend/$file" ]; then
        if grep -q "design-system.css" "frontend/$file" 2>/dev/null; then
            echo -e "${GREEN}✓${NC} $desc - design-system.css integrado"
            ((PASS++))
        else
            echo -e "${YELLOW}⚠${NC} $desc - Falta design-system.css"
            ((WARN++))
        fi
    fi
done

echo ""
echo "🖼️  4. VERIFICANDO INTEGRACIÓN DE LOGO"
echo "--------------------------------------"

for page in "${PAGES[@]}"; do
    IFS=':' read -r file desc <<< "$page"
    if [ -f "frontend/$file" ]; then
        if grep -q "logo.svg" "frontend/$file" 2>/dev/null; then
            echo -e "${GREEN}✓${NC} $desc - Logo integrado"
            ((PASS++))
        else
            echo -e "${YELLOW}⚠${NC} $desc - Falta logo"
            ((WARN++))
        fi
    fi
done

echo ""
echo "🔗 5. VERIFICANDO ABSOLUTE PATHS"
echo "---------------------------------"

CRITICAL_PAGES=("index.html" "pages/products.html" "pages/about.html" "pages/contact.html")
for page in "${CRITICAL_PAGES[@]}"; do
    if [ -f "frontend/$page" ]; then
        if grep -q 'href="/index.html"' "frontend/$page" 2>/dev/null || 
           grep -q 'href="/pages/' "frontend/$page" 2>/dev/null; then
            echo -e "${GREEN}✓${NC} $page - Usando absolute paths"
            ((PASS++))
        else
            echo -e "${RED}✗${NC} $page - No usa absolute paths consistentemente"
            ((FAIL++))
        fi
    fi
done

echo ""
echo "♿ 6. VERIFICANDO ACCESIBILIDAD"
echo "-------------------------------"

# Verificar componentes con ARIA
if check_content "frontend/components/header.html" "aria-label" "Header con ARIA labels"; then :; fi
if check_content "frontend/components/header.html" "aria-expanded" "Header con ARIA expanded"; then :; fi
if check_content "frontend/components/footer.html" "role=\"navigation\"" "Footer con roles navigation"; then :; fi

# Verificar páginas críticas
if check_content "frontend/pages/login.html" "aria-" "Login con atributos ARIA"; then :; fi
if check_content "frontend/pages/register.html" "aria-" "Registro con atributos ARIA"; then :; fi

echo ""
echo "📦 7. VERIFICANDO VARIABLES CSS"
echo "--------------------------------"

CSS_VARS=(
    "--primary::Variable primary color"
    "--secondary::Variable secondary color"
    "--font-heading::Variable font heading"
    "--space-:Variables de espaciado"
    "--text-:Variables de texto"
)

for var in "${CSS_VARS[@]}"; do
    IFS=':' read -r variable desc <<< "$var"
    # Usar -- para indicar fin de opciones por si las variables comienzan con '-'
    if grep -q -- "$variable" "frontend/public/css/design-system.css" 2>/dev/null; then
        echo -e "${GREEN}✓${NC} $desc"
        ((PASS++))
    else
        echo -e "${RED}✗${NC} $desc - No encontrada"
        ((FAIL++))
    fi
done

echo ""
echo "🧩 8. VERIFICANDO COMPONENTES CSS"
echo "----------------------------------"

COMPONENTS=(
    ".btn:Botones"
    ".card:Tarjetas"
    ".badge:Badges"
    ".alert:Alertas"
)

for comp in "${COMPONENTS[@]}"; do
    IFS=':' read -r class desc <<< "$comp"
    if grep -q "$class" "frontend/public/css/design-system.css" 2>/dev/null; then
        echo -e "${GREEN}✓${NC} Componente $desc"
        ((PASS++))
    else
        echo -e "${RED}✗${NC} Componente $desc - No encontrado"
        ((FAIL++))
    fi
done

echo ""
echo "🔧 9. VERIFICANDO SCRIPTS JAVASCRIPT"
echo "-------------------------------------"

# Verificar funciones en scripts
if grep -q "loadComponent" "frontend/public/js/components-loader.js" 2>/dev/null; then
    echo -e "${GREEN}✓${NC} components-loader.js tiene función loadComponent"
    ((PASS++))
else
    echo -e "${RED}✗${NC} components-loader.js - Falta función loadComponent"
    ((FAIL++))
fi

if grep -q "setupLazyLoading" "frontend/public/js/image-optimizer.js" 2>/dev/null; then
    echo -e "${GREEN}✓${NC} image-optimizer.js tiene función setupLazyLoading"
    ((PASS++))
else
    echo -e "${RED}✗${NC} image-optimizer.js - Falta función setupLazyLoading"
    ((FAIL++))
fi

if grep -q "addSkipLink" "frontend/public/js/accessibility-enhancer.js" 2>/dev/null; then
    echo -e "${GREEN}✓${NC} accessibility-enhancer.js tiene función addSkipLink"
    ((PASS++))
else
    echo -e "${RED}✗${NC} accessibility-enhancer.js - Falta función addSkipLink"
    ((FAIL++))
fi

echo ""
echo "📊 10. VERIFICANDO ESTRUCTURA DE ARCHIVOS"
echo "-----------------------------------------"

# Directorios importantes
DIRS=(
    "frontend/public/css:CSS directory"
    "frontend/public/js:JS directory"
    "frontend/components:Components directory"
    "frontend/pages:Pages directory"
)

for dir in "${DIRS[@]}"; do
    IFS=':' read -r path desc <<< "$dir"
    if [ -d "$path" ]; then
        echo -e "${GREEN}✓${NC} $desc existe"
        ((PASS++))
    else
        echo -e "${RED}✗${NC} $desc no existe"
        ((FAIL++))
    fi
done

echo ""
echo "🌐 11. VERIFICANDO SERVIDOR"
echo "---------------------------"

if netstat -tuln | grep -q ":5173"; then
    echo -e "${GREEN}✓${NC} Servidor frontend corriendo en puerto 5173"
    ((PASS++))
else
    echo -e "${YELLOW}⚠${NC} Servidor frontend no está corriendo (puerto 5173)"
    ((WARN++))
fi

if netstat -tuln | grep -q ":3000"; then
    echo -e "${GREEN}✓${NC} Backend corriendo en puerto 3000"
    ((PASS++))
else
    echo -e "${YELLOW}⚠${NC} Backend no está corriendo (puerto 3000)"
    ((WARN++))
fi

echo ""
echo "📄 12. VERIFICANDO PÁGINAS ADMIN RECONSTRUIDA"
echo "----------------------------------------------"

if [ -f "frontend/pages/admin.html" ]; then
    if grep -q "stat-card" "frontend/pages/admin.html" 2>/dev/null; then
        echo -e "${GREEN}✓${NC} Admin.html tiene tarjetas de estadísticas"
        ((PASS++))
    else
        echo -e "${RED}✗${NC} Admin.html - Faltan tarjetas de estadísticas"
        ((FAIL++))
    fi
    
    # Aceptar tanto la clase antigua (quick-action) como la nueva (admin-action-btn)
    if grep -q "quick-action" "frontend/pages/admin.html" 2>/dev/null || \
       grep -q "admin-action-btn" "frontend/pages/admin.html" 2>/dev/null; then
        echo -e "${GREEN}✓${NC} Admin.html tiene acciones rápidas"
        ((PASS++))
    else
        echo -e "${RED}✗${NC} Admin.html - Faltan acciones rápidas"
        ((FAIL++))
    fi
    
    # Aceptar tanto el id antiguo (activity-feed) como el nuevo (recent-activity)
    if grep -q "activity-feed" "frontend/pages/admin.html" 2>/dev/null || \
       grep -q "recent-activity" "frontend/pages/admin.html" 2>/dev/null; then
        echo -e "${GREEN}✓${NC} Admin.html tiene feed de actividad"
        ((PASS++))
    else
        echo -e "${RED}✗${NC} Admin.html - Falta feed de actividad"
        ((FAIL++))
    fi
fi

echo ""
echo "🎯 13. VERIFICANDO CONSISTENCIA DE RUTAS"
echo "----------------------------------------"

# Verificar que no hay rutas relativas problemáticas SOLO en páginas de producción
PROBLEM_PATTERNS=("../assets/css/main.css" "../assets/css/theme.css" "href=\"./products.html\"")

has_problem=0
for page in "${PAGES[@]}"; do
    IFS=':' read -r file desc <<< "$page"
    for pattern in "${PROBLEM_PATTERNS[@]}"; do
        if grep -q "$pattern" "frontend/$file" 2>/dev/null; then
            echo -e "${RED}✗${NC} $desc - Ruta problemática encontrada: $pattern"
            ((FAIL++))
            has_problem=1
        fi
    done
done

if [ $has_problem -eq 0 ]; then
    echo -e "${GREEN}✓${NC} No hay rutas problemáticas en páginas de producción"
    ((PASS++))
fi

echo ""
echo "========================================="
echo "📊 RESUMEN DE VALIDACIÓN"
echo "========================================="
echo ""
echo -e "${GREEN}✓ Pasadas:${NC} $PASS"
echo -e "${RED}✗ Fallidas:${NC} $FAIL"
echo -e "${YELLOW}⚠ Advertencias:${NC} $WARN"
echo ""

TOTAL=$((PASS + FAIL))
if [ $TOTAL -gt 0 ]; then
    PERCENTAGE=$((PASS * 100 / TOTAL))
    echo -e "Porcentaje de éxito: ${BLUE}${PERCENTAGE}%${NC}"
else
    echo "No se pudieron realizar verificaciones"
fi

echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}✅ VALIDACIÓN EXITOSA - El sitio está completamente configurado${NC}"
    exit 0
else
    echo -e "${RED}❌ HAY PROBLEMAS QUE REQUIEREN ATENCIÓN${NC}"
    exit 1
fi
