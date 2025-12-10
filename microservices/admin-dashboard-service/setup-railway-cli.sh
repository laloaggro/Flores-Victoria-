#!/bin/bash

# Script para configurar variables de entorno en Railway CLI
# Asegúrate de estar autenticado: railway login
# Y en el proyecto correcto: railway link

set -e  # Exit on error

echo "🚀 Configurando variables de entorno para admin-dashboard-service en Railway..."
echo ""

# Verificar que Railway CLI esté instalado
if ! command -v railway &> /dev/null; then
    echo "❌ Error: Railway CLI no está instalado"
    echo "📦 Instala Railway CLI con: npm i -g @railway/cli"
    echo "   O con: brew install railway"
    exit 1
fi

echo "✅ Railway CLI encontrado"
echo ""

# Verificar que estés autenticado
if ! railway whoami &> /dev/null; then
    echo "❌ Error: No estás autenticado en Railway"
    echo "🔐 Ejecuta: railway login"
    exit 1
fi

echo "✅ Autenticado en Railway"
echo ""

# Preguntar confirmación
read -p "¿Estás seguro de que quieres configurar las variables? (y/n): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Operación cancelada"
    exit 1
fi

echo ""
echo "⚙️  Configurando todas las variables..."

railway variables \
  --set "NODE_ENV=production" \
  --set "SERVICE_NAME=admin-dashboard-service" \
  --set "LOG_LEVEL=info" \
  --set 'API_GATEWAY_URL=${{API-GATEWAY.RAILWAY_PUBLIC_DOMAIN}}' \
  --set 'AUTH_SERVICE_URL=${{AUTH-SERVICE.RAILWAY_PUBLIC_DOMAIN}}' \
  --set 'USER_SERVICE_URL=${{USER-SERVICE.RAILWAY_PUBLIC_DOMAIN}}' \
  --set 'CART_SERVICE_URL=${{CART-SERVICE.RAILWAY_PUBLIC_DOMAIN}}' \
  --set 'ORDER_SERVICE_URL=${{ORDER-SERVICE.RAILWAY_PUBLIC_DOMAIN}}' \
  --set 'WISHLIST_SERVICE_URL=${{WISHLIST-SERVICE.RAILWAY_PUBLIC_DOMAIN}}' \
  --set 'REVIEW_SERVICE_URL=${{REVIEW-SERVICE.RAILWAY_PUBLIC_DOMAIN}}' \
  --set 'CONTACT_SERVICE_URL=${{CONTACT-SERVICE.RAILWAY_PUBLIC_DOMAIN}}' \
  --set 'PRODUCT_SERVICE_URL=${{PRODUCT-SERVICE.RAILWAY_PUBLIC_DOMAIN}}' \
  --set 'DATABASE_URL=${{Postgres.DATABASE_URL}}' \
  --set 'MONGODB_URI=${{MongoDB.MONGO_URL}}' \
  --set 'REDIS_URL=${{Redis.REDIS_URL}}' \
  --set 'JWT_SECRET=${{AUTH-SERVICE.JWT_SECRET}}'

echo ""
echo "✅ ¡Todas las variables configuradas exitosamente!"
echo ""
echo "📊 Variables configuradas:"
railway variables

echo ""
echo "🔄 Railway redesplegará el servicio automáticamente con las nuevas variables"
echo ""
echo "✅ Para verificar el despliegue:"
echo "   railway logs"
echo ""
echo "✅ Para ver el estado:"
echo "   railway status"
echo ""
