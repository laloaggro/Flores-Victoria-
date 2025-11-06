#!/bin/bash

# Script para eliminar console.log de archivos de producción
# Mantiene console.error para debugging crítico

echo "🧹 Limpiando console.log de archivos JavaScript..."

# Archivos a procesar (excluyendo node_modules y dist)
FILES=$(find ./js ./src/js ./public -name "*.js" -type f -not -path "*/node_modules/*" -not -path "*/dist/*" 2>/dev/null)

COUNT=0

for file in $FILES; do
    # Verificar si el archivo contiene console.log o console.warn
    if grep -q "console\.\(log\|warn\)" "$file"; then
        echo "  Procesando: $file"
        
        # Comentar console.log y console.warn (pero NO console.error)
        sed -i.bak -E 's/^(\s*)console\.(log|warn)\(/\1\/\/ console.\2(/' "$file"
        
        # Eliminar archivos backup
        rm -f "${file}.bak"
        
        COUNT=$((COUNT + 1))
    fi
done

echo "✅ Completado: $COUNT archivos procesados"
echo "📝 Nota: console.error se mantuvo para debugging crítico"
