#!/bin/bash

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║       🔍 VERIFICACIÓN COMPLETA RAILWAY - MONGODB CONFIG       ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Lista de servicios
SERVICES=(
  "API-GATEWAY"
  "AUTH-SERVICE"
  "USER-SERVICE"
  "PRODUCT-SERVICE"
  "ORDER-SERVICE"
  "CART-SERVICE"
  "WISHLIST-SERVICE"
  "REVIEW-SERVICE"
  "CONTACT-SERVICE"
  "PAYMENT-SERVICE"
  "PROMOTION-SERVICE"
  "NOTIFICATION-SERVICE"
)

# Contadores
total=0
operational=0
checking=0

echo "📊 Estado de servicios:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

for service in "${SERVICES[@]}"; do
  total=$((total + 1))
  printf "%-25s" "$service"
  
  # Verificar logs recientes
  logs=$(railway logs --service "$service" --tail 10 2>/dev/null)
  
  if echo "$logs" | grep -q "Request completed.*status.*200"; then
    echo "✅ OPERACIONAL"
    operational=$((operational + 1))
  elif echo "$logs" | grep -qi "starting container\|puerto\|listening"; then
    echo "🔄 INICIANDO"
    checking=$((checking + 1))
  elif echo "$logs" | grep -qi "error.*mongodb\|failed.*mongo"; then
    echo "❌ ERROR MongoDB"
  else
    echo "⏳ VERIFICANDO..."
    checking=$((checking + 1))
  fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📈 Resumen:"
echo "   Total: $total servicios"
echo "   ✅ Operacionales: $operational"
echo "   ⏳ Verificando/Iniciando: $checking"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
