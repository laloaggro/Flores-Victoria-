#!/bin/bash

# Script para iniciar todos los servicios de la aplicación Flores Victoria

echo "Iniciando todos los servicios de Flores Victoria..."

# Función para verificar si un puerto está en uso
port_in_use() {
    local port=$1
    if command -v lsof >/dev/null 2>&1; then
        lsof -i :$port >/dev/null 2>&1
    elif command -v netstat >/dev/null 2>&1; then
        netstat -tln | grep :$port >/dev/null 2>&1
    else
        return 1
    fi
}

# Función para matar procesos en un puerto específico
kill_port_processes() {
    local port=$1
    if command -v lsof >/dev/null 2>&1; then
        lsof -ti :$port | xargs kill -9 2>/dev/null || true
    fi
}

# Verificar puertos en uso y manejar contenedores existentes
echo "Verificando puertos en uso..."
CONFLICTING_CONTAINERS=$(docker ps --format "table {{.Names}}\t{{.Ports}}" | grep -E "3000|3001|3002|3003|3004|3005|3006|3007|3008|3009|3010|5433|6380|27017|27018|5672|15672|9090|9121|9187|9216" | awk '{print $1}' | tr '\n' ' ')

if [ ! -z "$CONFLICTING_CONTAINERS" ]; then
    echo "Contenedores en conflicto encontrados: $CONFLICTING_CONTAINERS"
    echo "Deteniendo contenedores existentes..."
    docker stop $CONFLICTING_CONTAINERS 2>/dev/null || true
    docker rm $CONFLICTING_CONTAINERS 2>/dev/null || true
fi

# Verificar puertos del sistema en uso
PORTS_TO_CHECK="3000 3001 3002 3003 3004 3005 3010 5433 6380 27018 5672 15672 9090 9121 9187 9216 3009"
for port in $PORTS_TO_CHECK; do
    if port_in_use $port; then
        echo "Puerto $port en uso, intentando liberar..."
        kill_port_processes $port
    fi
done

# Crear network si no existe
echo "Creando network si no existe..."
docker network create flores-victoria-network 2>/dev/null || true

# Construir y levantar todos los servicios
echo "Construyendo y levantando todos los servicios..."
docker-compose up --build -d

# Verificar el estado de los contenedores
echo "Verificando estado de los contenedores..."
docker-compose ps

echo "Todos los servicios se han iniciado."
echo "Puertos disponibles:"
echo "  Frontend (Vite): http://localhost:5173"
echo "  Backend (Express): http://localhost:5000"
echo "  Admin Panel: http://localhost:3010"
echo "  API Gateway: http://localhost:3000"
echo "  Prometheus: http://localhost:9090"
echo "  Grafana: http://localhost:3009"
echo "  RabbitMQ Management: http://localhost:15672"
echo "  PostgreSQL: localhost:5433"
echo "  Redis: localhost:6380"
echo "  MongoDB (legacy): localhost:27017"
echo "  MongoDB (microservices): localhost:27018"