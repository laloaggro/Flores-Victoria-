#!/bin/bash
# ════════════════════════════════════════════════════════════════════════
# 🌸 Flores Victoria - Script Completo Fase 1
# Ejecuta paso a paso con verificación de errores
# ════════════════════════════════════════════════════════════════════════

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# Contadores
STEP=0
ERRORS=0
WARNINGS=0

# Función para mostrar paso
step() {
  STEP=$((STEP + 1))
  echo ""
  echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
  echo -e "${BOLD}${CYAN}  PASO $STEP: $1${NC}"
  echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
}

# Función para éxito
success() {
  echo -e "${GREEN}  ✓ $1${NC}"
}

# Función para error
error() {
  echo -e "${RED}  ✗ ERROR: $1${NC}"
  ERRORS=$((ERRORS + 1))
}

# Función para advertencia
warn() {
  echo -e "${YELLOW}  ⚠ $1${NC}"
  WARNINGS=$((WARNINGS + 1))
}

# Función para info
info() {
  echo -e "${CYAN}  ℹ $1${NC}"
}

# Función para preguntar
ask() {
  echo -ne "${YELLOW}  → $1 ${NC}"
  read -r REPLY
  echo "$REPLY"
}

# Función para esperar
wait_for_enter() {
  echo -ne "${YELLOW}  Presiona ENTER para continuar...${NC}"
  read -r
}

# ════════════════════════════════════════════════════════════════════════
# INICIO
# ════════════════════════════════════════════════════════════════════════

clear
echo -e "${BLUE}"
echo "  ╔════════════════════════════════════════════════════════════════╗"
echo "  ║                                                                ║"
echo "  ║   🌸 FLORES VICTORIA - FASE 1: CORRECCIONES URGENTES 🌸      ║"
echo "  ║                                                                ║"
echo "  ╚════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""
echo "  Este script te guiará paso a paso para completar la Fase 1."
echo "  Se verificará cada paso y se mostrarán errores si los hay."
echo ""
wait_for_enter

# ════════════════════════════════════════════════════════════════════════
# PASO 1: Verificar Railway CLI
# ════════════════════════════════════════════════════════════════════════

step "Verificar Railway CLI instalado"

if command -v railway &> /dev/null; then
  RAILWAY_VERSION=$(railway --version 2>/dev/null || echo "desconocida")
  success "Railway CLI instalado: $RAILWAY_VERSION"
else
  error "Railway CLI no está instalado"
  info "Instalando Railway CLI..."
  
  if npm install -g @railway/cli 2>/dev/null; then
    success "Railway CLI instalado correctamente"
  else
    error "No se pudo instalar Railway CLI"
    echo ""
    echo -e "${RED}  Intenta manualmente:${NC}"
    echo "    npm install -g @railway/cli"
    echo "    # o"
    echo "    curl -fsSL https://railway.app/install.sh | sh"
    exit 1
  fi
fi

# ════════════════════════════════════════════════════════════════════════
# PASO 2: Verificar autenticación en Railway
# ════════════════════════════════════════════════════════════════════════

step "Verificar autenticación en Railway"

if railway whoami &>/dev/null; then
  CURRENT_USER=$(railway whoami 2>/dev/null)
  success "Autenticado como: $CURRENT_USER"
else
  warn "No estás autenticado en Railway"
  info "Iniciando proceso de login..."
  echo ""
  echo -e "${YELLOW}  Se abrirá tu navegador para autenticarte.${NC}"
  echo -e "${YELLOW}  Autoriza el acceso y vuelve aquí.${NC}"
  echo ""
  
  railway login
  
  if railway whoami &>/dev/null; then
    success "Login exitoso"
  else
    error "No se pudo autenticar"
    echo ""
    echo -e "${RED}  Intenta manualmente: railway login${NC}"
    exit 1
  fi
fi

# ════════════════════════════════════════════════════════════════════════
# PASO 3: Linkear proyecto
# ════════════════════════════════════════════════════════════════════════

step "Linkear proyecto de Railway"

# Verificar si ya está linkeado
if railway status &>/dev/null; then
  PROJECT_INFO=$(railway status 2>/dev/null | head -5)
  success "Proyecto ya linkeado"
  echo "$PROJECT_INFO" | while read -r line; do
    echo -e "${CYAN}    $line${NC}"
  done
else
  warn "Proyecto no linkeado"
  info "Selecciona tu proyecto 'Arreglos Victoria' y environment 'production'"
  echo ""
  
  railway link
  
  if railway status &>/dev/null; then
    success "Proyecto linkeado correctamente"
  else
    error "No se pudo linkear el proyecto"
    exit 1
  fi
fi

# ════════════════════════════════════════════════════════════════════════
# PASO 4: Listar servicios disponibles
# ════════════════════════════════════════════════════════════════════════

step "Listar servicios en el proyecto"

info "Servicios disponibles:"
echo ""

# Obtener lista de servicios
AVAILABLE_SERVICES=$(railway service 2>&1 || echo "")
echo "$AVAILABLE_SERVICES"
echo ""

# ════════════════════════════════════════════════════════════════════════
# PASO 5: Actualizar variables en cada servicio
# ════════════════════════════════════════════════════════════════════════

step "Actualizar JWT_SECRET y SERVICE_TOKEN"

# Valores a configurar
JWT_SECRET="y1xFJ3qkC2DFbFtPSGsTs6bpIEp9eHnLZESHx7WVoJA="
SERVICE_TOKEN="y1xFJ3qkC2DFbFtPSGsTs6bpIEp9eHnLZESHx7WVoJA="

info "Variables a configurar:"
echo -e "    ${CYAN}JWT_SECRET=${JWT_SECRET:0:20}...${NC}"
echo -e "    ${CYAN}SERVICE_TOKEN=${SERVICE_TOKEN:0:20}...${NC}"
echo ""

# Lista de servicios a actualizar
SERVICES_TO_UPDATE=(
  "api-gateway"
  "API-GATEWAY"
  "user-service"
  "USER-SERVICE"
  "order-service"
  "ORDER-SERVICE"
  "admin-dashboard-service"
  "ADMIN-DASHBOARD-SERVICE"
  "review-service"
  "REVIEW-SERVICE"
)

UPDATED=0

for SERVICE in "${SERVICES_TO_UPDATE[@]}"; do
  echo -ne "  Intentando ${SERVICE}... "
  
  # Intentar seleccionar el servicio
  if railway service "$SERVICE" &>/dev/null 2>&1; then
    # Actualizar JWT_SECRET
    if railway variables --set "JWT_SECRET=$JWT_SECRET" &>/dev/null 2>&1; then
      # Actualizar SERVICE_TOKEN
      if railway variables --set "SERVICE_TOKEN=$SERVICE_TOKEN" &>/dev/null 2>&1; then
        echo -e "${GREEN}✓ Actualizado${NC}"
        UPDATED=$((UPDATED + 1))
      else
        echo -e "${YELLOW}⚠ JWT_SECRET OK, SERVICE_TOKEN falló${NC}"
      fi
    else
      echo -e "${RED}✗ Error actualizando${NC}"
    fi
  else
    echo -e "${YELLOW}⊘ No encontrado${NC}"
  fi
done

echo ""
if [ $UPDATED -gt 0 ]; then
  success "$UPDATED servicios actualizados"
else
  warn "No se actualizaron servicios. Puede que los nombres sean diferentes."
  info "Verifica los nombres de servicios en Railway Dashboard"
fi

# ════════════════════════════════════════════════════════════════════════
# PASO 6: Esperar redeploy
# ════════════════════════════════════════════════════════════════════════

step "Esperar redeploy automático"

info "Railway hace redeploy automático cuando cambias variables."
info "Esperando 30 segundos..."
echo ""

for i in {30..1}; do
  echo -ne "\r  ⏳ Esperando... ${i}s   "
  sleep 1
done
echo -e "\r  ✓ Tiempo de espera completado    "

# ════════════════════════════════════════════════════════════════════════
# PASO 7: Verificar servicios
# ════════════════════════════════════════════════════════════════════════

step "Verificar estado de servicios"

# URLs de producción
declare -A PROD_URLS=(
  ["api-gateway"]="https://api-gateway-production-b02f.up.railway.app"
  ["user-service"]="https://user-service-production-9ff7.up.railway.app"
  ["order-service"]="https://order-service-production-29eb.up.railway.app"
  ["review-service"]="https://review-service-production-4431.up.railway.app"
  ["admin-dashboard"]="https://admin-dashboard-service-production.up.railway.app"
)

echo ""
echo "  Verificando health checks..."
echo ""

HEALTHY=0
UNHEALTHY=0

for name in "${!PROD_URLS[@]}"; do
  url="${PROD_URLS[$name]}"
  echo -ne "    $name: "
  
  response=$(curl -s -o /dev/null -w "%{http_code}" "${url}/health" --max-time 10 2>/dev/null || echo "000")
  
  if [ "$response" == "200" ]; then
    echo -e "${GREEN}✓ OK${NC}"
    HEALTHY=$((HEALTHY + 1))
  elif [ "$response" == "000" ]; then
    echo -e "${RED}✗ No responde${NC}"
    UNHEALTHY=$((UNHEALTHY + 1))
  else
    echo -e "${YELLOW}⚠ HTTP $response${NC}"
    UNHEALTHY=$((UNHEALTHY + 1))
  fi
done

# ════════════════════════════════════════════════════════════════════════
# PASO 8: Verificar endpoints de stats
# ════════════════════════════════════════════════════════════════════════

step "Verificar endpoints de estadísticas"

echo ""
echo "  Probando endpoints con SERVICE_TOKEN..."
echo ""

# Test user-service stats
echo -ne "    /internal/users/stats: "
response=$(curl -s "https://user-service-production-9ff7.up.railway.app/internal/users/stats" \
  -H "Authorization: Bearer $SERVICE_TOKEN" \
  -H "x-internal-request: true" \
  -H "x-service-name: verify-script" \
  --max-time 10 2>/dev/null || echo '{"error":"timeout"}')

if echo "$response" | grep -q '"success":true\|"data"'; then
  echo -e "${GREEN}✓ OK${NC}"
else
  echo -e "${YELLOW}⚠ Respuesta: ${response:0:50}...${NC}"
fi

# Test order-service stats
echo -ne "    /api/orders/stats: "
response=$(curl -s "https://order-service-production-29eb.up.railway.app/api/orders/stats" \
  -H "Authorization: Bearer $SERVICE_TOKEN" \
  -H "x-internal-request: true" \
  -H "x-service-name: verify-script" \
  --max-time 10 2>/dev/null || echo '{"error":"timeout"}')

if echo "$response" | grep -q '"success":true\|"data"\|"total"'; then
  echo -e "${GREEN}✓ OK${NC}"
else
  echo -e "${YELLOW}⚠ Respuesta: ${response:0:50}...${NC}"
fi

# ════════════════════════════════════════════════════════════════════════
# RESUMEN FINAL
# ════════════════════════════════════════════════════════════════════════

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BOLD}${CYAN}  RESUMEN FINAL${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""

echo -e "  Servicios saludables: ${GREEN}$HEALTHY${NC}"
echo -e "  Servicios con problemas: ${RED}$UNHEALTHY${NC}"
echo -e "  Servicios actualizados: ${CYAN}$UPDATED${NC}"
echo -e "  Errores encontrados: ${RED}$ERRORS${NC}"
echo -e "  Advertencias: ${YELLOW}$WARNINGS${NC}"
echo ""

if [ $ERRORS -eq 0 ] && [ $UNHEALTHY -eq 0 ]; then
  echo -e "${GREEN}  ╔════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${GREEN}  ║                                                            ║${NC}"
  echo -e "${GREEN}  ║   🎉 FASE 1 COMPLETADA EXITOSAMENTE 🎉                   ║${NC}"
  echo -e "${GREEN}  ║                                                            ║${NC}"
  echo -e "${GREEN}  ╚════════════════════════════════════════════════════════════╝${NC}"
  echo ""
  echo -e "  ${CYAN}Próximo paso: Iniciar Fase 2 (Seguridad)${NC}"
else
  echo -e "${YELLOW}  ╔════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${YELLOW}  ║                                                            ║${NC}"
  echo -e "${YELLOW}  ║   ⚠️  FASE 1 COMPLETADA CON ADVERTENCIAS ⚠️               ║${NC}"
  echo -e "${YELLOW}  ║                                                            ║${NC}"
  echo -e "${YELLOW}  ╚════════════════════════════════════════════════════════════╝${NC}"
  echo ""
  echo -e "  ${CYAN}Revisa los errores arriba y corrige manualmente si es necesario.${NC}"
  echo ""
  echo -e "  ${YELLOW}Acciones manuales si hay errores:${NC}"
  echo "    1. Ve a https://railway.app/dashboard"
  echo "    2. Selecciona proyecto 'Arreglos Victoria' → production"
  echo "    3. En cada servicio, ve a Variables"
  echo "    4. Añade/Actualiza:"
  echo "       JWT_SECRET=$JWT_SECRET"
  echo "       SERVICE_TOKEN=$SERVICE_TOKEN"
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""
