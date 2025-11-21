#!/bin/bash

# Script para instalar Joi en servicios que no lo tienen
# y agregar el paquete compartido de validación

set -e

echo "🔧 Installing Joi validation library in microservices..."

SERVICES=(
  "review-service"
  "contact-service"
  "wishlist-service"
)

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

for SERVICE in "${SERVICES[@]}"; do
  SERVICE_PATH="microservices/$SERVICE"
  
  if [ -d "$SERVICE_PATH" ]; then
    echo "📦 Installing Joi in $SERVICE..."
    
    cd "$SERVICE_PATH"
    
    # Verificar si ya tiene Joi
    if grep -q '"joi"' package.json 2>/dev/null; then
      echo -e "${GREEN}✓ $SERVICE already has Joi${NC}"
    else
      npm install joi@^17.11.0 --save
      echo -e "${GREEN}✓ Joi installed in $SERVICE${NC}"
    fi
    
    cd ../..
  else
    echo -e "${RED}✗ $SERVICE_PATH not found${NC}"
  fi
done

echo ""
echo "✅ Joi installation complete!"
echo ""
echo "Next steps:"
echo "1. Import validation schemas in your routes"
echo "2. Apply validateBody/validateQuery middleware"
echo "3. Test your endpoints with invalid data"
