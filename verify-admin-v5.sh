#!/bin/bash

# ============================================================================
# Admin Panel v5.0 - Script de Verificación y Demo
# ============================================================================

echo "🌺 Flores Victoria - Admin Panel v5.0"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}📋 Verificando estado del sistema...${NC}"
echo ""

# Check if admin panel is running
if curl -s http://localhost:3010/ > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Admin Panel activo en http://localhost:3010/${NC}"
else
    echo -e "${RED}❌ Admin Panel no responde${NC}"
    echo "Intenta: docker-compose up -d admin-panel"
    exit 1
fi

# Check MCP Server
if curl -s http://localhost:5050/metrics > /dev/null 2>&1; then
    echo -e "${GREEN}✅ MCP Server activo en http://localhost:5050/${NC}"
else
    echo -e "${YELLOW}⚠️  MCP Server no responde${NC}"
fi

# Check Frontend
if curl -s http://localhost:5173/ > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend activo en http://localhost:5173/${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend no responde${NC}"
fi

echo ""
echo -e "${BLUE}📊 Obteniendo métricas del sistema...${NC}"
echo ""

# Get MCP metrics
METRICS=$(curl -s http://localhost:5050/metrics)

if [ ! -z "$METRICS" ]; then
    SERVICES=$(echo $METRICS | jq -r '.healthyServices // "N/A"')
    TOTAL_SERVICES=$(echo $METRICS | jq -r '.totalServices // "N/A"')
    EVENTS=$(echo $METRICS | jq -r '.eventsCount // "N/A"')
    AUDITS=$(echo $METRICS | jq -r '.auditsCount // "N/A"')
    UPTIME=$(echo $METRICS | jq -r '.uptime // "N/A"')
    
    echo "   Servicios Activos: $SERVICES/$TOTAL_SERVICES"
    echo "   Eventos Registrados: $EVENTS"
    echo "   Auditorías: $AUDITS"
    echo "   Uptime: ${UPTIME}h"
else
    echo -e "${YELLOW}   No se pudieron obtener métricas${NC}"
fi

echo ""
echo -e "${BLUE}🔐 Credenciales de Acceso${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${GREEN}👑 ADMIN (Acceso Total)${NC}"
echo "   Usuario: admin"
echo "   Password: admin123"
echo "   Permisos: read, write, delete, manage, admin"
echo ""
echo -e "${BLUE}👔 MANAGER (Lectura + Escritura)${NC}"
echo "   Usuario: manager"
echo "   Password: manager123"
echo "   Permisos: read, write, manage"
echo ""
echo -e "${YELLOW}👁️  VIEWER (Solo Lectura)${NC}"
echo "   Usuario: viewer"
echo "   Password: viewer123"
echo "   Permisos: read"
echo ""

echo -e "${BLUE}🚀 Funcionalidades Implementadas${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ 1. Sistema de Autenticación JWT"
echo "   - Login unificado con session management"
echo "   - Tokens persistentes con localStorage/sessionStorage"
echo "   - Protección automática de páginas"
echo ""
echo "✅ 2. Control de Acceso RBAC"
echo "   - 3 roles predefinidos con permisos granulares"
echo "   - Ocultación automática de elementos no autorizados"
echo "   - Auditoría de acciones de usuarios"
echo ""
echo "✅ 3. Notificaciones en Tiempo Real"
echo "   - Sistema tipo toast con 4 tipos (success, error, warning, info)"
echo "   - Badge con contador de no leídas"
echo "   - Persistencia en localStorage"
echo "   - Polling cada 30 segundos"
echo ""
echo "✅ 4. Tema Dark/Light"
echo "   - 2 temas completos con transiciones suaves"
echo "   - Persistencia de preferencia"
echo "   - Detección de tema del sistema"
echo "   - Botón flotante de toggle"
echo ""
echo "✅ 5. Exportación CSV/PDF"
echo "   - Export a CSV con PapaParse"
echo "   - Export a PDF con jsPDF"
echo "   - Plantillas profesionales"
echo "   - Notificaciones de éxito/error"
echo ""
echo "✅ 6. UI/UX Mejorada"
echo "   - Menú de usuario con avatar"
echo "   - Header responsivo"
echo "   - Badges de rol"
echo "   - Diseño moderno y profesional"
echo ""

echo -e "${BLUE}📝 URLs Importantes${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🔐 Login:         http://localhost:3010/login.html"
echo "🏠 Dashboard:     http://localhost:3010/"
echo "📊 MCP Server:    http://localhost:5050/"
echo "🌐 Frontend:      http://localhost:5173/"
echo "⚙️  API Gateway:   http://localhost:3000/"
echo "🐳 Docker:        http://localhost:3010/services/"
echo ""

echo -e "${BLUE}📚 Archivos Creados${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "admin-panel/public/"
echo "├── auth.js              (~300 líneas) - Sistema de autenticación"
echo "├── rbac.js              (~350 líneas) - Control de acceso"
echo "├── theme.js             (~280 líneas) - Sistema de temas"
echo "├── notifications.js     (~450 líneas) - Notificaciones"
echo "├── export.js            (~350 líneas) - Exportación CSV/PDF"
echo "├── login.html           (~380 líneas) - Página de login"
echo "├── index.html           (actualizado)  - Dashboard principal"
echo "└── mcp-embedded.html    (~105 líneas) - MCP iframe"
echo ""
echo "Total: ~2,800 líneas de código nuevo"
echo ""

echo -e "${BLUE}🧪 Pruebas Rápidas${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Probar Login:"
echo "   curl -X POST http://localhost:3010/login.html"
echo ""
echo "2. Ver Archivos JavaScript:"
echo "   curl http://localhost:3010/auth.js | head -20"
echo ""
echo "3. Verificar MCP Metrics:"
echo "   curl -s http://localhost:5050/metrics | jq"
echo ""
echo "4. Ver Logs del Admin Panel:"
echo "   docker logs flores-victoria-admin-panel --tail 50"
echo ""

echo -e "${BLUE}🎯 Próximos Pasos${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Abrir navegador en: http://localhost:3010/login.html"
echo "2. Iniciar sesión con: admin / admin123"
echo "3. Explorar el dashboard y todas las funcionalidades"
echo "4. Probar cambio de tema (botón flotante)"
echo "5. Ver notificaciones (botón de campana)"
echo "6. Exportar datos a CSV/PDF"
echo ""

echo -e "${GREEN}✨ Sistema Admin Panel v5.0 Listo! ✨${NC}"
echo ""
echo "Para más información, consulta:"
echo "📖 ADMIN_PANEL_COMPLETE_v5.0.md"
echo ""
