#!/bin/bash

echo "Iniciando todos los servicios de Flores Victoria..."

# Verificar si se pasó el parámetro de desarrollo
if [ "$1" = "dev" ]; then
  echo "Iniciando en modo desarrollo..."
  
  # Construyendo y levantando servicios de desarrollo
  echo "Construyendo y levantando servicios de desarrollo..."
  docker compose -f docker-compose.dev-simple.yml up -d --build
else
  echo "Iniciando en modo producción..."
  
  # Construyendo y levantando todos los servicios
  echo "Construyendo y levantando todos los servicios..."
  docker compose up -d --build
fi

echo "Verificando estado de los contenedores..."
docker compose ps

echo "Puertos disponibles:"
echo "  Frontend (Vite): http://localhost:5175"
if [ "$1" = "dev" ]; then
  echo "  Admin Panel: http://localhost:3021"
else
  echo "  Admin Panel: http://localhost:4021"
fi
echo "  API Gateway: http://localhost:3000"
echo "  Prometheus: http://localhost:9090"
echo "  Grafana: http://localhost:3009"
echo "  RabbitMQ Management: http://localhost:15672"
echo "  PostgreSQL: localhost:5433"
echo "  Redis: localhost:6380"
echo "  MongoDB (microservices): localhost:27018"

if [ "$1" = "dev" ]; then
  echo ""
  echo "En modo desarrollo, también están disponibles:"
  echo "  Frontend Dev: http://localhost:5173"
  echo "  Admin Panel Dev: http://localhost:3021"
fi