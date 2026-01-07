#!/bin/bash
# ============================================
# Script de Verificación de Servicios - Flores Victoria
# Fase 1: Correcciones Urgentes
# ============================================

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}   🌸 Flores Victoria - Verificación de Servicios${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo ""

# URLs de producción en Railway
declare -A SERVICES=(
  ["api-gateway"]="https://api-gateway-production-b02f.up.railway.app"
  ["user-service"]="https://user-service-production-9ff7.up.railway.app"
  ["order-service"]="https://order-service-production-29eb.up.railway.app"
  ["product-service"]="https://product-service-production.up.railway.app"
  ["auth-service"]="https://auth-service-production.up.railway.app"
  ["cart-service"]="https://cart-service-production.up.railway.app"
  ["review-service"]="https://review-service-production-4431.up.railway.app"
  ["admin-dashboard"]="https://admin-dashboard-service-production.up.railway.app"
)

# Contador de errores
ERRORS=0
WARNINGS=0

# Función para verificar health check
check_health() {
  local name=$1
  local url=$2
  
  echo -ne "  Verificando ${name}... "
  
  response=$(curl -s -o /dev/null -w "%{http_code}" "${url}/health" --max-time 10 2>/dev/null || echo "000")
  
  if [ "$response" == "200" ]; then
    echo -e "${GREEN}✓ OK${NC}"
    return 0
  elif [ "$response" == "000" ]; then
    echo -e "${RED}✗ No responde${NC}"
    ((ERRORS++))
    return 1
  else
    echo -e "${YELLOW}⚠ HTTP $response${NC}"
    ((WARNINGS++))
    return 1
  fi
}

# Función para verificar endpoint de stats
check_stats_endpoint() {
  local name=$1
  local url=$2
  local path=$3
  local token=$4
  
  echo -ne "  Verificando ${name} ${path}... "
  
  if [ -n "$token" ]; then
    response=$(curl -s "${url}${path}" \
      -H "Authorization: Bearer ${token}" \
      -H "x-internal-request: true" \
      -H "x-service-name: verify-script" \
      --max-time 10 2>/dev/null || echo '{"error":"timeout"}')
  else
    response=$(curl -s "${url}${path}" --max-time 10 2>/dev/null || echo '{"error":"timeout"}')
  fi
  
  if echo "$response" | grep -q '"success":true\|"status":"ok"\|"data"'; then
    echo -e "${GREEN}✓ OK${NC}"
    return 0
  elif echo "$response" | grep -q 'Cannot GET\|Not Found\|404'; then
    echo -e "${RED}✗ Ruta no existe${NC}"
    ((ERRORS++))
    return 1
  elif echo "$response" | grep -q 'Token\|Unauthorized\|401\|403'; then
    echo -e "${YELLOW}⚠ Requiere autenticación${NC}"
    ((WARNINGS++))
    return 1
  else
    echo -e "${YELLOW}⚠ Respuesta inesperada${NC}"
    echo "    Response: ${response:0:100}..."
    ((WARNINGS++))
    return 1
  fi
}

# ============================================
# 1. Verificar Health Checks
# ============================================
echo -e "\n${BLUE}1. Health Checks de Servicios${NC}"
echo -e "   ──────────────────────────"

for name in "${!SERVICES[@]}"; do
  check_health "$name" "${SERVICES[$name]}"
done

# ============================================
# 2. Verificar Endpoints de Stats
# ============================================
echo -e "\n${BLUE}2. Endpoints de Estadísticas${NC}"
echo -e "   ──────────────────────────"

# SERVICE_TOKEN para pruebas (debe coincidir con producción)
SERVICE_TOKEN=${SERVICE_TOKEN:-"y1xFJ3qkC2DFbFtPSGsTs6bpIEp9eHnLZESHx7WVoJA="}

check_stats_endpoint "user-service" "${SERVICES[user-service]}" "/internal/users/stats" "$SERVICE_TOKEN"
check_stats_endpoint "user-service" "${SERVICES[user-service]}" "/api/users/stats" "$SERVICE_TOKEN"
check_stats_endpoint "order-service" "${SERVICES[order-service]}" "/api/orders/stats" "$SERVICE_TOKEN"

# ============================================
# 3. Verificar Conectividad DB
# ============================================
echo -e "\n${BLUE}3. Estado de Base de Datos${NC}"
echo -e "   ────────────────────────"

for name in "user-service" "order-service"; do
  echo -ne "  Verificando DB de ${name}... "
  response=$(curl -s "${SERVICES[$name]}/health" --max-time 10 2>/dev/null || echo '{}')
  
  if echo "$response" | grep -q '"database":"connected"\|"mongodb":"connected"'; then
    echo -e "${GREEN}✓ Conectada${NC}"
  elif echo "$response" | grep -q '"database":"disconnected"\|"mode":"degraded"'; then
    echo -e "${YELLOW}⚠ Modo degradado${NC}"
    ((WARNINGS++))
  else
    echo -e "${YELLOW}? Estado desconocido${NC}"
  fi
done

# ============================================
# Resumen
# ============================================
echo -e "\n${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}   Resumen${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
  echo -e "  ${GREEN}✓ Todos los servicios funcionando correctamente${NC}"
else
  echo -e "  ${RED}Errores: $ERRORS${NC}"
  echo -e "  ${YELLOW}Advertencias: $WARNINGS${NC}"
fi

echo ""
echo -e "${BLUE}Próximos pasos si hay errores:${NC}"
echo "  1. Verificar logs en Railway Dashboard"
echo "  2. Comprobar variables de entorno (JWT_SECRET, SERVICE_TOKEN)"
echo "  3. Ejecutar redeploy manual si es necesario"
echo ""

exit $ERRORS
