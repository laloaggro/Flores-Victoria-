#!/bin/bash

# 🚀 START CORE SERVICES - FLORES VICTORIA v3.0
# Sistema mejorado con gestión de puertos por ambiente

set -e

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Detectar ambiente (development por defecto)
ENVIRONMENT=${1:-development}

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}🌸 FLORES VICTORIA - START SERVICES${NC}"
echo -e "${BLUE}   Ambiente: ${ENVIRONMENT}${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Cargar puertos desde port-manager
AI_PORT=$(node scripts/port-manager.js get $ENVIRONMENT ai-service)
ORDER_PORT=$(node scripts/port-manager.js get $ENVIRONMENT order-service)
ADMIN_PORT=$(node scripts/port-manager.js get $ENVIRONMENT admin-panel)

echo -e "${BLUE}📋 Puertos asignados para ${ENVIRONMENT}:${NC}"
echo -e "  AI Service:      ${AI_PORT}"
echo -e "  Order Service:   ${ORDER_PORT}"
echo -e "  Admin Panel:     ${ADMIN_PORT}"
echo ""

# Verificar disponibilidad
echo -e "${YELLOW}🔍 Verificando disponibilidad de puertos...${NC}"
if ! node scripts/port-manager.js check $ENVIRONMENT; then
  echo ""
  echo -e "${RED}❌ Algunos puertos están ocupados${NC}"
  echo -e "${YELLOW}💡 Opciones:${NC}"
  echo -e "  1. Detener los servicios que usan esos puertos"
  echo -e "  2. Usar otro ambiente: ./start-services.sh <production|testing>"
  echo ""
  read -p "¿Continuar de todos modos? (y/N): " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

echo ""
echo -e "${YELLOW}🧹 Limpiando procesos previos...${NC}"
pkill -f "ai-simple.js" || true
pkill -f "order-service-simple.js" || true
pkill -f "admin-panel.*server.js" || true
sleep 2

echo ""
echo -e "${GREEN}🚀 Iniciando servicios...${NC}"
echo ""

# Crear directorio de logs si no existe
mkdir -p logs

# Iniciar AI Service
echo -e "${BLUE}🤖 AI Service (${AI_PORT})...${NC}"
NODE_ENV=$ENVIRONMENT nohup node ai-simple.js --port=$AI_PORT > logs/ai-service-$ENVIRONMENT.log 2>&1 &
AI_PID=$!
sleep 2

# Iniciar Order Service
echo -e "${BLUE}🛒 Order Service (${ORDER_PORT})...${NC}"
NODE_ENV=$ENVIRONMENT nohup node order-service-simple.js --port=$ORDER_PORT > logs/order-service-$ENVIRONMENT.log 2>&1 &
ORDER_PID=$!
sleep 2

# Iniciar Admin Panel
echo -e "${BLUE}🛡️  Admin Panel (${ADMIN_PORT})...${NC}"
NODE_ENV=$ENVIRONMENT nohup node admin-panel/server.js --port=$ADMIN_PORT > logs/admin-panel-$ENVIRONMENT.log 2>&1 &
ADMIN_PID=$!
sleep 3

echo ""
echo -e "${YELLOW}🔍 Verificando servicios...${NC}"

# Función para verificar salud
check_health() {
  local name=$1
  local port=$2
  local response=$(curl -s http://localhost:$port/health || echo "failed")
  
  if echo "$response" | grep -q "OK"; then
    echo -e "${GREEN}✅ $name${NC} (http://localhost:$port)"
    return 0
  else
    echo -e "${RED}❌ $name${NC} - No responde"
    return 1
  fi
}

# Verificar cada servicio
SERVICES_OK=0
check_health "AI Service     " $AI_PORT && ((SERVICES_OK++))
check_health "Order Service  " $ORDER_PORT && ((SERVICES_OK++))
check_health "Admin Panel    " $ADMIN_PORT && ((SERVICES_OK++))

echo ""
echo -e "${BLUE}========================================${NC}"
if [ $SERVICES_OK -eq 3 ]; then
  echo -e "${GREEN}✅ TODOS LOS SERVICIOS INICIADOS${NC}"
else
  echo -e "${YELLOW}⚠️  $SERVICES_OK/3 servicios activos${NC}"
fi
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${BLUE}📍 URLs de acceso (${ENVIRONMENT}):${NC}"
echo -e "  Admin Panel:     http://localhost:${ADMIN_PORT}"
echo -e "  AI Service:      http://localhost:${AI_PORT}/ai/recommendations"
echo -e "  Order Service:   http://localhost:${ORDER_PORT}/api/orders"
echo ""
echo -e "${BLUE}📊 Métricas:${NC}"
echo -e "  AI Metrics:      http://localhost:${AI_PORT}/metrics"
echo -e "  Order Metrics:   http://localhost:${ORDER_PORT}/metrics"
echo -e "  Admin Metrics:   http://localhost:${ADMIN_PORT}/metrics"
echo ""
echo -e "${BLUE}📝 Logs:${NC}"
echo -e "  tail -f logs/ai-service-${ENVIRONMENT}.log"
echo -e "  tail -f logs/order-service-${ENVIRONMENT}.log"
echo -e "  tail -f logs/admin-panel-${ENVIRONMENT}.log"
echo ""
echo -e "${BLUE}🔧 PIDs guardados:${NC}"
echo "$AI_PID" > .pids/ai-service-$ENVIRONMENT.pid
echo "$ORDER_PID" > .pids/order-service-$ENVIRONMENT.pid
echo "$ADMIN_PID" > .pids/admin-panel-$ENVIRONMENT.pid
mkdir -p .pids
echo -e "  AI:    $AI_PID"
echo -e "  Order: $ORDER_PID"
echo -e "  Admin: $ADMIN_PID"
echo ""
