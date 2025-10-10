#!/bin/bash

# Script para iniciar todos los servicios de la aplicación Flores Victoria

echo "Iniciando todos los servicios de Flores Victoria..."

# Crear network si no existe
echo "Creando network si no existe..."
docker network create flores-victoria-network 2>/dev/null || true

# Construir y levantar todos los servicios
echo "Construyendo y levantando todos los servicios..."
docker compose up --build -d

# Verificar el estado de los contenedores
echo "Verificando estado de los contenedores..."
docker compose ps

echo "Todos los servicios se han iniciado."
echo "Puertos disponibles:"
echo "  Frontend (Vite): http://localhost:5173"
echo "  Backend (Express): http://localhost:5000"
echo "  Admin Panel: http://localhost:3010"
echo "  API Gateway: http://localhost:3000"
echo "  Prometheus: http://localhost:9090"
echo "  Grafana: http://localhost:3002"
echo "  RabbitMQ Management: http://localhost:15672"
echo "  PostgreSQL: localhost:5433"
echo "  Redis: localhost:6380"
echo "  MongoDB (legacy): localhost:27017"
echo "  MongoDB (microservices): localhost:27018"