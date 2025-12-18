#!/bin/bash
# Script automatizado para desplegar todos los servicios en Railway
# Autor: GitHub Copilot
# Fecha: 2025-11-28

set -e  # Exit on error

PROJECT_DIR="/home/impala/Documentos/Proyectos/flores-victoria"
cd "$PROJECT_DIR"

echo "🚀 Iniciando despliegue de microservicios en Railway..."
echo ""

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para crear servicio en Railway
create_service() {
  local SERVICE_NAME=$1
  local SERVICE_PORT=$2
  local DATABASE_TYPE=$3
  
  echo -e "${BLUE}📦 Desplegando $SERVICE_NAME (puerto $SERVICE_PORT)...${NC}"
  
  # Cambiar al directorio del servicio
  cd "$PROJECT_DIR/microservices/$SERVICE_NAME"
  
  # Desplegar usando railway up
  railway up --service "$SERVICE_NAME" --detach || {
    echo -e "${YELLOW}⚠️  Servicio $SERVICE_NAME no existe, creándolo...${NC}"
    # Si el servicio no existe, Railway lo creará automáticamente
    railway up --detach
  }
  
  # Configurar variables de entorno
  echo -e "${BLUE}⚙️  Configurando variables de entorno para $SERVICE_NAME...${NC}"
  
  # Variables comunes
  railway variables --service "$SERVICE_NAME" set NODE_ENV=production
  railway variables --service "$SERVICE_NAME" set PORT=$SERVICE_PORT
  railway variables --service "$SERVICE_NAME" set LOG_LEVEL=info
  
  # Variables según tipo de base de datos
  case $DATABASE_TYPE in
    postgresql)
      echo "  - Vinculando PostgreSQL"
      railway variables --service "$SERVICE_NAME" set DATABASE_URL="\${{Postgres.DATABASE_URL}}"
      ;;
    mongodb)
      echo "  - Vinculando MongoDB"
      railway variables --service "$SERVICE_NAME" set MONGO_URI="\${{MongoDB.MONGO_URL}}"
      ;;
    redis)
      echo "  - Vinculando Redis"
      railway variables --service "$SERVICE_NAME" set REDIS_URL="\${{Redis.REDIS_URL}}"
      ;;
  esac
  
  echo -e "${GREEN}✅ $SERVICE_NAME desplegado correctamente${NC}"
  echo ""
}

# Verificar que estamos logueados en Railway
echo "🔐 Verificando autenticación en Railway..."
railway whoami || {
  echo "❌ No estás logueado en Railway. Ejecuta: railway login"
  exit 1
}

echo -e "${GREEN}✅ Autenticado en Railway${NC}"
echo ""

# Verificar o crear bases de datos
echo "🗄️  Verificando bases de datos..."
echo ""

# MongoDB
echo "Verificando MongoDB..."
railway variables --service MongoDB 2>/dev/null || {
  echo -e "${YELLOW}⚠️  MongoDB no existe. Por favor créalo manualmente en Railway:${NC}"
  echo "   1. Ve a tu proyecto en Railway"
  echo "   2. Click en 'New' → 'Database' → 'Add MongoDB'"
  echo "   3. Luego vuelve a ejecutar este script"
  exit 1
}
echo -e "${GREEN}✅ MongoDB encontrado${NC}"

# Redis
echo "Verificando Redis..."
railway variables --service Redis 2>/dev/null || {
  echo -e "${YELLOW}⚠️  Redis no existe. Por favor créalo manualmente en Railway:${NC}"
  echo "   1. Ve a tu proyecto en Railway"
  echo "   2. Click en 'New' → 'Database' → 'Add Redis'"
  echo "   3. Luego vuelve a ejecutar este script"
  exit 1
}
echo -e "${GREEN}✅ Redis encontrado${NC}"
echo ""

# Desplegar servicios (excepto auth-service que ya está desplegado)
echo "🚀 Desplegando servicios..."
echo ""

# API Gateway (debe ir primero)
create_service "api-gateway" "3000" "none"

# Servicios que usan PostgreSQL
create_service "user-service" "3003" "postgresql"
create_service "order-service" "3004" "postgresql"
create_service "payment-service" "3011" "postgresql"
create_service "promotion-service" "3012" "postgresql"

# Servicios que usan MongoDB
create_service "product-service" "3009" "mongodb"
create_service "review-service" "3007" "mongodb"
create_service "contact-service" "3008" "mongodb"

# Servicios que usan Redis
create_service "cart-service" "3005" "redis"
create_service "wishlist-service" "3006" "redis"
create_service "notification-service" "3010" "redis"

echo ""
echo -e "${GREEN}🎉 ¡Todos los servicios han sido desplegados!${NC}"
echo ""
echo "📊 Para ver el estado de los servicios:"
echo "   railway status"
echo ""
echo "📝 Para ver los logs de un servicio:"
echo "   railway logs --service <nombre-del-servicio>"
echo ""
