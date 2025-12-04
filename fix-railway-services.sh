#!/bin/bash

# Script para actualizar Root Directory de servicios en Railway
# Usa Railway CLI para cada servicio

echo "🔧 Actualizando configuración de servicios en Railway..."
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Array de servicios con sus root directories
declare -A services=(
    ["PRODUCT-SERVICE"]="microservices/product-service"
    ["API-GATEWAY"]="microservices/api-gateway"
    ["AUTH-SERVICE"]="microservices/auth-service"
    ["CART-SERVICE"]="microservices/cart-service"
    ["WISHLIST-SERVICE"]="microservices/wishlist-service"
    ["NOTIFICATION-SERVICE"]="microservices/notification-service"
    ["REVIEW-SERVICE"]="microservices/review-service"
    ["USER-SERVICE"]="microservices/user-service"
    ["CONTACT-SERVICE"]="microservices/contact-service"
    ["PAYMENT-SERVICE"]="microservices/payment-service"
    ["ORDER-SERVICE"]="microservices/order-service"
    ["Frontend-v2"]="frontend"
)

# Función para actualizar un servicio
update_service() {
    local service_name=$1
    local root_dir=$2
    
    echo -e "${YELLOW}📦 Actualizando $service_name...${NC}"
    
    # Cambiar al servicio
    railway service "$service_name" 2>/dev/null
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Servicio seleccionado: $service_name${NC}"
        echo "   Root Directory configurado: $root_dir"
        echo "   Dockerfile: Dockerfile.railway"
        echo ""
    else
        echo -e "${RED}❌ No se pudo seleccionar el servicio $service_name${NC}"
        echo ""
    fi
}

echo "⚠️  NOTA IMPORTANTE:"
echo "Railway CLI no puede cambiar el Root Directory directamente."
echo "Este script te mostrará qué servicios existen y qué configuración necesitan."
echo ""
echo "Deberás hacer los cambios manualmente en el dashboard de Railway:"
echo "1. Ve a cada servicio → Settings → Service Settings"
echo "2. Cambia 'Root Directory' al valor indicado"
echo "3. En 'Dockerfile Path' pon: Dockerfile.railway"
echo ""
echo "════════════════════════════════════════════════════════════════"
echo ""

# Listar todos los servicios y sus configuraciones
for service in "${!services[@]}"; do
    root_dir="${services[$service]}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "${YELLOW}Servicio:${NC} $service"
    echo -e "${GREEN}Root Directory:${NC} $root_dir"
    echo -e "${GREEN}Dockerfile Path:${NC} Dockerfile.railway"
    echo ""
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${YELLOW}📋 RESUMEN DE CONFIGURACIÓN NECESARIA:${NC}"
echo ""
echo "Para cada servicio en Railway Dashboard:"
echo ""
echo "1. MICROSERVICIOS (API-GATEWAY, AUTH, PRODUCT, CART, etc.):"
echo "   • Root Directory: microservices/[nombre-servicio]"
echo "   • Dockerfile Path: Dockerfile.railway"
echo ""
echo "2. FRONTEND-V2:"
echo "   • Root Directory: frontend"
echo "   • Dockerfile Path: Dockerfile.railway"
echo ""
echo -e "${GREEN}✅ Una vez configurado, Railway redeployará automáticamente.${NC}"
echo ""
