#!/bin/bash

# 🚀 Genera 10 imágenes RÁPIDAS con Hugging Face
# Tiempo estimado: 1-3 minutos total (vs 1-2 horas con AI Horde)

# Ensure we run from repo root regardless of where the script is called
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="${SCRIPT_DIR}/.."
cd "$REPO_ROOT" || {
  echo "❌ No se pudo cambiar al directorio raíz del repo: $REPO_ROOT" >&2
  exit 1
}

# Quick checks
command -v curl >/dev/null 2>&1 || { echo "❌ curl no está instalado" >&2; exit 127; }
command -v jq >/dev/null 2>&1 || { echo "❌ jq no está instalado (requerido para parsear JSON)" >&2; exit 127; }

API_URL="http://localhost:3000/api/ai-images/generate"

echo "🚀 Generando 10 muestras con Hugging Face (RÁPIDO)"
echo "⚡ Tiempo estimado: 5-15 segundos por imagen"
echo ""

# Array de prompts variados
declare -a PROMPTS=(
  "red roses bouquet on white background, professional photography"
  "pink tulips arrangement, elegant vase, natural lighting"
  "yellow sunflowers bunch, rustic style, bright colors"
  "white lilies with green leaves, minimalist composition"
  "purple lavender field close-up, soft focus"
  "orange gerbera daisies scattered, vibrant colors, white surface"
  "mixed pastel flowers bouquet, romantic style"
  "single elegant orchid flower, macro photography"
  "colorful wildflowers meadow, natural outdoor setting"
  "premium white roses with baby breath, luxury arrangement"
)

count=1
total=${#PROMPTS[@]}
success=0
failed=0

for prompt in "${PROMPTS[@]}"; do
  echo "[$count/$total] Generando: ${prompt:0:50}..."
  
  response=$(curl -s -X POST "$API_URL" \
    -H "Content-Type: application/json" \
    -d "{
      \"prompt\": \"$prompt\",
      \"width\": 1024,
      \"height\": 1024,
      \"model\": \"flux-schnell\",
      \"provider\": \"huggingface\"
    }")
  
  filename=$(echo "$response" | jq -r '.filename // "error"')
  
  if [ "$filename" != "error" ] && [ "$filename" != "null" ]; then
    size=$(echo "$response" | jq -r '.size // "unknown"')
    echo "   ✅ $filename ($size KB)"
    ((success++))
  else
    error_msg=$(echo "$response" | jq -r '.message // .error // "unknown error"')
    echo "   ❌ Error: $error_msg"
    ((failed++))
  fi
  
  echo ""
  ((count++))
  
  # Pequeña pausa entre requests
  sleep 2
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Completado: $success exitosas, $failed fallidas"
echo ""
echo "📁 Imágenes en: services/ai-image-service/cache/images/"
echo ""
echo "Ver las generadas:"
echo "  ls -lht /home/impala/Documentos/Proyectos/flores-victoria/services/ai-image-service/cache/images/ | head -15"
