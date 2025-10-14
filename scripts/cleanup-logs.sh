#!/bin/bash

# Script para limpiar logs antiguos del sistema Flores Victoria

echo "=== Limpieza de logs - Flores Victoria ==="
echo "$(date)"
echo

# Directorio de logs
LOGS_DIR="/home/impala/Documentos/Proyectos/flores-victoria/logs"

# Crear directorio de logs si no existe
mkdir -p "$LOGS_DIR"

# Función para limpiar logs antiguos
cleanup_logs() {
    echo "Limpiando logs antiguos..."
    
    # Eliminar archivos de log mayores a 30 días
    find "$LOGS_DIR" -name "*.log" -type f -mtime +30 -delete
    
    if [ $? -eq 0 ]; then
        echo "  ✅ Limpieza de logs antiguos completada"
    else
        echo "  ❌ Error al limpiar logs antiguos"
        return 1
    fi
}

# Función para comprimir logs grandes
compress_large_logs() {
    echo "Comprimiendo logs grandes..."
    
    # Comprimir archivos de log mayores a 100MB
    find "$LOGS_DIR" -name "*.log" -type f -size +100M -exec gzip {} \;
    
    if [ $? -eq 0 ]; then
        echo "  ✅ Compresión de logs grandes completada"
    else
        echo "  ❌ Error al comprimir logs grandes"
        return 1
    fi
}

# Ejecutar las funciones de limpieza
cleanup_logs
CLEANUP_RESULT=$?

compress_large_logs
COMPRESS_RESULT=$?

echo
echo "=== Resumen de limpieza ==="
if [ $CLEANUP_RESULT -eq 0 ]; then
    echo "✅ Limpieza de logs antiguos: Completado"
else
    echo "❌ Limpieza de logs antiguos: Error"
fi

if [ $COMPRESS_RESULT -eq 0 ]; then
    echo "✅ Compresión de logs grandes: Completado"
else
    echo "❌ Compresión de logs grandes: Error"
fi

if [ $CLEANUP_RESULT -eq 0 ] && [ $COMPRESS_RESULT -eq 0 ]; then
    echo
    echo "✅ Todas las operaciones de limpieza completadas exitosamente"
    exit 0
else
    echo
    echo "❌ Algunas operaciones de limpieza fallaron"
    exit 1
fi