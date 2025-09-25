#!/bin/bash

# Script para iniciar todos los servicios y monitorear logs

echo "Iniciando todos los servicios de Flores Victoria y monitoreando logs..."

# Función para verificar si un puerto está en uso y detener el contenedor
check_and_stop_port() {
    local port=$1
    # Buscar contenedores que estén usando el puerto específico
    local containers=$(docker ps --format "table {{.ID}}\t{{.Ports}}" | grep "0.0.0.0:$port->\|$:::$port->" | awk '{print $1}')
    
    if [ ! -z "$containers" ]; then
        echo "Puerto $port en uso por contenedores: $containers. Deteniendo..."
        for container in $containers; do
            echo "Deteniendo contenedor $container..."
            docker stop $container > /dev/null 2>&1
            docker rm $container > /dev/null 2>&1
        done
        return 0
    fi
    return 1
}

# Función para detener contenedores que usan puertos específicos
stop_conflicting_containers() {
    # Lista de puertos usados en docker-compose.yml
    local ports=(5173 5000 3000 3001 3002 3003 3004 3005 3006 3007 3008 9090 15672 5433 6380 27017 27018 5672 15692 9187 9121 9216)
    local conflicts_found=0
    
    echo "Verificando puertos en uso..."
    
    for port in "${ports[@]}"; do
        if check_and_stop_port $port; then
            conflicts_found=$((conflicts_found + 1))
        fi
    done
    
    if [ $conflicts_found -gt 0 ]; then
        echo "Se encontraron y detuvieron contenedores usando $conflicts_found puertos."
    else
        echo "No se encontraron contenedores usando puertos requeridos."
    fi
}

# Detener contenedores que puedan estar usando los puertos requeridos
stop_conflicting_containers

# Crear network si no existe
echo "Creando network si no existe..."
docker network create flores-victoria-network 2>/dev/null || true

# Construir y levantar todos los servicios en segundo plano
echo "Construyendo y levantando todos los servicios..."
docker-compose up --build -d

# Verificar el estado de los contenedores
echo "Verificando estado de los contenedores..."
docker-compose ps

echo "Todos los servicios se han iniciado."

# Abrir otro terminal para monitorear logs
echo "Abriendo terminal para monitorear logs..."

# Para sistemas Linux con gnome-terminal
if command -v gnome-terminal &> /dev/null; then
    gnome-terminal --title="Logs - Flores Victoria" -- docker-compose logs -f
# Para sistemas con xterm
elif command -v xterm &> /dev/null; then
    xterm -title "Logs - Flores Victoria" -e "docker-compose logs -f" &
# Para macOS con Terminal
elif command -v osascript &> /dev/null; then
    osascript -e 'tell app "Terminal" to do script "cd '$(pwd)' && docker-compose logs -f"'
    osascript -e 'tell app "Terminal" to set custom title of front window to "Logs - Flores Victoria"'
else
    echo "No se encontró un terminal compatible. Ejecutando logs en este terminal..."
    echo "Presiona Ctrl+C para detener el seguimiento de logs."
    docker-compose logs -f
fi

echo "Puertos disponibles:"
echo "  Frontend (Vite): http://localhost:5173"
echo "  Backend (Express): http://localhost:5000"
echo "  Admin Panel: http://localhost:3001"
echo "  API Gateway: http://localhost:3000"
echo "  Prometheus: http://localhost:9090"
echo "  Grafana: http://localhost:3002"
echo "  RabbitMQ Management: http://localhost:15672"
echo "  PostgreSQL: localhost:5433"
echo "  Redis: localhost:6380"
echo "  MongoDB (legacy): localhost:27017"
echo "  MongoDB (microservices): localhost:27018"