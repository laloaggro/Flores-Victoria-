#!/bin/bash

# Script para desplegar todos los microservicios a Railway
# Autor: GitHub Copilot
# Fecha: 2025-11-27

set -e

echo "🚀 Desplegando Flores Victoria a Railway..."
echo ""

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar que estamos en la raíz del proyecto
if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}❌ Error: Ejecuta este script desde la raíz del proyecto${NC}"
    exit 1
fi

# Verificar que Railway CLI está instalado
if ! command -v railway &> /dev/null; then
    echo -e "${RED}❌ Railway CLI no está instalado${NC}"
    echo "Instala con: npm install -g @railway/cli"
    exit 1
fi

# Verificar que estamos autenticados
if ! railway whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  No estás autenticado en Railway${NC}"
    echo "Ejecuta: railway login"
    exit 1
fi

echo -e "${BLUE}📋 Servicios a desplegar:${NC}"
echo "  1. auth-service (Puerto 3001)"
echo "  2. user-service (Puerto 3003)"
echo "  3. product-service (Puerto 3009)"
echo "  4. order-service (Puerto 3004)"
echo "  5. cart-service (Puerto 3005)"
echo "  6. wishlist-service (Puerto 3006)"
echo "  7. review-service (Puerto 3007)"
echo "  8. contact-service (Puerto 3008)"
echo "  9. payment-service (Puerto 3018)"
echo "  10. promotion-service (Puerto 3019)"
echo "  11. frontend (Puerto 5173)"
echo "  12. admin-panel (Puerto 3021)"
echo ""

# Array de servicios
declare -a services=(
    "auth-service:3001"
    "user-service:3003"
    "product-service:3009"
    "order-service:3004"
    "cart-service:3005"
    "wishlist-service:3006"
    "review-service:3007"
    "contact-service:3008"
    "payment-service:3018"
    "promotion-service:3019"
)

# Función para desplegar un servicio
deploy_service() {
    local service_name=$1
    local service_port=$2
    local service_path=$3
    
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}🚀 Desplegando: ${service_name}${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    cd "${service_path}"
    
    # Crear archivo .railwayignore si no existe
    if [ ! -f ".railwayignore" ]; then
        echo "node_modules/" > .railwayignore
        echo ".git/" >> .railwayignore
        echo "*.log" >> .railwayignore
    fi
    
    # Intentar desplegar
    echo -e "${YELLOW}📦 Desplegando desde: ${service_path}${NC}"
    
    # Railway up con contexto local
    if railway up --detach; then
        echo -e "${GREEN}✅ ${service_name} desplegado exitosamente${NC}"
    else
        echo -e "${RED}❌ Error desplegando ${service_name}${NC}"
        cd - > /dev/null
        return 1
    fi
    
    cd - > /dev/null
}

# Desplegar microservicios
echo -e "${YELLOW}📦 Desplegando microservicios...${NC}"
echo ""

for service_info in "${services[@]}"; do
    IFS=':' read -r service_name service_port <<< "$service_info"
    service_path="microservices/${service_name}"
    
    if [ -d "${service_path}" ]; then
        deploy_service "${service_name}" "${service_port}" "${service_path}"
        sleep 2  # Esperar entre despliegues
    else
        echo -e "${RED}❌ No se encontró: ${service_path}${NC}"
    fi
done

# Desplegar frontend
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎨 Desplegando Frontend${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
if [ -d "frontend" ]; then
    deploy_service "frontend" "5173" "frontend"
fi

# Desplegar admin-panel
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}⚙️  Desplegando Admin Panel${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
if [ -d "admin-panel" ]; then
    deploy_service "admin-panel" "3021" "admin-panel"
fi

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Despliegue completado${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}📊 Próximos pasos:${NC}"
echo "  1. Verifica el estado: railway status"
echo "  2. Ver logs: railway logs"
echo "  3. Configura variables de entorno en Railway UI"
echo "  4. Genera dominios públicos para frontend y admin-panel"
echo ""
echo -e "${YELLOW}⚠️  Recuerda configurar las variables de entorno en Railway:${NC}"
echo "  - JWT_SECRET"
echo "  - SESSION_SECRET"
echo "  - NODE_ENV=production"
echo "  - Database URLs (POSTGRES_URL, MONGODB_URL, REDIS_URL)"
echo ""
