#!/usr/bin/env bash
set -euo pipefail

# Config
ROOT="/home/impala/Documentos/Proyectos/flores-victoria"
IMG_DIR="$ROOT/frontend/public/images"
SRC_DIR="$IMG_DIR/productos"
OUT_JPG="$IMG_DIR/flowers-scatter.jpg"
OUT_WEBP="$IMG_DIR/flowers-scatter.webp"
WORK_DIR="$IMG_DIR/tmp_scatter"
CANVAS_W=1536
CANVAS_H=1024
COUNT=14   # number of elements to scatter

mkdir -p "$WORK_DIR"
rm -f "$WORK_DIR"/* || true

# Pick diverse sources (prefer '*-001-v3.webp')
mapfile -t SOURCES < <(ls -1 "$SRC_DIR"/victoria-*-001-v3.webp 2>/dev/null | sort | head -n 20)

if [ ${#SOURCES[@]} -lt 6 ]; then
  echo "❌ No hay suficientes imágenes base en $SRC_DIR"
  exit 1
fi

# Helper: rounded corners mask
MASK="$WORK_DIR/mask.png"
convert -size 900x900 xc:none -draw "roundrectangle 0,0 900,900 90,90" "$MASK"

# Create white canvas
convert -size ${CANVAS_W}x${CANVAS_H} xc:white "$OUT_JPG"

# Random seed
RANDOM_SEED=$(date +%s)
RANDOM=$RANDOM_SEED

# Generate scattered elements
for i in $(seq 1 $COUNT); do
  src_idx=$(( RANDOM % ${#SOURCES[@]} ))
  src="${SOURCES[$src_idx]}"

  # random size 260..420 px
  size=$(( 260 + RANDOM % 160 ))
  # random rotation -25..25
  rot=$(( (RANDOM % 51) - 25 ))
  # random position with margins
  x=$(( 40 + RANDOM % (CANVAS_W - size - 80) ))
  y=$(( 40 + RANDOM % (CANVAS_H - size - 80) ))

  item="$WORK_DIR/item_$i.png"

  # prepare: resize square, apply rounded mask, slight boost, shadow
  convert "$src" -resize ${size}x${size}^ -gravity center -extent ${size}x${size} \
    -modulate 102,108,102 -unsharp 0x0.5 \
    \( +clone -alpha extract \) \( "$MASK" -resize ${size}x${size}! \) \
    -compose copyopacity -composite \
    -background none -rotate $rot \
    \( +clone -background black -shadow 40x3+0+6 \) +swap -background none -layers merge +repage \
    "$item"

  # composite onto canvas
  convert "$OUT_JPG" "$item" -geometry +${x}+${y} -compose over -composite "$OUT_JPG"

done

# Export webp optimized
cwebp -quiet -q 85 "$OUT_JPG" -o "$OUT_WEBP"

# Report
ls -lh "$OUT_JPG" "$OUT_WEBP" | awk '{print "📦 " $9 " (" $5 ")"}'
