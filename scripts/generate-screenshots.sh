#!/bin/bash

# Script para crear screenshots de demostración para PWA
# Nota: Idealmente deberían capturarse desde el sitio real en producción

cd "$(dirname "$0")/.."

SCREENSHOTS_DIR="frontend/public/screenshots"
LOGO_SVG="frontend/public/logo.svg"

echo "🖼️  GENERADOR DE SCREENSHOTS PWA (PLACEHOLDER)"
echo "═══════════════════════════════════════════════════════"

if ! command -v convert &> /dev/null; then
    echo "❌ Error: ImageMagick no está instalado"
    echo "   Instala con: sudo apt-get install imagemagick"
    exit 1
fi

# Crear screenshot desktop placeholder (1280x720)
echo "📱 Generando screenshot desktop (1280x720)..."
convert -size 1280x720 \
    -background "#f8f9fa" \
    -fill "#2d5016" \
    -pointsize 48 \
    -font "Georgia" \
    -gravity center \
    label:"Arreglos Victoria\nFlores Exclusivas Desde 1980" \
    "$SCREENSHOTS_DIR/desktop-1.jpg"

# Crear screenshot mobile placeholder (750x1334)
echo "📱 Generando screenshot mobile (750x1334)..."
convert -size 750x1334 \
    -background "#ffffff" \
    -fill "#2d5016" \
    -pointsize 36 \
    -font "Georgia" \
    -gravity center \
    label:"Arreglos Victoria\n\nFlores Exclusivas\nDesde 1980" \
    "$SCREENSHOTS_DIR/mobile-1.jpg"

echo ""
echo "✅ Screenshots placeholder generados"
echo ""
echo "📋 Nota importante:"
echo "   Estos son screenshots de placeholder."
echo "   Para producción, captura screenshots reales:"
echo "   1. Inicia el servidor: npm run dev"
echo "   2. Abre Chrome DevTools (F12)"
echo "   3. Desktop: Captura 1280x720px de la página inicio"
echo "   4. Mobile: Usa modo responsive (375x667) y captura"
echo "   5. Reemplaza los archivos en screenshots/"
echo ""
