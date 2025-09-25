#!/bin/bash

# Script para iniciar todos los microservicios

echo "Iniciando todos los microservicios..."

# Crear directorio de logs si no existe
mkdir -p ./api-gateway/logs

# Iniciar servicios con docker compose
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d

echo "Todos los microservicios se están iniciando en segundo plano."
echo "Puedes verificar el estado con: docker compose ps"
echo "Para ver los logs: docker compose logs -f"