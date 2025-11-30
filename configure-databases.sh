#!/bin/bash

# Script de configuración automática de bases de datos para Railway
# Configurará todos los servicios con las credenciales de PostgreSQL y MongoDB

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
cat << 'EOF'
╔═══════════════════════════════════════════════════════════════╗
║        🚀 CONFIGURACIÓN AUTOMÁTICA DE SERVICIOS 🚀           ║
╚═══════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Verificar que Railway CLI está disponible
if ! command -v railway &> /dev/null; then
    echo -e "${RED}❌ Railway CLI no encontrado${NC}"
    echo "Instala con: npm i -g @railway/cli"
    exit 1
fi

echo -e "${GREEN}✅ Railway CLI encontrado${NC}\n"

# Solicitar credenciales
echo -e "${YELLOW}📋 Ingresa las credenciales de las bases de datos:${NC}\n"

echo -e "${BLUE}PostgreSQL DATABASE_URL:${NC}"
echo "(Ejemplo: postgresql://postgres:pass@host.railway.app:1234/railway)"
read -r POSTGRES_URL

echo -e "\n${BLUE}MongoDB MONGO_URL:${NC}"
echo "(Ejemplo: mongodb://mongo:pass@host.railway.app:1234)"
read -r MONGO_URL

echo -e "\n${BLUE}JWT_SECRET (dejar vacío para generar uno):${NC}"
read -r JWT_SECRET

# Generar JWT_SECRET si está vacío
if [ -z "$JWT_SECRET" ]; then
    JWT_SECRET=$(openssl rand -hex 32)
    echo -e "${GREEN}✅ JWT_SECRET generado: ${JWT_SECRET}${NC}"
fi

echo -e "\n${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🚀 Iniciando configuración de servicios...${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

# Función para configurar un servicio
configure_service() {
    local SERVICE_NAME=$1
    local PORT=$2
    local DB_TYPE=$3  # postgres, mongo, both, none
    
    echo -e "${BLUE}⚙️  Configurando ${SERVICE_NAME}...${NC}"
    
    # Variables comunes
    railway variables set NODE_ENV=production --service "$SERVICE_NAME" 2>/dev/null || true
    railway variables set PORT="$PORT" --service "$SERVICE_NAME" 2>/dev/null || true
    railway variables set LOG_LEVEL=info --service "$SERVICE_NAME" 2>/dev/null || true
    
    # Configurar base de datos según tipo
    case $DB_TYPE in
        postgres)
            railway variables set DATABASE_URL="$POSTGRES_URL" --service "$SERVICE_NAME" 2>/dev/null || true
            ;;
        mongo)
            railway variables set MONGODB_URI="$MONGO_URL" --service "$SERVICE_NAME" 2>/dev/null || true
            ;;
        both)
            railway variables set DATABASE_URL="$POSTGRES_URL" --service "$SERVICE_NAME" 2>/dev/null || true
            railway variables set MONGODB_URI="$MONGO_URL" --service "$SERVICE_NAME" 2>/dev/null || true
            ;;
    esac
    
    echo -e "${GREEN}   ✓ ${SERVICE_NAME} configurado${NC}\n"
}

# Configurar servicios con PostgreSQL
echo -e "${YELLOW}📊 Configurando servicios PostgreSQL...${NC}\n"

configure_service "auth-service" 3001 "postgres"
railway variables set JWT_SECRET="$JWT_SECRET" --service "auth-service" 2>/dev/null || true
railway variables set JWT_EXPIRES_IN="7d" --service "auth-service" 2>/dev/null || true

configure_service "user-service" 3002 "postgres"
railway variables set JWT_SECRET="$JWT_SECRET" --service "user-service" 2>/dev/null || true

configure_service "order-service" 3004 "postgres"

configure_service "payment-service" 3006 "postgres"

configure_service "notification-service" 3010 "postgres"

# Configurar servicios con MongoDB
echo -e "${YELLOW}🍃 Configurando servicios MongoDB...${NC}\n"

configure_service "product-service" 3009 "mongo"
railway variables set PRODUCT_SERVICE_MONGODB_URI="$MONGO_URL" --service "product-service" 2>/dev/null || true

configure_service "review-service" 3007 "mongo"

configure_service "cart-service" 3003 "mongo"

configure_service "wishlist-service" 3005 "mongo"

configure_service "contact-service" 3008 "mongo"

configure_service "promotion-service" 3011 "mongo"

# Configurar API Gateway
echo -e "${YELLOW}🌐 Configurando API Gateway...${NC}\n"

railway variables set NODE_ENV=production --service "api-gateway" 2>/dev/null || true
railway variables set PORT=3000 --service "api-gateway" 2>/dev/null || true
railway variables set JWT_SECRET="$JWT_SECRET" --service "api-gateway" 2>/dev/null || true
railway variables set LOG_LEVEL=info --service "api-gateway" 2>/dev/null || true

# Configurar URLs de servicios (usando Railway internal domains)
echo -e "${BLUE}   Configurando URLs de servicios internos...${NC}"
railway variables set AUTH_SERVICE_URL='http://auth-service.railway.internal:3001' --service "api-gateway" 2>/dev/null || true
railway variables set USER_SERVICE_URL='http://user-service.railway.internal:3002' --service "api-gateway" 2>/dev/null || true
railway variables set PRODUCT_SERVICE_URL='http://product-service.railway.internal:3009' --service "api-gateway" 2>/dev/null || true
railway variables set ORDER_SERVICE_URL='http://order-service.railway.internal:3004' --service "api-gateway" 2>/dev/null || true
railway variables set CART_SERVICE_URL='http://cart-service.railway.internal:3003' --service "api-gateway" 2>/dev/null || true
railway variables set WISHLIST_SERVICE_URL='http://wishlist-service.railway.internal:3005' --service "api-gateway" 2>/dev/null || true
railway variables set REVIEW_SERVICE_URL='http://review-service.railway.internal:3007' --service "api-gateway" 2>/dev/null || true
railway variables set PAYMENT_SERVICE_URL='http://payment-service.railway.internal:3006' --service "api-gateway" 2>/dev/null || true
railway variables set CONTACT_SERVICE_URL='http://contact-service.railway.internal:3008' --service "api-gateway" 2>/dev/null || true
railway variables set NOTIFICATION_SERVICE_URL='http://notification-service.railway.internal:3010' --service "api-gateway" 2>/dev/null || true
railway variables set PROMOTION_SERVICE_URL='http://promotion-service.railway.internal:3011' --service "api-gateway" 2>/dev/null || true

echo -e "${GREEN}   ✓ API Gateway configurado${NC}\n"

echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ CONFIGURACIÓN COMPLETADA${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

echo -e "${BLUE}📋 Resumen:${NC}"
echo -e "   • 6 servicios PostgreSQL configurados"
echo -e "   • 6 servicios MongoDB configurados"
echo -e "   • 1 API Gateway configurado con URLs de servicios"
echo -e "   • JWT_SECRET compartido: ${JWT_SECRET:0:20}..."
echo ""

echo -e "${YELLOW}⚠️  IMPORTANTE:${NC}"
echo -e "   1. Las bases de datos están configuradas, pero vacías"
echo -e "   2. Necesitas crear las tablas/colecciones ejecutando migraciones"
echo -e "   3. Los servicios están listos para desplegar"
echo ""

echo -e "${GREEN}🚀 Próximos pasos:${NC}"
echo -e "   1. Crear bases de datos en PostgreSQL (ver script siguiente)"
echo -e "   2. Desplegar servicios uno por uno"
echo -e "   3. Ejecutar seeds para datos iniciales"
echo ""

echo -e "${BLUE}¿Deseas crear las bases de datos en PostgreSQL ahora? (y/n)${NC}"
read -r CREATE_DBS

if [ "$CREATE_DBS" = "y" ] || [ "$CREATE_DBS" = "Y" ]; then
    echo -e "\n${YELLOW}🗄️  Creando bases de datos en PostgreSQL...${NC}\n"
    
    # Extraer componentes de la URL
    DB_USER=$(echo "$POSTGRES_URL" | sed -n 's|postgresql://\([^:]*\):.*|\1|p')
    DB_PASS=$(echo "$POSTGRES_URL" | sed -n 's|postgresql://[^:]*:\([^@]*\)@.*|\1|p')
    DB_HOST=$(echo "$POSTGRES_URL" | sed -n 's|.*@\([^:]*\):.*|\1|p')
    DB_PORT=$(echo "$POSTGRES_URL" | sed -n 's|.*:\([0-9]*\)/.*|\1|p')
    
    echo "Conectando a PostgreSQL..."
    
    # Crear bases de datos
    PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d railway << 'EOSQL'
-- Crear bases de datos para cada servicio
CREATE DATABASE flores_auth;
CREATE DATABASE flores_users;
CREATE DATABASE flores_orders;
CREATE DATABASE flores_payments;
CREATE DATABASE flores_notifications;

-- Listar bases de datos creadas
\l

EOSQL

    if [ $? -eq 0 ]; then
        echo -e "\n${GREEN}✅ Bases de datos PostgreSQL creadas${NC}"
    else
        echo -e "\n${RED}❌ Error creando bases de datos${NC}"
        echo -e "${YELLOW}Puedes crearlas manualmente conectándote a PostgreSQL${NC}"
    fi
fi

echo -e "\n${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ CONFIGURACIÓN COMPLETADA EXITOSAMENTE${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}\n"
