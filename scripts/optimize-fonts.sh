#!/bin/bash

# Optimize Fonts - Agregar font-display: swap y optimizar carga
# Flores Victoria - Performance Optimization

set -e

echo "🔤 Optimizando fuentes..."

CSS_BUNDLE="frontend/css/bundle.css"
CSS_TEMP="${CSS_BUNDLE}.temp"

if [ ! -f "$CSS_BUNDLE" ]; then
    echo "❌ Error: bundle.css no encontrado"
    exit 1
fi

# Backup original
cp "$CSS_BUNDLE" "${CSS_BUNDLE}.backup"

# Agregar font-display: swap a todas las @font-face
echo "📝 Agregando font-display: swap..."

# Usar sed para agregar font-display después de cada @font-face
sed '/@font-face/,/}/s/}/  font-display: swap;\n}/' "$CSS_BUNDLE" > "$CSS_TEMP"

# Verificar que se realizaron cambios
if grep -q "font-display: swap" "$CSS_TEMP"; then
    mv "$CSS_TEMP" "$CSS_BUNDLE"
    echo "✅ font-display: swap agregado"
else
    echo "⚠️  No se encontraron @font-face para modificar"
    rm "$CSS_TEMP"
fi

# Optimizar imports de Google Fonts en el CSS
echo "🔗 Optimizando @import de Google Fonts..."

# Reemplazar imports pesados con versiones ligeras
sed -i "s|family=Playfair+Display:wght@400;500;600;700|family=Playfair+Display:wght@400;700\&display=swap|g" "$CSS_BUNDLE"
sed -i "s|family=Poppins:wght@300;400;500;600;700|family=Poppins:wght@400;600\&display=swap|g" "$CSS_BUNDLE"

# Verificar tamaño
ORIGINAL_SIZE=$(stat -f%z "${CSS_BUNDLE}.backup" 2>/dev/null || stat -c%s "${CSS_BUNDLE}.backup")
NEW_SIZE=$(stat -f%z "$CSS_BUNDLE" 2>/dev/null || stat -c%s "$CSS_BUNDLE")

echo ""
echo "📊 Resultados:"
echo "   Tamaño original: $((ORIGINAL_SIZE / 1024)) KB"
echo "   Tamaño nuevo: $((NEW_SIZE / 1024)) KB"
echo "   Backup: ${CSS_BUNDLE}.backup"
echo ""
echo "✅ Fuentes optimizadas!"
echo ""
echo "💡 Beneficios:"
echo "   • font-display: swap - Texto visible inmediatamente"
echo "   • Menos variantes de fuente - Menor tiempo de carga"
echo "   • display=swap en URLs - Optimización Google Fonts"
