#!/bin/bash

# ═══════════════════════════════════════════════════════════════
# Script de Despliegue Completo - Flores Victoria
# Incluye: Frontend, Backend, Database, Monitoring
# ═══════════════════════════════════════════════════════════════

set -e  # Exit on error

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     FLORES VICTORIA - DEPLOYMENT SCRIPT v1.0             ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

# ═══════════════════════════════════════════════════════════════
# 1. VERIFICACIÓN DE PRERREQUISITOS
# ═══════════════════════════════════════════════════════════════
echo -e "${YELLOW}[1/6]${NC} Verificando prerrequisitos..."

command -v docker >/dev/null 2>&1 || { echo -e "${RED}❌ Docker no está instalado${NC}"; exit 1; }
command -v docker-compose >/dev/null 2>&1 || { echo -e "${RED}❌ Docker Compose no está instalado${NC}"; exit 1; }

echo -e "${GREEN}✅ Docker y Docker Compose instalados${NC}"

# ═══════════════════════════════════════════════════════════════
# 2. CREAR RED DOCKER
# ═══════════════════════════════════════════════════════════════
echo -e "${YELLOW}[2/6]${NC} Creando red Docker..."

docker network create flores-victoria-network 2>/dev/null && echo -e "${GREEN}✅ Red creada${NC}" || echo -e "${BLUE}ℹ️  Red ya existe${NC}"

# ═══════════════════════════════════════════════════════════════
# 3. BUILD DEL FRONTEND
# ═══════════════════════════════════════════════════════════════
echo -e "${YELLOW}[3/6]${NC} Building frontend optimizado..."

cd frontend

echo "  → Instalando dependencias..."
npm install --silent 2>&1 | grep -i "error" || true

echo "  → Building con Vite (code splitting)..."
npm run build

if [ -d "dist" ]; then
    BUNDLE_SIZE=$(du -sh dist | cut -f1)
    echo -e "${GREEN}✅ Frontend build completado (${BUNDLE_SIZE})${NC}"
else
    echo -e "${RED}❌ Error en build del frontend${NC}"
    exit 1
fi

cd ..

# ═══════════════════════════════════════════════════════════════
# 4. INICIAR BASE DE DATOS
# ═══════════════════════════════════════════════════════════════
echo -e "${YELLOW}[4/6]${NC} Iniciando MongoDB..."

docker-compose -f docker-compose.db.yml up -d

# Esperar a que MongoDB esté listo
echo "  → Esperando a que MongoDB esté listo..."
timeout 30 bash -c 'until docker exec flores-victoria-mongodb mongosh --eval "db.adminCommand({ping: 1})" --quiet > /dev/null 2>&1; do sleep 2; done' || {
    echo -e "${RED}❌ MongoDB no respondió a tiempo${NC}"
    exit 1
}

echo -e "${GREEN}✅ MongoDB corriendo${NC}"

# ═══════════════════════════════════════════════════════════════
# 5. INICIAR SERVICIOS CORE
# ═══════════════════════════════════════════════════════════════
echo -e "${YELLOW}[5/6]${NC} Iniciando servicios core..."

docker-compose -f docker-compose.core.yml up -d

# Esperar a que los servicios estén listos
echo "  → Verificando servicios..."
sleep 5

# Verificar frontend
if curl -s http://localhost:5173 > /dev/null; then
    echo -e "${GREEN}  ✅ Frontend: http://localhost:5173${NC}"
else
    echo -e "${RED}  ❌ Frontend no responde${NC}"
fi

# Verificar backend
if curl -s http://localhost:3000/health > /dev/null; then
    echo -e "${GREEN}  ✅ Backend: http://localhost:3000${NC}"
else
    echo -e "${YELLOW}  ⚠️  Backend: verificar manualmente${NC}"
fi

# ═══════════════════════════════════════════════════════════════
# 6. INICIAR MONITORING STACK
# ═══════════════════════════════════════════════════════════════
echo -e "${YELLOW}[6/6]${NC} Iniciando stack de monitoring..."

docker-compose -f docker-compose.monitoring.yml up -d

# Esperar a que Prometheus esté listo
echo "  → Esperando a Prometheus..."
timeout 30 bash -c 'until curl -s http://localhost:9090/-/ready > /dev/null 2>&1; do sleep 2; done' && \
    echo -e "${GREEN}  ✅ Prometheus: http://localhost:9090${NC}" || \
    echo -e "${YELLOW}  ⚠️  Prometheus: verificar logs${NC}"

# Esperar a que Grafana esté listo
echo "  → Esperando a Grafana..."
timeout 30 bash -c 'until curl -s http://localhost:3000/api/health > /dev/null 2>&1; do sleep 2; done' && \
    echo -e "${GREEN}  ✅ Grafana: http://localhost:3000 (admin/admin123)${NC}" || \
    echo -e "${YELLOW}  ⚠️  Grafana: verificar logs${NC}"

# ═══════════════════════════════════════════════════════════════
# RESUMEN FINAL
# ═══════════════════════════════════════════════════════════════
echo ""
echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                  DEPLOYMENT COMPLETADO                    ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}🌐 SERVICIOS DISPONIBLES:${NC}"
echo ""
echo -e "  📱 Frontend:      ${BLUE}http://localhost:5173${NC}"
echo -e "  🔧 API Gateway:   ${BLUE}http://localhost:3000${NC}"
echo -e "  📊 Grafana:       ${BLUE}http://localhost:3000${NC} (admin/admin123)"
echo -e "  📈 Prometheus:    ${BLUE}http://localhost:9090${NC}"
echo -e "  🚨 AlertManager:  ${BLUE}http://localhost:9093${NC}"
echo -e "  💾 MongoDB:       ${BLUE}mongodb://localhost:27017${NC}"
echo ""
echo -e "${YELLOW}📝 PRÓXIMOS PASOS:${NC}"
echo ""
echo "  1. Verificar Lighthouse score:"
echo "     → Chrome DevTools → Lighthouse → Generate report"
echo ""
echo "  2. Abrir Grafana dashboard:"
echo "     → http://localhost:3000 → Dashboards → E-Commerce Performance"
echo ""
echo "  3. Monitorear Core Web Vitals:"
echo "     → Chrome DevTools → Performance → Record"
echo ""
echo "  4. Verificar logs de servicios:"
echo "     → docker-compose logs -f --tail=50"
echo ""
echo -e "${GREEN}✨ Sistema listo para pruebas de performance!${NC}"
echo ""

# Mostrar estadísticas del build
echo -e "${BLUE}📦 BUNDLE STATS:${NC}"
cd frontend/dist/assets/js 2>/dev/null && {
    echo ""
    ls -lh *.js | awk '{printf "  %-40s %8s\n", $9, $5}'
    echo ""
} || true
cd - > /dev/null

exit 0
