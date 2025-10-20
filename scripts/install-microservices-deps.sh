#!/bin/bash

# Script para instalar dependencias de todos los microservicios
# Útil para CI y desarrollo local

set -e

echo "🔧 Instalando dependencias de microservicios..."

MICROSERVICES_DIR="microservices"

# Verificar que el directorio de microservicios existe
if [ ! -d "$MICROSERVICES_DIR" ]; then
    echo "❌ Error: Directorio $MICROSERVICES_DIR no encontrado"
    exit 1
fi

# Contador de servicios procesados
COUNT=0

# Recorrer todos los subdirectorios de microservicios
for service_dir in "$MICROSERVICES_DIR"/*; do
    if [ -d "$service_dir" ] && [ -f "$service_dir/package.json" ]; then
        service_name=$(basename "$service_dir")
        echo ""
        echo "📦 Instalando dependencias de $service_name..."
        
        cd "$service_dir"
        
        # Intentar npm ci primero, si falla por desincronización usar npm install
        if [ -f "package-lock.json" ]; then
            echo "   Intentando npm ci..."
            if ! npm ci --legacy-peer-deps 2>/dev/null; then
                echo "   ⚠️  Lock file desincronizado, usando npm install..."
                npm install --legacy-peer-deps
            fi
        else
            npm install --legacy-peer-deps
        fi
        
        cd - > /dev/null
        COUNT=$((COUNT + 1))
    fi
done

echo ""
echo "✅ Dependencias instaladas en $COUNT microservicios"
