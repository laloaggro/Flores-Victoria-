#!/bin/bash

# Script para facilitar testing manual del sitio en desarrollo
# Abre URLs útiles para validación

echo "🧪 INICIANDO TESTING MANUAL - ARREGLOS VICTORIA"
echo "══════════════════════════════════════════════════════════"
echo ""

BASE_URL="http://localhost:5173"

# Verificar que el servidor esté corriendo
if ! curl -s "$BASE_URL" > /dev/null 2>&1; then
    echo "❌ Error: El servidor no está corriendo en puerto 5173"
    echo ""
    echo "Inicia el servidor con:"
    echo "  cd frontend && python3 -m http.server 5173"
    echo "  O: npm run dev"
    exit 1
fi

echo "✅ Servidor activo en $BASE_URL"
echo ""
echo "📋 URLs para testing manual:"
echo "─────────────────────────────────────────────────────────"
echo ""
echo "🎯 CHECKLIST INTERACTIVO:"
echo "   $BASE_URL/checklist-validacion.html"
echo ""
echo "🏠 PÁGINAS PRINCIPALES:"
echo "   $BASE_URL/index.html"
echo "   $BASE_URL/pages/products.html"
echo "   $BASE_URL/pages/about.html"
echo "   $BASE_URL/pages/contact.html"
echo ""
echo "📱 ARCHIVOS PWA:"
echo "   $BASE_URL/manifest.json"
echo "   $BASE_URL/sw.js"
echo ""
echo "🖼️  LOGO E ICONOS:"
echo "   $BASE_URL/logo.svg"
echo "   $BASE_URL/icons/icon-512x512.png"
echo ""
echo "══════════════════════════════════════════════════════════"
echo ""

# Preguntar si abrir en navegador
read -p "¿Abrir checklist interactivo en el navegador? (s/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Ss]$ ]]; then
    echo "🚀 Abriendo navegador..."
    
    # Detectar navegador disponible
    if command -v google-chrome &> /dev/null; then
        google-chrome "$BASE_URL/checklist-validacion.html" &
    elif command -v chromium-browser &> /dev/null; then
        chromium-browser "$BASE_URL/checklist-validacion.html" &
    elif command -v firefox &> /dev/null; then
        firefox "$BASE_URL/checklist-validacion.html" &
    elif command -v xdg-open &> /dev/null; then
        xdg-open "$BASE_URL/checklist-validacion.html" &
    else
        echo "⚠️  No se pudo detectar navegador. Abre manualmente:"
        echo "   $BASE_URL/checklist-validacion.html"
    fi
    
    echo ""
    echo "✅ Navegador abierto"
fi

echo ""
echo "📝 GUÍA RÁPIDA DE TESTING:"
echo "─────────────────────────────────────────────────────────"
echo "1. Logo y Branding:"
echo "   • Verificar logo en header (esquina superior)"
echo "   • Verificar colores verde #2d5016"
echo ""
echo "2. Datos de Negocio:"
echo "   • Scroll al footer"
echo "   • Verificar email: arreglosvictoriafloreria@gmail.com"
echo "   • Verificar teléfono: +56 9 6360 3177"
echo "   • Click en enlaces Facebook/Instagram"
echo ""
echo "3. PWA (Chrome DevTools - F12):"
echo "   • Application → Manifest → Verificar iconos"
echo "   • Application → Service Workers → Ver 'activated'"
echo "   • Network → Offline → Recargar (página offline)"
echo ""
echo "4. Performance:"
echo "   • Network → Img → Verificar archivos .webp"
echo "   • Lighthouse → Run audit"
echo ""
echo "5. UX:"
echo "   • Scroll abajo → Botón 'scroll to top' aparece"
echo "   • Agregar producto → Toast notification"
echo "   • Navegación suave entre secciones"
echo ""
echo "══════════════════════════════════════════════════════════"
echo ""
echo "💡 TIP: Usa el checklist interactivo para marcar progreso"
echo "   Guarda estado automáticamente en el navegador"
echo ""
