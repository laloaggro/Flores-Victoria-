#!/bin/bash

# =====================================================
# FLORES VICTORIA - VERIFICATION SUITE
# Suite consolidada de verificación
# =====================================================

set -e

TARGET="${1:-all}"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }

show_usage() {
    cat << EOF
🔍 Flores Victoria - Verification Suite

Uso: $0 [target]

Targets:
  all          Todas las verificaciones (default)
  frontend     Verificar frontend
  backend      Verificar backend
  admin        Verificar admin panel
  urls         Verificar URLs
  config       Verificar configuración
  integration  Verificar integración

Ejemplos:
  $0 all
  $0 frontend
  $0 integration

EOF
    exit 0
}

verify_frontend() {
    log_info "Verificando frontend..."
    [ -d "../../frontend/dist" ] && log_success "Build existe" || log_warning "Build no encontrado"
    [ -f "../../frontend/package.json" ] && log_success "package.json OK" || log_error "package.json faltante"
}

verify_backend() {
    log_info "Verificando backend..."
    docker compose ps | grep -q "api-gateway" && log_success "API Gateway corriendo" || log_warning "API Gateway no está corriendo"
}

verify_admin() {
    log_info "Verificando admin panel..."
    [ -d "../../admin-panel/dist" ] && log_success "Admin build existe" || log_warning "Admin build no encontrado"
}

verify_urls() {
    log_info "Verificando URLs..."
    curl -s -o /dev/null -w "%{http_code}" http://localhost:5173 | grep -q "200\|302" && log_success "Frontend accesible" || log_warning "Frontend no accesible"
}

verify_config() {
    log_info "Verificando configuración..."
    [ -f "../../.env" ] && log_success ".env existe" || log_warning ".env no encontrado"
    [ -f "../../docker-compose.yml" ] && log_success "docker-compose.yml existe" || log_error "docker-compose.yml faltante"
}

verify_integration() {
    log_info "Verificando integración..."
    verify_frontend
    verify_backend
    verify_config
}

# Main
case "$TARGET" in
    all)
        verify_frontend
        verify_backend
        verify_admin
        verify_urls
        verify_config
        log_success "Verificación completa"
        ;;
    frontend)
        verify_frontend
        ;;
    backend)
        verify_backend
        ;;
    admin)
        verify_admin
        ;;
    urls)
        verify_urls
        ;;
    config)
        verify_config
        ;;
    integration)
        verify_integration
        ;;
    -h|--help|help)
        show_usage
        ;;
    *)
        log_error "Target no reconocido: $TARGET"
        show_usage
        ;;
esac
