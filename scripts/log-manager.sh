#!/bin/bash

# =============================================================================
# GESTOR DE LOGS - FLORES VICTORIA
# =============================================================================
# Herramienta para ver, filtrar y gestionar logs del sistema
# =============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib/common.sh" 2>/dev/null || {
    echo "Error: No se pudo cargar lib/common.sh"
    exit 1
}

LOG_DIR="./logs"

# =============================================================================
# FUNCIONES DE GESTIÓN DE LOGS
# =============================================================================

# Listar logs disponibles
list_logs() {
    print_header "LOGS DISPONIBLES"
    
    if [ ! -d "$LOG_DIR" ]; then
        print_warning "No existe el directorio de logs: $LOG_DIR"
        return 1
    fi
    
    local logs=$(find "$LOG_DIR" -name "*.log" -type f 2>/dev/null | sort -r)
    
    if [ -z "$logs" ]; then
        print_warning "No se encontraron archivos de log"
        return 1
    fi
    
    echo ""
    printf "%-50s %-15s %-10s\n" "ARCHIVO" "FECHA" "TAMAÑO"
    printf "%-50s %-15s %-10s\n" "$(printf '%0.s-' {1..50})" "$(printf '%0.s-' {1..15})" "$(printf '%0.s-' {1..10})"
    
    while IFS= read -r log_file; do
        local filename=$(basename "$log_file")
        local filesize=$(du -h "$log_file" | awk '{print $1}')
        local filedate=$(stat -c %y "$log_file" 2>/dev/null | cut -d' ' -f1)
        
        printf "%-50s %-15s %-10s\n" "$filename" "$filedate" "$filesize"
    done <<< "$logs"
    
    echo ""
    local total_size=$(du -sh "$LOG_DIR" 2>/dev/null | awk '{print $1}')
    local total_files=$(echo "$logs" | wc -l)
    print_info "Total: $total_files archivos, $total_size"
}

# Ver últimas líneas de logs
tail_logs() {
    local type="${1:-all}"
    local lines="${2:-50}"
    
    print_header "ÚLTIMAS LÍNEAS DE LOGS: $type"
    
    case "$type" in
        diagnostics)
            local latest=$(find "$LOG_DIR" -name "diagnostics_*.log" -type f 2>/dev/null | sort -r | head -1)
            ;;
        services)
            local latest=$(find "$LOG_DIR" -name "services_*.log" -type f 2>/dev/null | sort -r | head -1)
            ;;
        all|*)
            local latest=$(find "$LOG_DIR" -name "*.log" -type f 2>/dev/null | sort -r | head -1)
            ;;
    esac
    
    if [ -z "$latest" ]; then
        print_error "No se encontraron logs de tipo: $type"
        return 1
    fi
    
    print_info "Archivo: $(basename $latest)"
    echo ""
    tail -n "$lines" "$latest"
}

# Buscar en logs
search_logs() {
    local pattern="$1"
    local type="${2:-all}"
    
    if [ -z "$pattern" ]; then
        print_error "Debe especificar un patrón de búsqueda"
        return 1
    fi
    
    print_header "BÚSQUEDA EN LOGS: $pattern"
    
    case "$type" in
        diagnostics)
            local files=$(find "$LOG_DIR" -name "diagnostics_*.log" -type f 2>/dev/null)
            ;;
        services)
            local files=$(find "$LOG_DIR" -name "services_*.log" -type f 2>/dev/null)
            ;;
        all|*)
            local files=$(find "$LOG_DIR" -name "*.log" -type f 2>/dev/null)
            ;;
    esac
    
    if [ -z "$files" ]; then
        print_error "No se encontraron logs para buscar"
        return 1
    fi
    
    echo ""
    grep -i -n --color=always "$pattern" $files 2>/dev/null || print_warning "No se encontraron coincidencias"
}

# Ver errores en logs
show_errors() {
    local type="${1:-all}"
    
    print_header "ERRORES EN LOGS: $type"
    
    case "$type" in
        diagnostics)
            local files=$(find "$LOG_DIR" -name "diagnostics_*.log" -type f 2>/dev/null)
            ;;
        services)
            local files=$(find "$LOG_DIR" -name "services_*.log" -type f 2>/dev/null)
            ;;
        all|*)
            local files=$(find "$LOG_DIR" -name "*.log" -type f 2>/dev/null)
            ;;
    esac
    
    if [ -z "$files" ]; then
        print_error "No se encontraron logs"
        return 1
    fi
    
    echo ""
    grep -i -E "error|fail|critical" $files 2>/dev/null | grep -v "No error" || print_success "No se encontraron errores"
}

# Limpiar logs antiguos
clean_old_logs() {
    local days="${1:-30}"
    
    print_header "LIMPIEZA DE LOGS"
    
    if [ ! -d "$LOG_DIR" ]; then
        print_warning "No existe el directorio de logs: $LOG_DIR"
        return 1
    fi
    
    print_info "Buscando logs con más de $days días..."
    
    local old_logs=$(find "$LOG_DIR" -name "*.log" -type f -mtime +$days 2>/dev/null)
    local count=$(echo "$old_logs" | grep -c "\.log$")
    
    if [ -z "$old_logs" ] || [ "$count" -eq 0 ]; then
        print_success "No hay logs antiguos para eliminar"
        return 0
    fi
    
    echo ""
    print_warning "Se eliminarán $count archivos de log:"
    echo "$old_logs" | while read log; do
        echo "  - $(basename $log)"
    done
    
    echo ""
    if confirm "¿Eliminar estos archivos?" "n"; then
        echo "$old_logs" | while read log; do
            rm -f "$log"
            print_success "Eliminado: $(basename $log)"
        done
        print_success "Limpieza completada: $count archivos eliminados"
    else
        print_info "Operación cancelada"
    fi
}

# Exportar logs
export_logs() {
    local type="${1:-all}"
    local output_file="logs_export_$(date +%Y%m%d_%H%M%S).tar.gz"
    
    print_header "EXPORTAR LOGS"
    
    if [ ! -d "$LOG_DIR" ]; then
        print_error "No existe el directorio de logs: $LOG_DIR"
        return 1
    fi
    
    print_info "Creando archivo comprimido..."
    
    case "$type" in
        diagnostics)
            tar -czf "$output_file" -C "$LOG_DIR" $(ls "$LOG_DIR"/diagnostics_*.log 2>/dev/null | xargs -n1 basename) 2>/dev/null
            ;;
        services)
            tar -czf "$output_file" -C "$LOG_DIR" $(ls "$LOG_DIR"/services_*.log 2>/dev/null | xargs -n1 basename) 2>/dev/null
            ;;
        all|*)
            tar -czf "$output_file" "$LOG_DIR"/*.log 2>/dev/null
            ;;
    esac
    
    if [ -f "$output_file" ]; then
        local size=$(du -h "$output_file" | awk '{print $1}')
        print_success "Logs exportados: $output_file ($size)"
    else
        print_error "Error al exportar logs"
        return 1
    fi
}

# Estadísticas de logs
stats_logs() {
    print_header "ESTADÍSTICAS DE LOGS"
    
    if [ ! -d "$LOG_DIR" ]; then
        print_warning "No existe el directorio de logs: $LOG_DIR"
        return 1
    fi
    
    local total_logs=$(find "$LOG_DIR" -name "*.log" -type f 2>/dev/null | wc -l)
    local total_size=$(du -sh "$LOG_DIR" 2>/dev/null | awk '{print $1}')
    local diagnostic_logs=$(find "$LOG_DIR" -name "diagnostics_*.log" -type f 2>/dev/null | wc -l)
    local service_logs=$(find "$LOG_DIR" -name "services_*.log" -type f 2>/dev/null | wc -l)
    local today_logs=$(find "$LOG_DIR" -name "*.log" -type f -mtime -1 2>/dev/null | wc -l)
    local week_logs=$(find "$LOG_DIR" -name "*.log" -type f -mtime -7 2>/dev/null | wc -l)
    local old_logs=$(find "$LOG_DIR" -name "*.log" -type f -mtime +30 2>/dev/null | wc -l)
    
    echo ""
    print_section "General"
    echo "  Total de logs: $total_logs"
    echo "  Tamaño total: $total_size"
    echo ""
    
    print_section "Por Tipo"
    echo "  Diagnóstico: $diagnostic_logs logs"
    echo "  Servicios: $service_logs logs"
    echo ""
    
    print_section "Por Antigüedad"
    echo "  Hoy: $today_logs logs"
    echo "  Última semana: $week_logs logs"
    echo "  Más de 30 días: $old_logs logs"
    
    if [ "$old_logs" -gt 0 ]; then
        echo ""
        print_warning "Hay $old_logs logs antiguos que pueden ser eliminados"
        print_info "Ejecute: $0 clean [días]"
    fi
}

# Ver log específico
view_log() {
    local filename="$1"
    
    if [ -z "$filename" ]; then
        print_error "Debe especificar el nombre del archivo de log"
        return 1
    fi
    
    local log_file="$LOG_DIR/$filename"
    
    if [ ! -f "$log_file" ]; then
        print_error "No se encontró el archivo: $filename"
        return 1
    fi
    
    print_header "CONTENIDO DE LOG: $filename"
    print_info "Tamaño: $(du -h "$log_file" | awk '{print $1}')"
    print_info "Fecha: $(stat -c %y "$log_file" 2>/dev/null | cut -d' ' -f1,2)"
    echo ""
    
    less "$log_file"
}

# =============================================================================
# MENÚ Y AYUDA
# =============================================================================

show_help() {
    cat << EOF
USO: $(basename $0) COMANDO [OPCIONES]

COMANDOS:
  list                          Listar todos los logs disponibles
  tail [tipo] [líneas]          Ver últimas líneas de logs (default: 50)
  search <patrón> [tipo]        Buscar patrón en logs
  errors [tipo]                 Mostrar solo líneas con errores
  clean [días]                  Limpiar logs antiguos (default: 30 días)
  export [tipo]                 Exportar logs a archivo .tar.gz
  stats                         Mostrar estadísticas de logs
  view <archivo>                Ver contenido de un log específico
  help                          Mostrar esta ayuda

TIPOS:
  all                           Todos los logs (default)
  diagnostics                   Solo logs de diagnóstico
  services                      Solo logs de servicios

EJEMPLOS:
  $(basename $0) list                      # Listar logs
  $(basename $0) tail diagnostics 100      # Ver últimas 100 líneas
  $(basename $0) search "error"            # Buscar errores
  $(basename $0) errors services           # Errores en logs de servicios
  $(basename $0) clean 7                   # Limpiar logs >7 días
  $(basename $0) export diagnostics        # Exportar logs de diagnóstico
  $(basename $0) view diagnostics_20251022_120000.log  # Ver log específico

SCRIPTS NPM:
  npm run logs:list            # Listar logs
  npm run logs:tail            # Ver últimos logs
  npm run logs:clean           # Limpiar logs antiguos

EOF
}

# =============================================================================
# MAIN
# =============================================================================

main() {
    local command="${1:-list}"
    shift
    
    case "$command" in
        list)
            list_logs
            ;;
        tail)
            tail_logs "$@"
            ;;
        search)
            search_logs "$@"
            ;;
        errors)
            show_errors "$@"
            ;;
        clean)
            clean_old_logs "$@"
            ;;
        export)
            export_logs "$@"
            ;;
        stats)
            stats_logs
            ;;
        view)
            view_log "$@"
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
}

# Ejecutar
main "$@"
