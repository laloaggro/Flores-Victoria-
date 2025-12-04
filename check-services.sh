#!/bin/bash

# Script para verificar estado de servicios después del fix

echo "🔍 Verificando servicios en Railway..."
echo ""

services=(
    "PRODUCT-SERVICE"
    "API-GATEWAY"
    "AUTH-SERVICE"
    "CART-SERVICE"
    "WISHLIST-SERVICE"
    "NOTIFICATION-SERVICE"
    "Frontend-v2"
)

echo "Ejecutando: railway status"
echo ""

for service in "${services[@]}"; do
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📦 $service"
    railway service "$service" > /dev/null 2>&1 && railway status 2>&1 | head -5
    echo ""
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "💡 Para ver logs de un servicio específico:"
echo "   railway service NOMBRE_SERVICIO"
echo "   railway logs"
echo ""
