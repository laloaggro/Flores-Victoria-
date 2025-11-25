#!/bin/bash

# ============================================
# Script de Backup Automático
# Flores Victoria - Producción
# ============================================

set -e

# Variables de configuración
BACKUP_DIR="/opt/flores-victoria/backups"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 BACKUP AUTOMÁTICO - Flores Victoria"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Fecha: $(date)"
echo ""

# Crear directorio de backups si no existe
mkdir -p "$BACKUP_DIR"/{mongodb,postgres,redis,uploads}

# ============================================
# BACKUP POSTGRESQL
# ============================================
echo -e "${YELLOW}[1/4]${NC} Backup PostgreSQL..."
docker compose exec -T postgres pg_dump -U flores_user flores_db | \
    gzip > "$BACKUP_DIR/postgres/flores_db_$DATE.sql.gz"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} PostgreSQL backup completado"
else
    echo -e "${RED}✗${NC} Error en backup PostgreSQL"
    exit 1
fi

# ============================================
# BACKUP MONGODB
# ============================================
echo -e "${YELLOW}[2/4]${NC} Backup MongoDB..."
docker compose exec -T mongodb mongodump \
    --uri="mongodb://root:${MONGO_ROOT_PASSWORD}@localhost:27017/flores_db?authSource=admin" \
    --archive | gzip > "$BACKUP_DIR/mongodb/flores_db_$DATE.archive.gz"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} MongoDB backup completado"
else
    echo -e "${RED}✗${NC} Error en backup MongoDB"
    exit 1
fi

# ============================================
# BACKUP REDIS
# ============================================
echo -e "${YELLOW}[3/4]${NC} Backup Redis..."
docker compose exec -T redis redis-cli -a ${REDIS_PASSWORD} --rdb /data/dump_$DATE.rdb SAVE
docker compose cp redis:/data/dump_$DATE.rdb "$BACKUP_DIR/redis/dump_$DATE.rdb"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Redis backup completado"
else
    echo -e "${RED}✗${NC} Error en backup Redis"
    exit 1
fi

# ============================================
# BACKUP ARCHIVOS SUBIDOS
# ============================================
echo -e "${YELLOW}[4/4]${NC} Backup archivos subidos..."
tar -czf "$BACKUP_DIR/uploads/uploads_$DATE.tar.gz" \
    /opt/flores-victoria/data/uploads/ 2>/dev/null

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Backup de uploads completado"
else
    echo -e "${YELLOW}⚠${NC} Warning: No se encontraron archivos para backup"
fi

# ============================================
# BACKUP CONFIGURACIÓN
# ============================================
echo ""
echo "Backup configuración..."
tar -czf "$BACKUP_DIR/config_$DATE.tar.gz" \
    /opt/flores-victoria/.env.production \
    /opt/flores-victoria/docker-compose.production.yml \
    /opt/flores-victoria/nginx/ 2>/dev/null

# ============================================
# LIMPIAR BACKUPS ANTIGUOS
# ============================================
echo ""
echo "Limpiando backups antiguos (> $RETENTION_DAYS días)..."

find "$BACKUP_DIR" -type f -mtime +$RETENTION_DAYS -exec rm -v {} \;

# ============================================
# RESUMEN
# ============================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ BACKUP COMPLETADO${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Calcular tamaño total
BACKUP_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)
echo "📊 Tamaño total de backups: $BACKUP_SIZE"
echo "📁 Ubicación: $BACKUP_DIR"
echo ""

# Listar backups recientes
echo "📋 Backups más recientes:"
ls -lht "$BACKUP_DIR"/*/* | head -10

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ============================================
# OPCIONAL: SINCRONIZAR CON OBJECT STORAGE
# ============================================
# Descomentar si usas Oracle Object Storage o S3

# echo ""
# echo "Sincronizando con Object Storage..."
# oci os object put --bucket-name flores-victoria-backups \
#     --file "$BACKUP_DIR/postgres/flores_db_$DATE.sql.gz" \
#     --force
# 
# oci os object put --bucket-name flores-victoria-backups \
#     --file "$BACKUP_DIR/mongodb/flores_db_$DATE.archive.gz" \
#     --force

echo ""
echo "✅ Backup finalizado: $(date)"
