#!/bin/bash

# Script para configurar variables de entorno en Railway
# Uso: ./scripts/railway-configure.sh

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo "════════════════════════════════════════════════════════"
echo "🚀 Configurador Automático de Variables - Railway"
echo "════════════════════════════════════════════════════════"
echo ""

# Verificar que railway CLI esté disponible
if ! command -v railway &> /dev/null; then
    echo -e "${RED}✗ Railway CLI no encontrado${NC}"
    echo "Instalar con: npm install -g @railway/cli"
    exit 1
fi

echo -e "${GREEN}✓ Railway CLI encontrado${NC}"
echo ""

# Preguntar por las credenciales de bases de datos
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Configuración de Bases de Datos"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Por favor ingresa las credenciales de PostgreSQL:"
read -p "Host PostgreSQL (ej: containers-us-west-xxx.railway.app): " PGHOST
read -p "Puerto PostgreSQL (ej: 7890): " PGPORT
read -p "Usuario PostgreSQL (ej: postgres): " PGUSER
read -sp "Password PostgreSQL: " PGPASSWORD
echo ""
echo ""

echo "Por favor ingresa las credenciales de MongoDB:"
read -p "Host MongoDB (ej: containers-us-west-xxx.railway.app): " MONGOHOST
read -p "Puerto MongoDB (ej: 7891): " MONGOPORT
read -p "Usuario MongoDB (ej: mongo): " MONGOUSER
read -sp "Password MongoDB: " MONGOPASSWORD
echo ""
echo ""

# Preguntar por Redis (opcional)
read -p "¿Deseas configurar Redis? (s/n): " CONFIGURE_REDIS
if [[ $CONFIGURE_REDIS == "s" || $CONFIGURE_REDIS == "S" ]]; then
    read -p "Host Redis: " REDISHOST
    read -p "Puerto Redis: " REDISPORT
    read -sp "Password Redis: " REDISPASSWORD
    echo ""
    REDIS_URL="redis://:${REDISPASSWORD}@${REDISHOST}:${REDISPORT}"
fi
echo ""

# JWT Secret
JWT_SECRET="160da292488e84465f84cd7e9da18aaaa7776517b7c30b75b37903de828dcffb"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 Configurando servicios..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Función para configurar un servicio
configure_service() {
    local service_name=$1
    local port=$2
    local db_type=$3  # postgres, mongodb, o none
    local db_name=$4
    
    echo -e "${CYAN}Configurando ${service_name}...${NC}"
    
    # Variables base
    railway variables set NODE_ENV=production --service "$service_name" 2>/dev/null || true
    railway variables set PORT="$port" --service "$service_name" 2>/dev/null || true
    
    # Configurar base de datos según tipo
    if [ "$db_type" == "postgres" ]; then
        local DATABASE_URL="postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}:${PGPORT}/${db_name}"
        railway variables set DATABASE_URL="$DATABASE_URL" --service "$service_name" 2>/dev/null || true
        railway variables set PGHOST="$PGHOST" --service "$service_name" 2>/dev/null || true
        railway variables set PGPORT="$PGPORT" --service "$service_name" 2>/dev/null || true
        railway variables set PGDATABASE="$db_name" --service "$service_name" 2>/dev/null || true
        railway variables set PGUSER="$PGUSER" --service "$service_name" 2>/dev/null || true
        railway variables set PGPASSWORD="$PGPASSWORD" --service "$service_name" 2>/dev/null || true
        echo "  ✓ PostgreSQL configurado ($db_name)"
    elif [ "$db_type" == "mongodb" ]; then
        local MONGODB_URI="mongodb://${MONGOUSER}:${MONGOPASSWORD}@${MONGOHOST}:${MONGOPORT}/${db_name}"
        railway variables set MONGODB_URI="$MONGODB_URI" --service "$service_name" 2>/dev/null || true
        echo "  ✓ MongoDB configurado ($db_name)"
    fi
    
    echo -e "${GREEN}  ✓ ${service_name} configurado${NC}"
    echo ""
}

# 1. AUTH-SERVICE
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
configure_service "AUTH-SERVICE" 3001 "postgres" "flores_auth"
railway variables set JWT_SECRET="$JWT_SECRET" --service "AUTH-SERVICE" 2>/dev/null || true
railway variables set JWT_EXPIRES_IN="7d" --service "AUTH-SERVICE" 2>/dev/null || true
railway variables set JWT_REFRESH_EXPIRES_IN="30d" --service "AUTH-SERVICE" 2>/dev/null || true
railway variables set RATE_LIMIT_WINDOW_MS=900000 --service "AUTH-SERVICE" 2>/dev/null || true
railway variables set RATE_LIMIT_MAX=100 --service "AUTH-SERVICE" 2>/dev/null || true
echo "  ✓ JWT y rate limiting configurado"
echo ""

# 2. USER-SERVICE
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
configure_service "USER-SERVICE" 3003 "postgres" "flores_users"
railway variables set DB_DIALECT=postgres --service "USER-SERVICE" 2>/dev/null || true

# 3. PRODUCT-SERVICE
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
configure_service "PRODUCT-SERVICE" 3009 "mongodb" "flores_products"
PRODUCT_MONGODB_URI="mongodb://${MONGOUSER}:${MONGOPASSWORD}@${MONGOHOST}:${MONGOPORT}/flores_products"
railway variables set PRODUCT_SERVICE_MONGODB_URI="$PRODUCT_MONGODB_URI" --service "PRODUCT-SERVICE" 2>/dev/null || true

# 4. ORDER-SERVICE
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
configure_service "ORDER-SERVICE" 3004 "postgres" "flores_orders"
railway variables set PRODUCT_SERVICE_URL='${{PRODUCT-SERVICE.RAILWAY_PRIVATE_DOMAIN}}' --service "ORDER-SERVICE" 2>/dev/null || true
railway variables set USER_SERVICE_URL='${{USER-SERVICE.RAILWAY_PRIVATE_DOMAIN}}' --service "ORDER-SERVICE" 2>/dev/null || true
railway variables set PAYMENT_SERVICE_URL='${{PAYMENT-SERVICE.RAILWAY_PRIVATE_DOMAIN}}' --service "ORDER-SERVICE" 2>/dev/null || true

# 5. CART-SERVICE
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
configure_service "CART-SERVICE" 3005 "none" ""
if [[ $CONFIGURE_REDIS == "s" || $CONFIGURE_REDIS == "S" ]]; then
    railway variables set REDIS_URL="$REDIS_URL" --service "CART-SERVICE" 2>/dev/null || true
    echo "  ✓ Redis configurado"
fi
railway variables set PRODUCT_SERVICE_URL='${{PRODUCT-SERVICE.RAILWAY_PRIVATE_DOMAIN}}' --service "CART-SERVICE" 2>/dev/null || true
railway variables set USER_SERVICE_URL='${{USER-SERVICE.RAILWAY_PRIVATE_DOMAIN}}' --service "CART-SERVICE" 2>/dev/null || true

# 6. WISHLIST-SERVICE
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
configure_service "WISHLIST-SERVICE" 3006 "postgres" "flores_wishlist"
railway variables set PRODUCT_SERVICE_URL='${{PRODUCT-SERVICE.RAILWAY_PRIVATE_DOMAIN}}' --service "WISHLIST-SERVICE" 2>/dev/null || true
railway variables set USER_SERVICE_URL='${{USER-SERVICE.RAILWAY_PRIVATE_DOMAIN}}' --service "WISHLIST-SERVICE" 2>/dev/null || true

# 7. REVIEW-SERVICE
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
configure_service "REVIEW-SERVICE" 3007 "mongodb" "flores_reviews"
railway variables set PRODUCT_SERVICE_URL='${{PRODUCT-SERVICE.RAILWAY_PRIVATE_DOMAIN}}' --service "REVIEW-SERVICE" 2>/dev/null || true
railway variables set USER_SERVICE_URL='${{USER-SERVICE.RAILWAY_PRIVATE_DOMAIN}}' --service "REVIEW-SERVICE" 2>/dev/null || true

# 8. CONTACT-SERVICE
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
configure_service "CONTACT-SERVICE" 3008 "postgres" "flores_contacts"

# 9. PAYMENT-SERVICE
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
configure_service "PAYMENT-SERVICE" 3018 "postgres" "flores_payments"
railway variables set ORDER_SERVICE_URL='${{ORDER-SERVICE.RAILWAY_PRIVATE_DOMAIN}}' --service "PAYMENT-SERVICE" 2>/dev/null || true

# 10. PROMOTION-SERVICE
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
configure_service "PROMOTION-SERVICE" 3019 "postgres" "flores_promotions"
railway variables set PRODUCT_SERVICE_URL='${{PRODUCT-SERVICE.RAILWAY_PRIVATE_DOMAIN}}' --service "PROMOTION-SERVICE" 2>/dev/null || true

# 11. NOTIFICATION-SERVICE
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
configure_service "NOTIFICATION-SERVICE" 3020 "postgres" "flores_notifications"

echo "════════════════════════════════════════════════════════"
echo -e "${GREEN}✅ Configuración completada${NC}"
echo "════════════════════════════════════════════════════════"
echo ""
echo "Los servicios se redesplegarán automáticamente."
echo "Espera 3-5 minutos y luego ejecuta:"
echo ""
echo -e "${CYAN}  ./scripts/railway-health-check.sh${NC}"
echo ""
echo "Para verificar que todos los servicios están funcionando."
echo ""

# Preguntar si desea ver los logs
read -p "¿Deseas ver los logs del primer servicio (AUTH-SERVICE)? (s/n): " VIEW_LOGS
if [[ $VIEW_LOGS == "s" || $VIEW_LOGS == "S" ]]; then
    echo ""
    echo "Mostrando logs de AUTH-SERVICE (Ctrl+C para salir):"
    railway logs --service AUTH-SERVICE
fi
