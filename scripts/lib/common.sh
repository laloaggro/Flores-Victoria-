#!/bin/bash

# =============================================================================
# BIBLIOTECA DE FUNCIONES COMUNES - FLORES VICTORIA
# =============================================================================
# Funciones compartidas para todos los scripts del proyecto
# Uso: source "$(dirname "$0")/lib/common.sh"
# =============================================================================

# Colores
export RED='\033[0;31m'
export GREEN='\033[0;32m'
export YELLOW='\033[1;33m'
export BLUE='\033[0;34m'
export CYAN='\033[0;36m'
export WHITE='\033[1;37m'
export NC='\033[0m' # No Color

# =============================================================================
# FUNCIONES DE LOGGING
# =============================================================================

# Imprimir mensaje informativo
print_info() {
    echo -e "${CYAN}ℹ${NC} $1"
}

# Imprimir mensaje de éxito
print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

# Imprimir mensaje de advertencia
print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Imprimir mensaje de error
print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Imprimir encabezado
print_header() {
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}  $1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
    echo ""
}

# Imprimir sección
print_section() {
    echo ""
    echo -e "${YELLOW}━━━ $1 ━━━${NC}"
}

# Registrar en log y mostrar
log_and_print() {
    local message="$1"
    local timestamp="[$(date '+%Y-%m-%d %H:%M:%S')]"
    
    if [ -n "$LOG_FILE" ] && [ -w "$LOG_DIR" ]; then
        echo "$timestamp $message" >> "$LOG_FILE"
    fi
    echo "$message"
}

# Registrar mensaje con timestamp
log_message() {
    local level="${1:-INFO}"
    local message="$2"
    local timestamp="[$(date '+%Y-%m-%d %H:%M:%S')]"
    
    if [ -n "$LOG_FILE" ] && [ -w "$LOG_DIR" ]; then
        echo "$timestamp [$level] $message" >> "$LOG_FILE"
    fi
}

# =============================================================================
# VALIDACIONES
# =============================================================================

# Verificar si Docker está instalado y corriendo
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker no está instalado"
        return 1
    fi
    
    if ! docker info &> /dev/null; then
        print_error "Docker no está corriendo"
        return 1
    fi
    
    return 0
}

# Verificar si Docker Compose está disponible
check_docker_compose() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker no está instalado"
        return 1
    fi
    
    if docker compose version &> /dev/null; then
        return 0
    elif command -v docker-compose &> /dev/null; then
        return 0
    else
        print_error "Docker Compose no está disponible"
        return 1
    fi
}

# Verificar si un puerto está en uso
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0  # Puerto en uso
    else
        return 1  # Puerto libre
    fi
}

# Verificar si un contenedor está corriendo
check_container() {
    local container_name=$1
    if docker ps --format '{{.Names}}' | grep -q "^${container_name}$"; then
        return 0  # Contenedor corriendo
    else
        return 1  # Contenedor no encontrado
    fi
}

# Verificar si un servicio está respondiendo
check_service() {
    local url=$1
    local timeout=${2:-5}
    
    if curl -f -s -o /dev/null --max-time "$timeout" "$url"; then
        return 0  # Servicio OK
    else
        return 1  # Servicio no responde
    fi
}

# =============================================================================
# GESTIÓN DE CONTENEDORES
# =============================================================================

# Obtener estado de un contenedor
get_container_status() {
    local container_name=$1
    docker inspect --format='{{.State.Status}}' "$container_name" 2>/dev/null || echo "not-found"
}

# Obtener uso de memoria de un contenedor
get_container_memory() {
    local container_name=$1
    docker stats --no-stream --format "{{.MemUsage}}" "$container_name" 2>/dev/null | awk '{print $1}'
}

# Obtener uso de CPU de un contenedor
get_container_cpu() {
    local container_name=$1
    docker stats --no-stream --format "{{.CPUPerc}}" "$container_name" 2>/dev/null
}

# Listar contenedores del proyecto
list_project_containers() {
    docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "flores|admin-panel|NAME"
}

# =============================================================================
# GESTIÓN DE SERVICIOS
# =============================================================================

# Iniciar servicio admin panel
start_admin_panel() {
    print_info "Iniciando Admin Panel..."
    
    cd admin-panel 2>/dev/null || {
        print_error "Directorio admin-panel no encontrado"
        return 1
    }
    
    if check_port 3010; then
        print_warning "El puerto 3010 ya está en uso"
        return 1
    fi
    
    npm start &> /dev/null &
    local pid=$!
    sleep 3
    
    if kill -0 $pid 2>/dev/null && check_service "http://localhost:3010" 10; then
        print_success "Admin Panel iniciado en http://localhost:3010 (PID: $pid)"
        echo $pid > /tmp/admin-panel.pid
        cd - > /dev/null
        return 0
    else
        print_error "Error al iniciar Admin Panel"
        cd - > /dev/null
        return 1
    fi
}

# Detener servicio admin panel
stop_admin_panel() {
    print_info "Deteniendo Admin Panel..."
    
    if [ -f /tmp/admin-panel.pid ]; then
        local pid=$(cat /tmp/admin-panel.pid)
        if kill -0 $pid 2>/dev/null; then
            kill $pid
            rm /tmp/admin-panel.pid
            print_success "Admin Panel detenido"
            return 0
        fi
    fi
    
    # Buscar por puerto
    local pid=$(lsof -ti:3010 2>/dev/null)
    if [ -n "$pid" ]; then
        kill $pid
        print_success "Admin Panel detenido (PID: $pid)"
        return 0
    fi
    
    print_warning "Admin Panel no está corriendo"
    return 1
}

# Obtener estado del admin panel
get_admin_status() {
    if check_port 3010; then
        if check_service "http://localhost:3010"; then
            echo "running"
        else
            echo "port-occupied"
        fi
    else
        echo "stopped"
    fi
}

# =============================================================================
# UTILIDADES
# =============================================================================

# Solicitar confirmación
confirm() {
    local prompt="${1:-¿Continuar?}"
    local default="${2:-n}"
    
    if [ "$default" = "y" ]; then
        prompt="$prompt [Y/n] "
    else
        prompt="$prompt [y/N] "
    fi
    
    read -p "$prompt" -n 1 -r
    echo
    
    if [ "$default" = "y" ]; then
        [[ ! $REPLY =~ ^[Nn]$ ]]
    else
        [[ $REPLY =~ ^[Yy]$ ]]
    fi
}

# Medir tiempo de ejecución
measure_time() {
    local start_time=$1
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    if [ $duration -lt 60 ]; then
        echo "${duration}s"
    else
        local minutes=$((duration / 60))
        local seconds=$((duration % 60))
        echo "${minutes}m ${seconds}s"
    fi
}

# Limpiar logs antiguos
cleanup_old_logs() {
    local log_dir="${1:-./logs}"
    local days="${2:-30}"
    
    if [ -d "$log_dir" ]; then
        find "$log_dir" -name "*.log" -type f -mtime +$days -delete
        print_info "Logs antiguos limpiados (>$days días)"
    fi
}

# Crear backup
create_backup() {
    local source="$1"
    local backup_dir="${2:-./backups}"
    local timestamp=$(date +%Y%m%d_%H%M%S)
    
    mkdir -p "$backup_dir"
    
    if [ -f "$source" ]; then
        cp "$source" "$backup_dir/$(basename $source).backup_$timestamp"
        print_success "Backup creado: $(basename $source).backup_$timestamp"
    elif [ -d "$source" ]; then
        tar -czf "$backup_dir/$(basename $source).backup_$timestamp.tar.gz" "$source"
        print_success "Backup creado: $(basename $source).backup_$timestamp.tar.gz"
    else
        print_error "Fuente no encontrada: $source"
        return 1
    fi
}

# =============================================================================
# DIAGNÓSTICO
# =============================================================================

# Verificar espacio en disco
check_disk_space() {
    local threshold="${1:-90}"
    local usage=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
    
    if [ "$usage" -ge "$threshold" ]; then
        print_warning "Espacio en disco crítico: ${usage}%"
        return 1
    else
        print_success "Espacio en disco OK: ${usage}%"
        return 0
    fi
}

# Verificar memoria
check_memory() {
    local threshold="${1:-90}"
    local usage=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100.0}')
    
    if [ "$usage" -ge "$threshold" ]; then
        print_warning "Uso de memoria alto: ${usage}%"
        return 1
    else
        print_success "Memoria OK: ${usage}%"
        return 0
    fi
}

# Resumen de recursos del sistema
system_resources_summary() {
    print_section "Recursos del Sistema"
    
    echo -n "  Disco: "
    check_disk_space 80
    
    echo -n "  Memoria: "
    check_memory 80
    
    if command -v docker &> /dev/null && docker info &> /dev/null; then
        echo -n "  Docker: "
        print_success "Operacional"
    else
        echo -n "  Docker: "
        print_error "No disponible"
    fi
}

# =============================================================================
# INICIALIZACIÓN
# =============================================================================

# Configurar directorio de logs si no existe
if [ -z "$LOG_FILE" ]; then
    LOG_DIR="${LOG_DIR:-./logs}"
    mkdir -p "$LOG_DIR"
    LOG_FILE="$LOG_DIR/$(basename $0 .sh)_$(date +%Y%m%d_%H%M%S).log"
fi

# Exportar funciones para que estén disponibles en subshells
export -f print_info print_success print_warning print_error
export -f print_header print_section log_and_print
export -f check_docker check_docker_compose check_port check_container check_service
export -f get_container_status get_container_memory get_container_cpu
export -f start_admin_panel stop_admin_panel get_admin_status
export -f confirm measure_time cleanup_old_logs create_backup
export -f check_disk_space check_memory system_resources_summary

print_info "Biblioteca de funciones comunes cargada"
