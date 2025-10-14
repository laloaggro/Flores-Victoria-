#!/bin/bash

# Script para ejecutar las pruebas automatizadas del sistema Flores Victoria

echo "=== Ejecución de pruebas automatizadas - Flores Victoria ==="
echo "$(date)"
echo

# Directorio base del proyecto
PROJECT_DIR="/home/impala/Documentos/Proyectos/flores-victoria"
TESTS_DIR="$PROJECT_DIR/tests"

echo "Ejecutando pruebas de microservicios..."

# Verificar si Node.js está disponible
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js no está disponible en el sistema"
    echo "Instale Node.js para ejecutar las pruebas"
    exit 1
fi

# Ejecutar las pruebas de microservicios
if [ -f "$TESTS_DIR/microservices-test.js" ]; then
    node "$TESTS_DIR/microservices-test.js"
    TEST_RESULT=$?
    
    if [ $TEST_RESULT -eq 0 ]; then
        echo
        echo "✅ Pruebas de microservicios completadas exitosamente"
    else
        echo
        echo "❌ Las pruebas de microservicios fallaron"
        exit $TEST_RESULT
    fi
else
    echo "❌ No se encontró el archivo de pruebas de microservicios"
    exit 1
fi

echo
echo "=== Todas las pruebas completadas ==="