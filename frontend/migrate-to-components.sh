#!/bin/bash

# Script de migración automática para usar componentes unificados
# Uso: ./migrate-to-components.sh

echo "🔄 Iniciando migración a componentes unificados..."

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Directorio base
FRONTEND_DIR="/home/impala/Documentos/Proyectos/flores-victoria/frontend"
PAGES_DIR="$FRONTEND_DIR/pages"
BACKUP_DIR="$FRONTEND_DIR/backups/pre-components-$(date +%Y%m%d-%H%M%S)"

# Crear directorio de backups
echo -e "${YELLOW}📦 Creando backups en: $BACKUP_DIR${NC}"
mkdir -p "$BACKUP_DIR"

# Función para hacer backup y modificar archivo
migrate_page() {
    local file=$1
    local filename=$(basename "$file")
    
    echo -e "${YELLOW}Procesando: $filename${NC}"
    
    # Backup
    cp "$file" "$BACKUP_DIR/$filename.bak"
    
    # Crear archivo temporal
    temp_file=$(mktemp)
    
    # Leer el archivo línea por línea
    in_footer=0
    footer_found=0
    
    while IFS= read -r line; do
        # Detectar inicio del footer
        if [[ $line =~ \<footer.*class.*site-footer ]]; then
            in_footer=1
            footer_found=1
            # Reemplazar con el div root
            echo "    <!-- Footer Unificado -->" >> "$temp_file"
            echo "    <div id=\"footer-root\"></div>" >> "$temp_file"
            continue
        fi
        
        # Detectar fin del footer
        if [[ $in_footer -eq 1 ]] && [[ $line =~ \</footer\> ]]; then
            in_footer=0
            continue
        fi
        
        # Omitir líneas dentro del footer
        if [[ $in_footer -eq 1 ]]; then
            continue
        fi
        
        # Agregar script antes de </body> si se encontró footer
        if [[ $footer_found -eq 1 ]] && [[ $line =~ \</body\> ]]; then
            echo "    <!-- Componente Footer -->" >> "$temp_file"
            echo "    <script src=\"/js/components/footer-component.js\"></script>" >> "$temp_file"
            footer_found=2
        fi
        
        echo "$line" >> "$temp_file"
    done < "$file"
    
    # Reemplazar archivo original
    mv "$temp_file" "$file"
    
    if [[ $footer_found -gt 0 ]]; then
        echo -e "${GREEN}✅ $filename migrado correctamente${NC}"
    else
        echo -e "${YELLOW}⚠️  $filename no contenía footer para migrar${NC}"
    fi
}

# Migrar index.html
echo -e "\n${YELLOW}=== Migrando index.html ===${NC}"
migrate_page "$FRONTEND_DIR/index.html"

# Migrar todas las páginas
echo -e "\n${YELLOW}=== Migrando páginas en /pages/ ===${NC}"
for page in "$PAGES_DIR"/*.html; do
    if [ -f "$page" ]; then
        migrate_page "$page"
    fi
done

echo -e "\n${GREEN}✅ Migración completada!${NC}"
echo -e "${YELLOW}📦 Backups guardados en: $BACKUP_DIR${NC}"
echo ""
echo "Próximos pasos:"
echo "1. Verifica que las páginas se vean correctamente en http://localhost:5173"
echo "2. Si algo sale mal, restaura desde los backups en: $BACKUP_DIR"
echo "3. Si todo está bien, puedes eliminar los backups más adelante"
echo ""
echo "Para editar el footer en el futuro, modifica:"
echo "  frontend/js/components/footer-component.js"
