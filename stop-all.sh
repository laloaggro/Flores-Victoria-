#!/bin/bash

# Script para detener todos los servicios de la aplicación Flores Victoria

echo "Deteniendo todos los servicios de Flores Victoria..."

# Detener y eliminar todos los contenedores
echo "Deteniendo y eliminando contenedores..."
docker-compose down -v --remove-orphans

# Eliminar contenedores huérfanos
echo "Eliminando contenedores huérfanos..."
docker rm -f $(docker ps -aq --filter "name=flores-victoria") 2>/dev/null || true

echo "Todos los servicios se han detenido."