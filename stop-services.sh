#!/bin/bash

# 🛑 STOP SERVICES - FLORES VICTORIA v3.0
# Detiene servicios de un ambiente específico

set -e

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

ENVIRONMENT=${1:-development}

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}🛑 DETENIENDO SERVICIOS${NC}"
echo -e "${BLUE}   Ambiente: ${ENVIRONMENT}${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Detener por PIDs si existen
if [ -d ".pids" ]; then
  echo -e "${YELLOW}📋 Deteniendo servicios por PID...${NC}"
  
  for pidfile in .pids/*-$ENVIRONMENT.pid; do
    if [ -f "$pidfile" ]; then
      PID=$(cat "$pidfile")
      SERVICE=$(basename "$pidfile" | sed "s/-$ENVIRONMENT.pid//")
      
      if kill -0 $PID 2>/dev/null; then
        echo -e "  Deteniendo $SERVICE (PID: $PID)..."
        kill $PID
        rm "$pidfile"
      else
        echo -e "  ${YELLOW}⚠️  $SERVICE ya no está ejecutándose${NC}"
        rm "$pidfile"
      fi
    fi
  done
fi

# Fallback: detener por nombre de proceso
echo ""
echo -e "${YELLOW}🧹 Limpieza adicional...${NC}"
pkill -f "ai-simple.js" || true
pkill -f "order-service-simple.js" || true
pkill -f "admin-panel.*server.js" || true
pkill -f "notification-service.js" || true

sleep 2

echo ""
echo -e "${GREEN}✅ Servicios detenidos${NC}"
echo ""
