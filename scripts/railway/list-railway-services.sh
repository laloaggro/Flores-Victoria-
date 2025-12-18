#!/bin/bash

echo "╔════════════════════════════════════════════════════════════════════════════╗"
echo "║            🚂 SERVICIOS DISPONIBLES EN RAILWAY CLI                         ║"
echo "╚════════════════════════════════════════════════════════════════════════════╝"
echo ""

# Probar nombres comunes que usa Railway
services=(
  "PAYMENT-SERVICE"
  "AUTH-SERVICE"
  "USER-SERVICE"
  "ORDER-SERVICE"
  "NOTIFICATION-SERVICE"
  "PRODUCT-SERVICE"
  "CART-SERVICE"
  "WISHLIST-SERVICE"
  "REVIEW-SERVICE"
  "CONTACT-SERVICE"
  "PROMOTION-SERVICE"
  "Postgres"
  "MongoDB"
  "Redis"
)

echo "🔍 Buscando servicios activos..."
echo ""

for service in "${services[@]}"; do
  result=$(railway service "$service" 2>&1)
  
  if [[ $result == *"Linked service"* ]]; then
    echo "✅ $service - ENCONTRADO"
    
    # Obtener el dominio si es posible
    domain=$(railway variables 2>/dev/null | grep "RAILWAY_PRIVATE_DOMAIN" | awk -F '│' '{print $3}' | xargs)
    if [ ! -z "$domain" ]; then
      echo "   📍 Dominio: $domain"
    fi
    echo ""
  fi
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
