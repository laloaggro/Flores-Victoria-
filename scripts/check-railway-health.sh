#!/bin/bash
# check-railway-health.sh - Verificar estado de todos los servicios en Railway
# v1.0.0

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# URLs de los servicios (actualizar según tu proyecto)
declare -A SERVICES=(
  ["API-GATEWAY"]="https://api-gateway-production-949b.up.railway.app"
  ["PRODUCT-SERVICE"]="https://product-service-production-089c.up.railway.app"
  # Añadir más servicios según se configuren dominios públicos
)

echo -e "${BLUE}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     🌸 Flores Victoria - Railway Health Check      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════╝${NC}"
echo ""

TOTAL=0
HEALTHY=0
UNHEALTHY=0

for SERVICE in "${!SERVICES[@]}"; do
  URL="${SERVICES[$SERVICE]}"
  TOTAL=$((TOTAL + 1))
  
  printf "%-25s " "$SERVICE:"
  
  # Hacer request al health endpoint
  RESPONSE=$(curl -s --max-time 10 "${URL}/health" 2>/dev/null || echo "TIMEOUT")
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "${URL}/health" 2>/dev/null || echo "000")
  
  if [[ "$HTTP_CODE" == "200" ]]; then
    echo -e "${GREEN}✅ Healthy${NC} (HTTP $HTTP_CODE)"
    
    # Extraer info adicional si es JSON válido
    if echo "$RESPONSE" | jq -e . >/dev/null 2>&1; then
      STATUS=$(echo "$RESPONSE" | jq -r '.status // "unknown"')
      MONGODB=$(echo "$RESPONSE" | jq -r '.mongodb // .checks.mongodb // "N/A"')
      POSTGRES=$(echo "$RESPONSE" | jq -r '.postgres // .checks.postgres // "N/A"')
      UPTIME=$(echo "$RESPONSE" | jq -r '.uptime // "N/A"')
      
      if [[ "$MONGODB" != "N/A" && "$MONGODB" != "null" ]]; then
        echo -e "                          └─ MongoDB: ${GREEN}$MONGODB${NC}"
      fi
      if [[ "$POSTGRES" != "N/A" && "$POSTGRES" != "null" ]]; then
        echo -e "                          └─ PostgreSQL: ${GREEN}$POSTGRES${NC}"
      fi
      if [[ "$UPTIME" != "N/A" && "$UPTIME" != "null" ]]; then
        echo -e "                          └─ Uptime: ${UPTIME}s"
      fi
    fi
    
    HEALTHY=$((HEALTHY + 1))
  elif [[ "$HTTP_CODE" == "000" || "$RESPONSE" == "TIMEOUT" ]]; then
    echo -e "${RED}❌ Timeout/Unreachable${NC}"
    UNHEALTHY=$((UNHEALTHY + 1))
  else
    echo -e "${YELLOW}⚠️  HTTP $HTTP_CODE${NC}"
    UNHEALTHY=$((UNHEALTHY + 1))
  fi
done

echo ""
echo -e "${BLUE}────────────────────────────────────────────────────${NC}"
echo -e "Total: $TOTAL | ${GREEN}Healthy: $HEALTHY${NC} | ${RED}Unhealthy: $UNHEALTHY${NC}"

# También verificar servicios internos via Railway CLI si está disponible
if command -v railway &> /dev/null; then
  echo ""
  echo -e "${BLUE}📊 Railway CLI Service Status:${NC}"
  echo ""
  
  RAILWAY_SERVICES=(
    "AUTH-SERVICE"
    "USER-SERVICE"
    "ORDER-SERVICE"
    "CART-SERVICE"
    "WISHLIST-SERVICE"
    "REVIEW-SERVICE"
    "CONTACT-SERVICE"
    "NOTIFICATION-SERVICE"
    "PROMOTION-SERVICE"
    "PAYMENT-SERVICE"
  )
  
  for SVC in "${RAILWAY_SERVICES[@]}"; do
    printf "%-25s " "$SVC:"
    
    # Obtener últimos logs para ver si está corriendo
    LAST_LOG=$(timeout 5 railway logs -s "$SVC" --lines 1 2>&1 | head -1)
    
    if [[ "$LAST_LOG" == *"error"* ]] || [[ "$LAST_LOG" == *"Error"* ]]; then
      echo -e "${YELLOW}⚠️  Has recent errors${NC}"
    elif [[ -z "$LAST_LOG" ]] || [[ "$LAST_LOG" == *"not found"* ]]; then
      echo -e "${RED}❌ No logs / Not running${NC}"
    else
      echo -e "${GREEN}✅ Running${NC}"
    fi
  done
fi

echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║            Health Check Complete                   ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════╝${NC}"

# Exit code basado en estado
if [[ $UNHEALTHY -gt 0 ]]; then
  exit 1
fi
exit 0
