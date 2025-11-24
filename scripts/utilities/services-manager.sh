#!/bin/bash

# =====================================================
# FLORES VICTORIA - SERVICES MANAGER
# Gestión unificada de servicios
# =====================================================

set -e

ACTION="$1"
TARGET="${2:-all}"

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Funciones
log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }

show_usage() {
    cat << EOF
📦 Flores Victoria - Services Manager

Uso: $0 <action> [target]

Actions:
  start     Iniciar servicios
  stop      Detener servicios
  restart   Reiniciar servicios
  status    Ver estado de servicios

Targets:
  all          Todos los servicios (default)
  core         Servicios core (DB, Redis, RabbitMQ)
  backend      Backend y microservicios
  frontend     Frontend
  admin        Admin panel
  monitoring   Prometheus, Grafana, Jaeger

Ejemplos:
  $0 start all
  $0 stop backend
  $0 restart frontend
  $0 status

EOF
    exit 0
}

start_services() {
    case "$TARGET" in
        all)
            log_info "Iniciando todos los servicios..."
            docker compose up -d
            ;;
        core)
            log_info "Iniciando servicios core..."
            docker compose up -d postgres mongodb redis rabbitmq
            ;;
        backend)
            log_info "Iniciando backend..."
            docker compose up -d api-gateway auth-service product-service user-service
            ;;
        frontend)
            log_info "Iniciando frontend..."
            cd ../../frontend && npm run dev &
            ;;
        admin)
            log_info "Iniciando admin panel..."
            cd ../../admin-panel && npm run dev &
            ;;
        monitoring)
            log_info "Iniciando monitoring..."
            docker compose up -d prometheus grafana jaeger
            ;;
        *)
            log_error "Target no reconocido: $TARGET"
            show_usage
            ;;
    esac
    log_success "Servicios iniciados"
}

stop_services() {
    case "$TARGET" in
        all)
            log_info "Deteniendo todos los servicios..."
            docker compose down
            pkill -f "vite" 2>/dev/null || true
            ;;
        core)
            log_info "Deteniendo servicios core..."
            docker compose stop postgres mongodb redis rabbitmq
            ;;
        backend)
            log_info "Deteniendo backend..."
            docker compose stop api-gateway auth-service product-service user-service
            ;;
        frontend)
            log_info "Deteniendo frontend..."
            pkill -f "vite.*frontend" 2>/dev/null || true
            ;;
        admin)
            log_info "Deteniendo admin panel..."
            pkill -f "vite.*admin" 2>/dev/null || true
            ;;
        monitoring)
            log_info "Deteniendo monitoring..."
            docker compose stop prometheus grafana jaeger
            ;;
        *)
            log_error "Target no reconocido: $TARGET"
            show_usage
            ;;
    esac
    log_success "Servicios detenidos"
}

restart_services() {
    log_info "Reiniciando $TARGET..."
    stop_services
    sleep 2
    start_services
}

check_status() {
    log_info "Estado de servicios:"
    echo ""
    docker compose ps
    echo ""
    log_info "Procesos Vite:"
    pgrep -fa vite || echo "Ninguno"
}

# Main
case "$ACTION" in
    start)
        start_services
        ;;
    stop)
        stop_services
        ;;
    restart)
        restart_services
        ;;
    status)
        check_status
        ;;
    -h|--help|help|"")
        show_usage
        ;;
    *)
        log_error "Acción no reconocida: $ACTION"
        show_usage
        ;;
esac
