#!/bin/bash

echo "╔════════════════════════════════════════════════════════════════════════════╗"
echo "║              🚂 CHEQUEO DETALLADO DE RAILWAY - COMPLETO                    ║"
echo "╚════════════════════════════════════════════════════════════════════════════╝"
echo ""

services=(
  "AUTH-SERVICE"
  "USER-SERVICE"
  "PAYMENT-SERVICE"
  "ORDER-SERVICE"
  "NOTIFICATION-SERVICE"
  "PRODUCT-SERVICE"
  "CART-SERVICE"
  "WISHLIST-SERVICE"
  "REVIEW-SERVICE"
  "CONTACT-SERVICE"
  "PROMOTION-SERVICE"
)

echo "📊 ESTADO DE LOS 11 MICROSERVICIOS:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

active_count=0
error_count=0
building_count=0

for service in "${services[@]}"; do
  railway service "$service" 2>&1 > /dev/null
  if [ $? -eq 0 ]; then
    # Obtener dominio privado
    domain=$(railway variables 2>/dev/null | grep "RAILWAY_PRIVATE_DOMAIN" | awk -F '│' '{print $3}' | xargs)
    
    # Obtener estado del último despliegue
    status=$(railway status 2>&1)
    
    echo "📦 $service"
    
    if [[ $status == *"Active"* ]] || [[ $status == *"Success"* ]]; then
      echo "   ✅ ACTIVO"
      ((active_count++))
    elif [[ $status == *"Building"* ]] || [[ $status == *"Deploying"* ]]; then
      echo "   🔨 CONSTRUYENDO"
      ((building_count++))
    elif [[ $status == *"Failed"* ]] || [[ $status == *"Error"* ]] || [[ $status == *"Crashed"* ]]; then
      echo "   ❌ ERROR/FALLIDO"
      ((error_count++))
    else
      echo "   ⏳ CONFIGURADO"
    fi
    
    if [ ! -z "$domain" ]; then
      echo "   📍 $domain"
    fi
    echo ""
  fi
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📈 RESUMEN:"
echo "   ✅ Activos: $active_count/11"
echo "   🔨 Construyendo: $building_count/11"
echo "   ❌ Errores: $error_count/11"
echo ""

if [ $active_count -eq 11 ]; then
  echo "🎉 ¡TODOS LOS MICROSERVICIOS ESTÁN ACTIVOS!"
  echo "   Siguiente paso: Desplegar API-GATEWAY"
elif [ $((active_count + building_count)) -eq 11 ]; then
  echo "⏳ Algunos servicios aún están construyendo..."
  echo "   Espera unos minutos y vuelve a verificar"
else
  echo "⚠️  Hay servicios que requieren atención"
  echo "   Revisa los logs con: railway service [NOMBRE] && railway logs"
fi
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
