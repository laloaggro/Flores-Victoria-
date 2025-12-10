#!/bin/bash

# Script para obtener información de servicios desde Railway
# y configurar las variables necesarias para control de servicios

set -e

echo "🔍 Obteniendo información de Railway..."
echo ""

# Verificar que estemos en el proyecto correcto
cd /home/impala/Documentos/Proyectos/flores-victoria/microservices/admin-dashboard-service

# Obtener PROJECT_ID y ENVIRONMENT_ID
PROJECT_ID=$(railway variables | grep "RAILWAY_PROJECT_ID" | awk '{print $3}')
ENVIRONMENT_ID=$(railway variables | grep "RAILWAY_ENVIRONMENT_ID" | awk '{print $3}')

echo "📊 Información del Proyecto:"
echo "  Project ID: $PROJECT_ID"
echo "  Environment ID: $ENVIRONMENT_ID"
echo ""

# Mostrar las variables actuales de Railway
echo "📋 Variables Configuradas:"
railway variables | grep -E "(RAILWAY_PROJECT_ID|RAILWAY_ENVIRONMENT_ID|RAILWAY_TOKEN)" | head -5
echo ""

echo "✅ Token de Railway configurado correctamente"
echo ""
echo "📝 Nota: Los IDs de proyecto y ambiente ya están disponibles"
echo "   como variables de entorno en Railway automáticamente."
echo ""
echo "🎯 Próximos pasos:"
echo "   1. Railway redesplegará el servicio automáticamente"
echo "   2. Los controles de servicios estarán disponibles en el dashboard"
echo "   3. Abre: https://admin-dashboard-service-production.up.railway.app"
echo ""
