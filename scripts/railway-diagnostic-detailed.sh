#!/bin/bash

# Railway Diagnostic Tool - Detailed Analysis
# Diagnóstico completo del estado de Railway

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║          🔍 RAILWAY DIAGNOSTIC TOOL - DETAILED 🔍             ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# API Gateway Base URL
API_GATEWAY="https://api-gateway-production-949b.up.railway.app"

# Services to check
declare -A SERVICES=(
    ["API-GATEWAY"]="$API_GATEWAY"
    ["AUTH-SERVICE"]="https://auth-service-production-949b.up.railway.app"
    ["USER-SERVICE"]="https://user-service-production-949b.up.railway.app"
    ["PRODUCT-SERVICE"]="https://product-service-production-949b.up.railway.app"
    ["ORDER-SERVICE"]="https://order-service-production-949b.up.railway.app"
    ["CART-SERVICE"]="https://cart-service-production-949b.up.railway.app"
    ["WISHLIST-SERVICE"]="https://wishlist-service-production-949b.up.railway.app"
    ["REVIEW-SERVICE"]="https://review-service-production-949b.up.railway.app"
    ["CONTACT-SERVICE"]="https://contact-service-production-949b.up.railway.app"
    ["PAYMENT-SERVICE"]="https://payment-service-production-949b.up.railway.app"
    ["PROMOTION-SERVICE"]="https://promotion-service-production-949b.up.railway.app"
    ["NOTIFICATION-SERVICE"]="https://notification-service-production-949b.up.railway.app"
)

# Health endpoints to try
HEALTH_ENDPOINTS=("/health" "/api/health" "/" "/api")

echo "📋 Probando múltiples endpoints de salud para cada servicio..."
echo ""

SUCCESS_COUNT=0
FAILED_COUNT=0
WARNING_COUNT=0

for SERVICE_NAME in "${!SERVICES[@]}"; do
    BASE_URL="${SERVICES[$SERVICE_NAME]}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "${BLUE}🔍 $SERVICE_NAME${NC}"
    echo "   URL: $BASE_URL"
    echo ""
    
    FOUND_WORKING=false
    
    for ENDPOINT in "${HEALTH_ENDPOINTS[@]}"; do
        FULL_URL="${BASE_URL}${ENDPOINT}"
        
        # Try to get response
        HTTP_CODE=$(curl -s -o /tmp/response.txt -w "%{http_code}" "$FULL_URL" 2>/dev/null || echo "000")
        RESPONSE_BODY=$(cat /tmp/response.txt 2>/dev/null || echo "")
        
        if [ "$HTTP_CODE" = "200" ]; then
            echo -e "   ${GREEN}✅ $ENDPOINT → HTTP $HTTP_CODE${NC}"
            
            # Try to format JSON if possible
            if command -v jq &> /dev/null && echo "$RESPONSE_BODY" | jq . &> /dev/null; then
                echo -e "   ${GREEN}📄 Response:${NC}"
                echo "$RESPONSE_BODY" | jq '.' | sed 's/^/      /'
            else
                echo -e "   ${GREEN}📄 Response:${NC} $RESPONSE_BODY" | head -c 200
            fi
            
            FOUND_WORKING=true
            ((SUCCESS_COUNT++))
            break
        elif [ "$HTTP_CODE" = "404" ]; then
            echo -e "   ${YELLOW}⚠️  $ENDPOINT → HTTP 404 (endpoint no existe)${NC}"
        elif [ "$HTTP_CODE" = "502" ]; then
            echo -e "   ${RED}❌ $ENDPOINT → HTTP 502 (servicio no responde)${NC}"
        elif [ "$HTTP_CODE" = "503" ]; then
            echo -e "   ${RED}❌ $ENDPOINT → HTTP 503 (servicio no disponible)${NC}"
        elif [ "$HTTP_CODE" = "000" ]; then
            echo -e "   ${RED}❌ $ENDPOINT → Sin conexión${NC}"
        else
            echo -e "   ${YELLOW}⚠️  $ENDPOINT → HTTP $HTTP_CODE${NC}"
        fi
    done
    
    if [ "$FOUND_WORKING" = false ]; then
        echo -e "   ${RED}❌ NINGÚN ENDPOINT FUNCIONAL ENCONTRADO${NC}"
        ((FAILED_COUNT++))
        
        # Suggestions
        echo -e "   ${YELLOW}💡 Sugerencias:${NC}"
        echo "      1. Verificar logs en Railway Dashboard"
        echo "      2. Revisar variables de entorno (DATABASE_URL, MONGODB_URI)"
        echo "      3. Verificar que el servicio exponga el puerto correcto"
        echo "      4. Revisar código del health check endpoint"
    fi
    
    echo ""
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 RESUMEN:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ Servicios operativos: $SUCCESS_COUNT${NC}"
echo -e "${RED}❌ Servicios con problemas: $FAILED_COUNT${NC}"
TOTAL=$((SUCCESS_COUNT + FAILED_COUNT))
echo -e "${BLUE}📊 Total de servicios: $TOTAL${NC}"
echo ""

# Success rate
if [ $TOTAL -gt 0 ]; then
    SUCCESS_RATE=$(( (SUCCESS_COUNT * 100) / TOTAL ))
    echo -e "${BLUE}📈 Tasa de éxito: ${SUCCESS_RATE}%${NC}"
    
    if [ $SUCCESS_RATE -ge 90 ]; then
        echo -e "${GREEN}🎉 ¡Excelente! El sistema está casi completamente operativo${NC}"
    elif [ $SUCCESS_RATE -ge 70 ]; then
        echo -e "${YELLOW}⚠️  El sistema está parcialmente operativo${NC}"
    else
        echo -e "${RED}❌ El sistema requiere atención inmediata${NC}"
    fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 PRÓXIMOS PASOS RECOMENDADOS:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $FAILED_COUNT -gt 0 ]; then
    echo ""
    echo "Para servicios fallidos:"
    echo "  1. railway logs [service-name]  # Ver logs del servicio"
    echo "  2. railway variables             # Verificar variables de entorno"
    echo "  3. railway redeploy [service]    # Redesplegar el servicio"
    echo ""
    echo "Diagnóstico en Dashboard:"
    echo "  railway open  # Abrir Railway Dashboard"
    echo "  → Click en servicio fallido → Tab 'Deployments' → Ver logs"
fi

if [ $SUCCESS_COUNT -eq $TOTAL ]; then
    echo ""
    echo -e "${GREEN}✅ Todos los servicios están operativos!${NC}"
    echo ""
    echo "Prueba endpoints funcionales:"
    echo "  • Auth: curl $API_GATEWAY/api/auth/health"
    echo "  • Products: curl $API_GATEWAY/api/products"
    echo "  • Health: curl $API_GATEWAY/health"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Cleanup
rm -f /tmp/response.txt

# Exit with appropriate code
if [ $SUCCESS_COUNT -eq $TOTAL ]; then
    exit 0
elif [ $SUCCESS_COUNT -gt 0 ]; then
    exit 1
else
    exit 2
fi
