#!/bin/bash

# ============================================================================
# DEPLOYMENT EXPRESS - Flores Victoria (5 minutos)
# ============================================================================
# Este script te da los comandos exactos para copiar/pegar en Railway
# ============================================================================

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║          🚀 DEPLOYMENT EXPRESS - 10 SERVICIOS EN 5 MINUTOS               ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Generar JWT_SECRET si no existe
if [ ! -f .jwt-secret ]; then
    JWT_SECRET=$(openssl rand -hex 32)
    echo "$JWT_SECRET" > .jwt-secret
    echo -e "${GREEN}✅ JWT_SECRET generado y guardado en .jwt-secret${NC}"
else
    JWT_SECRET=$(cat .jwt-secret)
    echo -e "${GREEN}✅ JWT_SECRET cargado desde .jwt-secret${NC}"
fi

echo ""
echo -e "${YELLOW}📋 COPIA ESTE JWT_SECRET PARA TODOS LOS SERVICIOS:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "$JWT_SECRET"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo -e "${BLUE}🎯 PASO 1: Crear 10 servicios en Railway Dashboard${NC}"
echo ""
echo "Abre Railway Dashboard y crea estos servicios (+ New → GitHub Repo):"
echo ""

cat << 'EOF'
1. order-service
   • Dockerfile Path: docker/Dockerfile.order-service
   • Variables:
     DATABASE_URL=${{Postgres.DATABASE_URL}}
     JWT_SECRET=[pegar el de arriba]
     NODE_ENV=production

2. product-service
   • Dockerfile Path: docker/Dockerfile.product-service
   • Variables:
     MONGODB_URI=${{MongoDB.MONGO_URL}}
     JWT_SECRET=[pegar el de arriba]
     NODE_ENV=production

3. cart-service
   • Dockerfile Path: docker/Dockerfile.cart-service
   • Variables:
     REDIS_URL=${{Redis.REDIS_URL}}
     JWT_SECRET=[pegar el de arriba]
     NODE_ENV=production

4. wishlist-service
   • Dockerfile Path: docker/Dockerfile.wishlist-service
   • Variables:
     REDIS_URL=${{Redis.REDIS_URL}}
     JWT_SECRET=[pegar el de arriba]
     NODE_ENV=production

5. payment-service
   • Dockerfile Path: docker/Dockerfile.payment-service
   • Variables:
     DATABASE_URL=${{Postgres.DATABASE_URL}}
     JWT_SECRET=[pegar el de arriba]
     NODE_ENV=production

6. review-service
   • Dockerfile Path: docker/Dockerfile.review-service
   • Variables:
     MONGODB_URI=${{MongoDB.MONGO_URL}}
     JWT_SECRET=[pegar el de arriba]
     NODE_ENV=production

7. contact-service
   • Dockerfile Path: docker/Dockerfile.contact-service
   • Variables:
     MONGODB_URI=${{MongoDB.MONGO_URL}}
     JWT_SECRET=[pegar el de arriba]
     NODE_ENV=production

8. notification-service
   • Dockerfile Path: docker/Dockerfile.notification-service
   • Variables:
     REDIS_URL=${{Redis.REDIS_URL}}
     JWT_SECRET=[pegar el de arriba]
     NODE_ENV=production

9. promotion-service
   • Dockerfile Path: docker/Dockerfile.promotion-service
   • Variables:
     DATABASE_URL=${{Postgres.DATABASE_URL}}
     JWT_SECRET=[pegar el de arriba]
     NODE_ENV=production

10. api-gateway (ÚLTIMO - después de que todos estén activos)
    • Dockerfile Path: docker/Dockerfile.api-gateway
    • Variables:
      JWT_SECRET=[pegar el de arriba]
      NODE_ENV=production
      AUTH_SERVICE_URL=${{auth-service.RAILWAY_PRIVATE_DOMAIN}}
      USER_SERVICE_URL=${{user-service.RAILWAY_PRIVATE_DOMAIN}}
      ORDER_SERVICE_URL=${{order-service.RAILWAY_PRIVATE_DOMAIN}}
      PRODUCT_SERVICE_URL=${{product-service.RAILWAY_PRIVATE_DOMAIN}}
      CART_SERVICE_URL=${{cart-service.RAILWAY_PRIVATE_DOMAIN}}
      WISHLIST_SERVICE_URL=${{wishlist-service.RAILWAY_PRIVATE_DOMAIN}}
      PAYMENT_SERVICE_URL=${{payment-service.RAILWAY_PRIVATE_DOMAIN}}
      REVIEW_SERVICE_URL=${{review-service.RAILWAY_PRIVATE_DOMAIN}}
      CONTACT_SERVICE_URL=${{contact-service.RAILWAY_PRIVATE_DOMAIN}}
      NOTIFICATION_SERVICE_URL=${{notification-service.RAILWAY_PRIVATE_DOMAIN}}
      PROMOTION_SERVICE_URL=${{promotion-service.RAILWAY_PRIVATE_DOMAIN}}

EOF

echo ""
echo -e "${GREEN}🎊 WORKFLOW RÁPIDO:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1. Abre 10 tabs de Railway Dashboard"
echo "2. En cada tab, crea un servicio (+ New → GitHub Repo)"
echo "3. Mientras uno se despliega, configura el siguiente"
echo "4. ⚠️ Deja api-gateway para el FINAL"
echo "5. Los builds tomarán 2-3 min cada uno (en paralelo ~5-8 min total)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${YELLOW}⏱️ TIEMPO ESTIMADO: 5-8 minutos${NC}"
echo ""
