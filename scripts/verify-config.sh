#!/bin/bash

# Script para verificar la consistencia de la configuración del proyecto

echo "=== VERIFICACIÓN DE CONFIGURACIÓN DEL PROYECTO FLORES VICTORIA ==="
echo ""

# Verificar que el archivo PROJECT_OVERVIEW.md exista
if [ -f "./PROJECT_OVERVIEW.md" ]; then
    echo "✓ PROJECT_OVERVIEW.md encontrado"
else
    echo "✗ PROJECT_OVERVIEW.md no encontrado"
fi

# Verificar que el archivo .env exista
if [ -f "./.env" ]; then
    echo "✓ .env encontrado"
else
    echo "✗ .env no encontrado"
fi

# Verificar que docker-compose.yml exista
if [ -f "./docker-compose.yml" ]; then
    echo "✓ docker-compose.yml encontrado"
else
    echo "✗ docker-compose.yml no encontrado"
fi

# Verificar que start-all.sh exista y tenga permisos de ejecución
if [ -f "./start-all.sh" ]; then
    echo "✓ start-all.sh encontrado"
    if [ -x "./start-all.sh" ]; then
        echo "✓ start-all.sh tiene permisos de ejecución"
    else
        echo "✗ start-all.sh no tiene permisos de ejecución"
    fi
else
    echo "✗ start-all.sh no encontrado"
fi

# Verificar que stop-all.sh exista y tenga permisos de ejecución
if [ -f "./stop-all.sh" ]; then
    echo "✓ stop-all.sh encontrado"
    if [ -x "./stop-all.sh" ]; then
        echo "✓ stop-all.sh tiene permisos de ejecución"
    else
        echo "✗ stop-all.sh no tiene permisos de ejecución"
    fi
else
    echo "✗ stop-all.sh no encontrado"
fi

echo ""
echo "=== VERIFICACIÓN DE PUERTOS ==="

# Verificar puertos en docker-compose.yml
echo "Verificando puertos en docker-compose.yml:"
grep -E "ports:.*:" ./docker-compose.yml | head -20

echo ""
echo "=== VERIFICACIÓN DE VARIABLES DE ENTORNO ==="

# Verificar variables de entorno importantes
echo "Variables de entorno críticas en .env:"
grep -E "(AUTH_SERVICE|PRODUCT_SERVICE|USER_SERVICE)" ./.env

echo ""
echo "=== VERIFICACIÓN DE DOCUMENTACIÓN ==="

# Verificar información de puertos en la documentación
echo "Puertos definidos en PROJECT_OVERVIEW.md:"
grep -A 5 "Puertos y Configuración" ./PROJECT_OVERVIEW.md | grep -E "\\|.*[0-9]+.*\\|"

echo ""
echo "=== FIN DE VERIFICACIÓN ==="