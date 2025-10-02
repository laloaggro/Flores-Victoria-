#!/bin/bash

# Script para detener todos los servicios de la aplicación Flores Victoria

echo "Deteniendo todos los servicios de Flores Victoria..."

# Detener y eliminar todos los contenedores
echo "Deteniendo y eliminando contenedores..."
docker-compose down

echo "Todos los servicios se han detenido."