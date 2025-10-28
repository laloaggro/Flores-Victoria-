#!/bin/bash

# 🎨 Ejemplos de generación con prompts optimizados
# Usa las técnicas de PROMPT_ENGINEERING_GUIDE.md

API_URL="http://localhost:3000/api/ai-images/generate"

echo "🎨 Ejemplos de Prompt Engineering para Flores"
echo "=============================================="
echo ""

# Función helper para generar
generate() {
  local name="$1"
  local prompt="$2"
  local negative="$3"
  local width="${4:-1024}"
  local height="${5:-1024}"
  
  echo "📸 Generando: $name"
  echo "   Prompt: ${prompt:0:80}..."
  
  response=$(curl -s -X POST "$API_URL" \
    -H "Content-Type: application/json" \
    -d "{
      \"prompt\": \"$prompt\",
      \"negative_prompt\": \"$negative\",
      \"width\": $width,
      \"height\": $height,
      \"steps\": 30,
      \"guidance_scale\": 7.5,
      \"provider\": \"auto\"
    }")
  
  if echo "$response" | grep -q '"success":true'; then
    filename=$(echo "$response" | jq -r '.filename')
    echo "   ✅ Guardada: $filename"
  else
    error=$(echo "$response" | jq -r '.error // .message // "Unknown error"')
    echo "   ❌ Error: $error"
  fi
  echo ""
}

# EJEMPLO 1: E-commerce Professional
echo "═══ EJEMPLO 1: Producto E-commerce ═══"
generate "Rosas E-commerce" \
  "professional product photography of dozen premium red roses in elegant bouquet arrangement, isolated on pure white background, studio softbox lighting, valentine's day style, commercial florist quality, high detail, 8k resolution, sharp focus, vibrant natural colors" \
  "vase, pot, container, dark background, shadows, blurry, low quality, watermark, text, artificial, plastic, wilted, dead flowers"

sleep 3

# EJEMPLO 2: Artístico Romántico
echo "═══ EJEMPLO 2: Artístico Romántico ═══"
generate "Rosas Artísticas" \
  "dreamy romantic red roses in soft focus, bokeh background, golden hour lighting, pastel color palette, fine art photography, ethereal atmosphere, delicate and elegant, professional nature photography, cinematic composition, warm tones" \
  "ugly, deformed, harsh lighting, oversaturated, cartoon, 3d render, low quality, artificial" \
  1920 1080

sleep 3

# EJEMPLO 3: Macro Details
echo "═══ EJEMPLO 3: Macro Close-up ═══"
generate "Tulipán Macro" \
  "extreme macro photography of pink tulip petals with morning dew droplets, intricate petal texture, shallow depth of field, soft natural lighting, botanical art style, professional macro lens photography, ultra detailed, 8k quality, delicate organic texture" \
  "blurry, out of focus, low detail, grainy, noisy, artificial, plastic"

sleep 3

# EJEMPLO 4: Arreglo Premium
echo "═══ EJEMPLO 4: Arreglo en Jarrón Premium ═══"
generate "Arreglo Premium" \
  "luxury mixed flower arrangement in elegant crystal vase, white roses and lilies, premium florist composition, natural window lighting, sophisticated aesthetic, high-end wedding bouquet style, refined and pristine, commercial photography, detailed flowers and greenery" \
  "cheap vase, plastic, artificial flowers, messy arrangement, wilted, dead flowers, dark, gloomy, low quality, cluttered background" \
  768 1024

sleep 3

# EJEMPLO 5: Hero Background
echo "═══ EJEMPLO 5: Hero Background Desenfocado ═══"
generate "Hero Background" \
  "dreamy blurred pastel flower background, soft focus bokeh, pink and white color palette, minimal composition, ethereal lighting, professional photography, elegant aesthetic, high resolution banner background, subtle and calming atmosphere" \
  "sharp focus, busy pattern, cluttered, text, people, low quality, pixelated, artificial, harsh colors" \
  1920 1080

sleep 3

# EJEMPLO 6: Cumpleaños Alegre
echo "═══ EJEMPLO 6: Ramo de Cumpleaños ═══"
generate "Cumpleaños Alegre" \
  "cheerful colorful birthday flower bouquet, vibrant mixed flowers including yellow sunflowers orange gerberas pink roses, happy celebration style, bright natural colors, professional florist arrangement, white background, festive and energetic mood, high quality product photography" \
  "sad colors, dull, wilted, cheap, messy, dark, gloomy, artificial, plastic flowers"

sleep 3

# EJEMPLO 7: Minimalista Zen
echo "═══ EJEMPLO 7: Estilo Minimalista ═══"
generate "Orquídea Minimalista" \
  "single white phalaenopsis orchid on pure white background, minimalist zen aesthetic, clean simple composition, elegant exotic flower, soft diffused lighting, luxury premium style, high-end product shot, pristine and refined, ultra detailed petals" \
  "busy, cluttered, colorful, multiple flowers, vase, container, dark, shadows, low quality, artificial"

sleep 3

# EJEMPLO 8: Condolencias Serio
echo "═══ EJEMPLO 8: Arreglo de Condolencias ═══"
generate "Condolencias" \
  "serene white lilies and chrysanthemums arrangement, sympathy flowers bouquet, peaceful elegant composition, respectful tribute, clean white background, professional funeral florist quality, dignified and calming mood, soft natural lighting, subtle and tasteful" \
  "colorful, cheerful, bright, happy, festive, vibrant, casual, messy, artificial" \
  768 1024

echo ""
echo "✨ ¡Ejemplos completados!"
echo ""
echo "📁 Revisa las imágenes en: services/ai-image-service/cache/images/"
echo ""
echo "💡 Tips:"
echo "   • Compara las diferentes técnicas aplicadas"
echo "   • Nota cómo los negative prompts afectan el resultado"
echo "   • Observa la diferencia entre estilos (e-commerce vs artístico)"
echo "   • Analiza qué dimensiones funcionan mejor para cada uso"
echo ""
echo "📚 Lee más en: docs/PROMPT_ENGINEERING_GUIDE.md"
echo ""
