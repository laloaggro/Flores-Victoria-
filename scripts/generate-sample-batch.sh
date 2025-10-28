#!/bin/bash

# 🎨 Genera 10 imágenes de muestra variadas con AI Horde
# Optimizado para cola más rápida (512x512, SDXL, 15 steps)

API_URL="http://localhost:3000/api/ai-images/generate"
OUTPUT_DIR="/home/impala/Documentos/Proyectos/flores-victoria/services/ai-image-service/cache/images"

echo "🎨 Generando 10 muestras variadas de flores con AI Horde"
echo "⚙️  Parámetros optimizados: 512x512, Deliberate model, 20 steps"
echo "⏱️  Tiempo estimado: 3-8 min en cola actual"
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

# Contador
count=1
total=${#PROMPTS[@]}

# Generar cada imagen
for prompt in "${PROMPTS[@]}"; do
  echo "[$count/$total] Generando: ${prompt:0:50}..."
  
  response=$(curl -s -X POST "$API_URL" \
    -H "Content-Type: application/json" \
    -d "{
      \"prompt\": \"$prompt\",
      \"width\": 512,
      \"height\": 512,
      \"steps\": 20,
      \"model\": \"Deliberate\",
      \"provider\": \"ai-horde\"
    }")
  
  # Extraer filename si existe
  filename=$(echo "$response" | jq -r '.filename // "error"')
  
  if [ "$filename" != "error" ] && [ "$filename" != "null" ]; then
    echo "   ✅ Generada: $filename"
  else
    # Verificar si está en cola
    if echo "$response" | grep -q "Cola\|queue\|Job ID"; then
      echo "   ⏳ En cola (esto es normal, espera 30-60s entre requests)"
    else
      echo "   ❌ Error: $(echo "$response" | jq -r '.error // .message // "unknown"')"
    fi
  fi
  
  echo ""
  ((count++))
  
  # Esperar 30s entre requests para no saturar (excepto el último)
  if [ $count -le $total ]; then
    echo "   ⏸️  Esperando 30s antes del siguiente..."
    sleep 30
  fi
done

echo ""
echo "✅ Proceso completado. Revisa las imágenes en:"
echo "   $OUTPUT_DIR"
echo ""
echo "📋 Para ver las generadas:"
echo "   ls -lht $OUTPUT_DIR | head -15"
