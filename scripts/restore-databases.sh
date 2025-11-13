#!/bin/bash

# Script para restaurar bases de datos desde backups
# Uso: ./restore-databases.sh [backup_timestamp] [--dry-run]

set -e

# Colores para salida
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuración
BACKUP_DIR="/backups"
RESTORE_LOG="/var/log/restore-databases.log"
DRY_RUN=false

# Función para logging
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$RESTORE_LOG"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1" | tee -a "$RESTORE_LOG"
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1" | tee -a "$RESTORE_LOG"
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO:${NC} $1" | tee -a "$RESTORE_LOG"
}

# Función para mostrar uso
show_usage() {
    cat << EOF
${GREEN}Uso:${NC}
    $0 [backup_timestamp] [opciones]

${YELLOW}Opciones:${NC}
    --dry-run           Simular restauración sin aplicar cambios
    --list              Listar backups disponibles
    --latest            Restaurar el backup más reciente
    --help              Mostrar esta ayuda

${BLUE}Ejemplos:${NC}
    $0 --list                           # Listar backups disponibles
    $0 --latest                         # Restaurar el más reciente
    $0 20251111_120000                  # Restaurar backup específico
    $0 20251111_120000 --dry-run        # Simular sin aplicar

${YELLOW}Nota:${NC} Este script requiere permisos de superusuario y que los servicios estén corriendo.
EOF
}

# Función para listar backups disponibles
list_backups() {
    echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}   Backups Disponibles${NC}"
    echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"
    
    if [ ! -d "$BACKUP_DIR" ]; then
        error "Directorio de backups no existe: $BACKUP_DIR"
        exit 1
    fi
    
    echo -e "\n${BLUE}PostgreSQL Backups:${NC}"
    find "$BACKUP_DIR" -name "postgres_*.sql" -type f | sort -r | head -10 | while read file; do
        size=$(du -h "$file" | cut -f1)
        echo "  - $(basename "$file") [$size]"
    done
    
    echo -e "\n${BLUE}Redis Backups:${NC}"
    find "$BACKUP_DIR" -name "redis_*.rdb" -type f | sort -r | head -10 | while read file; do
        size=$(du -h "$file" | cut -f1)
        echo "  - $(basename "$file") [$size]"
    done
    
    echo ""
}

# Función para obtener el backup más reciente
get_latest_backup() {
    local latest_postgres=$(find "$BACKUP_DIR" -name "postgres_*.sql" -type f | sort -r | head -1)
    if [ -z "$latest_postgres" ]; then
        error "No se encontraron backups de PostgreSQL"
        exit 1
    fi
    
    # Extraer timestamp del nombre del archivo
    basename "$latest_postgres" | sed 's/postgres_\(.*\)\.sql/\1/'
}

# Función para verificar que existe el backup
verify_backup_exists() {
    local timestamp=$1
    local postgres_backup="$BACKUP_DIR/postgres_${timestamp}.sql"
    local redis_backup="$BACKUP_DIR/redis_${timestamp}.rdb"
    
    if [ ! -f "$postgres_backup" ]; then
        error "No se encontró backup de PostgreSQL: $postgres_backup"
        return 1
    fi
    
    info "✓ Backup de PostgreSQL encontrado: $postgres_backup"
    
    if [ ! -f "$redis_backup" ]; then
        warning "No se encontró backup de Redis: $redis_backup"
        info "Se continuará solo con PostgreSQL"
    else
        info "✓ Backup de Redis encontrado: $redis_backup"
    fi
    
    return 0
}

# Función para confirmar acción
confirm_restore() {
    local timestamp=$1
    
    echo -e "\n${RED}⚠️  ADVERTENCIA ⚠️${NC}"
    echo -e "${YELLOW}Está a punto de restaurar las bases de datos desde el backup:${NC}"
    echo -e "  Timestamp: ${BLUE}$timestamp${NC}"
    echo -e "\n${RED}Esto SOBRESCRIBIRÁ todos los datos actuales en:${NC}"
    echo -e "  - PostgreSQL (todas las bases de datos)"
    echo -e "  - Redis (todos los datos en caché)"
    echo -e "\n${YELLOW}¿Está seguro de continuar?${NC} [y/N]: "
    
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        echo -e "${GREEN}Operación cancelada por el usuario.${NC}"
        exit 0
    fi
}

# Función para verificar servicios
check_services() {
    info "Verificando servicios de bases de datos..."
    
    # Verificar PostgreSQL
    if ! docker ps | grep -q "postgres"; then
        error "PostgreSQL no está corriendo"
        error "Ejecute: docker-compose up -d postgres"
        exit 1
    fi
    info "✓ PostgreSQL está corriendo"
    
    # Verificar Redis (opcional)
    if docker ps | grep -q "redis"; then
        info "✓ Redis está corriendo"
    else
        warning "Redis no está corriendo (opcional)"
    fi
}

# Función para crear backup pre-restore
create_pre_restore_backup() {
    info "Creando backup de seguridad antes de restaurar..."
    
    local pre_restore_timestamp=$(date +%Y%m%d_%H%M%S)_pre_restore
    
    # Backup de PostgreSQL
    docker exec flores-victoria-postgres pg_dumpall -U flores_user > "$BACKUP_DIR/postgres_${pre_restore_timestamp}.sql"
    if [ $? -eq 0 ]; then
        info "✓ Backup pre-restore de PostgreSQL creado"
    else
        error "Falló el backup pre-restore de PostgreSQL"
        exit 1
    fi
    
    # Backup de Redis
    if docker ps | grep -q "redis"; then
        docker exec flores-victoria-redis redis-cli SAVE
        docker cp flores-victoria-redis:/data/dump.rdb "$BACKUP_DIR/redis_${pre_restore_timestamp}.rdb"
        info "✓ Backup pre-restore de Redis creado"
    fi
    
    info "✓ Backups pre-restore guardados con timestamp: $pre_restore_timestamp"
}

# Función para restaurar PostgreSQL
restore_postgresql() {
    local timestamp=$1
    local postgres_backup="$BACKUP_DIR/postgres_${timestamp}.sql"
    
    info "Iniciando restauración de PostgreSQL..."
    
    if [ "$DRY_RUN" = true ]; then
        info "[DRY-RUN] Se restauraría: $postgres_backup"
        info "[DRY-RUN] Comando: docker exec -i postgres psql -U flores_user < $postgres_backup"
        return 0
    fi
    
    # Restaurar backup
    cat "$postgres_backup" | docker exec -i postgres psql -U flores_user
    
    if [ $? -eq 0 ]; then
        log "✓ PostgreSQL restaurado exitosamente"
    else
        error "Falló la restauración de PostgreSQL"
        error "Revisar los logs para más detalles"
        exit 1
    fi
}

# Función para restaurar Redis
restore_redis() {
    local timestamp=$1
    local redis_backup="$BACKUP_DIR/redis_${timestamp}.rdb"
    
    if [ ! -f "$redis_backup" ]; then
        warning "Saltando restauración de Redis (backup no encontrado)"
        return 0
    fi
    
    info "Iniciando restauración de Redis..."
    
    if [ "$DRY_RUN" = true ]; then
        info "[DRY-RUN] Se restauraría: $redis_backup"
        info "[DRY-RUN] Pasos:"
        info "[DRY-RUN]   1. Detener Redis"
        info "[DRY-RUN]   2. Copiar dump.rdb"
        info "[DRY-RUN]   3. Reiniciar Redis"
        return 0
    fi
    
    # Detener Redis temporalmente
    info "Deteniendo Redis..."
    docker stop flores-victoria-redis
    
    # Copiar backup
    docker cp "$redis_backup" redis:/data/dump.rdb
    
    # Reiniciar Redis
    info "Reiniciando Redis..."
    docker start flores-victoria-redis
    
    # Esperar a que Redis esté listo
    sleep 3
    
    if docker exec flores-victoria-redis redis-cli PING | grep -q "PONG"; then
        log "✓ Redis restaurado exitosamente"
    else
        error "Redis no responde después de la restauración"
        exit 1
    fi
}

# Función para verificar integridad post-restore
verify_restore() {
    info "Verificando integridad de la restauración..."
    
    # Verificar PostgreSQL
    local db_count=$(docker exec flores-victoria-postgres psql -U flores_user -t -c "SELECT count(*) FROM pg_database WHERE datistemplate = false;")
    info "Bases de datos en PostgreSQL: $db_count"
    
    # Verificar Redis
    if docker ps | grep -q "redis"; then
        local redis_keys=$(docker exec flores-victoria-redis redis-cli DBSIZE | grep -oE '[0-9]+')
        info "Claves en Redis: $redis_keys"
    fi
    
    log "✓ Verificación completada"
}

# Función para restaurar servicios
restart_services() {
    info "Reiniciando servicios de aplicación..."
    
    if [ "$DRY_RUN" = true ]; then
        info "[DRY-RUN] Se reiniciarían los servicios de la aplicación"
        return 0
    fi
    
    # Reiniciar servicios (excepto bases de datos)
    docker-compose restart api-gateway auth-service product-service order-service cart-service user-service
    
    log "✓ Servicios reiniciados"
}

# Función principal de restore
perform_restore() {
    local timestamp=$1
    
    log "═══════════════════════════════════════════════════"
    log "   Iniciando Restauración de Bases de Datos"
    log "   Timestamp: $timestamp"
    if [ "$DRY_RUN" = true ]; then
        log "   Modo: DRY-RUN (simulación)"
    fi
    log "═══════════════════════════════════════════════════"
    
    # 1. Verificar que existe el backup
    verify_backup_exists "$timestamp" || exit 1
    
    # 2. Verificar servicios
    check_services
    
    # 3. Confirmar acción (solo si no es dry-run)
    if [ "$DRY_RUN" = false ]; then
        confirm_restore "$timestamp"
        
        # 4. Crear backup pre-restore
        create_pre_restore_backup
    fi
    
    # 5. Restaurar PostgreSQL
    restore_postgresql "$timestamp"
    
    # 6. Restaurar Redis
    restore_redis "$timestamp"
    
    # 7. Verificar integridad
    verify_restore
    
    # 8. Reiniciar servicios
    restart_services
    
    log "═══════════════════════════════════════════════════"
    log "   ✓ Restauración Completada Exitosamente"
    log "═══════════════════════════════════════════════════"
    
    if [ "$DRY_RUN" = false ]; then
        info "Se creó un backup pre-restore por seguridad"
        info "Los logs se guardaron en: $RESTORE_LOG"
    fi
}

# ========================================
# MAIN
# ========================================

# Parsear argumentos
TIMESTAMP=""

while [[ $# -gt 0 ]]; do
    case $1 in
        --help)
            show_usage
            exit 0
            ;;
        --list)
            list_backups
            exit 0
            ;;
        --latest)
            TIMESTAMP=$(get_latest_backup)
            info "Usando el backup más reciente: $TIMESTAMP"
            shift
            ;;
        --dry-run)
            DRY_RUN=true
            info "Modo DRY-RUN activado (no se aplicarán cambios)"
            shift
            ;;
        *)
            if [ -z "$TIMESTAMP" ]; then
                TIMESTAMP=$1
            fi
            shift
            ;;
    esac
done

# Validar que se proporcionó un timestamp
if [ -z "$TIMESTAMP" ]; then
    error "Debe especificar un timestamp de backup o usar --latest"
    echo ""
    show_usage
    exit 1
fi

# Ejecutar restauración
perform_restore "$TIMESTAMP"

exit 0
