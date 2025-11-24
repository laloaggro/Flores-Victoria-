#!/bin/bash

# 🌸 FLORES VICTORIA v3.0 - CONTROL MASTER
# Sistema unificado de control y automatización completa

set -e

# =============================================================================
# CONFIGURACIÓN
# =============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR"
FLORES_LOG="$PROJECT_ROOT/logs/flores-victoria.log"
VERSION="3.0.0"

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
GRAY='\033[0;37m'
NC='\033[0m'

# Configuración del sistema
INTERACTIVE_MODE=true
AUTO_START_WATCHDOG=true
DEFAULT_ENVIRONMENT="development"

# Scripts de automatización disponibles
AUTOMATE_SCRIPT="$PROJECT_ROOT/automate.sh"
WATCHDOG_SCRIPT="$PROJECT_ROOT/watchdog.sh"
INSTALL_SCRIPT="$PROJECT_ROOT/install.sh"
CICD_SCRIPT="$PROJECT_ROOT/cicd.sh"
MAINTENANCE_SCRIPT="$PROJECT_ROOT/maintenance.sh"

# =============================================================================
# FUNCIONES UTILITARIAS
# =============================================================================

log_flores() {
    local level=$1
    local message=$2
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    case $level in
        "INFO")     echo -e "${BLUE}[$timestamp]${NC} ${WHITE}INFO:${NC} $message" ;;
        "SUCCESS")  echo -e "${GREEN}[$timestamp]${NC} ${GREEN}SUCCESS:${NC} $message" ;;
        "WARNING")  echo -e "${YELLOW}[$timestamp]${NC} ${YELLOW}WARNING:${NC} $message" ;;
        "ERROR")    echo -e "${RED}[$timestamp]${NC} ${RED}ERROR:${NC} $message" ;;
        "SYSTEM")   echo -e "${PURPLE}[$timestamp]${NC} ${PURPLE}SYSTEM:${NC} $message" ;;
        "MASTER")   echo -e "${CYAN}[$timestamp]${NC} ${CYAN}MASTER:${NC} $message" ;;
    esac
    
    # Log a archivo
    mkdir -p "$(dirname "$FLORES_LOG")"
    echo "[$timestamp] $level: $message" >> "$FLORES_LOG"
}

show_main_banner() {
    clear
    echo -e "${CYAN}"
    echo "████████████████████████████████████████████████████████████████"
    echo "█                                                              █"
    echo "█   🌸 FLORES VICTORIA v3.0 - CONTROL MASTER 🌸               █"
    echo "█                                                              █"
    echo "█   Sistema E-commerce Enterprise | Automatización Completa   █"
    echo "█   Control Unificado | Servicios AI | Monitoreo Avanzado     █"
    echo "█                                                              █"
    echo "████████████████████████████████████████████████████████████████"
    echo -e "${NC}"
    echo ""
}

# Verificar disponibilidad de scripts
check_automation_scripts() {
    local missing_scripts=()
    
    local scripts=(
        "automate.sh:Automatización principal"
        "watchdog.sh:Monitoreo y watchdog"
        "install.sh:Instalación automática"
        "cicd.sh:CI/CD Pipeline"
        "maintenance.sh:Mantenimiento"
    )
    
    for script_info in "${scripts[@]}"; do
        local script_file=$(echo "$script_info" | cut -d':' -f1)
        local script_desc=$(echo "$script_info" | cut -d':' -f2)
        local script_path="$PROJECT_ROOT/$script_file"
        
        if [[ -f "$script_path" && -x "$script_path" ]]; then
            log_flores "SUCCESS" "✅ $script_desc disponible"
        else
            log_flores "ERROR" "❌ $script_desc no disponible: $script_file"
            missing_scripts+=("$script_file")
        fi
    done
    
    if [[ ${#missing_scripts[@]} -gt 0 ]]; then
        log_flores "WARNING" "⚠️  Scripts faltantes: ${missing_scripts[*]}"
        log_flores "INFO" "💡 Ejecuta la instalación completa para generar todos los scripts"
        return 1
    fi
    
    return 0
}

# =============================================================================
# MENÚ INTERACTIVO
# =============================================================================

show_main_menu() {
    echo -e "${CYAN}╔══════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║                        🌸 MENÚ PRINCIPAL 🌸                               ║${NC}"
    echo -e "${CYAN}╠══════════════════════════════════════════════════════════════════════════╣${NC}"
    echo -e "${CYAN}║${NC}                                                                        ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}  ${WHITE}🚀 SERVICIOS PRINCIPALES${NC}                                         ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}    ${GREEN}1)${NC} Iniciar todos los servicios                                 ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}    ${GREEN}2)${NC} Detener todos los servicios                                ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}    ${GREEN}3)${NC} Estado de servicios                                        ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}    ${GREEN}4)${NC} Verificación completa de salud                             ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}                                                                        ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}  ${WHITE}🔧 AUTOMATIZACIÓN AVANZADA${NC}                                       ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}    ${BLUE}5)${NC} Iniciar sistema de monitoreo (Watchdog)                    ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}    ${BLUE}6)${NC} Sistema de mantenimiento                                   ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}    ${BLUE}7)${NC} Pipeline CI/CD                                             ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}    ${BLUE}8)${NC} Instalación y configuración                                ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}                                                                        ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}  ${WHITE}📊 INFORMACIÓN Y CONTROL${NC}                                         ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}    ${PURPLE}9)${NC} Dashboard del sistema                                      ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}   ${PURPLE}10)${NC} Logs y monitoreo                                          ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}   ${PURPLE}11)${NC} Configuración avanzada                                    ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}   ${PURPLE}12)${NC} Ayuda y documentación                                     ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}                                                                        ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}    ${RED}0)${NC} Salir                                                      ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}                                                                        ${CYAN}║${NC}"
    echo -e "${CYAN}╚══════════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -ne "${WHITE}Selecciona una opción [1-12, 0 para salir]: ${NC}"
}

show_services_menu() {
    clear
    show_main_banner
    
    echo -e "${CYAN}╔══════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║                        🚀 SERVICIOS PRINCIPALES                           ║${NC}"
    echo -e "${CYAN}╠══════════════════════════════════════════════════════════════════════════╣${NC}"
    echo -e "${CYAN}║${NC}  ${GREEN}1)${NC} Iniciar Admin Panel (Puerto 3021)                              ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}  ${GREEN}2)${NC} Iniciar AI Service (Puerto 3002)                               ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}  ${GREEN}3)${NC} Iniciar Order Service (Puerto 3004)                            ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}  ${GREEN}4)${NC} Iniciar TODOS los servicios                                    ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}                                                                        ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}  ${RED}5)${NC} Detener Admin Panel                                             ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}  ${RED}6)${NC} Detener AI Service                                              ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}  ${RED}7)${NC} Detener Order Service                                           ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}  ${RED}8)${NC} Detener TODOS los servicios                                     ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}                                                                        ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}  ${BLUE}9)${NC} Reiniciar servicios                                             ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC} ${BLUE}10)${NC} Estado detallado                                               ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}                                                                        ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}  ${GRAY}0)${NC} Volver al menú principal                                       ${CYAN}║${NC}"
    echo -e "${CYAN}╚══════════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

show_automation_menu() {
    clear
    show_main_banner
    
    echo -e "${CYAN}╔══════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║                       🔧 AUTOMATIZACIÓN AVANZADA                          ║${NC}"
    echo -e "${CYAN}╠══════════════════════════════════════════════════════════════════════════╣${NC}"
    echo -e "${CYAN}║${NC}  ${WHITE}MONITOREO Y WATCHDOG${NC}                                            ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}  ${GREEN}1)${NC} Iniciar Watchdog (Monitoreo automático)                       ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}  ${GREEN}2)${NC} Estado del Watchdog                                            ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}  ${RED}3)${NC} Detener Watchdog                                               ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}                                                                        ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}  ${WHITE}MANTENIMIENTO AUTOMÁTICO${NC}                                         ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}  ${BLUE}4)${NC} Mantenimiento completo                                         ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}  ${BLUE}5)${NC} Solo limpieza                                                  ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}  ${BLUE}6)${NC} Solo backups                                                   ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}  ${BLUE}7)${NC} Verificación de salud                                          ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}                                                                        ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}  ${WHITE}CI/CD PIPELINE${NC}                                                   ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}  ${PURPLE}8)${NC} Pipeline completo (Staging)                                   ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}  ${PURPLE}9)${NC} Pipeline completo (Producción)                                ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC} ${PURPLE}10)${NC} Solo tests                                                     ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC} ${PURPLE}11)${NC} Solo deployment                                               ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}                                                                        ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}  ${GRAY}0)${NC} Volver al menú principal                                       ${CYAN}║${NC}"
    echo -e "${CYAN}╚══════════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

# =============================================================================
# FUNCIONES DE CONTROL DE SERVICIOS
# =============================================================================

start_all_services() {
    log_flores "MASTER" "🚀 Iniciando todos los servicios del sistema..."
    
    if [[ -f "$AUTOMATE_SCRIPT" ]]; then
        if "$AUTOMATE_SCRIPT" start; then
            log_flores "SUCCESS" "✅ Todos los servicios iniciados correctamente"
            
            # Iniciar watchdog automáticamente si está configurado
            if [[ $AUTO_START_WATCHDOG == true ]]; then
                log_flores "INFO" "🔍 Iniciando sistema de monitoreo automático..."
                start_watchdog_system
            fi
            
            # Mostrar URLs de acceso
            show_service_urls
            return 0
        else
            log_flores "ERROR" "❌ Error iniciando servicios"
            return 1
        fi
    else
        log_flores "ERROR" "❌ Script de automatización no disponible"
        return 1
    fi
}

stop_all_services() {
    log_flores "MASTER" "⏹️  Deteniendo todos los servicios del sistema..."
    
    # Detener watchdog primero
    stop_watchdog_system
    
    # Detener servicios principales
    if [[ -f "$AUTOMATE_SCRIPT" ]]; then
        if "$AUTOMATE_SCRIPT" stop; then
            log_flores "SUCCESS" "✅ Todos los servicios detenidos correctamente"
            return 0
        else
            log_flores "WARNING" "⚠️  Algunos servicios pueden no haberse detenido correctamente"
            return 1
        fi
    else
        log_flores "ERROR" "❌ Script de automatización no disponible"
        return 1
    fi
}

show_services_status() {
    log_flores "SYSTEM" "📊 Obteniendo estado de servicios..."
    
    if [[ -f "$AUTOMATE_SCRIPT" ]]; then
        echo ""
        echo -e "${CYAN}┌──────────────────────────────────────────────────────────────────────────┐${NC}"
        echo -e "${CYAN}│                          📊 ESTADO DE SERVICIOS                           │${NC}"
        echo -e "${CYAN}├──────────────────────────────────────────────────────────────────────────┤${NC}"
        
        # Ejecutar estado detallado
        "$AUTOMATE_SCRIPT" status
        
        echo -e "${CYAN}├──────────────────────────────────────────────────────────────────────────┤${NC}"
        
        # Estado del watchdog
        if pgrep -f "watchdog.sh" >/dev/null 2>&1; then
            echo -e "${CYAN}│${NC} ${GREEN}🔍 Sistema de Monitoreo (Watchdog): ACTIVO${NC}"
        else
            echo -e "${CYAN}│${NC} ${YELLOW}🔍 Sistema de Monitoreo (Watchdog): INACTIVO${NC}"
        fi
        
        echo -e "${CYAN}└──────────────────────────────────────────────────────────────────────────┘${NC}"
        echo ""
    else
        log_flores "ERROR" "❌ Script de automatización no disponible"
    fi
}

run_health_check() {
    log_flores "SYSTEM" "🏥 Ejecutando verificación completa de salud..."
    
    if [[ -f "$AUTOMATE_SCRIPT" ]]; then
        if "$AUTOMATE_SCRIPT" health; then
            log_flores "SUCCESS" "✅ Verificación de salud completada"
        else
            log_flores "WARNING" "⚠️  Se encontraron problemas en la verificación de salud"
        fi
    else
        log_flores "ERROR" "❌ Script de automatización no disponible"
    fi
}

show_service_urls() {
    echo ""
    echo -e "${CYAN}┌──────────────────────────────────────────────────────────────────────────┐${NC}"
    echo -e "${CYAN}│                            🌐 URLS DE ACCESO                               │${NC}"
    echo -e "${CYAN}├──────────────────────────────────────────────────────────────────────────┤${NC}"
    echo -e "${CYAN}│${NC} ${WHITE}Admin Panel:${NC}      ${GREEN}http://localhost:3021${NC}"
    echo -e "${CYAN}│${NC} ${WHITE}Documentación:${NC}   ${GREEN}http://localhost:3021/documentation.html${NC}"
    echo -e "${CYAN}│${NC} ${WHITE}AI Service:${NC}       ${GREEN}http://localhost:3002/ai/recommendations${NC}"
    echo -e "${CYAN}│${NC} ${WHITE}Order Service:${NC}    ${GREEN}http://localhost:3004/api/orders${NC}"
    echo -e "${CYAN}├──────────────────────────────────────────────────────────────────────────┤${NC}"
    echo -e "${CYAN}│${NC} ${WHITE}Health Checks:${NC}"
    echo -e "${CYAN}│${NC}   Admin Panel:   ${BLUE}http://localhost:3021/health${NC}"
    echo -e "${CYAN}│${NC}   AI Service:    ${BLUE}http://localhost:3002/health${NC}"
    echo -e "${CYAN}│${NC}   Order Service: ${BLUE}http://localhost:3004/health${NC}"
    echo -e "${CYAN}└──────────────────────────────────────────────────────────────────────────┘${NC}"
    echo ""
}

# =============================================================================
# FUNCIONES DE WATCHDOG
# =============================================================================

start_watchdog_system() {
    if [[ -f "$WATCHDOG_SCRIPT" ]]; then
        if ! pgrep -f "watchdog.sh" >/dev/null 2>&1; then
            log_flores "SYSTEM" "🔍 Iniciando sistema de monitoreo automático..."
            
            if "$WATCHDOG_SCRIPT" start >/dev/null 2>&1; then
                log_flores "SUCCESS" "✅ Watchdog iniciado correctamente"
                return 0
            else
                log_flores "ERROR" "❌ Error iniciando watchdog"
                return 1
            fi
        else
            log_flores "INFO" "ℹ️  Watchdog ya está ejecutándose"
            return 0
        fi
    else
        log_flores "ERROR" "❌ Script de watchdog no disponible"
        return 1
    fi
}

stop_watchdog_system() {
    if pgrep -f "watchdog.sh" >/dev/null 2>&1; then
        log_flores "SYSTEM" "⏹️  Deteniendo sistema de monitoreo..."
        
        if [[ -f "$WATCHDOG_SCRIPT" ]]; then
            "$WATCHDOG_SCRIPT" stop >/dev/null 2>&1 || true
        fi
        
        # Forzar terminación si es necesario
        pkill -f "watchdog.sh" 2>/dev/null || true
        
        log_flores "SUCCESS" "✅ Watchdog detenido"
    else
        log_flores "INFO" "ℹ️  Watchdog no estaba ejecutándose"
    fi
}

show_watchdog_status() {
    if pgrep -f "watchdog.sh" >/dev/null 2>&1; then
        log_flores "SUCCESS" "✅ Sistema de monitoreo ACTIVO"
        
        if [[ -f "$WATCHDOG_SCRIPT" ]]; then
            "$WATCHDOG_SCRIPT" status 2>/dev/null || true
        fi
    else
        log_flores "WARNING" "⚠️  Sistema de monitoreo INACTIVO"
    fi
}

# =============================================================================
# FUNCIONES DE MANTENIMIENTO
# =============================================================================

run_full_maintenance() {
    log_flores "SYSTEM" "🔧 Ejecutando mantenimiento completo del sistema..."
    
    if [[ -f "$MAINTENANCE_SCRIPT" ]]; then
        if "$MAINTENANCE_SCRIPT" full; then
            log_flores "SUCCESS" "✅ Mantenimiento completado exitosamente"
        else
            log_flores "WARNING" "⚠️  Mantenimiento completado con advertencias"
        fi
    else
        log_flores "ERROR" "❌ Script de mantenimiento no disponible"
    fi
}

run_system_cleanup() {
    log_flores "SYSTEM" "🧹 Ejecutando limpieza del sistema..."
    
    if [[ -f "$MAINTENANCE_SCRIPT" ]]; then
        if "$MAINTENANCE_SCRIPT" clean; then
            log_flores "SUCCESS" "✅ Limpieza completada"
        else
            log_flores "WARNING" "⚠️  Limpieza completada con advertencias"  
        fi
    else
        log_flores "ERROR" "❌ Script de mantenimiento no disponible"
    fi
}

create_system_backup() {
    log_flores "SYSTEM" "🗄️  Creando backup del sistema..."
    
    if [[ -f "$MAINTENANCE_SCRIPT" ]]; then
        if "$MAINTENANCE_SCRIPT" backup manual; then
            log_flores "SUCCESS" "✅ Backup creado exitosamente"
        else
            log_flores "ERROR" "❌ Error creando backup"
        fi
    else
        log_flores "ERROR" "❌ Script de mantenimiento no disponible"
    fi
}

# =============================================================================
# FUNCIONES DE CI/CD
# =============================================================================

run_cicd_pipeline() {
    local environment=${1:-"staging"}
    
    log_flores "SYSTEM" "🚀 Ejecutando pipeline CI/CD para $environment..."
    
    if [[ -f "$CICD_SCRIPT" ]]; then
        if "$CICD_SCRIPT" pipeline "$environment"; then
            log_flores "SUCCESS" "✅ Pipeline CI/CD completado exitosamente"
        else
            log_flores "ERROR" "❌ Pipeline CI/CD falló"
        fi
    else
        log_flores "ERROR" "❌ Script de CI/CD no disponible"
    fi
}

run_tests_only() {
    log_flores "SYSTEM" "🧪 Ejecutando solo tests..."
    
    if [[ -f "$CICD_SCRIPT" ]]; then
        if "$CICD_SCRIPT" test; then
            log_flores "SUCCESS" "✅ Tests completados exitosamente"
        else
            log_flores "ERROR" "❌ Tests fallaron"
        fi
    else
        log_flores "ERROR" "❌ Script de CI/CD no disponible"
    fi
}

# =============================================================================
# DASHBOARD Y MONITOREO
# =============================================================================

show_system_dashboard() {
    clear
    show_main_banner
    
    log_flores "SYSTEM" "📊 Generando dashboard del sistema..."
    
    echo -e "${CYAN}╔══════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║                           📊 DASHBOARD DEL SISTEMA                        ║${NC}"
    echo -e "${CYAN}╠══════════════════════════════════════════════════════════════════════════╣${NC}"
    
    # Información del sistema
    echo -e "${CYAN}║${NC} ${WHITE}INFORMACIÓN GENERAL${NC}"
    echo -e "${CYAN}║${NC} Versión:     ${WHITE}Flores Victoria v$VERSION${NC}"
    echo -e "${CYAN}║${NC} Hostname:    ${WHITE}$(hostname)${NC}"
    echo -e "${CYAN}║${NC} Usuario:     ${WHITE}$(whoami)${NC}"
    echo -e "${CYAN}║${NC} Directorio:  ${WHITE}$PROJECT_ROOT${NC}"
    echo -e "${CYAN}║${NC} Fecha:       ${WHITE}$(date '+%Y-%m-%d %H:%M:%S')${NC}"
    echo -e "${CYAN}╠══════════════════════════════════════════════════════════════════════════╣${NC}"
    
    # Estado de servicios
    echo -e "${CYAN}║${NC} ${WHITE}ESTADO DE SERVICIOS${NC}"
    
    local admin_status="❌ INACTIVO"
    local ai_status="❌ INACTIVO"
    local order_status="❌ INACTIVO"
    local watchdog_status="❌ INACTIVO"
    
    # Verificar servicios
    if curl -f -s "http://localhost:3021/health" >/dev/null 2>&1; then
        admin_status="✅ ACTIVO"
    fi
    
    if curl -f -s "http://localhost:3002/health" >/dev/null 2>&1; then
        ai_status="✅ ACTIVO"
    fi
    
    if curl -f -s "http://localhost:3004/health" >/dev/null 2>&1; then
        order_status="✅ ACTIVO"
    fi
    
    if pgrep -f "watchdog.sh" >/dev/null 2>&1; then
        watchdog_status="✅ ACTIVO"
    fi
    
    echo -e "${CYAN}║${NC} Admin Panel:   $admin_status"
    echo -e "${CYAN}║${NC} AI Service:    $ai_status"
    echo -e "${CYAN}║${NC} Order Service: $order_status"
    echo -e "${CYAN}║${NC} Watchdog:      $watchdog_status"
    echo -e "${CYAN}╠══════════════════════════════════════════════════════════════════════════╣${NC}"
    
    # Información del sistema
    echo -e "${CYAN}║${NC} ${WHITE}RECURSOS DEL SISTEMA${NC}"
    
    # Espacio en disco
    local disk_usage=$(df "$PROJECT_ROOT" | awk 'NR==2 {print $5}' | sed 's/%//')
    echo -e "${CYAN}║${NC} Espacio Disco: ${WHITE}${disk_usage}% usado${NC}"
    
    # Memoria si está disponible
    if command -v free >/dev/null 2>&1; then
        local memory_usage=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
        echo -e "${CYAN}║${NC} Memoria RAM:   ${WHITE}${memory_usage}% usado${NC}"
    fi
    
    # Procesos
    local process_count=$(ps aux | wc -l)
    echo -e "${CYAN}║${NC} Procesos:      ${WHITE}$process_count totales${NC}"
    
    echo -e "${CYAN}╠══════════════════════════════════════════════════════════════════════════╣${NC}"
    
    # Scripts disponibles
    echo -e "${CYAN}║${NC} ${WHITE}SCRIPTS DE AUTOMATIZACIÓN${NC}"
    
    local scripts_status=(
        "automate.sh:Automatización"
        "watchdog.sh:Monitoreo"
        "maintenance.sh:Mantenimiento"
        "cicd.sh:CI/CD"
        "install.sh:Instalación"
    )
    
    for script_info in "${scripts_status[@]}"; do
        local script_file=$(echo "$script_info" | cut -d':' -f1)
        local script_name=$(echo "$script_info" | cut -d':' -f2)
        
        if [[ -f "$PROJECT_ROOT/$script_file" && -x "$PROJECT_ROOT/$script_file" ]]; then
            echo -e "${CYAN}║${NC} $script_name: ✅ Disponible"
        else
            echo -e "${CYAN}║${NC} $script_name: ❌ No disponible"
        fi
    done
    
    echo -e "${CYAN}╚══════════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    # Mostrar URLs si hay servicios activos
    if [[ "$admin_status" == *"ACTIVO"* ]] || [[ "$ai_status" == *"ACTIVO"* ]] || [[ "$order_status" == *"ACTIVO"* ]]; then
        show_service_urls
    fi
    
    echo -ne "${WHITE}Presiona Enter para continuar...${NC}"
    read
}

show_logs_monitoring() {
    clear
    show_main_banner
    
    echo -e "${CYAN}╔══════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║                           📝 LOGS Y MONITOREO                             ║${NC}"
    echo -e "${CYAN}╠══════════════════════════════════════════════════════════════════════════╣${NC}"
    echo -e "${CYAN}║${NC}  ${GREEN}1)${NC} Ver logs del sistema (tiempo real)                             ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}  ${GREEN}2)${NC} Ver logs de servicios                                          ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}  ${GREEN}3)${NC} Ver logs de mantenimiento                                      ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}  ${GREEN}4)${NC} Ver logs de CI/CD                                              ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}  ${GREEN}5)${NC} Ver logs de watchdog                                           ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}                                                                        ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}  ${BLUE}6)${NC} Limpiar logs antiguos                                          ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}  ${BLUE}7)${NC} Rotar logs grandes                                             ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}  ${BLUE}8)${NC} Estadísticas de logs                                           ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}                                                                        ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}  ${GRAY}0)${NC} Volver al menú principal                                       ${CYAN}║${NC}"
    echo -e "${CYAN}╚══════════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    echo -ne "${WHITE}Selecciona una opción [1-8, 0 para volver]: ${NC}"
    read log_option
    
    case $log_option in
        1)
            if [[ -f "$FLORES_LOG" ]]; then
                echo -e "${CYAN}Mostrando logs en tiempo real (Ctrl+C para salir)...${NC}"
                tail -f "$FLORES_LOG"
            else
                log_flores "WARNING" "⚠️  Log principal no encontrado"
            fi
            ;;
        2)
            if [[ -f "$PROJECT_ROOT/logs/automate.log" ]]; then
                tail -50 "$PROJECT_ROOT/logs/automate.log"
            else
                log_flores "WARNING" "⚠️  Logs de servicios no encontrados"
            fi
            ;;
        3)
            if [[ -f "$PROJECT_ROOT/logs/maintenance.log" ]]; then
                tail -50 "$PROJECT_ROOT/logs/maintenance.log"
            else
                log_flores "WARNING" "⚠️  Logs de mantenimiento no encontrados"
            fi
            ;;
        4)
            if [[ -f "$PROJECT_ROOT/logs/cicd.log" ]]; then
                tail -50 "$PROJECT_ROOT/logs/cicd.log"
            else
                log_flores "WARNING" "⚠️  Logs de CI/CD no encontrados"
            fi
            ;;
        5)
            if [[ -f "$PROJECT_ROOT/logs/watchdog.log" ]]; then
                tail -50 "$PROJECT_ROOT/logs/watchdog.log"
            else
                log_flores "WARNING" "⚠️  Logs de watchdog no encontrados"
            fi
            ;;
        6)
            run_system_cleanup
            ;;
        7)
            if [[ -f "$MAINTENANCE_SCRIPT" ]]; then
                "$MAINTENANCE_SCRIPT" rotate-logs
            fi
            ;;
        8)
            show_logs_statistics
            ;;
        0)
            return 0
            ;;
        *)
            log_flores "WARNING" "⚠️  Opción inválida"
            ;;
    esac
    
    echo ""
    echo -ne "${WHITE}Presiona Enter para continuar...${NC}"
    read
}

show_logs_statistics() {
    echo ""
    log_flores "INFO" "📊 Estadísticas de logs del sistema..."
    
    if [[ -d "$PROJECT_ROOT/logs" ]]; then
        local log_count=$(find "$PROJECT_ROOT/logs" -name "*.log" -type f | wc -l)
        local log_size=$(du -sh "$PROJECT_ROOT/logs" 2>/dev/null | cut -f1)
        
        echo -e "${CYAN}┌──────────────────────────────────────────────────────────────────────────┐${NC}"
        echo -e "${CYAN}│                        📊 ESTADÍSTICAS DE LOGS                            │${NC}"
        echo -e "${CYAN}├──────────────────────────────────────────────────────────────────────────┤${NC}"
        echo -e "${CYAN}│${NC} Total de archivos de log: ${WHITE}$log_count${NC}"
        echo -e "${CYAN}│${NC} Tamaño total:             ${WHITE}$log_size${NC}"
        echo -e "${CYAN}├──────────────────────────────────────────────────────────────────────────┤${NC}"
        
        # Mostrar logs individuales
        find "$PROJECT_ROOT/logs" -name "*.log" -type f -exec ls -lh {} \; | while read line; do
            local size=$(echo "$line" | awk '{print $5}')
            local file=$(basename "$(echo "$line" | awk '{print $9}')")
            echo -e "${CYAN}│${NC} $file: ${WHITE}$size${NC}"
        done
        
        echo -e "${CYAN}└──────────────────────────────────────────────────────────────────────────┘${NC}"
    else
        log_flores "WARNING" "⚠️  Directorio de logs no encontrado"
    fi
}

# =============================================================================
# CONFIGURACIÓN AVANZADA
# =============================================================================

show_advanced_config() {
    clear
    show_main_banner
    
    echo -e "${CYAN}╔══════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║                         ⚙️  CONFIGURACIÓN AVANZADA                        ║${NC}"
    echo -e "${CYAN}╠══════════════════════════════════════════════════════════════════════════╣${NC}"
    echo -e "${CYAN}║${NC}  ${GREEN}1)${NC} Configurar auto-inicio de watchdog                             ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}  ${GREEN}2)${NC} Configurar entorno por defecto                                ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}  ${GREEN}3)${NC} Configurar modo interactivo                                   ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}                                                                        ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}  ${BLUE}4)${NC} Ver configuración actual                                       ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}  ${BLUE}5)${NC} Resetear configuración                                         ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}                                                                        ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}  ${PURPLE}6)${NC} Generar configuración de sistema                              ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}  ${PURPLE}7)${NC} Exportar configuración                                        ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}  ${PURPLE}8)${NC} Importar configuración                                        ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}                                                                        ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}  ${GRAY}0)${NC} Volver al menú principal                                       ${CYAN}║${NC}"
    echo -e "${CYAN}╚══════════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    echo -ne "${WHITE}Selecciona una opción [1-8, 0 para volver]: ${NC}"
    read config_option
    
    case $config_option in
        1)
            configure_auto_watchdog
            ;;
        2)
            configure_default_environment
            ;;
        3)
            configure_interactive_mode
            ;;
        4)
            show_current_config
            ;;
        5)
            reset_configuration
            ;;
        6)
            generate_system_config
            ;;
        7)
            export_configuration
            ;;
        8)
            import_configuration
            ;;
        0)
            return 0
            ;;
        *)
            log_flores "WARNING" "⚠️  Opción inválida"
            ;;
    esac
    
    echo ""
    echo -ne "${WHITE}Presiona Enter para continuar...${NC}"
    read
}

show_current_config() {
    echo ""
    echo -e "${CYAN}┌──────────────────────────────────────────────────────────────────────────┐${NC}"
    echo -e "${CYAN}│                        ⚙️  CONFIGURACIÓN ACTUAL                           │${NC}"
    echo -e "${CYAN}├──────────────────────────────────────────────────────────────────────────┤${NC}"
    echo -e "${CYAN}│${NC} Auto-inicio Watchdog:  ${WHITE}$AUTO_START_WATCHDOG${NC}"
    echo -e "${CYAN}│${NC} Entorno por defecto:   ${WHITE}$DEFAULT_ENVIRONMENT${NC}"
    echo -e "${CYAN}│${NC} Modo interactivo:      ${WHITE}$INTERACTIVE_MODE${NC}"
    echo -e "${CYAN}│${NC} Directorio del proyecto: ${WHITE}$PROJECT_ROOT${NC}"
    echo -e "${CYAN}│${NC} Versión:               ${WHITE}v$VERSION${NC}"
    echo -e "${CYAN}└──────────────────────────────────────────────────────────────────────────┘${NC}"
}

# =============================================================================
# AYUDA Y DOCUMENTACIÓN
# =============================================================================

show_help_documentation() {
    clear
    show_main_banner
    
    echo -e "${CYAN}╔══════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║                         📚 AYUDA Y DOCUMENTACIÓN                          ║${NC}"
    echo -e "${CYAN}╠══════════════════════════════════════════════════════════════════════════╣${NC}"
    echo -e "${CYAN}║${NC}                                                                        ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}  ${WHITE}🌸 FLORES VICTORIA v3.0 - SISTEMA E-COMMERCE ENTERPRISE${NC}           ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}                                                                        ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}  ${WHITE}SERVICIOS PRINCIPALES:${NC}                                           ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}  • Admin Panel (Puerto 3021) - Panel administrativo completo         ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}  • AI Service (Puerto 3002) - Servicio de inteligencia artificial    ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}  • Order Service (Puerto 3004) - Gestión de pedidos y órdenes        ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}                                                                        ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}  ${WHITE}AUTOMATIZACIÓN COMPLETA:${NC}                                         ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}  • Sistema de monitoreo automático (Watchdog)                        ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}  • Mantenimiento programado y backups automáticos                    ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}  • Pipeline CI/CD completo con testing y deployment                  ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}  • Instalación y configuración completamente automatizada           ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}                                                                        ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}  ${WHITE}COMANDOS RÁPIDOS:${NC}                                                ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}  ./flores-victoria.sh                 - Menú interactivo principal  ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}  ./flores-victoria.sh start           - Iniciar todos los servicios ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}  ./flores-victoria.sh stop            - Detener todos los servicios ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}  ./flores-victoria.sh status          - Ver estado de servicios     ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}  ./flores-victoria.sh dashboard       - Dashboard del sistema       ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}                                                                        ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}  ${WHITE}SCRIPTS INDIVIDUALES:${NC}                                           ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}  ./automate.sh         - Control de servicios                        ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}  ./watchdog.sh         - Sistema de monitoreo                        ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}  ./maintenance.sh      - Mantenimiento y backups                     ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}  ./cicd.sh             - Pipeline CI/CD                              ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}  ./install.sh          - Instalación automática                      ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}                                                                        ${CYAN}║${NC}"
    echo -e "${CYAN}╚══════════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -ne "${WHITE}Presiona Enter para continuar...${NC}"
    read
}

# =============================================================================
# MODO INTERACTIVO
# =============================================================================

run_interactive_mode() {
    while true; do
        clear
        show_main_banner
        show_main_menu
        
        read choice
        
        case $choice in
            1)
                start_all_services
                echo ""
                echo -ne "${WHITE}Presiona Enter para continuar...${NC}"
                read
                ;;
            2)
                stop_all_services
                echo ""
                echo -ne "${WHITE}Presiona Enter para continuar...${NC}"
                read
                ;;
            3)
                show_services_status
                echo ""
                echo -ne "${WHITE}Presiona Enter para continuar...${NC}"
                read
                ;;
            4)
                run_health_check
                echo ""
                echo -ne "${WHITE}Presiona Enter para continuar...${NC}"
                read
                ;;
            5)
                start_watchdog_system
                echo ""
                echo -ne "${WHITE}Presiona Enter para continuar...${NC}"
                read
                ;;
            6)
                run_full_maintenance
                echo ""
                echo -ne "${WHITE}Presiona Enter para continuar...${NC}"
                read
                ;;
            7)
                echo ""
                echo -ne "${WHITE}Entorno [staging/production] (staging): ${NC}"
                read env_choice
                run_cicd_pipeline "${env_choice:-staging}"
                echo ""
                echo -ne "${WHITE}Presiona Enter para continuar...${NC}"
                read
                ;;
            8)
                if [[ -f "$INSTALL_SCRIPT" ]]; then
                    "$INSTALL_SCRIPT"
                else
                    log_flores "ERROR" "❌ Script de instalación no disponible"
                fi
                echo ""
                echo -ne "${WHITE}Presiona Enter para continuar...${NC}"
                read
                ;;
            9)
                show_system_dashboard
                ;;
            10)
                show_logs_monitoring
                ;;
            11)
                show_advanced_config
                ;;
            12)
                show_help_documentation
                ;;
            0)
                log_flores "MASTER" "👋 ¡Hasta luego! Sistema Flores Victoria v$VERSION"
                break
                ;;
            *)
                log_flores "WARNING" "⚠️  Opción inválida. Selecciona 1-12 o 0 para salir."
                sleep 1
                ;;
        esac
    done
}

# =============================================================================
# MODO LÍNEA DE COMANDOS
# =============================================================================

run_command_mode() {
    local command=$1
    local parameter=$2
    
    case $command in
        "start")
            start_all_services
            ;;
        "stop")
            stop_all_services
            ;;
        "status")
            show_services_status
            ;;
        "health")
            run_health_check
            ;;
        "dashboard")
            show_system_dashboard
            ;;
        "watchdog")
            case $parameter in
                "start") start_watchdog_system ;;
                "stop") stop_watchdog_system ;;
                "status") show_watchdog_status ;;
                *) 
                    echo "Uso: $0 watchdog [start|stop|status]"
                    exit 1
                    ;;
            esac
            ;;
        "maintenance")
            case $parameter in
                "full") run_full_maintenance ;;
                "clean") run_system_cleanup ;;
                "backup") create_system_backup ;;
                *)
                    run_full_maintenance
                    ;;
            esac
            ;;
        "cicd")
            run_cicd_pipeline "${parameter:-staging}"
            ;;
        "install")
            if [[ -f "$INSTALL_SCRIPT" ]]; then
                "$INSTALL_SCRIPT" "${parameter:-full}"
            else
                log_flores "ERROR" "❌ Script de instalación no disponible"
                exit 1
            fi
            ;;
        "version"|"--version"|"-v")
            echo "Flores Victoria v$VERSION"
            ;;
        "help"|"--help"|"-h")
            show_command_help
            ;;
        *)
            log_flores "ERROR" "❌ Comando desconocido: $command"
            show_command_help
            exit 1
            ;;
    esac
}

show_command_help() {
    echo -e "${CYAN}🌸 FLORES VICTORIA v$VERSION - CONTROL MASTER${NC}"
    echo ""
    echo -e "${YELLOW}📖 COMANDOS DISPONIBLES:${NC}"
    echo ""
    echo -e "${WHITE}SERVICIOS:${NC}"
    echo "  start                  - Iniciar todos los servicios"
    echo "  stop                   - Detener todos los servicios"
    echo "  status                 - Ver estado de servicios"
    echo "  health                 - Verificación de salud"
    echo ""
    echo -e "${WHITE}AUTOMATIZACIÓN:${NC}"
    echo "  watchdog [start|stop|status] - Control del sistema de monitoreo"
    echo "  maintenance [full|clean|backup] - Sistema de mantenimiento"
    echo "  cicd [staging|production] - Pipeline CI/CD"
    echo "  install [full|deps|config] - Sistema de instalación"
    echo ""
    echo -e "${WHITE}INFORMACIÓN:${NC}"
    echo "  dashboard              - Dashboard del sistema"
    echo "  version                - Ver versión"
    echo "  help                   - Esta ayuda"
    echo ""
    echo -e "${WHITE}MODO INTERACTIVO:${NC}"
    echo "  ./flores-victoria.sh   - Menú interactivo (sin parámetros)"
    echo ""
    echo -e "${YELLOW}💡 Ejemplos:${NC}"
    echo "  ./flores-victoria.sh start"
    echo "  ./flores-victoria.sh watchdog start"
    echo "  ./flores-victoria.sh cicd production"
    echo "  ./flores-victoria.sh maintenance full"
}

# =============================================================================
# FUNCIÓN PRINCIPAL
# =============================================================================

main() {
    local command=${1:-""}
    
    # Log inicio del sistema
    log_flores "MASTER" "🌸 Iniciando Flores Victoria v$VERSION Control Master"
    
    # Verificar scripts de automatización
    if ! check_automation_scripts && [[ "$command" != "install" ]]; then
        log_flores "WARNING" "⚠️  Algunos scripts no están disponibles"
        log_flores "INFO" "💡 Ejecuta './flores-victoria.sh install' para configurar el sistema"
        
        if [[ -z "$command" ]]; then
            echo ""
            echo -ne "${WHITE}¿Deseas ejecutar la instalación ahora? (y/N): ${NC}"
            read install_choice
            if [[ $install_choice =~ ^[Yy]$ ]]; then
                if [[ -f "$INSTALL_SCRIPT" ]]; then
                    "$INSTALL_SCRIPT"
                else
                    log_flores "ERROR" "❌ Script de instalación no disponible"
                    exit 1
                fi
            fi
        fi
    fi
    
    # Determinar modo de ejecución
    if [[ -z "$command" ]]; then
        # Modo interactivo
        if [[ $INTERACTIVE_MODE == true ]]; then
            run_interactive_mode
        else
            show_command_help
        fi
    else
        # Modo línea de comandos
        run_command_mode "$command" "$2"
    fi
    
    log_flores "MASTER" "✅ Sesión de Flores Victoria Control Master finalizada"
}

# Manejo de señales
cleanup_master() {
    log_flores "WARNING" "⚠️  Control Master interrumpido por el usuario"
    
    # Detener watchdog si está corriendo
    stop_watchdog_system >/dev/null 2>&1
    
    echo ""
    log_flores "MASTER" "👋 ¡Hasta luego! Sistema Flores Victoria v$VERSION"
    exit 130
}

trap cleanup_master SIGINT SIGTERM

# Ejecutar función principal
main "$@"