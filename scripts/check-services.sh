#!/bin/bash

# Script para verificar el estado de los servicios de Flores Victoria
echo "Verificando estado de los servicios de Flores Victoria..."

# Verificar si docker-compose está disponible
if ! command -v docker-compose &> /dev/null
then
    echo "docker-compose no encontrado. Verifica tu instalación de Docker."
    exit 1
fi

# Navegar al directorio de microservicios si existe, de lo contrario usar el directorio raíz
if [ -d "./microservices" ]; then
    cd ./microservices
elif [ -f "./docker-compose.yml" ]; then
    echo "Usando docker-compose.yml en el directorio actual"
else
    echo "No se encontró docker-compose.yml. Asegúrate de estar en el directorio correcto."
    exit 1
fi

# Verificar estado de los contenedores
echo "=== Estado de los contenedores ==="
docker-compose ps

echo ""
echo "=== Verificando endpoints de health check ==="

# Verificar cada servicio por su endpoint de health check
SERVICES=(
    "http://localhost:3000/health"  # API Gateway
    "http://localhost:3001/health"  # Auth Service
    "http://localhost:3002/health"  # Product Service
    "http://localhost:3003/health"  # User Service
    "http://localhost:3004/health"  # Order Service
    "http://localhost:3005/health"  # Cart Service
    "http://localhost:3006/health"  # Wishlist Service
    "http://localhost:3007/health"  # Review Service
    "http://localhost:3008/health"  # Contact Service
)

for url in "${SERVICES[@]}"; do
    echo "Verificando $url"
    if curl -f -s "$url" > /dev/null; then
        echo "  ✓ Servicio disponible"
    else
        echo "  ✗ Servicio no disponible o endpoint de health check no responde"
    fi
done

echo ""
echo "=== Verificando servicios web públicos ==="

WEB_SERVICES=(
    "http://localhost:5173"         # Frontend
    "http://localhost:3010"         # Admin Panel
)

for url in "${WEB_SERVICES[@]}"; do
    echo "Verificando $url"
    if curl -f -s "$url" > /dev/null; then
        echo "  ✓ Servicio web disponible"
    else
        echo "  ✗ Servicio web no disponible"
    fi
done

echo ""
echo "Verificación completada."