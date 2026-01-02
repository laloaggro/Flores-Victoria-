#!/bin/bash
# =============================================================================
# Flores Victoria - Automated Backup System
# Supports PostgreSQL, MongoDB, and Valkey/Redis
# =============================================================================

set -e

# Configuration
BACKUP_DIR="${BACKUP_DIR:-/backups}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
DATE=$(date +%Y%m%d_%H%M%S)
LOG_FILE="${BACKUP_DIR}/backup_${DATE}.log"

# Create backup directory
mkdir -p "${BACKUP_DIR}"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "${LOG_FILE}"
}

# =============================================================================
# PostgreSQL Backup
# =============================================================================
backup_postgres() {
    log "Starting PostgreSQL backup..."
    
    local PG_HOST="${DB_HOST:-postgres}"
    local PG_PORT="${DB_PORT:-5432}"
    local PG_USER="${DB_USER:-flores_user}"
    local PG_DB="${DB_NAME:-flores_db}"
    local PG_BACKUP_FILE="${BACKUP_DIR}/postgres_${DATE}.sql.gz"
    
    PGPASSWORD="${DB_PASSWORD}" pg_dump \
        -h "${PG_HOST}" \
        -p "${PG_PORT}" \
        -U "${PG_USER}" \
        -d "${PG_DB}" \
        --format=custom \
        --compress=9 \
        --verbose \
        2>> "${LOG_FILE}" \
        | gzip > "${PG_BACKUP_FILE}"
    
    if [ -f "${PG_BACKUP_FILE}" ]; then
        local SIZE=$(du -h "${PG_BACKUP_FILE}" | cut -f1)
        log "PostgreSQL backup completed: ${PG_BACKUP_FILE} (${SIZE})"
    else
        log "ERROR: PostgreSQL backup failed!"
        return 1
    fi
}

# =============================================================================
# MongoDB Backup
# =============================================================================
backup_mongodb() {
    log "Starting MongoDB backup..."
    
    local MONGO_HOST="${MONGO_HOST:-mongodb}"
    local MONGO_PORT="${MONGO_PORT:-27017}"
    local MONGO_USER="${MONGO_USER:-flores_admin}"
    local MONGO_BACKUP_DIR="${BACKUP_DIR}/mongodb_${DATE}"
    local MONGO_BACKUP_FILE="${BACKUP_DIR}/mongodb_${DATE}.archive.gz"
    
    mongodump \
        --host="${MONGO_HOST}" \
        --port="${MONGO_PORT}" \
        --username="${MONGO_USER}" \
        --password="${MONGO_PASSWORD}" \
        --authenticationDatabase=admin \
        --gzip \
        --archive="${MONGO_BACKUP_FILE}" \
        2>> "${LOG_FILE}"
    
    if [ -f "${MONGO_BACKUP_FILE}" ]; then
        local SIZE=$(du -h "${MONGO_BACKUP_FILE}" | cut -f1)
        log "MongoDB backup completed: ${MONGO_BACKUP_FILE} (${SIZE})"
    else
        log "ERROR: MongoDB backup failed!"
        return 1
    fi
}

# =============================================================================
# Valkey/Redis Backup
# =============================================================================
backup_valkey() {
    log "Starting Valkey/Redis backup..."
    
    local REDIS_HOST="${REDIS_HOST:-valkey}"
    local REDIS_PORT="${REDIS_PORT:-6379}"
    local REDIS_BACKUP_FILE="${BACKUP_DIR}/valkey_${DATE}.rdb"
    
    # Trigger BGSAVE and wait for completion
    redis-cli -h "${REDIS_HOST}" -p "${REDIS_PORT}" BGSAVE
    sleep 5
    
    # Copy RDB file
    if redis-cli -h "${REDIS_HOST}" -p "${REDIS_PORT}" --rdb "${REDIS_BACKUP_FILE}" 2>> "${LOG_FILE}"; then
        gzip "${REDIS_BACKUP_FILE}"
        local SIZE=$(du -h "${REDIS_BACKUP_FILE}.gz" | cut -f1)
        log "Valkey/Redis backup completed: ${REDIS_BACKUP_FILE}.gz (${SIZE})"
    else
        log "WARNING: Valkey/Redis backup might have issues"
    fi
}

# =============================================================================
# Cleanup Old Backups
# =============================================================================
cleanup_old_backups() {
    log "Cleaning up backups older than ${RETENTION_DAYS} days..."
    
    find "${BACKUP_DIR}" -type f -name "*.gz" -mtime +${RETENTION_DAYS} -delete 2>> "${LOG_FILE}"
    find "${BACKUP_DIR}" -type f -name "*.log" -mtime +${RETENTION_DAYS} -delete 2>> "${LOG_FILE}"
    
    log "Cleanup completed"
}

# =============================================================================
# Upload to S3 (optional)
# =============================================================================
upload_to_s3() {
    if [ -n "${S3_BUCKET}" ]; then
        log "Uploading backups to S3..."
        
        aws s3 sync "${BACKUP_DIR}" "s3://${S3_BUCKET}/backups/${DATE}/" \
            --exclude "*.log" \
            2>> "${LOG_FILE}"
        
        log "S3 upload completed"
    fi
}

# =============================================================================
# Send Notification
# =============================================================================
send_notification() {
    local STATUS=$1
    local MESSAGE=$2
    
    if [ -n "${SLACK_WEBHOOK_URL}" ]; then
        curl -X POST "${SLACK_WEBHOOK_URL}" \
            -H "Content-Type: application/json" \
            -d "{\"text\": \"🗄️ Flores Victoria Backup ${STATUS}: ${MESSAGE}\"}" \
            2>> "${LOG_FILE}"
    fi
    
    if [ -n "${NOTIFICATION_EMAIL}" ]; then
        echo "${MESSAGE}" | mail -s "Flores Victoria Backup ${STATUS}" "${NOTIFICATION_EMAIL}"
    fi
}

# =============================================================================
# Main Execution
# =============================================================================
main() {
    log "=========================================="
    log "Starting Flores Victoria Backup Process"
    log "=========================================="
    
    local ERRORS=0
    
    # Run backups
    backup_postgres || ((ERRORS++))
    backup_mongodb || ((ERRORS++))
    backup_valkey || ((ERRORS++))
    
    # Cleanup old backups
    cleanup_old_backups
    
    # Upload to S3 if configured
    upload_to_s3
    
    # Summary
    log "=========================================="
    if [ $ERRORS -eq 0 ]; then
        log "Backup completed successfully!"
        send_notification "SUCCESS" "All backups completed at ${DATE}"
    else
        log "Backup completed with ${ERRORS} errors!"
        send_notification "WARNING" "Backup completed with ${ERRORS} errors at ${DATE}"
    fi
    log "=========================================="
    
    return $ERRORS
}

# Run main function
main "$@"
