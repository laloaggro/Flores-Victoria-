#!/bin/bash

# Script para configurar y verificar todos los microservicios en Railway
# Ejecutar desde la raíz del proyecto

set -e

echo "🚀 Configurando todos los servicios en Railway"
echo "=============================================="
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables comunes (obtener de Railway)
PROJECT_ID="d751ae6b-0067-4745-bc61-c50d7a39ac6a"
ENV_ID="73eb115c-6d10-41e5-be7e-f10ba16ef93c"

# Base de datos URLs (usar las del proyecto)
DATABASE_URL="postgresql://postgres:Qqw6YQ6CcOkZ9sLnOPp0yDH8t6A17X6w@monorail.proxy.rlwy.net:53134/railway"
MONGODB_URI="mongodb://mongo:lDzMNlkiGkqLxOKzZJ2TIQb7sGYz32D8@monorail.proxy.rlwy.net:54902"
JWT_SECRET="tu-jwt-secret-seguro-aqui-cambiar-en-produccion"

# Array de servicios a configurar
declare -A SERVICES=(
    ["user-service"]="3002"
    ["order-service"]="3004"
    ["wishlist-service"]="3006"
    ["review-service"]="3007"
    ["contact-service"]="3008"
)

# Servicios que ya están funcionando (no tocar)
WORKING_SERVICES=("api-gateway" "auth-service" "cart-service" "product-service" "admin-dashboard-service")

echo -e "${BLUE}📊 Servicios a configurar:${NC}"
for service in "${!SERVICES[@]}"; do
    echo "  • $service (puerto ${SERVICES[$service]})"
done
echo ""

echo -e "${GREEN}✅ Servicios ya funcionando:${NC}"
for service in "${WORKING_SERVICES[@]}"; do
    echo "  • $service"
done
echo ""

# Función para configurar un servicio
configure_service() {
    local service_name=$1
    local service_port=$2
    
    echo -e "${YELLOW}📦 Configurando: ${service_name}${NC}"
    
    # Link al servicio
    echo "  Linking to service..."
    railway service $service_name 2>/dev/null || {
        echo -e "  ${RED}⚠️  Servicio no existe en Railway. Créalo primero en Railway Dashboard.${NC}"
        return 1
    }
    
    # Variables comunes
    echo "  Configurando variables comunes..."
    railway variables --set "NODE_ENV=production" 2>/dev/null
    railway variables --set "SERVICE_NAME=$service_name" 2>/dev/null
    railway variables --set "SERVICE_PORT=$service_port" 2>/dev/null
    railway variables --set "LOG_LEVEL=info" 2>/dev/null
    
    # Variables específicas por servicio
    case $service_name in
        "user-service")
            echo "  Configurando variables de user-service..."
            railway variables --set "DATABASE_URL=$DATABASE_URL" 2>/dev/null
            railway variables --set "JWT_SECRET=$JWT_SECRET" 2>/dev/null
            railway variables --set "API_GATEWAY_URL=https://api-gateway-production-949b.up.railway.app" 2>/dev/null
            ;;
        "order-service")
            echo "  Configurando variables de order-service..."
            railway variables --set "DATABASE_URL=$DATABASE_URL" 2>/dev/null
            railway variables --set "JWT_SECRET=$JWT_SECRET" 2>/dev/null
            railway variables --set "USER_SERVICE_URL=https://user-service-production.up.railway.app" 2>/dev/null
            railway variables --set "PRODUCT_SERVICE_URL=https://product-service-production-089c.up.railway.app" 2>/dev/null
            railway variables --set "CART_SERVICE_URL=https://cart-service-production-73f6.up.railway.app" 2>/dev/null
            ;;
        "wishlist-service")
            echo "  Configurando variables de wishlist-service..."
            railway variables --set "DATABASE_URL=$DATABASE_URL" 2>/dev/null
            railway variables --set "USER_SERVICE_URL=https://user-service-production.up.railway.app" 2>/dev/null
            railway variables --set "PRODUCT_SERVICE_URL=https://product-service-production-089c.up.railway.app" 2>/dev/null
            ;;
        "review-service")
            echo "  Configurando variables de review-service..."
            railway variables --set "DATABASE_URL=$DATABASE_URL" 2>/dev/null
            railway variables --set "USER_SERVICE_URL=https://user-service-production.up.railway.app" 2>/dev/null
            railway variables --set "PRODUCT_SERVICE_URL=https://product-service-production-089c.up.railway.app" 2>/dev/null
            ;;
        "contact-service")
            echo "  Configurando variables de contact-service..."
            railway variables --set "MONGODB_URI=$MONGODB_URI" 2>/dev/null
            railway variables --set "NOTIFICATION_SERVICE_URL=https://notification-service-production.up.railway.app" 2>/dev/null
            ;;
    esac
    
    echo -e "  ${GREEN}✅ Configurado: $service_name${NC}"
    echo ""
    
    return 0
}

# Configurar cada servicio
for service in "${!SERVICES[@]}"; do
    configure_service "$service" "${SERVICES[$service]}" || continue
done

echo ""
echo -e "${GREEN}🎉 Configuración completada${NC}"
echo ""
echo -e "${BLUE}📝 Próximos pasos:${NC}"
echo "1. Verifica que todos los servicios existan en Railway Dashboard"
echo "2. Los servicios se redesplegarán automáticamente"
echo "3. Espera ~3-5 minutos para que todos estén online"
echo "4. Verifica en: https://admin-dashboard-service-production.up.railway.app"
echo ""
echo -e "${YELLOW}⚠️  Si un servicio no existe, créalo en Railway:${NC}"
echo "   1. New > Service"
echo "   2. Connect GitHub > Selecciona el repo"
echo "   3. Settings > Root Directory: microservices"
echo "   4. El servicio usará railway.toml automáticamente"
echo ""
