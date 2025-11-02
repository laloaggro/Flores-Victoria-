#!/bin/bash

# ================================================
# 🚀 LOAD TESTING AUTOMATIZADO
# ================================================
# Ejecuta pruebas de carga y analiza resultados

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $1"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# ================================================
# CONFIGURACIÓN
# ================================================

TEST_DIR="./testing"
RESULTS_DIR="$TEST_DIR/results"
DATE=$(date +%Y%m%d_%H%M%S)
REPORT_FILE="$RESULTS_DIR/load-test_$DATE.json"
REPORT_HTML="$RESULTS_DIR/load-test_$DATE.html"

# Crear directorio de resultados
mkdir -p "$RESULTS_DIR"

log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log "🚀 LOAD TESTING - Flores Victoria"
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ================================================
# 1. VERIFICAR REQUISITOS
# ================================================

log "1️⃣  Verificando requisitos..."

# Verificar Artillery
if ! command -v artillery &> /dev/null; then
    log_warning "Artillery no encontrado. Instalando..."
    npm install -g artillery
    npm install -g artillery-plugin-expect
    npm install -g artillery-plugin-metrics-by-endpoint
fi

log_success "Artillery instalado: $(artillery --version)"

# Verificar servicios corriendo
log "Verificando servicios..."

check_service() {
    local url=$1
    local name=$2
    
    if curl -s -o /dev/null -w "%{http_code}" "$url" | grep -q "200\|404"; then
        log_success "$name está corriendo"
        return 0
    else
        log_error "$name NO está corriendo en $url"
        return 1
    fi
}

SERVICES_OK=true

check_service "http://localhost:3000/health" "API Gateway" || SERVICES_OK=false
check_service "http://localhost:3001/health" "Cart Service" || SERVICES_OK=false
check_service "http://localhost:3002/health" "Product Service" || SERVICES_OK=false
check_service "http://localhost:3003/health" "Auth Service" || SERVICES_OK=false

if [ "$SERVICES_OK" = false ]; then
    log_error "Algunos servicios no están corriendo"
    log_warning "Ejecuta: docker-compose up -d"
    exit 1
fi

echo ""

# ================================================
# 2. EJECUTAR LOAD TEST
# ================================================

log "2️⃣  Ejecutando load test..."
log "Configuración: $TEST_DIR/load-test.yml"
log "Resultados: $REPORT_FILE"
echo ""

# Ejecutar Artillery
artillery run \
    --output "$REPORT_FILE" \
    "$TEST_DIR/load-test.yml"

TEST_EXIT_CODE=$?

echo ""
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ================================================
# 3. GENERAR REPORTE HTML
# ================================================

log "3️⃣  Generando reporte HTML..."

artillery report "$REPORT_FILE" --output "$REPORT_HTML"

log_success "Reporte generado: $REPORT_HTML"

# ================================================
# 4. ANALIZAR RESULTADOS
# ================================================

log "4️⃣  Analizando resultados..."
echo ""

# Extraer métricas del JSON
if command -v jq &> /dev/null; then
    
    # Request rate
    TOTAL_REQUESTS=$(jq '.aggregate.counters."http.requests"' "$REPORT_FILE")
    REQUEST_RATE=$(jq '.aggregate.rates."http.request_rate"' "$REPORT_FILE")
    
    # Response times
    P50=$(jq '.aggregate.summaries."http.response_time".p50' "$REPORT_FILE")
    P95=$(jq '.aggregate.summaries."http.response_time".p95' "$REPORT_FILE")
    P99=$(jq '.aggregate.summaries."http.response_time".p99' "$REPORT_FILE")
    MIN=$(jq '.aggregate.summaries."http.response_time".min' "$REPORT_FILE")
    MAX=$(jq '.aggregate.summaries."http.response_time".max' "$REPORT_FILE")
    
    # Errors
    TOTAL_ERRORS=$(jq '.aggregate.counters."errors.total" // 0' "$REPORT_FILE")
    ERROR_RATE=$(echo "scale=2; ($TOTAL_ERRORS / $TOTAL_REQUESTS) * 100" | bc)
    
    # Status codes
    STATUS_200=$(jq '.aggregate.counters."http.codes.200" // 0' "$REPORT_FILE")
    STATUS_400=$(jq '.aggregate.counters."http.codes.400" // 0' "$REPORT_FILE")
    STATUS_500=$(jq '.aggregate.counters."http.codes.500" // 0' "$REPORT_FILE")
    
    # Mostrar resultados
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "${BLUE}📊 MÉTRICAS DE PERFORMANCE${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "🔢 Requests:"
    echo "   Total:        $TOTAL_REQUESTS"
    echo "   Rate:         $REQUEST_RATE req/s"
    echo ""
    echo "⏱️  Response Times (ms):"
    echo "   Min:          $MIN ms"
    echo "   P50 (median): $P50 ms"
    echo "   P95:          $P95 ms"
    echo "   P99:          $P99 ms"
    echo "   Max:          $MAX ms"
    echo ""
    echo "❌ Errores:"
    echo "   Total:        $TOTAL_ERRORS"
    echo "   Error rate:   $ERROR_RATE%"
    echo ""
    echo "📈 Status Codes:"
    echo "   2xx:          $STATUS_200"
    echo "   4xx:          $STATUS_400"
    echo "   5xx:          $STATUS_500"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # ================================================
    # 5. VALIDACIÓN DE SLA
    # ================================================
    
    echo ""
    log "5️⃣  Validando SLA targets..."
    echo ""
    
    PASSED=true
    
    # P95 < 500ms
    if (( $(echo "$P95 < 500" | bc -l) )); then
        log_success "P95: $P95 ms < 500 ms ✓"
    else
        log_error "P95: $P95 ms >= 500 ms ✗"
        PASSED=false
    fi
    
    # Error rate < 1%
    if (( $(echo "$ERROR_RATE < 1" | bc -l) )); then
        log_success "Error rate: $ERROR_RATE% < 1% ✓"
    else
        log_error "Error rate: $ERROR_RATE% >= 1% ✗"
        PASSED=false
    fi
    
    # Request rate > 50 req/s
    if (( $(echo "$REQUEST_RATE > 50" | bc -l) )); then
        log_success "Request rate: $REQUEST_RATE req/s > 50 req/s ✓"
    else
        log_warning "Request rate: $REQUEST_RATE req/s < 50 req/s"
    fi
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    if [ "$PASSED" = true ]; then
        log_success "✅ TODOS LOS SLA TARGETS CUMPLIDOS"
    else
        log_error "❌ ALGUNOS SLA TARGETS NO CUMPLIDOS"
    fi
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
else
    log_warning "jq no instalado. Instalar para análisis detallado: sudo apt install jq"
fi

# ================================================
# 6. RECOMENDACIONES
# ================================================

echo ""
log "6️⃣  Recomendaciones..."
echo ""

if (( $(echo "$P95 > 400" | bc -l) )); then
    echo "⚠️  P95 alto (>400ms). Considerar:"
    echo "   - Optimizar queries de base de datos"
    echo "   - Agregar índices faltantes"
    echo "   - Aumentar cache TTL"
    echo "   - Revisar N+1 queries"
fi

if (( $(echo "$ERROR_RATE > 0.5" | bc -l) )); then
    echo "⚠️  Error rate elevado. Revisar:"
    echo "   - Logs de servicios"
    echo "   - Timeouts de conexión"
    echo "   - Rate limiting configurado"
    echo "   - Errores de validación"
fi

if [ "$STATUS_500" -gt 0 ]; then
    echo "❌ Errores 5xx detectados. Acción urgente:"
    echo "   - Revisar logs: docker-compose logs"
    echo "   - Verificar servicios: docker-compose ps"
    echo "   - Check database connections"
fi

# ================================================
# RESUMEN FINAL
# ================================================

echo ""
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log_success "LOAD TEST COMPLETADO"
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
log "📁 Archivos generados:"
log "   • JSON:  $REPORT_FILE"
log "   • HTML:  $REPORT_HTML"
echo ""
log "📊 Ver reporte:"
log "   open $REPORT_HTML"
echo ""
log "🔍 Comandos útiles:"
log "   • Ver resultados anteriores: ls -lh $RESULTS_DIR"
log "   • Comparar tests: artillery compare <file1> <file2>"
log "   • Limpiar resultados: rm -rf $RESULTS_DIR/*.json"
echo ""
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

exit $TEST_EXIT_CODE
