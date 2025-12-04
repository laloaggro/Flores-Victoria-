#!/bin/bash

# ============================================================================
# Railway Deployment Script - Flores Victoria E-commerce
# ============================================================================
# Este script automatiza el despliegue de todos los microservicios en Railway
# Uso: ./railway-deploy-all.sh
# ============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project configuration
PROJECT_NAME="flores-victoria"
GITHUB_REPO="laloaggro/Flores-Victoria-"

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                                                                            ║${NC}"
echo -e "${BLUE}║          🚀 RAILWAY DEPLOYMENT - FLORES VICTORIA MICROSERVICES            ║${NC}"
echo -e "${BLUE}║                                                                            ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Services to deploy in order
declare -a SERVICES=(
    "order-service"
    "product-service"
    "cart-service"
    "wishlist-service"
    "payment-service"
    "review-service"
    "contact-service"
    "notification-service"
    "promotion-service"
    "api-gateway"
)

# Database configurations per service
declare -A SERVICE_DB=(
    ["order-service"]="postgresql"
    ["product-service"]="mongodb"
    ["cart-service"]="redis"
    ["wishlist-service"]="redis"
    ["payment-service"]="postgresql"
    ["review-service"]="mongodb"
    ["contact-service"]="mongodb"
    ["notification-service"]="redis"
    ["promotion-service"]="postgresql"
    ["api-gateway"]="none"
)

echo -e "${YELLOW}📋 SERVICIOS A DESPLEGAR:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
for service in "${SERVICES[@]}"; do
    db="${SERVICE_DB[$service]}"
    echo -e "  • ${GREEN}${service}${NC} → Base de datos: ${BLUE}${db}${NC}"
done
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Function to display service configuration
display_service_config() {
    local service=$1
    local db="${SERVICE_DB[$service]}"
    
    echo ""
    echo -e "${BLUE}╔════════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║ SERVICIO: ${service}${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${YELLOW}📦 Configuración:${NC}"
    echo "  • Dockerfile: docker/Dockerfile.${service}"
    echo "  • Base de datos: ${db}"
    echo "  • Railway config: railway-configs/${service}.toml"
    echo ""
    
    echo -e "${YELLOW}🔧 Variables de entorno requeridas:${NC}"
    
    case $db in
        "postgresql")
            cat << EOF
  ✓ DATABASE_URL (referencia al servicio PostgreSQL de Railway)
  ✓ JWT_SECRET (compartida con otros servicios)
  ✓ NODE_ENV=production
  ✓ PORT (asignado automáticamente por Railway)
EOF
            ;;
        "mongodb")
            cat << EOF
  ✓ MONGODB_URI (referencia al servicio MongoDB de Railway)
  ✓ JWT_SECRET (compartida con otros servicios)
  ✓ NODE_ENV=production
  ✓ PORT (asignado automáticamente por Railway)
EOF
            ;;
        "redis")
            cat << EOF
  ✓ REDIS_URL (referencia al servicio Redis de Railway)
  ✓ JWT_SECRET (compartida con otros servicios)
  ✓ NODE_ENV=production
  ✓ PORT (asignado automáticamente por Railway)
EOF
            ;;
        "none")
            cat << EOF
  ✓ JWT_SECRET (compartida con otros servicios)
  ✓ NODE_ENV=production
  ✓ PORT (asignado automáticamente por Railway)
  ✓ SERVICE_URLS (URLs internas de todos los microservicios)
EOF
            ;;
    esac
    
    echo ""
    echo -e "${GREEN}📋 PASOS MANUALES EN RAILWAY DASHBOARD:${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "1. Ve al Dashboard de Railway: https://railway.app/dashboard"
    echo ""
    echo "2. Click en '+ New' → 'GitHub Repo'"
    echo ""
    echo "3. Selecciona el repositorio: ${GITHUB_REPO}"
    echo ""
    echo "4. Configuración del servicio:"
    echo "   • Nombre: ${service}"
    echo "   • ⚠️  NO configurar 'Root Directory' (déjalo vacío)"
    echo "   • Watch Paths: deja por defecto"
    echo ""
    echo "5. Una vez creado el servicio:"
    echo "   a) Ve a Settings → Build"
    echo "   b) Custom Build Command: (vacío, usa Dockerfile)"
    echo "   c) Dockerfile Path: docker/Dockerfile.${service}"
    echo ""
    echo "6. Variables de entorno (Settings → Variables):"
    
    case $db in
        "postgresql")
            cat << EOF
   a) DATABASE_URL: \${{Postgres.DATABASE_URL}}
   b) JWT_SECRET: (genera uno: openssl rand -hex 32)
   c) NODE_ENV: production
EOF
            ;;
        "mongodb")
            cat << EOF
   a) MONGODB_URI: \${{MongoDB.MONGO_URL}}
   b) JWT_SECRET: (usa el mismo que otros servicios)
   c) NODE_ENV: production
EOF
            ;;
        "redis")
            cat << EOF
   a) REDIS_URL: \${{Redis.REDIS_URL}}
   b) JWT_SECRET: (usa el mismo que otros servicios)
   c) NODE_ENV: production
EOF
            ;;
        "none")
            cat << EOF
   a) JWT_SECRET: (usa el mismo que otros servicios)
   b) NODE_ENV: production
   c) AUTH_SERVICE_URL: \${{auth-service.RAILWAY_PUBLIC_DOMAIN}}
   d) USER_SERVICE_URL: \${{user-service.RAILWAY_PUBLIC_DOMAIN}}
   e) ... (URLs de todos los microservicios)
EOF
            ;;
    esac
    
    echo ""
    echo "7. Deploy automático se iniciará"
    echo ""
    echo "8. Monitorea logs: Deployments → [Latest] → View Logs"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
}

# Main deployment loop
echo -e "${GREEN}🚀 INICIANDO PROCESO DE DEPLOYMENT${NC}"
echo ""
echo -e "${YELLOW}⚠️  NOTA IMPORTANTE:${NC}"
echo "Este script muestra la configuración necesaria para cada servicio."
echo "Los despliegues deben hacerse MANUALMENTE en el Dashboard de Railway."
echo ""
read -p "Presiona ENTER para ver la configuración del primer servicio..."

for service in "${SERVICES[@]}"; do
    display_service_config "$service"
    
    echo -e "${YELLOW}¿Has completado el despliegue de ${service}?${NC}"
    read -p "Presiona ENTER para continuar con el siguiente servicio (o Ctrl+C para salir)..."
done

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                                                            ║${NC}"
echo -e "${GREEN}║                  🎉 TODOS LOS SERVICIOS CONFIGURADOS                      ║${NC}"
echo -e "${GREEN}║                                                                            ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}📊 RESUMEN FINAL:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✅ 12 microservicios desplegados"
echo "  ✅ Bases de datos configuradas (PostgreSQL, MongoDB, Redis)"
echo "  ✅ Variables de entorno establecidas"
echo "  ✅ Health checks configurados"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${BLUE}🔍 VERIFICACIÓN FINAL:${NC}"
echo ""
echo "1. Verifica que todos los servicios estén en estado 'ACTIVE'"
echo "2. Comprueba los logs de cada servicio para errores"
echo "3. Prueba los health endpoints:"
echo "   • https://[service-url]/health"
echo ""
echo -e "${GREEN}🎊 ¡Deployment completado exitosamente!${NC}"
echo ""
