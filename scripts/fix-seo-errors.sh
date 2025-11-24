#!/bin/bash

# Script para corregir errores SEO detectados por validación
# Flores Victoria - 24 de noviembre de 2025

echo "🔧 Iniciando correcciones SEO..."
echo "================================"

FRONTEND_DIR="/home/impala/Documentos/Proyectos/flores-victoria/frontend"
PAGES_DIR="$FRONTEND_DIR/pages"

# Función para agregar Twitter Cards a un archivo
add_twitter_cards() {
    local file=$1
    local title=$2
    local description=$3
    local url=$4
    
    echo "  📝 Agregando Twitter Cards a: $(basename $file)"
    
    # Verificar si ya tiene twitter:card
    if grep -q 'twitter:card' "$file"; then
        # Corregir property por name si existe
        sed -i 's/<meta property="twitter:/<meta name="twitter:/g' "$file"
        echo "    ✅ Twitter Cards corregidos (property → name)"
    else
        # Buscar la línea después de og:image
        local line_num=$(grep -n 'property="og:image"' "$file" | cut -d: -f1 | tail -1)
        if [ -n "$line_num" ]; then
            # Insertar después de og:image
            sed -i "${line_num}a\\    \\n    <!-- Twitter Cards -->\\n    <meta name=\"twitter:card\" content=\"summary_large_image\">\\n    <meta name=\"twitter:url\" content=\"$url\">\\n    <meta name=\"twitter:title\" content=\"$title\">\\n    <meta name=\"twitter:description\" content=\"$description\">\\n    <meta name=\"twitter:image\" content=\"https://flores-victoria.com/images/og-image.jpg\">" "$file"
            echo "    ✅ Twitter Cards agregados"
        fi
    fi
}

# Homepage - solo corregir property por name
echo "🏠 Homepage..."
sed -i 's/<meta property="twitter:/<meta name="twitter:/g' "$FRONTEND_DIR/index.html"
echo "  ✅ Corregido"

# Products
echo "📚 Products..."
add_twitter_cards "$PAGES_DIR/products.html" \
    "Productos - Flores y Arreglos | Flores Victoria" \
    "Explora nuestro catálogo completo de arreglos florales. Rosas, tulipanes, bouquets y más." \
    "https://flores-victoria.com/pages/products.html"

# About
echo "ℹ️  About..."
add_twitter_cards "$PAGES_DIR/about.html" \
    "Sobre Nosotros | Flores Victoria" \
    "Conoce la historia de Flores Victoria. Más de 10 años creando momentos especiales con arreglos florales únicos." \
    "https://flores-victoria.com/pages/about.html"

# Contact
echo "📞 Contact..."
add_twitter_cards "$PAGES_DIR/contact.html" \
    "Contacto | Flores Victoria" \
    "Contáctanos para pedidos personalizados, cotizaciones y más información. Atención al cliente de lunes a domingo." \
    "https://flores-victoria.com/pages/contact.html"

# FAQ
echo "❓ FAQ..."
add_twitter_cards "$PAGES_DIR/faq.html" \
    "Preguntas Frecuentes | Flores Victoria" \
    "Encuentra respuestas a las preguntas más comunes sobre nuestros servicios, entregas, pagos y cuidado de flores." \
    "https://flores-victoria.com/pages/faq.html"

# Blog
echo "📝 Blog..."
add_twitter_cards "$PAGES_DIR/blog.html" \
    "Blog | Flores Victoria" \
    "Consejos, tendencias y guías sobre el cuidado de flores y arreglos florales. Inspiración para cada ocasión." \
    "https://flores-victoria.com/pages/blog.html"

# Cart
echo "🛒 Cart..."
add_twitter_cards "$PAGES_DIR/cart.html" \
    "Carrito de Compras | Flores Victoria" \
    "Revisa tu carrito y completa tu pedido de arreglos florales. Entrega gratis en compras mayores a $500 MXN." \
    "https://flores-victoria.com/pages/cart.html"

# Checkout
echo "💳 Checkout..."
add_twitter_cards "$PAGES_DIR/checkout.html" \
    "Finalizar Compra | Flores Victoria" \
    "Completa tu pedido de forma segura. Aceptamos tarjetas de crédito, débito y pagos en efectivo." \
    "https://flores-victoria.com/pages/checkout.html"

# Login
echo "🔐 Login..."
add_twitter_cards "$PAGES_DIR/login.html" \
    "Iniciar Sesión | Flores Victoria" \
    "Accede a tu cuenta para ver historial de pedidos, guardar favoritos y disfrutar de beneficios exclusivos." \
    "https://flores-victoria.com/pages/login.html"

# Register
echo "📝 Register..."
add_twitter_cards "$PAGES_DIR/register.html" \
    "Crear Cuenta | Flores Victoria" \
    "Regístrate para acceder a descuentos exclusivos, promociones especiales y seguimiento de pedidos." \
    "https://flores-victoria.com/pages/register.html"

# Private pages (solo corregir si existen)
if [ -f "$PAGES_DIR/account.html" ]; then
    echo "👤 Account..."
    sed -i 's/<meta property="twitter:/<meta name="twitter:/g' "$PAGES_DIR/account.html" 2>/dev/null
fi

if [ -f "$PAGES_DIR/orders.html" ]; then
    echo "📦 Orders..."
    sed -i 's/<meta property="twitter:/<meta name="twitter:/g' "$PAGES_DIR/orders.html" 2>/dev/null
fi

if [ -f "$PAGES_DIR/profile.html" ]; then
    echo "🆔 Profile..."
    sed -i 's/<meta property="twitter:/<meta name="twitter:/g' "$PAGES_DIR/profile.html" 2>/dev/null
fi

echo ""
echo "================================"
echo "✅ Correcciones completadas!"
echo ""
echo "📊 Re-ejecuta el validador para verificar:"
echo "   node scripts/validate-seo.js"
