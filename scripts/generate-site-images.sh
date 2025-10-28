#!/usr/bin/env bash
set -euo pipefail

# Generate responsive WebP images for site assets (excluding product images)
# Default root: frontend/public/images
# Excludes: productos/, products/, *.svg, favicons, logos (logo.*), watermark files
# Requires: ImageMagick (convert or magick)

ROOT_DIR=${1:-"$(pwd)/frontend/public/images"}
SIZES_CSV=${SIZES:-"2560,1920,1280,960,640"}
QUALITY=${QUALITY:-"82"}

if [[ ! -d "$ROOT_DIR" ]]; then
  echo "❌ Root directory not found: $ROOT_DIR" >&2
  exit 1
fi

# Resolve ImageMagick binary
IM_BIN=""
if command -v magick >/dev/null 2>&1; then
  IM_BIN="magick"
elif command -v convert >/dev/null 2>&1; then
  IM_BIN="convert"
else
  echo "❌ ImageMagick not found. Install 'imagemagick' (convert or magick)." >&2
  exit 2
fi

IFS=',' read -r -a SIZES <<< "$SIZES_CSV"

echo "🔧 Generando variantes WebP"
echo "   Raíz: $ROOT_DIR"
echo "   Tamaños: ${SIZES_CSV} (px)"
echo "   Calidad: ${QUALITY}"
echo

shopt -s globstar nullglob

total_processed=0
total_created=0
skipped_small=0
skipped_exists=0

should_exclude() {
  local f="$1"
  # Excluir productos y products, SVGs, favicons, logos, watermark assets
  [[ "$f" == *"/productos/"* ]] && return 0
  [[ "$f" == *"/products/"* ]] && return 0
  [[ "$f" == *.svg ]] && return 0
  [[ "$f" == *"/favicon"* ]] && return 0
  [[ "$f" == *"/logo."* ]] && return 0
  [[ "$f" == *"logo-watermark"* ]] && return 0
  return 1
}

get_width() {
  local img="$1"
  # Identify width
  identify -format "%w" "$img" 2>/dev/null || echo 0
}

process_image() {
  local src="$1"
  local dir base ext width
  dir="$(dirname "$src")"
  base="$(basename "$src")"
  ext="${base##*.}"
  base="${base%.*}"

  width="$(get_width "$src")"
  if [[ "$width" -eq 0 ]]; then
    echo "   ⚠️  No se pudo obtener el ancho de: $src (saltando)"
    return
  fi

  total_processed=$((total_processed+1))

  # Generar versión base .webp (mismo ancho)
  local out_base="${dir}/${base}.webp"
  if [[ -f "$out_base" && "$out_base" -nt "$src" ]]; then
    : # existente y actualizado
  else
    $IM_BIN "$src" -quality "$QUALITY" -strip "$out_base"
    total_created=$((total_created+1))
    echo "   ➕ $out_base"
  fi

  # Generar variantes por ancho
  for w in "${SIZES[@]}"; do
    if (( w >= width )); then
      # No crear tamaños mayores al original
      skipped_small=$((skipped_small+1))
      continue
    fi
    local out_file="${dir}/${base}-w${w}.webp"
    if [[ -f "$out_file" && "$out_file" -nt "$src" ]]; then
      skipped_exists=$((skipped_exists+1))
      continue
    fi
    $IM_BIN "$src" -resize ${w}x -quality "$QUALITY" -strip "$out_file"
    total_created=$((total_created+1))
    echo "   ➕ $out_file"
  done
}

while IFS= read -r -d '' file; do
  if should_exclude "$file"; then
    continue
  fi
  case "$file" in
    *.jpg|*.jpeg|*.png|*.JPG|*.JPEG|*.PNG)
      process_image "$file"
      ;;
    *) ;;
  esac
done < <(find "$ROOT_DIR" -type f -print0)

echo
echo "📊 Resumen"
echo "   Archivos inspeccionados: $total_processed"
echo "   Variantes creadas:       $total_created"
echo "   Omitidos (mayor/igual al original): $skipped_small"
echo "   Omitidos (ya existían y recientes): $skipped_exists"
echo "✅ Completado"
