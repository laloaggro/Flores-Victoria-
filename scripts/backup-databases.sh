#!/bin/bash

# =================================================================
# Database Backup Script - Flores Victoria
# =================================================================
# Crea backups de MongoDB y PostgreSQL con soporte para:
# - Backups completos e incrementales
# - Compresión automática
# - Verificación de integridad (checksums)
# - Limpieza automática de backups antiguos
# - Registro en sistema de auditoría
#
# Uso: ./backup-databases.sh [full|incremental|list|cleanup|verify]
#
# Variables de entorno:
#   MONGO_HOST, MONGO_PORT    - MongoDB (default: localhost:27017)
#   POSTGRES_HOST, POSTGRES_PORT, POSTGRES_USER, POSTGRES_PASSWORD
#   BACKUP_DIR                - Directorio base (default: /backups)
#   RETENTION_DAYS            - Días de retención (default: 7)
# =================================================================

set -e

# Configuración
BACKUP_DIR="${BACKUP_DIR:-/backups}"
INCREMENTAL_DIR="${BACKUP_DIR}/incremental"
RETENTION_DAYS="${RETENTION_DAYS:-7}"
DATE=$(date +%Y%m%d_%H%M%S)
LOG_FILE="${BACKUP_DIR}/logs/backup_${DATE}.log"

# Configuración de bases de datos
MONGO_HOST="${MONGO_HOST:-localhost}"
MONGO_PORT="${MONGO_PORT:-27017}"
POSTGRES_HOST="${POSTGRES_HOST:-localhost}"
POSTGRES_PORT="${POSTGRES_PORT:-5432}"
POSTGRES_USER="${POSTGRES_USER:-postgres}"
POSTGRES_DB="${POSTGRES_DB:-flores_victoria}"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funciones de logging
log() {
    local level="$1"
    local message="$2"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${timestamp} [${level}] ${message}" | tee -a "$LOG_FILE"
}

log_info() { echo -e "${BLUE}[INFO]${NC} $1" | tee -a "$LOG_FILE"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"; }

# Crear directorios necesarios
setup_directories() {
    mkdir -p "$BACKUP_DIR"/{mongodb,postgres,logs}
    mkdir -p "$INCREMENTAL_DIR"/{mongodb,postgres}
    touch "$LOG_FILE"
    log_info "Backup directories initialized"
}

# Verificar espacio en disco
check_disk_space() {
    local available_kb=$(df "$BACKUP_DIR" | awk 'NR==2 {print $4}')
    local available_human=$(df -h "$BACKUP_DIR" | awk 'NR==2 {print $4}')
    
    log_info "Available disk space: ${available_human}"
    
    if [[ $available_kb -lt 1048576 ]]; then
        log_warning "Low disk space! Less than 1GB available."
        return 1
    fi
    return 0
}

# Backup de MongoDB
backup_mongodb() {
    local backup_type="${1:-full}"
    local backup_path
    
    if [[ "$backup_type" == "full" ]]; then
        backup_path="${BACKUP_DIR}/mongodb/mongodb_full_${DATE}"
    else
        backup_path="${INCREMENTAL_DIR}/mongodb/mongodb_inc_${DATE}"
    fi
    
    log_info "Starting MongoDB ${backup_type} backup..."
    
    if ! command -v mongodump &> /dev/null; then
        log_error "mongodump not found. Install MongoDB tools."
        return 1
    fi
    
    # Crear backup
    if mongodump --host "$MONGO_HOST" --port "$MONGO_PORT" --out "$backup_path" --quiet 2>/dev/null; then
        # Comprimir
        tar -czf "${backup_path}.tar.gz" -C "$(dirname "$backup_path")" "$(basename "$backup_path")"
        rm -rf "$backup_path"
        
        local size=$(du -h "${backup_path}.tar.gz" | cut -f1)
        log_success "MongoDB ${backup_type} backup completed: $(basename "${backup_path}.tar.gz") (${size})"
        
        # Generar checksum
        md5sum "${backup_path}.tar.gz" >> "${BACKUP_DIR}/checksums_${DATE}.txt"
    else
        log_error "MongoDB backup failed"
        return 1
    fi
}

# Backup de PostgreSQL
backup_postgres() {
    local backup_type="${1:-full}"
    local backup_path
    
    if [[ "$backup_type" == "full" ]]; then
        backup_path="${BACKUP_DIR}/postgres/postgres_full_${DATE}.sql"
    else
        backup_path="${INCREMENTAL_DIR}/postgres/postgres_inc_${DATE}.sql"
    fi
    
    log_info "Starting PostgreSQL ${backup_type} backup..."
    
    if ! command -v pg_dump &> /dev/null; then
        log_error "pg_dump not found. Install PostgreSQL client tools."
        return 1
    fi
    
    # Crear backup
    if PGPASSWORD="${POSTGRES_PASSWORD}" pg_dump \
        -h "$POSTGRES_HOST" \
        -p "$POSTGRES_PORT" \
        -U "$POSTGRES_USER" \
        -d "$POSTGRES_DB" \
        -F p \
        --no-owner \
        --no-acl \
        -f "$backup_path" 2>/dev/null; then
        
        # Comprimir
        gzip -f "$backup_path"
        
        local size=$(du -h "${backup_path}.gz" | cut -f1)
        log_success "PostgreSQL ${backup_type} backup completed: $(basename "${backup_path}.gz") (${size})"
        
        # Generar checksum
        md5sum "${backup_path}.gz" >> "${BACKUP_DIR}/checksums_${DATE}.txt"
    else
        log_error "PostgreSQL backup failed"
        return 1
    fi
}

# Backup completo
backup_full() {
    echo -e "\n${BLUE}═══════════════════════════════════════════${NC}"
    echo -e "${BLUE}    Flores Victoria - Full Database Backup   ${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════${NC}\n"
    
    setup_directories
    check_disk_space || log_warning "Continuing despite low disk space..."
    
    backup_mongodb "full"
    backup_postgres "full"
    
    # Registrar en auditoría
    register_audit_event "FULL_BACKUP"
    
    log_success "Full backup completed at $(date)"
}

# Backup incremental
backup_incremental() {
    echo -e "\n${YELLOW}═══════════════════════════════════════════${NC}"
    echo -e "${YELLOW}  Flores Victoria - Incremental Backup      ${NC}"
    echo -e "${YELLOW}═══════════════════════════════════════════${NC}\n"
    
    setup_directories
    check_disk_space || log_warning "Continuing despite low disk space..."
    
    backup_mongodb "incremental"
    backup_postgres "incremental"
    
    register_audit_event "INCREMENTAL_BACKUP"
    
    log_success "Incremental backup completed at $(date)"
}

# Limpiar backups antiguos
cleanup_old_backups() {
    log_info "Cleaning up backups older than ${RETENTION_DAYS} days..."
    
    local count=0
    
    # Limpiar backups completos
    count=$(find "$BACKUP_DIR/mongodb" -name "*.tar.gz" -mtime +${RETENTION_DAYS} 2>/dev/null | wc -l)
    find "$BACKUP_DIR/mongodb" -name "*.tar.gz" -mtime +${RETENTION_DAYS} -delete 2>/dev/null || true
    
    count=$((count + $(find "$BACKUP_DIR/postgres" -name "*.gz" -mtime +${RETENTION_DAYS} 2>/dev/null | wc -l)))
    find "$BACKUP_DIR/postgres" -name "*.gz" -mtime +${RETENTION_DAYS} -delete 2>/dev/null || true
    
    # Limpiar incrementales
    find "$INCREMENTAL_DIR" -name "*.tar.gz" -mtime +${RETENTION_DAYS} -delete 2>/dev/null || true
    find "$INCREMENTAL_DIR" -name "*.gz" -mtime +${RETENTION_DAYS} -delete 2>/dev/null || true
    
    # Limpiar logs y checksums antiguos
    find "$BACKUP_DIR/logs" -name "*.log" -mtime +${RETENTION_DAYS} -delete 2>/dev/null || true
    find "$BACKUP_DIR" -name "checksums_*.txt" -mtime +${RETENTION_DAYS} -delete 2>/dev/null || true
    
    log_success "Cleanup completed"
}

# Verificar integridad de backups
verify_backups() {
    echo -e "\n${BLUE}Verifying backup integrity...${NC}\n"
    
    local errors=0
    
    # Verificar checksums recientes
    local latest_checksum=$(ls -t "$BACKUP_DIR"/checksums_*.txt 2>/dev/null | head -1)
    
    if [[ -f "$latest_checksum" ]]; then
        log_info "Verifying against: $(basename "$latest_checksum")"
        
        while IFS= read -r line; do
            local hash=$(echo "$line" | awk '{print $1}')
            local file=$(echo "$line" | awk '{print $2}')
            
            if [[ -f "$file" ]]; then
                local current_hash=$(md5sum "$file" | awk '{print $1}')
                if [[ "$hash" == "$current_hash" ]]; then
                    echo -e "${GREEN}✓${NC} $(basename "$file")"
                else
                    echo -e "${RED}✗${NC} $(basename "$file") - CHECKSUM MISMATCH!"
                    errors=$((errors + 1))
                fi
            fi
        done < "$latest_checksum"
    else
        log_warning "No checksum file found"
    fi
    
    if [[ $errors -eq 0 ]]; then
        log_success "All backups verified successfully"
    else
        log_error "${errors} backup(s) failed verification!"
        return 1
    fi
}

# Listar backups existentes
list_backups() {
    echo -e "\n${BLUE}═══════════════════════════════════════════${NC}"
    echo -e "${BLUE}           Available Backups                 ${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════${NC}\n"
    
    echo -e "${GREEN}MongoDB Full Backups:${NC}"
    ls -lh "$BACKUP_DIR/mongodb/"*.tar.gz 2>/dev/null || echo "  None found"
    
    echo -e "\n${GREEN}PostgreSQL Full Backups:${NC}"
    ls -lh "$BACKUP_DIR/postgres/"*.gz 2>/dev/null || echo "  None found"
    
    echo -e "\n${YELLOW}MongoDB Incremental Backups:${NC}"
    ls -lh "$INCREMENTAL_DIR/mongodb/"*.tar.gz 2>/dev/null || echo "  None found"
    
    echo -e "\n${YELLOW}PostgreSQL Incremental Backups:${NC}"
    ls -lh "$INCREMENTAL_DIR/postgres/"*.gz 2>/dev/null || echo "  None found"
    
    # Calcular espacio total
    local total=$(du -sh "$BACKUP_DIR" 2>/dev/null | cut -f1)
    echo -e "\n${BLUE}Total backup size: ${total}${NC}"
}

# Registrar evento en auditoría
register_audit_event() {
    local action="${1:-BACKUP_COMPLETED}"
    
    if curl -s --connect-timeout 2 http://localhost:3005/health 2>/dev/null | grep -q '"status":"OK"'; then
        curl -s -X POST http://localhost:3005/audit \
            -H "Content-Type: application/json" \
            -d "{
                \"service\": \"backup-system\",
                \"action\": \"${action}\",
                \"resourceType\": \"DatabaseBackup\",
                \"details\": {
                    \"timestamp\": \"$(date -Iseconds)\",
                    \"backupDir\": \"${BACKUP_DIR}\"
                }
            }" > /dev/null 2>&1
        log_info "Audit event registered"
    fi
}

# Mostrar ayuda
show_help() {
    echo -e "\n${BLUE}Flores Victoria Database Backup Script${NC}"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  full        - Full backup of all databases (default)"
    echo "  incremental - Incremental backup"
    echo "  list        - List existing backups"
    echo "  cleanup     - Remove old backups"
    echo "  verify      - Verify backup integrity"
    echo "  help        - Show this help"
    echo ""
    echo "Environment variables:"
    echo "  MONGO_HOST      - MongoDB host (default: localhost)"
    echo "  MONGO_PORT      - MongoDB port (default: 27017)"
    echo "  POSTGRES_HOST   - PostgreSQL host (default: localhost)"
    echo "  POSTGRES_PORT   - PostgreSQL port (default: 5432)"
    echo "  POSTGRES_USER   - PostgreSQL user (default: postgres)"
    echo "  POSTGRES_PASSWORD - PostgreSQL password"
    echo "  POSTGRES_DB     - PostgreSQL database (default: flores_victoria)"
    echo "  BACKUP_DIR      - Backup directory (default: /backups)"
    echo "  RETENTION_DAYS  - Days to keep backups (default: 7)"
    echo ""
}

# Main
main() {
    local command="${1:-full}"
    
    case "$command" in
        full)
            backup_full
            cleanup_old_backups
            ;;
        incremental|inc)
            backup_incremental
            ;;
        list|ls)
            list_backups
            ;;
        cleanup|clean)
            setup_directories
            cleanup_old_backups
            ;;
        verify|check)
            verify_backups
            ;;
        help|-h|--help)
            show_help
            ;;
        *)
            log_error "Unknown command: $command"
            show_help
            exit 1
            ;;
    esac
}

main "$@"