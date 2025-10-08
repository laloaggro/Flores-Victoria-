#!/bin/bash

# Script para ejecutar pruebas de carga en el sistema Flores Victoria

echo "=== Pruebas de Carga para Flores Victoria ==="

# Verificar si k6 está instalado
if ! command -v k6 &> /dev/null
then
    echo "k6 no está instalado. Por favor, instálalo en https://k6.io/docs/getting-started/installation/"
    exit 1
fi

# Crear directorio para resultados si no existe
mkdir -p ./tests/load-tests/results

echo "Iniciando prueba de carga básica..."

# Ejecutar la prueba de carga
k6 run ./tests/load-tests/basic-load-test.js

echo "Prueba de carga completada. Resultados guardados en ./tests/load-tests/results/"

echo "Para visualizar los resultados detallados:"
echo "1. Abre ./tests/load-tests/results/load-test-results.json"
echo "2. O ejecuta: cat ./tests/load-tests/results/load-test-results.json | jq '.'"