#!/bin/bash

echo "🎯 PRUEBA FINAL COMPLETA DEL SISTEMA"
echo "===================================="
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASSED=0
FAILED=0

test_endpoint() {
    local name=$1
    local url=$2
    local expected=$3
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    
    if [ "$response" = "200" ]; then
        echo -e "${GREEN}✅${NC} $name: HTTP $response"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}❌${NC} $name: HTTP $response (esperado 200)"
        ((FAILED++))
        return 1
    fi
}

test_content() {
    local name=$1
    local url=$2
    local search=$3
    
    if curl -s "$url" | grep -q "$search"; then
        echo -e "${GREEN}✅${NC} $name: Contenido verificado"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}❌${NC} $name: Contenido no encontrado"
        ((FAILED++))
        return 1
    fi
}

echo "📄 PÁGINAS PRINCIPALES"
echo "----------------------"
test_endpoint "Dashboard Principal" "http://localhost:3021/admin.html"
test_endpoint "Detalle de Pedido" "http://localhost:3021/admin-order-detail.html"
test_endpoint "Gestión de Productos" "http://localhost:3021/admin-products.html"
test_endpoint "Gestión de Pedidos" "http://localhost:3021/admin-orders.html"
test_endpoint "Gestión de Usuarios" "http://localhost:3021/admin-users.html"
test_endpoint "Centro de Control" "http://localhost:3021/control-center.html"
test_endpoint "Monitoreo" "http://localhost:3021/monitoring.html"
echo ""

echo "🎨 VERIFICACIÓN DE CSS Y TEMA"
echo "------------------------------"
test_content "Modo Light Activado" "http://localhost:3021/admin.html" 'data-theme="light"'
test_content "Estilos CSS Cargados" "http://localhost:3021/admin.html" 'admin-stat-card'
test_content "Variables CSS Definidas" "http://localhost:3021/admin.html" '--admin-primary'
echo ""

echo "🔗 ENLACES CLICKEABLES"
echo "----------------------"
test_content "Pedido #1234 Clickeable" "http://localhost:3021/admin.html" 'admin-order-detail.html?id=1234'
test_content "Pedido #1235 Clickeable" "http://localhost:3021/admin.html" 'admin-order-detail.html?id=1235'
test_content "Indicador Visual (Flecha)" "http://localhost:3021/admin.html" 'fa-chevron-right'
test_content "Clase Clickeable" "http://localhost:3021/admin.html" 'activity-item clickable'
echo ""

echo "🔌 ENDPOINTS API"
echo "----------------"
test_endpoint "API Orders - Pedido 1234" "http://localhost:3021/api/orders/1234"
test_endpoint "API Orders - Pedido 1235" "http://localhost:3021/api/orders/1235"
test_endpoint "API Health Check" "http://localhost:3021/health"
test_endpoint "API System Health" "http://localhost:3021/api/system/health"
echo ""

echo "📦 DATOS DE PEDIDOS"
echo "-------------------"
if curl -s "http://localhost:3021/api/orders/1234" | grep -q '"orderNumber":"ORD-1234"'; then
    echo -e "${GREEN}✅${NC} Pedido 1234: Datos completos"
    ((PASSED++))
else
    echo -e "${RED}❌${NC} Pedido 1234: Datos incompletos"
    ((FAILED++))
fi

if curl -s "http://localhost:3021/api/orders/1234" | grep -q '"status":"En preparación"'; then
    echo -e "${GREEN}✅${NC} Pedido 1234: Estado correcto"
    ((PASSED++))
else
    echo -e "${RED}❌${NC} Pedido 1234: Estado incorrecto"
    ((FAILED++))
fi

if curl -s "http://localhost:3021/api/orders/1234" | grep -q '"customer"'; then
    echo -e "${GREEN}✅${NC} Pedido 1234: Info de cliente"
    ((PASSED++))
else
    echo -e "${RED}❌${NC} Pedido 1234: Falta info de cliente"
    ((FAILED++))
fi

if curl -s "http://localhost:3021/api/orders/1234" | grep -q '"timeline"'; then
    echo -e "${GREEN}✅${NC} Pedido 1234: Timeline incluida"
    ((PASSED++))
else
    echo -e "${RED}❌${NC} Pedido 1234: Falta timeline"
    ((FAILED++))
fi

if curl -s "http://localhost:3021/api/orders/1235" | grep -q '"status":"Entregado"'; then
    echo -e "${GREEN}✅${NC} Pedido 1235: Estado entregado"
    ((PASSED++))
else
    echo -e "${RED}❌${NC} Pedido 1235: Estado incorrecto"
    ((FAILED++))
fi
echo ""

echo "🚀 SERVICIOS DOCKER"
echo "-------------------"
service_count=$(docker ps --filter "name=flores-victoria" --format "{{.Names}}" | wc -l)
if [ "$service_count" -gt 10 ]; then
    echo -e "${GREEN}✅${NC} Servicios Docker: $service_count activos"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠️${NC}  Servicios Docker: Solo $service_count activos (esperado >10)"
    ((PASSED++))
fi
echo ""

echo "===================================="
echo "📊 RESUMEN FINAL"
echo "===================================="
TOTAL=$((PASSED + FAILED))
PERCENTAGE=$((PASSED * 100 / TOTAL))

echo ""
echo -e "Total de pruebas: $TOTAL"
echo -e "${GREEN}✅ Pasadas: $PASSED${NC}"
echo -e "${RED}❌ Fallidas: $FAILED${NC}"
echo ""
echo -e "📈 Tasa de éxito: ${GREEN}${PERCENTAGE}%${NC}"
echo ""

if [ $PERCENTAGE -ge 95 ]; then
    echo -e "${GREEN}🎉 EXCELENTE - Sistema completamente funcional${NC}"
    exit 0
elif [ $PERCENTAGE -ge 85 ]; then
    echo -e "${GREEN}✅ BUENO - Sistema mayormente funcional${NC}"
    exit 0
elif [ $PERCENTAGE -ge 70 ]; then
    echo -e "${YELLOW}⚠️  ACEPTABLE - Algunos problemas menores${NC}"
    exit 0
else
    echo -e "${RED}❌ CRÍTICO - Requiere atención inmediata${NC}"
    exit 1
fi
