#!/bin/bash

# 🎨 Guía para obtener Leonardo.ai API Key
# 150 generaciones/día GRATIS

echo "════════════════════════════════════════════════════════════════"
echo "🎨 Leonardo.ai - Configuración de API Key"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "📋 Beneficios FREE TIER:"
echo "   ✅ 150 generaciones/día (se renuevan cada 24h)"
echo "   ✅ Velocidad ultra-rápida: 3-8 segundos"
echo "   ✅ Calidad excelente (mejor que SDXL)"
echo "   ✅ Múltiples modelos optimizados"
echo "   ✅ Sin tarjeta de crédito requerida"
echo ""
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "📝 Paso 1: Crear cuenta gratuita"
echo "   1. Visita: https://leonardo.ai"
echo "   2. Click en 'Sign Up' (arriba derecha)"
echo "   3. Regístrate con email o Google"
echo "   4. Confirma tu email"
echo ""
echo "🔑 Paso 2: Obtener API Key"
echo "   1. Inicia sesión en Leonardo.ai"
echo "   2. Ve a: https://app.leonardo.ai/settings"
echo "   3. En el menú lateral, click en 'API Access'"
echo "   4. Click en 'Create API Key'"
echo "   5. Copia el token generado"
echo ""
echo "⚙️  Paso 3: Configurar en el proyecto"
echo "   1. Abre: microservices/api-gateway/.env"
echo "   2. Busca la línea: # LEONARDO_API_KEY=tu_api_key_aqui"
echo "   3. Reemplaza con: LEONARDO_API_KEY=tu_token_real"
echo "   4. Guarda el archivo"
echo ""
echo "🔄 Paso 4: Rebuild del contenedor"
echo "   Ejecuta:"
echo "   $ cd /home/impala/Documentos/Proyectos/flores-victoria"
echo "   $ docker-compose up -d --build --no-deps api-gateway"
echo ""
echo "✅ Paso 5: Verificar que funciona"
echo "   $ curl -s http://localhost:3000/api/ai-images/status | jq '.providers.leonardo'"
echo ""
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "💡 Ejemplo de uso:"
echo ""
cat << 'EOF'
curl -X POST http://localhost:3000/api/ai-images/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "beautiful red roses bouquet, professional photography",
    "width": 512,
    "height": 512,
    "provider": "leonardo"
  }'
EOF
echo ""
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "📊 Modelos disponibles:"
echo "   • leonardo-diffusion  (general, rápido)"
echo "   • photoreal          (fotorealista)"
echo "   • leonardo-creative  (artístico)"
echo "   • leonardo-signature (firma Leonardo)"
echo ""
echo "⚡ Velocidad esperada:"
echo "   • Leonardo.ai:  3-8 segundos   ⭐⭐⭐⭐⭐"
echo "   • Hugging Face: 5-15 segundos  ⭐⭐⭐⭐"
echo "   • AI Horde:     10-60 segundos ⭐⭐⭐"
echo ""
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "🔗 Enlaces útiles:"
echo "   • Dashboard: https://app.leonardo.ai"
echo "   • API Docs:  https://docs.leonardo.ai"
echo "   • Settings:  https://app.leonardo.ai/settings"
echo ""
echo "════════════════════════════════════════════════════════════════"
echo ""

read -p "¿Deseas abrir Leonardo.ai en el navegador ahora? (s/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Ss]$ ]]; then
  echo "🌐 Abriendo https://leonardo.ai ..."
  xdg-open "https://leonardo.ai" 2>/dev/null || open "https://leonardo.ai" 2>/dev/null || echo "Por favor abre: https://leonardo.ai"
fi

echo ""
echo "✨ ¡Listo! Sigue los pasos y vuelve cuando tengas tu API key."
echo ""
