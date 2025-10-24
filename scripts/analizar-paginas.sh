#!/bin/bash

echo "📊 ANÁLISIS DE PÁGINAS PARA REORGANIZACIÓN"
echo "=========================================="
echo ""

BASE_DIR="/home/impala/Documentos/Proyectos/flores-victoria/frontend/pages"

echo "🔍 SITUACIÓN ACTUAL:"
echo "===================="
echo ""

# Contar páginas actuales
TOTAL_PAGES=$(find "$BASE_DIR" -name "*.html" -not -name "*backup*" | wc -l)
echo "📈 Total de páginas: $TOTAL_PAGES"
echo ""

# Análisis por categorías
echo "📋 CATEGORIZACIÓN SUGERIDA:"
echo "============================"
echo ""

echo "👤 AUTENTICACIÓN (5 páginas):"
echo "   • login.html"
echo "   • register.html" 
echo "   • forgot-password.html"
echo "   • reset-password.html"
echo "   • new-password.html"
echo ""

echo "🛍️  E-COMMERCE (5 páginas):"
echo "   • products.html"
echo "   • product-detail.html"
echo "   • catalog.html"
echo "   • cart.html"
echo "   • checkout.html"
echo ""

echo "👤 PANEL USUARIO (5 páginas):"
echo "   • profile.html"
echo "   • orders.html"
echo "   • order-detail.html"
echo "   • invoice.html"
echo "   • shipping.html"
echo ""

echo "🔧 ADMINISTRACIÓN (5 páginas):"
echo "   • admin.html → dashboard.html"
echo "   • admin-orders.html → orders.html"
echo "   • admin-products.html → products.html"
echo "   • admin-users.html → users.html"
echo "   • server-admin.html → server.html"
echo ""

echo "📋 INFORMACIÓN LEGAL (2 páginas):"
echo "   • terms.html"
echo "   • privacy.html"
echo ""

echo "ℹ️  INFORMACIÓN CORPORATIVA (3 páginas):"
echo "   • about.html"
echo "   • contact.html"
echo "   • testimonials.html"
echo ""

echo "🆘 SOPORTE (2 páginas):"
echo "   • faq.html"
echo "   • sitemap.html"
echo ""

echo "🛠️  DESARROLLO (3 páginas):"
echo "   • test-styles.html"
echo "   • footer-demo.html"
echo "   • example-improved.html"
echo ""

# Contar wishlist
WISHLIST_COUNT=$(find "$BASE_DIR" -name "wishlist*.html" -not -name "*backup*" | wc -l)
echo "💝 WISHLIST ($WISHLIST_COUNT páginas):"
find "$BASE_DIR" -name "wishlist*.html" -not -name "*backup*" | sort | sed 's|.*/||' | sed 's/^/   • /'
echo ""

echo "🎯 ESTRUCTURA PROPUESTA:"
echo "========================"
echo ""
echo "frontend/pages/"
echo "├── auth/           # 👤 Autenticación (5)"
echo "├── shop/           # 🛍️  E-commerce (5)"
echo "├── user/           # 👤 Panel usuario (5)"
echo "├── admin/          # 🔧 Administración (5)"
echo "├── legal/          # 📋 Legal (2)"
echo "├── info/           # ℹ️  Corporativa (3)"
echo "├── support/        # 🆘 Soporte (2)"
echo "├── dev/            # 🛠️  Desarrollo (3)"
echo "└── wishlist/       # 💝 Lista deseos ($WISHLIST_COUNT)"
echo ""

echo "✅ BENEFICIOS DE LA REORGANIZACIÓN:"
echo "=================================="
echo ""
echo "📁 Organización lógica por funcionalidad"
echo "🔍 Fácil localización de archivos"
echo "🛠️  Mejor mantenibilidad del código"
echo "👥 Facilita el trabajo en equipo"
echo "📊 Estructura escalable para crecimiento"
echo "🎯 Separación clara de responsabilidades"
echo "⚡ Mejora la experiencia del desarrollador"
echo ""

echo "⚠️  CONSIDERACIONES:"
echo "===================="
echo ""
echo "🔗 Se deben actualizar todos los enlaces internos"
echo "📝 Actualizar el sitemap.xml"
echo "🔧 Modificar configuraciones de build (Vite)"
echo "📊 Actualizar rutas en el admin panel"
echo "🧪 Ajustar tests que referencien rutas"
echo ""

echo "🚀 SIGUIENTE PASO:"
echo "=================="
echo ""
echo "Para proceder con la reorganización, ejecuta:"
echo "   ./scripts/reorganizar-paginas.sh"
echo ""