#!/bin/bash

echo "🔍 VALIDACIÓN COMPLETA DE BOTONES Y ENLACES - Página Principal"
echo "================================================================"
echo "URL: http://localhost:3021/"
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PASSED=0
FAILED=0
WARNING=0

test_link() {
    local name=$1
    local url=$2
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)
    
    if [ "$response" = "200" ]; then
        echo -e "${GREEN}✅${NC} $name"
        echo -e "   ${BLUE}$url${NC} → HTTP $response"
        ((PASSED++))
        return 0
    elif [ "$response" = "404" ]; then
        echo -e "${RED}❌${NC} $name"
        echo -e "   ${BLUE}$url${NC} → HTTP $response (NO ENCONTRADO)"
        ((FAILED++))
        return 1
    elif [ "$response" = "000" ]; then
        echo -e "${YELLOW}⚠️${NC}  $name"
        echo -e "   ${BLUE}$url${NC} → NO ACCESIBLE (conexión fallida)"
        ((WARNING++))
        return 2
    else
        echo -e "${YELLOW}⚠️${NC}  $name"
        echo -e "   ${BLUE}$url${NC} → HTTP $response"
        ((WARNING++))
        return 2
    fi
}

test_link_exists() {
    local name=$1
    local pattern=$2
    local page=$3
    
    if curl -s "$page" 2>/dev/null | grep -q "$pattern"; then
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
MAIN_PAGE="$BASE_URL/"

echo "📄 VERIFICANDO PÁGINA PRINCIPAL"
echo "================================"
response=$(curl -s -o /dev/null -w "%{http_code}" "$MAIN_PAGE")
if [ "$response" = "200" ]; then
    echo -e "${GREEN}✅${NC} Página principal accesible: HTTP $response"
    ((PASSED++))
else
    echo -e "${RED}❌${NC} Página principal NO accesible: HTTP $response"
    ((FAILED++))
    exit 1
fi
echo ""

# Extraer todos los enlaces de la página
echo "🔗 EXTRAYENDO ENLACES DE LA PÁGINA"
echo "==================================="
LINKS=$(curl -s "$MAIN_PAGE" | grep -oP 'href="[^"]*"' | sed 's/href="//;s/"//' | sort -u)
echo "Total de enlaces únicos encontrados: $(echo "$LINKS" | wc -l)"
echo ""

echo "📊 VALIDANDO ENLACES INTERNOS"
echo "=============================="

# Enlaces del dashboard
test_link "Dashboard Analytics" "$BASE_URL/dashboard-analytics.html"
test_link "Dashboard Visual" "$BASE_URL/dashboard-visual.html"
echo ""

# Enlaces de gestión
echo "🛠️  ENLACES DE GESTIÓN"
echo "======================"
test_link "Productos" "$BASE_URL/products/"
test_link "Pedidos (Orders)" "$BASE_URL/orders/"
test_link "Usuarios" "$BASE_URL/users/"
test_link "Promociones" "$BASE_URL/promotions.html"
test_link "Reportes" "$BASE_URL/reports/"
echo ""

# Enlaces del sistema
echo "⚙️  ENLACES DEL SISTEMA"
echo "======================="
test_link "Servicios" "$BASE_URL/services/"
test_link "Monitoreo" "$BASE_URL/monitoring.html"
test_link "Logs" "$BASE_URL/logs.html"
test_link "Configuración" "$BASE_URL/settings/"
echo ""

# Enlaces del admin panel
echo "👤 ENLACES DEL ADMIN PANEL"
echo "=========================="
test_link "Admin Dashboard" "$BASE_URL/admin.html"
test_link "Admin Products" "$BASE_URL/admin-products.html"
test_link "Admin Orders" "$BASE_URL/admin-orders.html"
test_link "Admin Users" "$BASE_URL/admin-users.html"
test_link "Control Center" "$BASE_URL/control-center.html"
echo ""

# Enlaces externos
echo "🌐 ENLACES EXTERNOS"
echo "==================="
echo -e "${BLUE}ℹ️${NC}  pgAdmin (puerto 5050)"
echo "   http://localhost:5050/ (herramienta externa)"
((PASSED++))
echo ""

# Verificar componentes JavaScript
echo "🎯 COMPONENTES JAVASCRIPT"
echo "========================="
if curl -s "$MAIN_PAGE" | grep -q "DashboardWidgets"; then
    echo -e "${GREEN}✅${NC} DashboardWidgets: Componente presente"
    ((PASSED++))
else
    echo -e "${RED}❌${NC} DashboardWidgets: Componente NO encontrado"
    ((FAILED++))
fi

if curl -s "$MAIN_PAGE" | grep -q "auth.logout"; then
    echo -e "${GREEN}✅${NC} Sistema de autenticación: Presente"
    ((PASSED++))
else
    echo -e "${RED}❌${NC} Sistema de autenticación: NO encontrado"
    ((FAILED++))
fi

if curl -s "$MAIN_PAGE" | grep -q "toggleEditMode"; then
    echo -e "${GREEN}✅${NC} Modo de edición: Presente"
    ((PASSED++))
else
    echo -e "${RED}❌${NC} Modo de edición: NO encontrado"
    ((FAILED++))
fi

if curl -s "$MAIN_PAGE" | grep -q "resetLayout"; then
    echo -e "${GREEN}✅${NC} Reset de layout: Presente"
    ((PASSED++))
else
    echo -e "${RED}❌${NC} Reset de layout: NO encontrado"
    ((FAILED++))
fi
echo ""

# Verificar botones específicos
echo "🔘 BOTONES ESPECÍFICOS"
echo "======================"
if curl -s "$MAIN_PAGE" | grep -q 'id="editModeBtn"'; then
    echo -e "${GREEN}✅${NC} Botón 'Modo Edición': Presente"
    ((PASSED++))
else
    echo -e "${RED}❌${NC} Botón 'Modo Edición': NO encontrado"
    ((FAILED++))
fi

if curl -s "$MAIN_PAGE" | grep -q 'id="userMenuBtn"'; then
    echo -e "${GREEN}✅${NC} Botón 'Menú Usuario': Presente"
    ((PASSED++))
else
    echo -e "${RED}❌${NC} Botón 'Menú Usuario': NO encontrado"
    ((FAILED++))
fi

if curl -s "$MAIN_PAGE" | grep -q 'data-requires-role="admin"'; then
    echo -e "${GREEN}✅${NC} Controles con permisos de admin: Presentes"
    ((PASSED++))
else
    echo -e "${RED}❌${NC} Controles con permisos: NO encontrados"
    ((FAILED++))
fi
echo ""

# API Endpoints relacionados
echo "🔌 ENDPOINTS API"
echo "================"
test_link "Health Check" "$BASE_URL/health"
test_link "API System Health" "$BASE_URL/api/system/health"
test_link "Metrics (Prometheus)" "$BASE_URL/metrics"
echo ""

# Verificar recursos CSS/JS
echo "📦 RECURSOS ESTÁTICOS"
echo "====================="
test_link "Design System CSS" "$BASE_URL/css/design-system.css"
test_link "Base CSS" "$BASE_URL/css/base.css"
test_link "Style CSS" "$BASE_URL/css/style.css"
test_link "Admin Nav JS" "$BASE_URL/js/admin-nav.js"
test_link "Theme JS" "$BASE_URL/js/theme.js"
echo ""

echo "================================================================"
echo "📊 RESUMEN DE VALIDACIÓN"
echo "================================================================"
TOTAL=$((PASSED + FAILED + WARNING))
if [ $TOTAL -eq 0 ]; then
    TOTAL=1
fi
PERCENTAGE=$((PASSED * 100 / TOTAL))

echo ""
echo -e "Total de verificaciones: $TOTAL"
echo -e "${GREEN}✅ Pasadas: $PASSED${NC}"
echo -e "${RED}❌ Fallidas: $FAILED${NC}"
echo -e "${YELLOW}⚠️  Advertencias: $WARNING${NC}"
echo ""
echo -e "📈 Tasa de éxito: ${GREEN}${PERCENTAGE}%${NC}"
echo ""

if [ $PERCENTAGE -eq 100 ]; then
    echo -e "${GREEN}🎉 PERFECTO - Todos los enlaces y botones funcionan${NC}"
    exit 0
elif [ $PERCENTAGE -ge 90 ]; then
    echo -e "${GREEN}✅ EXCELENTE - Sistema casi perfecto${NC}"
    exit 0
elif [ $PERCENTAGE -ge 75 ]; then
    echo -e "${GREEN}✅ BUENO - Sistema mayormente funcional${NC}"
    exit 0
elif [ $PERCENTAGE -ge 60 ]; then
    echo -e "${YELLOW}⚠️  ACEPTABLE - Algunos enlaces requieren atención${NC}"
    exit 0
else
    echo -e "${RED}❌ CRÍTICO - Muchos enlaces no funcionan${NC}"
    exit 1
fi
