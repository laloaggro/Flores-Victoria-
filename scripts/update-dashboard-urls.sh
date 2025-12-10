#!/bin/bash

# Script para actualizar las URLs de los servicios en admin-dashboard-service
# Ejecutar DESPUÉS de desplegar los servicios nuevos en Railway

set -e

echo "🔄 Actualizando URLs de servicios en Admin Dashboard"
echo "===================================================="
echo ""

cd /home/impala/Documentos/Proyectos/flores-victoria/microservices/admin-dashboard-service

# Link al servicio admin-dashboard
railway link --service admin-dashboard-service

echo "📝 Configurando nuevas URLs de servicios..."
echo ""

# URLs de servicios nuevos (actualizar cuando estén desplegados)
echo "⚠️  IMPORTANTE: Actualiza estas URLs con las URLs reales de Railway"
echo ""
echo "USER_SERVICE_URL=https://user-service-production-XXXX.up.railway.app"
echo "ORDER_SERVICE_URL=https://order-service-production-XXXX.up.railway.app"
echo "WISHLIST_SERVICE_URL=https://wishlist-service-production-XXXX.up.railway.app"
echo "REVIEW_SERVICE_URL=https://review-service-production-XXXX.up.railway.app"
echo "CONTACT_SERVICE_URL=https://contact-service-production-XXXX.up.railway.app"
echo ""

read -p "¿Deseas configurar las URLs ahora? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "Ingresa las URLs de Railway (copia desde Railway Dashboard > Service > Settings > Domain):"
    echo ""
    
    read -p "USER_SERVICE_URL: " USER_URL
    read -p "ORDER_SERVICE_URL: " ORDER_URL
    read -p "WISHLIST_SERVICE_URL: " WISHLIST_URL
    read -p "REVIEW_SERVICE_URL: " REVIEW_URL
    read -p "CONTACT_SERVICE_URL: " CONTACT_URL
    
    echo ""
    echo "🔧 Configurando variables..."
    
    railway variables --set "USER_SERVICE_URL=$USER_URL"
    railway variables --set "ORDER_SERVICE_URL=$ORDER_URL"
    railway variables --set "WISHLIST_SERVICE_URL=$WISHLIST_URL"
    railway variables --set "REVIEW_SERVICE_URL=$REVIEW_URL"
    railway variables --set "CONTACT_SERVICE_URL=$CONTACT_URL"
    
    echo ""
    echo "✅ URLs configuradas. Railway redesplegará automáticamente."
    echo ""
else
    echo ""
    echo "⚠️  Recuerda configurar las URLs manualmente:"
    echo ""
    echo "railway link --service admin-dashboard-service"
    echo "railway variables --set \"USER_SERVICE_URL=https://...\""
    echo "railway variables --set \"ORDER_SERVICE_URL=https://...\""
    echo "railway variables --set \"WISHLIST_SERVICE_URL=https://...\""
    echo "railway variables --set \"REVIEW_SERVICE_URL=https://...\""
    echo "railway variables --set \"CONTACT_SERVICE_URL=https://...\""
    echo ""
fi

echo ""
echo "🎯 Próximos pasos:"
echo "1. Espera 1-2 minutos para que Railway redesplegue"
echo "2. Verifica: https://admin-dashboard-service-production.up.railway.app"
echo "3. Todos los servicios deberían aparecer como HEALTHY"
echo ""
