#!/bin/bash

# Script para deployar todos los microservicios en Railway
# Fecha: 2025-12-06
# Requisito: Railway CLI instalado y autenticado (railway login)

set -e  # Exit on error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir con color
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar Railway CLI
if ! command -v railway &> /dev/null; then
    print_error "Railway CLI no está instalado"
    echo "Instalar con: npm install -g @railway/cli"
    exit 1
fi

# Verificar autenticación
if ! railway whoami &> /dev/null; then
    print_error "No estás autenticado en Railway"
    echo "Ejecutar: railway login"
    exit 1
fi

print_info "Iniciando deployment de microservicios..."
echo ""

# Project ID - REEMPLAZAR CON TU PROJECT ID
# Obtener con: railway status
PROJECT_ID="${RAILWAY_PROJECT_ID:-}"

if [ -z "$PROJECT_ID" ]; then
    print_warning "RAILWAY_PROJECT_ID no configurado"
    print_info "Obteniendo project ID del contexto actual..."
    railway link
fi

# Configuración de servicios
# Formato: SERVICE_NAME:PORT:START_PATH:REQUIRES_DATABASE:REQUIRES_REDIS
declare -a SERVICES=(
    "api-gateway:3000:api-gateway:false:false"
    "user-service:3002:user-service:true:true"
    "cart-service:3003:cart-service:true:true"
    "order-service:3004:order-service:true:true"
    "wishlist-service:3005:wishlist-service:true:true"
    "review-service:3006:review-service:true:true"
    "contact-service:3007:contact-service:true:false"
)

# Función para crear y configurar un servicio
deploy_service() {
    local SERVICE_CONFIG=$1
    IFS=':' read -r SERVICE_NAME PORT SERVICE_PATH NEEDS_DB NEEDS_REDIS <<< "$SERVICE_CONFIG"
    
    print_info "=========================================="
    print_info "Deployando: $SERVICE_NAME"
    print_info "=========================================="
    
    # Crear nuevo servicio
    print_info "Creando servicio $SERVICE_NAME..."
    railway service create "$SERVICE_NAME" || print_warning "Servicio ya existe, continuando..."
    
    # Seleccionar servicio
    railway service "$SERVICE_NAME"
    
    # Configurar variables de entorno básicas
    print_info "Configurando variables de entorno..."
    
    railway variables set PORT="$PORT"
    railway variables set NODE_ENV="production"
    railway variables set SERVICE_NAME="$SERVICE_NAME"
    
    # Variables específicas según servicio
    if [ "$NEEDS_DB" = "true" ]; then
        print_info "Configurando DATABASE_URL..."
        # DATABASE_URL debe estar configurada en Railway Dashboard o via --database flag
        print_warning "Verificar que DATABASE_URL esté configurada en Railway Dashboard"
    fi
    
    if [ "$NEEDS_REDIS" = "true" ]; then
        print_info "Configurando REDIS_URL..."
        # REDIS_URL debe estar configurada en Railway Dashboard
        print_warning "Verificar que REDIS_URL esté configurada en Railway Dashboard"
    fi
    
    # Configurar JWT_SECRET para servicios de autenticación/usuario
    if [ "$SERVICE_NAME" = "api-gateway" ] || [ "$SERVICE_NAME" = "user-service" ]; then
        print_info "Configurando JWT_SECRET..."
        if [ -z "${JWT_SECRET:-}" ]; then
            print_warning "JWT_SECRET no configurado en entorno local"
            print_warning "Configurar manualmente en Railway Dashboard"
        else
            railway variables set JWT_SECRET="$JWT_SECRET"
        fi
    fi
    
    # Configurar URLs de servicios para API Gateway
    if [ "$SERVICE_NAME" = "api-gateway" ]; then
        print_info "Configurando service URLs para API Gateway..."
        railway variables set AUTH_SERVICE_URL='${{AUTH-SERVICE.RAILWAY_PRIVATE_DOMAIN}}'
        railway variables set PRODUCT_SERVICE_URL='${{PRODUCT-SERVICE.RAILWAY_PRIVATE_DOMAIN}}'
        railway variables set USER_SERVICE_URL='${{USER-SERVICE.RAILWAY_PRIVATE_DOMAIN}}'
        railway variables set CART_SERVICE_URL='${{CART-SERVICE.RAILWAY_PRIVATE_DOMAIN}}'
        railway variables set ORDER_SERVICE_URL='${{ORDER-SERVICE.RAILWAY_PRIVATE_DOMAIN}}'
        railway variables set WISHLIST_SERVICE_URL='${{WISHLIST-SERVICE.RAILWAY_PRIVATE_DOMAIN}}'
        railway variables set REVIEW_SERVICE_URL='${{REVIEW-SERVICE.RAILWAY_PRIVATE_DOMAIN}}'
        railway variables set CONTACT_SERVICE_URL='${{CONTACT-SERVICE.RAILWAY_PRIVATE_DOMAIN}}'
    fi
    
    # Configurar Root Directory (debe estar VACÍO)
    print_info "Root Directory: EMPTY (acceso completo al monorepo)"
    
    # Configurar Custom Build Command
    BUILD_CMD="cd microservices/shared && npm install --production && cd ../$SERVICE_PATH && npm ci && mkdir -p node_modules/@flores-victoria && cp -r ../shared node_modules/@flores-victoria/"
    print_info "Build Command: $BUILD_CMD"
    # No se puede configurar via CLI, debe hacerse en Dashboard
    
    # Configurar Custom Start Command
    START_CMD="cd microservices/$SERVICE_PATH && node src/server.js"
    railway variables set START_COMMAND="$START_CMD"
    print_info "Start Command: $START_CMD"
    
    # Configurar Healthcheck
    railway variables set RAILWAY_HEALTHCHECK_PATH="/health"
    railway variables set RAILWAY_HEALTHCHECK_TIMEOUT="300"
    
    print_success "$SERVICE_NAME configurado"
    echo ""
}

# Deploy cada servicio
for service_config in "${SERVICES[@]}"; do
    deploy_service "$service_config"
done

print_success "=========================================="
print_success "Todos los servicios configurados!"
print_success "=========================================="
echo ""
print_warning "PASOS MANUALES REQUERIDOS:"
echo "1. Para cada servicio, ir a Railway Dashboard → Service Settings"
echo "2. Configurar 'Custom Build Command':"
echo "   cd microservices/shared && npm install --production && cd ../[SERVICE-NAME] && npm ci && mkdir -p node_modules/@flores-victoria && cp -r ../shared node_modules/@flores-victoria/"
echo ""
echo "3. Configurar 'Root Directory': DEJAR VACÍO"
echo ""
echo "4. Verificar variables de entorno (DATABASE_URL, REDIS_URL, JWT_SECRET)"
echo ""
echo "5. Hacer deploy inicial:"
echo "   railway up --service [SERVICE-NAME]"
echo ""
print_info "Para deployar un servicio específico:"
echo "  railway service [SERVICE-NAME]"
echo "  railway up"
echo ""
print_info "Para ver logs de un servicio:"
echo "  railway logs --service [SERVICE-NAME]"
