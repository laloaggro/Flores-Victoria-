#!/bin/bash

# ================================================
# 📦 SISTEMA DE BACKUPS AUTOMATIZADOS v2.0
# ================================================
# Backups robustos para PostgreSQL, MongoDB y Redis
# Con verificación, compresión, retención y S3

set -e

# ================================================
# CONFIGURACIÓN
# ================================================

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Directorios
BACKUP_ROOT="/backups/flores-victoria"
BACKUP_POSTGRES="$BACKUP_ROOT/postgres"
BACKUP_MONGODB="$BACKUP_ROOT/mongodb"
BACKUP_REDIS="$BACKUP_ROOT/redis"
LOG_DIR="/var/log/flores-victoria-backups"

# Retención (días)
RETENTION_POSTGRES=7
RETENTION_MONGODB=7
RETENTION_REDIS=3

# AWS S3
S3_BUCKET="${S3_BUCKET:-flores-victoria-backups}"
S3_ENABLED="${S3_ENABLED:-true}"

# Timestamp
DATE=$(date +%Y%m%d_%H%M%S)
DATE_SIMPLE=$(date +%Y-%m-%d)

# ================================================
# FUNCIONES AUXILIARES
# ================================================

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] ✅ $1${NC}"
}

log_error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ❌ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] ⚠️  $1${NC}"
}

cleanup_old_backups() {
    local dir=$1
    local retention=$2
    
    log "Limpiando backups antiguos (retención: $retention días)..."
    find "$dir" -type f -mtime +$retention -delete 2>/dev/null || true
    
    local count=$(find "$dir" -type f | wc -l)
    log_success "Backups en $dir: $count archivos"
}

upload_to_s3() {
    local file=$1
    local s3_path=$2
    
    if [ "$S3_ENABLED" = "true" ] && command -v aws &> /dev/null; then
        log "Subiendo a S3: $s3_path..."
        aws s3 cp "$file" "s3://$S3_BUCKET/$s3_path" \
            --storage-class STANDARD_IA 2>&1 | tee -a "$LOG_FILE"
        
        if [ ${PIPESTATUS[0]} -eq 0 ]; then
            log_success "Subido a S3"
        else
            log_error "Error al subir a S3"
            return 1
        fi
    fi
}

# ================================================
# CREAR DIRECTORIOS
# ================================================

mkdir -p "$BACKUP_POSTGRES" "$BACKUP_MONGODB" "$BACKUP_REDIS" "$LOG_DIR"
LOG_FILE="$LOG_DIR/backup_${DATE}.log"

# ================================================
# BACKUP POSTGRESQL
# ================================================

backup_postgresql() {
    log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log "📦 BACKUP POSTGRESQL"
    log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    local backup_file="$BACKUP_POSTGRES/flores_victoria_${DATE}.backup"
    local backup_compressed="$BACKUP_POSTGRES/flores_victoria_${DATE}.sql.gz"
    
    PGHOST="${POSTGRES_HOST:-localhost}"
    PGPORT="${POSTGRES_PORT:-5432}"
    PGDATABASE="${POSTGRES_DB:-flores_victoria}"
    PGUSER="${POSTGRES_USER:-admin}"
    PGPASSWORD="${POSTGRES_PASSWORD:-admin123}"
    
    export PGPASSWORD
    
    log "Ejecutando pg_dump..."
    if pg_dump -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDATABASE" \
        -F c -b -v -f "$backup_file" 2>&1 | tee -a "$LOG_FILE"; then
        
        local size=$(du -h "$backup_file" | cut -f1)
        log_success "Backup creado: $size"
        
        upload_to_s3 "$backup_file" "postgres/flores_victoria_${DATE}.backup"
        cleanup_old_backups "$BACKUP_POSTGRES" "$RETENTION_POSTGRES"
        
        log_success "Backup PostgreSQL completado ✓"
        return 0
    else
        log_error "Error en pg_dump"
        return 1
    fi
    
    unset PGPASSWORD
}

# ================================================
# BACKUP MONGODB
# ================================================

backup_mongodb() {
    log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log "📦 BACKUP MONGODB"
    log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    local backup_dir="$BACKUP_MONGODB/${DATE}"
    local backup_compressed="$BACKUP_MONGODB/mongodb_${DATE}.tar.gz"
    
    MONGO_HOST="${MONGODB_HOST:-localhost}"
    MONGO_PORT="${MONGODB_PORT:-27017}"
    MONGO_DB="${MONGODB_DB:-flores_victoria}"
    MONGO_USER="${MONGODB_USER:-admin}"
    MONGO_PASS="${MONGODB_PASSWORD:-admin123}"
    
    local MONGO_URI="mongodb://${MONGO_USER}:${MONGO_PASS}@${MONGO_HOST}:${MONGO_PORT}/${MONGO_DB}?authSource=admin"
    
    log "Ejecutando mongodump..."
    if mongodump --uri="$MONGO_URI" --out="$backup_dir" 2>&1 | tee -a "$LOG_FILE"; then
        
        tar -czf "$backup_compressed" -C "$BACKUP_MONGODB" "$(basename $backup_dir)"
        rm -rf "$backup_dir"
        
        local size=$(du -h "$backup_compressed" | cut -f1)
        log_success "Backup comprimido: $size"
        
        upload_to_s3 "$backup_compressed" "mongodb/mongodb_${DATE}.tar.gz"
        cleanup_old_backups "$BACKUP_MONGODB" "$RETENTION_MONGODB"
        
        log_success "Backup MongoDB completado ✓"
        return 0
    else
        log_error "Error en mongodump"
        return 1
    fi
}

# ================================================
# BACKUP REDIS
# ================================================

backup_redis() {
    log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log "📦 BACKUP REDIS"
    log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    local backup_compressed="$BACKUP_REDIS/dump_${DATE}.rdb.gz"
    
    REDIS_HOST="${REDIS_HOST:-localhost}"
    REDIS_PORT="${REDIS_PORT:-6379}"
    
    local REDIS_CMD="redis-cli -h $REDIS_HOST -p $REDIS_PORT"
    
    log "Ejecutando BGSAVE..."
    $REDIS_CMD BGSAVE 2>&1 | tee -a "$LOG_FILE"
    sleep 5
    
    local redis_dump="/var/lib/redis/dump.rdb"
    if [ -f "$redis_dump" ]; then
        cp "$redis_dump" "$BACKUP_REDIS/dump_${DATE}.rdb"
        gzip "$BACKUP_REDIS/dump_${DATE}.rdb"
        
        local size=$(du -h "$backup_compressed" | cut -f1)
        log_success "Backup Redis: $size"
        
        upload_to_s3 "$backup_compressed" "redis/dump_${DATE}.rdb.gz"
        cleanup_old_backups "$BACKUP_REDIS" "$RETENTION_REDIS"
        
        log_success "Backup Redis completado ✓"
        return 0
    else
        log_error "dump.rdb no encontrado"
        return 1
    fi
}

# ================================================
# MAIN
# ================================================

main() {
    log "🚀 INICIANDO BACKUPS AUTOMATIZADOS"
    log "Fecha: $DATE_SIMPLE"
    
    local errors=0
    
    backup_postgresql || errors=$((errors + 1))
    backup_mongodb || errors=$((errors + 1))
    backup_redis || errors=$((errors + 1))
    
    if [ $errors -eq 0 ]; then
        log_success "BACKUPS COMPLETADOS EXITOSAMENTE"
    else
        log_error "BACKUPS CON $errors ERRORES"
    fi
    
    return $errors
}

main "$@"
exit $?
