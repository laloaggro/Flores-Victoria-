#!/bin/bash

# Script para generar variables de entorno para Railway
# Uso: ./generate-railway-vars.sh

echo "==========================================="
echo "Variables de Entorno para Admin Dashboard"
echo "==========================================="
echo ""
echo "Copia estas líneas y pégalas en Railway:"
echo ""

cat << 'EOF'
NODE_ENV=production
SERVICE_NAME=admin-dashboard-service
LOG_LEVEL=info
API_GATEWAY_URL=${{API-GATEWAY.RAILWAY_PUBLIC_DOMAIN}}
AUTH_SERVICE_URL=${{AUTH-SERVICE.RAILWAY_PUBLIC_DOMAIN}}
USER_SERVICE_URL=${{USER-SERVICE.RAILWAY_PUBLIC_DOMAIN}}
CART_SERVICE_URL=${{CART-SERVICE.RAILWAY_PUBLIC_DOMAIN}}
ORDER_SERVICE_URL=${{ORDER-SERVICE.RAILWAY_PUBLIC_DOMAIN}}
WISHLIST_SERVICE_URL=${{WISHLIST-SERVICE.RAILWAY_PUBLIC_DOMAIN}}
REVIEW_SERVICE_URL=${{REVIEW-SERVICE.RAILWAY_PUBLIC_DOMAIN}}
CONTACT_SERVICE_URL=${{CONTACT-SERVICE.RAILWAY_PUBLIC_DOMAIN}}
PRODUCT_SERVICE_URL=${{PRODUCT-SERVICE.RAILWAY_PUBLIC_DOMAIN}}
EOF

echo ""
echo "==========================================="
echo "Variables Opcionales (Bases de Datos):"
echo "==========================================="
echo ""

cat << 'EOF'
DATABASE_URL=${{Postgres.DATABASE_URL}}
MONGODB_URI=${{MongoDB.MONGO_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
JWT_SECRET=${{AUTH-SERVICE.JWT_SECRET}}
EOF

echo ""
echo "==========================================="
echo "Instrucciones:"
echo "==========================================="
echo "1. Ve a Railway Dashboard"
echo "2. Selecciona 'admin-dashboard-service'"
echo "3. Pestaña 'Variables'"
echo "4. Pega las variables de arriba"
echo "5. Railway redesplegará automáticamente"
echo ""
