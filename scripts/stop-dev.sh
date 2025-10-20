#!/bin/bash

# Script para detener el ambiente de desarrollo de Flores Victoria

echo "=============================================="
echo "  Deteniendo Ambiente de Desarrollo Flores Victoria"
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

# Detener y eliminar todos los contenedores
echo "Deteniendo y eliminando contenedores..."
docker compose down

if [ $? -eq 0 ]; then
    echo "✓ Todos los contenedores han sido detenidos y eliminados"
else
    echo "⚠ Hubo un problema al detener los contenedores"
fi

echo

# Opcionalmente, eliminar volúmenes (descomentar si se desea)
# echo "Eliminando volúmenes (datos persistentes)..."
# docker compose down -v
# echo "✓ Volúmenes eliminados"

echo "=============================================="
echo "  Resumen"
echo "=============================================="
echo
echo "Los servicios de desarrollo han sido detenidos."
echo
echo "Para iniciar nuevamente, ejecute: ./scripts/start-dev.sh"
echo