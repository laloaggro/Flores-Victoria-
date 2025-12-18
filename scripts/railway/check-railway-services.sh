#!/bin/bash

echo "╔════════════════════════════════════════════════════════════════════════════╗"
echo "║                  🚂 ESTADO DE SERVICIOS EN RAILWAY                         ║"
echo "╚════════════════════════════════════════════════════════════════════════════╝"
echo ""

# Servicios a verificar
services=(
  "auth-service"
  "user-service"
  "order-service"
  "payment-service"
  "notification-service"
  "product-service"
  "cart-service"
  "wishlist-service"
  "review-service"
  "contact-service"
  "promotion-service"
)

echo "Consultando servicios en Railway..."
echo ""

for service in "${services[@]}"; do
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "📦 $service"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  
  # Intentar obtener el dominio del servicio
  railway service $service 2>&1 > /dev/null
  if [ $? -eq 0 ]; then
    domain=$(railway variables 2>/dev/null | grep "RAILWAY_PRIVATE_DOMAIN" | awk -F '│' '{print $3}' | xargs)
    status=$(railway status 2>&1)
    
    if [[ $status == *"Active"* ]] || [[ $status == *"Success"* ]]; then
      echo "   ✅ ACTIVO"
    elif [[ $status == *"Building"* ]]; then
      echo "   🔨 CONSTRUYENDO"
    elif [[ $status == *"Failed"* ]] || [[ $status == *"Error"* ]]; then
      echo "   ❌ ERROR"
    else
      echo "   ⏳ CONFIGURADO (dominio: $domain)"
    fi
  else
    echo "   ⚠️  NO ENCONTRADO EN RAILWAY"
  fi
  echo ""
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ Verificación completada"
echo ""
