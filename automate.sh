#!/bin/bash

# 🤖 SCRIPT MAESTRO DE AUTOMATIZACIÓN - FLORES VICTORIA v3.0
# Sistema completo de automatización y gestión inteligente

set -e  # Detener en cualquier error

# =============================================================================
# CONFIGURACIÓN Y VARIABLES GLOBALES
# =============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR"
AUTOMATION_DIR="$PROJECT_ROOT/automation"
LOGS_DIR="$PROJECT_ROOT/logs"
CONFIG_FILE="$PROJECT_ROOT/automation/config.json"
PID_DIR="/tmp/flores-victoria"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Configuración de servicios
declare -A SERVICES=(
    ["admin-panel"]="3021:cd admin-panel && node server.js --port=3021"
    ["ai-service"]="3002:node ai-simple.js"
    ["order-service"]="3004:node order-service-simple.js"
)

# =============================================================================
# FUNCIONES UTILITARIAS
# =============================================================================

# Logging con timestamp y colores
log() {
    local level=$1
    local message=$2
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    case $level in
        "INFO")  echo -e "${BLUE}[$timestamp]${NC} ${WHITE}INFO:${NC} $message" ;;
        "SUCCESS") echo -e "${GREEN}[$timestamp]${NC} ${GREEN}SUCCESS:${NC} $message" ;;
        "WARNING") echo -e "${YELLOW}[$timestamp]${NC} ${YELLOW}WARNING:${NC} $message" ;;
        "ERROR") echo -e "${RED}[$timestamp]${NC} ${RED}ERROR:${NC} $message" ;;
        "DEBUG") echo -e "${PURPLE}[$timestamp]${NC} ${PURPLE}DEBUG:${NC} $message" ;;
    esac
    
    # También log a archivo
    echo "[$timestamp] $level: $message" >> "$LOGS_DIR/automation.log"
}

# Crear directorios necesarios
setup_directories() {
    log "INFO" "Configurando directorios de automatización..."
    
    mkdir -p "$AUTOMATION_DIR" "$LOGS_DIR" "$PID_DIR"
    
    # Rotar logs si son muy grandes
    if [[ -f "$LOGS_DIR/automation.log" ]] && [[ $(stat -f%z "$LOGS_DIR/automation.log" 2>/dev/null || stat -c%s "$LOGS_DIR/automation.log" 2>/dev/null || echo 0) -gt 10485760 ]]; then
        mv "$LOGS_DIR/automation.log" "$LOGS_DIR/automation.log.old"
        log "INFO" "Log rotado por tamaño"
    fi
}

# Verificar si un puerto está en uso
check_port() {
    local port=$1
    if command -v lsof >/dev/null 2>&1; then
        lsof -ti:$port >/dev/null 2>&1
    elif command -v netstat >/dev/null 2>&1; then
        netstat -tlnp 2>/dev/null | grep ":$port " >/dev/null
    else
        # Fallback usando /proc/net/tcp
        local hex_port=$(printf "%04X" $port)
        grep ":$hex_port " /proc/net/tcp >/dev/null 2>&1
    fi
}

# Verificar health de un servicio
check_health() {
    local port=$1
    local max_attempts=${2:-3}
    local attempt=1
    
    while [[ $attempt -le $max_attempts ]]; do
        if curl -s --connect-timeout 3 --max-time 5 "http://localhost:$port/health" >/dev/null 2>&1; then
            return 0
        fi
        ((attempt++))
        [[ $attempt -le $max_attempts ]] && sleep 2
    done
    return 1
}

# Obtener PID de un servicio
get_service_pid() {
    local service_name=$1
    local pid_file="$PID_DIR/${service_name}.pid"
    
    if [[ -f "$pid_file" ]]; then
        local pid=$(cat "$pid_file")
        if kill -0 "$pid" 2>/dev/null; then
            echo "$pid"
            return 0
        else
            rm -f "$pid_file"
        fi
    fi
    return 1
}

# Guardar PID de un servicio
save_service_pid() {
    local service_name=$1
    local pid=$2
    echo "$pid" > "$PID_DIR/${service_name}.pid"
}

# =============================================================================
# FUNCIONES DE GESTIÓN DE SERVICIOS
# =============================================================================

# Iniciar un servicio
start_service() {
    local service_name=$1
    local service_config="${SERVICES[$service_name]}"
    
    if [[ -z "$service_config" ]]; then
        log "ERROR" "Servicio desconocido: $service_name"
        return 1
    fi
    
    local port=$(echo "$service_config" | cut -d':' -f1)
    local command=$(echo "$service_config" | cut -d':' -f2-)
    
    log "INFO" "Iniciando servicio $service_name en puerto $port..."
    
    # Verificar si ya está corriendo
    if check_port $port; then
        log "WARNING" "Puerto $port ya está en uso"
        if check_health $port; then
            log "SUCCESS" "Servicio $service_name ya está funcionando"
            return 0
        else
            log "WARNING" "Puerto ocupado pero servicio no responde, intentando limpiar..."
            # Intentar limpiar el puerto
            local pid=$(lsof -ti:$port 2>/dev/null || echo "")
            if [[ -n "$pid" ]]; then
                kill -TERM "$pid" 2>/dev/null || true
                sleep 3
                kill -KILL "$pid" 2>/dev/null || true
            fi
        fi
    fi
    
    # Cambiar al directorio del proyecto
    cd "$PROJECT_ROOT"
    
    # Iniciar el servicio en background
    local log_file="$LOGS_DIR/${service_name}.log"
    nohup bash -c "$command" > "$log_file" 2>&1 &
    local pid=$!
    
    # Guardar PID
    save_service_pid "$service_name" "$pid"
    
    # Esperar y verificar que inició correctamente
    log "INFO" "Esperando que $service_name inicie (PID: $pid)..."
    sleep 5
    
    if check_health $port 5; then
        log "SUCCESS" "✅ Servicio $service_name iniciado correctamente en puerto $port (PID: $pid)"
        return 0
    else
        log "ERROR" "❌ Servicio $service_name falló al iniciar"
        # Cleanup
        kill -TERM "$pid" 2>/dev/null || true
        rm -f "$PID_DIR/${service_name}.pid"
        return 1
    fi
}

# Detener un servicio
stop_service() {
    local service_name=$1
    
    log "INFO" "Deteniendo servicio $service_name..."
    
    local pid=$(get_service_pid "$service_name" || echo "")
    
    if [[ -n "$pid" ]]; then
        log "INFO" "Enviando SIGTERM a PID $pid..."
        kill -TERM "$pid" 2>/dev/null || true
        
        # Esperar hasta 10 segundos para terminación graceful
        local count=0
        while kill -0 "$pid" 2>/dev/null && [[ $count -lt 10 ]]; do
            sleep 1
            ((count++))
        done
        
        # Si aún está corriendo, forzar terminación
        if kill -0 "$pid" 2>/dev/null; then
            log "WARNING" "Forzando terminación de PID $pid..."
            kill -KILL "$pid" 2>/dev/null || true
        fi
        
        rm -f "$PID_DIR/${service_name}.pid"
        log "SUCCESS" "Servicio $service_name detenido"
    else
        log "WARNING" "No se encontró PID para $service_name, intentando limpiar puerto..."
        
        # Intentar encontrar y matar proceso por puerto
        local service_config="${SERVICES[$service_name]}"
        local port=$(echo "$service_config" | cut -d':' -f1)
        
        local port_pid=$(lsof -ti:$port 2>/dev/null || echo "")
        if [[ -n "$port_pid" ]]; then
            kill -TERM "$port_pid" 2>/dev/null || true
            sleep 2
            kill -KILL "$port_pid" 2>/dev/null || true
            log "SUCCESS" "Proceso en puerto $port terminado"
        else
            log "INFO" "Servicio $service_name no estaba corriendo"
        fi
    fi
}

# Reiniciar un servicio
restart_service() {
    local service_name=$1
    log "INFO" "Reiniciando servicio $service_name..."
    stop_service "$service_name"
    sleep 2
    start_service "$service_name"
}

# Verificar estado de un servicio
status_service() {
    local service_name=$1
    local service_config="${SERVICES[$service_name]}"
    local port=$(echo "$service_config" | cut -d':' -f1)
    
    local pid=$(get_service_pid "$service_name" || echo "")
    
    if [[ -n "$pid" ]] && kill -0 "$pid" 2>/dev/null; then
        if check_health $port; then
            echo -e "${GREEN}✅ FUNCIONANDO${NC} (PID: $pid, Puerto: $port)"
            return 0
        else
            echo -e "${YELLOW}⚠️  PROCESO ACTIVO PERO NO RESPONDE${NC} (PID: $pid, Puerto: $port)"
            return 1
        fi
    else
        if check_port $port; then
            echo -e "${RED}❌ PUERTO OCUPADO SIN PID REGISTRADO${NC} (Puerto: $port)"
            return 1
        else
            echo -e "${RED}❌ DETENIDO${NC} (Puerto: $port)"
            return 1
        fi
    fi
}

# =============================================================================
# FUNCIONES PRINCIPALES DEL SISTEMA
# =============================================================================

# Iniciar todos los servicios
start_all() {
    log "INFO" "🚀 Iniciando todos los servicios del sistema..."
    
    local success_count=0
    local total_count=${#SERVICES[@]}
    
    for service_name in "${!SERVICES[@]}"; do
        if start_service "$service_name"; then
            ((success_count++))
        fi
    done
    
    log "INFO" "Servicios iniciados: $success_count/$total_count"
    
    if [[ $success_count -eq $total_count ]]; then
        log "SUCCESS" "🎉 ¡Todos los servicios iniciados exitosamente!"
        show_urls
        return 0
    else
        log "WARNING" "⚠️  Algunos servicios no iniciaron correctamente"
        return 1
    fi
}

# Detener todos los servicios
stop_all() {
    log "INFO" "🛑 Deteniendo todos los servicios del sistema..."
    
    for service_name in "${!SERVICES[@]}"; do
        stop_service "$service_name"
    done
    
    log "SUCCESS" "Todos los servicios detenidos"
}

# Reiniciar todos los servicios
restart_all() {
    log "INFO" "🔄 Reiniciando todos los servicios del sistema..."
    stop_all
    sleep 3
    start_all
}

# Mostrar estado de todos los servicios
status_all() {
    log "INFO" "📊 Estado de todos los servicios:"
    echo ""
    
    local healthy=0
    local total=${#SERVICES[@]}
    
    for service_name in "${!SERVICES[@]}"; do
        printf "%-15s: " "$service_name"
        if status_service "$service_name"; then
            ((healthy++))
        fi
    done
    
    echo ""
    if [[ $healthy -eq $total ]]; then
        log "SUCCESS" "✅ Sistema completamente operativo ($healthy/$total servicios)"
    else
        log "WARNING" "⚠️  Sistema parcialmente operativo ($healthy/$total servicios)"
    fi
}

# Mostrar URLs de acceso
show_urls() {
    echo ""
    log "INFO" "🌐 URLs de acceso disponibles:"
    echo -e "  ${CYAN}🛡️  Admin Panel:${NC}     http://localhost:3021"
    echo -e "  ${CYAN}📚 Documentación:${NC}   http://localhost:3021/documentation.html"
    echo -e "  ${CYAN}🤖 AI Service:${NC}       http://localhost:3002/ai/recommendations"
    echo -e "  ${CYAN}🛒 Order Service:${NC}    http://localhost:3004/api/orders"
    echo ""
}

# Verificación completa del sistema
health_check() {
    log "INFO" "🔍 Ejecutando verificación completa del sistema..."
    
    # Ejecutar verificación final si existe
    if [[ -f "$PROJECT_ROOT/verificacion-final.sh" ]]; then
        log "INFO" "Ejecutando verificación detallada..."
        bash "$PROJECT_ROOT/verificacion-final.sh"
    else
        log "WARNING" "Script de verificación detallada no encontrado"
        status_all
    fi
}

# =============================================================================
# FUNCIÓN PRINCIPAL Y MANEJO DE COMANDOS
# =============================================================================

show_help() {
    echo -e "${WHITE}🤖 SISTEMA DE AUTOMATIZACIÓN - FLORES VICTORIA v3.0${NC}"
    echo -e "${WHITE}===============================================${NC}"
    echo ""
    echo -e "${YELLOW}📖 COMANDOS DISPONIBLES:${NC}"
    echo ""
    echo -e "${CYAN}Gestión de Servicios:${NC}"
    echo "  start [servicio]    - Iniciar servicio específico o todos"
    echo "  stop [servicio]     - Detener servicio específico o todos"  
    echo "  restart [servicio]  - Reiniciar servicio específico o todos"
    echo "  status [servicio]   - Ver estado de servicio específico o todos"
    echo ""
    echo -e "${CYAN}Sistema Completo:${NC}"
    echo "  health             - Verificación completa del sistema"
    echo "  urls               - Mostrar URLs de acceso"
    echo "  logs [servicio]    - Ver logs de servicio específico"
    echo "  cleanup            - Limpiar archivos temporales y PIDs"
    echo ""
    echo -e "${CYAN}Automatización:${NC}"
    echo "  watchdog           - Iniciar monitor automático de servicios"
    echo "  install            - Instalación automática completa"
    echo "  update             - Actualizar sistema automáticamente"
    echo ""
    echo -e "${YELLOW}💡 Ejemplos:${NC}"
    echo "  ./automate.sh start              # Iniciar todos los servicios"
    echo "  ./automate.sh start admin-panel  # Iniciar solo admin panel"
    echo "  ./automate.sh status             # Ver estado de todos"
    echo "  ./automate.sh health             # Verificación completa"
    echo ""
    echo -e "${YELLOW}📋 Servicios disponibles:${NC} ${!SERVICES[@]}"
}

# Función principal
main() {
    local command=${1:-"help"}
    local service_name=$2
    
    # Setup inicial
    setup_directories
    
    case $command in
        "start")
            if [[ -n "$service_name" ]]; then
                start_service "$service_name"
            else
                start_all
            fi
            ;;
        "stop")
            if [[ -n "$service_name" ]]; then
                stop_service "$service_name"
            else
                stop_all
            fi
            ;;
        "restart")
            if [[ -n "$service_name" ]]; then
                restart_service "$service_name"
            else
                restart_all
            fi
            ;;
        "status")
            if [[ -n "$service_name" ]]; then
                echo -n "$service_name: "
                status_service "$service_name"
            else
                status_all
            fi
            ;;
        "health")
            health_check
            ;;
        "urls")
            show_urls
            ;;
        "logs")
            if [[ -n "$service_name" ]]; then
                local log_file="$LOGS_DIR/${service_name}.log"
                if [[ -f "$log_file" ]]; then
                    tail -f "$log_file"
                else
                    log "ERROR" "Log file not found: $log_file"
                    exit 1
                fi
            else
                log "INFO" "Mostrando logs de automatización:"
                tail -f "$LOGS_DIR/automation.log"
            fi
            ;;
        "cleanup")
            log "INFO" "Limpiando archivos temporales..."
            rm -rf "$PID_DIR"/*.pid 2>/dev/null || true
            log "SUCCESS" "Limpieza completada"
            ;;
        "help"|"--help"|"-h")
            show_help
            ;;
        *)
            log "ERROR" "Comando desconocido: $command"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

# Manejo de señales para cleanup
cleanup_on_exit() {
    log "INFO" "Recibida señal de terminación, limpiando..."
    exit 0
}

trap cleanup_on_exit SIGINT SIGTERM

# Ejecutar función principal
main "$@"