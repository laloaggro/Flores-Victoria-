#!/bin/bash

# Script para actualizar URLs del admin-dashboard con servicios detectados
# Generado automáticamente: 2025-12-10

set -e

echo "🔄 Actualizando variables del admin-dashboard-service..."
echo "========================================================"
echo ""

# URLs detectadas de servicios funcionando
echo "✅ URLs de servicios ACTIVOS detectados:"
echo "   - API Gateway: https://api-gateway-production-949b.up.railway.app"
echo "   - Auth Service: https://auth-service-production-ab8c.up.railway.app"
echo "   - User Service: https://user-service-production-275f.up.railway.app"
echo "   - Cart Service: https://cart-service-production-73f6.up.railway.app"
echo "   - Product Service: https://product-service-production-089c.up.railway.app"
echo "   - Order Service: https://order-service-production-29eb.up.railway.app (detectado pero unhealthy)"
echo ""

# Verificar Railway CLI
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI no encontrado. Instala con: npm install -g @railway/cli"
    exit 1
fi

echo "📍 Vinculando al proyecto..."
railway link

echo ""
echo "🎯 Configurando variables de entorno..."

# Configurar servicios activos
railway variables --service admin-dashboard-service --set API_GATEWAY_URL=https://api-gateway-production-949b.up.railway.app
railway variables --service admin-dashboard-service --set AUTH_SERVICE_URL=https://auth-service-production-ab8c.up.railway.app
railway variables --service admin-dashboard-service --set USER_SERVICE_URL=https://user-service-production-275f.up.railway.app
railway variables --service admin-dashboard-service --set CART_SERVICE_URL=https://cart-service-production-73f6.up.railway.app
railway variables --service admin-dashboard-service --set PRODUCT_SERVICE_URL=https://product-service-production-089c.up.railway.app
railway variables --service admin-dashboard-service --set ORDER_SERVICE_URL=https://order-service-production-29eb.up.railway.app

echo ""
echo "✅ Variables actualizadas correctamente"
echo ""
echo "⚠️  Servicios pendientes de configurar (sin URL pública aún):"
echo "   - WISHLIST_SERVICE_URL"
echo "   - REVIEW_SERVICE_URL"
echo "   - CONTACT_SERVICE_URL"
echo "   - NOTIFICATION_SERVICE_URL"
echo "   - PAYMENT_SERVICE_URL"
echo "   - PROMOTION_SERVICE_URL"
echo ""
echo "🚀 Railway redesplegará automáticamente en unos momentos"
echo "   Dashboard: https://admin-dashboard-service-production.up.railway.app"
echo ""
