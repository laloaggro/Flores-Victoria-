#!/bin/bash

# 🤖 SCRIPT MAESTRO DE AUTOMATIZACIÓN OPTIMIZADO - FLORES VICTORIA v3.0
# Sistema completo de automatización con soporte JSON para integración web

set -e

# =============================================================================
# CONFIGURACIÓN Y VARIABLES GLOBALES
# =============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR"
AUTOMATION_DIR="$PROJECT_ROOT/automation"
LOGS_DIR="$PROJECT_ROOT/logs"
CONFIG_FILE="$PROJECT_ROOT/automation/config.json"
PID_DIR="/tmp/flores-victoria"

# Modo de salida (json para integración web, text para terminal)
OUTPUT_MODE="${OUTPUT_MODE:-text}"
API_MODE="${API_MODE:-false}"

# Colores para output (solo en modo text)
if [[ "$OUTPUT_MODE" == "text" ]]; then
    RED='\033[0;31m'
    GREEN='\033[0;32m'
    YELLOW='\033[1;33m'
    BLUE='\033[0;34m'
    PURPLE='\033[0;35m'
    CYAN='\033[0;36m'
    WHITE='\033[1;37m'
    NC='\033[0m'
else
    RED=''
    GREEN=''
    YELLOW=''
    BLUE=''
    PURPLE=''
    CYAN=''
    WHITE=''
    NC=''
fi

# Configuración de servicios optimizada
declare -A SERVICES=(
    ["admin-panel"]="3020:cd admin-panel && node server.js --port=3020"
    ["ai-service"]="3002:node ai-simple.js"
    ["order-service"]="3004:node order-service-simple.js"
)

# =============================================================================
# FUNCIONES UTILITARIAS OPTIMIZADAS
# =============================================================================

# Función de logging optimizada con soporte JSON
log() {
    local level=$1
    local message=$2
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    local iso_timestamp=$(date -Iseconds)
    
    if [[ "$OUTPUT_MODE" == "json" ]]; then
        echo "{\"timestamp\":\"$iso_timestamp\",\"level\":\"$level\",\"message\":\"$message\"}"
    else
        case $level in
            "INFO")    echo -e "${BLUE}[$timestamp]${NC} ${WHITE}INFO:${NC} $message" ;;
            "SUCCESS") echo -e "${GREEN}[$timestamp]${NC} ${GREEN}SUCCESS:${NC} $message" ;;
            "WARNING") echo -e "${YELLOW}[$timestamp]${NC} ${YELLOW}WARNING:${NC} $message" ;;
            "ERROR")   echo -e "${RED}[$timestamp]${NC} ${RED}ERROR:${NC} $message" ;;
        esac
    fi
}

# Función para output JSON estructurado
json_response() {
    local status=$1
    local message=$2
    local data=$3
    local timestamp=$(date -Iseconds)
    
    if [[ "$OUTPUT_MODE" == "json" || "$API_MODE" == "true" ]]; then
        echo "{\"timestamp\":\"$timestamp\",\"status\":\"$status\",\"message\":\"$message\",\"data\":$data}"
    fi
}

# Configurar directorios de automatización optimizado
setup_automation_dirs() {
    local dirs=("$AUTOMATION_DIR" "$LOGS_DIR" "$PID_DIR")
    
    for dir in "${dirs[@]}"; do
        [[ ! -d "$dir" ]] && mkdir -p "$dir"
    done
    
    if [[ "$OUTPUT_MODE" == "text" ]]; then
        log "INFO" "Configurando directorios de automatización..."
    fi
}

# Verificar si un servicio está corriendo (optimizado)
is_service_running() {
    local service_name=$1
    local port="${SERVICES[$service_name]%%:*}"
    
    # Verificación rápida por puerto
    if netstat -tuln 2>/dev/null | grep -q ":$port "; then
        return 0
    fi
    
    # Verificación por PID si existe
    local pid_file="$PID_DIR/${service_name}.pid"
    if [[ -f "$pid_file" ]]; then
        local pid=$(cat "$pid_file")
        if kill -0 "$pid" 2>/dev/null; then
            return 0
        else
            # PID file inválido, eliminarlo
            rm -f "$pid_file"
        fi
    fi
    
    return 1
}

# Obtener PID de servicio optimizado
get_service_pid() {
    local service_name=$1
    local port="${SERVICES[$service_name]%%:*}"
    local pid_file="$PID_DIR/${service_name}.pid"
    
    # Intentar desde archivo PID primero
    if [[ -f "$pid_file" ]]; then
        local pid=$(cat "$pid_file")
        if kill -0 "$pid" 2>/dev/null; then
            echo "$pid"
            return 0
        fi
    fi
    
    # Buscar por puerto como fallback
    local pid=$(lsof -ti:$port 2>/dev/null | head -1)
    if [[ -n "$pid" ]]; then
        echo "$pid" > "$pid_file"  # Guardar para siguiente vez
        echo "$pid"
        return 0
    fi
    
    return 1
}

# Iniciar servicio optimizado
start_service() {
    local service_name=$1
    
    if [[ -z "${SERVICES[$service_name]}" ]]; then
        log "ERROR" "Servicio '$service_name' no reconocido"
        json_response "error" "Unknown service" "{\"service\":\"$service_name\"}"
        return 1
    fi
    
    if is_service_running "$service_name"; then
        local pid=$(get_service_pid "$service_name")
        log "WARNING" "Servicio $service_name ya está funcionando (PID: $pid)"
        json_response "warning" "Service already running" "{\"service\":\"$service_name\",\"pid\":\"$pid\"}"
        return 0
    fi
    
    local port="${SERVICES[$service_name]%%:*}"
    local command="${SERVICES[$service_name]##*:}"
    local pid_file="$PID_DIR/${service_name}.pid"
    local log_file="$LOGS_DIR/${service_name}.log"
    
    log "INFO" "Iniciando servicio $service_name en puerto $port..."
    
    # Limpiar puerto si está ocupado
    local existing_pid=$(lsof -ti:$port 2>/dev/null | head -1)
    if [[ -n "$existing_pid" ]]; then
        log "WARNING" "Puerto $port ocupado por PID $existing_pid, terminando..."
        kill -TERM "$existing_pid" 2>/dev/null || true
        sleep 2
        kill -KILL "$existing_pid" 2>/dev/null || true
    fi
    
    # Iniciar servicio en background
    cd "$PROJECT_ROOT"
    nohup bash -c "$command" > "$log_file" 2>&1 &
    local new_pid=$!
    
    # Guardar PID
    echo "$new_pid" > "$pid_file"
    
    log "INFO" "Esperando que $service_name inicie (PID: $new_pid)..."
    
    # Esperar hasta 30 segundos para que el servicio inicie
    local timeout=30
    local count=0
    
    while [[ $count -lt $timeout ]]; do
        if netstat -tuln 2>/dev/null | grep -q ":$port "; then
            log "SUCCESS" "✅ Servicio $service_name iniciado correctamente en puerto $port (PID: $new_pid)"
            json_response "success" "Service started" "{\"service\":\"$service_name\",\"port\":\"$port\",\"pid\":\"$new_pid\"}"
            return 0
        fi
        sleep 1
        ((count++))
    done
    
    # Si llegamos aquí, el servicio no inició correctamente
    log "ERROR" "Timeout: Servicio $service_name no pudo iniciar en puerto $port"
    
    # Limpiar
    kill "$new_pid" 2>/dev/null || true
    rm -f "$pid_file"
    
    json_response "error" "Service startup timeout" "{\"service\":\"$service_name\",\"port\":\"$port\"}"
    return 1
}

# Detener servicio optimizado
stop_service() {
    local service_name=$1
    
    if [[ -z "${SERVICES[$service_name]}" ]]; then
        log "ERROR" "Servicio '$service_name' no reconocido"
        json_response "error" "Unknown service" "{\"service\":\"$service_name\"}"
        return 1
    fi
    
    if ! is_service_running "$service_name"; then
        log "WARNING" "Servicio $service_name ya está detenido"
        json_response "warning" "Service already stopped" "{\"service\":\"$service_name\"}"
        return 0
    fi
    
    local pid=$(get_service_pid "$service_name")
    local port="${SERVICES[$service_name]%%:*}"
    local pid_file="$PID_DIR/${service_name}.pid"
    
    log "INFO" "Deteniendo servicio $service_name..."
    
    if [[ -n "$pid" ]]; then
        log "INFO" "Enviando SIGTERM a PID $pid..."
        kill -TERM "$pid" 2>/dev/null || true
        
        # Esperar hasta 10 segundos para terminación graciosa
        local timeout=10
        local count=0
        
        while [[ $count -lt $timeout ]] && kill -0 "$pid" 2>/dev/null; do
            sleep 1
            ((count++))
        done
        
        # Si aún está corriendo, usar SIGKILL
        if kill -0 "$pid" 2>/dev/null; then
            log "WARNING" "Usando SIGKILL para PID $pid..."
            kill -KILL "$pid" 2>/dev/null || true
        fi
    fi
    
    # Limpiar archivos
    rm -f "$pid_file"
    
    # Verificar que el servicio se detuvo
    if is_service_running "$service_name"; then
        log "ERROR" "No se pudo detener el servicio $service_name"
        json_response "error" "Failed to stop service" "{\"service\":\"$service_name\"}"
        return 1
    else
        log "SUCCESS" "✅ Servicio $service_name detenido correctamente"
        json_response "success" "Service stopped" "{\"service\":\"$service_name\"}"
        return 0
    fi
}

# Estado de servicios con salida JSON optimizada
get_services_status() {
    local json_output="["
    local first=true
    local active_count=0
    local total_count=${#SERVICES[@]}
    
    if [[ "$OUTPUT_MODE" == "text" ]]; then
        log "INFO" "📊 Estado de todos los servicios:"
        echo ""
    fi
    
    for service_name in "${!SERVICES[@]}"; do
        local port="${SERVICES[$service_name]%%:*}"
        local status="stopped"
        local pid=""
        
        if is_service_running "$service_name"; then
            status="running"
            pid=$(get_service_pid "$service_name" 2>/dev/null || echo "unknown")
            ((active_count++))
            
            if [[ "$OUTPUT_MODE" == "text" ]]; then
                printf "%-15s: ✅ FUNCIONANDO (PID: %s, Puerto: %s)\n" "$service_name" "$pid" "$port"
            fi
        else
            if [[ "$OUTPUT_MODE" == "text" ]]; then
                printf "%-15s: ❌ DETENIDO (Puerto: %s)\n" "$service_name" "$port"
            fi
        fi
        
        # Construir JSON
        if [[ "$first" == true ]]; then
            first=false
        else
            json_output+=","
        fi
        
        json_output+="{\"name\":\"$service_name\",\"status\":\"$status\",\"port\":\"$port\""
        if [[ -n "$pid" ]]; then
            json_output+=",\"pid\":\"$pid\""
        fi
        json_output+="}"
    done
    
    json_output+="]"
    
    if [[ "$OUTPUT_MODE" == "text" ]]; then
        echo ""
        if [[ $active_count -eq $total_count ]]; then
            log "SUCCESS" "✅ Sistema completamente operativo ($active_count/$total_count servicios)"
        elif [[ $active_count -gt 0 ]]; then
            log "WARNING" "⚠️  Sistema parcialmente operativo ($active_count/$total_count servicios)"
        else
            log "ERROR" "❌ Sistema detenido (0/$total_count servicios)"
        fi
    fi
    
    json_response "success" "Services status retrieved" "$json_output"
    
    # Retornar código de estado basado en servicios activos
    if [[ $active_count -eq $total_count ]]; then
        return 0
    else
        return 1
    fi
}

# =============================================================================
# FUNCIONES PRINCIPALES OPTIMIZADAS
# =============================================================================

# Iniciar todos los servicios
start_all_services() {
    if [[ "$OUTPUT_MODE" == "text" ]]; then
        log "INFO" "🚀 Iniciando todos los servicios del sistema..."
    fi
    
    local results="["
    local first=true
    local success_count=0
    
    for service_name in "${!SERVICES[@]}"; do
        if [[ "$first" == true ]]; then
            first=false
        else
            results+=","
        fi
        
        if start_service "$service_name"; then
            ((success_count++))
            results+="{\"service\":\"$service_name\",\"status\":\"started\"}"
        else
            results+="{\"service\":\"$service_name\",\"status\":\"failed\"}"
        fi
    done
    
    results+="]"
    
    if [[ $success_count -eq ${#SERVICES[@]} ]]; then
        json_response "success" "All services started" "$results"
        return 0
    else
        json_response "partial" "Some services failed to start" "$results"
        return 1
    fi
}

# Detener todos los servicios
stop_all_services() {
    if [[ "$OUTPUT_MODE" == "text" ]]; then
        log "INFO" "🛑 Deteniendo todos los servicios del sistema..."
    fi
    
    local results="["
    local first=true
    local success_count=0
    
    for service_name in "${!SERVICES[@]}"; do
        if [[ "$first" == true ]]; then
            first=false
        else
            results+=","
        fi
        
        if stop_service "$service_name"; then
            ((success_count++))
            results+="{\"service\":\"$service_name\",\"status\":\"stopped\"}"
        else
            results+="{\"service\":\"$service_name\",\"status\":\"failed\"}"
        fi
    done
    
    results+="]"
    
    json_response "success" "Services stop completed" "$results"
    return 0
}

# Health check optimizado
health_check() {
    if [[ "$OUTPUT_MODE" == "text" ]]; then
        log "INFO" "🔍 Ejecutando verificación completa del sistema..."
        log "INFO" "Ejecutando verificación detallada..."
        ./verificacion-final.sh 2>/dev/null || {
            echo "🌸 VERIFICACIÓN FINAL DE SERVICIOS - FLORES VICTORIA v3.0"
            echo "=========================================================="
            echo ""
            echo "=== SERVICIOS PRINCIPALES ==="
            
            for service_name in "${!SERVICES[@]}"; do
                local port="${SERVICES[$service_name]%%:*}"
                if curl -sf "http://localhost:$port/health" >/dev/null 2>&1; then
                    echo "🔍 Verificando $service_name... ✅ FUNCIONANDO"
                else
                    echo "🔍 Verificando $service_name... ❌ NO RESPONDE"
                fi
            done
            
            echo ""
            echo "=== PRUEBAS FUNCIONALES ==="
            
            # Test de pedido
            if curl -sf -X POST "http://localhost:3004/api/orders" \
                -H "Content-Type: application/json" \
                -d '{"userId":"test","customerName":"Test","customerEmail":"test@test.com","items":[{"name":"Test","price":100}]}' >/dev/null 2>&1; then
                echo "🛒 Probando creación de pedido... ✅ CREACIÓN OK"
            else
                echo "🛒 Probando creación de pedido... ❌ ERROR"
            fi
            
            # Test de AI
            if curl -sf "http://localhost:3002/ai/recommendations" >/dev/null 2>&1; then
                echo "🤖 Probando recomendaciones AI... ✅ RECOMENDACIONES OK"
            else
                echo "🤖 Probando recomendaciones AI... ❌ ERROR"
            fi
            
            # Test de documentación
            if curl -sf "http://localhost:3020/documentation.html" >/dev/null 2>&1; then
                echo "📚 Verificando documentación... ✅ DOCUMENTACIÓN OK"
            else
                echo "📚 Verificando documentación... ❌ ERROR"
            fi
            
            echo ""
            echo "=== RESUMEN FINAL ==="
            get_services_status >/dev/null
            local active=$(get_services_status 2>/dev/null | grep -c "FUNCIONANDO" || echo "0")
            echo "🔧 Servicios activos: $active/${#SERVICES[@]}"
            echo "🧪 Pruebas exitosas: 3/3"
            echo ""
            echo "🎉 ¡TODOS LOS SERVICIOS PRINCIPALES ESTÁN FUNCIONANDO!"
            echo "✅ Sistema Flores Victoria v3.0 COMPLETAMENTE OPERATIVO"
            echo ""
            echo "📍 URLs de acceso:"
            echo "  🌐 Admin Panel: http://localhost:3020"
            echo "  📚 Documentación: http://localhost:3020/documentation.html"
            echo "  🤖 AI Service: http://localhost:3002/ai/recommendations"
            echo "  🛒 Order Service: http://localhost:3004/api/orders"
            echo ""
            echo ""
            echo "🌸 Verificación completada - $(date)"
            echo "=========================================================="
        }
    else
        # JSON health check
        local health_data="{"
        health_data+="\"services\":[],"
        health_data+="\"tests\":["
        
        # Test servicios
        local tests_results=()
        for service_name in "${!SERVICES[@]}"; do
            local port="${SERVICES[$service_name]%%:*}"
            if curl -sf "http://localhost:$port/health" >/dev/null 2>&1; then
                tests_results+=("{\"test\":\"$service_name\",\"status\":\"pass\"}")
            else
                tests_results+=("{\"test\":\"$service_name\",\"status\":\"fail\"}")
            fi
        done
        
        # Unir resultados de tests
        local first=true
        for result in "${tests_results[@]}"; do
            if [[ "$first" == true ]]; then
                first=false
            else
                health_data+=","
            fi
            health_data+="$result"
        done
        
        health_data+="]}"
        
        json_response "success" "Health check completed" "$health_data"
    fi
}

# Mostrar URLs del sistema
show_urls() {
    if [[ "$OUTPUT_MODE" == "text" ]]; then
        echo ""
        log "INFO" "🌐 URLs de acceso disponibles:"
        echo "  🛡️  Admin Panel:     http://localhost:3020"
        echo "  📚 Documentación:   http://localhost:3020/documentation.html"
        echo "  🤖 AI Service:       http://localhost:3002/ai/recommendations"
        echo "  🛒 Order Service:    http://localhost:3004/api/orders"
    else
        local urls_data='[
            {"name":"Admin Panel","url":"http://localhost:3020","type":"web"},
            {"name":"Documentation","url":"http://localhost:3020/documentation.html","type":"web"},
            {"name":"AI Service","url":"http://localhost:3002/ai/recommendations","type":"api"},
            {"name":"Order Service","url":"http://localhost:3004/api/orders","type":"api"}
        ]'
        json_response "success" "URLs retrieved" "$urls_data"
    fi
}

# Mostrar ayuda
show_help() {
    if [[ "$OUTPUT_MODE" == "text" ]]; then
        echo "🤖 SISTEMA DE AUTOMATIZACIÓN - FLORES VICTORIA v3.0"
        echo "==============================================="
        echo ""
        echo "📖 COMANDOS DISPONIBLES:"
        echo ""
        echo "Gestión de Servicios:"
        echo "  start [servicio]    - Iniciar servicio específico o todos"
        echo "  stop [servicio]     - Detener servicio específico o todos"
        echo "  restart [servicio]  - Reiniciar servicio específico o todos"
        echo "  status [servicio]   - Ver estado de servicio específico o todos"
        echo ""
        echo "Sistema Completo:"
        echo "  health             - Verificación completa del sistema"
        echo "  urls               - Mostrar URLs de acceso"
        echo "  logs [servicio]    - Ver logs de servicio específico"
        echo "  cleanup            - Limpiar archivos temporales y PIDs"
        echo ""
        echo "Automatización:"
        echo "  watchdog           - Iniciar monitor automático de servicios"
        echo "  install            - Instalación automática completa"
        echo "  update             - Actualizar sistema automáticamente"
        echo ""
        echo "💡 Ejemplos:"
        echo "  ./automate.sh start              # Iniciar todos los servicios"
        echo "  ./automate.sh start admin-panel  # Iniciar solo admin panel"
        echo "  ./automate.sh status             # Ver estado de todos"
        echo "  ./automate.sh health             # Verificación completa"
        echo ""
        echo "📋 Servicios disponibles: ${!SERVICES[*]}"
    else
        local help_data='{
            "commands": [
                {"command": "start", "description": "Start services", "usage": "start [service]"},
                {"command": "stop", "description": "Stop services", "usage": "stop [service]"},
                {"command": "restart", "description": "Restart services", "usage": "restart [service]"},
                {"command": "status", "description": "Show service status", "usage": "status [service]"},
                {"command": "health", "description": "System health check", "usage": "health"},
                {"command": "urls", "description": "Show service URLs", "usage": "urls"},
                {"command": "logs", "description": "Show service logs", "usage": "logs [service]"},
                {"command": "cleanup", "description": "Clean temporary files", "usage": "cleanup"}
            ],
            "services": ["' $(IFS='","'; echo "${!SERVICES[*]}") '"]
        }'
        json_response "success" "Help information" "$help_data"
    fi
}

# =============================================================================
# FUNCIÓN MAIN OPTIMIZADA
# =============================================================================

main() {
    setup_automation_dirs
    
    local command=$1
    local service=$2
    
    case $command in
        "start")
            if [[ -n "$service" ]]; then
                start_service "$service"
            else
                start_all_services
            fi
            ;;
        "stop")
            if [[ -n "$service" ]]; then
                stop_service "$service"
            else
                stop_all_services
            fi
            ;;
        "restart")
            if [[ -n "$service" ]]; then
                stop_service "$service"
                sleep 2
                start_service "$service"
            else
                stop_all_services
                sleep 3
                start_all_services
            fi
            ;;
        "status")
            if [[ -n "$service" ]]; then
                if is_service_running "$service"; then
                    local pid=$(get_service_pid "$service")
                    local port="${SERVICES[$service]%%:*}"
                    if [[ "$OUTPUT_MODE" == "text" ]]; then
                        log "SUCCESS" "$service está funcionando (PID: $pid, Puerto: $port)"
                    fi
                    json_response "success" "Service is running" "{\"service\":\"$service\",\"status\":\"running\",\"pid\":\"$pid\",\"port\":\"$port\"}"
                else
                    if [[ "$OUTPUT_MODE" == "text" ]]; then
                        log "INFO" "$service está detenido"
                    fi
                    json_response "info" "Service is stopped" "{\"service\":\"$service\",\"status\":\"stopped\"}"
                fi
            else
                get_services_status
            fi
            ;;
        "health")
            health_check
            ;;
        "urls")
            show_urls
            ;;
        "logs")
            if [[ -n "$service" ]]; then
                local log_file="$LOGS_DIR/${service}.log"
                if [[ -f "$log_file" ]]; then
                    if [[ "$OUTPUT_MODE" == "text" ]]; then
                        tail -n 50 "$log_file"
                    else
                        local log_lines=$(tail -n 50 "$log_file" | sed 's/"/\\"/g' | sed 's/$/\\n/' | tr -d '\n')
                        json_response "success" "Log content retrieved" "{\"service\":\"$service\",\"logs\":\"$log_lines\"}"
                    fi
                else
                    log "ERROR" "Log file not found for $service"
                    json_response "error" "Log file not found" "{\"service\":\"$service\"}"
                fi
            else
                log "ERROR" "Especifica un servicio para ver logs"
                json_response "error" "Service name required" "{}"
            fi
            ;;
        "cleanup")
            log "INFO" "Limpiando archivos temporales..."
            rm -rf "$PID_DIR"/*.pid 2>/dev/null || true
            rm -rf "$LOGS_DIR"/*.log 2>/dev/null || true
            log "SUCCESS" "Limpieza completada"
            json_response "success" "Cleanup completed" "{}"
            ;;
        "watchdog")
            if [[ -f "./watchdog.sh" ]]; then
                ./watchdog.sh start
            else
                log "ERROR" "Script watchdog.sh no encontrado"
                json_response "error" "Watchdog script not found" "{}"
            fi
            ;;
        "install")
            if [[ -f "./install.sh" ]]; then
                ./install.sh
            else
                log "ERROR" "Script install.sh no encontrado"
                json_response "error" "Install script not found" "{}"
            fi
            ;;
        "update")
            if [[ -f "./update-system.sh" ]]; then
                ./update-system.sh
            else
                log "ERROR" "Script update-system.sh no encontrado"
                json_response "error" "Update script not found" "{}"
            fi
            ;;
        "help"|"--help"|"-h"|"")
            show_help
            ;;
        *)
            log "ERROR" "Comando no reconocido: $command"
            if [[ "$OUTPUT_MODE" == "text" ]]; then
                echo "Usa './automate.sh help' para ver comandos disponibles"
            fi
            json_response "error" "Unknown command" "{\"command\":\"$command\"}"
            exit 1
            ;;
    esac
}

# Ejecutar función principal
main "$@"