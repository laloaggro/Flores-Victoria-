#!/bin/bash
# =============================================================================
# Flores Victoria - Restore from Backup
# =============================================================================

set -e

BACKUP_DIR="${BACKUP_DIR:-/backups}"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# =============================================================================
# PostgreSQL Restore
# =============================================================================
restore_postgres() {
    local BACKUP_FILE=$1
    
    if [ -z "${BACKUP_FILE}" ]; then
        log "Finding latest PostgreSQL backup..."
        BACKUP_FILE=$(ls -t "${BACKUP_DIR}"/postgres_*.sql.gz 2>/dev/null | head -1)
    fi
    
    if [ ! -f "${BACKUP_FILE}" ]; then
        log "ERROR: No PostgreSQL backup found!"
        return 1
    fi
    
    log "Restoring PostgreSQL from: ${BACKUP_FILE}"
    
    local PG_HOST="${DB_HOST:-postgres}"
    local PG_PORT="${DB_PORT:-5432}"
    local PG_USER="${DB_USER:-flores_user}"
    local PG_DB="${DB_NAME:-flores_db}"
    
    # Drop and recreate database
    PGPASSWORD="${DB_PASSWORD}" psql -h "${PG_HOST}" -p "${PG_PORT}" -U "${PG_USER}" -d postgres \
        -c "DROP DATABASE IF EXISTS ${PG_DB};"
    PGPASSWORD="${DB_PASSWORD}" psql -h "${PG_HOST}" -p "${PG_PORT}" -U "${PG_USER}" -d postgres \
        -c "CREATE DATABASE ${PG_DB};"
    
    # Restore from backup
    gunzip -c "${BACKUP_FILE}" | PGPASSWORD="${DB_PASSWORD}" pg_restore \
        -h "${PG_HOST}" \
        -p "${PG_PORT}" \
        -U "${PG_USER}" \
        -d "${PG_DB}" \
        --verbose
    
    log "PostgreSQL restore completed!"
}

# =============================================================================
# MongoDB Restore
# =============================================================================
restore_mongodb() {
    local BACKUP_FILE=$1
    
    if [ -z "${BACKUP_FILE}" ]; then
        log "Finding latest MongoDB backup..."
        BACKUP_FILE=$(ls -t "${BACKUP_DIR}"/mongodb_*.archive.gz 2>/dev/null | head -1)
    fi
    
    if [ ! -f "${BACKUP_FILE}" ]; then
        log "ERROR: No MongoDB backup found!"
        return 1
    fi
    
    log "Restoring MongoDB from: ${BACKUP_FILE}"
    
    local MONGO_HOST="${MONGO_HOST:-mongodb}"
    local MONGO_PORT="${MONGO_PORT:-27017}"
    local MONGO_USER="${MONGO_USER:-flores_admin}"
    
    mongorestore \
        --host="${MONGO_HOST}" \
        --port="${MONGO_PORT}" \
        --username="${MONGO_USER}" \
        --password="${MONGO_PASSWORD}" \
        --authenticationDatabase=admin \
        --gzip \
        --archive="${BACKUP_FILE}" \
        --drop
    
    log "MongoDB restore completed!"
}

# =============================================================================
# Valkey/Redis Restore
# =============================================================================
restore_valkey() {
    local BACKUP_FILE=$1
    
    if [ -z "${BACKUP_FILE}" ]; then
        log "Finding latest Valkey/Redis backup..."
        BACKUP_FILE=$(ls -t "${BACKUP_DIR}"/valkey_*.rdb.gz 2>/dev/null | head -1)
    fi
    
    if [ ! -f "${BACKUP_FILE}" ]; then
        log "ERROR: No Valkey/Redis backup found!"
        return 1
    fi
    
    log "Restoring Valkey/Redis from: ${BACKUP_FILE}"
    
    local REDIS_HOST="${REDIS_HOST:-valkey}"
    local REDIS_PORT="${REDIS_PORT:-6379}"
    
    # Stop Redis, replace RDB, restart
    log "Note: For Valkey/Redis restore, you need to:"
    log "1. Stop the Valkey/Redis server"
    log "2. Copy the RDB file to the data directory"
    log "3. Restart Valkey/Redis"
    
    gunzip -c "${BACKUP_FILE}" > /tmp/restore.rdb
    log "RDB file extracted to /tmp/restore.rdb"
    log "Valkey/Redis restore requires manual intervention"
}

# =============================================================================
# Main
# =============================================================================
usage() {
    echo "Usage: $0 <postgres|mongodb|valkey|all> [backup_file]"
    echo ""
    echo "Commands:"
    echo "  postgres [file]  - Restore PostgreSQL database"
    echo "  mongodb [file]   - Restore MongoDB database"
    echo "  valkey [file]    - Restore Valkey/Redis database"
    echo "  all              - Restore all databases from latest backups"
    exit 1
}

case "$1" in
    postgres)
        restore_postgres "$2"
        ;;
    mongodb)
        restore_mongodb "$2"
        ;;
    valkey)
        restore_valkey "$2"
        ;;
    all)
        restore_postgres
        restore_mongodb
        restore_valkey
        ;;
    *)
        usage
        ;;
esac
