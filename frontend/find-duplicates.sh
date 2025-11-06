#!/bin/bash

# Script para encontrar archivos duplicados por nombre
# Autor: Análisis de optimización
# Fecha: 2025-01-05

echo "🔍 Buscando archivos JavaScript duplicados..."
echo ""

# Función para buscar duplicados de un nombre específico
find_dups() {
    local filename=$1
    local count=$(find . -name "$filename" -type f -not -path "*/node_modules/*" -not -path "*/dist/*" | wc -l)
    
    if [ $count -gt 1 ]; then
        echo "📦 $filename ($count copias):"
        find . -name "$filename" -type f -not -path "*/node_modules/*" -not -path "*/dist/*" | sort
        echo ""
    fi
}

# Service Workers
echo "=== SERVICE WORKERS ==="
find_dups "sw.js"
find_dups "service-worker.js"
find . -name "sw-*.js" -type f -not -path "*/node_modules/*" | while read file; do
    basename "$file"
done | sort | uniq -c | awk '$1 > 1 {print "  "$2" ("$1" copias)"}'
echo ""

# Componentes comunes
echo "=== COMPONENTES DUPLICADOS ==="
find_dups "ProductCard.js"
find_dups "Products.js"
find_dups "CartItem.js"
find_dups "Header.js"
find_dups "Footer.js"
find_dups "Button.js"
find_dups "Card.js"
echo ""

# Utils duplicados
echo "=== UTILS DUPLICADOS ==="
find_dups "utils.js"
find_dups "auth.js"
find_dups "user.js"
find_dups "theme.js"
find_dups "accessibility.js"
find_dups "http.js"
find_dups "httpClient.js"
echo ""

# Pages duplicados
echo "=== PAGES DUPLICADOS ==="
find_dups "admin.js"
find_dups "products.js"
find_dups "contact.js"
find_dups "home.js"
find_dups "profile.js"
find_dups "wishlist.js"
echo ""

# Cart duplicados
echo "=== CART DUPLICADOS ==="
find_dups "checkout.js"
find_dups "persistentCart.js"
echo ""

# Main/Index duplicados
echo "=== MAIN FILES ==="
find_dups "main.js"
find_dups "index.js"
echo ""

# Optimización
echo "=== OPTIMIZACIÓN ==="
find_dups "performance-optimizer.js"
find_dups "image-optimizer.js"
find_dups "seo-optimizer.js"
find_dups "seo-manager.js"
echo ""

# Resumen
echo "=== RESUMEN ==="
total_files=$(find . -name "*.js" -type f -not -path "*/node_modules/*" -not -path "*/dist/*" | wc -l)
echo "Total archivos JS: $total_files"

# Contar duplicados únicos
dup_count=0
find . -name "*.js" -type f -not -path "*/node_modules/*" -not -path "*/dist/*" -exec basename {} \; | sort | uniq -c | awk '$1 > 1' | wc -l
echo "Archivos con duplicados: $(find . -name "*.js" -type f -not -path "*/node_modules/*" -not -path "*/dist/*" -exec basename {} \; | sort | uniq -c | awk '$1 > 1' | wc -l)"
