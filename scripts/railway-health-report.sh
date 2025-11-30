#!/bin/bash

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║       🏥 REPORTE DE SALUD - PLATAFORMA FLORES VICTORIA        ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# URLs
API_GATEWAY="https://api-gateway-production-949b.up.railway.app"

echo "📊 VERIFICANDO INFRAESTRUCTURA:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Verificar API Gateway
echo -n "API Gateway: "
status=$(curl -s -o /dev/null -w "%{http_code}" "$API_GATEWAY" 2>/dev/null)
if [ "$status" = "200" ]; then
    echo "✅ OPERACIONAL (HTTP $status)"
else
    echo "❌ ERROR (HTTP $status)"
fi

# Verificar PostgreSQL
echo -n "PostgreSQL:  "
pg_check=$(railway connect Postgres -c "SELECT 1;" 2>&1 | grep -q "1" && echo "OK" || echo "ERROR")
if [ "$pg_check" = "OK" ]; then
    echo "✅ CONECTADO"
else
    echo "⚠️  VERIFICAR CONEXIÓN"
fi

# Contar servicios operacionales
echo ""
echo "📋 SERVICIOS RAILWAY:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

operational=0
total=12

services=("AUTH-SERVICE" "USER-SERVICE" "PRODUCT-SERVICE" "ORDER-SERVICE" 
          "CART-SERVICE" "WISHLIST-SERVICE" "REVIEW-SERVICE" "CONTACT-SERVICE"
          "PAYMENT-SERVICE" "PROMOTION-SERVICE" "NOTIFICATION-SERVICE" "API-GATEWAY")

for service in "${services[@]}"; do
    logs=$(railway logs --service "$service" --tail 5 2>/dev/null)
    if echo "$logs" | grep -q "Request completed.*status.*200"; then
        echo "✅ $service"
        operational=$((operational + 1))
    elif echo "$logs" | grep -qi "starting container\|listening"; then
        echo "🔄 $service (iniciando)"
    else
        echo "⏳ $service"
    fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📈 RESUMEN:"
echo "   Operacionales: $operational/$total servicios"
percentage=$((operational * 100 / total))
echo "   Disponibilidad: $percentage%"
echo ""

if [ $operational -ge 8 ]; then
    echo "🎉 ESTADO: SISTEMA OPERACIONAL"
elif [ $operational -ge 4 ]; then
    echo "⚠️  ESTADO: PARCIALMENTE OPERACIONAL"
else
    echo "❌ ESTADO: NECESITA ATENCIÓN"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔗 URLs:"
echo "   API Gateway: $API_GATEWAY"
echo "   Railway Dashboard: https://railway.app"
echo ""
