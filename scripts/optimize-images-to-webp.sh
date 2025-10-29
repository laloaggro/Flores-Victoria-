#!/bin/bash
# Script para convertir todas las imágenes de productos a WebP
# con optimización de calidad y creación de thumbnails

set -e  # Salir si hay error

echo "🖼️  Iniciando optimización de imágenes a WebP..."

# Directorio de imágenes de productos
IMAGES_DIR="/home/impala/Documentos/Proyectos/flores-victoria/frontend/public/images/productos"
BACKUP_DIR="/home/impala/Documentos/Proyectos/flores-victoria/frontend/public/images/productos-backup-$(date +%Y%m%d-%H%M%S)"

# Verificar que existe cwebp
if ! command -v cwebp &> /dev/null; then
    echo "❌ cwebp no está instalado. Instalando..."
    sudo apt-get update && sudo apt-get install -y webp
fi

# Crear backup
echo "📦 Creando backup en: $BACKUP_DIR"
cp -r "$IMAGES_DIR" "$BACKUP_DIR"

# Contador
CONVERTED=0
TOTAL=0

# Convertir JPG y PNG a WebP
echo "🔄 Convirtiendo imágenes..."
for ext in jpg jpeg png JPG JPEG PNG; do
    find "$IMAGES_DIR" -type f -name "*.$ext" | while read -r file; do
        TOTAL=$((TOTAL + 1))
        
        # Nombre del archivo sin extensión
        filename=$(basename "$file")
        name="${filename%.*}"
        dir=$(dirname "$file")
        
        # Archivo WebP de salida
        webp_file="$dir/$name.webp"
        
        # Si ya existe, skip
        if [ -f "$webp_file" ]; then
            echo "⏭️  Ya existe: $webp_file"
            continue
        fi
        
        # Convertir a WebP con calidad 80 (buen balance calidad/tamaño)
        echo "  ➤ Convirtiendo: $filename → $name.webp"
        cwebp -q 80 "$file" -o "$webp_file" -quiet
        
        # Crear thumbnail (300x300) si es imagen de producto
        if [[ "$name" != *"-thumb"* ]]; then
            thumb_file="$dir/$name-thumb.webp"
            if ! [ -f "$thumb_file" ]; then
                echo "    📐 Creando thumbnail: $name-thumb.webp"
                cwebp -q 75 -resize 300 300 "$file" -o "$thumb_file" -quiet
            fi
        fi
        
        # Obtener tamaños
        original_size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file")
        webp_size=$(stat -f%z "$webp_file" 2>/dev/null || stat -c%s "$webp_file")
        reduction=$((100 - (webp_size * 100 / original_size)))
        
        echo "    ✅ $filename: $(numfmt --to=iec $original_size) → $(numfmt --to=iec $webp_size) (Reducción: $reduction%)"
        
        CONVERTED=$((CONVERTED + 1))
    done
done

echo ""
echo "✅ Optimización completada!"
echo "   📊 Imágenes procesadas: $CONVERTED"
echo "   💾 Backup guardado en: $BACKUP_DIR"
echo ""
echo "🎯 Siguiente paso: Actualizar código para usar WebP con fallback"
echo "   Ejemplo:"
echo '   <picture>'
echo '     <source srcset="imagen.webp" type="image/webp">'
echo '     <img src="imagen.jpg" alt="..." loading="lazy">'
echo '   </picture>'
