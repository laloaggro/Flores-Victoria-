#!/bin/bash

# Script de prueba para validar el panel de administración
# Verifica que todas las páginas existen y devuelven código 200

echo "🧪 Iniciando pruebas del panel de administración..."
echo "================================================"
echo ""

BASE_URL="http://localhost:3021"
ERRORS=0
SUCCESS=0

# Función para probar una página
test_page() {
    local url="$1"
    local name="$2"
    
    echo -n "Testing $name... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    
    if [ "$response" -eq 200 ]; then
        echo "✅ OK ($response)"
        ((SUCCESS++))
    else
        echo "❌ FAILED ($response)"
        ((ERRORS++))
    fi
}

# Función para probar un endpoint API
test_api() {
    local url="$1"
    local name="$2"
    local method="${3:-GET}"
    
    echo -n "Testing API $name... "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    else
        response=$(curl -s -o /dev/null -w "%{http_code}" -X "$method" -H "Content-Type: application/json" "$url")
    fi
    
    if [ "$response" -eq 200 ] || [ "$response" -eq 201 ]; then
        echo "✅ OK ($response)"
        ((SUCCESS++))
    else
        echo "⚠️  WARNING ($response)"
    fi
}

echo "📄 Probando páginas HTML..."
echo "----------------------------"
test_page "$BASE_URL/admin.html" "Dashboard Principal"
test_page "$BASE_URL/admin-products.html" "Gestión de Productos"
test_page "$BASE_URL/admin-orders.html" "Gestión de Pedidos"
test_page "$BASE_URL/admin-users.html" "Gestión de Usuarios"
test_page "$BASE_URL/control-center.html" "Centro de Control"
test_page "$BASE_URL/monitoring.html" "Monitoreo del Sistema"

echo ""
echo "🔧 Probando componentes JavaScript..."
echo "--------------------------------------"
test_page "$BASE_URL/js/admin-nav.js" "Componente admin-nav.js"
test_page "$BASE_URL/js/theme.js" "Script theme.js"

echo ""
echo "🎨 Probando archivos CSS..."
echo "---------------------------"
test_page "$BASE_URL/css/admin-nav.css" "Estilos admin-nav.css"
test_page "$BASE_URL/css/design-system.css" "Sistema de diseño"
test_page "$BASE_URL/css/base.css" "Estilos base"
test_page "$BASE_URL/css/style.css" "Estilos principales"

echo ""
echo "🔌 Probando endpoints API..."
echo "----------------------------"
test_api "$BASE_URL/health" "Health Check"
test_api "$BASE_URL/api/services/status" "Estado de Servicios"
test_api "$BASE_URL/api/system/health" "System Health"
test_api "$BASE_URL/metrics" "Prometheus Metrics"

echo ""
echo "================================================"
echo "📊 RESUMEN DE PRUEBAS"
echo "================================================"
echo "✅ Exitosas: $SUCCESS"
echo "❌ Fallidas: $ERRORS"
echo ""

if [ $ERRORS -eq 0 ]; then
    echo "🎉 ¡Todas las pruebas pasaron exitosamente!"
    exit 0
else
    echo "⚠️  Algunas pruebas fallaron. Revisa los errores arriba."
    exit 1
fi
