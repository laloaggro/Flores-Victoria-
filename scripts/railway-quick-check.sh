#!/bin/bash

# Quick Railway Health Check
# Verificación rápida del estado de servicios

set -euo pipefail

echo "🔍 Verificación Rápida de Servicios Railway"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Services
declare -A SERVICES=(
    ["API Gateway"]="https://api-gateway-production-949b.up.railway.app/health"
    ["Auth"]="https://auth-service-production-949b.up.railway.app/health"
    ["User"]="https://user-service-production-949b.up.railway.app/health"
    ["Product"]="https://product-service-production-949b.up.railway.app/health"
    ["Order"]="https://order-service-production-949b.up.railway.app/health"
    ["Cart"]="https://cart-service-production-949b.up.railway.app/health"
    ["Wishlist"]="https://wishlist-service-production-949b.up.railway.app/health"
    ["Review"]="https://review-service-production-949b.up.railway.app/health"
    ["Contact"]="https://contact-service-production-949b.up.railway.app/health"
    ["Payment"]="https://payment-service-production-949b.up.railway.app/health"
    ["Promotion"]="https://promotion-service-production-949b.up.railway.app/health"
    ["Notification"]="https://notification-service-production-949b.up.railway.app/health"
)

OK=0
FAIL=0

for SERVICE in "${!SERVICES[@]}"; do
    URL="${SERVICES[$SERVICE]}"
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$URL" 2>/dev/null || echo "000")
    
    printf "%-15s " "$SERVICE"
    
    if [ "$HTTP_CODE" = "200" ]; then
        echo -e "${GREEN}✅ HTTP 200${NC}"
        ((OK++))
    elif [ "$HTTP_CODE" = "404" ]; then
        echo -e "${YELLOW}⚠️  HTTP 404 (endpoint no existe)${NC}"
        ((FAIL++))
    elif [ "$HTTP_CODE" = "502" ]; then
        echo -e "${RED}❌ HTTP 502 (no responde)${NC}"
        ((FAIL++))
    else
        echo -e "${RED}❌ HTTP $HTTP_CODE${NC}"
        ((FAIL++))
    fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ Operativos: $OK/12${NC}"
echo -e "${RED}❌ Con problemas: $FAIL/12${NC}"

PERCENT=$((OK * 100 / 12))
echo "📊 Tasa de éxito: ${PERCENT}%"

if [ $OK -eq 12 ]; then
    echo ""
    echo -e "${GREEN}🎉 ¡TODOS LOS SERVICIOS OPERATIVOS!${NC}"
    exit 0
elif [ $OK -ge 10 ]; then
    echo ""
    echo -e "${YELLOW}⚠️  Casi completo, revisa los servicios fallidos${NC}"
    exit 1
else
    echo ""
    echo -e "${RED}❌ Varios servicios requieren atención${NC}"
    exit 2
fi
