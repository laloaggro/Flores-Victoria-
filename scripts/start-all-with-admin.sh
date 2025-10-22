#!/bin/bash

# Start all services with admin-site (Node proxy server)
# Uso: ./scripts/start-all-with-admin.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ADMIN_SITE_DIR="$PROJECT_ROOT/admin-site"
MCP_SERVER_DIR="$PROJECT_ROOT/mcp-server"

echo "========================================="
echo "🌸 Iniciando Flores Victoria con Admin Site"
echo "========================================="

# 1. Docker Compose (Gateway, Auth, Products, Frontend, Admin Panel tradicional)
echo "📦 Levantando servicios con Docker Compose..."
cd "$PROJECT_ROOT"
docker compose -f docker-compose.dev-simple.yml up -d

# 2. MCP Server (puerto 5050)
echo "🔌 Levantando MCP Server en puerto 5050..."
if lsof -ti:5050 >/dev/null 2>&1; then
  echo "⚠️  Puerto 5050 ocupado, matando proceso..."
  lsof -ti:5050 | xargs kill -9 || true
fi
cd "$MCP_SERVER_DIR"
nohup node server.js > /tmp/mcp-server.log 2>&1 &
MCP_PID=$!
echo "MCP_PID=$MCP_PID" > /tmp/mcp-server.pid
echo "✅ MCP Server iniciado (PID: $MCP_PID)"

# 3. Admin Site (Node proxy server en puerto 9000)
echo "🛡️  Levantando Admin Site (proxy SSO) en puerto 9000..."
if lsof -ti:9000 >/dev/null 2>&1; then
  echo "⚠️  Puerto 9000 ocupado, matando proceso..."
  lsof -ti:9000 | xargs kill -9 || true
fi
cd "$ADMIN_SITE_DIR"
nohup npm run start > /tmp/admin-site.log 2>&1 &
ADMIN_PID=$!
echo "ADMIN_PID=$ADMIN_PID" > /tmp/admin-site.pid
echo "✅ Admin Site iniciado (PID: $ADMIN_PID)"

echo ""
echo "========================================="
echo "✅ Todos los servicios iniciados"
echo "========================================="
echo ""
echo "📊 Servicios disponibles:"
echo "  - Frontend:      http://localhost:5173"
echo "  - API Gateway:   http://localhost:3000"
echo "  - Auth Service:  http://localhost:3001"
echo "  - Products:      http://localhost:3009"
echo "  - Admin Panel:   http://localhost:3010"
echo "  - MCP Server:    http://localhost:5050"
echo "  - Admin Site:    http://localhost:9000"
echo ""
echo "🔐 Admin Site (SSO):"
echo "  - Login:         http://localhost:9000/pages/login.html"
echo "  - Panel:         http://localhost:9000/panel/"
echo "  - MCP:           http://localhost:9000/mcp/"
echo "  - API Proxy:     http://localhost:9000/api/*"
echo ""
echo "📝 Logs:"
echo "  - MCP Server:    /tmp/mcp-server.log"
echo "  - Admin Site:    /tmp/admin-site.log"
echo ""
echo "Para detener todos los servicios:"
echo "  ./scripts/stop-all-with-admin.sh"
echo "========================================="
