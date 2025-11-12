#!/bin/bash

# Script de prueba exhaustiva del panel de administración
# Prueba navegación, funcionalidad y enlaces

echo "🔍 PRUEBA EXHAUSTIVA DEL PANEL DE ADMINISTRACIÓN"
echo "=================================================="
echo ""

BASE_URL="http://localhost:3021"
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Función para probar con detalle
test_detailed() {
    local url="$1"
    local name="$2"
    local check_content="$3"
    
    ((TOTAL_TESTS++))
    echo -n "[$TOTAL_TESTS] Testing $name... "
    
    response=$(curl -s "$url")
    http_code=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    
    if [ "$http_code" -eq 200 ]; then
        if [ -n "$check_content" ]; then
            if echo "$response" | grep -q "$check_content"; then
                echo "✅ OK (200) - Contenido verificado"
                ((PASSED_TESTS++))
            else
                echo "⚠️  OK (200) - Contenido no encontrado: '$check_content'"
                ((FAILED_TESTS++))
            fi
        else
            echo "✅ OK (200)"
            ((PASSED_TESTS++))
        fi
    else
        echo "❌ FAILED ($http_code)"
        ((FAILED_TESTS++))
    fi
}

echo "🧪 FASE 1: PRUEBAS DE PÁGINAS HTML"
echo "-----------------------------------"
test_detailed "$BASE_URL/admin.html" "Dashboard Principal" "admin-header"
test_detailed "$BASE_URL/admin-products.html" "Gestión de Productos" "admin-header"
test_detailed "$BASE_URL/admin-orders.html" "Gestión de Pedidos" "admin-header"
test_detailed "$BASE_URL/admin-users.html" "Gestión de Usuarios" "admin-header"
test_detailed "$BASE_URL/control-center.html" "Centro de Control" "admin-header"
test_detailed "$BASE_URL/monitoring.html" "Monitoreo del Sistema" "admin-header"

echo ""
echo "🔧 FASE 2: PRUEBAS DE COMPONENTES"
echo "----------------------------------"
test_detailed "$BASE_URL/js/admin-nav.js" "Componente admin-nav.js" "AdminHeader"
test_detailed "$BASE_URL/js/theme.js" "Script theme.js" "theme"
test_detailed "$BASE_URL/css/admin-nav.css" "Estilos admin-nav.css" "admin-header"

echo ""
echo "🎨 FASE 3: PRUEBAS DE SISTEMA DE DISEÑO"
echo "----------------------------------------"
test_detailed "$BASE_URL/css/design-system.css" "Sistema de diseño" "primary"
test_detailed "$BASE_URL/css/base.css" "Estilos base" "body"
test_detailed "$BASE_URL/css/style.css" "Estilos principales" "font"

echo ""
echo "🔌 FASE 4: PRUEBAS DE ENDPOINTS API"
echo "------------------------------------"

# Health checks
((TOTAL_TESTS++))
echo -n "[$TOTAL_TESTS] Testing API Health Check... "
response=$(curl -s "$BASE_URL/health")
if echo "$response" | grep -q '"status":"OK"'; then
    echo "✅ OK - Sistema saludable"
    ((PASSED_TESTS++))
else
    echo "❌ FAILED - Sistema no responde correctamente"
    ((FAILED_TESTS++))
fi

# Services status
((TOTAL_TESTS++))
echo -n "[$TOTAL_TESTS] Testing API Services Status... "
response=$(curl -s "$BASE_URL/api/services/status")
if echo "$response" | grep -q '"status":"success"'; then
    echo "✅ OK - Estado de servicios disponible"
    ((PASSED_TESTS++))
else
    echo "⚠️  WARNING - Respuesta inesperada"
    ((FAILED_TESTS++))
fi

# System health
((TOTAL_TESTS++))
echo -n "[$TOTAL_TESTS] Testing API System Health... "
response=$(curl -s "$BASE_URL/api/system/health")
if [ -n "$response" ]; then
    echo "✅ OK - System health respondiendo"
    ((PASSED_TESTS++))
else
    echo "❌ FAILED - Sin respuesta"
    ((FAILED_TESTS++))
fi

# Metrics
((TOTAL_TESTS++))
echo -n "[$TOTAL_TESTS] Testing Prometheus Metrics... "
response=$(curl -s "$BASE_URL/metrics")
if echo "$response" | grep -q "admin_panel"; then
    echo "✅ OK - Métricas disponibles"
    ((PASSED_TESTS++))
else
    echo "❌ FAILED - Métricas no encontradas"
    ((FAILED_TESTS++))
fi

echo ""
echo "🚀 FASE 5: PRUEBAS DE SERVICIOS DOCKER"
echo "---------------------------------------"

# Verificar servicios Docker
((TOTAL_TESTS++))
echo -n "[$TOTAL_TESTS] Verificando servicios Docker activos... "
docker_services=$(docker ps --format "{{.Names}}" | grep "flores-victoria" | wc -l)
if [ "$docker_services" -gt 10 ]; then
    echo "✅ OK - $docker_services servicios activos"
    ((PASSED_TESTS++))
else
    echo "⚠️  WARNING - Solo $docker_services servicios activos"
    ((FAILED_TESTS++))
fi

echo ""
echo "🔗 FASE 6: PRUEBAS DE INTEGRACIÓN KIBANA"
echo "-----------------------------------------"

# Kibana
((TOTAL_TESTS++))
echo -n "[$TOTAL_TESTS] Testing Kibana accessibility... "
kibana_response=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:5601/api/status")
if [ "$kibana_response" -eq 200 ]; then
    echo "✅ OK - Kibana accesible"
    ((PASSED_TESTS++))
else
    echo "⚠️  WARNING - Kibana no responde (código: $kibana_response)"
    ((FAILED_TESTS++))
fi

# Elasticsearch
((TOTAL_TESTS++))
echo -n "[$TOTAL_TESTS] Testing Elasticsearch... "
es_response=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:9200/_cluster/health")
if [ "$es_response" -eq 200 ]; then
    echo "✅ OK - Elasticsearch accesible"
    ((PASSED_TESTS++))
else
    echo "⚠️  WARNING - Elasticsearch no responde (código: $es_response)"
    ((FAILED_TESTS++))
fi

echo ""
echo "=================================================="
echo "📊 RESUMEN DE PRUEBAS EXHAUSTIVAS"
echo "=================================================="
echo "Total de pruebas: $TOTAL_TESTS"
echo "✅ Pasadas: $PASSED_TESTS"
echo "❌ Fallidas: $FAILED_TESTS"
echo ""

# Calcular porcentaje
if [ $TOTAL_TESTS -gt 0 ]; then
    percentage=$((PASSED_TESTS * 100 / TOTAL_TESTS))
    echo "📈 Tasa de éxito: $percentage%"
    echo ""
    
    if [ $percentage -ge 90 ]; then
        echo "🎉 ¡EXCELENTE! Sistema funcionando óptimamente"
        exit 0
    elif [ $percentage -ge 70 ]; then
        echo "✅ BUENO - Sistema mayormente funcional"
        exit 0
    else
        echo "⚠️  ATENCIÓN - Revisar servicios con problemas"
        exit 1
    fi
fi
