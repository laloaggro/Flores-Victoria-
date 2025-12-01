#!/bin/bash
# Script para configurar variables de entorno del API Gateway en Railway

echo "🔧 Configurando variables de entorno para API Gateway..."

# Seleccionar el servicio API Gateway
railway link

# Configurar URLs de servicios desplegados
echo "📝 Configurando URLs de servicios..."

railway variables --set PRODUCT_SERVICE_URL=https://product-service-production-089c.up.railway.app
railway variables --set AUTH_SERVICE_URL=https://auth-service-production-8e85.up.railway.app
railway variables --set USER_SERVICE_URL=https://user-service-production-d3cb.up.railway.app

echo "✅ Variables de entorno configuradas"
echo ""
echo "🔄 Reiniciando API Gateway..."
railway up --detach

echo "✅ Configuración completada"
echo ""
echo "Verifica el estado con:"
echo "  railway logs"
