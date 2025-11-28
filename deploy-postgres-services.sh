#!/bin/bash
# Script para desplegar servicios que usan PostgreSQL
# Estos servicios pueden desplegarse inmediatamente

set -e

PROJECT_DIR="/home/impala/Documentos/Proyectos/flores-victoria"
cd "$PROJECT_DIR"

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🚀 Desplegando servicios con PostgreSQL..."
echo ""

# Servicios a desplegar
SERVICES=(
  "user-service:3003"
  "order-service:3004"
  "payment-service:3011"
  "promotion-service:3012"
)

for service_config in "${SERVICES[@]}"; do
  SERVICE_NAME="${service_config%%:*}"
  SERVICE_PORT="${service_config##*:}"
  
  echo -e "${BLUE}📦 Desplegando $SERVICE_NAME (puerto $SERVICE_PORT)...${NC}"
  
  cd "$PROJECT_DIR/microservices"
  
  # Usar railway up con el servicio específico
  railway up --service "$SERVICE_NAME" --detach 2>&1 | tee /tmp/railway-deploy-$SERVICE_NAME.log || {
    echo -e "${YELLOW}⚠️  Error desplegando $SERVICE_NAME, revisa /tmp/railway-deploy-$SERVICE_NAME.log${NC}"
    continue
  }
  
  echo -e "${BLUE}⚙️  Configurando variables de entorno...${NC}"
  
  # Configurar variables de entorno
  railway variables --service "$SERVICE_NAME" set NODE_ENV=production 2>/dev/null || true
  railway variables --service "$SERVICE_NAME" set PORT=$SERVICE_PORT 2>/dev/null || true
  railway variables --service "$SERVICE_NAME" set LOG_LEVEL=info 2>/dev/null || true
  railway variables --service "$SERVICE_NAME" set DATABASE_URL="\${{Postgres.DATABASE_URL}}" 2>/dev/null || true
  railway variables --service "$SERVICE_NAME" set JWT_SECRET="\${{Postgres.JWT_SECRET}}" 2>/dev/null || true
  
  echo -e "${GREEN}✅ $SERVICE_NAME configurado${NC}"
  echo ""
  
  sleep 2
done

echo ""
echo -e "${GREEN}🎉 Servicios PostgreSQL desplegados!${NC}"
echo ""
echo "📊 Ver estado:"
echo "   railway status"
echo ""
