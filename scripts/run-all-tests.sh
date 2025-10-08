#!/bin/bash

# Script para ejecutar todas las pruebas del proyecto Flores Victoria

echo "=== Ejecutando Pruebas para Flores Victoria ==="
echo "Fecha: $(date)"
echo ""

# Verificar que las herramientas necesarias estén instaladas
echo "Verificando herramientas de pruebas..."
if ! command -v jest &> /dev/null; then
    echo "❌ Jest no encontrado. Instalando..."
    npm install jest
fi

if ! command -v k6 &> /dev/null; then
    echo "❌ k6 no encontrado. Por favor instale k6 manualmente."
    exit 1
fi

echo "✓ Herramientas verificadas"
echo ""

# Ejecutar pruebas de integración
echo "=== Ejecutando Pruebas de Integración ==="
cd /home/impala/Documentos/Proyectos/Flores-Victoria-
npm test

if [ $? -eq 0 ]; then
    echo "✓ Pruebas de integración completadas exitosamente"
else
    echo "❌ Pruebas de integración fallidas"
    exit 1
fi

echo ""

# Ejecutar pruebas de carga
echo "=== Ejecutando Pruebas de Carga ==="
cd /home/impala/Documentos/Proyectos/Flores-Victoria-
./scripts/run-load-tests.sh

if [ $? -eq 0 ]; then
    echo "✓ Pruebas de carga completadas exitosamente"
else
    echo "❌ Pruebas de carga fallidas"
    exit 1
fi

echo ""
echo "=== Todas las pruebas completadas ==="
echo "Resumen:"
echo "- Pruebas de integración: ✓ Pasadas"
echo "- Pruebas de carga: ✓ Pasadas"
echo ""
echo "¡Todas las pruebas han pasado exitosamente!"