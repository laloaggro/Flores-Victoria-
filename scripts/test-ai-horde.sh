#!/bin/bash

# 🎨 Prueba Rápida de AI Horde
# Este script genera una imagen de prueba pequeña

echo "🎨 Generando imagen de prueba con AI Horde..."
echo "   (Esto puede tomar 30-600 segundos dependiendo de la cola)"
echo ""

curl -X POST http://localhost:3000/api/ai-images/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "three red roses on white background, simple product photo",
    "width": 512,
    "height": 512,
    "steps": 15,
    "model": "stable_diffusion_xl"
  }' | jq .

echo ""
echo "✅ Si ves 'success': true, revisa:"
echo "   - URL remota en el campo 'url'"
echo "   - Archivo local en services/ai-image-service/cache/images/"
echo "   - URL pública en /images/productos/{filename}"
