#!/bin/bash

# 📧 NOTIFICATION SERVICE START - FLORES VICTORIA v3.0
# Inicia el servicio de notificaciones con puerto por ambiente

set -e

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Ambiente (development por defecto)
ENVIRONMENT=${1:-development}

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}🌸 NOTIFICATION SERVICE STARTER${NC}"
echo -e "${BLUE}   Ambiente: ${ENVIRONMENT}${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Obtener puerto desde port-manager
NOTIFICATION_PORT=$(node scripts/port-manager.js get $ENVIRONMENT notification-service)

echo -e "${GREEN}✅ Puerto asignado: ${NOTIFICATION_PORT} (${ENVIRONMENT})${NC}"
echo ""

# Limpiar procesos previos
echo -e "${YELLOW}🧹 Limpiando procesos previos...${NC}"
pkill -f "notification-service.js" || true
sleep 1

# Iniciar servicio
echo -e "${BLUE}🚀 Iniciando Notification Service...${NC}"
mkdir -p logs
NODE_ENV=$ENVIRONMENT nohup node notification-service.js --port=$NOTIFICATION_PORT > logs/notification-service-$ENVIRONMENT.log 2>&1 &
NOTIFICATION_PID=$!

echo -e "${GREEN}✅ Notification Service iniciado (PID: ${NOTIFICATION_PID}, Puerto: ${NOTIFICATION_PORT})${NC}"

# Esperar y verificar salud
sleep 3

echo -e "${BLUE}🔍 Verificando salud del servicio...${NC}"
HEALTH_RESPONSE=$(curl -s http://localhost:$NOTIFICATION_PORT/health || echo "failed")

if echo "$HEALTH_RESPONSE" | grep -q "OK"; then
  echo -e "${GREEN}✅ Notification Service está saludable${NC}"
  echo ""
  echo -e "${GREEN}========================================${NC}"
  echo -e "${GREEN}🎉 NOTIFICATION SERVICE INICIADO${NC}"
  echo -e "${GREEN}========================================${NC}"
  echo -e "Puerto: ${NOTIFICATION_PORT}"
  echo -e "PID: ${NOTIFICATION_PID}"
  echo -e "Endpoints:"
  echo -e "  - Health: http://localhost:${NOTIFICATION_PORT}/health"
  echo -e "  - Send: http://localhost:${NOTIFICATION_PORT}/api/notifications/send"
  echo -e "  - Queue: http://localhost:${NOTIFICATION_PORT}/api/notifications/queue"
  echo -e "  - Templates: http://localhost:${NOTIFICATION_PORT}/api/notifications/templates"
  echo -e "  - Stats: http://localhost:${NOTIFICATION_PORT}/api/notifications/stats"
  echo -e "${GREEN}========================================${NC}"
else
  echo -e "${RED}❌ Notification Service no responde correctamente${NC}"
  echo -e "${RED}Response: $HEALTH_RESPONSE${NC}"
  exit 1
fi
