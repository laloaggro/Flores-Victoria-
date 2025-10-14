#!/bin/bash

# Script para iniciar el entorno completo con monitoreo

echo "Iniciando el entorno Flores Victoria con monitoreo..."

# Construir imágenes
echo "Construyendo imágenes Docker..."
docker-compose build

# Iniciar servicios principales
echo "Iniciando servicios principales..."
docker-compose up -d

# Iniciar servicios de monitoreo
echo "Iniciando servicios de monitoreo..."
cd monitoring
docker-compose -f docker-compose.monitoring.yml up -d

# Volver al directorio principal
cd ..

echo "Entorno iniciado!"
echo ""
echo "Accesos:"
echo "- Aplicación: http://localhost:5175"
echo "- Prometheus: http://localhost:9090"
echo "- Grafana: http://localhost:3000 (usuario: admin, contraseña: admin)"
echo ""
echo "Espera unos momentos a que todos los servicios se inicien completamente."