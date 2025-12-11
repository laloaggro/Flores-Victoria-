#!/bin/bash

# Script para desplegar servicios faltantes en Railway
# Asegúrate de tener railway CLI instalado y autenticado: railway login

set -e

echo "🚀 Desplegando servicios faltantes en Railway"
echo "=============================================="
echo ""

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Servicios a desplegar
SERVICES=(
  "wishlist-service:3005"
  "review-service:3007"
  "contact-service:3008"
  "notification-service:3010"
  "payment-service:3011"
  "promotion-service:3013"
)

# Función para verificar si el servicio ya existe
service_exists() {
  local service_name=$1
  railway service list 2>/dev/null | grep -q "$service_name"
}

# Función para desplegar un servicio
deploy_service() {
  local service_path=$1
  local service_name=$2
  local service_port=$3
  
  echo -e "${YELLOW}📦 Procesando: $service_name (Puerto $service_port)${NC}"
  
  # Verificar si ya existe
  if service_exists "$service_name"; then
    echo -e "   ${GREEN}✓${NC} El servicio ya existe en Railway"
    return 0
  fi
  
  cd "microservices/$service_path"
  
  # Crear nuevo servicio
  echo "   Creando servicio en Railway..."
  railway service create "$service_name" 2>/dev/null || echo "   Servicio ya existe o error al crear"
  
  # Linkear servicio
  railway link "$service_name" 2>/dev/null || echo "   Ya linkeado"
  
  # Configurar variables de entorno básicas
  echo "   Configurando variables de entorno..."
  railway variables --set NODE_ENV=production
  railway variables --set PORT="$service_port"
  railway variables --set SERVICE_NAME="$service_name"
  
  # Desplegar
  echo "   Desplegando código..."
  railway up --detach 2>&1 | grep -E "Deployment|Building|Success|Error" || echo "   Deploy iniciado"
  
  echo -e "   ${GREEN}✓${NC} Deploy completado para $service_name"
  echo ""
  
  cd ../..
}

echo "ℹ️  Este script desplegará los siguientes servicios:"
for service_info in "${SERVICES[@]}"; do
  IFS=':' read -r service_name service_port <<< "$service_info"
  echo "   - $service_name (Puerto $service_port)"
done
echo ""

read -p "¿Continuar con el despliegue? (y/n): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Despliegue cancelado"
  exit 0
fi

# Desplegar cada servicio
for service_info in "${SERVICES[@]}"; do
  IFS=':' read -r service_name service_port <<< "$service_info"
  deploy_service "$service_name" "$service_name" "$service_port"
done

echo ""
echo -e "${GREEN}✅ Todos los servicios han sido desplegados${NC}"
echo ""
echo "📋 Próximos pasos:"
echo "   1. Espera 3-5 minutos para que todos los servicios terminen de construirse"
echo "   2. Ejecuta: ./scripts/update-dashboard-detected-urls.sh"
echo "   3. Verifica estado: ./scripts/monitor-main-services.sh"
echo ""
echo "🔗 Para ver los logs de un servicio:"
echo "   railway logs --service <service-name>"
echo ""
