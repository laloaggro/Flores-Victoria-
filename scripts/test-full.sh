#!/bin/bash
# Script de validación exhaustiva con métricas y reportes
# Valida frontend, backend, base de datos, APIs y genera reporte completo

set +e  # Continuar en caso de errores

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
NC='\033[0m' # No Color

# Contadores
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0
WARNINGS=0

# Array para almacenar resultados
declare -a RESULTS
declare -a TIMINGS

# Función para medir tiempo
measure_time() {
    START=$(date +%s%N)
    eval "$1" > /dev/null 2>&1
    STATUS=$?
    END=$(date +%s%N)
    ELAPSED=$(( ($END - $START) / 1000000 ))  # Convertir a ms
    echo "$ELAPSED"
    return $STATUS
}

# Función de test
test_endpoint() {
    local NAME="$1"
    local URL="$2"
    local METHOD="${3:-GET}"
    local DATA="${4:-}"
    local EXPECTED_STATUS="${5:-200}"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if [ "$METHOD" = "POST" ] && [ -n "$DATA" ]; then
        TIME=$(measure_time "curl -sf -X POST '$URL' -H 'Content-Type: application/json' -d '$DATA'")
        RESPONSE=$(curl -sf -w "\n%{http_code}" -X POST "$URL" -H 'Content-Type: application/json' -d "$DATA" 2>/dev/null)
    else
        TIME=$(measure_time "curl -sf '$URL'")
        RESPONSE=$(curl -sf -w "\n%{http_code}" "$URL" 2>/dev/null)
    fi
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | head -n-1)
    
    if [ "$HTTP_CODE" = "$EXPECTED_STATUS" ]; then
        PASSED_TESTS=$((PASSED_TESTS + 1))
        printf "${GREEN}✓${NC} %-50s ${CYAN}%5dms${NC}\n" "$NAME" "$TIME"
        RESULTS+=("PASS|$NAME|$TIME|$HTTP_CODE")
        TIMINGS+=("$NAME:$TIME")
        return 0
    else
        FAILED_TESTS=$((FAILED_TESTS + 1))
        printf "${RED}✗${NC} %-50s ${RED}FAIL${NC} (HTTP $HTTP_CODE)\n" "$NAME"
        RESULTS+=("FAIL|$NAME|$TIME|$HTTP_CODE")
        return 1
    fi
}

# Función para verificar contenedor Docker
check_container() {
    local NAME="$1"
    local CONTAINER="$2"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER}$"; then
        PASSED_TESTS=$((PASSED_TESTS + 1))
        STATUS=$(docker inspect --format='{{.State.Status}}' "$CONTAINER" 2>/dev/null)
        UPTIME=$(docker inspect --format='{{.State.StartedAt}}' "$CONTAINER" 2>/dev/null | xargs date +%s -d)
        NOW=$(date +%s)
        UPTIME_SEC=$((NOW - UPTIME))
        printf "${GREEN}✓${NC} %-50s ${CYAN}running (${UPTIME_SEC}s)${NC}\n" "$NAME"
        RESULTS+=("PASS|$NAME|0|running")
        return 0
    else
        FAILED_TESTS=$((FAILED_TESTS + 1))
        printf "${RED}✗${NC} %-50s ${RED}not running${NC}\n" "$NAME"
        RESULTS+=("FAIL|$NAME|0|stopped")
        return 1
    fi
}

# Banner
clear
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║${NC}  ${CYAN}FLORES VICTORIA - SISTEMA DE VALIDACIÓN COMPLETO${NC}       ${BLUE}║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# 1. CONTENEDORES DOCKER
echo -e "${YELLOW}═══ 1. CONTENEDORES DOCKER${NC}"
check_container "API Gateway Container" "flores-victoria-api-gateway-1"
check_container "Auth Service Container" "flores-victoria-auth-service-1"
check_container "Product Service Container" "flores-victoria-product-service-1"
check_container "Frontend Container" "flores-victoria-frontend-1"
check_container "Admin Panel Container" "flores-victoria-admin-panel-1"
echo ""

# 2. HEALTH CHECKS
echo -e "${YELLOW}═══ 2. HEALTH CHECKS${NC}"
test_endpoint "Gateway Health" "$GATEWAY/health"
test_endpoint "Auth Service Health (via Gateway)" "$GATEWAY/api/auth/health"
test_endpoint "Product Service Health (via Gateway)" "$GATEWAY/api/products/health"
test_endpoint "Auth Service Health (Direct)" "$AUTH_SERVICE/api/auth/health"
test_endpoint "Product Service Health (Direct)" "$PRODUCT_SERVICE/health"
echo ""

# 3. ENDPOINTS DE DATOS
echo -e "${YELLOW}═══ 3. ENDPOINTS DE DATOS${NC}"
test_endpoint "Get Products List" "$GATEWAY/api/products"
test_endpoint "Get Products (Direct)" "$PRODUCT_SERVICE/products"
echo ""

# 4. AUTENTICACIÓN
echo -e "${YELLOW}═══ 4. AUTENTICACIÓN${NC}"
LOGIN_DATA='{"email":"admin@flores.local","password":"admin123"}'
test_endpoint "Login Admin" "$GATEWAY/api/auth/login" "POST" "$LOGIN_DATA" "200"

# Extraer token para siguientes tests
TOKEN=$(curl -sf -X POST "$GATEWAY/api/auth/login" \
    -H "Content-Type: application/json" \
    -d "$LOGIN_DATA" 2>/dev/null | jq -r '.data.token // empty')

if [ -n "$TOKEN" ]; then
    # Test de profile con token
    PROFILE_RESPONSE=$(curl -sf -w "\n%{http_code}" "$GATEWAY/api/auth/profile" \
        -H "Authorization: Bearer $TOKEN" 2>/dev/null)
    HTTP_CODE=$(echo "$PROFILE_RESPONSE" | tail -n1)
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    if [ "$HTTP_CODE" = "200" ]; then
        PASSED_TESTS=$((PASSED_TESTS + 1))
        ROLE=$(echo "$PROFILE_RESPONSE" | head -n-1 | jq -r '.data.user.role // empty')
        printf "${GREEN}✓${NC} %-50s ${CYAN}role: $ROLE${NC}\n" "Get Profile with Token"
        RESULTS+=("PASS|Get Profile with Token|0|$HTTP_CODE")
    else
        FAILED_TESTS=$((FAILED_TESTS + 1))
        printf "${RED}✗${NC} %-50s ${RED}FAIL${NC} (HTTP $HTTP_CODE)\n" "Get Profile with Token"
        RESULTS+=("FAIL|Get Profile with Token|0|$HTTP_CODE")
    fi
fi
echo ""

# 5. FRONTEND - PÁGINAS HTML
echo -e "${YELLOW}═══ 5. FRONTEND - PÁGINAS${NC}"
test_endpoint "Index Page" "$FRONTEND/"
test_endpoint "Products Page" "$FRONTEND/pages/products.html"
test_endpoint "Login Page" "$FRONTEND/pages/login.html"
test_endpoint "Register Page" "$FRONTEND/pages/register.html"
test_endpoint "About Page" "$FRONTEND/pages/about.html"
test_endpoint "Contact Page" "$FRONTEND/pages/contact.html"
test_endpoint "Profile Page" "$FRONTEND/pages/profile.html"
test_endpoint "Cart Page" "$FRONTEND/pages/cart.html"
echo ""

# 6. FRONTEND - ASSETS JAVASCRIPT
echo -e "${YELLOW}═══ 6. FRONTEND - JAVASCRIPT${NC}"
test_endpoint "main.js" "$FRONTEND/js/main.js"
test_endpoint "api.js (config)" "$FRONTEND/js/config/api.js"
test_endpoint "httpClient.js" "$FRONTEND/js/utils/httpClient.js"
test_endpoint "http.js" "$FRONTEND/js/utils/http.js"
test_endpoint "utils.js" "$FRONTEND/js/components/utils/utils.js"
test_endpoint "auth.js" "$FRONTEND/js/components/utils/auth.js"
test_endpoint "Products.js (component)" "$FRONTEND/js/components/product/Products.js"
echo ""

# 7. FRONTEND - ASSETS CSS
echo -e "${YELLOW}═══ 7. FRONTEND - CSS${NC}"
test_endpoint "style.css" "$FRONTEND/css/style.css"
test_endpoint "base.css" "$FRONTEND/css/base.css"
test_endpoint "fixes.css" "$FRONTEND/css/fixes.css"
test_endpoint "social-auth.css" "$FRONTEND/css/social-auth.css"
echo ""

# 8. FRONTEND - IMÁGENES
echo -e "${YELLOW}═══ 8. FRONTEND - IMÁGENES${NC}"
test_endpoint "Logo" "$FRONTEND/images/logo.png"
test_endpoint "Placeholder SVG" "$FRONTEND/images/placeholder.svg"
test_endpoint "Hero Background" "$FRONTEND/images/hero-bg.jpg"
test_endpoint "Category: Bouquets" "$FRONTEND/images/categories/bouquets.jpg"
test_endpoint "Product: Arrangements" "$FRONTEND/images/products/arrangements.jpg"
echo ""

# 9. ADMIN PANEL
echo -e "${YELLOW}═══ 9. ADMIN PANEL${NC}"
test_endpoint "Admin Panel Home" "$ADMIN_PANEL/"
echo ""

# 10. MÉTRICAS Y ESTADÍSTICAS
echo -e "${YELLOW}═══ 10. MÉTRICAS DE RENDIMIENTO${NC}"

# Calcular promedios
if [ ${#TIMINGS[@]} -gt 0 ]; then
    TOTAL_TIME=0
    MAX_TIME=0
    MIN_TIME=99999
    
    for timing in "${TIMINGS[@]}"; do
        TIME=$(echo "$timing" | cut -d: -f2)
        TOTAL_TIME=$((TOTAL_TIME + TIME))
        [ $TIME -gt $MAX_TIME ] && MAX_TIME=$TIME
        [ $TIME -lt $MIN_TIME ] && MIN_TIME=$TIME
    done
    
    AVG_TIME=$((TOTAL_TIME / ${#TIMINGS[@]}))
    
    printf "  Tiempo promedio: ${CYAN}%dms${NC}\n" "$AVG_TIME"
    printf "  Tiempo mínimo:   ${GREEN}%dms${NC}\n" "$MIN_TIME"
    printf "  Tiempo máximo:   ${YELLOW}%dms${NC}\n" "$MAX_TIME"
fi
echo ""

# REPORTE FINAL
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║${NC}  ${CYAN}REPORTE FINAL${NC}                                           ${BLUE}║${NC}"
echo -e "${BLUE}╠════════════════════════════════════════════════════════════╣${NC}"
printf "${BLUE}║${NC}  Total de pruebas: %-39s ${BLUE}║${NC}\n" "$TOTAL_TESTS"
printf "${BLUE}║${NC}  ${GREEN}Exitosas: %-46s${NC} ${BLUE}║${NC}\n" "$PASSED_TESTS"
printf "${BLUE}║${NC}  ${RED}Fallidas: %-46s${NC} ${BLUE}║${NC}\n" "$FAILED_TESTS"

# Calcular porcentaje
if [ $TOTAL_TESTS -gt 0 ]; then
    SUCCESS_RATE=$((PASSED_TESTS * 100 / TOTAL_TESTS))
    printf "${BLUE}║${NC}  Tasa de éxito: ${CYAN}%-39s${NC} ${BLUE}║${NC}\n" "$SUCCESS_RATE%"
fi

echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Estado general
if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}✓ TODOS LOS TESTS PASARON${NC}"
    EXIT_CODE=0
else
    echo -e "${RED}✗ ALGUNOS TESTS FALLARON${NC}"
    EXIT_CODE=1
fi

echo ""
echo -e "${CYAN}URLs de acceso rápido:${NC}"
echo -e "  Frontend:     ${BLUE}$FRONTEND${NC}"
echo -e "  Login:        ${BLUE}$FRONTEND/pages/login.html${NC}"
echo -e "  Productos:    ${BLUE}$FRONTEND/pages/products.html${NC}"
echo -e "  Admin Panel:  ${BLUE}$ADMIN_PANEL${NC}"
echo ""

# Guardar reporte JSON
REPORT_FILE="/tmp/flores-victoria-test-report.json"
{
    echo "{"
    echo "  \"timestamp\": \"$(date -Iseconds)\","
    echo "  \"total_tests\": $TOTAL_TESTS,"
    echo "  \"passed\": $PASSED_TESTS,"
    echo "  \"failed\": $FAILED_TESTS,"
    echo "  \"success_rate\": $SUCCESS_RATE,"
    echo "  \"results\": ["
    
    FIRST=true
    for result in "${RESULTS[@]}"; do
        STATUS=$(echo "$result" | cut -d'|' -f1)
        NAME=$(echo "$result" | cut -d'|' -f2)
        TIME=$(echo "$result" | cut -d'|' -f3)
        CODE=$(echo "$result" | cut -d'|' -f4)
        
        [ "$FIRST" = false ] && echo ","
        FIRST=false
        
        echo -n "    {\"status\": \"$STATUS\", \"name\": \"$NAME\", \"time_ms\": $TIME, \"http_code\": \"$CODE\"}"
    done
    
    echo ""
    echo "  ]"
    echo "}"
} > "$REPORT_FILE"

echo -e "${CYAN}Reporte JSON guardado en:${NC} $REPORT_FILE"
echo ""

exit $EXIT_CODE
