#!/bin/bash

# Script para probar el nuevo docker-compose.yml

echo "Probando el nuevo docker-compose.yml..."

# Detener contenedores existentes
echo "Deteniendo contenedores existentes..."
docker-compose down

# Limpiar volumenes (opcional - descomentar si es necesario)
# echo "Limpiando volúmenes..."
# docker volume prune -f

# Construir y levantar servicios
echo "Construyendo y levantando servicios..."
docker-compose up -d --build

# Esperar un momento para que los servicios se inicien
echo "Esperando 30 segundos para que los servicios se inicien..."
sleep 30

# Verificar estado de los contenedores
echo "Verificando estado de los contenedores..."
docker-compose ps

echo "Prueba completada. Verifique los resultados arriba."