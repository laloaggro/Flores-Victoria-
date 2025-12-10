#!/bin/bash

# Script para actualizar URLs de servicios en admin-dashboard automáticamente
# Basado en el patrón de Railway que vimos en las imágenes

set -e

echo "🔄 Actualizando variables de entorno del admin-dashboard-service..."
echo "=================================================="

# Verificar que estamos en Railway
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI no encontrado. Instala con: npm install -g @railway/cli"
    exit 1
fi

# Vincular al servicio admin-dashboard
echo "📍 Vinculando al servicio admin-dashboard-service..."
railway link

# Configurar las URLs de los servicios conocidos (los que ya funcionan)
echo ""
echo "✅ Configurando URLs de servicios operativos..."

railway variables --set API_GATEWAY_URL=https://api-gateway-production-949b.up.railway.app
railway variables --set AUTH_SERVICE_URL=https://auth-service-production-ab8c.up.railway.app
railway variables --set CART_SERVICE_URL=https://cart-service-production-73f6.up.railway.app
railway variables --set PRODUCT_SERVICE_URL=https://product-service-production-089c.up.railway.app

echo ""
echo "⚠️  Los siguientes servicios están en proceso de despliegue..."
echo "   Necesitas obtener sus URLs públicas desde el Dashboard de Railway"
echo ""
echo "   Servicios pendientes:"
echo "   - USER_SERVICE_URL"
echo "   - ORDER_SERVICE_URL"
echo "   - WISHLIST_SERVICE_URL"
echo "   - REVIEW_SERVICE_URL"
echo "   - CONTACT_SERVICE_URL"
echo "   - NOTIFICATION_SERVICE_URL (nuevo)"
echo "   - PAYMENT_SERVICE_URL (nuevo)"
echo "   - PROMOTION_SERVICE_URL (nuevo)"
echo ""
echo "   Para configurarlos manualmente, usa:"
echo "   railway variables --set USER_SERVICE_URL=https://user-service-production-XXXX.up.railway.app"
echo ""

echo "✅ Variables actualizadas correctamente"
echo ""
echo "🚀 El admin-dashboard se redesplegará automáticamente en unos momentos"
echo "   URL: https://admin-dashboard-service-production.up.railway.app"
echo ""
