#!/bin/bash

# Script para verificar el estado de los servicios críticos de Flores Victoria
# Prioriza la verificación del auth-service antes de cualquier operación

echo "Verificando estado de los servicios críticos de Flores Victoria..."

# Verificar si docker-compose está disponible
if ! command -v docker-compose &> /dev/null
then
    echo "docker-compose no encontrado. Verifica tu instalación de Docker."
    exit 1
fi

# Verificar estado de los contenedores
echo "=== Estado de los contenedores ==="
docker-compose ps

echo ""
echo "=== Verificando servicio crítico: Auth Service ==="

# Verificar primero el auth-service (prioridad más alta)
AUTH_SERVICE_URL="http://localhost:3001/health"
echo "Verificando $AUTH_SERVICE_URL"
if curl -f -s "$AUTH_SERVICE_URL" > /dev/null; then
    echo "  ✓ Auth Service disponible"
else
    echo "  ✗ Auth Service no disponible o endpoint de health check no responde"
    echo "  => Es recomendable resolver este problema antes de continuar con otras operaciones"
fi

echo ""
echo "=== Verificando otros servicios críticos ==="

# Verificar otros servicios críticos
CRITICAL_SERVICES=(
    "http://localhost:3000/health"  # API Gateway
    "http://localhost:3002/health"  # Product Service
    "http://localhost:3003/health"  # User Service
)

for url in "${CRITICAL_SERVICES[@]}"; do
    echo "Verificando $url"
    if curl -f -s "$url" > /dev/null; then
        echo "  ✓ Servicio disponible"
    else
        echo "  ✗ Servicio no disponible o endpoint de health check no responde"
    fi
done

echo ""
echo "=== Verificando servicios de base de datos ==="

# Verificar servicios de base de datos
DB_SERVICES=(
    "http://localhost:27017"        # MongoDB
    "http://localhost:5432"         # PostgreSQL
    "http://localhost:6379"         # Redis
)

for port in "${DB_SERVICES[@]}"; do
    echo "Verificando disponibilidad en $port"
    if nc -z localhost ${port##*:} 2>/dev/null; then
        echo "  ✓ Servicio de base de datos en ${port##*:} disponible"
    else
        echo "  ✗ Servicio de base de datos en ${port##*:} no disponible"
    fi
done

echo ""
echo "Verificación de servicios críticos completada."