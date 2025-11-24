#!/bin/bash
# Script para detener todos los servicios incluyendo admin-site

echo "==========================================="
echo "🛑 Deteniendo todos los servicios"
echo "==========================================="
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# 1. Detener MCP Server
if [ -f /tmp/flores-victoria-mcp.pid ]; then
    MCP_PID=$(cat /tmp/flores-victoria-mcp.pid)
    echo -e "${YELLOW}[1/3]${NC} Deteniendo MCP Server (PID: $MCP_PID)..."
    kill $MCP_PID 2>/dev/null || echo "  Ya estaba detenido"
    rm /tmp/flores-victoria-mcp.pid
else
    echo -e "${YELLOW}[1/3]${NC} MCP Server ya está detenido"
fi

# 2. Detener Admin Site
if [ -f /tmp/flores-victoria-admin.pid ]; then
    ADMIN_PID=$(cat /tmp/flores-victoria-admin.pid)
    echo -e "${YELLOW}[2/3]${NC} Deteniendo Admin Site (PID: $ADMIN_PID)..."
    kill $ADMIN_PID 2>/dev/null || echo "  Ya estaba detenido"
    rm /tmp/flores-victoria-admin.pid
else
    echo -e "${YELLOW}[2/3]${NC} Admin Site ya está detenido"
fi

# 3. Detener contenedores Docker
echo -e "${YELLOW}[3/3]${NC} Deteniendo contenedores Docker..."
cd "$BASE_DIR"
docker compose -f docker-compose.dev-simple.yml down

echo ""
echo "==========================================="
echo -e "${GREEN}✅ Todos los servicios detenidos${NC}"
echo "==========================================="
echo ""
