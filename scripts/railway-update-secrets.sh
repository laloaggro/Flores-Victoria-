#!/bin/bash
# ============================================
# Script para actualizar JWT_SECRET en Railway
# Fase 1 - Flores Victoria
# ============================================

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Valores a configurar
JWT_SECRET="y1xFJ3qkC2DFbFtPSGsTs6bpIEp9eHnLZESHx7WVoJA="
SERVICE_TOKEN="y1xFJ3qkC2DFbFtPSGsTs6bpIEp9eHnLZESHx7WVoJA="

# Servicios a actualizar
SERVICES=(
  "api-gateway"
  "user-service"
  "order-service"
  "admin-dashboard-service"
  "review-service"
  "cart-service"
)

echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}   🔐 Actualizando JWT_SECRET en Railway${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo ""

# Verificar autenticación
echo -e "${YELLOW}Verificando autenticación en Railway...${NC}"
if ! railway whoami &>/dev/null; then
  echo -e "${RED}❌ No estás autenticado. Ejecuta: railway login${NC}"
  exit 1
fi

CURRENT_USER=$(railway whoami 2>/dev/null)
echo -e "${GREEN}✓ Autenticado como: ${CURRENT_USER}${NC}"
echo ""

# Listar proyectos disponibles
echo -e "${YELLOW}Proyectos disponibles:${NC}"
railway list 2>/dev/null || echo "No se pueden listar proyectos"
echo ""

# Preguntar por el proyecto
echo -e "${YELLOW}Necesitas linkear el proyecto primero.${NC}"
echo -e "Ejecuta: ${GREEN}railway link${NC}"
echo ""
read -p "¿Ya linkeaste el proyecto? (s/n): " LINKED

if [ "$LINKED" != "s" ]; then
  echo -e "${YELLOW}Ejecutando railway link...${NC}"
  railway link
fi

echo ""
echo -e "${BLUE}Actualizando variables en cada servicio...${NC}"
echo ""

for SERVICE in "${SERVICES[@]}"; do
  echo -ne "  Actualizando ${SERVICE}... "
  
  # Seleccionar servicio
  if railway service "$SERVICE" &>/dev/null; then
    # Actualizar variables
    railway variables --set "JWT_SECRET=$JWT_SECRET" &>/dev/null
    railway variables --set "SERVICE_TOKEN=$SERVICE_TOKEN" &>/dev/null
    echo -e "${GREEN}✓${NC}"
  else
    echo -e "${YELLOW}⚠ No encontrado${NC}"
  fi
done

echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ Variables actualizadas${NC}"
echo ""
echo -e "${YELLOW}Los servicios harán redeploy automáticamente.${NC}"
echo -e "Espera 2-3 minutos y luego ejecuta:"
echo -e "${GREEN}  ./scripts/verify-services.sh${NC}"
echo ""
