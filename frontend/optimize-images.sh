#!/bin/bash

# Script para optimizar imágenes pesadas (>500KB)
# Reduce calidad a 85% y redimensiona si es muy grande

echo "🖼️  Optimizando imágenes grandes..."

# Crear directorio de backup
BACKUP_DIR="images-backup-$(date +%Y%m%d-%H%M%S)"
echo "📦 Creando backup en: $BACKUP_DIR"
mkdir -p "../$BACKUP_DIR"

# Contador
COUNT=0
SAVED_BYTES=0

# Encontrar imágenes >500KB
find images -type f \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" \) -size +500k | while read file; do
    # Obtener tamaño original
    ORIGINAL_SIZE=$(stat -c%s "$file" 2>/dev/null || stat -f%z "$file" 2>/dev/null)
    
    # Copiar a backup
    cp "$file" "../$BACKUP_DIR/"
    
    echo "  Procesando: $file ($(numfmt --to=iec-i --suffix=B $ORIGINAL_SIZE 2>/dev/null || echo "$ORIGINAL_SIZE bytes"))"
    
    # Obtener dimensiones
    DIMENSIONS=$(identify -format "%wx%h" "$file" 2>/dev/null)
    WIDTH=$(echo $DIMENSIONS | cut -d'x' -f1)
    
    # Si es muy grande (>2000px), redimensionar a 1920px ancho max
    if [ "$WIDTH" -gt 2000 ]; then
        convert "$file" -resize '1920x>' -quality 85 "$file.tmp" 2>/dev/null && mv "$file.tmp" "$file"
    else
        # Solo reducir calidad a 85%
        convert "$file" -quality 85 "$file.tmp" 2>/dev/null && mv "$file.tmp" "$file"
    fi
    
    # Verificar nuevo tamaño
    NEW_SIZE=$(stat -c%s "$file" 2>/dev/null || stat -f%z "$file" 2>/dev/null)
    SAVED=$((ORIGINAL_SIZE - NEW_SIZE))
    
    if [ $SAVED -gt 0 ]; then
        echo "    ✅ Reducido: $(numfmt --to=iec-i --suffix=B $SAVED 2>/dev/null || echo "$SAVED bytes")"
        COUNT=$((COUNT + 1))
    fi
done

echo ""
echo "✅ Optimización completada!"
echo "📊 Archivos procesados: $COUNT"
echo "💾 Backup guardado en: ../$BACKUP_DIR"
echo ""
echo "Para verificar el tamaño total actual:"
echo "  du -sh images/"
