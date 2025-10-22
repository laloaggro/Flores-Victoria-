#!/bin/bash
# Dashboard interactivo en tiempo real para monitorear servicios
# Actualiza en un intervalo configurable (por defecto 5s)

# Intervalo de refresco (segundos)
# Prioridad: argumento -i/--interval > variable de entorno DASHBOARD_INTERVAL > valor por defecto
REFRESH_INTERVAL_DEFAULT=5
REFRESH_INTERVAL="${DASHBOARD_INTERVAL:-$REFRESH_INTERVAL_DEFAULT}"

# Parseo simple de argumentos
while [[ $# -gt 0 ]]; do
    case "$1" in
        -i|--interval)
            shift
            if [[ "$1" =~ ^[0-9]+$ ]]; then
                REFRESH_INTERVAL="$1"
            fi
            ;;
    esac
    shift || break
done

GATEWAY="http://localhost:3000"
FRONTEND="http://localhost:5173"
AUTH_SERVICE="http://localhost:3001"
PRODUCT_SERVICE="http://localhost:3009"
ADMIN_PANEL="http://localhost:3010"

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'
BOLD='\033[1m'

# Función para verificar endpoint
check_endpoint() {
    local URL="$1"
    local TIMEOUT="${2:-2}"
    
    if curl -sf --max-time "$TIMEOUT" "$URL" > /dev/null 2>&1; then
        echo "UP"
    else
        echo "DOWN"
    fi
}

# Función para obtener tiempo de respuesta
get_response_time() {
    local URL="$1"
    START=$(date +%s%N)
    curl -sf --max-time 2 "$URL" > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        END=$(date +%s%N)
        ELAPSED=$(( ($END - $START) / 1000000 ))
        echo "${ELAPSED}ms"
    else
        echo "N/A"
    fi
}

# Función para verificar contenedor
check_container() {
    local CONTAINER="$1"
    if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER}$"; then
        echo "RUNNING"
    else
        echo "STOPPED"
    fi
}

# Función para obtener memoria del contenedor
get_container_memory() {
    local CONTAINER="$1"
    if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER}$"; then
        docker stats --no-stream --format "{{.MemUsage}}" "$CONTAINER" 2>/dev/null | cut -d'/' -f1 | xargs
    else
        echo "N/A"
    fi
}

# Función para obtener CPU del contenedor
get_container_cpu() {
    local CONTAINER="$1"
    if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER}$"; then
        docker stats --no-stream --format "{{.CPUPerc}}" "$CONTAINER" 2>/dev/null
    else
        echo "N/A"
    fi
}

# Función para mostrar dashboard
show_dashboard() {
    clear
    
    echo -e "${BLUE}╔══════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║${NC}  ${BOLD}${CYAN}FLORES VICTORIA - DASHBOARD EN TIEMPO REAL${NC}                          ${BLUE}║${NC}"
    echo -e "${BLUE}║${NC}  ${YELLOW}Última actualización: $(date '+%H:%M:%S') · Intervalo: ${REFRESH_INTERVAL}s${NC}              ${BLUE}║${NC}"
    echo -e "${BLUE}╚══════════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    # CONTENEDORES DOCKER
    echo -e "${BOLD}${YELLOW}━━━ CONTENEDORES DOCKER ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    # API Gateway
    GATEWAY_STATUS=$(check_container "flores-victoria-api-gateway-1")
    GATEWAY_CPU=$(get_container_cpu "flores-victoria-api-gateway-1")
    GATEWAY_MEM=$(get_container_memory "flores-victoria-api-gateway-1")
    
    if [ "$GATEWAY_STATUS" = "RUNNING" ]; then
        echo -e "  ${GREEN}●${NC} API Gateway          ${GREEN}$GATEWAY_STATUS${NC}     CPU: ${CYAN}$GATEWAY_CPU${NC}  MEM: ${CYAN}$GATEWAY_MEM${NC}"
    else
        echo -e "  ${RED}●${NC} API Gateway          ${RED}$GATEWAY_STATUS${NC}"
    fi
    
    # Auth Service
    AUTH_STATUS=$(check_container "flores-victoria-auth-service-1")
    AUTH_CPU=$(get_container_cpu "flores-victoria-auth-service-1")
    AUTH_MEM=$(get_container_memory "flores-victoria-auth-service-1")
    
    if [ "$AUTH_STATUS" = "RUNNING" ]; then
        echo -e "  ${GREEN}●${NC} Auth Service         ${GREEN}$AUTH_STATUS${NC}     CPU: ${CYAN}$AUTH_CPU${NC}  MEM: ${CYAN}$AUTH_MEM${NC}"
    else
        echo -e "  ${RED}●${NC} Auth Service         ${RED}$AUTH_STATUS${NC}"
    fi
    
    # Product Service
    PRODUCT_STATUS=$(check_container "flores-victoria-product-service-1")
    PRODUCT_CPU=$(get_container_cpu "flores-victoria-product-service-1")
    PRODUCT_MEM=$(get_container_memory "flores-victoria-product-service-1")
    
    if [ "$PRODUCT_STATUS" = "RUNNING" ]; then
        echo -e "  ${GREEN}●${NC} Product Service      ${GREEN}$PRODUCT_STATUS${NC}     CPU: ${CYAN}$PRODUCT_CPU${NC}  MEM: ${CYAN}$PRODUCT_MEM${NC}"
    else
        echo -e "  ${RED}●${NC} Product Service      ${RED}$PRODUCT_STATUS${NC}"
    fi
    
    # Frontend
    FRONTEND_STATUS=$(check_container "flores-victoria-frontend-1")
    FRONTEND_CPU=$(get_container_cpu "flores-victoria-frontend-1")
    FRONTEND_MEM=$(get_container_memory "flores-victoria-frontend-1")
    
    if [ "$FRONTEND_STATUS" = "RUNNING" ]; then
        echo -e "  ${GREEN}●${NC} Frontend             ${GREEN}$FRONTEND_STATUS${NC}     CPU: ${CYAN}$FRONTEND_CPU${NC}  MEM: ${CYAN}$FRONTEND_MEM${NC}"
    else
        echo -e "  ${RED}●${NC} Frontend             ${RED}$FRONTEND_STATUS${NC}"
    fi
    
    # Admin Panel
    ADMIN_STATUS=$(check_container "flores-victoria-admin-panel-1")
    ADMIN_CPU=$(get_container_cpu "flores-victoria-admin-panel-1")
    ADMIN_MEM=$(get_container_memory "flores-victoria-admin-panel-1")
    
    if [ "$ADMIN_STATUS" = "RUNNING" ]; then
        echo -e "  ${GREEN}●${NC} Admin Panel          ${GREEN}$ADMIN_STATUS${NC}     CPU: ${CYAN}$ADMIN_CPU${NC}  MEM: ${CYAN}$ADMIN_MEM${NC}"
    else
        echo -e "  ${RED}●${NC} Admin Panel          ${RED}$ADMIN_STATUS${NC}"
    fi
    
    echo ""
    
    # HEALTH CHECKS
    echo -e "${BOLD}${YELLOW}━━━ HEALTH CHECKS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    GATEWAY_HEALTH=$(check_endpoint "$GATEWAY/health")
    GATEWAY_TIME=$(get_response_time "$GATEWAY/health")
    if [ "$GATEWAY_HEALTH" = "UP" ]; then
        echo -e "  ${GREEN}✓${NC} Gateway Health              ${GREEN}$GATEWAY_HEALTH${NC}       ${CYAN}$GATEWAY_TIME${NC}"
    else
        echo -e "  ${RED}✗${NC} Gateway Health              ${RED}$GATEWAY_HEALTH${NC}"
    fi
    
    AUTH_HEALTH=$(check_endpoint "$GATEWAY/api/auth/health")
    AUTH_TIME=$(get_response_time "$GATEWAY/api/auth/health")
    if [ "$AUTH_HEALTH" = "UP" ]; then
        echo -e "  ${GREEN}✓${NC} Auth Service Health         ${GREEN}$AUTH_HEALTH${NC}       ${CYAN}$AUTH_TIME${NC}"
    else
        echo -e "  ${RED}✗${NC} Auth Service Health         ${RED}$AUTH_HEALTH${NC}"
    fi
    
    PRODUCT_HEALTH=$(check_endpoint "$GATEWAY/api/products/health")
    PRODUCT_TIME=$(get_response_time "$GATEWAY/api/products/health")
    if [ "$PRODUCT_HEALTH" = "UP" ]; then
        echo -e "  ${GREEN}✓${NC} Product Service Health      ${GREEN}$PRODUCT_HEALTH${NC}       ${CYAN}$PRODUCT_TIME${NC}"
    else
        echo -e "  ${RED}✗${NC} Product Service Health      ${RED}$PRODUCT_HEALTH${NC}"
    fi
    
    echo ""
    
    # API ENDPOINTS
    echo -e "${BOLD}${YELLOW}━━━ API ENDPOINTS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    PRODUCTS_STATUS=$(check_endpoint "$GATEWAY/api/products")
    PRODUCTS_TIME=$(get_response_time "$GATEWAY/api/products")
    PRODUCTS_COUNT=$(curl -sf "$GATEWAY/api/products" 2>/dev/null | jq '. | length' 2>/dev/null || echo "?")
    
    if [ "$PRODUCTS_STATUS" = "UP" ]; then
        echo -e "  ${GREEN}✓${NC} GET /api/products           ${GREEN}$PRODUCTS_STATUS${NC}       ${CYAN}$PRODUCTS_TIME${NC}   ${MAGENTA}($PRODUCTS_COUNT items)${NC}"
    else
        echo -e "  ${RED}✗${NC} GET /api/products           ${RED}$PRODUCTS_STATUS${NC}"
    fi
    
    # Test de login
    LOGIN_DATA='{"email":"admin@flores.local","password":"admin123"}'
    LOGIN_RESPONSE=$(curl -sf -X POST "$GATEWAY/api/auth/login" \
        -H "Content-Type: application/json" \
        -d "$LOGIN_DATA" 2>/dev/null)
    
    if [ -n "$LOGIN_RESPONSE" ]; then
        TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.token // empty' 2>/dev/null)
        if [ -n "$TOKEN" ]; then
            echo -e "  ${GREEN}✓${NC} POST /api/auth/login        ${GREEN}UP${NC}         ${MAGENTA}Token OK${NC}"
            
            # Test de profile
            PROFILE=$(curl -sf "$GATEWAY/api/auth/profile" -H "Authorization: Bearer $TOKEN" 2>/dev/null)
            if [ -n "$PROFILE" ]; then
                ROLE=$(echo "$PROFILE" | jq -r '.data.user.role // empty' 2>/dev/null)
                echo -e "  ${GREEN}✓${NC} GET /api/auth/profile       ${GREEN}UP${NC}         ${MAGENTA}Role: $ROLE${NC}"
            else
                echo -e "  ${RED}✗${NC} GET /api/auth/profile       ${RED}DOWN${NC}"
            fi
        else
            echo -e "  ${RED}✗${NC} POST /api/auth/login        ${RED}DOWN${NC}       ${RED}Auth failed${NC}"
        fi
    else
        echo -e "  ${RED}✗${NC} POST /api/auth/login        ${RED}DOWN${NC}"
    fi
    
    echo ""
    
    # FRONTEND
    echo -e "${BOLD}${YELLOW}━━━ FRONTEND ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    INDEX_STATUS=$(check_endpoint "$FRONTEND/")
    INDEX_TIME=$(get_response_time "$FRONTEND/")
    if [ "$INDEX_STATUS" = "UP" ]; then
        echo -e "  ${GREEN}✓${NC} Index Page                  ${GREEN}$INDEX_STATUS${NC}       ${CYAN}$INDEX_TIME${NC}"
    else
        echo -e "  ${RED}✗${NC} Index Page                  ${RED}$INDEX_STATUS${NC}"
    fi
    
    PRODUCTS_PAGE=$(check_endpoint "$FRONTEND/pages/products.html")
    if [ "$PRODUCTS_PAGE" = "UP" ]; then
        echo -e "  ${GREEN}✓${NC} Products Page               ${GREEN}$PRODUCTS_PAGE${NC}"
    else
        echo -e "  ${RED}✗${NC} Products Page               ${RED}$PRODUCTS_PAGE${NC}"
    fi
    
    LOGIN_PAGE=$(check_endpoint "$FRONTEND/pages/login.html")
    if [ "$LOGIN_PAGE" = "UP" ]; then
        echo -e "  ${GREEN}✓${NC} Login Page                  ${GREEN}$LOGIN_PAGE${NC}"
    else
        echo -e "  ${RED}✗${NC} Login Page                  ${RED}$LOGIN_PAGE${NC}"
    fi
    
    # Assets
    MAIN_JS=$(check_endpoint "$FRONTEND/js/main.js")
    API_JS=$(check_endpoint "$FRONTEND/js/config/api.js")
    HTTP_CLIENT=$(check_endpoint "$FRONTEND/js/utils/httpClient.js")
    STYLE_CSS=$(check_endpoint "$FRONTEND/css/style.css")
    
    ASSETS_OK=0
    [ "$MAIN_JS" = "UP" ] && ASSETS_OK=$((ASSETS_OK + 1))
    [ "$API_JS" = "UP" ] && ASSETS_OK=$((ASSETS_OK + 1))
    [ "$HTTP_CLIENT" = "UP" ] && ASSETS_OK=$((ASSETS_OK + 1))
    [ "$STYLE_CSS" = "UP" ] && ASSETS_OK=$((ASSETS_OK + 1))
    
    if [ $ASSETS_OK -eq 4 ]; then
        echo -e "  ${GREEN}✓${NC} Assets (JS/CSS)             ${GREEN}ALL UP${NC}      ${MAGENTA}($ASSETS_OK/4)${NC}"
    else
        echo -e "  ${YELLOW}⚠${NC} Assets (JS/CSS)             ${YELLOW}PARTIAL${NC}    ${YELLOW}($ASSETS_OK/4)${NC}"
    fi
    
    echo ""
    
    # URLS
    echo -e "${BOLD}${CYAN}━━━ ACCESO RÁPIDO ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "  Frontend:     ${BLUE}http://localhost:5173${NC}"
    echo -e "  Login:        ${BLUE}http://localhost:5173/pages/login.html${NC}"
    echo -e "  Productos:    ${BLUE}http://localhost:5173/pages/products.html${NC}"
    echo -e "  Admin Panel:  ${BLUE}http://localhost:3010${NC}"
    echo -e "  API Gateway:  ${BLUE}http://localhost:3000${NC}"
    echo ""
    
    echo -e "${YELLOW}Presiona Ctrl+C para salir${NC}"
}

# Loop principal
trap 'echo -e "\n${CYAN}Dashboard cerrado${NC}"; exit 0' INT

while true; do
    show_dashboard
    sleep "$REFRESH_INTERVAL"
done
