#!/bin/bash

# Script para iniciar Chrome con debugging remoto
# Esto permite ver errores inmediatamente en VS Code

echo "🚀 Iniciando Chrome con debugging habilitado..."
echo ""

# Verificar si hay una instancia de Chrome ejecutándose
if pgrep -x "chrome" > /dev/null; then
    echo "⚠️  Chrome ya está ejecutándose"
    echo "💡 Cerrando Chrome existente..."
    pkill chrome
    sleep 2
fi

# Puerto para debugging
PORT_ADMIN=9222
PORT_FRONTEND=9223

# Verificar qué servicio iniciar
if [ "$1" == "admin" ]; then
    URL="http://localhost:3010"
    PORT=$PORT_ADMIN
    PROFILE="chrome-debug-admin"
    echo "📊 Iniciando Admin Panel..."
elif [ "$1" == "frontend" ]; then
    URL="http://localhost:5173"
    PORT=$PORT_FRONTEND
    PROFILE="chrome-debug-frontend"
    echo "🎨 Iniciando Frontend..."
else
    URL="http://localhost:3010"
    PORT=$PORT_ADMIN
    PROFILE="chrome-debug-admin"
    echo "📊 Por defecto: Admin Panel..."
fi

# Directorio temporal para el perfil de Chrome
TEMP_DIR="/tmp/$PROFILE"

echo ""
echo "🔧 Configuración:"
echo "   URL: $URL"
echo "   Puerto Debug: $PORT"
echo "   Perfil: $TEMP_DIR"
echo ""

# Iniciar Chrome con debugging
google-chrome \
    --remote-debugging-port=$PORT \
    --user-data-dir=$TEMP_DIR \
    --auto-open-devtools-for-tabs \
    --disable-web-security \
    --disable-features=IsolateOrigins,site-per-process \
    $URL &

# Esperar a que Chrome inicie
sleep 3

echo ""
echo "✅ Chrome iniciado correctamente!"
echo ""
echo "📋 Próximos pasos:"
echo "   1. En VS Code, presiona F5"
echo "   2. Selecciona '🔗 Attach: Admin Panel' o '🔗 Attach: Frontend'"
echo "   3. Presiona Ctrl+Shift+R para recargar con sync"
echo ""
echo "🔍 Ver errores:"
echo "   • Ctrl+Shift+M: Panel de Problemas"
echo "   • Ctrl+Shift+Y: Debug Console"
echo "   • Ctrl+\`: Terminal"
echo ""
echo "🌐 Puerto de debugging: $PORT"
echo "🎯 Listo para desarrollar!"
