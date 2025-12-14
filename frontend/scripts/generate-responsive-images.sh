#!/bin/bash
# Generate responsive images for better Lighthouse scores
# Creates 320w, 480w versions of product images

set -e

IMAGES_DIR="${1:-/home/impala/Documentos/Proyectos/flores-victoria/frontend/images/products/final}"
OUTPUT_DIR="${IMAGES_DIR}"

echo "=== Generating Responsive Images ==="
echo "Source: $IMAGES_DIR"

# Check for required tools
if ! command -v cwebp &> /dev/null; then
    echo "Error: cwebp not found. Install with: apt install webp"
    exit 1
fi

# Process each webp image
for img in "$IMAGES_DIR"/*.webp; do
    [ -f "$img" ] || continue
    
    filename=$(basename "$img" .webp)
    
    # Skip if already a responsive variant
    if [[ "$filename" == *"-320w" ]] || [[ "$filename" == *"-480w" ]]; then
        continue
    fi
    
    # Get original dimensions
    original_width=$(identify -format "%w" "$img" 2>/dev/null || echo "640")
    
    # Only create smaller versions if original is large enough
    if [ "$original_width" -gt 480 ]; then
        # Create 480w version
        if [ ! -f "${OUTPUT_DIR}/${filename}-480w.webp" ]; then
            cwebp -q 80 -resize 480 0 "$img" -o "${OUTPUT_DIR}/${filename}-480w.webp" 2>/dev/null && \
            echo "Created: ${filename}-480w.webp"
        fi
    fi
    
    if [ "$original_width" -gt 320 ]; then
        # Create 320w version
        if [ ! -f "${OUTPUT_DIR}/${filename}-320w.webp" ]; then
            cwebp -q 80 -resize 320 0 "$img" -o "${OUTPUT_DIR}/${filename}-320w.webp" 2>/dev/null && \
            echo "Created: ${filename}-320w.webp"
        fi
    fi
done

echo "=== Responsive Images Complete ==="
echo "Generated images saved to: $OUTPUT_DIR"

# Show size comparison
echo ""
echo "=== Size Summary ==="
du -sh "$IMAGES_DIR"/*.webp 2>/dev/null | head -20
