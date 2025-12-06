#!/bin/bash

# Script para verificar el estado de salud de todos los servicios deployados
# Requiere: jq instalado (sudo apt install jq)

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_header() {
    echo -e "${BLUE}=========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}=========================================${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Verificar jq
if ! command -v jq &> /dev/null; then
    print_warning "jq no está instalado. Instalar con: sudo apt install jq"
    USE_JQ=false
else
    USE_JQ=true
fi

print_header "Verificando Estado de Microservicios"
echo ""

# Array de servicios con sus URLs esperadas
# Formato: SERVICE_NAME:EXPECTED_URL:EXPECTED_PORT
declare -a SERVICES=(
    "product-service:product-service-production-089c.up.railway.app:3009"
    "auth-service:auth-service-production.up.railway.app:3001"
    "api-gateway:api-gateway-production.up.railway.app:3000"
    "user-service:user-service-production.up.railway.app:3002"
    "cart-service:cart-service-production.up.railway.app:3003"
    "order-service:order-service-production.up.railway.app:3004"
    "wishlist-service:wishlist-service-production.up.railway.app:3005"
    "review-service:review-service-production.up.railway.app:3006"
    "contact-service:contact-service-production.up.railway.app:3007"
)

HEALTHY_COUNT=0
UNHEALTHY_COUNT=0
UNKNOWN_COUNT=0

check_service() {
    local SERVICE_CONFIG=$1
    IFS=':' read -r SERVICE_NAME SERVICE_URL EXPECTED_PORT <<< "$SERVICE_CONFIG"
    
    echo -e "${BLUE}Checking: $SERVICE_NAME${NC}"
    
    # Hacer request al health endpoint
    RESPONSE=$(curl -s -w "\n%{http_code}" "https://$SERVICE_URL/health" 2>/dev/null || echo "ERROR\n000")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | head -n-1)
    
    if [ "$HTTP_CODE" = "200" ]; then
        if [ "$USE_JQ" = true ]; then
            ACTUAL_SERVICE=$(echo "$BODY" | jq -r '.service // "unknown"' 2>/dev/null || echo "unknown")
            STATUS=$(echo "$BODY" | jq -r '.status // "unknown"' 2>/dev/null || echo "unknown")
            UPTIME=$(echo "$BODY" | jq -r '.uptime // 0' 2>/dev/null || echo "0")
            
            if [ "$ACTUAL_SERVICE" = "$SERVICE_NAME" ] && [ "$STATUS" = "healthy" ]; then
                print_success "$SERVICE_NAME (uptime: ${UPTIME}s)"
                HEALTHY_COUNT=$((HEALTHY_COUNT + 1))
            else
                print_error "$SERVICE_NAME - Service name mismatch or unhealthy (expected: $SERVICE_NAME, got: $ACTUAL_SERVICE, status: $STATUS)"
                UNHEALTHY_COUNT=$((UNHEALTHY_COUNT + 1))
            fi
        else
            # Sin jq, solo verificar HTTP 200
            print_success "$SERVICE_NAME (HTTP 200 - instalar jq para detalles)"
            HEALTHY_COUNT=$((HEALTHY_COUNT + 1))
        fi
    elif [ "$HTTP_CODE" = "000" ] || [ "$HTTP_CODE" = "ERROR" ]; then
        print_warning "$SERVICE_NAME - No deployado o URL incorrecta"
        UNKNOWN_COUNT=$((UNKNOWN_COUNT + 1))
    else
        print_error "$SERVICE_NAME - HTTP $HTTP_CODE"
        UNHEALTHY_COUNT=$((UNHEALTHY_COUNT + 1))
    fi
    
    echo ""
}

# Verificar cada servicio
for service_config in "${SERVICES[@]}"; do
    check_service "$service_config"
done

# Resumen
print_header "Resumen"
echo -e "${GREEN}Healthy:   $HEALTHY_COUNT${NC}"
echo -e "${RED}Unhealthy: $UNHEALTHY_COUNT${NC}"
echo -e "${YELLOW}Unknown:   $UNKNOWN_COUNT${NC}"
echo ""

if [ $HEALTHY_COUNT -eq ${#SERVICES[@]} ]; then
    print_success "¡Todos los servicios están funcionando correctamente!"
    exit 0
elif [ $UNHEALTHY_COUNT -gt 0 ]; then
    print_error "Algunos servicios están con problemas"
    exit 1
else
    print_warning "Algunos servicios no están deployados aún"
    exit 2
fi
