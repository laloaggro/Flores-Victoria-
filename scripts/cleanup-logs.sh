#!/bin/bash

# Script para limpiar logs antiguos (más de 2 semanas)
# Este script elimina los archivos de log que tienen más de 14 días de antigüedad

LOG_DIR="./logs"
DAYS_TO_KEEP=14

echo "=== LIMPIEZA DE LOGS ANTIGUOS ==="
echo "Fecha y hora: $(date)"
echo "Directorio de logs: $LOG_DIR"
echo "Días de retención: $DAYS_TO_KEEP"
echo ""

# Verificar si el directorio de logs existe
if [ ! -d "$LOG_DIR" ]; then
    echo "El directorio de logs no existe: $LOG_DIR"
    exit 1
fi

# Encontrar y eliminar archivos de log más antiguos que DAYS_TO_KEEP días
echo "Buscando archivos de log más antiguos que $DAYS_TO_KEEP días..."
OLD_LOGS=$(find "$LOG_DIR" -name "*.log" -type f -mtime +$DAYS_TO_KEEP)

if [ -n "$OLD_LOGS" ]; then
    echo "Archivos que serán eliminados:"
    echo "$OLD_LOGS"
    echo ""
    
    # Eliminar los archivos antiguos
    find "$LOG_DIR" -name "*.log" -type f -mtime +$DAYS_TO_KEEP -delete
    echo "Archivos eliminados exitosamente."
else
    echo "No se encontraron archivos de log más antiguos que $DAYS_TO_KEEP días."
fi

echo ""
echo "=== LIMPIEZA COMPLETADA ==="