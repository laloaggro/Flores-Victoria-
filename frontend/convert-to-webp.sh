#!/bin/bash

# Script para convertir imágenes PNG a WebP
# WebP ofrece ~30% mejor compresión que PNG/JPG

echo "🔄 Convirtiendo PNG a WebP..."

# Crear directorio de respaldo
BACKUP_DIR="images-png-backup-$(date +%Y%m%d-%H%M%S)"
echo "📦 Creando backup en: ../$BACKUP_DIR"
mkdir -p "../$BACKUP_DIR"

# Contadores
CONVERTED=0
SKIPPED=0
SAVED_TOTAL=0

# Encontrar PNGs >200KB (candidatos principales)
find images -type f -name "*.png" -size +200k | while read file; do
    # Tamaño original
    ORIGINAL_SIZE=$(stat -c%s "$file" 2>/dev/null || stat -f%z "$file" 2>/dev/null)
    
    # Nombre archivo WebP
    WEBP_FILE="${file%.png}.webp"
    
    # Backup del PNG original
    mkdir -p "../$BACKUP_DIR/$(dirname "$file")"
    cp "$file" "../$BACKUP_DIR/$file"
    
    echo "  Convirtiendo: $file ($(numfmt --to=iec-i --suffix=B $ORIGINAL_SIZE 2>/dev/null || echo "$ORIGINAL_SIZE bytes"))"
    
    # Convertir a WebP con calidad 85
    if cwebp -q 85 "$file" -o "$WEBP_FILE" 2>/dev/null; then
        WEBP_SIZE=$(stat -c%s "$WEBP_FILE" 2>/dev/null || stat -f%z "$WEBP_FILE" 2>/dev/null)
        SAVED=$((ORIGINAL_SIZE - WEBP_SIZE))
        SAVED_TOTAL=$((SAVED_TOTAL + SAVED))
        
        if [ $SAVED -gt 0 ]; then
            PERCENT=$((SAVED * 100 / ORIGINAL_SIZE))
            echo "    ✅ WebP creado: $(numfmt --to=iec-i --suffix=B $WEBP_SIZE 2>/dev/null || echo "$WEBP_SIZE bytes") (reducción: ${PERCENT}%)"
            
            # Opcional: Eliminar PNG original (comentado por seguridad)
            # rm "$file"
            
            CONVERTED=$((CONVERTED + 1))
        else
            echo "    ⚠️  WebP más grande que PNG, manteniendo PNG"
            rm "$WEBP_FILE"
            SKIPPED=$((SKIPPED + 1))
        fi
    else
        echo "    ❌ Error en conversión"
        SKIPPED=$((SKIPPED + 1))
    fi
done

echo ""
echo "✅ Conversión completada!"
echo "📊 Archivos convertidos: $CONVERTED"
echo "⏭️  Archivos omitidos: $SKIPPED"
echo "💾 Espacio ahorrado total: $(numfmt --to=iec-i --suffix=B $SAVED_TOTAL 2>/dev/null || echo "$SAVED_TOTAL bytes")"
echo "📦 Backup PNG: ../$BACKUP_DIR"
echo ""
echo "⚠️  NOTA: Los archivos PNG originales se mantienen."
echo "   Para eliminarlos después de verificar WebP:"
echo "   find images -name '*.png' -delete"
echo ""
echo "📋 Actualizar HTML para usar WebP con fallback PNG:"
echo "   <picture>"
echo "     <source srcset='imagen.webp' type='image/webp'>"
echo "     <img src='imagen.png' alt='descripción'>"
echo "   </picture>"
