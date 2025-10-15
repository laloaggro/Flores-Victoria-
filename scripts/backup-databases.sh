#!/bin/bash

# Script para realizar backup de las bases de datos con opción de backup incremental

# Directorio de backup
BACKUP_DIR="/backups"
INCREMENTAL_DIR="/backups/incremental"

# Crear directorios si no existen
mkdir -p $BACKUP_DIR
mkdir -p $INCREMENTAL_DIR

# Fecha y hora actual
DATE=$(date +%Y%m%d_%H%M%S)

# Colores para salida
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Iniciando backup de bases de datos - $(date)${NC}"

# Backup de MongoDB
echo -e "${YELLOW}Realizando backup de MongoDB...${NC}"
if command -v mongodump &> /dev/null; then
  # Backup completo
  mongodump --host localhost --port 27017 --out $BACKUP_DIR/mongodb_full_$DATE
  
  # Backup incremental (simulado - en un entorno real usaría herramientas específicas)
  # Aquí simplemente copiamos los datos actuales como backup incremental
  mongodump --host localhost --port 27017 --out $INCREMENTAL_DIR/mongodb_inc_$DATE
  
  echo -e "${GREEN}✓ Backup de MongoDB completado${NC}"
else
  echo -e "${RED}✗ MongoDB no encontrado${NC}"
fi

# Backup de PostgreSQL
echo -e "${YELLOW}Realizando backup de PostgreSQL...${NC}"
if command -v pg_dump &> /dev/null; then
  # Backup completo
  pg_dump -h localhost -p 5432 -U postgres flores_victoria > $BACKUP_DIR/postgres_full_$DATE.sql
  
  # Backup incremental (simulado)
  # En un entorno real, se usaría pg_dump con opciones específicas o WAL archiving
  pg_dump -h localhost -p 5432 -U postgres flores_victoria > $INCREMENTAL_DIR/postgres_inc_$DATE.sql
  
  echo -e "${GREEN}✓ Backup de PostgreSQL completado${NC}"
else
  echo -e "${RED}✗ PostgreSQL no encontrado${NC}"
fi

# Comprimir backups
echo -e "${YELLOW}Comprimiendo backups...${NC}"
gzip -f $BACKUP_DIR/mongodb_full_$DATE/*/*.bson 2>/dev/null || true
gzip -f $INCREMENTAL_DIR/mongodb_inc_$DATE/*/*.bson 2>/dev/null || true

echo -e "${GREEN}✓ Compresión de backups completada${NC}"

# Crear archivo de checksum
echo -e "${YELLOW}Generando checksums...${NC}"
cd $BACKUP_DIR
find . -type f -name "*.gz" -o -name "*.sql" | xargs md5sum > checksums_$DATE.txt
cd $INCREMENTAL_DIR
find . -type f -name "*.gz" -o -name "*.sql" | xargs md5sum > checksums_$DATE.txt

echo -e "${GREEN}✓ Checksums generados${NC}"

# Registrar backup en el sistema de auditoría (si está disponible)
if curl -s http://localhost:3005/health | grep -q '"status":"OK"'; then
  curl -X POST http://localhost:3005/audit \
    -H "Content-Type: application/json" \
    -d '{
      "service": "backup-system",
      "action": "BACKUP_COMPLETED",
      "resourceType": "DatabaseBackup",
      "details": {
        "backupType": "full_and_incremental",
        "timestamp": "'$(date -I)'",
        "backupDir": "'$BACKUP_DIR'",
        "incrementalDir": "'$INCREMENTAL_DIR'"
      }
    }' > /dev/null 2>&1
  echo -e "${GREEN}✓ Evento de backup registrado en auditoría${NC}"
fi

echo -e "${GREEN}Proceso de backup completado - $(date)${NC}"