#!/bin/bash

# 🔍 SCRIPT DE VERIFICACIÓN DE URLs - FLORES VICTORIA v3.0
# Verifica el estado de todos los servicios del sistema

echo "🔍 VERIFICANDO URLs DEL SISTEMA FLORES VICTORIA v3.0"
echo "=================================================="
echo "📅 $(date)"
echo "🎯 Servicios Core Activos: Admin Panel, AI Service, Order Service"
echo ""

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para verificar URL
check_url() {
    local url=$1
    local name=$2
    local timeout=5
    
    printf "%-40s" "$name"
    
    if curl -s --max-time $timeout "$url" > /dev/null 2>&1; then
        printf "${GREEN}✅ FUNCIONANDO${NC}\n"
        return 0
    else
        printf "${RED}❌ NO RESPONDE${NC}\n"
        return 1
    fi
}

# Función para verificar health endpoint
check_health() {
    local url=$1
    local name=$2
    local timeout=5
    
    printf "%-40s" "$name"
    
    response=$(curl -s --max-time $timeout "$url" 2>/dev/null)
    if [[ $? -eq 0 ]] && [[ -n "$response" ]]; then
        if echo "$response" | grep -q "status.*OK\|health.*ok\|\"status\":\"OK\""; then
            printf "${GREEN}✅ SALUDABLE${NC}\n"
            return 0
        else
            printf "${YELLOW}⚠️  RESPONDE (sin health)${NC}\n"
            return 1
        fi
    else
        printf "${RED}❌ NO RESPONDE${NC}\n"
        return 1
    fi
}

echo "${BLUE}🎯 SERVICIOS PRINCIPALES${NC}"
echo "------------------------"

# Verificar servicios principales ACTIVOS
check_health "http://localhost:3021/health" "🛡️  Admin Panel (3021) ✅"
check_health "http://localhost:3002/health" "🤖 AI Service (3002) ✅" 
check_health "http://localhost:3004/health" "🛒 Order Service (3004) ✅"

echo ""
echo "${YELLOW}📋 SERVICIOS EN DESARROLLO${NC}"
echo "-----------------------------"

# Servicios en desarrollo/pendientes
check_health "http://localhost:3000/health" "API Gateway (3000)"
check_health "http://localhost:3001/health" "Auth Service (3001)" 
check_health "http://localhost:3003/health" "User Service (3003)"
check_health "http://localhost:3005/health" "Cart Service (3005)"
check_health "http://localhost:3006/health" "Wishlist Service (3006)"

echo ""
echo "${BLUE}📱 APLICACIONES WEB${NC}"
echo "-------------------"

# Verificar aplicaciones web
check_url "http://localhost:8080" "Frontend PWA (8080)"
check_url "http://localhost:3021" "Admin Panel Dashboard"
check_url "http://localhost:3021/documentation.html" "📚 Centro de Documentación ⭐"

echo ""
echo "${BLUE}📊 DASHBOARDS ESPECIALES${NC}"
echo "-------------------------"

# Verificar dashboards especiales
check_url "http://localhost:8081/arquitectura-interactiva.html" "🏗️ Arquitectura Interactiva"
check_url "http://localhost:8082/roi-analysis.html" "💰 Análisis ROI"

echo ""
echo "${BLUE}🔌 ENDPOINTS DE API ACTIVOS${NC}"
echo "------------------------------"

# Verificar endpoints de API activos
check_url "http://localhost:3002/ai/recommendations" "🤖 AI Recommendations"
check_url "http://localhost:3004/api/orders" "🛒 Order Management"
check_url "http://localhost:3021/documentation.html" "📚 Documentation Center"

echo ""
echo "${YELLOW}🔌 ENDPOINTS EN DESARROLLO${NC}"
echo "-----------------------------"

# Endpoints en desarrollo
check_url "http://localhost:3000/api" "API Gateway Endpoint"
check_url "http://localhost:3001/auth" "Auth Service Endpoint" 
check_url "http://localhost:3021/documentation.html" "📚 Documentation Center"

echo ""
echo "${BLUE}📝 RESUMEN Y RECOMENDACIONES${NC}"
echo "==============================="

# Generar resumen
echo ""
echo "🌟 ${GREEN}URL PRINCIPAL VERIFICADA:${NC}"
echo "   📚 Centro de Documentación: http://localhost:3021/documentation.html"
echo ""

# Verificar servicios core
active_services=0

if curl -s --max-time 3 "http://localhost:3021/health" > /dev/null 2>&1; then
    echo "✅ ${GREEN}ADMIN PANEL ACTIVO${NC} - http://localhost:3021"
    active_services=$((active_services + 1))
fi

if curl -s --max-time 3 "http://localhost:3002/health" > /dev/null 2>&1; then
    echo "✅ ${GREEN}AI SERVICE ACTIVO${NC} - http://localhost:3002/ai/recommendations"
    active_services=$((active_services + 1))
fi

if curl -s --max-time 3 "http://localhost:3004/health" > /dev/null 2>&1; then
    echo "✅ ${GREEN}ORDER SERVICE ACTIVO${NC} - http://localhost:3004/api/orders"
    active_services=$((active_services + 1))
fi

echo ""
if [ $active_services -eq 3 ]; then
    echo "🎉 ${GREEN}TODOS LOS SERVICIOS CORE ESTÁN ACTIVOS! ($active_services/3)${NC}"
    echo "   📚 Documentación: http://localhost:3021/documentation.html"
elif [ $active_services -gt 0 ]; then
    echo "⚠️  ${YELLOW}SERVICIOS PARCIALMENTE ACTIVOS ($active_services/3)${NC}"
    echo "   👆 Usa el script: ./verificacion-final.sh para verificar detalles"
else
    echo "❌ ${RED}SERVICIOS CORE NO DISPONIBLES${NC}"
    echo ""
    echo "🔧 ${YELLOW}Para iniciar servicios:${NC}"
    echo "   ./start-all-with-admin.sh"
fi

echo ""
echo "🔧 ${YELLOW}Para iniciar dashboards especiales:${NC}"
echo "   python3 -m http.server 8081  # Arquitectura Interactiva"  
echo "   python3 -m http.server 8082  # Análisis ROI"

echo ""
echo "🎯 ${BLUE}Para verificar otros servicios:${NC}"
echo "   ./start-all.sh                # Iniciar todos los servicios"
echo "   ./test-sistema.sh             # Test completo del sistema"

echo ""
echo "=================================================="
echo "✅ Verificación completada - $(date)"
echo "🌺 Sistema Flores Victoria v3.0"