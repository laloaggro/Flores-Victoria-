#!/bin/bash

# 🌸 FLORES VICTORIA v3.0 - VERIFICACIÓN FINAL DE SERVICIOS
# Script de verificación de todos los servicios principales

echo "🌸 VERIFICACIÓN FINAL DE SERVICIOS - FLORES VICTORIA v3.0"
echo "=========================================================="
echo ""

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para verificar servicio
check_service() {
    local name=$1
    local url=$2
    local expected=$3
    
    echo -n "🔍 Verificando $name... "
    
    response=$(curl -s --connect-timeout 5 "$url" 2>/dev/null)
    
    if [ $? -eq 0 ] && [[ "$response" == *"$expected"* ]]; then
        echo -e "${GREEN}✅ FUNCIONANDO${NC}"
        return 0
    else
        echo -e "${RED}❌ NO RESPONDE${NC}"
        return 1
    fi
}

# Función para crear nuevo pedido (test)
test_order_creation() {
    echo -n "🛒 Probando creación de pedido... "
    
    response=$(curl -s -X POST http://localhost:3004/api/orders \
        -H "Content-Type: application/json" \
        -d '{
            "userId": 999,
            "customerName": "Test User",
            "customerEmail": "test@flores-victoria.com",
            "items": [
                {"productId": 1, "productName": "Test Product", "quantity": 1, "price": 25000}
            ],
            "shippingAddress": "Test Address",
            "paymentMethod": "Test Payment"
        }' 2>/dev/null)
    
    if [[ "$response" == *"success"* ]]; then
        echo -e "${GREEN}✅ CREACIÓN OK${NC}"
        return 0
    else
        echo -e "${RED}❌ ERROR EN CREACIÓN${NC}"
        return 1
    fi
}

# Función para probar recomendaciones AI
test_ai_recommendations() {
    echo -n "🤖 Probando recomendaciones AI... "
    
    response=$(curl -s http://localhost:3002/ai/recommendations 2>/dev/null)
    
    if [[ "$response" == *"recommendations"* ]]; then
        echo -e "${GREEN}✅ RECOMENDACIONES OK${NC}"
        return 0
    else
        echo -e "${RED}❌ ERROR EN RECOMENDACIONES${NC}"
        return 1
    fi
}

echo -e "${BLUE}=== SERVICIOS PRINCIPALES ===${NC}"

# Verificar servicios principales
services_ok=0

# Admin Panel
if check_service "Admin Panel" "http://localhost:3021/health" "status"; then
    services_ok=$((services_ok + 1))
fi

# AI Service
if check_service "AI Service" "http://localhost:3002/health" "AI Service"; then
    services_ok=$((services_ok + 1))
fi

# Order Service
if check_service "Order Service" "http://localhost:3004/health" "Order Service"; then
    services_ok=$((services_ok + 1))
fi

echo ""
echo -e "${BLUE}=== PRUEBAS FUNCIONALES ===${NC}"

# Pruebas funcionales
tests_ok=0

# Test de creación de pedidos
if test_order_creation; then
    tests_ok=$((tests_ok + 1))
fi

# Test de recomendaciones AI
if test_ai_recommendations; then
    tests_ok=$((tests_ok + 1))
fi

# Verificar documentación
echo -n "📚 Verificando documentación... "
doc_response=$(curl -s http://localhost:3021/documentation.html 2>/dev/null)
if [[ "$doc_response" == *"Flores Victoria"* ]]; then
    echo -e "${GREEN}✅ DOCUMENTACIÓN OK${NC}"
    tests_ok=$((tests_ok + 1))
else
    echo -e "${RED}❌ DOCUMENTACIÓN NO ACCESIBLE${NC}"
fi

echo ""
echo -e "${BLUE}=== RESUMEN FINAL ===${NC}"
echo "🔧 Servicios activos: $services_ok/3"
echo "🧪 Pruebas exitosas: $tests_ok/3"

if [ $services_ok -eq 3 ] && [ $tests_ok -eq 3 ]; then
    echo ""
    echo -e "${GREEN}🎉 ¡TODOS LOS SERVICIOS PRINCIPALES ESTÁN FUNCIONANDO!${NC}"
    echo -e "${GREEN}✅ Sistema Flores Victoria v3.0 COMPLETAMENTE OPERATIVO${NC}"
    echo ""
    echo -e "${YELLOW}📍 URLs de acceso:${NC}"
    echo "  🌐 Admin Panel: http://localhost:3021"
    echo "  📚 Documentación: http://localhost:3021/documentation.html"
    echo "  🤖 AI Service: http://localhost:3002/ai/recommendations"
    echo "  🛒 Order Service: http://localhost:3004/api/orders"
    echo ""
else
    echo ""
    echo -e "${YELLOW}⚠️  Algunos servicios necesitan atención${NC}"
    echo "Por favor revisa los servicios que no respondieron correctamente."
fi

echo ""
echo "🌸 Verificación completada - $(date)"
echo "=========================================================="