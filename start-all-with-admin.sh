#!/bin/bash
# Script maestro para iniciar todos los servicios de Flores Victoria

echo "==========================================="
echo "🌸 Flores Victoria - Iniciar Todo"
echo "==========================================="
echo ""

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Directorio base
BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo -e "${BLUE}📦 Iniciando servicios principales...${NC}"
echo ""

# 1. Docker Compose (Gateway, Auth, Products, Frontend, Admin Panel)
echo -e "${YELLOW}[1/3]${NC} Iniciando contenedores Docker..."
cd "$BASE_DIR"
docker compose -f docker-compose.dev-simple.yml up -d
sleep 3

# 2. MCP Server
echo -e "${YELLOW}[2/3]${NC} Iniciando MCP Server (puerto 5050)..."
cd "$BASE_DIR/mcp-server"
node server.js > /tmp/mcp-server.log 2>&1 &
MCP_PID=$!
echo "MCP Server PID: $MCP_PID"
sleep 2

# 3. Admin Site
echo -e "${YELLOW}[3/3]${NC} Iniciando Admin Site (puerto 9000)..."
cd "$BASE_DIR/admin-site"
python3 -m http.server 9000 > /tmp/admin-site.log 2>&1 &
ADMIN_PID=$!
echo "Admin Site PID: $ADMIN_PID"
sleep 2

echo ""
echo "==========================================="
echo -e "${GREEN}✅ Todos los servicios iniciados${NC}"
echo "==========================================="
echo ""
echo "📊 SERVICIOS DISPONIBLES:"
echo ""
echo "  🌐 Sitio Principal (Frontend)"
echo "     http://localhost:5173"
echo ""
echo "  🔧 Centro de Administración"
echo "     http://localhost:9000"
echo "     Credenciales: admin@flores.local / admin123"
echo ""
echo "  ⚙️  Panel de Administración"
echo "     http://localhost:3010"
echo ""
echo "  🔌 API Gateway"
echo "     http://localhost:3000"
echo ""
echo "  🔧 MCP Server"
echo "     http://localhost:5050"
echo ""
echo "==========================================="
echo "📝 INFORMACIÓN DE PROCESOS:"
echo ""
echo "  MCP Server PID: $MCP_PID"
echo "  Admin Site PID: $ADMIN_PID"
echo ""
echo "  Para ver contenedores:"
echo "  docker compose -f docker-compose.dev-simple.yml ps"
echo ""
echo "==========================================="
echo "🛑 PARA DETENER TODO:"
echo ""
echo "  ./stop-all.sh"
echo ""
echo "  O manualmente:"
echo "  kill $MCP_PID $ADMIN_PID"
echo "  docker compose -f docker-compose.dev-simple.yml down"
echo ""
echo "==========================================="
echo ""

# Guardar PIDs para stop-all.sh
echo "$MCP_PID" > /tmp/flores-victoria-mcp.pid
echo "$ADMIN_PID" > /tmp/flores-victoria-admin.pid

echo -e "${GREEN}✨ Sistema listo para usar!${NC}"
echo ""
