#!/bin/bash

echo "🧪 PRUEBA RÁPIDA DEL SITIO"
echo "=========================="
echo ""

# Verificar que el servidor está corriendo
if ! netstat -tuln | grep -q ":5173"; then
    echo "❌ El servidor frontend no está corriendo"
    echo "Por favor inicia el servidor con: npm run dev"
    exit 1
fi

echo "✅ Servidor frontend: http://localhost:5173"
echo ""
echo "📍 URLs para probar:"
echo "   Inicio:     http://localhost:5173/index.html"
echo "   Productos:  http://localhost:5173/pages/products.html"
echo "   Sobre:      http://localhost:5173/pages/about.html"
echo "   Contacto:   http://localhost:5173/pages/contact.html"
echo "   Login:      http://localhost:5173/pages/login.html"
echo "   Admin:      http://localhost:5173/pages/admin.html"
echo "   Carrito:    http://localhost:5173/pages/cart.html"
echo ""
echo "🔍 Checklist de prueba visual:"
echo "   [ ] Logo visible en todas las páginas"
echo "   [ ] Colores consistentes (verde frontend / morado admin)"
echo "   [ ] Navegación funciona con absolute paths"
echo "   [ ] Botones tienen hover effects"
echo "   [ ] Responsive en móvil"
echo "   [ ] Sin errores en consola del navegador"
echo ""
