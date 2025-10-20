#!/bin/bash

# Script para iniciar el ambiente de desarrollo de Flores Victoria

echo "=============================================="
echo "  Iniciando Ambiente de Desarrollo Flores Victoria"
echo "=============================================="
echo

# Verificar que estamos en el directorio correcto
if [ ! -f "docker-compose.yml" ]; then
    echo "Error: No se encuentra docker-compose.yml"
    echo "Por favor ejecutar este script desde el directorio raíz del proyecto"
    exit 1
fi

# Verificar que Docker esté corriendo
if ! docker info >/dev/null 2>&1; then
    echo "Error: Docker no está corriendo"
    echo "Por favor inicie Docker antes de ejecutar este script"
    exit 1
fi

echo "✓ Docker está corriendo"
echo

# Crear network si no existe
echo "Creando network si no existe..."
docker network create flores-victoria-network 2>/dev/null || true
echo "✓ Network lista"
echo

# Detener servicios existentes
echo "Deteniendo servicios existentes..."
docker compose down 2>/dev/null
echo "✓ Servicios detenidos"
echo

# Construir y levantar todos los servicios
echo "Construyendo y levantando todos los servicios..."
echo "Este proceso puede tomar varios minutos la primera vez..."
echo

# Usar docker compose build para construir las imágenes
docker compose build

if [ $? -ne 0 ]; then
    echo "Error: Falló la construcción de imágenes"
    exit 1
fi

echo
echo "✓ Construcción completada"
echo

# Iniciar los servicios
echo "Iniciando servicios..."
docker compose up -d

if [ $? -ne 0 ]; then
    echo "Error: Falló el inicio de servicios"
    exit 1
fi

echo
echo "✓ Servicios iniciados"
echo

# Esperar unos segundos para que los servicios se inicialicen
echo "Esperando inicialización de servicios..."
sleep 10

# Verificar el estado de los contenedores
echo "Verificando estado de los contenedores..."
echo
docker compose ps
echo

# Mostrar información de acceso
echo "=============================================="
echo "  Información de Acceso"
echo "=============================================="
echo
echo "Aplicaciones Web:"
echo "  Frontend (Vite):         http://localhost:5175"
echo "  Admin Panel:             http://localhost:3010"
echo "  API Gateway:             http://localhost:3000"
echo "  Jaeger (Tracing):        http://localhost:16686"
echo "  RabbitMQ Management:     http://localhost:15672"
echo "  Prometheus:              http://localhost:9090"
echo "  Grafana:                 http://localhost:3009"
echo
echo "Bases de Datos:"
echo "  PostgreSQL:              localhost:5433"
echo "  Redis:                   localhost:6380"
echo "  MongoDB:                 localhost:27018"
echo
echo "Credenciales por defecto:"
echo "  RabbitMQ:                admin / adminpassword"
echo "  PostgreSQL:              flores_user / flores_password"
echo "  MongoDB:                 root / rootpassword"
echo "  Redis:                   Sin autenticación por defecto"
echo
echo "Para detener los servicios, ejecute: ./scripts/stop-dev.sh"
echo
echo "¡Ambiente de desarrollo listo!"