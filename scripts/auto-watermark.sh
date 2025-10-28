#!/bin/bash
# Script automático para aplicar marca de agua a nuevas imágenes AI
# Flores Victoria - Auto Watermark on AI Image Generation

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
AI_IMAGES_DIR="$PROJECT_ROOT/services/ai-image-service/cache/images"
FRONTEND_IMAGES_DIR="$PROJECT_ROOT/frontend/public/images/productos"
WATERMARK_LOGO="$PROJECT_ROOT/frontend/public/images/logo-watermark.png"

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  Flores Victoria - Auto Watermark Monitor${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════${NC}"
echo ""

# Verificar ImageMagick
if ! command -v convert &> /dev/null; then
    echo -e "${RED}❌ Error: ImageMagick no está instalado${NC}"
    echo "   sudo apt-get install imagemagick"
    exit 1
fi

# Verificar que existe el logo de marca de agua
if [ ! -f "$WATERMARK_LOGO" ]; then
    echo -e "${RED}❌ Error: Logo de marca de agua no encontrado${NC}"
    echo "   Ejecuta: bash scripts/add-watermark.sh"
    exit 1
fi

# Función para aplicar marca de agua a una imagen
apply_watermark() {
    local source_img="$1"
    local source_filename=$(basename "$source_img")
    local dest_path="$FRONTEND_IMAGES_DIR/$source_filename"
    
    echo -e "${YELLOW}   🎨 Procesando: $source_filename${NC}"
    
    # Si ya existe en destino, verificar si necesita actualizarse
    if [ -f "$dest_path" ]; then
        source_size=$(stat -c%s "$source_img" 2>/dev/null)
        dest_size=$(stat -c%s "$dest_path" 2>/dev/null)
        
        # Si el tamaño del origen es diferente, regenerar
        if [ "$source_size" -eq "$dest_size" ]; then
            echo -e "${YELLOW}      ⏭️  Ya tiene marca de agua, omitiendo${NC}"
            return 0
        fi
    fi
    
    # Aplicar marca de agua
    temp_file="${dest_path}.temp.webp"
    
    if composite -gravity southeast -geometry +20+20 -dissolve 35% \
        "$WATERMARK_LOGO" "$source_img" "$temp_file" 2>/dev/null; then
        
        mv "$temp_file" "$dest_path"
        echo -e "${GREEN}      ✅ Marca de agua aplicada${NC}"
        return 0
    else
        echo -e "${RED}      ❌ Error al aplicar marca de agua${NC}"
        rm -f "$temp_file"
        return 1
    fi
}

# Función para procesar nuevas imágenes
process_new_images() {
    local count=0
    
    # Buscar todas las imágenes WebP v3 sin thumbnail/medium
    while IFS= read -r img; do
        if [[ "$img" =~ -v3\.webp$ ]] && [[ ! "$img" =~ (thumb|medium) ]]; then
            if apply_watermark "$img"; then
                ((count++))
            fi
        fi
    done < <(find "$AI_IMAGES_DIR" -name "*.webp" -type f 2>/dev/null)
    
    return $count
}

# Modo de uso
MODE="${1:-once}"

if [ "$MODE" == "watch" ]; then
    # Modo watch: monitorear continuamente
    echo -e "${YELLOW}🔍 Modo monitoreo activado${NC}"
    echo -e "${YELLOW}   Monitoreando: $AI_IMAGES_DIR${NC}"
    echo -e "${YELLOW}   Presiona Ctrl+C para detener${NC}"
    echo ""
    
    # Verificar si inotify-tools está instalado
    if ! command -v inotifywait &> /dev/null; then
        echo -e "${RED}❌ Error: inotify-tools no está instalado${NC}"
        echo "   sudo apt-get install inotify-tools"
        exit 1
    fi
    
    # Procesar imágenes existentes primero
    echo "📋 Procesando imágenes existentes..."
    process_new_images
    count=$?
    echo -e "${GREEN}✅ Procesadas $count imágenes iniciales${NC}"
    echo ""
    
    # Monitorear nuevos archivos
    inotifywait -m -e close_write,moved_to "$AI_IMAGES_DIR" |
    while read -r directory events filename; do
        if [[ "$filename" =~ -v3\.webp$ ]] && [[ ! "$filename" =~ (thumb|medium) ]]; then
            echo ""
            echo -e "${YELLOW}📸 Nueva imagen detectada: $filename${NC}"
            apply_watermark "$directory/$filename"
            
            # Opcionalmente, reconstruir frontend automáticamente
            # echo -e "${YELLOW}🔄 Reconstruyendo frontend...${NC}"
            # docker-compose build frontend && docker-compose up -d frontend
        fi
    done
    
elif [ "$MODE" == "once" ]; then
    # Modo única vez: procesar todas las imágenes pendientes
    echo "📋 Procesando imágenes pendientes..."
    echo ""
    
    process_new_images
    count=$?
    
    echo ""
    echo -e "${GREEN}════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}✅ Procesamiento completado${NC}"
    echo -e "${GREEN}   Total procesadas: $count imágenes${NC}"
    echo -e "${GREEN}════════════════════════════════════════════════════════${NC}"
    echo ""
    
    if [ $count -gt 0 ]; then
        echo -e "${YELLOW}🔄 Siguiente paso: Reconstruir frontend${NC}"
        echo "   docker-compose build frontend"
        echo "   docker-compose up -d frontend"
    fi
    
else
    echo -e "${RED}❌ Modo desconocido: $MODE${NC}"
    echo ""
    echo "Uso:"
    echo "  bash scripts/auto-watermark.sh once    # Procesar una vez"
    echo "  bash scripts/auto-watermark.sh watch   # Monitorear continuamente"
    exit 1
fi

echo ""
