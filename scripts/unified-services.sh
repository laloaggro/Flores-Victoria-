#!/bin/bash

# =============================================================================
# SCRIPT UNIFICADO DE GESTIÓN DE SERVICIOS - FLORES VICTORIA
# =============================================================================
# Consolida funcionalidad de: start-all.sh, stop-all.sh, admin-start.sh,
# admin-stop.sh, restart-frontend.sh, start-dev.sh, stop-dev.sh, etc.
# =============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Configurar logging antes de cargar common.sh
LOG_DIR="./logs"
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/services_$(date +%Y%m%d_%H%M%S).log"

# Redirigir toda la salida a log Y a pantalla
exec > >(tee -a "$LOG_FILE")
exec 2>&1

source "$SCRIPT_DIR/lib/common.sh" 2>/dev/null || {
    echo "Error: No se pudo cargar lib/common.sh"
    exit 1
}

# =============================================================================
# FUNCIONES DE GESTIÓN
# =============================================================================

# Iniciar todos los servicios Docker
start_docker_services() {
    print_section "Iniciando Servicios Docker"
    
    if ! check_docker; then
        print_error "Docker no está disponible"
        return 1
    fi
    
    if [ -f "docker-compose.yml" ]; then
        print_info "Usando docker-compose.yml..."
        docker compose up -d
        
        if [ $? -eq 0 ]; then
            print_success "Servicios Docker iniciados"
            sleep 3
            return 0
        else
            print_error "Error al iniciar servicios Docker"
            return 1
        fi
    else
        print_error "docker-compose.yml no encontrado"
        return 1
    fi
}

# Detener todos los servicios Docker
stop_docker_services() {
    print_section "Deteniendo Servicios Docker"
    
    if ! check_docker; then
        print_warning "Docker no está disponible"
        return 1
    fi
    
    if [ -f "docker-compose.yml" ]; then
        print_info "Deteniendo servicios..."
        docker compose down
        
        if [ $? -eq 0 ]; then
            print_success "Servicios Docker detenidos"
            return 0
        else
            print_error "Error al detener servicios Docker"
            return 1
        fi
    else
        print_warning "docker-compose.yml no encontrado"
        return 1
    fi
}

# Reiniciar servicios Docker
restart_docker_services() {
    print_section "Reiniciando Servicios Docker"
    
    stop_docker_services
    sleep 2
    start_docker_services
}

# Iniciar Frontend
start_frontend() {
    print_section "Iniciando Frontend"
    
    cd frontend 2>/dev/null || {
        print_error "Directorio frontend no encontrado"
        return 1
    }
    
    if check_port 3000; then
        print_warning "Puerto 3000 ya está en uso"
        cd - > /dev/null
        return 1
    fi
    
    print_info "Instalando dependencias si es necesario..."
    npm install --silent 2>&1 | grep -i "error" || true
    
    print_info "Iniciando servidor..."
    npm start &> /dev/null &
    local pid=$!
    
    sleep 5
    
    if kill -0 $pid 2>/dev/null && check_service "http://localhost:3000" 10; then
        print_success "Frontend iniciado en http://localhost:3000 (PID: $pid)"
        echo $pid > /tmp/frontend.pid
        cd - > /dev/null
        return 0
    else
        print_error "Error al iniciar Frontend"
        cd - > /dev/null
        return 1
    fi
}

# Detener Frontend
stop_frontend() {
    print_section "Deteniendo Frontend"
    
    if [ -f /tmp/frontend.pid ]; then
        local pid=$(cat /tmp/frontend.pid)
        if kill -0 $pid 2>/dev/null; then
            kill $pid
            rm /tmp/frontend.pid
            print_success "Frontend detenido"
            return 0
        fi
    fi
    
    local pid=$(lsof -ti:3000 2>/dev/null)
    if [ -n "$pid" ]; then
        kill $pid
        print_success "Frontend detenido (PID: $pid)"
        return 0
    fi
    
    print_warning "Frontend no está corriendo"
    return 1
}

# Iniciar Backend
start_backend() {
    print_section "Iniciando Backend"
    
    cd backend 2>/dev/null || {
        print_error "Directorio backend no encontrado"
        return 1
    }
    
    if check_port 5000; then
        print_warning "Puerto 5000 ya está en uso"
        cd - > /dev/null
        return 1
    fi
    
    print_info "Instalando dependencias si es necesario..."
    npm install --silent 2>&1 | grep -i "error" || true
    
    print_info "Iniciando servidor..."
    npm start &> /dev/null &
    local pid=$!
    
    sleep 5
    
    if kill -0 $pid 2>/dev/null && check_service "http://localhost:5000/health" 10; then
        print_success "Backend iniciado en http://localhost:5000 (PID: $pid)"
        echo $pid > /tmp/backend.pid
        cd - > /dev/null
        return 0
    else
        print_error "Error al iniciar Backend"
        cd - > /dev/null
        return 1
    fi
}

# Detener Backend
stop_backend() {
    print_section "Deteniendo Backend"
    
    if [ -f /tmp/backend.pid ]; then
        local pid=$(cat /tmp/backend.pid)
        if kill -0 $pid 2>/dev/null; then
            kill $pid
            rm /tmp/backend.pid
            print_success "Backend detenido"
            return 0
        fi
    fi
    
    local pid=$(lsof -ti:5000 2>/dev/null)
    if [ -n "$pid" ]; then
        kill $pid
        print_success "Backend detenido (PID: $pid)"
        return 0
    fi
    
    print_warning "Backend no está corriendo"
    return 1
}

# Iniciar modo desarrollo
start_dev_mode() {
    print_header "MODO DESARROLLO"
    
    print_info "Iniciando servicios de base de datos..."
    docker compose up -d mongodb redis
    sleep 3
    
    start_backend
    sleep 2
    
    start_frontend
    sleep 2
    
    start_admin_panel
    
    print_section "Estado"
    print_success "Modo desarrollo iniciado"
    print_info "Frontend: http://localhost:3000"
    print_info "Backend: http://localhost:5000"
    print_info "Admin Panel: http://localhost:3010"
}

# Detener modo desarrollo
stop_dev_mode() {
    print_header "DETENIENDO MODO DESARROLLO"
    
    stop_frontend
    stop_backend
    stop_admin_panel
    
    print_info "Deteniendo bases de datos..."
    docker compose stop mongodb redis
    
    print_success "Modo desarrollo detenido"
}

# Iniciar todo
start_all() {
    print_header "INICIANDO TODOS LOS SERVICIOS"
    
    local start_time=$(date +%s)
    
    start_docker_services
    sleep 3
    
    start_admin_panel
    
    local duration=$(measure_time $start_time)
    
    print_section "Estado Final"
    print_success "Todos los servicios iniciados en $duration"
    
    print_info ""
    print_info "URLs disponibles:"
    print_info "  Frontend:    http://localhost:3000"
    print_info "  Backend:     http://localhost:5000"
    print_info "  API Gateway: http://localhost:8080"
    print_info "  Admin Panel: http://localhost:3010"
    print_info "  Grafana:     http://localhost:3005"
    print_info "  Kibana:      http://localhost:5601"
}

# Detener todo
stop_all() {
    print_header "DETENIENDO TODOS LOS SERVICIOS"
    
    stop_admin_panel
    stop_docker_services
    
    # Limpiar archivos PID
    rm -f /tmp/*.pid 2>/dev/null
    
    print_success "Todos los servicios detenidos"
}

# Reiniciar todo
restart_all() {
    print_header "REINICIANDO TODOS LOS SERVICIOS"
    
    stop_all
    sleep 3
    start_all
}

# Estado de servicios
status_services() {
    print_header "ESTADO DE SERVICIOS"
    
    # Docker
    print_section "Docker"
    if check_docker; then
        print_success "Docker operacional"
    else
        print_error "Docker no disponible"
    fi
    
    # Contenedores
    print_section "Contenedores"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "flores|NAME" || print_warning "No hay contenedores corriendo"
    
    # Admin Panel
    print_section "Admin Panel"
    local admin_status=$(get_admin_status)
    case "$admin_status" in
        running)
            print_success "Admin Panel corriendo en http://localhost:3010"
            ;;
        port-occupied)
            print_warning "Puerto 3010 ocupado pero no responde"
            ;;
        *)
            print_warning "Admin Panel no está corriendo"
            ;;
    esac
    
    # Recursos
    system_resources_summary
}

# Logs en vivo
follow_logs() {
    local service="${1:-all}"
    
    print_header "LOGS EN VIVO: $service"
    print_info "Presione Ctrl+C para detener"
    echo ""
    
    case "$service" in
        frontend)
            docker compose logs -f flores-victoria-frontend-1
            ;;
        backend)
            docker compose logs -f flores-victoria-backend-1
            ;;
        gateway)
            docker compose logs -f flores-victoria-api-gateway-1
            ;;
        mongodb)
            docker compose logs -f flores-victoria-mongodb-1
            ;;
        admin)
            if check_port 3010; then
                tail -f admin-panel/logs/*.log 2>/dev/null || print_error "No se encontraron logs"
            else
                print_error "Admin Panel no está corriendo"
            fi
            ;;
        all)
            docker compose logs -f
            ;;
        *)
            print_error "Servicio inválido: $service"
            print_info "Servicios disponibles: frontend, backend, gateway, mongodb, admin, all"
            return 1
            ;;
    esac
}

# =============================================================================
# MENÚ Y OPCIONES
# =============================================================================

show_help() {
    cat << EOF
USO: $(basename $0) COMANDO [OPCIONES]

COMANDOS:
  start [all|docker|dev|admin|frontend|backend]
      Iniciar servicios
      
  stop [all|docker|dev|admin|frontend|backend]
      Detener servicios
      
  restart [all|docker|admin|frontend|backend]
      Reiniciar servicios
      
  status
      Ver estado de todos los servicios
      
  logs [all|frontend|backend|gateway|mongodb|admin]
      Ver logs en tiempo real
      
  help
      Mostrar esta ayuda

EJEMPLOS:
  $(basename $0) start all       # Iniciar todos los servicios
  $(basename $0) start dev        # Iniciar modo desarrollo
  $(basename $0) start admin      # Solo admin panel
  $(basename $0) stop all         # Detener todo
  $(basename $0) restart docker   # Reiniciar contenedores
  $(basename $0) status           # Ver estado
  $(basename $0) logs frontend    # Ver logs del frontend

SCRIPTS NPM:
  npm start                  # start all
  npm run admin:start        # start admin
  npm run admin:stop         # stop admin
  npm run admin:restart      # restart admin

EOF
}

# =============================================================================
# MAIN
# =============================================================================

main() {
    local command="${1:-help}"
    local target="${2:-all}"
    
    case "$command" in
        start)
            case "$target" in
                all)
                    start_all
                    ;;
                docker)
                    start_docker_services
                    ;;
                dev)
                    start_dev_mode
                    ;;
                admin)
                    start_admin_panel
                    ;;
                frontend)
                    start_frontend
                    ;;
                backend)
                    start_backend
                    ;;
                *)
                    print_error "Target inválido: $target"
                    show_help
                    exit 1
                    ;;
            esac
            ;;
            
        stop)
            case "$target" in
                all)
                    stop_all
                    ;;
                docker)
                    stop_docker_services
                    ;;
                dev)
                    stop_dev_mode
                    ;;
                admin)
                    stop_admin_panel
                    ;;
                frontend)
                    stop_frontend
                    ;;
                backend)
                    stop_backend
                    ;;
                *)
                    print_error "Target inválido: $target"
                    show_help
                    exit 1
                    ;;
            esac
            ;;
            
        restart)
            case "$target" in
                all)
                    restart_all
                    ;;
                docker)
                    restart_docker_services
                    ;;
                admin)
                    stop_admin_panel
                    sleep 2
                    start_admin_panel
                    ;;
                frontend)
                    stop_frontend
                    sleep 2
                    start_frontend
                    ;;
                backend)
                    stop_backend
                    sleep 2
                    start_backend
                    ;;
                *)
                    print_error "Target inválido: $target"
                    show_help
                    exit 1
                    ;;
            esac
            ;;
            
        status)
            status_services
            ;;
            
        logs)
            follow_logs "$target"
            ;;
            
        help|--help|-h)
            show_help
            ;;
            
        *)
            print_error "Comando inválido: $command"
            show_help
            exit 1
            ;;
    esac
    
    # Mostrar ubicación del log al final
    if [ -n "$LOG_FILE" ] && [ "$command" != "help" ] && [ "$command" != "--help" ] && [ "$command" != "-h" ] && [ "$command" != "logs" ]; then
        echo ""
        print_info "📄 Log guardado en: $LOG_FILE"
    fi
}

# Ejecutar
main "$@"
