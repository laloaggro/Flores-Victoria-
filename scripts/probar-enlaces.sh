#!/bin/bash

echo "🛠️  PRUEBA DE NAVEGACIÓN - FLORES VICTORIA"
echo "========================================="
echo ""

BASE_DIR="/home/impala/Documentos/Proyectos/flores-victoria"
FRONTEND_DIR="$BASE_DIR/frontend"

# Función para probar enlaces en un archivo
test_links_in_file() {
    local file="$1"
    local filename=$(basename "$file")
    
    echo "🔍 Analizando: $filename"
    
    # Buscar enlaces href y src
    local links=$(grep -oE '(href|src)="[^"]*\.html"' "$file" 2>/dev/null | grep -v "http" | cut -d'"' -f2)
    
    if [ -n "$links" ]; then
        while IFS= read -r link; do
            # Resolver ruta relativa
            local full_path
            if [[ "$link" == /* ]]; then
                full_path="$FRONTEND_DIR$link"
            else
                local dir=$(dirname "$file")
                full_path="$dir/$link"
            fi
            
            if [ -f "$full_path" ]; then
                echo "  ✅ $link"
            else
                echo "  ❌ $link (NO ENCONTRADO: $full_path)"
            fi
        done <<< "$links"
    else
        echo "  ℹ️  Sin enlaces .html encontrados"
    fi
    echo ""
}

echo "🎯 PRUEBA DE ENLACES INTERNOS"
echo "============================"
echo ""
echo "Esta prueba verificará que todos los enlaces internos funcionen"
echo "después de la reorganización de páginas."
echo ""

# Buscar todos los archivos HTML
echo "📄 Archivos HTML encontrados:"
find "$FRONTEND_DIR" -name "*.html" -not -path "*/node_modules/*" -not -name "*backup*" | sort

echo ""
echo "❓ ¿Proceder con la prueba de enlaces? (y/n)"
read -r response

if [[ "$response" =~ ^[Yy]$ ]]; then
    echo ""
    echo "🔄 Iniciando prueba de enlaces..."
    echo ""
    
    # Probar cada archivo HTML
    find "$FRONTEND_DIR" -name "*.html" -not -path "*/node_modules/*" -not -name "*backup*" | sort | while read -r file; do
        test_links_in_file "$file"
    done
    
    echo "✅ Prueba de enlaces completada"
    echo ""
    echo "📋 RECOMENDACIONES:"
    echo "=================="
    echo "• Revisar cualquier enlace marcado con ❌"
    echo "• Actualizar manualmente los enlaces rotos"
    echo "• Probar la navegación en el navegador"
    echo "• Verificar JavaScript dinámico si es necesario"
    
else
    echo ""
    echo "❌ Prueba de enlaces cancelada"
fi

echo ""
echo "🎯 SCRIPT DE PRUEBA COMPLETADO"