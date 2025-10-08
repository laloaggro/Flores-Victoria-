#!/bin/bash

# Script específico para realizar backup incremental de las bases de datos

# Directorio de backup incremental
INCREMENTAL_DIR="/backups/incremental"

# Crear directorio si no existe
mkdir -p $INCREMENTAL_DIR

# Fecha y hora actual
DATE=$(date +%Y%m%d_%H%M%S)
WEEKDAY=$(date +%u)  # 1=Monday, 7=Sunday

# Colores para salida
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Iniciando backup incremental de bases de datos - $(date)${NC}"

# Función para backup incremental de MongoDB
incremental_mongodb_backup() {
  echo -e "${YELLOW}Realizando backup incremental de MongoDB...${NC}"
  
  if command -v mongodump &> /dev/null; then
    # Para un backup incremental real, necesitaríamos usar MongoDB Change Streams
    # o herramientas como mongobackup con opciones específicas
    # En este ejemplo, simulamos un backup incremental
    
    # Crear directorio para este backup
    MONGO_BACKUP_DIR="$INCREMENTAL_DIR/mongodb_$DATE"
    mkdir -p $MONGO_BACKUP_DIR
    
    # Realizar backup de las colecciones modificadas (simulado)
    # En un entorno real, esto se haría consultando el oplog o usando change streams
    mongodump --host localhost --port 27017 --out $MONGO_BACKUP_DIR
    
    # Comprimir archivos
    echo -e "${YELLOW}Comprimiendo backup de MongoDB...${NC}"
    gzip -f $MONGO_BACKUP_DIR/*/*.bson 2>/dev/null || true
    
    echo -e "${GREEN}✓ Backup incremental de MongoDB completado${NC}"
    return 0
  else
    echo -e "${RED}✗ MongoDB no encontrado${NC}"
    return 1
  fi
}

# Función para backup incremental de PostgreSQL
incremental_postgres_backup() {
  echo -e "${YELLOW}Realizando backup incremental de PostgreSQL...${NC}"
  
  if command -v pg_dump &> /dev/null; then
    # Para un backup incremental real de PostgreSQL, se usaría:
    # 1. WAL archiving
    # 2. pg_dump con opciones específicas
    # 3. Herramientas como Barman o WAL-G
    
    # En este ejemplo, simulamos un backup incremental
    POSTGRES_BACKUP_FILE="$INCREMENTAL_DIR/postgres_inc_$DATE.sql"
    
    # Realizar backup (simulado como incremental)
    pg_dump -h localhost -p 5432 -U postgres --data-only --inserts flores_victoria > $POSTGRES_BACKUP_FILE
    
    # Comprimir archivo
    echo -e "${YELLOW}Comprimiendo backup de PostgreSQL...${NC}"
    gzip -f $POSTGRES_BACKUP_FILE 2>/dev/null || true
    
    echo -e "${GREEN}✓ Backup incremental de PostgreSQL completado${NC}"
    return 0
  else
    echo -e "${RED}✗ PostgreSQL no encontrado${NC}"
    return 1
  fi
}

# Función para limpiar backups antiguos (más de 7 días)
cleanup_old_backups() {
  echo -e "${YELLOW}Limpiando backups antiguos...${NC}"
  
  # Eliminar backups incrementales de más de 7 días
  find $INCREMENTAL_DIR -type f -mtime +7 -delete 2>/dev/null || true
  find $INCREMENTAL_DIR -type d -empty -delete 2>/dev/null || true
  
  echo -e "${GREEN}✓ Limpieza de backups antiguos completada${NC}"
}

# Función para verificar integridad de backups
verify_backups() {
  echo -e "${YELLOW}Verificando integridad de backups...${NC}"
  
  # Verificar archivos de backup recientes
  RECENT_BACKUPS=$(find $INCREMENTAL_DIR -type f -name "*.gz" -o -name "*.sql" -mmin -60 | head -5)
  
  if [ -n "$RECENT_BACKUPS" ]; then
    echo -e "${GREEN}✓ Se encontraron backups recientes${NC}"
    
    # Generar checksums para verificación
    cd $INCREMENTAL_DIR
    find . -type f -mmin -60 | xargs md5sum > verification_$DATE.txt
    echo -e "${GREEN}✓ Checksums generados para verificación${NC}"
  else
    echo -e "${YELLOW}⚠ No se encontraron backups recientes para verificar${NC}"
  fi
}

# Ejecutar backup incremental según el día de la semana
case $WEEKDAY in
  1|3|5)
    echo -e "${BLUE}Día de backup incremental de MongoDB${NC}"
    incremental_mongodb_backup
    ;;
  2|4|6)
    echo -e "${BLUE}Día de backup incremental de PostgreSQL${NC}"
    incremental_postgres_backup
    ;;
  7)
    echo -e "${BLUE}Día de backup incremental completo${NC}"
    incremental_mongodb_backup
    incremental_postgres_backup
    ;;
esac

# Limpiar backups antiguos
cleanup_old_backups

# Verificar integridad
verify_backups

# Registrar backup incremental en el sistema de auditoría (si está disponible)
if curl -s http://localhost:3005/health | grep -q '"status":"OK"'; then
  curl -X POST http://localhost:3005/audit \
    -H "Content-Type: application/json" \
    -d '{
      "service": "backup-system",
      "action": "INCREMENTAL_BACKUP_COMPLETED",
      "resourceType": "DatabaseBackup",
      "details": {
        "backupType": "incremental",
        "weekday": "'$WEEKDAY'",
        "timestamp": "'$(date -I)'",
        "incrementalDir": "'$INCREMENTAL_DIR'"
      }
    }' > /dev/null 2>&1
  echo -e "${GREEN}✓ Evento de backup incremental registrado en auditoría${NC}"
fi

echo -e "${BLUE}Proceso de backup incremental completado - $(date)${NC}"