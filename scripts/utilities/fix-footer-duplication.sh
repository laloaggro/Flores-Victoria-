#!/bin/bash

# Script para arreglar duplicación de enlaces en el footer
# Flores Victoria - Fix Footer Duplication

# Directorio de páginas frontend
PAGES_DIR="/home/impala/Documentos/Proyectos/flores-victoria/frontend/pages"

# Lista de archivos HTML en el directorio pages
files=(
    "reset-password.html"
    "order-detail.html"  
    "invoice.html"
    "admin.html"
    "contact.html"
    "about.html"
    "faq.html"
    "cart.html"
    "admin-products.html"
    "forgot-password.html"
    "wishlist.html"
    "admin-users.html"
    "terms.html"
    "checkout.html"
    "sitemap.html"
    "shipping.html"
    "privacy.html"
    "orders.html"
)

echo "Iniciando corrección de duplicación de footer..."

# Contador de archivos modificados
count=0

for file in "${files[@]}"; do
    file_path="$PAGES_DIR/$file"
    
    if [ -f "$file_path" ]; then
        echo "Procesando: $file"
        
        # Buscar si el archivo tiene enlaces duplicados en footer-bottom-links
        if grep -q "footer-bottom-links" "$file_path"; then
            # Crear backup
            cp "$file_path" "$file_path.backup"
            
            # Usar sed para reemplazar los enlaces duplicados
            sed -i '/<div class="footer-bottom-links">/,/<\/div>/{
                /<div class="footer-bottom-links">/!{
                    /href="\.\/privacy\.html"/d
                    /href="\.\/terms\.html"/d  
                    /href="\.\/shipping\.html"/d
                    /href="\.\/faq\.html"/d
                    /href="\/pages\/privacy\.html"/d
                    /href="\/pages\/terms\.html"/d
                    /href="\/pages\/shipping\.html"/d
                    /href="\/pages\/faq\.html"/d
                }
            }' "$file_path"
            
            # Agregar enlace a mapa del sitio si no existe
            if ! grep -q "sitemap.html" "$file_path"; then
                sed -i '/<div class="footer-bottom-links">/a\                    <a href="./sitemap.html">Mapa del Sitio</a>' "$file_path"
            fi
            
            count=$((count + 1))
            echo "  ✓ Corregido: $file"
        else
            echo "  - Sin footer-bottom-links: $file"
        fi
    else
        echo "  ✗ No encontrado: $file"
    fi
done

echo ""
echo "Corrección completada. Archivos modificados: $count"
echo "Los backups se guardaron con extensión .backup"