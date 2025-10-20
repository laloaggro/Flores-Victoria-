#!/bin/bash

# Script para configurar la programación automática de diagnósticos cada 25 horas

echo "=== CONFIGURACIÓN DE DIAGNÓSTICOS PROGRAMADOS ==="
echo ""

# Obtener la ruta absoluta del proyecto
PROJECT_PATH=$(pwd)
echo "Ruta del proyecto: $PROJECT_PATH"

# Verificar si el crontab ya tiene una entrada para este proyecto
CRON_ENTRY="0 */25 * * * cd $PROJECT_PATH && ./scripts/scheduled-diagnostics.sh"
(crontab -l 2>/dev/null | grep -q "$PROJECT_PATH") && {
    echo "⚠️  Ya existe una entrada de cron para este proyecto."
    echo "Por favor, edite manualmente el crontab usando 'crontab -e' si necesita hacer cambios."
    exit 1
}

# Agregar la entrada al crontab
(crontab -l 2>/dev/null; echo "$CRON_ENTRY") | crontab -
echo "✅ Entrada añadida al crontab:"
echo "$CRON_ENTRY"

echo ""
echo "Los diagnósticos se ejecutarán automáticamente cada 25 horas."
echo "Los resultados se guardarán en el directorio $PROJECT_PATH/logs/"
echo "Los logs antiguos se eliminarán automáticamente después de 2 semanas."

echo ""
echo "=== CONFIGURACIÓN COMPLETADA ==="