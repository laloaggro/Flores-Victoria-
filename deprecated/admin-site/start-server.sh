#!/bin/bash
# Script para iniciar el servidor del sitio de administración
# Puerto: 9000

echo "========================================="
echo "🌸 Flores Victoria - Admin Site"
echo "========================================="
echo ""
echo "Iniciando servidor en puerto 9000..."
echo ""

cd "$(dirname "$0")"

# Verificar si el puerto está en uso
if lsof -Pi :9000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "⚠️  El puerto 9000 ya está en uso"
    echo "Deteniendo proceso anterior..."
    lsof -ti:9000 | xargs kill -9 2>/dev/null
    sleep 1
fi

# Iniciar servidor HTTP
python3 -m http.server 9000 &
SERVER_PID=$!

sleep 2

echo ""
echo "========================================="
echo "✅ Servidor Admin Site Iniciado"
echo "========================================="
echo ""
echo "🌐 URL Principal:     http://localhost:9000"
echo "🔐 Login:             http://localhost:9000/pages/login.html"
echo "📊 Dashboard:         http://localhost:9000/pages/monitoring-dashboard.html"
echo "🔧 MCP Dashboard:     http://localhost:9000/pages/mcp-dashboard.html"
echo ""
echo "📌 PID del servidor: $SERVER_PID"
echo ""
echo "========================================="
echo "Para detener: kill $SERVER_PID"
echo "o presiona Ctrl+C"
echo "========================================="
echo ""

# Esperar a que se detenga
wait $SERVER_PID
