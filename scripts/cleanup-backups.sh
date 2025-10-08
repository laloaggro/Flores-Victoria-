#!/bin/bash

# Script para limpiar backups antiguos del proyecto Flores Victoria

# Directorio de backups
BACKUP_DIR="./backups"
MONGO_BACKUP_DIR="$BACKUP_DIR/mongodb"
POSTGRES_BACKUP_DIR="$BACKUP_DIR/postgresql"

# Número de días para retener backups (por defecto 7 días)
RETENTION_DAYS=${1:-7}

echo "=== Limpieza de Backups para Flores Victoria ==="
echo "Directorio de backups: $BACKUP_DIR"
echo "Días de retención: $RETENTION_DAYS"
echo ""

# Limpiar backups de MongoDB antiguos
if [ -d "$MONGO_BACKUP_DIR" ]; then
  echo "Limpiando backups antiguos de MongoDB..."
  find "$MONGO_BACKUP_DIR" -mindepth 1 -maxdepth 1 -mtime +$RETENTION_DAYS -type d -exec rm -rf {} \;
  echo "✓ Limpieza de MongoDB completada"
fi

echo ""

# Limpiar backups de PostgreSQL antiguos
if [ -d "$POSTGRES_BACKUP_DIR" ]; then
  echo "Limpiando backups antiguos de PostgreSQL..."
  find "$POSTGRES_BACKUP_DIR" -mindepth 1 -maxdepth 1 -mtime +$RETENTION_DAYS -type f -name "*.sql" -exec rm -f {} \;
  echo "✓ Limpieza de PostgreSQL completada"
fi

echo ""
echo "=== Resumen de Limpieza ==="

# Contar backups restantes
if [ -d "$MONGO_BACKUP_DIR" ]; then
  MONGO_COUNT=$(ls -1 "$MONGO_BACKUP_DIR" | wc -l)
  echo "Backups de MongoDB restantes: $MONGO_COUNT"
fi

if [ -d "$POSTGRES_BACKUP_DIR" ]; then
  POSTGRES_COUNT=$(ls -1 "$POSTGRES_BACKUP_DIR" | grep "\.sql$" | wc -l)
  echo "Backups de PostgreSQL restantes: $POSTGRES_COUNT"
fi

echo ""
echo "Limpieza completada"