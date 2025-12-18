#!/bin/bash

# Script para verificar el despliegue de user-service y preparar próximos servicios
# Ejecutar después de configurar Root Directory en Railway Dashboard

echo "╔════════════════════════════════════════════════════════════════════════════╗"
echo "║                                                                            ║"
echo "║              🔍 VERIFICACIÓN DE DESPLIEGUE - USER-SERVICE                 ║"
echo "║                                                                            ║"
echo "╚════════════════════════════════════════════════════════════════════════════╝"
echo ""

# Verificar que estamos en el proyecto correcto
echo "📍 Verificando proyecto Railway..."
railway status 2>&1 | grep -q "Arreglos Victoria"
if [ $? -eq 0 ]; then
    echo "✅ Proyecto: Arreglos Victoria"
else
    echo "⚠️  Advertencia: No se pudo verificar el proyecto"
fi
echo ""

# Obtener logs de user-service
echo "📋 Obteniendo logs de user-service..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
railway logs --service "User Service (Usuario)" --tail 30 2>&1 | tail -20
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Buscar mensajes clave de éxito
echo "🔍 Buscando mensajes clave en logs..."
LOGS=$(railway logs --service "User Service (Usuario)" --tail 50 2>&1)

if echo "$LOGS" | grep -q "PostgreSQL establecida correctamente"; then
    echo "✅ Conexión a PostgreSQL establecida"
else
    echo "❌ No se encontró mensaje de conexión a PostgreSQL"
fi

if echo "$LOGS" | grep -q "Tabla users verificada"; then
    echo "✅ Tabla users verificada"
else
    echo "⚠️  No se encontró mensaje de verificación de tabla"
fi

if echo "$LOGS" | grep -q "corriendo en puerto 3003" || echo "$LOGS" | grep -q "listening on port 3003"; then
    echo "✅ Servicio corriendo en puerto 3003"
else
    echo "❌ No se encontró mensaje de puerto 3003"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Mostrar próximos servicios a desplegar
echo "📦 PRÓXIMOS SERVICIOS A DESPLEGAR (10 restantes)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🗄️  SERVICIOS POSTGRESQL (3):"
echo "   1. order-service       → Root: /microservices, Dockerfile: order-service/Dockerfile"
echo "   2. payment-service     → Root: /microservices, Dockerfile: payment-service/Dockerfile"
echo "   3. promotion-service   → Root: /microservices, Dockerfile: promotion-service/Dockerfile"
echo ""
echo "🍃 SERVICIOS MONGODB (3):"
echo "   4. product-service     → Root: /microservices, Dockerfile: product-service/Dockerfile"
echo "   5. review-service      → Root: /microservices, Dockerfile: review-service/Dockerfile"
echo "   6. contact-service     → Root: /microservices, Dockerfile: contact-service/Dockerfile"
echo ""
echo "⚡ SERVICIOS REDIS (3):"
echo "   7. cart-service        → Root: /microservices, Dockerfile: cart-service/Dockerfile"
echo "   8. wishlist-service    → Root: /microservices, Dockerfile: wishlist-service/Dockerfile"
echo "   9. notification-service → Root: /microservices, Dockerfile: notification-service/Dockerfile"
echo ""
echo "🌐 API GATEWAY (1):"
echo "  10. api-gateway         → Root: /microservices, Dockerfile: api-gateway/Dockerfile"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "💡 NOTA: Todos usan el mismo patrón de configuración que user-service"
echo "         Solo cambia el nombre del servicio en el Dockerfile Path"
echo ""
