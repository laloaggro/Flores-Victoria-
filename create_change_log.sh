#!/bin/bash

# Script para crear registros de cambios detallados
# Uso: ./create_change_log.sh "Descripción del cambio"

# Crear directorio si no existe
mkdir -p change_logs

# Generar nombre de archivo con fecha y hora
FILENAME="change_logs/change_log_$(date +%Y%m%d_%H%M%S).md"

# Crear archivo de registro
cat > $FILENAME << EOF2
# Registro de Cambios del Proyecto Flores Victoria

## Información del Cambio
- **Fecha y Hora**: $(date)
- **Branch**: $(git rev-parse --abbrev-ref HEAD)
- **Commit ID**: $(git rev-parse HEAD)
- **Autor**: $(git config user.name) <$(git config user.email)>

## Descripción del Cambio
$1

## Archivos Modificados
$(git status --porcelain | grep -E "^[AMDR]" | cut -c4- | sed 's/^/- /' || echo "Ninguno")

## Archivos Nuevos
$(git status --porcelain | grep "^??" | cut -c4- | sed 's/^/- /' || echo "Ninguno")

## Instrucciones para el Desarrollador
*Agregar instrucciones específicas para el desarrollador que trabajará con estos cambios*

## Notas Adicionales
*Agregar cualquier información adicional relevante para el cambio realizado*

EOF2

echo "Registro de cambios creado: $FILENAME"
