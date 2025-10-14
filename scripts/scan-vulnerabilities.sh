#!/bin/bash

# Script para escanear vulnerabilidades en las imágenes Docker del proyecto Flores Victoria

echo "=== Escaneo de Vulnerabilidades de Imágenes Docker ==="
echo

# Verificar si Trivy está instalado
if ! command -v trivy &> /dev/null
then
    echo "Trivy no está instalado. Por favor, instálalo ejecutando:"
    echo "sudo apt-get install trivy"
    echo
    echo "O sigue las instrucciones en: https://aquasecurity.github.io/trivy/v0.18.3/getting-started/installation/"
    exit 1
fi

echo "Trivy encontrado. Iniciando escaneo..."
echo

# Construir las imágenes del proyecto
echo "Construyendo imágenes Docker..."
docker-compose build

# Obtener la lista de imágenes
echo "Obteniendo lista de imágenes..."
images=$(docker-compose images | awk '{print $2":"$3}' | tail -n +2)

# Escanear cada imagen
echo "Escaneando imágenes en busca de vulnerabilidades..."
echo "=========================================="
echo

for image in $images; do
    echo "Escaneando imagen: $image"
    echo "----------------------------------------"
    trivy image --severity HIGH,CRITICAL $image
    echo
    echo "=========================================="
    echo
done

echo "Escaneo completado."