#!/bin/bash

# Script para actualizar todas las URLs en el admin-dashboard-service
# Este script configura las URLs correctas de producción en Railway

set -e

echo "🔧 Actualizando URLs del Admin Dashboard en Railway..."
echo "=================================================="
echo ""

# Cambiar al directorio del proyecto
cd "$(dirname "$0")/.." || exit 1

# Configurar el servicio
railway link --service admin-dashboard-service 2>/dev/null || true

echo "📝 Configurando URLs de servicios..."

# URLs de servicios en producción
railway variables --set API_GATEWAY_URL="https://api-gateway-production-949b.up.railway.app"
railway variables --set AUTH_SERVICE_URL="https://auth-service-production-ab8c.up.railway.app"
railway variables --set USER_SERVICE_URL="https://user-service-production-275f.up.railway.app"
railway variables --set CART_SERVICE_URL="https://cart-service-production-73f6.up.railway.app"
railway variables --set ORDER_SERVICE_URL="https://order-service-production-29eb.up.railway.app"
railway variables --set PRODUCT_SERVICE_URL="https://product-service-production-089c.up.railway.app"

# Servicios que aún no existen (configurar como localhost por ahora)
railway variables --set WISHLIST_SERVICE_URL="http://localhost:3005"
railway variables --set REVIEW_SERVICE_URL="http://localhost:3006"
railway variables --set CONTACT_SERVICE_URL="http://localhost:3007"

echo ""
echo "✅ Variables actualizadas correctamente"
echo ""
echo "🚀 Desplegando nueva versión del admin-dashboard..."

# Hacer un nuevo deploy para aplicar los cambios
railway up --detach

echo ""
echo "✅ Deploy iniciado. Las nuevas URLs estarán activas en ~2 minutos"
echo ""
echo "🔍 Verificar en: https://admin-dashboard-service-production.up.railway.app"
echo "📊 API de servicios: https://admin-dashboard-service-production.up.railway.app/api/dashboard/services"
echo ""
