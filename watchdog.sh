#!/bin/bash

# 🐕 SISTEMA WATCHDOG AUTOMÁTICO - FLORES VICTORIA v3.0
# Monitoreo continuo y recuperación automática de servicios

set -e

# =============================================================================
# CONFIGURACIÓN
# =============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR"
WATCHDOG_PID_FILE="/tmp/flores-victoria/watchdog.pid"
WATCHDOG_LOG="$PROJECT_ROOT/logs/watchdog.log"
CHECK_INTERVAL=30  # Segundos entre verificaciones
MAX_RESTART_ATTEMPTS=3
RESTART_COOLDOWN=300  # 5 minutos entre reintentos

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Servicios a monitorear
declare -A SERVICES=(
    ["admin-panel"]="3021"
    ["ai-service"]="3002"
    ["order-service"]="3004"
)

# Contadores de reintentos
declare -A RESTART_COUNTS
declare -A LAST_RESTART_TIME

# =============================================================================
# FUNCIONES UTILITARIAS
# =============================================================================

log_watchdog() {
    local level=$1
    local message=$2
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    case $level in
        "INFO")  echo -e "${BLUE}[$timestamp]${NC} ${CYAN}WATCHDOG:${NC} $message" ;;
        "SUCCESS") echo -e "${GREEN}[$timestamp]${NC} ${GREEN}WATCHDOG:${NC} $message" ;;
        "WARNING") echo -e "${YELLOW}[$timestamp]${NC} ${YELLOW}WATCHDOG:${NC} $message" ;;
        "ERROR") echo -e "${RED}[$timestamp]${NC} ${RED}WATCHDOG:${NC} $message" ;;
    esac
    
    # Log a archivo
    echo "[$timestamp] WATCHDOG $level: $message" >> "$WATCHDOG_LOG"
}

# Verificar si el watchdog ya está corriendo
is_watchdog_running() {
    if [[ -f "$WATCHDOG_PID_FILE" ]]; then
        local pid=$(cat "$WATCHDOG_PID_FILE")
        if kill -0 "$pid" 2>/dev/null; then
            return 0
        else
            rm -f "$WATCHDOG_PID_FILE"
        fi
    fi
    return 1
}

# Verificar health de un servicio
check_service_health() {
    local service_name=$1
    local port=${SERVICES[$service_name]}
    
    # Verificar que el puerto esté escuchando
    if ! lsof -ti:$port >/dev/null 2>&1; then
        return 1
    fi
    
    # Verificar health endpoint
    if curl -s --connect-timeout 5 --max-time 10 "http://localhost:$port/health" >/dev/null 2>&1; then
        return 0
    fi
    
    return 1
}

# Intentar recuperar un servicio
recover_service() {
    local service_name=$1
    local current_time=$(date +%s)
    local restart_count=${RESTART_COUNTS[$service_name]:-0}
    local last_restart=${LAST_RESTART_TIME[$service_name]:-0}
    
    # Verificar cooldown
    if [[ $((current_time - last_restart)) -lt $RESTART_COOLDOWN ]]; then
        log_watchdog "WARNING" "Servicio $service_name en cooldown, esperando..."
        return 1
    fi
    
    # Verificar límite de reintentos
    if [[ $restart_count -ge $MAX_RESTART_ATTEMPTS ]]; then
        log_watchdog "ERROR" "Servicio $service_name alcanzó el límite de reintentos ($MAX_RESTART_ATTEMPTS)"
        
        # Reset contador después de 1 hora
        if [[ $((current_time - last_restart)) -gt 3600 ]]; then
            RESTART_COUNTS[$service_name]=0
            log_watchdog "INFO" "Reseteando contador de reintentos para $service_name"
        else
            return 1
        fi
    fi
    
    log_watchdog "WARNING" "Intentando recuperar servicio $service_name (intento $((restart_count + 1))/$MAX_RESTART_ATTEMPTS)..."
    
    # Usar el script maestro para reiniciar
    if "$PROJECT_ROOT/automate.sh" restart "$service_name" >/dev/null 2>&1; then
        RESTART_COUNTS[$service_name]=0
        LAST_RESTART_TIME[$service_name]=$current_time
        log_watchdog "SUCCESS" "✅ Servicio $service_name recuperado exitosamente"
        
        # Enviar notificación de recuperación
        send_notification "recovery" "$service_name" "Servicio recuperado automáticamente"
        return 0
    else
        RESTART_COUNTS[$service_name]=$((restart_count + 1))
        LAST_RESTART_TIME[$service_name]=$current_time
        log_watchdog "ERROR" "❌ Falló la recuperación del servicio $service_name"
        
        # Enviar notificación de fallo
        send_notification "failure" "$service_name" "Falló la recuperación automática (intento $((restart_count + 1)))"
        return 1
    fi
}

# Sistema básico de notificaciones
send_notification() {
    local type=$1
    local service=$2
    local message=$3
    
    # Log como notificación por ahora
    case $type in
        "failure")
            log_watchdog "ERROR" "🚨 ALERTA: $service - $message"
            ;;
        "recovery")
            log_watchdog "SUCCESS" "🎉 RECUPERACIÓN: $service - $message"
            ;;
        "degraded")
            log_watchdog "WARNING" "⚠️  DEGRADADO: $service - $message"
            ;;
    esac
    
    # Aquí se pueden agregar más tipos de notificaciones:
    # - Email (usando sendmail)
    # - Slack webhook
    # - Discord webhook
    # - Sistema de logs centralizado
}

# Verificar recursos del sistema
check_system_resources() {
    local cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1 | cut -d',' -f1)
    local memory_usage=$(free | grep Mem | awk '{printf("%.1f", $3/$2 * 100.0)}')
    local disk_usage=$(df -h / | awk 'NR==2{printf("%s", $5)}' | sed 's/%//')
    
    # Alertas de recursos
    if [[ ${cpu_usage%.*} -gt 80 ]]; then
        log_watchdog "WARNING" "⚠️  CPU alto: ${cpu_usage}%"
    fi
    
    if [[ ${memory_usage%.*} -gt 80 ]]; then
        log_watchdog "WARNING" "⚠️  Memoria alta: ${memory_usage}%"
    fi
    
    if [[ $disk_usage -gt 80 ]]; then
        log_watchdog "WARNING" "⚠️  Disco lleno: ${disk_usage}%"
    fi
    
    # Log recursos cada 10 ciclos (5 minutos aprox)
    local cycle_counter_file="/tmp/flores-victoria/resource_cycle_counter"
    local counter=0
    if [[ -f "$cycle_counter_file" ]]; then
        counter=$(cat "$cycle_counter_file")
    fi
    
    counter=$((counter + 1))
    
    if [[ $counter -ge 10 ]]; then
        log_watchdog "INFO" "📊 Recursos del sistema - CPU: ${cpu_usage}%, RAM: ${memory_usage}%, Disco: ${disk_usage}%"
        counter=0
    fi
    
    echo "$counter" > "$cycle_counter_file"
}

# =============================================================================
# BUCLE PRINCIPAL DEL WATCHDOG
# =============================================================================

watchdog_loop() {
    log_watchdog "INFO" "🐕 Watchdog iniciado con PID $$"
    log_watchdog "INFO" "Monitoreando servicios: ${!SERVICES[@]}"
    log_watchdog "INFO" "Intervalo de verificación: ${CHECK_INTERVAL}s"
    
    # Guardar PID
    echo $$ > "$WATCHDOG_PID_FILE"
    
    local cycle_count=0
    
    while true; do
        cycle_count=$((cycle_count + 1))
        
        # Verificar cada servicio
        local healthy_services=0
        local total_services=${#SERVICES[@]}
        
        for service_name in "${!SERVICES[@]}"; do
            if check_service_health "$service_name"; then
                ((healthy_services++))
                # Reset restart counter en servicios saludables
                RESTART_COUNTS[$service_name]=0
            else
                log_watchdog "WARNING" "❌ Servicio $service_name no responde"
                recover_service "$service_name"
            fi
        done
        
        # Verificar recursos del sistema
        check_system_resources
        
        # Log de estado cada 20 ciclos (10 minutos aprox)
        if [[ $((cycle_count % 20)) -eq 0 ]]; then
            log_watchdog "INFO" "📊 Estado del sistema: $healthy_services/$total_services servicios saludables (ciclo $cycle_count)"
        fi
        
        # Esperar antes del siguiente ciclo
        sleep $CHECK_INTERVAL
    done
}

# =============================================================================
# FUNCIONES DE CONTROL
# =============================================================================

start_watchdog() {
    if is_watchdog_running; then
        local pid=$(cat "$WATCHDOG_PID_FILE")
        echo -e "${YELLOW}⚠️  Watchdog ya está corriendo con PID $pid${NC}"
        return 1
    fi
    
    echo -e "${BLUE}🐕 Iniciando sistema Watchdog...${NC}"
    
    # Crear directorios necesarios
    mkdir -p "$(dirname "$WATCHDOG_PID_FILE")" "$(dirname "$WATCHDOG_LOG")"
    
    # Inicializar contadores
    for service_name in "${!SERVICES[@]}"; do
        RESTART_COUNTS[$service_name]=0
        LAST_RESTART_TIME[$service_name]=0
    done
    
    # Iniciar en background
    nohup bash -c "$(declare -p SERVICES RESTART_COUNTS LAST_RESTART_TIME); $(declare -f log_watchdog check_service_health recover_service send_notification check_system_resources watchdog_loop); watchdog_loop" >> "$WATCHDOG_LOG" 2>&1 &
    
    local watchdog_pid=$!
    echo $watchdog_pid > "$WATCHDOG_PID_FILE"
    
    sleep 2
    
    if kill -0 $watchdog_pid 2>/dev/null; then
        echo -e "${GREEN}✅ Watchdog iniciado exitosamente con PID $watchdog_pid${NC}"
        echo -e "${CYAN}📝 Logs: $WATCHDOG_LOG${NC}"
        return 0
    else
        echo -e "${RED}❌ Error al iniciar Watchdog${NC}"
        rm -f "$WATCHDOG_PID_FILE"
        return 1
    fi
}

stop_watchdog() {
    if ! is_watchdog_running; then
        echo -e "${YELLOW}⚠️  Watchdog no está corriendo${NC}"
        return 1
    fi
    
    local pid=$(cat "$WATCHDOG_PID_FILE")
    echo -e "${BLUE}🛑 Deteniendo Watchdog (PID $pid)...${NC}"
    
    kill -TERM $pid 2>/dev/null || true
    
    # Esperar terminación graceful
    local count=0
    while kill -0 $pid 2>/dev/null && [[ $count -lt 10 ]]; do
        sleep 1
        ((count++))
    done
    
    # Forzar si es necesario
    if kill -0 $pid 2>/dev/null; then
        kill -KILL $pid 2>/dev/null || true
    fi
    
    rm -f "$WATCHDOG_PID_FILE"
    echo -e "${GREEN}✅ Watchdog detenido${NC}"
}

status_watchdog() {
    if is_watchdog_running; then
        local pid=$(cat "$WATCHDOG_PID_FILE")
        echo -e "${GREEN}✅ Watchdog está corriendo${NC} (PID: $pid)"
        echo -e "${CYAN}📝 Log: $WATCHDOG_LOG${NC}"
        echo -e "${CYAN}🔄 Intervalo: ${CHECK_INTERVAL}s${NC}"
        
        # Mostrar últimas líneas del log
        if [[ -f "$WATCHDOG_LOG" ]]; then
            echo ""
            echo -e "${BLUE}📋 Últimas actividades:${NC}"
            tail -5 "$WATCHDOG_LOG" | while read line; do
                echo "  $line"
            done
        fi
        return 0
    else
        echo -e "${RED}❌ Watchdog no está corriendo${NC}"
        return 1
    fi
}

show_watchdog_help() {
    echo -e "${CYAN}🐕 SISTEMA WATCHDOG AUTOMÁTICO - FLORES VICTORIA v3.0${NC}"
    echo -e "${CYAN}=================================================${NC}"
    echo ""
    echo -e "${YELLOW}📖 COMANDOS DISPONIBLES:${NC}"
    echo "  start    - Iniciar el sistema watchdog"
    echo "  stop     - Detener el sistema watchdog"
    echo "  restart  - Reiniciar el sistema watchdog"
    echo "  status   - Ver estado del watchdog"
    echo "  logs     - Ver logs en tiempo real"
    echo "  config   - Mostrar configuración actual"
    echo ""
    echo -e "${YELLOW}🔧 CARACTERÍSTICAS:${NC}"
    echo "  • Monitoreo continuo cada ${CHECK_INTERVAL} segundos"
    echo "  • Recuperación automática de servicios caídos"
    echo "  • Límite de ${MAX_RESTART_ATTEMPTS} reintentos por servicio"
    echo "  • Cooldown de ${RESTART_COOLDOWN} segundos entre reintentos"
    echo "  • Monitoreo de recursos del sistema"
    echo "  • Sistema de notificaciones integrado"
    echo ""
    echo -e "${YELLOW}📋 Servicios monitoreados:${NC} ${!SERVICES[@]}"
}

# =============================================================================
# FUNCIÓN PRINCIPAL
# =============================================================================

main() {
    local command=${1:-"help"}
    
    case $command in
        "start")
            start_watchdog
            ;;
        "stop")
            stop_watchdog
            ;;
        "restart")
            echo -e "${BLUE}🔄 Reiniciando Watchdog...${NC}"
            stop_watchdog
            sleep 2
            start_watchdog
            ;;
        "status")
            status_watchdog
            ;;
        "logs")
            if [[ -f "$WATCHDOG_LOG" ]]; then
                echo -e "${BLUE}📝 Siguiendo logs del Watchdog...${NC}"
                tail -f "$WATCHDOG_LOG"
            else
                echo -e "${RED}❌ Archivo de log no encontrado: $WATCHDOG_LOG${NC}"
                exit 1
            fi
            ;;
        "config")
            echo -e "${CYAN}⚙️  CONFIGURACIÓN ACTUAL:${NC}"
            echo "  Intervalo de verificación: ${CHECK_INTERVAL}s"
            echo "  Máx. reintentos por servicio: ${MAX_RESTART_ATTEMPTS}"
            echo "  Cooldown entre reintentos: ${RESTART_COOLDOWN}s"
            echo "  Archivo PID: $WATCHDOG_PID_FILE"
            echo "  Archivo log: $WATCHDOG_LOG"
            echo ""
            echo -e "${CYAN}📋 Servicios monitoreados:${NC}"
            for service in "${!SERVICES[@]}"; do
                echo "  • $service (puerto ${SERVICES[$service]})"
            done
            ;;
        "help"|"--help"|"-h")
            show_watchdog_help
            ;;
        *)
            echo -e "${RED}❌ Comando desconocido: $command${NC}"
            echo ""
            show_watchdog_help
            exit 1
            ;;
    esac
}

# Manejo de señales
cleanup_watchdog() {
    if [[ -f "$WATCHDOG_PID_FILE" ]]; then
        rm -f "$WATCHDOG_PID_FILE"
    fi
    exit 0
}

trap cleanup_watchdog SIGINT SIGTERM

# Ejecutar función principal
main "$@"