#!/bin/bash

echo "════════════════════════════════════════════════════════"
echo "  🎨 Flores Victoria - Sistema de Marcas de Agua"
echo "════════════════════════════════════════════════════════"
echo ""

# Directorios
DIR_BASE="/home/impala/Documentos/Proyectos/flores-victoria"
DIR_PRODUCTOS="$DIR_BASE/frontend/public/images/productos"
DIR_IMAGES="$DIR_BASE/frontend/public/images"

# Verificar que existe el logo
if [ ! -f "$DIR_IMAGES/logo-watermark-hd.png" ]; then
    echo "❌ Error: No existe logo-watermark-hd.png"
    exit 1
fi

echo "📝 Configuración:"
echo "   Logo: $DIR_IMAGES/logo-watermark-hd.png"
echo "   Directorio: $DIR_PRODUCTOS"
echo ""

# Contar imágenes
TOTAL=$(ls $DIR_PRODUCTOS/victoria-*.webp 2>/dev/null | wc -l)
echo "📋 Imágenes encontradas: $TOTAL"
echo ""

# Procesamiento
CONTADOR=0
EXITOSOS=0
ERRORES=0

for imagen in $DIR_PRODUCTOS/victoria-*.webp; do
    CONTADOR=$((CONTADOR + 1))
    NOMBRE=$(basename "$imagen")
    SALIDA="${imagen%.webp}-watermarked.webp"
    
    echo "[$CONTADOR/$TOTAL] 🎨 $NOMBRE"
    
    # Aplicar marca de agua centrada con baja opacidad
    if composite -gravity center -dissolve 15 \
        "$DIR_IMAGES/logo-watermark-hd.png" \
        "$imagen" \
        "$SALIDA" 2>/dev/null; then
        
        TAMANO=$(du -h "$SALIDA" | cut -f1)
        echo "         ✅ Completo ($TAMANO)"
        EXITOSOS=$((EXITOSOS + 1))
    else
        echo "         ❌ Error"
        ERRORES=$((ERRORES + 1))
    fi
done

echo ""
echo "════════════════════════════════════════════════════════"
echo "📊 Resumen:"
echo "   Total:    $TOTAL"
echo "   ✅ Exitosos: $EXITOSOS"
echo "   ❌ Errores:  $ERRORES"
echo "════════════════════════════════════════════════════════"
