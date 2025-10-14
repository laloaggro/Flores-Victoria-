#!/bin/bash

# Script para actualizar las dependencias de los microservicios del sistema Flores Victoria

echo "=== Actualización de dependencias - Flores Victoria ==="
echo "$(date)"
echo

# Directorio base del proyecto
PROJECT_DIR="/home/impala/Documentos/Proyectos/flores-victoria"
MICROSERVICES_DIR="$PROJECT_DIR/microservices"

# Array de microservicios
SERVICES=("user-service" "contact-service" "review-service" "auth-service" "product-service" "order-service" "cart-service" "wishlist-service")

# Función para actualizar dependencias de un servicio
update_service_dependencies() {
    local service=$1
    local service_dir="$MICROSERVICES_DIR/$service"
    
    echo "Actualizando dependencias de $service..."
    
    if [ -d "$service_dir" ] && [ -f "$service_dir/package.json" ]; then
        cd "$service_dir"
        
        # Hacer backup del package-lock.json si existe
        if [ -f "package-lock.json" ]; then
            cp package-lock.json package-lock.json.backup
            echo "  ℹ️  Backup de package-lock.json creado"
        fi
        
        # Actualizar dependencias
        npm update
        
        if [ $? -eq 0 ]; then
            echo "  ✅ Dependencias de $service actualizadas"
            
            # Verificar si hay vulnerabilidades
            echo "  🔍 Verificando vulnerabilidades de seguridad..."
            npm audit --audit-level=moderate
            
            if [ $? -ne 0 ]; then
                echo "  ⚠️  Se encontraron vulnerabilidades de seguridad en $service"
                echo "     Ejecute 'npm audit fix' en el directorio del servicio para corregirlas"
            else
                echo "  ✅ No se encontraron vulnerabilidades de seguridad en $service"
            fi
        else
            echo "  ❌ Error al actualizar dependencias de $service"
            return 1
        fi
    else
        echo "  ❌ No se encontró el directorio o package.json para $service"
        return 1
    fi
}

# Actualizar dependencias de cada servicio
ERROR_COUNT=0
for service in "${SERVICES[@]}"; do
    update_service_dependencies "$service"
    if [ $? -ne 0 ]; then
        ERROR_COUNT=$((ERROR_COUNT + 1))
    fi
    echo
done

echo "=== Resumen de actualización ==="
if [ $ERROR_COUNT -eq 0 ]; then
    echo "✅ Todas las dependencias se actualizaron correctamente"
    exit 0
else
    echo "❌ Ocurrieron errores al actualizar $ERROR_COUNT servicio(s)"
    exit 1
fi