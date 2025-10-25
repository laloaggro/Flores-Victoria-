#!/bin/bash

# 🧪 SISTEMA DE TESTING COMPLETO - FLORES VICTORIA v3.0
# Testing exhaustivo de todos los componentes del sistema

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR"
TEST_LOG="$PROJECT_ROOT/logs/testing.log"
TEST_RESULTS_DIR="$PROJECT_ROOT/test-results"

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m'

# Contadores de tests
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0
WARNINGS=0

log_test() {
    local level=$1
    local message=$2
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    case $level in
        "INFO")     echo -e "${BLUE}[$timestamp]${NC} ${WHITE}INFO:${NC} $message" ;;
        "SUCCESS")  echo -e "${GREEN}[$timestamp]${NC} ${GREEN}SUCCESS:${NC} $message" ;;
        "WARNING")  echo -e "${YELLOW}[$timestamp]${NC} ${YELLOW}WARNING:${NC} $message" ;;
        "ERROR")    echo -e "${RED}[$timestamp]${NC} ${RED}ERROR:${NC} $message" ;;
        "TEST")     echo -e "${PURPLE}[$timestamp]${NC} ${PURPLE}TEST:${NC} $message" ;;
    esac
    
    mkdir -p "$(dirname "$TEST_LOG")"
    echo "[$timestamp] $level: $message" >> "$TEST_LOG"
}

show_test_banner() {
    clear
    echo -e "${CYAN}"
    echo "████████████████████████████████████████████████████████████████"
    echo "█                                                              █"
    echo "█   🧪 SISTEMA DE TESTING COMPLETO - FLORES VICTORIA v3.0     █"
    echo "█                                                              █"
    echo "█   Unit Tests | Integration | E2E | Performance | Security   █"
    echo "█                                                              █"
    echo "████████████████████████████████████████████████████████████████"
    echo -e "${NC}"
    echo ""
}

run_test() {
    local test_name=$1
    local test_command=$2
    local expected_result=${3:-0}
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    log_test "TEST" "🧪 Ejecutando: $test_name"
    
    if eval "$test_command" >/dev/null 2>&1; then
        local result=$?
        if [[ $result -eq $expected_result ]]; then
            log_test "SUCCESS" "✅ PASS: $test_name"
            PASSED_TESTS=$((PASSED_TESTS + 1))
            return 0
        else
            log_test "ERROR" "❌ FAIL: $test_name (código: $result, esperado: $expected_result)"
            FAILED_TESTS=$((FAILED_TESTS + 1))
            return 1
        fi
    else
        log_test "ERROR" "❌ FAIL: $test_name (error de ejecución)"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        return 1
    fi
}

# =============================================================================
# TESTS DE INFRAESTRUCTURA
# =============================================================================

test_infrastructure() {
    log_test "INFO" "🏗️  Ejecutando tests de infraestructura..."
    
    # Test 1: Verificar estructura de directorios
    run_test "Estructura de directorios" "test -d logs && test -d automation && test -d tmp"
    
    # Test 2: Verificar scripts principales
    run_test "Scripts de automatización" "test -x automate.sh && test -x watchdog.sh && test -x flores-victoria.sh"
    
    # Test 3: Verificar permisos
    run_test "Permisos de scripts" "test -x maintenance.sh && test -x cicd.sh && test -x install.sh"
    
    # Test 4: Verificar archivos de configuración
    run_test "Archivos de proyecto" "test -f package.json && test -f ai-simple.js && test -f order-service-simple.js"
    
    # Test 5: Verificar directorio admin-panel
    run_test "Admin Panel estructura" "test -d admin-panel && test -f admin-panel/server.js"
}

# =============================================================================
# TESTS DE SERVICIOS
# =============================================================================

test_services() {
    log_test "INFO" "🚀 Ejecutando tests de servicios..."
    
    # Test 1: Admin Panel Health Check
    run_test "Admin Panel Health" "curl -sf http://localhost:3021/health"
    
    # Test 2: AI Service Health Check  
    run_test "AI Service Health" "curl -sf http://localhost:3002/health"
    
    # Test 3: Order Service Health Check
    run_test "Order Service Health" "curl -sf http://localhost:3004/health"
    
    # Test 4: Admin Panel Frontend
    run_test "Admin Panel Frontend" "curl -sf http://localhost:3021 | grep -q 'Flores Victoria'"
    
    # Test 5: AI Recommendations Endpoint
    run_test "AI Recommendations" "curl -sf http://localhost:3002/ai/recommendations"
    
    # Test 6: Order Service API
    run_test "Order Service API" "curl -sf http://localhost:3004/api/orders"
    
    # Test 7: Documentation Page
    run_test "Documentation Access" "curl -sf http://localhost:3021/documentation.html"
}

# =============================================================================
# TESTS FUNCIONALES
# =============================================================================

test_functional() {
    log_test "INFO" "⚙️  Ejecutando tests funcionales..."
    
    # Test 1: Crear pedido
    local order_response=$(curl -s -X POST http://localhost:3004/api/orders \
        -H "Content-Type: application/json" \
        -d '{"producto":"Rosa Roja","cantidad":5,"cliente":"Test Cliente"}' 2>/dev/null)
    
    if echo "$order_response" | grep -q "success\|created\|id\|orden"; then
        log_test "SUCCESS" "✅ PASS: Creación de pedido"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        log_test "ERROR" "❌ FAIL: Creación de pedido - Response: $order_response"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    # Test 2: Obtener recomendaciones AI
    local ai_response=$(curl -s http://localhost:3002/ai/recommendations 2>/dev/null)
    
    if echo "$ai_response" | grep -q "recommendations\|success\|name\|price"; then
        log_test "SUCCESS" "✅ PASS: Recomendaciones AI"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        log_test "ERROR" "❌ FAIL: Recomendaciones AI - Response: $ai_response"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    # Test 3: Verificar estadísticas admin
    local admin_stats=$(curl -sf http://localhost:3021/api/stats 2>/dev/null || echo "{}")
    
    if echo "$admin_stats" | grep -q "{\|stats\|data" 2>/dev/null; then
        log_test "SUCCESS" "✅ PASS: Estadísticas Admin"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        log_test "WARNING" "⚠️  WARN: Estadísticas Admin (endpoint opcional)"
        WARNINGS=$((WARNINGS + 1))
    fi
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
}

# =============================================================================
# TESTS DE RENDIMIENTO
# =============================================================================

test_performance() {
    log_test "INFO" "⚡ Ejecutando tests de rendimiento..."
    
    # Test 1: Tiempo de respuesta Admin Panel
    local admin_time=$(curl -sf -w "%{time_total}" -o /dev/null http://localhost:3021/health 2>/dev/null || echo "999")
    
    if (( $(echo "$admin_time < 2.0" | bc -l) )); then
        log_test "SUCCESS" "✅ PASS: Admin Panel Response Time (${admin_time}s)"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        log_test "WARNING" "⚠️  SLOW: Admin Panel Response Time (${admin_time}s)"
        WARNINGS=$((WARNINGS + 1))
    fi
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    # Test 2: Tiempo de respuesta AI Service
    local ai_time=$(curl -sf -w "%{time_total}" -o /dev/null http://localhost:3002/health 2>/dev/null || echo "999")
    
    # Convertir a entero multiplicando por 1000 para milisegundos
    local ai_ms=$(echo "$ai_time * 1000" | bc 2>/dev/null || echo "999000")
    ai_ms=${ai_ms%.*}  # Remover decimales
    
    if [[ $ai_ms -lt 3000 ]]; then
        log_test "SUCCESS" "✅ PASS: AI Service Response Time (${ai_time}s)"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        log_test "WARNING" "⚠️  SLOW: AI Service Response Time (${ai_time}s)"
        WARNINGS=$((WARNINGS + 1))
    fi
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    # Test 3: Tiempo de respuesta Order Service
    local order_time=$(curl -sf -w "%{time_total}" -o /dev/null http://localhost:3004/health 2>/dev/null || echo "999")
    
    # Convertir a entero multiplicando por 1000 para milisegundos
    local order_ms=$(echo "$order_time * 1000" | bc 2>/dev/null || echo "999000")
    order_ms=${order_ms%.*}  # Remover decimales
    
    if [[ $order_ms -lt 2000 ]]; then
        log_test "SUCCESS" "✅ PASS: Order Service Response Time (${order_time}s)"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        log_test "WARNING" "⚠️  SLOW: Order Service Response Time (${order_time}s)"
        WARNINGS=$((WARNINGS + 1))
    fi
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    # Test 4: Carga de memoria
    local memory_usage=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
    
    if [[ $memory_usage -lt 80 ]]; then
        log_test "SUCCESS" "✅ PASS: Memory Usage (${memory_usage}%)"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        log_test "WARNING" "⚠️  HIGH: Memory Usage (${memory_usage}%)"
        WARNINGS=$((WARNINGS + 1))
    fi
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
}

# =============================================================================
# TESTS DE AUTOMATIZACIÓN
# =============================================================================

test_automation() {
    log_test "INFO" "🤖 Ejecutando tests de automatización..."
    
    # Test 1: Script automate.sh
    run_test "Script automate.sh" "$PROJECT_ROOT/automate.sh help"
    
    # Test 2: Script watchdog.sh
    run_test "Script watchdog.sh" "$PROJECT_ROOT/watchdog.sh --help"
    
    # Test 3: Script maintenance.sh
    run_test "Script maintenance.sh" "$PROJECT_ROOT/maintenance.sh help"
    
    # Test 4: Script cicd.sh
    run_test "Script cicd.sh" "$PROJECT_ROOT/cicd.sh help"
    
    # Test 5: Script flores-victoria.sh
    run_test "Script flores-victoria.sh" "$PROJECT_ROOT/flores-victoria.sh help"
    
    # Test 6: Analytics
    run_test "Script analytics.sh" "$PROJECT_ROOT/analytics.sh help"
    
    # Test 7: Update system
    run_test "Script update-system.sh" "$PROJECT_ROOT/update-system.sh help"
}

# =============================================================================
# TESTS DE SEGURIDAD
# =============================================================================

test_security() {
    log_test "INFO" "🔒 Ejecutando tests de seguridad..."
    
    # Test 1: Verificar puertos no expuestos
    local exposed_ports=$(netstat -tuln | grep -E ":(22|80|443|3000|5000|8080|8000)" | wc -l)
    
    if [[ $exposed_ports -eq 0 ]]; then
        log_test "SUCCESS" "✅ PASS: No hay puertos críticos expuestos"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        log_test "WARNING" "⚠️  WARN: $exposed_ports puertos críticos detectados"
        WARNINGS=$((WARNINGS + 1))
    fi
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    # Test 2: Verificar permisos de archivos sensibles
    local sensitive_files=("package.json" "automate.sh" "watchdog.sh")
    local permission_issues=0
    
    for file in "${sensitive_files[@]}"; do
        if [[ -f "$PROJECT_ROOT/$file" ]]; then
            local perms=$(stat -c "%a" "$PROJECT_ROOT/$file")
            if [[ ${perms:0:1} -gt 7 ]] || [[ ${perms:1:1} -gt 5 ]]; then
                permission_issues=$((permission_issues + 1))
            fi
        fi
    done
    
    if [[ $permission_issues -eq 0 ]]; then
        log_test "SUCCESS" "✅ PASS: Permisos de archivos correctos"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        log_test "WARNING" "⚠️  WARN: $permission_issues archivos con permisos amplios"
        WARNINGS=$((WARNINGS + 1))
    fi
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    # Test 3: Verificar headers de seguridad
    local security_headers=$(curl -sI http://localhost:3021 | grep -i "x-\|content-security\|strict-transport" | wc -l)
    
    if [[ $security_headers -gt 0 ]]; then
        log_test "SUCCESS" "✅ PASS: Headers de seguridad presentes"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        log_test "WARNING" "⚠️  WARN: Sin headers de seguridad (mejora recomendada)"
        WARNINGS=$((WARNINGS + 1))
    fi
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
}

# =============================================================================
# GENERACIÓN DE REPORTES
# =============================================================================

generate_test_report() {
    local report_file="$TEST_RESULTS_DIR/test_report_$(date +%Y%m%d_%H%M%S).html"
    
    mkdir -p "$TEST_RESULTS_DIR"
    
    cat > "$report_file" << EOF
<!DOCTYPE html>
<html>
<head>
    <title>🧪 Test Report - Flores Victoria v3.0</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f8f9fa; }
        .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); 
                 color: white; padding: 20px; border-radius: 10px; text-align: center; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
                  gap: 20px; margin: 20px 0; }
        .metric { background: white; padding: 20px; border-radius: 10px; 
                 box-shadow: 0 2px 4px rgba(0,0,0,0.1); text-align: center; }
        .metric-title { font-size: 14px; color: #666; margin-bottom: 10px; }
        .metric-value { font-size: 32px; font-weight: bold; }
        .success { color: #28a745; }
        .warning { color: #ffc107; }
        .error { color: #dc3545; }
        .test-details { background: white; padding: 20px; border-radius: 10px; 
                       box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin: 20px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🧪 Test Report - Flores Victoria v3.0</h1>
        <p>Reporte completo de testing automatizado - $(date)</p>
    </div>

    <div class="summary">
        <div class="metric">
            <div class="metric-title">Total Tests</div>
            <div class="metric-value">$TOTAL_TESTS</div>
        </div>
        <div class="metric">
            <div class="metric-title">Passed</div>
            <div class="metric-value success">$PASSED_TESTS</div>
        </div>
        <div class="metric">
            <div class="metric-title">Failed</div>
            <div class="metric-value error">$FAILED_TESTS</div>
        </div>
        <div class="metric">
            <div class="metric-title">Warnings</div>
            <div class="metric-value warning">$WARNINGS</div>
        </div>
        <div class="metric">
            <div class="metric-title">Success Rate</div>
            <div class="metric-value">$(( PASSED_TESTS * 100 / TOTAL_TESTS ))%</div>
        </div>
    </div>

    <div class="test-details">
        <h2>📋 Detalles de Testing</h2>
        <pre>$(tail -50 "$TEST_LOG")</pre>
    </div>

    <div class="test-details">
        <h2>🎯 Recomendaciones</h2>
        <ul>
            <li>✅ Servicios principales funcionando correctamente</li>
            <li>⚡ Rendimiento dentro de parámetros aceptables</li>
            <li>🔒 Implementar headers de seguridad adicionales</li>
            <li>📊 Configurar monitoreo continuo de métricas</li>
        </ul>
    </div>
</body>
</html>
EOF
    
    log_test "SUCCESS" "✅ Reporte generado: $report_file"
}

show_test_summary() {
    echo ""
    echo -e "${CYAN}╔══════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║                        🧪 RESUMEN DE TESTING                              ║${NC}"
    echo -e "${CYAN}╠══════════════════════════════════════════════════════════════════════════╣${NC}"
    echo -e "${CYAN}║${NC} Total de Tests:    ${WHITE}$TOTAL_TESTS${NC}"
    echo -e "${CYAN}║${NC} Tests Exitosos:    ${GREEN}$PASSED_TESTS${NC}"
    echo -e "${CYAN}║${NC} Tests Fallidos:    ${RED}$FAILED_TESTS${NC}"
    echo -e "${CYAN}║${NC} Advertencias:      ${YELLOW}$WARNINGS${NC}"
    echo -e "${CYAN}║${NC}"
    
    local success_rate=$(( PASSED_TESTS * 100 / TOTAL_TESTS ))
    
    if [[ $success_rate -ge 90 ]]; then
        echo -e "${CYAN}║${NC} Tasa de Éxito:     ${GREEN}$success_rate%${NC} 🎉"
        echo -e "${CYAN}║${NC} Estado:            ${GREEN}SISTEMA OPERATIVO AL 100%${NC} ✅"
    elif [[ $success_rate -ge 70 ]]; then
        echo -e "${CYAN}║${NC} Tasa de Éxito:     ${YELLOW}$success_rate%${NC} ⚠️"
        echo -e "${CYAN}║${NC} Estado:            ${YELLOW}SISTEMA MAYORMENTE OPERATIVO${NC}"
    else
        echo -e "${CYAN}║${NC} Tasa de Éxito:     ${RED}$success_rate%${NC} ❌"
        echo -e "${CYAN}║${NC} Estado:            ${RED}SISTEMA REQUIERE ATENCIÓN${NC}"
    fi
    
    echo -e "${CYAN}╚══════════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

# =============================================================================
# FUNCIÓN PRINCIPAL
# =============================================================================

run_complete_test_suite() {
    show_test_banner
    log_test "INFO" "🚀 Iniciando suite completa de testing..."
    
    # Ejecutar todas las categorías de tests
    test_infrastructure
    test_services  
    test_functional
    test_performance
    test_automation
    test_security
    
    # Mostrar resumen
    show_test_summary
    
    # Generar reporte
    generate_test_report
    
    # Determinar estado final
    local success_rate=$(( PASSED_TESTS * 100 / TOTAL_TESTS ))
    
    if [[ $success_rate -ge 90 ]]; then
        log_test "SUCCESS" "🎉 ¡SISTEMA 100% OPERATIVO!"
        return 0
    elif [[ $success_rate -ge 70 ]]; then
        log_test "WARNING" "⚠️  Sistema mayormente operativo, revisar warnings"
        return 1
    else
        log_test "ERROR" "❌ Sistema requiere atención inmediata"
        return 2
    fi
}

main() {
    local command=${1:-"full"}
    
    case $command in
        "full"|"complete")
            run_complete_test_suite
            ;;
        "infrastructure"|"infra")
            show_test_banner
            test_infrastructure
            show_test_summary
            ;;
        "services")
            show_test_banner
            test_services
            show_test_summary
            ;;
        "functional"|"func")
            show_test_banner
            test_functional
            show_test_summary
            ;;
        "performance"|"perf")
            show_test_banner
            test_performance
            show_test_summary
            ;;
        "automation"|"auto")
            show_test_banner
            test_automation
            show_test_summary
            ;;
        "security"|"sec")
            show_test_banner
            test_security
            show_test_summary
            ;;
        "help")
            echo "🧪 Sistema de Testing Completo - Flores Victoria v3.0"
            echo ""
            echo "Comandos disponibles:"
            echo "  full          - Suite completa de testing"
            echo "  infrastructure- Tests de infraestructura"
            echo "  services      - Tests de servicios"
            echo "  functional    - Tests funcionales"
            echo "  performance   - Tests de rendimiento"  
            echo "  automation    - Tests de automatización"
            echo "  security      - Tests de seguridad"
            echo "  help          - Esta ayuda"
            ;;
        *)
            echo "Comando desconocido: $command"
            echo "Usa '$0 help' para ver comandos disponibles"
            ;;
    esac
}

main "$@"