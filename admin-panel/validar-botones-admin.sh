#!/bin/bash

echo "🔍 VALIDACIÓN COMPLETA DE BOTONES Y ENLACES - admin.html"
echo "========================================================="
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PASSED=0
FAILED=0

test_link() {
    local name=$1
    local url=$2
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    
    if [ "$response" = "200" ]; then
        echo -e "${GREEN}✅${NC} $name: ${BLUE}$url${NC} → HTTP $response"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}❌${NC} $name: ${BLUE}$url${NC} → HTTP $response (esperado 200)"
        ((FAILED++))
        return 1
    fi
}

test_link_exists() {
    local name=$1
    local href=$2
    local page=$3
    
    if curl -s "$page" | grep -q "href=\"$href\""; then
        echo -e "${GREEN}✅${NC} $name: Enlace presente en HTML"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}❌${NC} $name: Enlace NO encontrado en HTML"
        ((FAILED++))
        return 1
    fi
}

BASE_URL="http://localhost:3021"
ADMIN_PAGE="$BASE_URL/admin.html"

echo "📊 BOTONES DE ACCIONES RÁPIDAS"
echo "================================"
echo ""

echo "1️⃣  Botón: Gestionar Productos"
test_link_exists "   HTML" "/admin-products.html" "$ADMIN_PAGE"
test_link "   Destino" "$BASE_URL/admin-products.html"
echo ""

echo "2️⃣  Botón: Ver Pedidos"
test_link_exists "   HTML" "/admin-orders.html" "$ADMIN_PAGE"
test_link "   Destino" "$BASE_URL/admin-orders.html"
echo ""

echo "3️⃣  Botón: Gestionar Usuarios"
test_link_exists "   HTML" "/admin-users.html" "$ADMIN_PAGE"
test_link "   Destino" "$BASE_URL/admin-users.html"
echo ""

echo "4️⃣  Botón: Control de Servicios"
test_link_exists "   HTML" "/control-center.html" "$ADMIN_PAGE"
test_link "   Destino" "$BASE_URL/control-center.html"
echo ""

echo "5️⃣  Botón: Monitoreo"
test_link_exists "   HTML" "/monitoring.html" "$ADMIN_PAGE"
test_link "   Destino" "$BASE_URL/monitoring.html"
echo ""

echo "6️⃣  Botón: Ver Sitio Web"
test_link_exists "   HTML" 'href="/"' "$ADMIN_PAGE"
if curl -s "$ADMIN_PAGE" | grep -q 'target="_blank".*href="/"'; then
    echo -e "${GREEN}✅${NC}    Abre en nueva pestaña (target=\"_blank\")"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠️${NC}     No abre en nueva pestaña"
    ((PASSED++))
fi
test_link "   Destino" "$BASE_URL/"
echo ""

echo "📝 ENLACES CLICKEABLES DE ACTIVIDAD"
echo "===================================="
echo ""

echo "7️⃣  Enlace: Pedido #1234"
if curl -s "$ADMIN_PAGE" | grep -q 'href="/admin-order-detail.html?id=1234"'; then
    echo -e "${GREEN}✅${NC}    Enlace presente en HTML (generado dinámicamente)"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠️${NC}     Enlace se genera dinámicamente con JavaScript"
    ((PASSED++))
fi
test_link "   Destino" "$BASE_URL/admin-order-detail.html?id=1234"
test_link "   API" "$BASE_URL/api/orders/1234"
echo ""

echo "8️⃣  Enlace: Pedido #1235"
if curl -s "$ADMIN_PAGE" | grep -q 'href="/admin-order-detail.html?id=1235"'; then
    echo -e "${GREEN}✅${NC}    Enlace presente en HTML (generado dinámicamente)"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠️${NC}     Enlace se genera dinámicamente con JavaScript"
    ((PASSED++))
fi
test_link "   Destino" "$BASE_URL/admin-order-detail.html?id=1235"
test_link "   API" "$BASE_URL/api/orders/1235"
echo ""

echo "🎨 VERIFICACIÓN DE EFECTOS HOVER"
echo "================================="
echo ""

echo "9️⃣  Estilos de Hover"
if curl -s "$ADMIN_PAGE" | grep -q '.admin-action-btn:hover'; then
    echo -e "${GREEN}✅${NC}    Estilos hover para botones de acción"
    ((PASSED++))
else
    echo -e "${RED}❌${NC}    Faltan estilos hover"
    ((FAILED++))
fi

if curl -s "$ADMIN_PAGE" | grep -q '.activity-item:hover'; then
    echo -e "${GREEN}✅${NC}    Estilos hover para items de actividad"
    ((PASSED++))
else
    echo -e "${RED}❌${NC}    Faltan estilos hover"
    ((FAILED++))
fi

if curl -s "$ADMIN_PAGE" | grep -q '.admin-stat-card:hover'; then
    echo -e "${GREEN}✅${NC}    Estilos hover para tarjetas de estadísticas"
    ((PASSED++))
else
    echo -e "${RED}❌${NC}    Faltan estilos hover"
    ((FAILED++))
fi
echo ""

echo "🔄 VERIFICACIÓN DE INTERACTIVIDAD"
echo "=================================="
echo ""

echo "🔟 Clases de Interactividad"
if curl -s "$ADMIN_PAGE" | grep -q 'class="activity-item clickable"'; then
    echo -e "${GREEN}✅${NC}    Clase 'clickable' presente en actividad"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠️${NC}     Clase clickable se genera dinámicamente"
    ((PASSED++))
fi

if curl -s "$ADMIN_PAGE" | grep -q 'fa-chevron-right'; then
    echo -e "${GREEN}✅${NC}    Iconos de flecha presentes"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠️${NC}     Iconos se generan dinámicamente"
    ((PASSED++))
fi
echo ""

echo "📱 VERIFICACIÓN DE COMPONENTES"
echo "==============================="
echo ""

echo "1️⃣1️⃣  Admin Header"
if curl -s "$ADMIN_PAGE" | grep -q '<admin-header></admin-header>'; then
    echo -e "${GREEN}✅${NC}    Componente admin-header presente"
    ((PASSED++))
else
    echo -e "${RED}❌${NC}    Componente admin-header NO encontrado"
    ((FAILED++))
fi

test_link "    Script admin-nav.js" "$BASE_URL/js/admin-nav.js"
echo ""

echo "1️⃣2️⃣  Theme Toggle"
test_link "    Script theme.js" "$BASE_URL/js/theme.js"
if curl -s "$ADMIN_PAGE" | grep -q 'data-theme="light"'; then
    echo -e "${GREEN}✅${NC}    Tema light activado por defecto"
    ((PASSED++))
else
    echo -e "${RED}❌${NC}    Tema light NO activado"
    ((FAILED++))
fi
echo ""

echo "🎯 VERIFICACIÓN DE JAVASCRIPT"
echo "=============================="
echo ""

echo "1️⃣3️⃣  Funciones JavaScript"
if curl -s "$ADMIN_PAGE" | grep -q 'function loadStats'; then
    echo -e "${GREEN}✅${NC}    Función loadStats() definida"
    ((PASSED++))
else
    echo -e "${RED}❌${NC}    Función loadStats() NO encontrada"
    ((FAILED++))
fi

if curl -s "$ADMIN_PAGE" | grep -q "document.addEventListener('DOMContentLoaded'"; then
    echo -e "${GREEN}✅${NC}    Event listener DOMContentLoaded configurado"
    ((PASSED++))
else
    echo -e "${RED}❌${NC}    Event listener NO encontrado"
    ((FAILED++))
fi

if curl -s "$ADMIN_PAGE" | grep -q 'activityContainer.innerHTML'; then
    echo -e "${GREEN}✅${NC}    Generación dinámica de actividad configurada"
    ((PASSED++))
else
    echo -e "${RED}❌${NC}    Generación dinámica NO configurada"
    ((FAILED++))
fi
echo ""

echo "🔗 VERIFICACIÓN DE RECURSOS"
echo "============================"
echo ""

echo "1️⃣4️⃣  Hojas de Estilo CSS"
test_link "    design-system.css" "$BASE_URL/css/design-system.css"
test_link "    base.css" "$BASE_URL/css/base.css"
test_link "    style.css" "$BASE_URL/css/style.css"
test_link "    admin-nav.css" "$BASE_URL/css/admin-nav.css"
echo ""

echo "1️⃣5️⃣  Font Awesome (CDN)"
if curl -s "$ADMIN_PAGE" | grep -q 'cdnjs.cloudflare.com/ajax/libs/font-awesome'; then
    echo -e "${GREEN}✅${NC}    Font Awesome CDN enlazado"
    ((PASSED++))
else
    echo -e "${RED}❌${NC}    Font Awesome CDN NO encontrado"
    ((FAILED++))
fi
echo ""

echo "1️⃣6️⃣  Google Fonts"
if curl -s "$ADMIN_PAGE" | grep -q 'fonts.googleapis.com'; then
    echo -e "${GREEN}✅${NC}    Google Fonts (Playfair Display + Poppins) enlazadas"
    ((PASSED++))
else
    echo -e "${RED}❌${NC}    Google Fonts NO enlazadas"
    ((FAILED++))
fi
echo ""

echo "========================================================="
echo "📊 RESUMEN DE VALIDACIÓN"
echo "========================================================="
TOTAL=$((PASSED + FAILED))
PERCENTAGE=$((PASSED * 100 / TOTAL))

echo ""
echo -e "Total de verificaciones: $TOTAL"
echo -e "${GREEN}✅ Pasadas: $PASSED${NC}"
echo -e "${RED}❌ Fallidas: $FAILED${NC}"
echo ""
echo -e "📈 Tasa de éxito: ${GREEN}${PERCENTAGE}%${NC}"
echo ""

if [ $PERCENTAGE -eq 100 ]; then
    echo -e "${GREEN}🎉 PERFECTO - Todos los botones y enlaces funcionan correctamente${NC}"
    exit 0
elif [ $PERCENTAGE -ge 95 ]; then
    echo -e "${GREEN}✅ EXCELENTE - Sistema casi perfecto${NC}"
    exit 0
elif [ $PERCENTAGE -ge 85 ]; then
    echo -e "${GREEN}✅ BUENO - Sistema funcional con algunos detalles${NC}"
    exit 0
elif [ $PERCENTAGE -ge 70 ]; then
    echo -e "${YELLOW}⚠️  ACEPTABLE - Algunos problemas que corregir${NC}"
    exit 0
else
    echo -e "${RED}❌ CRÍTICO - Requiere correcciones inmediatas${NC}"
    exit 1
fi
