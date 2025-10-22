#!/bin/bash

# Script para generar sitemap.xml dinámicamente
# Escanea las páginas HTML y genera un sitemap actualizado

SITE_URL="https://arreglosvictoria.com"
FRONTEND_DIR="/home/impala/Documentos/Proyectos/flores-victoria/frontend"
PUBLIC_DIR="$FRONTEND_DIR/public"
PAGES_DIR="$FRONTEND_DIR/pages"
OUTPUT_FILE="$PUBLIC_DIR/sitemap.xml"
TODAY=$(date +%Y-%m-%d)

echo "🗺️  Generando sitemap.xml..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Crear header del sitemap
cat > "$OUTPUT_FILE" << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
EOF

# Función para determinar prioridad según la página
get_priority() {
    local page=$1
    case "$page" in
        "index.html") echo "1.0" ;;
        "products.html") echo "0.9" ;;
        "about.html"|"contact.html") echo "0.8" ;;
        "cart.html"|"wishlist.html"|"product-detail.html") echo "0.7" ;;
        "shipping.html"|"faq.html") echo "0.6" ;;
        "login.html"|"register.html") echo "0.5" ;;
        "admin"*|"profile.html"|"orders.html"|"order-detail.html") echo "0.0" ;; # No incluir
        *) echo "0.4" ;;
    esac
}

# Función para determinar changefreq
get_changefreq() {
    local page=$1
    case "$page" in
        "index.html"|"products.html") echo "daily" ;;
        "about.html"|"contact.html"|"cart.html"|"product-detail.html") echo "weekly" ;;
        "shipping.html"|"faq.html") echo "monthly" ;;
        *) echo "yearly" ;;
    esac
}

# Procesar index.html
echo "  ✓ Agregando index.html"
cat >> "$OUTPUT_FILE" << EOF
    
    <!-- Página Principal -->
    <url>
        <loc>$SITE_URL/index.html</loc>
        <lastmod>$TODAY</lastmod>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
    </url>
EOF

# Procesar páginas en /pages
page_count=1
for page in "$PAGES_DIR"/*.html; do
    if [ -f "$page" ]; then
        filename=$(basename "$page")
        priority=$(get_priority "$filename")
        
        # Saltar páginas privadas o admin (prioridad 0.0)
        if [ "$priority" == "0.0" ]; then
            echo "  ○ Omitiendo $filename (privada/admin)"
            continue
        fi
        
        changefreq=$(get_changefreq "$filename")
        
        echo "  ✓ Agregando $filename (prioridad: $priority)"
        
        cat >> "$OUTPUT_FILE" << EOF
    
    <!-- $(basename "$filename" .html | sed 's/-/ /g' | awk '{for(i=1;i<=NF;i++)sub(/./,toupper(substr($i,1,1)),$i)}1') -->
    <url>
        <loc>$SITE_URL/pages/$filename</loc>
        <lastmod>$TODAY</lastmod>
        <changefreq>$changefreq</changefreq>
        <priority>$priority</priority>
    </url>
EOF
        ((page_count++))
    fi
done

# Cerrar sitemap
cat >> "$OUTPUT_FILE" << 'EOF'
    
</urlset>
EOF

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Sitemap generado exitosamente"
echo ""
echo "📊 Estadísticas:"
echo "   URLs incluidas: $page_count"
echo "   Archivo: $OUTPUT_FILE"
echo "   Fecha: $TODAY"
echo ""
echo "📝 Próximos pasos:"
echo "   1. Verifica el sitemap en: $SITE_URL/sitemap.xml"
echo "   2. Envía a Google Search Console"
echo "   3. Actualiza en Bing Webmaster Tools"
echo "   4. Verifica robots.txt apunta al sitemap"
echo ""
echo "💡 Tip: Ejecuta este script cada vez que agregues páginas nuevas"
