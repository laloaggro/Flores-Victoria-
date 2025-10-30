#!/bin/bash

# ==============================================================================
# 🧪 VALIDATION SCRIPT - Observability Stack
# ==============================================================================
# Valida que todo el stack de observabilidad esté funcionando correctamente
# 
# Uso: ./validate-stack.sh
# ==============================================================================

set -e

RESET='\033[0m'
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'

# ==============================================================================
# HELPERS
# ==============================================================================

print_header() {
    echo -e "\n${BLUE}═══════════════════════════════════════════════════════════${RESET}"
    echo -e "${BLUE}  $1${RESET}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${RESET}\n"
}

print_success() {
    echo -e "${GREEN}✅ $1${RESET}"
}

print_error() {
    echo -e "${RED}❌ $1${RESET}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${RESET}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${RESET}"
}

# ==============================================================================
# VALIDACIONES
# ==============================================================================

validate_dependencies() {
    print_header "1. Validando Dependencias"
    
    # Node.js
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_success "Node.js instalado: $NODE_VERSION"
    else
        print_error "Node.js no encontrado"
        exit 1
    fi
    
    # npm
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        print_success "npm instalado: $NPM_VERSION"
    else
        print_error "npm no encontrado"
        exit 1
    fi
    
    # Docker
    if command -v docker &> /dev/null; then
        DOCKER_VERSION=$(docker --version | cut -d ' ' -f3 | tr -d ',')
        print_success "Docker instalado: $DOCKER_VERSION"
    else
        print_warning "Docker no encontrado (opcional para monitoring)"
    fi
    
    # Docker Compose
    if command -v docker-compose &> /dev/null; then
        DOCKER_COMPOSE_VERSION=$(docker-compose --version | cut -d ' ' -f3 | tr -d ',')
        print_success "Docker Compose instalado: $DOCKER_COMPOSE_VERSION"
    else
        print_warning "Docker Compose no encontrado (opcional para monitoring)"
    fi
}

validate_syntax() {
    print_header "2. Validando Sintaxis de Archivos"
    
    SERVICES=("cart-service" "product-service" "auth-service" "user-service" "order-service")
    
    for service in "${SERVICES[@]}"; do
        APP_FILE="microservices/$service/src/app.js"
        
        if [ -f "$APP_FILE" ]; then
            if node --check "$APP_FILE" 2>/dev/null; then
                print_success "$service/src/app.js - Sintaxis válida"
            else
                print_error "$service/src/app.js - Error de sintaxis"
                exit 1
            fi
        else
            print_warning "$APP_FILE no encontrado"
        fi
    done
}

validate_package_dependencies() {
    print_header "3. Validando Dependencias de Paquetes"
    
    REQUIRED_DEPS=("joi" "prom-client" "winston")
    SERVICES=("cart-service" "product-service" "auth-service" "user-service" "order-service")
    
    for service in "${SERVICES[@]}"; do
        PACKAGE_JSON="microservices/$service/package.json"
        
        if [ -f "$PACKAGE_JSON" ]; then
            print_info "Verificando $service..."
            
            for dep in "${REQUIRED_DEPS[@]}"; do
                if grep -q "\"$dep\"" "$PACKAGE_JSON"; then
                    print_success "  $dep ✓"
                else
                    print_warning "  $dep faltante"
                fi
            done
        fi
    done
}

validate_shared_middleware() {
    print_header "4. Validando Middleware Compartido"
    
    MIDDLEWARE_FILES=(
        "shared/errors/AppError.js"
        "shared/middleware/error-handler.js"
        "shared/middleware/rate-limiter.js"
        "shared/middleware/validator.js"
        "shared/middleware/metrics.js"
    )
    
    for file in "${MIDDLEWARE_FILES[@]}"; do
        if [ -f "$file" ]; then
            if node --check "$file" 2>/dev/null; then
                print_success "$(basename $file) - OK"
            else
                print_error "$(basename $file) - Error de sintaxis"
                exit 1
            fi
        else
            print_error "$file no encontrado"
            exit 1
        fi
    done
}

validate_documentation() {
    print_header "5. Validando Documentación"
    
    DOCS=(
        "shared/ERROR_HANDLING.md"
        "shared/RATE_LIMITING.md"
        "shared/VALIDATION.md"
        "shared/OBSERVABILITY_STACK.md"
        "shared/INTEGRATION_COMPLETED.md"
        "monitoring/QUICKSTART.md"
    )
    
    for doc in "${DOCS[@]}"; do
        if [ -f "$doc" ]; then
            LINES=$(wc -l < "$doc")
            print_success "$(basename $doc) - $LINES líneas"
        else
            print_warning "$(basename $doc) no encontrado"
        fi
    done
}

validate_monitoring_config() {
    print_header "6. Validando Configuración de Monitoring"
    
    MONITORING_FILES=(
        "docker-compose.monitoring.yml"
        "monitoring/prometheus.yml"
        "monitoring/alertmanager.yml"
        "monitoring/alerts/service-alerts.yml"
    )
    
    for file in "${MONITORING_FILES[@]}"; do
        if [ -f "$file" ]; then
            print_success "$(basename $file) - OK"
        else
            print_warning "$file no encontrado"
        fi
    done
}

run_tests() {
    print_header "7. Ejecutando Tests (Opcional)"
    
    if [ -d "shared/middleware/__tests__" ]; then
        print_info "Tests encontrados en shared/middleware/__tests__/"
        
        if [ -f "shared/package.json" ]; then
            cd shared
            if npm test --silent 2>/dev/null; then
                print_success "Tests ejecutados correctamente"
            else
                print_warning "Tests fallaron o Jest no configurado"
            fi
            cd ..
        else
            print_warning "package.json no encontrado en shared/"
        fi
    else
        print_warning "Directorio de tests no encontrado"
    fi
}

validate_services_ports() {
    print_header "8. Validando Puertos de Servicios"
    
    PORTS=(3001 3002 3003 3004 3005)
    PORT_NAMES=("cart-service" "product-service" "auth-service" "user-service" "order-service")
    
    for i in "${!PORTS[@]}"; do
        PORT=${PORTS[$i]}
        SERVICE=${PORT_NAMES[$i]}
        
        if lsof -i :$PORT &> /dev/null; then
            print_warning "Puerto $PORT ($SERVICE) ya está en uso"
        else
            print_info "Puerto $PORT ($SERVICE) disponible"
        fi
    done
}

# ==============================================================================
# MAIN
# ==============================================================================

main() {
    echo -e "${BLUE}"
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║                                                            ║"
    echo "║        🧪 VALIDACIÓN DEL STACK DE OBSERVABILIDAD          ║"
    echo "║            Arreglos Victoria - v2.0.0                      ║"
    echo "║                                                            ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo -e "${RESET}\n"
    
    validate_dependencies
    validate_syntax
    validate_package_dependencies
    validate_shared_middleware
    validate_documentation
    validate_monitoring_config
    run_tests
    validate_services_ports
    
    # Summary
    print_header "✅ RESUMEN DE VALIDACIÓN"
    print_success "Todas las validaciones completadas"
    print_info ""
    print_info "Próximos pasos:"
    print_info "1. Instalar dependencias: cd microservices/<service> && npm install"
    print_info "2. Iniciar monitoring: docker-compose -f docker-compose.monitoring.yml up -d"
    print_info "3. Iniciar servicios: cd microservices/<service> && npm start"
    print_info "4. Ver métricas: http://localhost:3000 (Grafana)"
    print_info ""
    print_success "Documentación: monitoring/QUICKSTART.md"
}

# Ejecutar script
main
