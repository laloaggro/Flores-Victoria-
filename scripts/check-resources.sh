#!/bin/bash

# Script para verificar el uso de recursos de los contenedores de Flores Victoria
echo "Verificando uso de recursos de los contenedores de Flores Victoria..."

# Verificar si docker está disponible
if ! command -v docker &> /dev/null
then
    echo "Docker no encontrado. Verifica tu instalación de Docker."
    exit 1
fi

# Verificar uso de CPU y memoria de los contenedores
echo "=== Uso de CPU y Memoria ==="
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}"

echo ""
echo "=== Límites de recursos configurados ==="

# Navegar al directorio del proyecto si existe docker-compose.yml
if [ -f "./docker-compose.yml" ]; then
    echo "Mostrando límites de recursos definidos en docker-compose.yml:"
    grep -A 10 "deploy:" ./docker-compose.yml | grep -E "(limits:|cpus:|memory:)" | sed 's/^/  /'
elif [ -f "./microservices/docker-compose.yml" ]; then
    echo "Mostrando límites de recursos definidos en microservices/docker-compose.yml:"
    grep -A 10 "deploy:" ./microservices/docker-compose.yml | grep -E "(limits:|cpus:|memory:)" | sed 's/^/  /'
else
    echo "No se encontró docker-compose.yml"
fi

echo ""
echo "Verificación de recursos completada."