#!/bin/bash

# 🔧 MANTENIMIENTO AUTOMÁTICO - FLORES VICTORIA v3.0
# Sistema completo de mantenimiento, backups y limpieza automática

set -e

# =============================================================================
# CONFIGURACIÓN
# =============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR"
MAINTENANCE_LOG="$PROJECT_ROOT/logs/maintenance.log"
BACKUP_DIR="$PROJECT_ROOT/backups"
TMP_DIR="$PROJECT_ROOT/tmp"

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m'

# Configuración de mantenimiento
MAX_LOG_SIZE="50MB"          # Tamaño máximo de logs antes de rotación
BACKUP_RETENTION_DAYS=7      # Días de retención de backups
LOG_RETENTION_DAYS=14        # Días de retención de logs
TMP_CLEANUP_DAYS=1           # Días antes de limpiar archivos temporales
HEALTH_CHECK_INTERVAL=300    # 5 minutos entre verificaciones de salud

# Configuración de backups
BACKUP_SCHEDULE="daily"      # daily, weekly, monthly
BACKUP_COMPRESS=true         # Comprimir backups
BACKUP_ENCRYPTION=false      # Encriptar backups (requiere GPG)

# =============================================================================
# FUNCIONES UTILITARIAS
# =============================================================================

log_maintenance() {
    local level=$1
    local message=$2
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    case $level in
        "INFO")     echo -e "${BLUE}[$timestamp]${NC} ${WHITE}INFO:${NC} $message" ;;
        "SUCCESS")  echo -e "${GREEN}[$timestamp]${NC} ${GREEN}SUCCESS:${NC} $message" ;;
        "WARNING")  echo -e "${YELLOW}[$timestamp]${NC} ${YELLOW}WARNING:${NC} $message" ;;
        "ERROR")    echo -e "${RED}[$timestamp]${NC} ${RED}ERROR:${NC} $message" ;;
        "CLEAN")    echo -e "${PURPLE}[$timestamp]${NC} ${PURPLE}CLEAN:${NC} $message" ;;
        "BACKUP")   echo -e "${CYAN}[$timestamp]${NC} ${CYAN}BACKUP:${NC} $message" ;;
    esac
    
    # Log a archivo
    mkdir -p "$(dirname "$MAINTENANCE_LOG")"
    echo "[$timestamp] $level: $message" >> "$MAINTENANCE_LOG"
}

show_maintenance_banner() {
    clear
    echo -e "${CYAN}"
    echo "████████████████████████████████████████████████████████████████"
    echo "█                                                              █"
    echo "█   🔧 MANTENIMIENTO AUTOMÁTICO - FLORES VICTORIA v3.0 🔧     █"
    echo "█                                                              █"
    echo "█   Backups | Limpieza | Rotación | Monitoreo | Optimización  █"
    echo "█                                                              █"
    echo "████████████████████████████████████████████████████████████████"
    echo -e "${NC}"
    echo ""
}

# Obtener tamaño de archivo en bytes
get_file_size() {
    local file=$1
    if [[ -f "$file" ]]; then
        stat -c%s "$file" 2>/dev/null || echo "0"
    else
        echo "0"
    fi
}

# Convertir bytes a formato legible
format_bytes() {
    local bytes=$1
    if [[ $bytes -gt 1073741824 ]]; then
        echo "$(( bytes / 1073741824 ))GB"
    elif [[ $bytes -gt 1048576 ]]; then
        echo "$(( bytes / 1048576 ))MB"
    elif [[ $bytes -gt 1024 ]]; then
        echo "$(( bytes / 1024 ))KB"
    else
        echo "${bytes}B"
    fi
}

# =============================================================================
# SISTEMA DE BACKUPS
# =============================================================================

create_system_backup() {
    local backup_type=${1:-"manual"}
    local timestamp=$(date '+%Y%m%d_%H%M%S')
    local backup_name="flores_victoria_${backup_type}_${timestamp}"
    local backup_path="$BACKUP_DIR/$backup_name"
    
    log_maintenance "BACKUP" "🗄️  Iniciando backup del sistema ($backup_type)..."
    
    # Crear directorio de backup
    mkdir -p "$backup_path"
    
    # Archivos y directorios críticos para backup
    local backup_items=(
        "package.json"
        "automation"
        "admin-panel/package.json"
        "admin-panel/server.js"
        "ai-simple.js"
        "order-service-simple.js"
        "automate.sh"
        "watchdog.sh"
        "cicd.sh"
        "install.sh"
        "maintenance.sh"
    )
    
    # Crear manifiesto de backup
    cat > "$backup_path/MANIFEST.txt" << EOF
FLORES VICTORIA v3.0 - BACKUP MANIFEST
======================================
Backup Type: $backup_type
Timestamp: $(date -Iseconds)
Hostname: $(hostname)
User: $(whoami)
Backup Path: $backup_path

INCLUDED FILES:
EOF
    
    # Realizar backup de archivos
    local backup_size=0
    local files_backed_up=0
    
    for item in "${backup_items[@]}"; do
        local source_path="$PROJECT_ROOT/$item"
        if [[ -f "$source_path" ]] || [[ -d "$source_path" ]]; then
            log_maintenance "BACKUP" "📄 Respaldando: $item"
            
            # Crear directorio padre si es necesario
            local item_dir=$(dirname "$backup_path/$item")
            mkdir -p "$item_dir"
            
            # Copiar archivo o directorio
            if cp -r "$source_path" "$backup_path/$item" 2>/dev/null; then
                local item_size=$(du -sb "$backup_path/$item" 2>/dev/null | cut -f1 || echo "0")
                backup_size=$((backup_size + item_size))
                files_backed_up=$((files_backed_up + 1))
                echo "✅ $item ($(format_bytes $item_size))" >> "$backup_path/MANIFEST.txt"
            else
                log_maintenance "WARNING" "⚠️  Error respaldando: $item"
                echo "❌ $item (ERROR)" >> "$backup_path/MANIFEST.txt"
            fi
        else
            log_maintenance "WARNING" "⚠️  Archivo no encontrado: $item"
            echo "❓ $item (NOT FOUND)" >> "$backup_path/MANIFEST.txt"
        fi
    done
    
    # Backup de logs (últimos 7 días)
    if [[ -d "$PROJECT_ROOT/logs" ]]; then
        log_maintenance "BACKUP" "📄 Respaldando logs recientes..."
        mkdir -p "$backup_path/logs"
        find "$PROJECT_ROOT/logs" -name "*.log" -mtime -7 -exec cp {} "$backup_path/logs/" \; 2>/dev/null || true
    fi
    
    # Agregar estadísticas al manifiesto
    cat >> "$backup_path/MANIFEST.txt" << EOF

BACKUP STATISTICS:
==================
Files Backed Up: $files_backed_up
Total Size: $(format_bytes $backup_size)
Compression: $BACKUP_COMPRESS
Encryption: $BACKUP_ENCRYPTION
EOF
    
    # Comprimir backup si está habilitado
    if [[ $BACKUP_COMPRESS == true ]] && command -v tar >/dev/null 2>&1; then
        log_maintenance "BACKUP" "🗜️  Comprimiendo backup..."
        
        local compressed_backup="$BACKUP_DIR/${backup_name}.tar.gz"
        if tar -czf "$compressed_backup" -C "$BACKUP_DIR" "$backup_name" 2>/dev/null; then
            local compressed_size=$(get_file_size "$compressed_backup")
            local compression_ratio=$(( (backup_size - compressed_size) * 100 / backup_size ))
            
            log_maintenance "BACKUP" "✅ Compresión completada (${compression_ratio}% reducción)"
            
            # Eliminar directorio sin comprimir
            rm -rf "$backup_path"
            backup_path="$compressed_backup"
        else
            log_maintenance "WARNING" "⚠️  Error en compresión, manteniendo backup sin comprimir"
        fi
    fi
    
    # Encriptar backup si está habilitado
    if [[ $BACKUP_ENCRYPTION == true ]] && command -v gpg >/dev/null 2>&1; then
        log_maintenance "BACKUP" "🔐 Encriptando backup..."
        
        local encrypted_backup="${backup_path}.gpg"
        if gpg --symmetric --cipher-algo AES256 --compress-algo 2 --output "$encrypted_backup" "$backup_path" 2>/dev/null; then
            log_maintenance "BACKUP" "✅ Encriptación completada"
            rm -f "$backup_path"
            backup_path="$encrypted_backup"
        else
            log_maintenance "WARNING" "⚠️  Error en encriptación, manteniendo backup sin encriptar"
        fi
    fi
    
    # Registrar backup exitoso
    local final_size=$(get_file_size "$backup_path")
    log_maintenance "SUCCESS" "✅ Backup completado: $(basename "$backup_path")"
    log_maintenance "SUCCESS" "📊 Tamaño: $(format_bytes $final_size) | Archivos: $files_backed_up"
    
    # Registrar en histórico de backups
    echo "$(date -Iseconds) | $backup_type | $(basename "$backup_path") | $(format_bytes $final_size) | $files_backed_up files" >> "$BACKUP_DIR/backup_history.log"
    
    return 0
}

restore_system_backup() {
    local backup_file=$1
    
    if [[ -z "$backup_file" ]]; then
        log_maintenance "ERROR" "❌ Especifica el archivo de backup a restaurar"
        list_available_backups
        return 1
    fi
    
    local backup_path="$BACKUP_DIR/$backup_file"
    
    if [[ ! -f "$backup_path" ]]; then
        log_maintenance "ERROR" "❌ Backup no encontrado: $backup_path"
        return 1
    fi
    
    log_maintenance "BACKUP" "🔄 Iniciando restauración desde: $(basename "$backup_path")"
    
    # Crear backup del estado actual antes de restaurar
    log_maintenance "BACKUP" "📄 Creando backup de seguridad del estado actual..."
    create_system_backup "pre_restore"
    
    # Detener servicios antes de restaurar
    log_maintenance "BACKUP" "⏹️  Deteniendo servicios..."
    "$PROJECT_ROOT/automate.sh" stop >/dev/null 2>&1 || true
    
    # Crear directorio temporal para extracción
    local restore_temp="$TMP_DIR/restore_$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$restore_temp"
    
    # Desencriptar si es necesario
    local working_backup="$backup_path"
    if [[ "$backup_file" == *.gpg ]]; then
        log_maintenance "BACKUP" "🔓 Desencriptando backup..."
        local decrypted_backup="$restore_temp/$(basename "${backup_file%.gpg}")"
        
        if gpg --decrypt --output "$decrypted_backup" "$backup_path" 2>/dev/null; then
            working_backup="$decrypted_backup"
        else
            log_maintenance "ERROR" "❌ Error desencriptando backup"
            return 1
        fi
    fi
    
    # Descomprimir si es necesario
    if [[ "$working_backup" == *.tar.gz ]]; then
        log_maintenance "BACKUP" "📦 Descomprimiendo backup..."
        
        if tar -xzf "$working_backup" -C "$restore_temp" 2>/dev/null; then
            # Buscar directorio extraído
            local extracted_dir=$(find "$restore_temp" -maxdepth 1 -type d -name "flores_victoria_*" | head -1)
            if [[ -n "$extracted_dir" ]]; then
                working_backup="$extracted_dir"
            else
                log_maintenance "ERROR" "❌ Error encontrando directorio extraído"
                return 1
            fi
        else
            log_maintenance "ERROR" "❌ Error descomprimiendo backup"
            return 1
        fi
    elif [[ -d "$working_backup" ]]; then
        # Backup sin comprimir
        cp -r "$working_backup" "$restore_temp/"
        working_backup="$restore_temp/$(basename "$working_backup")"
    fi
    
    # Verificar que tenemos un directorio válido
    if [[ ! -d "$working_backup" ]]; then
        log_maintenance "ERROR" "❌ Directorio de backup inválido"
        return 1
    fi
    
    # Verificar manifiesto
    if [[ -f "$working_backup/MANIFEST.txt" ]]; then
        log_maintenance "BACKUP" "📋 Verificando manifiesto de backup..."
        local manifest_info=$(grep -E "^Backup Type:|^Timestamp:" "$working_backup/MANIFEST.txt" 2>/dev/null || true)
        if [[ -n "$manifest_info" ]]; then
            log_maintenance "BACKUP" "ℹ️  Información del backup:"
            echo "$manifest_info" | while read line; do
                log_maintenance "BACKUP" "   $line"
            done
        fi
    else
        log_maintenance "WARNING" "⚠️  No se encontró manifiesto del backup"
    fi
    
    # Restaurar archivos
    log_maintenance "BACKUP" "📄 Restaurando archivos del sistema..."
    
    local files_restored=0
    local files_failed=0
    
    # Restaurar archivos individuales
    find "$working_backup" -type f -not -name "MANIFEST.txt" | while read file; do
        local relative_path=${file#$working_backup/}
        local target_path="$PROJECT_ROOT/$relative_path"
        
        # Crear directorio padre si es necesario
        mkdir -p "$(dirname "$target_path")"
        
        if cp "$file" "$target_path" 2>/dev/null; then
            log_maintenance "BACKUP" "✅ Restaurado: $relative_path"
            files_restored=$((files_restored + 1))
        else
            log_maintenance "WARNING" "⚠️  Error restaurando: $relative_path"
            files_failed=$((files_failed + 1))
        fi
    done
    
    # Restaurar permisos de scripts
    log_maintenance "BACKUP" "🔐 Restaurando permisos de scripts..."
    local scripts=(
        "automate.sh"
        "watchdog.sh"
        "cicd.sh"
        "install.sh"
        "maintenance.sh"
    )
    
    for script in "${scripts[@]}"; do
        if [[ -f "$PROJECT_ROOT/$script" ]]; then
            chmod +x "$PROJECT_ROOT/$script"
        fi
    done
    
    # Limpiar archivos temporales
    rm -rf "$restore_temp"
    
    log_maintenance "SUCCESS" "✅ Restauración completada"
    log_maintenance "SUCCESS" "📊 Archivos restaurados: $files_restored"
    
    if [[ $files_failed -gt 0 ]]; then
        log_maintenance "WARNING" "⚠️  Archivos con errores: $files_failed"
    fi
    
    # Verificar sistema después de restauración
    log_maintenance "BACKUP" "🔍 Verificando sistema restaurado..."
    if "$PROJECT_ROOT/automate.sh" start >/dev/null 2>&1; then
        sleep 5
        if "$PROJECT_ROOT/automate.sh" health >/dev/null 2>&1; then
            log_maintenance "SUCCESS" "✅ Sistema restaurado y funcionando correctamente"
        else
            log_maintenance "WARNING" "⚠️  Sistema restaurado pero con problemas de salud"
        fi
    else
        log_maintenance "ERROR" "❌ Error iniciando sistema restaurado"
    fi
    
    return 0
}

list_available_backups() {
    log_maintenance "BACKUP" "📋 Backups disponibles:"
    
    if [[ ! -d "$BACKUP_DIR" ]]; then
        log_maintenance "WARNING" "⚠️  Directorio de backups no existe"
        return 1
    fi
    
    local backup_files=$(find "$BACKUP_DIR" -maxdepth 1 -type f \( -name "*.tar.gz" -o -name "*.gpg" \) -o -type d -name "flores_victoria_*" | sort -r)
    
    if [[ -z "$backup_files" ]]; then
        log_maintenance "WARNING" "⚠️  No se encontraron backups"
        return 1
    fi
    
    echo ""
    echo -e "${CYAN}┌──────────────────────────────────────────────────────────────────────────┐${NC}"
    echo -e "${CYAN}│                              📦 BACKUPS DISPONIBLES                       │${NC}"
    echo -e "${CYAN}├──────────────────────────────────────────────────────────────────────────┤${NC}"
    
    local backup_count=0
    for backup in $backup_files; do
        if [[ -f "$backup" ]] || [[ -d "$backup" ]]; then
            local backup_name=$(basename "$backup")
            local backup_size=$(format_bytes $(get_file_size "$backup"))
            local backup_date=$(date -r "$backup" '+%Y-%m-%d %H:%M:%S' 2>/dev/null || echo "Unknown")
            
            echo -e "${CYAN}│${NC} ${WHITE}$backup_name${NC}"
            echo -e "${CYAN}│${NC}   📅 $backup_date  📊 $backup_size"
            echo -e "${CYAN}├──────────────────────────────────────────────────────────────────────────┤${NC}"
            
            backup_count=$((backup_count + 1))
        fi
    done
    
    echo -e "${CYAN}│${NC} Total de backups: ${WHITE}$backup_count${NC}"
    echo -e "${CYAN}└──────────────────────────────────────────────────────────────────────────┘${NC}"
    echo ""
    
    return 0
}

# =============================================================================
# LIMPIEZA Y ROTACIÓN
# =============================================================================

rotate_logs() {
    log_maintenance "CLEAN" "🔄 Iniciando rotación de logs..."
    
    local logs_rotated=0
    local space_freed=0
    
    # Buscar archivos de log
    local log_files=$(find "$PROJECT_ROOT/logs" -name "*.log" -type f 2>/dev/null || true)
    
    for log_file in $log_files; do
        if [[ -f "$log_file" ]]; then
            local log_size=$(get_file_size "$log_file")
            local max_size_bytes=52428800  # 50MB en bytes
            
            # Rotar si el archivo es muy grande
            if [[ $log_size -gt $max_size_bytes ]]; then
                local backup_log="${log_file}.$(date +%Y%m%d_%H%M%S)"
                
                if mv "$log_file" "$backup_log" 2>/dev/null; then
                    touch "$log_file"
                    
                    # Comprimir log rotado
                    if command -v gzip >/dev/null 2>&1; then
                        gzip "$backup_log" 2>/dev/null && backup_log="${backup_log}.gz"
                    fi
                    
                    log_maintenance "CLEAN" "✅ Log rotado: $(basename "$log_file") ($(format_bytes $log_size))"
                    logs_rotated=$((logs_rotated + 1))
                    space_freed=$((space_freed + log_size))
                else
                    log_maintenance "WARNING" "⚠️  Error rotando log: $(basename "$log_file")"
                fi
            fi
        fi
    done
    
    # Limpiar logs antiguos
    log_maintenance "CLEAN" "🗑️  Limpiando logs antiguos (>$LOG_RETENTION_DAYS días)..."
    
    local old_logs=$(find "$PROJECT_ROOT/logs" -name "*.log.*" -type f -mtime +$LOG_RETENTION_DAYS 2>/dev/null || true)
    local old_logs_deleted=0
    
    for old_log in $old_logs; do
        if [[ -f "$old_log" ]]; then
            local old_log_size=$(get_file_size "$old_log")
            if rm "$old_log" 2>/dev/null; then
                log_maintenance "CLEAN" "🗑️  Eliminado: $(basename "$old_log") ($(format_bytes $old_log_size))"
                old_logs_deleted=$((old_logs_deleted + 1))
                space_freed=$((space_freed + old_log_size))
            fi
        fi
    done
    
    log_maintenance "SUCCESS" "✅ Rotación completada: $logs_rotated logs rotados, $old_logs_deleted eliminados"
    log_maintenance "SUCCESS" "💽 Espacio liberado: $(format_bytes $space_freed)"
    
    return 0
}

cleanup_temporary_files() {
    log_maintenance "CLEAN" "🧹 Limpiando archivos temporales..."
    
    local files_deleted=0
    local space_freed=0
    
    # Limpiar directorio tmp
    if [[ -d "$TMP_DIR" ]]; then
        local temp_files=$(find "$TMP_DIR" -type f -mtime +$TMP_CLEANUP_DAYS 2>/dev/null || true)
        
        for temp_file in $temp_files; do
            if [[ -f "$temp_file" ]]; then
                local file_size=$(get_file_size "$temp_file")
                if rm "$temp_file" 2>/dev/null; then
                    files_deleted=$((files_deleted + 1))
                    space_freed=$((space_freed + file_size))
                fi
            fi
        done
        
        # Limpiar directorios temporales vacíos
        find "$TMP_DIR" -type d -empty -delete 2>/dev/null || true
    fi
    
    # Limpiar archivos de node_modules temporales si existen
    local node_temp_dirs=$(find "$PROJECT_ROOT" -name ".npm" -o -name ".node_modules_tmp" -type d 2>/dev/null || true)
    for temp_dir in $node_temp_dirs; do
        if [[ -d "$temp_dir" ]]; then
            local dir_size=$(du -sb "$temp_dir" 2>/dev/null | cut -f1 || echo "0")
            if rm -rf "$temp_dir" 2>/dev/null; then
                log_maintenance "CLEAN" "🗑️  Directorio temporal eliminado: $(basename "$temp_dir")"
                space_freed=$((space_freed + dir_size))
            fi
        fi
    done
    
    # Limpiar archivos de lock antiguos
    local lock_files=$(find "$PROJECT_ROOT" -name "*.lock" -o -name "*.pid" -type f -mtime +1 2>/dev/null || true)
    for lock_file in $lock_files; do
        if [[ -f "$lock_file" ]]; then
            # Verificar si el proceso asociado está activo
            local should_delete=true
            
            if [[ "$lock_file" == *.pid ]]; then
                local pid_content=$(cat "$lock_file" 2>/dev/null || echo "")
                if [[ -n "$pid_content" ]] && kill -0 "$pid_content" 2>/dev/null; then
                    should_delete=false
                fi
            fi
            
            if [[ $should_delete == true ]]; then
                local file_size=$(get_file_size "$lock_file")
                if rm "$lock_file" 2>/dev/null; then
                    files_deleted=$((files_deleted + 1))
                    space_freed=$((space_freed + file_size))
                fi
            fi
        fi
    done
    
    log_maintenance "SUCCESS" "✅ Limpieza completada: $files_deleted archivos eliminados"
    log_maintenance "SUCCESS" "💽 Espacio liberado: $(format_bytes $space_freed)"
    
    return 0
}

cleanup_old_backups() {
    log_maintenance "CLEAN" "🗄️  Limpiando backups antiguos (>$BACKUP_RETENTION_DAYS días)..."
    
    if [[ ! -d "$BACKUP_DIR" ]]; then
        log_maintenance "WARNING" "⚠️  Directorio de backups no existe"
        return 0
    fi
    
    local backups_deleted=0
    local space_freed=0
    
    # Buscar backups antiguos
    local old_backups=$(find "$BACKUP_DIR" -type f \( -name "*.tar.gz" -o -name "*.gpg" \) -mtime +$BACKUP_RETENTION_DAYS 2>/dev/null || true)
    old_backups="$old_backups $(find "$BACKUP_DIR" -type d -name "flores_victoria_*" -mtime +$BACKUP_RETENTION_DAYS 2>/dev/null || true)"
    
    for old_backup in $old_backups; do
        if [[ -f "$old_backup" ]] || [[ -d "$old_backup" ]]; then
            local backup_size=$(du -sb "$old_backup" 2>/dev/null | cut -f1 || echo "0")
            
            if rm -rf "$old_backup" 2>/dev/null; then
                log_maintenance "CLEAN" "🗑️  Backup eliminado: $(basename "$old_backup") ($(format_bytes $backup_size))"
                backups_deleted=$((backups_deleted + 1))
                space_freed=$((space_freed + backup_size))
            else
                log_maintenance "WARNING" "⚠️  Error eliminando backup: $(basename "$old_backup")"
            fi
        fi
    done
    
    log_maintenance "SUCCESS" "✅ Limpieza de backups completada: $backups_deleted eliminados"
    log_maintenance "SUCCESS" "💽 Espacio liberado: $(format_bytes $space_freed)"
    
    return 0
}

# =============================================================================
# MONITOREO Y SALUD DEL SISTEMA
# =============================================================================

check_system_health() {
    log_maintenance "INFO" "🏥 Verificando salud del sistema..."
    
    local health_score=100
    local issues_found=()
    
    # Verificar espacio en disco
    local disk_usage=$(df "$PROJECT_ROOT" | awk 'NR==2 {print $5}' | sed 's/%//')
    if [[ $disk_usage -gt 90 ]]; then
        issues_found+=("Espacio en disco crítico: ${disk_usage}%")
        health_score=$((health_score - 20))
    elif [[ $disk_usage -gt 80 ]]; then
        issues_found+=("Espacio en disco alto: ${disk_usage}%")
        health_score=$((health_score - 10))
    fi
    
    # Verificar memoria
    if command -v free >/dev/null 2>&1; then
        local memory_usage=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
        if [[ $memory_usage -gt 90 ]]; then
            issues_found+=("Uso de memoria crítico: ${memory_usage}%")
            health_score=$((health_score - 15))
        elif [[ $memory_usage -gt 80 ]]; then
            issues_found+=("Uso de memoria alto: ${memory_usage}%")
            health_score=$((health_score - 5))
        fi
    fi
    
    # Verificar servicios
    if [[ -f "$PROJECT_ROOT/automate.sh" ]]; then
        if ! "$PROJECT_ROOT/automate.sh" health >/dev/null 2>&1; then
            issues_found+=("Algunos servicios no responden")
            health_score=$((health_score - 25))
        fi
    fi
    
    # Verificar logs grandes
    local large_logs=$(find "$PROJECT_ROOT/logs" -name "*.log" -size +50M 2>/dev/null | wc -l)
    if [[ $large_logs -gt 0 ]]; then
        issues_found+=("$large_logs logs requieren rotación")
        health_score=$((health_score - 5))
    fi
    
    # Verificar archivos temporales
    local temp_files=$(find "$TMP_DIR" -type f -mtime +1 2>/dev/null | wc -l)
    if [[ $temp_files -gt 10 ]]; then
        issues_found+=("$temp_files archivos temporales antiguos")
        health_score=$((health_score - 5))
    fi
    
    # Mostrar resultados
    echo ""
    echo -e "${CYAN}┌──────────────────────────────────────────────────────────────────────────┐${NC}"
    echo -e "${CYAN}│                          🏥 SALUD DEL SISTEMA                             │${NC}"
    echo -e "${CYAN}├──────────────────────────────────────────────────────────────────────────┤${NC}"
    
    # Color del score
    local score_color=""
    if [[ $health_score -ge 90 ]]; then
        score_color="${GREEN}"
    elif [[ $health_score -ge 70 ]]; then
        score_color="${YELLOW}"
    else
        score_color="${RED}"
    fi
    
    echo -e "${CYAN}│${NC} Puntuación de Salud: ${score_color}${health_score}/100${NC}"
    echo -e "${CYAN}│${NC} Espacio en Disco:    ${WHITE}${disk_usage}% usado${NC}"
    
    if command -v free >/dev/null 2>&1; then
        echo -e "${CYAN}│${NC} Memoria RAM:         ${WHITE}${memory_usage}% usado${NC}"
    fi
    
    echo -e "${CYAN}├──────────────────────────────────────────────────────────────────────────┤${NC}"
    
    if [[ ${#issues_found[@]} -eq 0 ]]; then
        echo -e "${CYAN}│${NC} ${GREEN}✅ No se encontraron problemas${NC}"
    else
        echo -e "${CYAN}│${NC} ${YELLOW}⚠️  Problemas encontrados:${NC}"
        for issue in "${issues_found[@]}"; do
            echo -e "${CYAN}│${NC}   • $issue"
        done
    fi
    
    echo -e "${CYAN}└──────────────────────────────────────────────────────────────────────────┘${NC}"
    echo ""
    
    # Sugerir acciones de mantenimiento si es necesario
    if [[ $health_score -lt 80 ]]; then
        log_maintenance "WARNING" "⚠️  Sistema requiere mantenimiento (Score: $health_score/100)"
        log_maintenance "INFO" "💡 Ejecuta './maintenance.sh full' para mantenimiento completo"
    else
        log_maintenance "SUCCESS" "✅ Sistema en buen estado (Score: $health_score/100)"
    fi
    
    return 0
}

optimize_system_performance() {
    log_maintenance "INFO" "⚡ Optimizando rendimiento del sistema..."
    
    # Limpiar cache de npm si existe
    if command -v npm >/dev/null 2>&1; then
        log_maintenance "INFO" "🧹 Limpiando cache de npm..."
        npm cache clean --force >/dev/null 2>&1 || true
    fi
    
    # Optimizar node_modules si son muy grandes
    local node_modules_dirs=$(find "$PROJECT_ROOT" -name "node_modules" -type d 2>/dev/null || true)
    
    for modules_dir in $node_modules_dirs; do
        if [[ -d "$modules_dir" ]]; then
            local modules_size=$(du -sb "$modules_dir" 2>/dev/null | cut -f1 || echo "0")
            
            # Si node_modules es > 500MB, sugerir reinstalación limpia
            if [[ $modules_size -gt 524288000 ]]; then
                log_maintenance "WARNING" "⚠️  $(basename "$(dirname "$modules_dir")")/node_modules es grande ($(format_bytes $modules_size))"
                log_maintenance "INFO" "💡 Considera reinstalación limpia con 'npm ci'"
            fi
        fi
    done
    
    # Verificar y reparar permisos si es necesario
    log_maintenance "INFO" "🔐 Verificando permisos de scripts..."
    local scripts_fixed=0
    
    local script_files=$(find "$PROJECT_ROOT" -maxdepth 1 -name "*.sh" -type f 2>/dev/null || true)
    for script in $script_files; do
        if [[ ! -x "$script" ]]; then
            chmod +x "$script" 2>/dev/null && scripts_fixed=$((scripts_fixed + 1))
        fi
    done
    
    if [[ $scripts_fixed -gt 0 ]]; then
        log_maintenance "SUCCESS" "✅ Permisos reparados en $scripts_fixed scripts"
    fi
    
    log_maintenance "SUCCESS" "✅ Optimización de rendimiento completada"
    
    return 0
}

# =============================================================================
# MANTENIMIENTO PROGRAMADO
# =============================================================================

run_scheduled_maintenance() {
    local schedule_type=${1:-"daily"}
    
    log_maintenance "INFO" "⏰ Ejecutando mantenimiento programado ($schedule_type)..."
    
    case $schedule_type in
        "hourly")
            # Mantenimiento ligero cada hora
            check_system_health
            cleanup_temporary_files
            ;;
        "daily")
            # Mantenimiento diario
            check_system_health
            cleanup_temporary_files
            rotate_logs
            create_system_backup "daily"
            ;;
        "weekly")
            # Mantenimiento semanal
            check_system_health
            cleanup_temporary_files
            rotate_logs
            cleanup_old_backups
            optimize_system_performance
            create_system_backup "weekly"
            ;;
        "monthly")
            # Mantenimiento mensual completo
            check_system_health
            cleanup_temporary_files
            rotate_logs
            cleanup_old_backups
            optimize_system_performance
            create_system_backup "monthly"
            
            # Generar reporte mensual
            generate_maintenance_report
            ;;
        *)
            log_maintenance "ERROR" "❌ Tipo de programación no soportado: $schedule_type"
            return 1
            ;;
    esac
    
    log_maintenance "SUCCESS" "✅ Mantenimiento programado completado ($schedule_type)"
    return 0
}

generate_maintenance_report() {
    log_maintenance "INFO" "📊 Generando reporte de mantenimiento..."
    
    local report_file="$PROJECT_ROOT/logs/maintenance_report_$(date +%Y%m).txt"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    cat > "$report_file" << EOF
FLORES VICTORIA v3.0 - REPORTE DE MANTENIMIENTO
===============================================
Generado: $timestamp
Período: $(date '+%B %Y')

RESUMEN DEL SISTEMA:
===================
EOF
    
    # Información del sistema
    echo "Hostname: $(hostname)" >> "$report_file"
    echo "OS: $(uname -s) $(uname -r)" >> "$report_file"
    echo "Uptime: $(uptime -p 2>/dev/null || uptime)" >> "$report_file"
    echo "" >> "$report_file"
    
    # Estadísticas de espacio
    echo "ESPACIO EN DISCO:" >> "$report_file"
    df -h "$PROJECT_ROOT" | grep -v "^Filesystem" >> "$report_file"
    echo "" >> "$report_file"
    
    # Estadísticas de backups
    echo "BACKUPS DISPONIBLES:" >> "$report_file"
    if [[ -f "$BACKUP_DIR/backup_history.log" ]]; then
        echo "Últimos 10 backups:" >> "$report_file"
        tail -10 "$BACKUP_DIR/backup_history.log" >> "$report_file"
    else
        echo "No hay historial de backups disponible" >> "$report_file"
    fi
    echo "" >> "$report_file"
    
    # Estadísticas de logs
    echo "ESTADÍSTICAS DE LOGS:" >> "$report_file"
    if [[ -d "$PROJECT_ROOT/logs" ]]; then
        local log_count=$(find "$PROJECT_ROOT/logs" -name "*.log" -type f | wc -l)
        local log_size=$(du -sh "$PROJECT_ROOT/logs" 2>/dev/null | cut -f1)
        echo "Total de logs: $log_count archivos" >> "$report_file"
        echo "Tamaño total: $log_size" >> "$report_file"
    else
        echo "Directorio de logs no encontrado" >> "$report_file"
    fi
    echo "" >> "$report_file"
    
    # Recomendaciones
    echo "RECOMENDACIONES:" >> "$report_file"
    echo "• Ejecutar mantenimiento diario automáticamente" >> "$report_file"
    echo "• Monitorear espacio en disco regularmente" >> "$report_file"
    echo "• Verificar backups mensualmente" >> "$report_file"
    echo "• Mantener logs rotados y comprimidos" >> "$report_file"
    
    log_maintenance "SUCCESS" "✅ Reporte generado: $report_file"
    
    return 0
}

# =============================================================================
# FUNCIONES DE CONTROL
# =============================================================================

show_maintenance_help() {
    echo -e "${CYAN}🔧 MANTENIMIENTO AUTOMÁTICO - FLORES VICTORIA v3.0${NC}"
    echo ""
    echo -e "${YELLOW}📖 COMANDOS DISPONIBLES:${NC}"
    echo ""
    echo -e "${WHITE}MANTENIMIENTO GENERAL:${NC}"
    echo "  full                    - Mantenimiento completo"
    echo "  health                  - Verificar salud del sistema"
    echo "  optimize                - Optimizar rendimiento"
    echo "  scheduled [tipo]        - Mantenimiento programado"
    echo ""
    echo -e "${WHITE}BACKUPS:${NC}"
    echo "  backup [tipo]           - Crear backup del sistema"
    echo "  restore <archivo>       - Restaurar desde backup"
    echo "  list-backups           - Listar backups disponibles"
    echo ""
    echo -e "${WHITE}LIMPIEZA:${NC}"
    echo "  clean                   - Limpieza completa"
    echo "  clean-logs             - Solo limpiar logs"
    echo "  clean-temp             - Solo limpiar temporales"
    echo "  clean-backups          - Solo limpiar backups antiguos"
    echo ""
    echo -e "${WHITE}LOGS Y REPORTES:${NC}"
    echo "  rotate-logs            - Rotar logs grandes"
    echo "  report                 - Generar reporte de mantenimiento"
    echo ""
    echo -e "${YELLOW}💡 Ejemplos:${NC}"
    echo "  ./maintenance.sh full"
    echo "  ./maintenance.sh backup daily"
    echo "  ./maintenance.sh restore backup.tar.gz"
    echo "  ./maintenance.sh scheduled weekly"
}

# =============================================================================
# FUNCIÓN PRINCIPAL
# =============================================================================

main() {
    local command=${1:-"help"}
    local parameter=${2:-""}
    
    case $command in
        "full"|"complete")
            show_maintenance_banner
            log_maintenance "INFO" "🚀 Iniciando mantenimiento completo del sistema..."
            
            check_system_health
            cleanup_temporary_files
            rotate_logs
            cleanup_old_backups
            optimize_system_performance
            create_system_backup "maintenance"
            
            log_maintenance "SUCCESS" "🎉 ¡Mantenimiento completo terminado!"
            ;;
        "health"|"check")
            check_system_health
            ;;
        "optimize"|"performance")
            optimize_system_performance
            ;;
        "backup")
            create_system_backup "${parameter:-manual}"
            ;;
        "restore")
            if [[ -z "$parameter" ]]; then
                log_maintenance "ERROR" "❌ Especifica el archivo de backup a restaurar"
                list_available_backups
                exit 1
            fi
            restore_system_backup "$parameter"
            ;;
        "list-backups"|"backups")
            list_available_backups
            ;;
        "clean")
            log_maintenance "INFO" "🧹 Iniciando limpieza completa..."
            cleanup_temporary_files
            rotate_logs
            cleanup_old_backups
            ;;
        "clean-logs")
            rotate_logs
            ;;
        "clean-temp")
            cleanup_temporary_files
            ;;
        "clean-backups")
            cleanup_old_backups
            ;;
        "rotate-logs"|"rotate")
            rotate_logs
            ;;
        "scheduled")
            run_scheduled_maintenance "${parameter:-daily}"
            ;;
        "report")
            generate_maintenance_report
            ;;
        "help"|"--help"|"-h")
            show_maintenance_help
            ;;
        *)
            log_maintenance "ERROR" "❌ Comando desconocido: $command"
            show_maintenance_help
            exit 1
            ;;
    esac
}

# Manejo de señales
cleanup_maintenance() {
    log_maintenance "WARNING" "⚠️  Mantenimiento interrumpido por el usuario"
    
    # Limpiar archivos temporales de la sesión actual
    local temp_restore_dirs=$(find "$TMP_DIR" -name "restore_*" -type d 2>/dev/null || true)
    for temp_dir in $temp_restore_dirs; do
        rm -rf "$temp_dir" 2>/dev/null || true
    done
    
    exit 130
}

trap cleanup_maintenance SIGINT SIGTERM

# Ejecutar función principal
main "$@"