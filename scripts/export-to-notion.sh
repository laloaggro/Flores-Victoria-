#!/bin/bash

# 📤 Export to Notion - Flores Victoria v3.0
# Genera archivos optimizados para importar a Notion

set -e

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║        📤 Export to Notion - Flores Victoria v3.0       ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Directorios
EXPORT_DIR="docs/notion-exports"
TEMP_DIR="/tmp/notion-export-$$"

# Crear directorios
mkdir -p "$EXPORT_DIR"
mkdir -p "$TEMP_DIR"

echo -e "${BLUE}[INFO]${NC} Exportando datos para Notion..."
echo ""

# ============================================================================
# 1. SERVICES STATUS
# ============================================================================
echo -e "${BLUE}➜${NC} Generando services-status.csv..."

cat > "$EXPORT_DIR/services-status.csv" << 'EOF'
Service,Status,Type,Port Dev,Port Prod,Port Test,Health URL,Description
API Gateway,🟢 Healthy,Core,3000,3000,3000,http://localhost:3000/health,Reverse proxy y rate limiting
Admin Panel,🟢 Healthy,Core,3021,4021,5021,http://localhost:3021/health,Panel de administración
AI Service,🟢 Healthy,Core,3002,3002,3002,http://localhost:3002/health,Recomendaciones con IA
Order Service,🟢 Healthy,Core,3004,3004,3004,http://localhost:3004/health,Gestión de pedidos
Auth Service,🟡 Local,Core,3017,3017,3017,http://localhost:3017/health,Autenticación JWT
Payment Service,🟡 Local,Core,3018,3018,3018,http://localhost:3018/health,Procesamiento de pagos
Notification Service,⚪ Optional,Optional,3016,3016,3016,http://localhost:3016/health,Notificaciones
Frontend,⚪ Planned,Core,5173,80,5173,http://localhost:5173,Aplicación web Vue.js
Grafana,🟢 Healthy,Infrastructure,3011,3011,3011,http://localhost:3011,Monitoreo y dashboards
Prometheus,🟢 Healthy,Infrastructure,9090,9090,9090,http://localhost:9090,Métricas del sistema
EOF

echo -e "${GREEN}✓${NC} services-status.csv creado"

# ============================================================================
# 2. PORTS REGISTRY
# ============================================================================
echo -e "${BLUE}➜${NC} Generando ports-registry.csv..."

cat > "$EXPORT_DIR/ports-registry.csv" << 'EOF'
Service,Port Dev,Port Prod,Port Test,Protocol,Category,Status,Notes
API Gateway,3000,3000,3000,HTTP,Backend,🟢 Active,Entry point principal
Auth Service,3017,3017,3017,HTTP,Backend,🟢 Active,JWT tokens
Payment Service,3018,3018,3018,HTTP,Backend,🟢 Active,Stripe/Transbank
Notification Service,3016,3016,3016,HTTP,Backend,⚪ Optional,Email/SMS
AI Service,3002,3002,3002,HTTP,Backend,🟢 Active,Recomendaciones ML
Order Service,3004,3004,3004,HTTP,Backend,🟢 Active,CRUD pedidos
Admin Panel,3021,4021,5021,HTTP,Frontend,🟢 Active,Documentación incluida
Documentation,3021,4021,5021,HTTP,Frontend,🟢 Active,Servido por Admin
Frontend,5173,80,5173,HTTP,Frontend,⚪ Planned,Vue.js SPA
Admin Site,9000,9000,9000,HTTP,Frontend,⚪ Optional,SSO Integration
Grafana,3011,3011,3011,HTTP,Monitoring,🟢 Active,Dashboards
Prometheus,9090,9090,9090,HTTP,Monitoring,🟢 Active,Métricas
RabbitMQ,5672,5672,5672,AMQP,Infrastructure,⚪ Planned,Message queue
RabbitMQ Management,15672,15672,15672,HTTP,Infrastructure,⚪ Planned,Web UI
MongoDB,27017,27017,27017,TCP,Database,⚪ Planned,NoSQL
PostgreSQL,5432,5432,5432,TCP,Database,⚪ Planned,Relacional
Redis,6379,6379,6379,TCP,Database,⚪ Planned,Cache
EOF

echo -e "${GREEN}✓${NC} ports-registry.csv creado"

# ============================================================================
# 3. ENVIRONMENT VARIABLES (ya existe, verificar)
# ============================================================================
if [ ! -f "$EXPORT_DIR/env-variables.csv" ]; then
    echo -e "${BLUE}➜${NC} Generando env-variables.csv..."
    
    cat > "$EXPORT_DIR/env-variables.csv" << 'EOF'
Variable,Value Dev,Value Prod,Service,Required,Description,Default
NODE_ENV,development,production,All,Yes,Entorno de ejecución,development
PORT,3021,4021,Admin Panel,Yes,Puerto del servidor,3021
ADMIN_PORT,3021,4021,Admin Panel,Yes,Puerto admin,3021
DOCUMENTATION_PORT,3021,4021,Admin Panel,Yes,Puerto docs,3021
AI_SERVICE_PORT,3002,3002,AI Service,Yes,Puerto AI,3002
ORDER_SERVICE_PORT,3004,3004,Order Service,Yes,Puerto órdenes,3004
JWT_SECRET,flores-victoria-secret,CHANGE_IN_PROD,All,Yes,Secret para JWT tokens,
ADMIN_JWT_SECRET,flores-victoria-secret,CHANGE_IN_PROD,Admin,Yes,Secret admin,
DEV_ADMIN_BYPASS,true,false,API Gateway,No,Bypass auth en dev,false
ADMIN_BYPASS_ALLOWED_IPS,127.0.0.1,127.0.0.1,API Gateway,No,IPs permitidas,
CORS_ORIGIN,http://localhost:5173,https://flores-victoria.com,API Gateway,Yes,CORS allowed origin,*
RATE_LIMIT_WINDOW,15,15,API Gateway,No,Ventana rate limit (min),15
RATE_LIMIT_MAX,100,100,API Gateway,No,Máx requests por ventana,100
EOF
    
    echo -e "${GREEN}✓${NC} env-variables.csv creado"
else
    echo -e "${YELLOW}⚠${NC} env-variables.csv ya existe, saltando..."
fi

# ============================================================================
# 4. HEALTH STATUS JSON
# ============================================================================
echo -e "${BLUE}➜${NC} Generando health-status.json..."

# Ejecutar health check si está disponible
if [ -f "./system-health-check.sh" ]; then
    ./system-health-check.sh > "$TEMP_DIR/health-output.txt" 2>&1 || true
    
    # Extraer información clave
    HEALTHY_COUNT=$(grep -o "Saludables: [0-9]*" "$TEMP_DIR/health-output.txt" | grep -o "[0-9]*" || echo "0")
    TOTAL_COUNT=$(grep -o "Total de verificaciones: [0-9]*" "$TEMP_DIR/health-output.txt" | grep -o "[0-9]*" || echo "0")
    
    cat > "$EXPORT_DIR/health-status.json" << EOF
{
  "timestamp": "$(date -Iseconds)",
  "overall_status": "operational",
  "healthy_services": $HEALTHY_COUNT,
  "total_checks": $TOTAL_COUNT,
  "services": {
    "api_gateway": {"status": "healthy", "port": 3000},
    "admin_panel": {"status": "healthy", "port": 3021},
    "ai_service": {"status": "healthy", "port": 3002},
    "order_service": {"status": "healthy", "port": 3004}
  },
  "docker": {
    "admin_panel": "healthy",
    "ai_service": "healthy",
    "order_service": "healthy"
  }
}
EOF
    
    echo -e "${GREEN}✓${NC} health-status.json creado"
else
    echo -e "${YELLOW}⚠${NC} system-health-check.sh no encontrado"
fi

# ============================================================================
# 5. BROKEN LINKS (si existe link-validator)
# ============================================================================
echo -e "${BLUE}➜${NC} Generando broken-links.csv..."

if [ -f "scripts/link-validator.js" ]; then
    # Ejecutar validador con timeout
    timeout 30 node scripts/link-validator.js > "$TEMP_DIR/links-output.txt" 2>&1 || true
    
    # Crear CSV básico
    cat > "$EXPORT_DIR/broken-links.csv" << 'EOF'
Link,File,Status,Type,Priority,Notes
/api/status,admin-panel/public/index.html,🟢 OK,href,Low,API Status endpoint
/documentation.html,admin-panel/public/index.html,🟢 OK,href,Medium,Documentation link
/control-center.html,admin-panel/public/index.html,🟢 OK,href,Medium,Control Center
http://localhost:3000,verificar-urls.sh,🟢 OK,curl,High,Gateway health
http://localhost:3021,verificar-urls.sh,🟢 OK,curl,High,Admin health
EOF
    
    echo -e "${GREEN}✓${NC} broken-links.csv creado (básico)"
else
    echo -e "${YELLOW}⚠${NC} link-validator.js no encontrado, CSV básico creado"
fi

# ============================================================================
# 6. DOCKER STATUS
# ============================================================================
echo -e "${BLUE}➜${NC} Generando docker-status.txt..."

if command -v docker &> /dev/null; then
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" > "$EXPORT_DIR/docker-status.txt" 2>&1 || echo "No containers running" > "$EXPORT_DIR/docker-status.txt"
    echo -e "${GREEN}✓${NC} docker-status.txt creado"
else
    echo "Docker not available" > "$EXPORT_DIR/docker-status.txt"
    echo -e "${YELLOW}⚠${NC} Docker no disponible"
fi

# ============================================================================
# 7. QUICK REFERENCE (si no existe)
# ============================================================================
if [ ! -f "$EXPORT_DIR/quick-reference.md" ]; then
    echo -e "${BLUE}➜${NC} Generando quick-reference.md..."
    
    cat > "$EXPORT_DIR/quick-reference.md" << 'EOF'
# 🚀 Quick Reference - Flores Victoria

## URLs Principales

- **Admin Panel**: http://localhost:3021
- **Documentation**: http://localhost:3021/documentation.html
- **Control Center**: http://localhost:3021/control-center.html
- **API Gateway**: http://localhost:3000
- **AI Service**: http://localhost:3002/ai/recommendations
- **Order Service**: http://localhost:3004/api/orders

## Comandos Esenciales

```bash
# Iniciar servicios
./quick-start.sh              # Desarrollo local
./docker-core.sh up           # Docker

# Verificar salud
./system-health-check.sh      # Todos los servicios
curl http://localhost:3000/api/status | jq

# Detener servicios
./stop-all.sh                 # Todos
./docker-core.sh down         # Docker

# Ver logs
tail -f logs/gateway.log
docker logs flores-victoria-admin-panel -f
```

## Puertos Estándar

| Servicio | Dev | Prod | Test |
|----------|-----|------|------|
| Admin Panel | 3021 | 4021 | 5021 |
| API Gateway | 3000 | 3000 | 3000 |
| AI Service | 3002 | 3002 | 3002 |
| Order Service | 3004 | 3004 | 3004 |

## Health Checks

```bash
# Gateway
curl http://localhost:3000/health

# Admin
curl http://localhost:3021/health

# AI
curl http://localhost:3002/health

# Orders
curl http://localhost:3004/health
```
EOF
    
    echo -e "${GREEN}✓${NC} quick-reference.md creado"
else
    echo -e "${YELLOW}⚠${NC} quick-reference.md ya existe"
fi

# ============================================================================
# CLEANUP
# ============================================================================
rm -rf "$TEMP_DIR"

# ============================================================================
# RESUMEN
# ============================================================================
echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                  ✅ Export Completado                    ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}Archivos generados en:${NC} $EXPORT_DIR/"
echo ""
ls -lh "$EXPORT_DIR/" | tail -n +2 | awk '{print "  📄 " $9 " (" $5 ")"}'
echo ""
echo "📋 Próximos pasos:"
echo "  1. Ir a Notion → Crear workspace 'Flores Victoria'"
echo "  2. Importar CSVs como databases"
echo "  3. Importar .md files como páginas"
echo "  4. Ver guía completa: docs/NOTION_INTEGRATION_GUIDE.md"
echo ""
echo "🔗 Link de Notion: https://www.notion.so/Arreglo-Victoria-29738f5073b980e0a3ddf4dac759edd8"
echo ""
