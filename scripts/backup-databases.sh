#!/bin/bash

# Script para realizar backup de las bases de datos del proyecto Flores Victoria

# Directorio para los backups
BACKUP_DIR="./backups"
DATE=$(date +"%Y%m%d_%H%M%S")
MONGO_BACKUP_DIR="$BACKUP_DIR/mongodb"
POSTGRES_BACKUP_DIR="$BACKUP_DIR/postgresql"

# Crear directorios si no existen
mkdir -p "$MONGO_BACKUP_DIR"
mkdir -p "$POSTGRES_BACKUP_DIR"

echo "=== Backup de Bases de Datos para Flores Victoria ==="
echo "Fecha: $(date)"
echo "Directorio de backup: $BACKUP_DIR"
echo ""

# Cargar variables de entorno
if [ -f .env ]; then
  export $(cat .env | xargs)
fi

# Backup de MongoDB
echo "Realizando backup de MongoDB..."
if command -v mongodump &> /dev/null; then
  mongodump --host localhost --port 27018 \
    --username $MONGO_INITDB_ROOT_USERNAME \
    --password $MONGO_INITDB_ROOT_PASSWORD \
    --out "$MONGO_BACKUP_DIR/backup_$DATE"
  
  if [ $? -eq 0 ]; then
    echo "✓ Backup de MongoDB completado exitosamente"
    echo "  Backup guardado en: $MONGO_BACKUP_DIR/backup_$DATE"
  else
    echo "✗ Error al realizar backup de MongoDB"
  fi
else
  echo "✗ mongodump no encontrado. Por favor, instala MongoDB Database Tools"
fi

echo ""

# Backup de PostgreSQL
echo "Realizando backup de PostgreSQL..."
if command -v pg_dump &> /dev/null; then
  pg_dump -h localhost -p 5433 \
    -U $POSTGRES_USER \
    -d $POSTGRES_DB \
    -f "$POSTGRES_BACKUP_DIR/backup_$DATE.sql"
  
  if [ $? -eq 0 ]; then
    echo "✓ Backup de PostgreSQL completado exitosamente"
    echo "  Backup guardado en: $POSTGRES_BACKUP_DIR/backup_$DATE.sql"
  else
    echo "✗ Error al realizar backup de PostgreSQL"
  fi
else
  echo "✗ pg_dump no encontrado. Por favor, instala PostgreSQL client tools"
fi

echo ""
echo "=== Resumen del Backup ==="

# Mostrar tamaño de los backups
if [ -d "$MONGO_BACKUP_DIR/backup_$DATE" ]; then
  MONGO_SIZE=$(du -sh "$MONGO_BACKUP_DIR/backup_$DATE" | cut -f1)
  echo "Tamaño del backup de MongoDB: $MONGO_SIZE"
fi

if [ -f "$POSTGRES_BACKUP_DIR/backup_$DATE.sql" ]; then
  POSTGRES_SIZE=$(du -sh "$POSTGRES_BACKUP_DIR/backup_$DATE.sql" | cut -f1)
  echo "Tamaño del backup de PostgreSQL: $POSTGRES_SIZE"
fi

echo ""
echo "Backup completado: $DATE"