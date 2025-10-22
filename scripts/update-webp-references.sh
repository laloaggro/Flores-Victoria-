#!/bin/bash

# Script para actualizar referencias de imágenes a formato <picture> con WebP
# Reemplaza <img src="image.jpg"> con <picture> que incluye fallback

echo "🔄 Actualizador de Referencias a WebP"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

FRONTEND_DIR="/home/impala/Documentos/Proyectos/flores-victoria/frontend"
PUBLIC_DIR="$FRONTEND_DIR/public"
PAGES_DIR="$FRONTEND_DIR/pages"
BACKUP_DIR="$FRONTEND_DIR/backups/webp-update-$(date +%Y%m%d-%H%M%S)"

updated_files=0
updated_images=0

# Crear backup
echo "💾 Creando respaldo en: $BACKUP_DIR"
mkdir -p "$BACKUP_DIR"
echo ""

# Función para procesar un archivo HTML
process_html_file() {
    local file=$1
    local filename=$(basename "$file")
    local changes=0
    
    # Crear backup
    cp "$file" "$BACKUP_DIR/$filename"
    
    # Buscar etiquetas <img> que NO estén dentro de <picture>
    # Patron: <img src="images/xxx.jpg|png" ...>
    # Excluir: imágenes de iconos, logos pequeños
    
    # Contar imágenes a actualizar
    local img_count=$(grep -c '<img.*src=".*\(\.jpg\|\.jpeg\|\.png\)"' "$file" 2>/dev/null || echo "0")
    
    if [ "$img_count" -gt 0 ]; then
        echo "📄 Procesando: $filename ($img_count imágenes encontradas)"
        
        # Ejecutar transformación con Python y capturar número de cambios
        changes=$(python3 - "$file" <<'PYTHON_SCRIPT'
import sys
import re
from pathlib import Path

def is_inside_picture(html, start_idx):
    """Heurística: si la última apertura <picture> antes del índice
    es posterior al último cierre </picture>, consideramos que está dentro."""
    before = html[:start_idx]
    last_open = before.rfind('<picture')
    last_close = before.rfind('</picture>')
    return last_open != -1 and (last_close == -1 or last_open > last_close)

def wrap_img_with_picture(match, full_html):
    """Convierte <img src="image.jpg"> en <picture> con WebP"""
    img_tag = match.group(0)
    start = match.start()
    # Evitar procesar si ya está dentro de <picture>
    if is_inside_picture(full_html, start):
        return img_tag
    
    # Extraer atributos
    src_match = re.search(r'src="([^"]+)"', img_tag)
    if not src_match:
        return img_tag
    
    src = src_match.group(1)
    
    # Solo procesar JPG/PNG de products/categories
    if not re.search(r'\.(jpg|jpeg|png)$', src, re.IGNORECASE):
        return img_tag
    
    # No procesar iconos, logos pequeños
    if 'icon' in src.lower() or 'logo' in src.lower():
        return img_tag
    
    # Crear ruta WebP
    webp_src = re.sub(r'\.(jpg|jpeg|png)$', '.webp', src, flags=re.IGNORECASE)
    
    # Extraer otros atributos
    alt_match = re.search(r'alt="([^"]*)"', img_tag)
    alt = alt_match.group(1) if alt_match else ''
    
    class_match = re.search(r'class="([^"]*)"', img_tag)
    class_attr = f' class="{class_match.group(1)}"' if class_match else ''
    
    loading_match = re.search(r'loading="([^"]*)"', img_tag)
    loading_attr = f' loading="{loading_match.group(1)}"' if loading_match else ' loading="lazy"'
    decoding_match = re.search(r'decoding="([^"]*)"', img_tag)
    decoding_attr = f' decoding="{decoding_match.group(1)}"' if decoding_match else ' decoding="async"'
    
    # Construir picture tag
    picture = f'''<picture>
        <source srcset="{webp_src}" type="image/webp">
        <img src="{src}" alt="{alt}"{class_attr}{loading_attr}{decoding_attr}>
    </picture>'''
    
    return picture

# Leer archivo
file_path = sys.argv[1]
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Buscar todas las etiquetas <img ...>
pattern = r'<img\s+[^>]*src="[^\"]+\.(?:jpg|jpeg|png)"[^>]*>'

def replacer(m):
    return wrap_img_with_picture(m, content)

new_content = re.sub(pattern, replacer, content, flags=re.IGNORECASE)

# Escribir si hubo cambios
changes = 0
if new_content != content:
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    # Contar nuevas ocurrencias de <picture>
    changes = max(0, new_content.count('<picture>') - content.count('<picture>'))
    print(f"  ✓ {changes} imágenes actualizadas")
else:
    print("  ○ Sin cambios necesarios")

# Imprimir SOLO el número de cambios para que bash lo capture
print(changes)
PYTHON_SCRIPT
        )
        # Si la salida no es un número, normalizar a 0
        if ! [[ "$changes" =~ ^[0-9]+$ ]]; then
            changes=0
        fi
        if [ "$changes" -gt 0 ]; then
            ((updated_files++))
            ((updated_images += changes))
        fi
    else
        echo "  ○ Sin imágenes para actualizar: $filename"
    fi
}

# Procesar index.html
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ -f "$PUBLIC_DIR/index.html" ]; then
    process_html_file "$PUBLIC_DIR/index.html"
fi

# Procesar páginas
for page in "$PAGES_DIR"/*.html; do
    if [ -f "$page" ]; then
        process_html_file "$page"
    fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ ACTUALIZACIÓN COMPLETADA"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Estadísticas:"
echo "   Archivos actualizados: $updated_files"
echo "   Imágenes convertidas: $updated_images"
echo "   Respaldo en: $BACKUP_DIR"
echo ""
echo "📝 Próximos pasos:"
echo "   1. Verifica las páginas en el navegador"
echo "   2. Asegúrate de que existen los archivos .webp"
echo "   3. Ejecuta validate-site.sh para verificar"
echo "   4. Prueba en diferentes navegadores"
echo ""
echo "💡 Revertir cambios:"
echo "   cp $BACKUP_DIR/* $PUBLIC_DIR/ && cp $BACKUP_DIR/* $PAGES_DIR/"
echo ""
