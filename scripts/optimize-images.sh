#!/bin/bash

# Script para optimizar imágenes y convertir a formato WebP
# Requiere: imagemagick, webp

echo "🖼️  Optimizador de Imágenes - Arreglos Victoria"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Directorios
FRONTEND_DIR="/home/impala/Documentos/Proyectos/flores-victoria/frontend/public"
IMAGES_DIR="$FRONTEND_DIR/images"
BACKUP_DIR="$IMAGES_DIR/originals"

# Contadores
converted_count=0
optimized_count=0
skipped_count=0
error_count=0

# Verificar que existen las herramientas necesarias
check_dependencies() {
    echo "🔍 Verificando dependencias..."
    
    if ! command -v convert &> /dev/null; then
        echo "❌ ImageMagick no está instalado"
        echo "   Instalar con: sudo apt-get install imagemagick"
        exit 1
    fi
    
    if ! command -v cwebp &> /dev/null; then
        echo "❌ WebP no está instalado"
        echo "   Instalar con: sudo apt-get install webp"
        exit 1
    fi
    
    echo "✅ Todas las dependencias están instaladas"
    echo ""
}

# Crear directorio de respaldos
setup_backup() {
    if [ ! -d "$BACKUP_DIR" ]; then
        echo "📁 Creando directorio de respaldos: $BACKUP_DIR"
        mkdir -p "$BACKUP_DIR"
    fi
}

# Función para optimizar imagen PNG/JPG
optimize_image() {
    local file=$1
    local ext="${file##*.}"
    
    echo "  🔧 Optimizando: $(basename "$file")"
    
    # Backup del original si no existe
    local backup_file="$BACKUP_DIR/$(basename "$file")"
    if [ ! -f "$backup_file" ]; then
        cp "$file" "$backup_file"
    fi
    
    case "$ext" in
        jpg|jpeg|JPG|JPEG)
            # Optimizar JPEG (calidad 85, progressive)
            convert "$file" -strip -interlace Plane -quality 85 "$file"
            ;;
        png|PNG)
            # Optimizar PNG (reducir colores si es posible)
            convert "$file" -strip -define png:compression-level=9 "$file"
            ;;
    esac
    
    ((optimized_count++))
}

# Función para convertir a WebP
convert_to_webp() {
    local file=$1
    local filename="${file%.*}"
    local webp_file="$filename.webp"
    
    # Si ya existe WebP y es más reciente, saltar
    if [ -f "$webp_file" ] && [ "$webp_file" -nt "$file" ]; then
        echo "  ⏭️  WebP existe y está actualizado: $(basename "$webp_file")"
        ((skipped_count++))
        return
    fi
    
    echo "  🔄 Convirtiendo a WebP: $(basename "$file")"
    
    # Convertir con calidad 85
    if cwebp -q 85 "$file" -o "$webp_file" > /dev/null 2>&1; then
        local original_size=$(stat -c%s "$file")
        local webp_size=$(stat -c%s "$webp_file")
        local savings=$((100 - (webp_size * 100 / original_size)))
        
        echo "     💾 Ahorro: ${savings}% ($(numfmt --to=iec $original_size) → $(numfmt --to=iec $webp_size))"
        ((converted_count++))
    else
        echo "     ❌ Error al convertir"
        ((error_count++))
    fi
}

# Procesar directorio de imágenes
process_images() {
    echo "📸 Procesando imágenes en: $IMAGES_DIR"
    echo ""
    
    # Buscar todas las imágenes (excluyendo respaldos y WebP)
    find "$IMAGES_DIR" -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" \) ! -path "*/originals/*" | while read file; do
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "📄 Archivo: $(basename "$file")"
        
        # Optimizar imagen original
        optimize_image "$file"
        
        # Convertir a WebP
        convert_to_webp "$file"
        
        echo ""
    done
}

# Generar reporte
generate_report() {
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📊 REPORTE DE OPTIMIZACIÓN"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "✅ Imágenes optimizadas: $optimized_count"
    echo "🔄 Conversiones a WebP: $converted_count"
    echo "⏭️  Archivos omitidos: $skipped_count"
    echo "❌ Errores: $error_count"
    echo ""
    
    if [ -d "$BACKUP_DIR" ]; then
        local backup_count=$(find "$BACKUP_DIR" -type f | wc -l)
        echo "💾 Respaldos guardados en: $BACKUP_DIR ($backup_count archivos)"
    fi
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📝 PRÓXIMOS PASOS:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "1. Actualiza las referencias en HTML para usar WebP:"
    echo "   <picture>"
    echo "     <source srcset=\"image.webp\" type=\"image/webp\">"
    echo "     <img src=\"image.jpg\" alt=\"...\">"
    echo "   </picture>"
    echo ""
    echo "2. Considera usar image-optimizer.js para carga lazy automática"
    echo ""
    echo "3. Verifica las imágenes en diferentes navegadores"
    echo ""
    echo "4. Ejecuta Lighthouse para medir mejoras de rendimiento"
    echo ""
}

# Ejecutar proceso
main() {
    check_dependencies
    setup_backup
    process_images
    generate_report
}

# Mostrar ayuda
if [ "$1" == "--help" ] || [ "$1" == "-h" ]; then
    echo "Uso: ./optimize-images.sh"
    echo ""
    echo "Este script optimiza todas las imágenes JPG/PNG en frontend/public/images"
    echo "y genera versiones WebP de cada una."
    echo ""
    echo "Características:"
    echo "  - Optimiza JPG con calidad 85 y progressive"
    echo "  - Optimiza PNG con máxima compresión"
    echo "  - Convierte a WebP con calidad 85"
    echo "  - Crea respaldos de originales en images/originals/"
    echo "  - Calcula ahorro de espacio"
    echo ""
    echo "Requisitos:"
    echo "  - ImageMagick (convert)"
    echo "  - WebP (cwebp)"
    echo ""
    exit 0
fi

main
