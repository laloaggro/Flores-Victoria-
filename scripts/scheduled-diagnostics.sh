#!/bin/bash

# Script para ejecutar diagnósticos programados cada 25 horas
# Este script ejecuta los diagnósticos del sistema y luego limpia los logs antiguos

echo "=== DIAGNÓSTICO PROGRAMADO DEL SISTEMA ==="
echo "Fecha y hora: $(date)"
echo ""

# Ejecutar diagnóstico avanzado
echo "Ejecutando diagnóstico avanzado..."
./scripts/advanced-diagnostics.sh > /dev/null

# Ejecutar verificación detallada de servicios
echo "Ejecutando verificación detallada de servicios..."
./scripts/check-services-detailed.sh > /dev/null

# Limpiar logs antiguos (más de 2 semanas)
echo "Limpiando logs antiguos..."
./scripts/cleanup-logs.sh > /dev/null

echo ""
echo "=== DIAGNÓSTICO PROGRAMADO COMPLETADO ==="
echo "Los resultados se encuentran en el directorio ./logs/"