#!/bin/bash

# Script para deployar API Gateway en Railway
# Configuración específica para API Gateway

set -e

SERVICE_NAME="api-gateway"
PORT=3000
SERVICE_PATH="api-gateway"

echo "=========================================="
echo "Deploying: $SERVICE_NAME"
echo "=========================================="

# Crear servicio (si no existe)
echo "Creating service..."
railway service create "$SERVICE_NAME" 2>/dev/null || echo "Service already exists"

# Seleccionar servicio
railway service "$SERVICE_NAME"

# Configurar variables de entorno
echo "Setting environment variables..."

railway variables set PORT="$PORT"
railway variables set NODE_ENV="production"
railway variables set SERVICE_NAME="$SERVICE_NAME"

# Healthcheck
railway variables set RAILWAY_HEALTHCHECK_PATH="/health"
railway variables set RAILWAY_HEALTHCHECK_TIMEOUT="300"

# Start command
railway variables set START_COMMAND="cd microservices/$SERVICE_PATH && node src/server.js"

# Service URLs (usar references de Railway)
echo "Configuring service URLs..."
railway variables set AUTH_SERVICE_URL='${{AUTH-SERVICE.RAILWAY_PRIVATE_DOMAIN}}'
railway variables set PRODUCT_SERVICE_URL='${{PRODUCT-SERVICE.RAILWAY_PRIVATE_DOMAIN}}'
railway variables set USER_SERVICE_URL='${{USER-SERVICE.RAILWAY_PRIVATE_DOMAIN}}'
railway variables set CART_SERVICE_URL='${{CART-SERVICE.RAILWAY_PRIVATE_DOMAIN}}'
railway variables set ORDER_SERVICE_URL='${{ORDER-SERVICE.RAILWAY_PRIVATE_DOMAIN}}'
railway variables set WISHLIST_SERVICE_URL='${{WISHLIST-SERVICE.RAILWAY_PRIVATE_DOMAIN}}'
railway variables set REVIEW_SERVICE_URL='${{REVIEW-SERVICE.RAILWAY_PRIVATE_DOMAIN}}'
railway variables set CONTACT_SERVICE_URL='${{CONTACT-SERVICE.RAILWAY_PRIVATE_DOMAIN}}'

echo ""
echo "✅ $SERVICE_NAME configured!"
echo ""
echo "⚠️  MANUAL STEPS REQUIRED in Railway Dashboard:"
echo "1. Go to $SERVICE_NAME → Settings"
echo "2. Set 'Root Directory': LEAVE EMPTY"
echo "3. Set 'Custom Build Command':"
echo "   cd microservices/shared && npm install --production && cd ../$SERVICE_PATH && npm ci && mkdir -p node_modules/@flores-victoria && cp -r ../shared node_modules/@flores-victoria/"
echo ""
echo "4. Configure JWT_SECRET (same as auth-service)"
echo "5. Configure CORS_ORIGIN (your frontend URL)"
echo ""
echo "To deploy:"
echo "  railway up"
