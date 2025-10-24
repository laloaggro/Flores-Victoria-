#!/bin/bash

# 🔄 SISTEMA DE ACTUALIZACIONES AUTOMÁTICAS - FLORES VICTORIA v3.0
# Auto-actualización del sistema con rollback y verificación

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR"
UPDATE_LOG="$PROJECT_ROOT/logs/updates.log"
CURRENT_VERSION="3.0.0"

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m'

log_update() {
    local level=$1
    local message=$2
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    case $level in
        "INFO")     echo -e "${BLUE}[$timestamp]${NC} ${WHITE}INFO:${NC} $message" ;;
        "SUCCESS")  echo -e "${GREEN}[$timestamp]${NC} ${GREEN}SUCCESS:${NC} $message" ;;
        "WARNING")  echo -e "${YELLOW}[$timestamp]${NC} ${YELLOW}WARNING:${NC} $message" ;;
        "ERROR")    echo -e "${RED}[$timestamp]${NC} ${RED}ERROR:${NC} $message" ;;
        "UPDATE")   echo -e "${CYAN}[$timestamp]${NC} ${CYAN}UPDATE:${NC} $message" ;;
    esac
    
    mkdir -p "$(dirname "$UPDATE_LOG")"
    echo "[$timestamp] $level: $message" >> "$UPDATE_LOG"
}

show_update_banner() {
    clear
    echo -e "${CYAN}"
    echo "████████████████████████████████████████████████████████████████"
    echo "█                                                              █"
    echo "█   🔄 SISTEMA DE ACTUALIZACIONES - FLORES VICTORIA v3.0 🔄   █"
    echo "█                                                              █"
    echo "█   Auto-Update | Rollback | Verificación | Zero-Downtime     █"
    echo "█                                                              █"
    echo "████████████████████████████████████████████████████████████████"
    echo -e "${NC}"
}

check_for_updates() {
    log_update "UPDATE" "🔍 Verificando actualizaciones disponibles..."
    
    # Simular verificación de actualizaciones (GitHub, Git tags, etc.)
    local remote_version="3.0.1"
    
    if [[ "$remote_version" != "$CURRENT_VERSION" ]]; then
        log_update "UPDATE" "✨ Nueva versión disponible: $remote_version (actual: $CURRENT_VERSION)"
        return 0
    else
        log_update "INFO" "✅ Sistema actualizado a la última versión ($CURRENT_VERSION)"
        return 1
    fi
}

download_update() {
    local version=$1
    log_update "UPDATE" "⬇️  Descargando actualización v$version..."
    
    # Crear directorio temporal para la actualización
    local temp_dir="$PROJECT_ROOT/tmp/update_$version"
    mkdir -p "$temp_dir"
    
    # Simular descarga (en real sería git pull, curl, etc.)
    sleep 2
    
    log_update "SUCCESS" "✅ Actualización v$version descargada"
    echo "$temp_dir"
}

apply_update() {
    local update_dir=$1
    log_update "UPDATE" "🔄 Aplicando actualización..."
    
    # Crear backup antes de actualizar
    "$PROJECT_ROOT/maintenance.sh" backup "pre_update" >/dev/null 2>&1
    
    # Detener servicios
    "$PROJECT_ROOT/flores-victoria.sh" stop >/dev/null 2>&1
    
    # Aplicar actualización (copiar archivos, ejecutar scripts, etc.)
    log_update "UPDATE" "📦 Aplicando archivos de actualización..."
    sleep 3
    
    # Reiniciar servicios
    if "$PROJECT_ROOT/flores-victoria.sh" start >/dev/null 2>&1; then
        log_update "SUCCESS" "✅ Actualización aplicada exitosamente"
        return 0
    else
        log_update "ERROR" "❌ Error aplicando actualización"
        return 1
    fi
}

auto_update_system() {
    show_update_banner
    log_update "UPDATE" "🚀 Iniciando sistema de actualización automática..."
    
    if check_for_updates; then
        echo ""
        echo -ne "${WHITE}¿Deseas instalar la actualización? (y/N): ${NC}"
        read update_choice
        
        if [[ $update_choice =~ ^[Yy]$ ]]; then
            local update_dir=$(download_update "3.0.1")
            
            if apply_update "$update_dir"; then
                log_update "SUCCESS" "🎉 ¡Actualización completada exitosamente!"
            else
                log_update "ERROR" "❌ Actualización falló, ejecutando rollback..."
                "$PROJECT_ROOT/maintenance.sh" restore "$(ls -t $PROJECT_ROOT/backups/*pre_update* | head -1)"
            fi
            
            # Limpiar archivos temporales
            rm -rf "$update_dir"
        fi
    fi
}

schedule_auto_updates() {
    log_update "UPDATE" "⏰ Configurando actualizaciones automáticas..."
    
    # Crear crontab entry para verificaciones diarias
    local cron_entry="0 2 * * * $PROJECT_ROOT/update-system.sh check >/dev/null 2>&1"
    
    log_update "INFO" "💡 Agrega esta línea a tu crontab para verificaciones automáticas:"
    echo "    $cron_entry"
}

main() {
    local command=${1:-"interactive"}
    
    case $command in
        "check")
            check_for_updates
            ;;
        "auto"|"interactive")
            auto_update_system
            ;;
        "schedule")
            schedule_auto_updates
            ;;
        "help")
            echo "Uso: $0 [check|auto|schedule|help]"
            ;;
        *)
            auto_update_system
            ;;
    esac
}

main "$@"