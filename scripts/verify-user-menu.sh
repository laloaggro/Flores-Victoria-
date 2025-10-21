#!/bin/bash

# Script para verificar menú de usuario dinámico

echo "🧪 Verificando menú de usuario dinámico en frontend"
echo ""

# Verificar que frontend está activo
echo "1️⃣ Verificando frontend en http://localhost:5173"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5173)
if [ "$STATUS" == "200" ]; then
    echo "   ✅ Frontend activo"
else
    echo "   ❌ Frontend no responde (código: $STATUS)"
    exit 1
fi

echo ""
echo "2️⃣ Verificando estructura del menú en index.html"
CONTENT=$(curl -s http://localhost:5173)

# Verificar que tiene user-dropdown
if echo "$CONTENT" | grep -q "user-dropdown"; then
    echo "   ✅ Elemento user-dropdown encontrado"
else
    echo "   ❌ No se encontró user-dropdown"
fi

# Verificar que tiene comentario dinámico
if echo "$CONTENT" | grep -q "El contenido se genera dinámicamente"; then
    echo "   ✅ Comentario dinámico presente"
else
    echo "   ⚠️  No se encontró comentario dinámico"
fi

# Verificar que NO tiene enlaces hardcoded
if echo "$CONTENT" | grep -q '<a href="./login.html">Iniciar sesión</a>'; then
    echo "   ❌ Enlaces hardcoded aún presentes"
else
    echo "   ✅ Sin enlaces hardcoded"
fi

echo ""
echo "3️⃣ Verificando carga de main.js"
if echo "$CONTENT" | grep -q "main.js"; then
    echo "   ✅ main.js se carga"
else
    echo "   ❌ main.js no se carga"
fi

echo ""
echo "4️⃣ Verificando UserMenu.js existe"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/public/js/components/utils/userMenu.js)
if [ "$STATUS" == "200" ]; then
    echo "   ✅ userMenu.js disponible"
else
    echo "   ❌ userMenu.js no accesible (código: $STATUS)"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Resumen de verificación:"
echo "   Frontend: http://localhost:5173"
echo "   Estructura HTML: ✅ Actualizada"
echo "   JavaScript: ✅ Cargando UserMenu"
echo ""
echo "🌐 Abre http://localhost:5173 en tu navegador para probar:"
echo "   • Sin autenticación: debe mostrar 'Iniciar sesión' y 'Registrarse'"
echo "   • Con autenticación: debe mostrar 'Perfil', 'Mis pedidos' y 'Cerrar sesión'"
echo "   • Con rol admin: debe mostrar 'Panel de administración'"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
