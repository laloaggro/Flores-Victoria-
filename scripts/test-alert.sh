#!/bin/bash

# Script para probar el sistema de alertas

echo "=== Prueba del sistema de alertas - Flores Victoria ==="
echo "$(date)"
echo

# Directorio base del proyecto
PROJECT_DIR="/home/impala/Documentos/Proyectos/flores-victoria"
ALERT_SCRIPT="$PROJECT_DIR/scripts/send-alert.sh"

echo "Enviando alerta de prueba..."

# Enviar una alerta de prueba
if [ -f "$ALERT_SCRIPT" ] && [ -x "$ALERT_SCRIPT" ]; then
    "$ALERT_SCRIPT" "Esta es una alerta de prueba del sistema Flores Victoria. El sistema de alertas está funcionando correctamente."
    
    if [ $? -eq 0 ]; then
        echo
        echo "✅ Prueba de alertas completada exitosamente"
        echo "Verifique su correo electrónico para confirmar que recibió la alerta"
    else
        echo
        echo "❌ La prueba de alertas falló"
    fi
else
    echo "❌ No se encontró el script de alertas o no tiene permisos de ejecución"
    exit 1
fi