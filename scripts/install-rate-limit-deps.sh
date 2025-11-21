#!/bin/bash

# Script para instalar dependencias de rate limiting en microservicios
# Instala rate-limit-redis e ioredis en servicios que lo necesiten

echo "🔧 Instalando dependencias de rate limiting avanzado..."
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Array de servicios que necesitan las dependencias
SERVICES=(
  "auth-service"
  "product-service"
  "user-service"
  "order-service"
  "cart-service"
  "wishlist-service"
  "review-service"
  "contact-service"
  "notification-service"
)

# Función para instalar en un servicio
install_in_service() {
  local service=$1
  local service_path="microservices/$service"
  
  if [ ! -d "$service_path" ]; then
    echo -e "${YELLOW}⚠️  Servicio $service no encontrado, saltando...${NC}"
    return
  fi
  
  echo -e "${YELLOW}📦 Instalando en $service...${NC}"
  
  cd "$service_path"
  
  # Verificar si package.json existe
  if [ ! -f "package.json" ]; then
    echo -e "${RED}✗ package.json no encontrado en $service${NC}"
    cd ../..
    return
  fi
  
  # Instalar dependencias
  npm install --save rate-limit-redis@^4.2.3 ioredis@^5.8.2 2>&1 | grep -v "npm warn"
  
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Dependencias instaladas en $service${NC}"
  else
    echo -e "${RED}✗ Error instalando en $service${NC}"
  fi
  
  cd ../..
  echo ""
}

# Instalar en cada servicio
for service in "${SERVICES[@]}"; do
  install_in_service "$service"
done

echo -e "${GREEN}✅ Instalación completada${NC}"
echo ""
echo "Dependencias instaladas:"
echo "  - rate-limit-redis@^4.2.3 (Redis store para express-rate-limit)"
echo "  - ioredis@^5.8.2 (Cliente Redis con soporte completo)"
echo ""
echo "Siguiente paso: Actualizar los servicios para usar el nuevo rate-limiter.js"
