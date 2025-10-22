#!/bin/bash

# Stop all services including admin-site and MCP server
# Uso: ./scripts/stop-all-with-admin.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "========================================="
echo "🛑 Deteniendo Flores Victoria con Admin Site"
echo "========================================="

# 1. Admin Site (Node proxy)
echo "🛡️  Deteniendo Admin Site (puerto 9000)..."
if [ -f /tmp/admin-site.pid ]; then
  ADMIN_PID=$(grep ADMIN_PID /tmp/admin-site.pid | cut -d= -f2)
  if kill -0 "$ADMIN_PID" 2>/dev/null; then
    kill "$ADMIN_PID" && echo "✅ Admin Site detenido (PID: $ADMIN_PID)"
  else
    echo "⚠️  Proceso $ADMIN_PID no encontrado"
  fi
  rm /tmp/admin-site.pid
else
  echo "⚠️  PID file no encontrado, buscando proceso en puerto 9000..."
  lsof -ti:9000 | xargs -r kill -9 && echo "✅ Proceso en 9000 terminado" || echo "❌ No hay proceso en 9000"
fi

# 2. MCP Server
echo "🔌 Deteniendo MCP Server (puerto 5050)..."
if [ -f /tmp/mcp-server.pid ]; then
  MCP_PID=$(grep MCP_PID /tmp/mcp-server.pid | cut -d= -f2)
  if kill -0 "$MCP_PID" 2>/dev/null; then
    kill "$MCP_PID" && echo "✅ MCP Server detenido (PID: $MCP_PID)"
  else
    echo "⚠️  Proceso $MCP_PID no encontrado"
  fi
  rm /tmp/mcp-server.pid
else
  echo "⚠️  PID file no encontrado, buscando proceso en puerto 5050..."
  lsof -ti:5050 | xargs -r kill -9 && echo "✅ Proceso en 5050 terminado" || echo "❌ No hay proceso en 5050"
fi

# 3. Docker Compose services
echo "📦 Deteniendo servicios Docker Compose..."
cd "$PROJECT_ROOT"
docker compose -f docker-compose.dev-simple.yml down

echo ""
echo "========================================="
echo "✅ Todos los servicios detenidos"
echo "========================================="
