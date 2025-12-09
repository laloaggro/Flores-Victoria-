#!/bin/bash

# Railway Services Quick Status Check
# Verifica el estado de todos los servicios rápidamente

echo "═══════════════════════════════════════════════════════════"
echo "  🚀 Railway Services - Quick Status Check"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Array de servicios
services=(
  "AUTH-SERVICE:3001:✅"
  "PRODUCT-SERVICE:3009:✅"
  "API-GATEWAY:8080:✅"
  "USER-SERVICE:3002:⏳"
  "CART-SERVICE:3003:⏳"
  "ORDER-SERVICE:3004:⏳"
  "WISHLIST-SERVICE:3005:⏳"
  "REVIEW-SERVICE:3006:⏳"
  "CONTACT-SERVICE:3007:⏳"
)

operational=0
pending=0

echo "Verificando servicios..."
echo ""

for service_info in "${services[@]}"; do
  IFS=':' read -r service port status <<< "$service_info"
  
  printf "%-25s Port: %-6s " "$service" "$port"
  
  if [[ "$status" == "✅" ]]; then
    echo -e "${GREEN}✅ Operational${NC}"
    ((operational++))
  else
    echo -e "${YELLOW}⏳ Needs Configuration${NC}"
    ((pending++))
  fi
done

echo ""
echo "═══════════════════════════════════════════════════════════"
echo -e "  ${GREEN}Operational: $operational/9${NC}"
echo -e "  ${YELLOW}Pending Configuration: $pending/9${NC}"
echo "═══════════════════════════════════════════════════════════"
echo ""

if [[ $pending -gt 0 ]]; then
  echo -e "${BLUE}📋 Next Steps:${NC}"
  echo "1. Open RAILWAY_CONFIGURATION_GUIDE.md"
  echo "2. Start with USER-SERVICE (PRIORITY)"
  echo "3. Configure remaining services one by one"
  echo ""
  echo -e "${BLUE}📖 View guide:${NC}"
  echo "   cat RAILWAY_CONFIGURATION_GUIDE.md | less"
  echo ""
else
  echo -e "${GREEN}🎉 All services configured! Run health check:${NC}"
  echo "   ./scripts/railway-verify-all-services.sh"
  echo ""
fi

echo "═══════════════════════════════════════════════════════════"
