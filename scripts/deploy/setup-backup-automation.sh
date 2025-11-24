#!/bin/bash

# =============================================================================
# 🔄 CONFIGURADOR DE BACKUPS AUTOMÁTICOS
# Flores Victoria v3.0 - Sistema de Cron Jobs
# =============================================================================

set -euo pipefail

# Configuración de colores
export GREEN='\033[0;32m'
export BLUE='\033[0;34m'
export YELLOW='\033[1;33m'
export RED='\033[0;31m'
export NC='\033[0m'

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CRON_JOB_NAME="flores-victoria-backup"

log_info() { echo -e "${BLUE}ℹ️ $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️ $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }

print_header() {
    echo -e "\n${BLUE}=================================${NC}"
    echo -e "${GREEN}$1${NC}"
    echo -e "${BLUE}=================================${NC}\n"
}

setup_cron_job() {
    local frequency=$1
    local cron_schedule=""
    
    case $frequency in
        "hourly")
            cron_schedule="0 * * * *"
            ;;
        "daily")
            cron_schedule="0 2 * * *"  # 2:00 AM diario
            ;;
        "weekly")
            cron_schedule="0 2 * * 0"  # 2:00 AM domingos
            ;;
        "custom")
            read -p "Ingrese el schedule de cron (ej: 0 2 * * *): " cron_schedule
            ;;
        *)
            log_error "Frecuencia no válida: $frequency"
            return 1
            ;;
    esac
    
    # Crear entrada de cron
    local cron_command="$PROJECT_DIR/automated-backup.sh >> $PROJECT_DIR/logs/cron-backup.log 2>&1"
    local cron_entry="$cron_schedule $cron_command # $CRON_JOB_NAME"
    
    # Verificar si ya existe una entrada
    if crontab -l 2>/dev/null | grep -q "$CRON_JOB_NAME"; then
        log_warning "Ya existe un cron job para backups. ¿Desea reemplazarlo? (s/n)"
        read -r replace
        if [ "$replace" != "s" ] && [ "$replace" != "S" ]; then
            log_info "Operación cancelada"
            return 0
        fi
        
        # Remover entrada existente
        crontab -l 2>/dev/null | grep -v "$CRON_JOB_NAME" | crontab -
        log_success "Cron job existente removido"
    fi
    
    # Agregar nueva entrada
    (crontab -l 2>/dev/null; echo "$cron_entry") | crontab -
    log_success "Cron job configurado: $cron_schedule"
    
    return 0
}

remove_cron_job() {
    if crontab -l 2>/dev/null | grep -q "$CRON_JOB_NAME"; then
        crontab -l 2>/dev/null | grep -v "$CRON_JOB_NAME" | crontab -
        log_success "Cron job de backups removido"
    else
        log_warning "No se encontró cron job de backups"
    fi
}

show_cron_status() {
    echo -e "\n${GREEN}Estado actual de cron jobs:${NC}"
    
    if crontab -l 2>/dev/null | grep -q "$CRON_JOB_NAME"; then
        echo -e "${GREEN}✅ Backup automático configurado:${NC}"
        crontab -l 2>/dev/null | grep "$CRON_JOB_NAME"
        
        # Mostrar próxima ejecución
        if command -v crontab >/dev/null; then
            echo -e "\n${BLUE}Próximas ejecuciones programadas:${NC}"
            # Esta es una aproximación, en producción usarías herramientas como 'crontab -l | cron-parser'
            log_info "Verificar 'crontab -l' para ver el schedule exacto"
        fi
    else
        echo -e "${YELLOW}⚠️ No hay backup automático configurado${NC}"
    fi
    
    # Mostrar logs recientes
    local log_file="$PROJECT_DIR/logs/cron-backup.log"
    if [ -f "$log_file" ]; then
        echo -e "\n${BLUE}Últimas 5 líneas del log de backups:${NC}"
        tail -n 5 "$log_file" 2>/dev/null || log_warning "No se pueden leer los logs"
    fi
}

create_backup_monitoring() {
    log_info "Creando script de monitoreo de backups..."
    
    cat > "$PROJECT_DIR/backup-monitor.sh" << 'EOF'
#!/bin/bash

# Script de monitoreo de backups
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_DIR="$PROJECT_DIR/backups/automated"
THRESHOLD_HOURS=26  # Alertar si no hay backup en las últimas 26 horas

# Verificar último backup
if [ -d "$BACKUP_DIR" ]; then
    LAST_BACKUP=$(find "$BACKUP_DIR" -name "*.gz" -type f -printf '%T@ %p\n' 2>/dev/null | sort -n | tail -1 | cut -d' ' -f2-)
    
    if [ ! -z "$LAST_BACKUP" ]; then
        LAST_BACKUP_TIME=$(stat -c %Y "$LAST_BACKUP" 2>/dev/null)
        CURRENT_TIME=$(date +%s)
        HOURS_SINCE_BACKUP=$(( (CURRENT_TIME - LAST_BACKUP_TIME) / 3600 ))
        
        if [ $HOURS_SINCE_BACKUP -gt $THRESHOLD_HOURS ]; then
            echo "⚠️ ALERTA: Último backup hace $HOURS_SINCE_BACKUP horas"
            echo "Archivo: $(basename "$LAST_BACKUP")"
            exit 1
        else
            echo "✅ Backup reciente disponible (hace $HOURS_SINCE_BACKUP horas)"
            exit 0
        fi
    else
        echo "❌ ERROR: No se encontraron backups"
        exit 1
    fi
else
    echo "❌ ERROR: Directorio de backups no existe"
    exit 1
fi
EOF
    
    chmod +x "$PROJECT_DIR/backup-monitor.sh"
    log_success "Script de monitoreo creado: backup-monitor.sh"
}

main_menu() {
    while true; do
        print_header "🛡️ CONFIGURADOR DE BACKUPS AUTOMÁTICOS"
        
        echo "Seleccione una opción:"
        echo "1) Configurar backup diario (2:00 AM)"
        echo "2) Configurar backup semanal (Domingos 2:00 AM)"
        echo "3) Configurar backup por horas"
        echo "4) Configurar schedule personalizado"
        echo "5) Mostrar estado actual"
        echo "6) Remover backup automático"
        echo "7) Crear monitoreo de backups"
        echo "8) Ejecutar backup manual ahora"
        echo "9) Salir"
        echo
        read -p "Opción: " choice
        
        case $choice in
            1)
                setup_cron_job "daily"
                ;;
            2)
                setup_cron_job "weekly"
                ;;
            3)
                setup_cron_job "hourly"
                ;;
            4)
                setup_cron_job "custom"
                ;;
            5)
                show_cron_status
                ;;
            6)
                remove_cron_job
                ;;
            7)
                create_backup_monitoring
                ;;
            8)
                log_info "Ejecutando backup manual..."
                "$PROJECT_DIR/automated-backup.sh"
                ;;
            9)
                log_info "¡Hasta luego!"
                exit 0
                ;;
            *)
                log_error "Opción no válida"
                ;;
        esac
        
        echo
        read -p "Presione Enter para continuar..."
    done
}

# Función principal
main() {
    # Verificar dependencias
    if ! command -v crontab >/dev/null 2>&1; then
        log_error "crontab no está disponible en este sistema"
        exit 1
    fi
    
    # Crear directorios necesarios
    mkdir -p "$PROJECT_DIR/logs"
    
    # Si se pasan argumentos, ejecutar directamente
    if [ $# -gt 0 ]; then
        case $1 in
            "setup-daily")
                setup_cron_job "daily"
                ;;
            "setup-weekly")
                setup_cron_job "weekly"
                ;;
            "setup-hourly")
                setup_cron_job "hourly"
                ;;
            "remove")
                remove_cron_job
                ;;
            "status")
                show_cron_status
                ;;
            "monitor")
                create_backup_monitoring
                ;;
            *)
                log_error "Argumento no válido: $1"
                echo "Uso: $0 [setup-daily|setup-weekly|setup-hourly|remove|status|monitor]"
                exit 1
                ;;
        esac
    else
        main_menu
    fi
}

# Ejecutar si es llamado directamente
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi