#!/bin/bash

# Script de migración: console.log → Winston logger
# Flores Victoria - Prioridad Crítica #1
# Fecha: 29 de octubre de 2025

set -e

echo "======================================"
echo "🔄 Migración console.log → logger"
echo "======================================"
echo ""

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Contador de archivos modificados
MODIFIED_COUNT=0

# Función para procesar un servicio
process_service() {
    local service_path=$1
    local service_name=$2
    
    echo -e "${YELLOW}📦 Procesando: ${service_name}${NC}"
    
    if [ ! -d "$service_path" ]; then
        echo -e "${RED}   ⚠️  Directorio no encontrado: $service_path${NC}"
        return
    fi
    
    # Buscar archivos .js (excluyendo node_modules)
    local js_files=$(find "$service_path" -name "*.js" -type f ! -path "*/node_modules/*" ! -path "*/coverage/*" ! -path "*/dist/*")
    
    if [ -z "$js_files" ]; then
        echo -e "   ℹ️  No se encontraron archivos .js"
        return
    fi
    
    local service_modified=0
    
    # Procesar cada archivo
    for file in $js_files; do
        # Verificar si el archivo contiene console.log/error/warn
        if grep -q "console\.\(log\|error\|warn\|info\|debug\)" "$file"; then
            # Crear backup
            cp "$file" "${file}.backup"
            
            # Reemplazos
            sed -i 's/console\.log(/logger.info(/g' "$file"
            sed -i 's/console\.error(/logger.error(/g' "$file"
            sed -i 's/console\.warn(/logger.warn(/g' "$file"
            sed -i 's/console\.info(/logger.info(/g' "$file"
            sed -i 's/console\.debug(/logger.debug(/g' "$file"
            
            echo -e "   ${GREEN}✓${NC} $(basename $file)"
            ((service_modified++))
            ((MODIFIED_COUNT++))
        fi
    done
    
    if [ $service_modified -eq 0 ]; then
        echo -e "   ${GREEN}✓${NC} Sin console.log encontrados"
    else
        echo -e "   ${GREEN}✓${NC} $service_modified archivos modificados"
    fi
    echo ""
}

# Procesar microservices principales
echo "📂 Microservices:"
echo "===================="
process_service "microservices/user-service/src" "user-service"
process_service "microservices/product-service/src" "product-service"
process_service "microservices/auth-service/src" "auth-service"
process_service "microservices/cart-service/src" "cart-service"
process_service "microservices/order-service/src" "order-service"
process_service "microservices/api-gateway/src" "api-gateway"
process_service "microservices/review-service" "review-service"

# Procesar shared
echo "📂 Shared modules:"
echo "===================="
process_service "shared" "shared"

echo ""
echo "======================================"
echo -e "${GREEN}✅ Migración completada${NC}"
echo "======================================"
echo ""
echo "📊 Resumen:"
echo "   - Archivos modificados: $MODIFIED_COUNT"
echo ""
echo "⚠️  IMPORTANTE:"
echo "   1. Revisar cambios: git diff"
echo "   2. Verificar imports de logger en cada archivo"
echo "   3. Probar servicios: ./quick-status.sh"
echo "   4. Si todo funciona:"
echo "      - rm **/*.backup (eliminar backups)"
echo "      - git add ."
echo "      - git commit -m 'refactor: replace console.log with Winston logger'"
echo ""
echo "🔄 Para revertir cambios:"
echo "   find . -name '*.backup' -exec bash -c 'mv \"\$0\" \"\${0%.backup}\"' {} \;"
echo ""
