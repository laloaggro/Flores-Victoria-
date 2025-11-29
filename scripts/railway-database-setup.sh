#!/bin/bash
# ==========================================
# RAILWAY DATABASE SETUP AUTOMATION
# Configuración automática de PostgreSQL y MongoDB en Railway
# ==========================================

set -e

echo "🚀 Iniciando configuración de bases de datos en Railway..."
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ==========================================
# 1. VERIFICAR RAILWAY CLI
# ==========================================
echo -e "${BLUE}📋 Paso 1: Verificando Railway CLI...${NC}"
if ! command -v railway &> /dev/null; then
    echo -e "${RED}❌ Railway CLI no encontrado${NC}"
    echo "Instala Railway CLI: npm i -g @railway/cli"
    exit 1
fi
echo -e "${GREEN}✅ Railway CLI instalado${NC}"
echo ""

# ==========================================
# 2. VERIFICAR AUTENTICACIÓN
# ==========================================
echo -e "${BLUE}📋 Paso 2: Verificando autenticación...${NC}"
if ! railway whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  No autenticado. Ejecuta: railway login${NC}"
    exit 1
fi
RAILWAY_USER=$(railway whoami 2>/dev/null | head -n 1)
echo -e "${GREEN}✅ Autenticado como: ${RAILWAY_USER}${NC}"
echo ""

# ==========================================
# 3. LISTAR SERVICIOS ACTUALES
# ==========================================
echo -e "${BLUE}📋 Paso 3: Listando servicios existentes...${NC}"
echo ""
railway service list
echo ""

# ==========================================
# 4. CREAR POSTGRESQL DATABASE
# ==========================================
echo -e "${BLUE}📋 Paso 4: Configurando PostgreSQL...${NC}"
echo ""
echo "¿Deseas crear un nuevo servicio PostgreSQL? (s/n)"
read -r CREATE_POSTGRES

if [ "$CREATE_POSTGRES" = "s" ]; then
    echo "Creando PostgreSQL service..."
    railway service create postgres-db --template postgres
    
    echo ""
    echo -e "${GREEN}✅ PostgreSQL creado${NC}"
    echo -e "${YELLOW}📝 Nota: Railway generará automáticamente DATABASE_URL${NC}"
    echo ""
else
    echo -e "${YELLOW}⏭️  Saltando creación de PostgreSQL${NC}"
fi

# ==========================================
# 5. CREAR MONGODB DATABASE
# ==========================================
echo -e "${BLUE}📋 Paso 5: Configurando MongoDB...${NC}"
echo ""
echo "¿Deseas crear un nuevo servicio MongoDB? (s/n)"
read -r CREATE_MONGO

if [ "$CREATE_MONGO" = "s" ]; then
    echo "Creando MongoDB service..."
    railway service create mongodb --template mongodb
    
    echo ""
    echo -e "${GREEN}✅ MongoDB creado${NC}"
    echo -e "${YELLOW}📝 Nota: Railway generará automáticamente MONGODB_URI${NC}"
    echo ""
else
    echo -e "${YELLOW}⏭️  Saltando creación de MongoDB${NC}"
fi

# ==========================================
# 6. INICIALIZAR POSTGRESQL
# ==========================================
echo -e "${BLUE}📋 Paso 6: ¿Deseas inicializar PostgreSQL con el schema? (s/n)${NC}"
read -r INIT_POSTGRES

if [ "$INIT_POSTGRES" = "s" ]; then
    if [ -f "database/init.sql" ]; then
        echo "Ejecutando init.sql en PostgreSQL..."
        echo -e "${YELLOW}⚠️  Necesitas ejecutar manualmente:${NC}"
        echo ""
        echo "1. Ve a Railway Dashboard → PostgreSQL service"
        echo "2. Abre la pestaña 'Data'"
        echo "3. Copia y pega el contenido de database/init.sql"
        echo "4. Ejecuta el script"
        echo ""
        echo "Presiona ENTER cuando hayas terminado..."
        read -r
        echo -e "${GREEN}✅ PostgreSQL inicializado${NC}"
    else
        echo -e "${RED}❌ Archivo database/init.sql no encontrado${NC}"
    fi
fi

# ==========================================
# 7. CONFIGURAR VARIABLES DE ENTORNO
# ==========================================
echo ""
echo -e "${BLUE}📋 Paso 7: Configurando variables de entorno...${NC}"
echo ""
echo "Selecciona el servicio a configurar:"
echo "1) AUTH-SERVICE"
echo "2) USER-SERVICE"
echo "3) PRODUCT-SERVICE"
echo "4) ORDER-SERVICE"
echo "5) Todos los servicios PostgreSQL"
echo "6) Todos los servicios MongoDB"
echo "0) Saltar"
read -r SERVICE_OPTION

case $SERVICE_OPTION in
    1)
        echo "Configurando AUTH-SERVICE..."
        railway service select AUTH-SERVICE
        echo "Ingresa DATABASE_URL de PostgreSQL:"
        read -r DATABASE_URL
        railway variables set DATABASE_URL="$DATABASE_URL"
        railway variables set JWT_SECRET="160da292488e84465f84cd7e9da18aaaa7776517b7c30b75b37903de828dcffb"
        echo -e "${GREEN}✅ AUTH-SERVICE configurado${NC}"
        ;;
    2)
        echo "Configurando USER-SERVICE..."
        railway service select USER-SERVICE
        echo "Ingresa DATABASE_URL de PostgreSQL:"
        read -r DATABASE_URL
        railway variables set DATABASE_URL="$DATABASE_URL"
        echo -e "${GREEN}✅ USER-SERVICE configurado${NC}"
        ;;
    3)
        echo "Configurando PRODUCT-SERVICE..."
        railway service select PRODUCT-SERVICE
        echo "Ingresa MONGODB_URI:"
        read -r MONGODB_URI
        railway variables set MONGODB_URI="$MONGODB_URI"
        railway variables set PRODUCT_SERVICE_MONGODB_URI="$MONGODB_URI"
        echo -e "${GREEN}✅ PRODUCT-SERVICE configurado${NC}"
        ;;
    4)
        echo "Configurando ORDER-SERVICE..."
        railway service select ORDER-SERVICE
        echo "Ingresa DATABASE_URL de PostgreSQL:"
        read -r DATABASE_URL
        railway variables set DATABASE_URL="$DATABASE_URL"
        echo -e "${GREEN}✅ ORDER-SERVICE configurado${NC}"
        ;;
    5)
        echo "Configurando todos los servicios PostgreSQL..."
        echo "Ingresa DATABASE_URL de PostgreSQL:"
        read -r DATABASE_URL
        
        POSTGRES_SERVICES=("AUTH-SERVICE" "USER-SERVICE" "ORDER-SERVICE")
        for service in "${POSTGRES_SERVICES[@]}"; do
            echo "Configurando $service..."
            railway service select "$service"
            railway variables set DATABASE_URL="$DATABASE_URL"
            if [ "$service" = "AUTH-SERVICE" ]; then
                railway variables set JWT_SECRET="160da292488e84465f84cd7e9da18aaaa7776517b7c30b75b37903de828dcffb"
            fi
        done
        echo -e "${GREEN}✅ Todos los servicios PostgreSQL configurados${NC}"
        ;;
    6)
        echo "Configurando todos los servicios MongoDB..."
        echo "Ingresa MONGODB_URI:"
        read -r MONGODB_URI
        
        MONGO_SERVICES=("PRODUCT-SERVICE" "REVIEW-SERVICE" "CART-SERVICE" "WISHLIST-SERVICE")
        for service in "${MONGO_SERVICES[@]}"; do
            echo "Configurando $service..."
            railway service select "$service"
            railway variables set MONGODB_URI="$MONGODB_URI"
        done
        echo -e "${GREEN}✅ Todos los servicios MongoDB configurados${NC}"
        ;;
    0)
        echo -e "${YELLOW}⏭️  Saltando configuración de variables${NC}"
        ;;
    *)
        echo -e "${RED}❌ Opción inválida${NC}"
        ;;
esac

# ==========================================
# 8. VERIFICAR SERVICIOS
# ==========================================
echo ""
echo -e "${BLUE}📋 Paso 8: Verificando estado de servicios...${NC}"
echo ""

# Crear archivo temporal para verificación
TEMP_CHECK_FILE="/tmp/railway-health-check.sh"
cat > "$TEMP_CHECK_FILE" << 'EOF'
#!/bin/bash
API_URL="https://api-gateway-production-949b.up.railway.app"

echo "🏥 Verificando salud de servicios..."
echo ""

# Health check del API Gateway
echo "1. API Gateway Health:"
curl -s "$API_URL/health" | jq . || echo "❌ Error"
echo ""

# Auth Service
echo "2. Auth Service:"
curl -s "$API_URL/auth/health" | jq . || echo "❌ Error"
echo ""

# User Service
echo "3. User Service:"
curl -s "$API_URL/api/users/health" | jq . || echo "❌ Error"
echo ""

# Product Service
echo "4. Product Service:"
curl -s "$API_URL/api/products/health" | jq . || echo "❌ Error"
echo ""

# Order Service
echo "5. Order Service:"
curl -s "$API_URL/api/orders/health" | jq . || echo "❌ Error"
echo ""

echo "✅ Verificación completa"
EOF

chmod +x "$TEMP_CHECK_FILE"

echo "¿Deseas ejecutar verificación de salud de servicios? (s/n)"
read -r RUN_HEALTH_CHECK

if [ "$RUN_HEALTH_CHECK" = "s" ]; then
    bash "$TEMP_CHECK_FILE"
fi

# ==========================================
# 9. RESUMEN FINAL
# ==========================================
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✅ CONFIGURACIÓN COMPLETADA              ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}📊 Resumen:${NC}"
echo ""
echo "✅ Railway CLI verificado"
echo "✅ Autenticación confirmada"
if [ "$CREATE_POSTGRES" = "s" ]; then
    echo "✅ PostgreSQL creado"
fi
if [ "$CREATE_MONGO" = "s" ]; then
    echo "✅ MongoDB creado"
fi
if [ "$SERVICE_OPTION" != "0" ]; then
    echo "✅ Variables de entorno configuradas"
fi
echo ""
echo -e "${YELLOW}📝 Próximos pasos:${NC}"
echo ""
echo "1. Verifica que todos los servicios estén desplegados"
echo "2. Revisa los logs de cada servicio en Railway Dashboard"
echo "3. Prueba los endpoints desde el frontend"
echo ""
echo -e "${BLUE}🔗 Enlaces útiles:${NC}"
echo "  • API Gateway: https://api-gateway-production-949b.up.railway.app"
echo "  • Railway Dashboard: https://railway.app"
echo "  • Documentación: RAILWAY_ACTION_PLAN.md"
echo ""
echo -e "${GREEN}¡Listo para producción! 🚀${NC}"
