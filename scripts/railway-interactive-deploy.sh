#!/bin/bash

# Script interactivo para guiar el deployment de servicios en Railway
# Autor: Railway Deployment Helper
# Fecha: 2025-12-06

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

print_banner() {
    echo -e "${CYAN}"
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║                                                            ║"
    echo "║           🚀 Railway Deployment Assistant 🚀              ║"
    echo "║                                                            ║"
    echo "║              Flores Victoria Microservices                 ║"
    echo "║                                                            ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

print_step() {
    echo -e "\n${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}📋 PASO $1: $2${NC}"
    echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

ask_continue() {
    echo -e "\n${YELLOW}Presiona ENTER para continuar...${NC}"
    read -r
}

ask_yes_no() {
    local prompt="$1"
    local response
    while true; do
        echo -e "${CYAN}$prompt (y/n): ${NC}"
        read -r response
        case $response in
            [Yy]* ) return 0;;
            [Nn]* ) return 1;;
            * ) echo "Por favor responde y o n.";;
        esac
    done
}

# Banner
clear
print_banner

# Verificar Railway CLI
print_step "1" "Verificando Requisitos"

if ! command -v railway &> /dev/null; then
    print_error "Railway CLI no está instalado"
    echo ""
    print_info "Instalar con:"
    echo -e "${GREEN}npm install -g @railway/cli${NC}"
    exit 1
fi
print_success "Railway CLI instalado"

if ! railway whoami &> /dev/null; then
    print_error "No estás autenticado en Railway"
    echo ""
    print_info "Autenticar con:"
    echo -e "${GREEN}railway login${NC}"
    exit 1
fi
RAILWAY_USER=$(railway whoami)
print_success "Autenticado como: $RAILWAY_USER"

ask_continue

# Mostrar servicios ya deployados
print_step "2" "Estado Actual de Servicios"

print_success "Servicios ya deployados:"
echo "  • auth-service (puerto 3001) ✅"
echo "  • product-service (puerto 3009) ✅"
echo ""
print_warning "Servicios pendientes:"
echo "  • api-gateway (puerto 3000) 🔄"
echo "  • user-service (puerto 3002) 🔄"
echo "  • cart-service (puerto 3003) 🔄"
echo "  • order-service (puerto 3004) 🔄"
echo "  • wishlist-service (puerto 3005) 🔄"
echo "  • review-service (puerto 3006) 🔄"
echo "  • contact-service (puerto 3007) 🔄"

ask_continue

# Selección de servicios
print_step "3" "Selección de Servicios a Deployar"

declare -a SELECTED_SERVICES=()

if ask_yes_no "¿Deployar API Gateway? (RECOMENDADO - crítico para ruteo)"; then
    SELECTED_SERVICES+=("api-gateway")
fi

if ask_yes_no "¿Deployar User Service?"; then
    SELECTED_SERVICES+=("user-service")
fi

if ask_yes_no "¿Deployar Cart Service?"; then
    SELECTED_SERVICES+=("cart-service")
fi

if ask_yes_no "¿Deployar Order Service?"; then
    SELECTED_SERVICES+=("order-service")
fi

if ask_yes_no "¿Deployar Wishlist Service?"; then
    SELECTED_SERVICES+=("wishlist-service")
fi

if ask_yes_no "¿Deployar Review Service?"; then
    SELECTED_SERVICES+=("review-service")
fi

if ask_yes_no "¿Deployar Contact Service?"; then
    SELECTED_SERVICES+=("contact-service")
fi

if [ ${#SELECTED_SERVICES[@]} -eq 0 ]; then
    print_warning "No se seleccionaron servicios para deployar"
    exit 0
fi

echo ""
print_info "Servicios seleccionados:"
for service in "${SELECTED_SERVICES[@]}"; do
    echo "  • $service"
done

ask_continue

# Ejecutar scripts
print_step "4" "Ejecutando Scripts de Configuración"

for service in "${SELECTED_SERVICES[@]}"; do
    echo ""
    print_info "Configurando: $service"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    if [ -f "scripts/railway-deploy-${service}.sh" ]; then
        bash "scripts/railway-deploy-${service}.sh"
        print_success "$service configurado"
    else
        print_error "Script no encontrado: scripts/railway-deploy-${service}.sh"
    fi
    
    echo ""
done

ask_continue

# Instrucciones manuales
print_step "5" "Configuración Manual Requerida"

print_warning "IMPORTANTE: Para cada servicio, debes configurar manualmente en Railway Dashboard:"
echo ""

for service in "${SELECTED_SERVICES[@]}"; do
    echo -e "${CYAN}━━━ $service ━━━${NC}"
    echo "1. Ir a: https://railway.app → Tu Proyecto → $service"
    echo "2. Settings → Root Directory: ${GREEN}DEJAR VACÍO${NC}"
    echo "3. Settings → Custom Build Command:"
    echo -e "   ${GREEN}cd microservices/shared && npm install --production && cd ../$service && npm ci && mkdir -p node_modules/@flores-victoria && cp -r ../shared node_modules/@flores-victoria/${NC}"
    echo ""
done

echo -e "${YELLOW}Variables adicionales según servicio:${NC}"
echo "• ${CYAN}api-gateway${NC}: JWT_SECRET, CORS_ORIGIN"
echo "• ${CYAN}user-service${NC}: DATABASE_URL (PostgreSQL), REDIS_URL, JWT_SECRET"
echo "• ${CYAN}cart/order/wishlist/review/contact${NC}: DATABASE_URL (MongoDB), REDIS_URL"
echo ""

ask_continue

# Deploy final
print_step "6" "Deploy de Servicios"

print_info "Después de configurar en Railway Dashboard, deployar cada servicio:"
echo ""

for service in "${SELECTED_SERVICES[@]}"; do
    echo -e "${CYAN}$service:${NC}"
    echo -e "  ${GREEN}railway service $service${NC}"
    echo -e "  ${GREEN}railway up${NC}"
    echo ""
done

print_warning "O desde Railway Dashboard: Service → Deployments → Trigger Deploy"
echo ""

ask_continue

# Verificación
print_step "7" "Verificación Post-Deployment"

print_info "Una vez deployados los servicios, verificar con:"
echo ""
echo -e "${GREEN}./scripts/railway-verify-all-services.sh${NC}"
echo ""
print_info "O manualmente:"
echo -e "${GREEN}railway logs --service [SERVICE-NAME]${NC}"
echo -e "${GREEN}curl https://[service-url].up.railway.app/health${NC}"
echo ""

# Resumen final
print_banner
print_success "¡Configuración completada!"
echo ""
print_info "Próximos pasos:"
echo "1. Configurar Root Directory y Custom Build Command en Railway Dashboard"
echo "2. Configurar variables de entorno necesarias"
echo "3. Hacer deploy de cada servicio"
echo "4. Verificar health endpoints"
echo ""
print_info "Documentación completa en:"
echo "  • scripts/QUICK_START.md"
echo "  • scripts/RAILWAY_DEPLOYMENT_README.md"
echo ""
print_success "¡Buena suerte con el deployment! 🚀"
