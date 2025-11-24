#!/bin/bash

# =============================================================================
# 🛡️ SISTEMA DE BACKUPS AUTOMÁTICOS ENTERPRISE
# Flores Victoria v3.0 - Consolidación FASE 1
# =============================================================================

set -euo pipefail

# Configuración de colores
export RED='\033[0;31m'
export GREEN='\033[0;32m'
export YELLOW='\033[1;33m'
export BLUE='\033[0;34m'
export PURPLE='\033[0;35m'
export CYAN='\033[0;36m'
export WHITE='\033[1;37m'
export NC='\033[0m'

# Configuración del sistema de backup
TIMESTAMP=$(date '+%Y%m%d_%H%M%S')
BACKUP_DIR="backups/automated"
BACKUP_LOG="logs/backup-$(date '+%Y%m%d').log"
RETENTION_DAYS=30
MAX_BACKUPS=50

# Configuración de bases de datos
POSTGRES_HOST="localhost"
POSTGRES_PORT="5433"
POSTGRES_DB="flores_db"
POSTGRES_USER="flores_user"

MONGODB_HOST="localhost"
MONGODB_PORT="27018"
MONGODB_DB="microservices_db"

REDIS_HOST="localhost"
REDIS_PORT="6380"

# Crear directorios necesarios
mkdir -p "$BACKUP_DIR"/{database,files,config,logs} logs

# =============================================================================
# FUNCIONES DE UTILIDAD
# =============================================================================

log() {
    local level=$1
    local message=$2
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "[$timestamp] $level: $message" | tee -a "$BACKUP_LOG"
}

log_success() { echo -e "${GREEN}✅ $1${NC}" && log "SUCCESS" "$1"; }
log_error() { echo -e "${RED}❌ $1${NC}" && log "ERROR" "$1"; }
log_warning() { echo -e "${YELLOW}⚠️ $1${NC}" && log "WARNING" "$1"; }
log_info() { echo -e "${BLUE}ℹ️ $1${NC}" && log "INFO" "$1"; }

print_header() {
    echo -e "\n${CYAN}=================================${NC}"
    echo -e "${WHITE}$1${NC}"
    echo -e "${CYAN}=================================${NC}\n"
}

# Función para crear hash de archivos
create_checksum() {
    local file=$1
    if [ -f "$file" ]; then
        sha256sum "$file" > "${file}.sha256"
        log_info "Checksum creado para $(basename "$file")"
    fi
}

# Función para verificar espacio disponible
check_disk_space() {
    local required_space_gb=$1
    local available_space=$(df -BG . | awk 'NR==2 {print $4}' | sed 's/G//')
    
    if [ "$available_space" -lt "$required_space_gb" ]; then
        log_error "Espacio insuficiente. Requerido: ${required_space_gb}GB, Disponible: ${available_space}GB"
        return 1
    fi
    
    log_success "Espacio disponible suficiente: ${available_space}GB"
    return 0
}

# =============================================================================
# FUNCIONES DE BACKUP
# =============================================================================

backup_postgresql() {
    log_info "🐘 Iniciando backup de PostgreSQL..."
    
    local backup_file="$BACKUP_DIR/database/postgres_${TIMESTAMP}.sql"
    local compressed_file="${backup_file}.gz"
    
    # Verificar conexión
    if ! pg_isready -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -d "$POSTGRES_DB" -U "$POSTGRES_USER" >/dev/null 2>&1; then
        log_warning "PostgreSQL no está disponible, omitiendo backup"
        return 1
    fi
    
    # Crear backup
    if PGPASSWORD="$POSTGRES_PASSWORD" pg_dump \
        -h "$POSTGRES_HOST" \
        -p "$POSTGRES_PORT" \
        -U "$POSTGRES_USER" \
        -d "$POSTGRES_DB" \
        --verbose \
        --no-owner \
        --no-privileges \
        > "$backup_file" 2>/dev/null; then
        
        # Comprimir backup
        gzip "$backup_file"
        create_checksum "$compressed_file"
        
        local size=$(du -h "$compressed_file" | cut -f1)
        log_success "PostgreSQL backup completado: $(basename "$compressed_file") ($size)"
        return 0
    else
        log_error "Error en backup de PostgreSQL"
        return 1
    fi
}

backup_mongodb() {
    log_info "🍃 Iniciando backup de MongoDB..."
    
    local backup_dir="$BACKUP_DIR/database/mongodb_${TIMESTAMP}"
    local compressed_file="${backup_dir}.tar.gz"
    
    # Verificar conexión
    if ! mongosh --host "$MONGODB_HOST:$MONGODB_PORT" --eval "db.runCommand('ping')" >/dev/null 2>&1; then
        log_warning "MongoDB no está disponible, omitiendo backup"
        return 1
    fi
    
    # Crear backup
    if mongodump \
        --host "$MONGODB_HOST:$MONGODB_PORT" \
        --db "$MONGODB_DB" \
        --out "$backup_dir" \
        --quiet 2>/dev/null; then
        
        # Comprimir backup
        tar -czf "$compressed_file" -C "$BACKUP_DIR/database" "$(basename "$backup_dir")"
        rm -rf "$backup_dir"
        create_checksum "$compressed_file"
        
        local size=$(du -h "$compressed_file" | cut -f1)
        log_success "MongoDB backup completado: $(basename "$compressed_file") ($size)"
        return 0
    else
        log_error "Error en backup de MongoDB"
        return 1
    fi
}

backup_redis() {
    log_info "🔴 Iniciando backup de Redis..."
    
    local backup_file="$BACKUP_DIR/database/redis_${TIMESTAMP}.rdb"
    local compressed_file="${backup_file}.gz"
    
    # Verificar conexión
    if ! redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" ping >/dev/null 2>&1; then
        log_warning "Redis no está disponible, omitiendo backup"
        return 1
    fi
    
    # Crear backup
    if redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" --rdb "$backup_file" >/dev/null 2>&1; then
        # Comprimir backup
        gzip "$backup_file"
        create_checksum "$compressed_file"
        
        local size=$(du -h "$compressed_file" | cut -f1)
        log_success "Redis backup completado: $(basename "$compressed_file") ($size)"
        return 0
    else
        log_error "Error en backup de Redis"
        return 1
    fi
}

backup_application_files() {
    log_info "📁 Iniciando backup de archivos de aplicación..."
    
    local backup_file="$BACKUP_DIR/files/application_${TIMESTAMP}.tar.gz"
    
    # Archivos y directorios críticos
    local critical_paths=(
        "admin-panel/public"
        "admin-panel/server.js"
        "admin-panel/package.json"
        "docker-compose.yml"
        "package.json"
        ".env"
        "config/"
        "scripts/"
        "docs/"
        "k8s/"
        "helm/"
    )
    
    # Crear lista de archivos existentes
    local existing_paths=()
    for path in "${critical_paths[@]}"; do
        if [ -e "$path" ]; then
            existing_paths+=("$path")
        fi
    done
    
    if [ ${#existing_paths[@]} -gt 0 ]; then
        # Crear backup comprimido
        if tar -czf "$backup_file" "${existing_paths[@]}" 2>/dev/null; then
            create_checksum "$backup_file"
            
            local size=$(du -h "$backup_file" | cut -f1)
            local count=${#existing_paths[@]}
            log_success "Backup de archivos completado: $count elementos ($size)"
            return 0
        else
            log_error "Error en backup de archivos de aplicación"
            return 1
        fi
    else
        log_warning "No se encontraron archivos críticos para respaldar"
        return 1
    fi
}

backup_configuration() {
    log_info "⚙️ Iniciando backup de configuración..."
    
    local backup_file="$BACKUP_DIR/config/configuration_${TIMESTAMP}.tar.gz"
    
    # Archivos de configuración
    local config_files=(
        ".env*"
        "docker-compose*.yml"
        "package*.json"
        "jest.config.js"
        "playwright.config.js"
        ".eslintrc.js"
        ".prettierrc.json"
        "PROJECT_CONFIG.json"
        "nginx.conf"
        "k8s/"
        "helm/"
        "config/"
    )
    
    # Crear lista de archivos existentes
    local existing_configs=()
    for config in "${config_files[@]}"; do
        if ls $config >/dev/null 2>&1; then
            existing_configs+=($config)
        fi
    done
    
    if [ ${#existing_configs[@]} -gt 0 ]; then
        # Crear backup comprimido
        if tar -czf "$backup_file" "${existing_configs[@]}" 2>/dev/null; then
            create_checksum "$backup_file"
            
            local size=$(du -h "$backup_file" | cut -f1)
            local count=${#existing_configs[@]}
            log_success "Backup de configuración completado: $count elementos ($size)"
            return 0
        else
            log_error "Error en backup de configuración"
            return 1
        fi
    else
        log_warning "No se encontraron archivos de configuración para respaldar"
        return 1
    fi
}

backup_logs() {
    log_info "📋 Iniciando backup de logs..."
    
    local backup_file="$BACKUP_DIR/logs/logs_${TIMESTAMP}.tar.gz"
    local log_dirs=("logs/" "validation-reports/" "test-results/")
    
    # Crear lista de directorios existentes
    local existing_logs=()
    for log_dir in "${log_dirs[@]}"; do
        if [ -d "$log_dir" ] && [ "$(ls -A "$log_dir" 2>/dev/null)" ]; then
            existing_logs+=("$log_dir")
        fi
    done
    
    if [ ${#existing_logs[@]} -gt 0 ]; then
        # Crear backup comprimido (excluyendo archivos muy recientes)
        if tar -czf "$backup_file" --exclude="*.tmp" --exclude="*$(date +%Y%m%d)*" "${existing_logs[@]}" 2>/dev/null; then
            create_checksum "$backup_file"
            
            local size=$(du -h "$backup_file" | cut -f1)
            log_success "Backup de logs completado ($size)"
            return 0
        else
            log_error "Error en backup de logs"
            return 1
        fi
    else
        log_warning "No se encontraron logs para respaldar"
        return 1
    fi
}

# =============================================================================
# FUNCIONES DE MANTENIMIENTO
# =============================================================================

cleanup_old_backups() {
    log_info "🧹 Limpiando backups antiguos (más de $RETENTION_DAYS días)..."
    
    local deleted_count=0
    local backup_types=("database" "files" "config" "logs")
    
    for backup_type in "${backup_types[@]}"; do
        local backup_path="$BACKUP_DIR/$backup_type"
        if [ -d "$backup_path" ]; then
            # Eliminar archivos más antiguos que RETENTION_DAYS
            local old_files=$(find "$backup_path" -type f -mtime "+$RETENTION_DAYS" 2>/dev/null)
            if [ ! -z "$old_files" ]; then
                echo "$old_files" | while read -r file; do
                    rm -f "$file" "$file.sha256" 2>/dev/null
                    deleted_count=$((deleted_count + 1))
                    log_info "Eliminado backup antiguo: $(basename "$file")"
                done
            fi
        fi
    done
    
    log_success "Limpieza completada: $deleted_count archivos eliminados"
}

limit_backup_count() {
    log_info "📊 Limitando número de backups (máximo $MAX_BACKUPS por tipo)..."
    
    local backup_types=("database" "files" "config" "logs")
    
    for backup_type in "${backup_types[@]}"; do
        local backup_path="$BACKUP_DIR/$backup_type"
        if [ -d "$backup_path" ]; then
            local file_count=$(find "$backup_path" -type f -name "*.gz" | wc -l)
            
            if [ "$file_count" -gt "$MAX_BACKUPS" ]; then
                local excess=$((file_count - MAX_BACKUPS))
                log_warning "$backup_type tiene $file_count backups, eliminando los $excess más antiguos"
                
                # Eliminar los archivos más antiguos
                find "$backup_path" -type f -name "*.gz" -printf '%T@ %p\n' | \
                sort -n | \
                head -n "$excess" | \
                cut -d' ' -f2- | \
                while read -r file; do
                    rm -f "$file" "$file.sha256" 2>/dev/null
                    log_info "Eliminado por límite: $(basename "$file")"
                done
            fi
        fi
    done
}

generate_backup_report() {
    log_info "📊 Generando reporte de backup..."
    
    local report_file="$BACKUP_DIR/backup_report_${TIMESTAMP}.json"
    local total_size=$(du -sh "$BACKUP_DIR" | cut -f1)
    local backup_count=$(find "$BACKUP_DIR" -type f -name "*.gz" | wc -l)
    
    # Crear reporte JSON
    cat > "$report_file" << EOF
{
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "backup_session": "$TIMESTAMP",
  "summary": {
    "total_backups": $backup_count,
    "total_size": "$total_size",
    "retention_days": $RETENTION_DAYS,
    "max_backups": $MAX_BACKUPS
  },
  "components": {
    "postgresql": {
      "enabled": true,
      "success": $(ls "$BACKUP_DIR/database/postgres_${TIMESTAMP}.sql.gz" >/dev/null 2>&1 && echo "true" || echo "false")
    },
    "mongodb": {
      "enabled": true,
      "success": $(ls "$BACKUP_DIR/database/mongodb_${TIMESTAMP}.tar.gz" >/dev/null 2>&1 && echo "true" || echo "false")
    },
    "redis": {
      "enabled": true,
      "success": $(ls "$BACKUP_DIR/database/redis_${TIMESTAMP}.rdb.gz" >/dev/null 2>&1 && echo "true" || echo "false")
    },
    "application_files": {
      "enabled": true,
      "success": $(ls "$BACKUP_DIR/files/application_${TIMESTAMP}.tar.gz" >/dev/null 2>&1 && echo "true" || echo "false")
    },
    "configuration": {
      "enabled": true,
      "success": $(ls "$BACKUP_DIR/config/configuration_${TIMESTAMP}.tar.gz" >/dev/null 2>&1 && echo "true" || echo "false")
    },
    "logs": {
      "enabled": true,
      "success": $(ls "$BACKUP_DIR/logs/logs_${TIMESTAMP}.tar.gz" >/dev/null 2>&1 && echo "true" || echo "false")
    }
  },
  "storage": {
    "backup_directory": "$BACKUP_DIR",
    "log_file": "$BACKUP_LOG"
  }
}
EOF
    
    log_success "Reporte de backup generado: $(basename "$report_file")"
}

# =============================================================================
# FUNCIÓN PRINCIPAL
# =============================================================================

main() {
    print_header "🛡️ SISTEMA DE BACKUPS AUTOMÁTICOS"
    
    log_info "Iniciando proceso de backup automático para Flores Victoria v3.0"
    
    # Verificar espacio disponible (requisito mínimo: 2GB)
    if ! check_disk_space 2; then
        log_error "Backup cancelado por falta de espacio"
        exit 1
    fi
    
    # Array para tracking de resultados
    local results=()
    
    # Realizar backups
    print_header "💾 EJECUTANDO BACKUPS"
    
    backup_postgresql && results+=("postgresql:OK") || results+=("postgresql:FAIL")
    backup_mongodb && results+=("mongodb:OK") || results+=("mongodb:FAIL")
    backup_redis && results+=("redis:OK") || results+=("redis:FAIL")
    backup_application_files && results+=("files:OK") || results+=("files:FAIL")
    backup_configuration && results+=("config:OK") || results+=("config:FAIL")
    backup_logs && results+=("logs:OK") || results+=("logs:FAIL")
    
    # Mantenimiento
    print_header "🧹 MANTENIMIENTO DE BACKUPS"
    cleanup_old_backups
    limit_backup_count
    
    # Generar reporte
    print_header "📊 GENERANDO REPORTE"
    generate_backup_report
    
    # Resumen final
    print_header "📋 RESUMEN DE BACKUP"
    
    local total_backups=${#results[@]}
    local successful_backups=$(printf '%s\n' "${results[@]}" | grep -c ":OK" || true)
    local failed_backups=$(printf '%s\n' "${results[@]}" | grep -c ":FAIL" || true)
    
    log_info "Total de componentes: $total_backups"
    log_success "Backups exitosos: $successful_backups"
    log_error "Backups fallidos: $failed_backups"
    
    # Mostrar tamaño total
    local total_size=$(du -sh "$BACKUP_DIR" | cut -f1)
    log_info "Tamaño total de backups: $total_size"
    
    # Estado final
    if [ "$failed_backups" -eq 0 ]; then
        log_success "🎉 BACKUP COMPLETADO EXITOSAMENTE"
        return 0
    elif [ "$failed_backups" -le 2 ]; then
        log_warning "⚠️ BACKUP COMPLETADO CON ADVERTENCIAS"
        return 1
    else
        log_error "❌ BACKUP COMPLETADO CON ERRORES CRÍTICOS"
        return 2
    fi
}

# Ejecutar si es llamado directamente
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi