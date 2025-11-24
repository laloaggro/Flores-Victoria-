#!/bin/bash

# =====================================================
# FLORES VICTORIA - TEST RUNNER
# Ejecución consolidada de tests
# =====================================================

set -e

MODE="${1:-all}"
COVERAGE="${2:-no}"

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }

show_usage() {
    cat << EOF
🧪 Flores Victoria - Test Runner

Uso: $0 [mode] [coverage]

Modes:
  all        Todos los tests (default)
  unit       Solo tests unitarios
  e2e        Solo tests E2E
  frontend   Tests del frontend
  backend    Tests del backend
  services   Tests de microservicios

Coverage:
  no         Sin coverage (default)
  yes        Con coverage report

Ejemplos:
  $0 all
  $0 unit yes
  $0 frontend yes
  $0 e2e

EOF
    exit 0
}

run_tests() {
    local target="$1"
    local with_coverage="$2"
    
    log_info "Ejecutando tests: $target"
    
    case "$target" in
        all)
            npm run test:all
            ;;
        unit)
            npm run test:unit
            ;;
        e2e)
            npm run test:e2e
            ;;
        frontend)
            cd ../../frontend && npm test
            ;;
        backend)
            cd ../../backend && npm test
            ;;
        services)
            cd ../../microservices && npm test
            ;;
        *)
            log_error "Modo no reconocido: $target"
            show_usage
            ;;
    esac
    
    if [ "$with_coverage" = "yes" ]; then
        log_info "Generando reporte de coverage..."
        npm run test:coverage
    fi
}

# Main
case "$MODE" in
    -h|--help|help)
        show_usage
        ;;
    *)
        run_tests "$MODE" "$COVERAGE"
        log_success "Tests completados"
        ;;
esac
