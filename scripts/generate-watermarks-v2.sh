#!/bin/bash

# Generar nuevas marcas de agua - Versión 2
# Opciones: texto elegante, minimal, boutique, premium

echo "🎨 Generando nuevas marcas de agua..."
cd frontend/public/images

# ============================================================
# OPCIÓN 1: Marca minimalista (solo texto)
# ============================================================
echo "📝 Creando watermark minimalista..."
convert -size 1536x1536 xc:none \
  -font "Palatino-Regular" \
  -pointsize 120 \
  -fill "rgba(46,125,50,0.08)" \
  -gravity center \
  -annotate 0 "Arreglos Victoria" \
  -bordercolor none -border 0 \
  logo-watermark-minimal.png

# ============================================================
# OPCIÓN 2: Texto diagonal elegante
# ============================================================
echo "🎯 Creando watermark diagonal..."
convert -size 1536x1536 xc:none \
  -font "Palatino-Regular" \
  -pointsize 100 \
  -fill "rgba(46,125,50,0.12)" \
  -gravity center \
  -annotate -45 "Arreglos Victoria" \
  logo-watermark-diagonal.png

# ============================================================
# OPCIÓN 3: Patrón repetitivo sutil
# ============================================================
echo "🔄 Creando watermark con patrón..."
convert -size 400x200 xc:none \
  -font "Palatino-Regular" \
  -pointsize 60 \
  -fill "rgba(46,125,50,0.1)" \
  -gravity center \
  -annotate 0 "Victoria" \
  -tile 400x200 \
  -virtual-pixel white \
  -distort SRT 0 \
  miff:- | \
convert -size 1536x1536 xc:none \
  -tile miff:- \
  -fill pattern:- \
  -gravity center \
  -colorspace RGB \
  -annotate -45 "Arreglos" \
  logo-watermark-pattern.png 2>/dev/null || \
convert -size 1536x1536 xc:none \
  -font "DejaVu-Sans" \
  -pointsize 80 \
  -fill "rgba(46,125,50,0.1)" \
  -annotate 0+400+600 "Arreglos Victoria" \
  -annotate 0+500+1000 "Arreglos Victoria" \
  -annotate 0+300+1200 "Victoria" \
  logo-watermark-pattern.png

# ============================================================
# OPCIÓN 4: Marca boutique (esquina elegante)
# ============================================================
echo "💎 Creando watermark boutique..."
# Crear un logo boutique en esquina inferior derecha
convert -size 350x150 xc:none \
  -font "Palatino-Regular" \
  -pointsize 48 \
  -fill "rgba(46,125,50,0.7)" \
  -gravity center \
  -annotate 0 "® Arreglos Victoria" \
  -border 15 \
  -bordercolor "rgba(46,125,50,0.4)" \
  -border 1 \
  logo-watermark-boutique.png

# ============================================================
# OPCIÓN 5: Marca premium con borde
# ============================================================
echo "👑 Creando watermark premium..."
convert -size 400x200 xc:"rgba(46,125,50,0.08)" \
  -font "Palatino-Regular" \
  -pointsize 52 \
  -fill "rgba(46,125,50,0.6)" \
  -gravity center \
  -annotate 0 "✿ Arreglos Victoria ✿" \
  -border 10 \
  -bordercolor "rgba(46,125,50,0.15)" \
  logo-watermark-premium.png

# ============================================================
# OPCIÓN 6: Corner badge (circular)
# ============================================================
echo "🔘 Creando corner badge circular..."
convert -size 280x280 xc:none \
  -fill "rgba(46,125,50,0.65)" \
  -draw "circle 140,140 140,40" \
  -font "Palatino-Regular" \
  -pointsize 36 \
  -fill white \
  -gravity center \
  -annotate 0 "Victoria" \
  -pointsize 20 \
  -fill "rgba(255,255,255,0.8)" \
  -annotate 0+0+60 "Florería" \
  logo-watermark-badge.png

echo ""
echo "✅ Marcas de agua generadas:"
ls -lh logo-watermark-*.png | grep -E "minimal|diagonal|pattern|boutique|premium|badge" | awk '{print "   📦 " $9 " (" $5 ")"}'

echo ""
echo "📋 Opciones disponibles:"
echo "   1️⃣  Minimalista: logo-watermark-minimal.png"
echo "   2️⃣  Diagonal: logo-watermark-diagonal.png"
echo "   3️⃣  Patrón: logo-watermark-pattern.png"
echo "   4️⃣  Boutique: logo-watermark-boutique.png"
echo "   5️⃣  Premium: logo-watermark-premium.png"
echo "   6️⃣  Badge: logo-watermark-badge.png"
