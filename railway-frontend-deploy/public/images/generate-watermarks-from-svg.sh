#!/bin/bash

echo "🎨 Generando marcas de agua desde SVG..."

# ============================================================
# OPCIÓN 1: Logo completo minimalista (fondo pantalla completa)
# ============================================================
echo "📝 1️⃣ Creando: Logo completo minimalista..."
convert logo-source.svg \
  -resize 1000x1000 \
  -alpha set \
  -channel A \
  -evaluate multiply 0.08 \
  +channel \
  -background none \
  -gravity center \
  -extent 1536x1536 \
  logo-watermark-v2-minimal.png 2>/dev/null && echo "✅ Logo-watermark-v2-minimal.png" || echo "❌ Error"

# ============================================================
# OPCIÓN 2: Logo mediano esquina (boutique)
# ============================================================
echo "📝 2️⃣ Creando: Logo mediano en esquina..."
convert logo-source.svg \
  -resize 300x300 \
  -alpha set \
  -channel A \
  -evaluate multiply 0.5 \
  +channel \
  -background none \
  \( +clone -background white -shadow 60x3+5+5 \) \
  +swap \
  -background none \
  -layers merge \
  -trim \
  +repage \
  logo-watermark-v2-corner.png 2>/dev/null && echo "✅ Logo-watermark-v2-corner.png" || echo "❌ Error"

# ============================================================
# OPCIÓN 3: Logo pequeño repetido (patrón)
# ============================================================
echo "📝 3️⃣ Creando: Patrón con logo repetido..."
convert logo-source.svg \
  -resize 250x250 \
  -alpha set \
  -channel A \
  -evaluate multiply 0.12 \
  +channel \
  \( -clone 0 +append \) \
  -append \
  \( -clone 0 +append \) \
  -append \
  -resize 1536x1536 \
  -background none \
  -gravity center \
  logo-watermark-v2-pattern.png 2>/dev/null && echo "✅ Logo-watermark-v2-pattern.png" || echo "❌ Error"

# ============================================================
# OPCIÓN 4: Logo diagonal elegante
# ============================================================
echo "📝 4️⃣ Creando: Logo diagonal elegante..."
convert logo-source.svg \
  -resize 600x600 \
  -alpha set \
  -channel A \
  -evaluate multiply 0.15 \
  +channel \
  -background none \
  -extent 1536x1536 \
  -gravity center \
  -rotate -45 \
  logo-watermark-v2-diagonal.png 2>/dev/null && echo "✅ Logo-watermark-v2-diagonal.png" || echo "❌ Error"

# ============================================================
# OPCIÓN 5: Logo grande premium (semi-transparent)
# ============================================================
echo "📝 5️⃣ Creando: Logo grande premium..."
convert logo-source.svg \
  -resize 900x900 \
  -alpha set \
  -channel A \
  -evaluate multiply 0.25 \
  +channel \
  -background none \
  -gravity center \
  -extent 1536x1536 \
  logo-watermark-v2-premium.png 2>/dev/null && echo "✅ Logo-watermark-v2-premium.png" || echo "❌ Error"

echo ""
echo "✅ Marcas de agua generadas desde SVG:"
ls -lh logo-watermark-v2-*.png 2>/dev/null | awk '{print "   📦 " $9 " (" $5 ")"}'

echo ""
echo "📋 Nuevas opciones disponibles:"
echo "   1️⃣  Minimalista: logo-watermark-v2-minimal.png (8% opacidad)"
echo "   2️⃣  Esquina: logo-watermark-v2-corner.png (50% opacidad)"
echo "   3️⃣  Patrón: logo-watermark-v2-pattern.png (12% opacidad)"
echo "   4️⃣  Diagonal: logo-watermark-v2-diagonal.png (15% opacidad)"
echo "   5️⃣  Premium: logo-watermark-v2-premium.png (25% opacidad)"
