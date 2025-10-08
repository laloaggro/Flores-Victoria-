#!/bin/bash

# Script para ejecutar pruebas de integración en el sistema Flores Victoria

echo "=== Pruebas de Integración para Flores Victoria ==="

# Verificar si Node.js y npm están instalados
if ! command -v node &> /dev/null
then
    echo "Node.js no está instalado. Por favor, instálalo primero."
    exit 1
fi

if ! command -v npm &> /dev/null
then
    echo "npm no está instalado. Por favor, instálalo primero."
    exit 1
fi

# Instalar dependencias necesarias para las pruebas
echo "Instalando dependencias para pruebas..."
npm install axios jest supertest --no-save

# Crear directorio para resultados si no existe
mkdir -p ./tests/integration-tests/results

echo "Iniciando pruebas de integración..."

# Ejecutar las pruebas de integración
npx jest ./tests/integration-tests/microservices-integration.test.js --verbose

echo "Pruebas de integración completadas."

# Limpiar dependencias instaladas temporalmente
echo "Limpiando dependencias temporales..."
npm uninstall axios jest supertest

echo "Proceso de pruebas finalizado."