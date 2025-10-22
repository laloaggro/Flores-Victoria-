#!/bin/bash

# =============================================================================
# SCRIPT UNIFICADO DE DIAGNÓSTICO - FLORES VICTORIA
# =============================================================================
# Consolida funcionalidad de: check-services.sh, health-check.sh,
# advanced-diagnostics.sh, check-critical-services.sh, admin-status.sh, etc.
# =============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Configurar logging antes de cargar common.sh
LOG_DIR="./logs"
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/diagnostics_$(date +%Y%m%d_%H%M%S).log"

# Redirigir toda la salida a log Y a pantalla
exec > >(tee -a "$LOG_FILE")
exec 2>&1

source "$SCRIPT_DIR/lib/common.sh" 2>/dev/null || {
    echo "Error: No se pudo cargar lib/common.sh"
    exit 1
}

# =============================================================================
# CONFIGURACIÓN
# =============================================================================

SERVICES=(
    "flores-victoria-frontend:5175:Frontend"
    "flores-victoria-api-gateway:3000:API Gateway"
    "flores-victoria-admin-panel:3010:Admin Panel"
    "flores-victoria-auth-service:3001:Auth Service"
    "flores-victoria-user-service:3003:User Service"
    "flores-victoria-order-service:3004:Order Service"
    "flores-victoria-review-service:3007:Review Service"
    "flores-victoria-contact-service:3008:Contact Service"
    "flores-victoria-product-service-1:3009:Product Service"
)

ADMIN_PANEL_PORT=3010

# =============================================================================
# FUNCIONES DE DIAGNÓSTICO
# =============================================================================

# Verificar estado de Docker
check_docker_status() {
    print_section "Docker"
    
    if ! check_docker; then
        print_error "Docker no está operacional"
        return 1
    fi
    
    print_success "Docker está operacional"
    
    # Versión
    local docker_version=$(docker --version | awk '{print $3}' | tr -d ',')
    print_info "Versión: $docker_version"
    
    # Docker Compose
    if docker compose version &> /dev/null; then
        local compose_version=$(docker compose version | awk '{print $4}')
        print_info "Docker Compose: $compose_version"
    fi
    
    return 0
}

# Verificar estado de contenedores
check_containers_status() {
    print_section "Contenedores del Proyecto"
    
    local running=0
    local stopped=0
    local missing=0
    
    for service_info in "${SERVICES[@]}"; do
        IFS=':' read -r container port name <<< "$service_info"
        
        if check_container "$container"; then
            local status=$(get_container_status "$container")
            if [ "$status" = "running" ]; then
                print_success "$name ($container) - Corriendo"
                ((running++))
            else
                print_warning "$name ($container) - Estado: $status"
                ((stopped++))
            fi
        else
            print_error "$name ($container) - No encontrado"
            ((missing++))
        fi
    done
    
    echo ""
    print_info "Resumen: $running corriendo, $stopped detenidos, $missing no encontrados"
    
    [ $running -gt 0 ]
}

# Verificar puertos
check_ports_status() {
    print_section "Puertos"
    
    local ports_ok=0
    local ports_busy=0
    
    for service_info in "${SERVICES[@]}"; do
        IFS=':' read -r container port name <<< "$service_info"
        
        if check_port "$port"; then
            print_success "Puerto $port ($name) - En uso"
            ((ports_ok++))
        else
            print_warning "Puerto $port ($name) - Libre"
            ((ports_busy++))
        fi
    done
    
    # Admin Panel
    if check_port "$ADMIN_PANEL_PORT"; then
        print_success "Puerto $ADMIN_PANEL_PORT (Admin Panel) - En uso"
        ((ports_ok++))
    else
        print_warning "Puerto $ADMIN_PANEL_PORT (Admin Panel) - Libre"
        ((ports_busy++))
    fi
    
    echo ""
    print_info "Resumen: $ports_ok activos, $ports_busy libres"
}

# Verificar servicios HTTP
check_services_http() {
    print_section "Servicios HTTP"
    
    local services_ok=0
    local services_error=0
    
        # Frontend
    if check_service "http://localhost:5175" 3; then
        print_success "Frontend (5175) - Respondiendo"
        ((services_ok++))
    else
        print_error "Frontend (5175) - No responde"
        ((services_error++))
    fi
    
    # API Gateway
    if check_service "http://localhost:3000" 3; then
        print_success "API Gateway (3000) - Respondiendo"
        ((services_ok++))
    else
        print_error "API Gateway (3000) - No responde"
        ((services_error++))
    fi
    
    # Admin Panel
    if check_service "http://localhost:3010" 3; then
        print_success "Admin Panel (3010) - Respondiendo"
        ((services_ok++))
    else
        print_error "Admin Panel (3010) - No responde"
        ((services_error++))
    fi
    
    echo ""
    print_info "Resumen: $services_ok operacionales, $services_error con problemas"
    
    [ $services_error -eq 0 ]
}

# Verificar recursos de contenedores
check_containers_resources() {
    print_section "Recursos de Contenedores"
    
    echo ""
    printf "%-35s %-15s %-15s %-15s\n" "CONTENEDOR" "ESTADO" "CPU" "MEMORIA"
    printf "%-35s %-15s %-15s %-15s\n" "$(printf '%0.s-' {1..35})" "$(printf '%0.s-' {1..15})" "$(printf '%0.s-' {1..15})" "$(printf '%0.s-' {1..15})"
    
    for service_info in "${SERVICES[@]}"; do
        IFS=':' read -r container port name <<< "$service_info"
        
        if check_container "$container"; then
            local status=$(get_container_status "$container")
            local cpu=$(get_container_cpu "$container")
            local memory=$(get_container_memory "$container")
            
            printf "%-35s %-15s %-15s %-15s\n" "$container" "$status" "${cpu:-N/A}" "${memory:-N/A}"
        fi
    done
    
    echo ""
}

# Verificar recursos del sistema
check_system_resources() {
    print_section "Recursos del Sistema"
    
    # Disco
    local disk_usage=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
    if [ "$disk_usage" -ge 90 ]; then
        print_error "Disco: ${disk_usage}% usado (CRÍTICO)"
    elif [ "$disk_usage" -ge 80 ]; then
        print_warning "Disco: ${disk_usage}% usado (Alto)"
    else
        print_success "Disco: ${disk_usage}% usado"
    fi
    
    # Memoria
    local mem_total=$(free -h | awk 'NR==2 {print $2}')
    local mem_used=$(free -h | awk 'NR==2 {print $3}')
    local mem_percent=$(free | awk 'NR==2 {printf "%.0f", $3/$2 * 100.0}')
    
    if [ "$mem_percent" -ge 90 ]; then
        print_error "Memoria: ${mem_used}/${mem_total} (${mem_percent}% - CRÍTICO)"
    elif [ "$mem_percent" -ge 80 ]; then
        print_warning "Memoria: ${mem_used}/${mem_total} (${mem_percent}% - Alto)"
    else
        print_success "Memoria: ${mem_used}/${mem_total} (${mem_percent}%)"
    fi
    
    # CPU Load
    local load_avg=$(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}' | tr -d ',')
    local cpu_cores=$(nproc)
    print_info "Load Average: $load_avg (Cores: $cpu_cores)"
}

# Verificar problemas comunes
check_common_issues() {
    print_section "Problemas Comunes"
    
    local issues_found=0
    
    # Contenedores detenidos
    local stopped_containers=$(docker ps -aq -f status=exited 2>/dev/null | wc -l)
    if [ -n "$stopped_containers" ] && [ "$stopped_containers" -gt 0 ]; then
        print_warning "Contenedores detenidos: $stopped_containers"
        print_info "  Ejecute: docker container prune"
        ((issues_found++))
    fi
    
    # Imágenes colgadas
    local dangling_images=$(docker images -q -f dangling=true 2>/dev/null | wc -l)
    if [ -n "$dangling_images" ] && [ "$dangling_images" -gt 0 ]; then
        print_warning "Imágenes colgadas: $dangling_images"
        print_info "  Ejecute: docker image prune"
        ((issues_found++))
    fi
    
    # Volúmenes no utilizados
    local unused_volumes=$(docker volume ls -q -f dangling=true 2>/dev/null | wc -l)
    if [ -n "$unused_volumes" ] && [ "$unused_volumes" -gt 0 ]; then
        print_warning "Volúmenes no utilizados: $unused_volumes"
        print_info "  Ejecute: docker volume prune"
        ((issues_found++))
    fi
    
    # Logs grandes
    if [ -d "./logs" ]; then
        local log_size=$(du -sh ./logs 2>/dev/null | awk '{print $1}')
        local log_count=$(find ./logs -name "*.log" 2>/dev/null | wc -l)
        if [ "$log_count" -gt 100 ]; then
            print_warning "Logs acumulados: $log_count archivos ($log_size)"
            print_info "  Ejecute: npm run clean:logs"
            ((issues_found++))
        fi
    fi
    
    if [ $issues_found -eq 0 ]; then
        print_success "No se encontraron problemas comunes"
    fi
    
    echo ""
    return $issues_found
}

# =============================================================================
# MODOS DE DIAGNÓSTICO
# =============================================================================

# Diagnóstico rápido (solo lo esencial)
quick_diagnostic() {
    print_header "DIAGNÓSTICO RÁPIDO"
    
    check_docker_status
    check_containers_status
    check_services_http
    
    print_section "Resultado"
    print_success "Diagnóstico rápido completado"
}

# Diagnóstico completo
full_diagnostic() {
    print_header "DIAGNÓSTICO COMPLETO"
    
    local start_time=$(date +%s)
    
    check_docker_status
    check_containers_status
    check_ports_status
    check_services_http
    check_containers_resources
    check_system_resources
    check_common_issues
    
    local duration=$(measure_time $start_time)
    
    print_section "Resultado"
    print_success "Diagnóstico completo en $duration"
    print_info "Log guardado en: $LOG_FILE"
}

# Diagnóstico crítico (solo servicios esenciales)
critical_diagnostic() {
    print_header "DIAGNÓSTICO CRÍTICO"
    
    local all_ok=true
    
    # Docker
    if ! check_docker; then
        print_error "Docker no operacional"
        all_ok=false
    fi
    
    # Frontend
    if ! check_service "http://localhost:3000"; then
        print_error "Frontend no responde"
        all_ok=false
    else
        print_success "Frontend OK"
    fi
    
    # Backend
    if ! check_service "http://localhost:5000/health"; then
        print_error "Backend no responde"
        all_ok=false
    else
        print_success "Backend OK"
    fi
    
    # MongoDB
    if ! check_container "flores-victoria-mongodb-1"; then
        print_error "MongoDB no está corriendo"
        all_ok=false
    else
        print_success "MongoDB OK"
    fi
    
    echo ""
    if $all_ok; then
        print_success "Todos los servicios críticos operacionales"
        return 0
    else
        print_error "Algunos servicios críticos tienen problemas"
        return 1
    fi
}

# Modo watch (monitoreo continuo)
watch_diagnostic() {
    print_header "MODO MONITOREO CONTINUO"
    print_info "Presione Ctrl+C para detener"
    echo ""
    
    while true; do
        clear
        echo -e "${CYAN}=== MONITOREO - $(date '+%Y-%m-%d %H:%M:%S') ===${NC}"
        echo ""
        
        check_services_http
        check_containers_resources
        check_system_resources
        
        sleep 5
    done
}

# =============================================================================
# MENÚ Y OPCIONES
# =============================================================================

show_help() {
    cat << EOF
USO: $(basename $0) [OPCIÓN]

OPCIONES:
  -q, --quick       Diagnóstico rápido (servicios básicos)
  -f, --full        Diagnóstico completo (recomendado)
  -c, --critical    Diagnóstico crítico (solo servicios esenciales)
  -w, --watch       Modo monitoreo continuo
  -d, --docker      Verificar solo Docker
  -s, --services    Verificar solo servicios HTTP
  -r, --resources   Verificar solo recursos
  -i, --issues      Verificar solo problemas comunes
  -h, --help        Mostrar esta ayuda

EJEMPLOS:
  $(basename $0)              # Diagnóstico completo (por defecto)
  $(basename $0) --quick      # Diagnóstico rápido
  $(basename $0) --critical   # Solo servicios críticos
  $(basename $0) --watch      # Monitoreo continuo

SCRIPTS NPM:
  npm run diagnostics         # Diagnóstico completo
  npm run check:services      # Diagnóstico rápido
  npm run check:critical      # Diagnóstico crítico

EOF
}

# =============================================================================
# MAIN
# =============================================================================

main() {
    local mode="${1:---full}"
    
    case "$mode" in
        -q|--quick)
            quick_diagnostic
            ;;
        -f|--full)
            full_diagnostic
            ;;
        -c|--critical)
            critical_diagnostic
            ;;
        -w|--watch)
            watch_diagnostic
            ;;
        -d|--docker)
            print_header "VERIFICACIÓN DOCKER"
            check_docker_status
            ;;
        -s|--services)
            print_header "VERIFICACIÓN SERVICIOS"
            check_services_http
            ;;
        -r|--resources)
            print_header "VERIFICACIÓN RECURSOS"
            check_system_resources
            check_containers_resources
            ;;
        -i|--issues)
            print_header "VERIFICACIÓN PROBLEMAS"
            check_common_issues
            ;;
        -h|--help)
            show_help
            ;;
        *)
            print_error "Opción inválida: $mode"
            show_help
            exit 1
            ;;
    esac
    
    # Mostrar ubicación del log al final
    if [ -n "$LOG_FILE" ] && [ "$mode" != "-h" ] && [ "$mode" != "--help" ]; then
        echo ""
        print_info "📄 Log guardado en: $LOG_FILE"
    fi
}

# Ejecutar
main "$@"
