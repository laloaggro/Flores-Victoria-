#!/bin/bash
# Script de Verificación Pre-Inicio - Flores Victoria
# Valida que todo esté listo antes de iniciar servicios

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "🔍 Verificación Pre-Inicio - Flores Victoria"
echo "=============================================="
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

CHECKS_PASSED=0
CHECKS_FAILED=0
WARNINGS=0

check_ok() {
    echo -e "${GREEN}✓${NC} $1"
    CHECKS_PASSED=$((CHECKS_PASSED + 1))
}

check_fail() {
    echo -e "${RED}✗${NC} $1"
    CHECKS_FAILED=$((CHECKS_FAILED + 1))
}

check_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
    WARNINGS=$((WARNINGS + 1))
}

# ═══════════════════════════════════════════════════════════════════

echo -e "${BLUE}1️⃣  Verificando Node.js y npm${NC}"
echo "───────────────────────────────"
if command -v node >/dev/null 2>&1; then
    NODE_VERSION=$(node --version)
    check_ok "Node.js instalado: $NODE_VERSION"
else
    check_fail "Node.js no encontrado"
fi

if command -v npm >/dev/null 2>&1; then
    NPM_VERSION=$(npm --version)
    check_ok "npm instalado: $NPM_VERSION"
else
    check_fail "npm no encontrado"
fi

echo ""
echo -e "${BLUE}2️⃣  Verificando Docker${NC}"
echo "───────────────────────────────"
if command -v docker >/dev/null 2>&1; then
    DOCKER_VERSION=$(docker --version | cut -d' ' -f3 | tr -d ',')
    check_ok "Docker instalado: $DOCKER_VERSION"
    
    if docker ps >/dev/null 2>&1; then
        check_ok "Docker daemon corriendo"
    else
        check_fail "Docker daemon no responde"
    fi
else
    check_warn "Docker no encontrado (opcional)"
fi

echo ""
echo -e "${BLUE}3️⃣  Verificando configuración de puertos${NC}"
echo "───────────────────────────────"
if [ -f "$PROJECT_DIR/config/ports.json" ]; then
    check_ok "Archivo config/ports.json existe"
    
    # Validar conflictos
    if node "$PROJECT_DIR/scripts/ports-cli.js" validate >/dev/null 2>&1; then
        check_ok "Sin conflictos de puertos"
    else
        check_fail "Conflictos de puertos detectados"
    fi
else
    check_fail "config/ports.json no encontrado"
fi

echo ""
echo -e "${BLUE}4️⃣  Verificando dependencias${NC}"
echo "───────────────────────────────"
if [ -d "$PROJECT_DIR/node_modules" ]; then
    check_ok "node_modules existe"
    
    # Verificar paquetes críticos
    for pkg in express prom-client cors; do
        if [ -d "$PROJECT_DIR/node_modules/$pkg" ]; then
            check_ok "Paquete $pkg instalado"
        else
            check_warn "Paquete $pkg no encontrado"
        fi
    done
else
    check_fail "node_modules no encontrado - ejecuta 'npm install'"
fi

echo ""
echo -e "${BLUE}5️⃣  Verificando puertos disponibles${NC}"
echo "───────────────────────────────"

# Puertos críticos
CRITICAL_PORTS=(3000 3021)

for port in "${CRITICAL_PORTS[@]}"; do
    if ss -tlnp 2>/dev/null | grep -q ":$port " || lsof -i:"$port" >/dev/null 2>&1; then
        # Ver quién lo usa
        OWNER=$(node "$PROJECT_DIR/scripts/ports-cli.js" who "$port" 2>/dev/null | grep -o 'docker:[^"]*\|proc:node' | head -n1 || echo "desconocido")
        check_warn "Puerto $port en uso ($OWNER)"
    else
        check_ok "Puerto $port disponible"
    fi
done

echo ""
echo -e "${BLUE}6️⃣  Verificando estructura de directorios${NC}"
echo "───────────────────────────────"

REQUIRED_DIRS=(
    "scripts"
    "config"
    "admin-panel"
    "docs"
)

for dir in "${REQUIRED_DIRS[@]}"; do
    if [ -d "$PROJECT_DIR/$dir" ]; then
        check_ok "Directorio $dir existe"
    else
        check_fail "Directorio $dir no encontrado"
    fi
done

# Crear logs si no existe
if [ ! -d "$PROJECT_DIR/logs" ]; then
    mkdir -p "$PROJECT_DIR/logs"
    check_ok "Directorio logs creado"
else
    check_ok "Directorio logs existe"
fi

echo ""
echo -e "${BLUE}7️⃣  Verificando archivos críticos${NC}"
echo "───────────────────────────────"

CRITICAL_FILES=(
    "package.json"
    "docker-compose.yml"
    "admin-panel/server.js"
    "scripts/port-manager.js"
    "scripts/ports-cli.js"
)

for file in "${CRITICAL_FILES[@]}"; do
    if [ -f "$PROJECT_DIR/$file" ]; then
        check_ok "$file existe"
    else
        check_fail "$file no encontrado"
    fi
done

echo ""
echo "═══════════════════════════════════════════════"
echo -e "${BLUE}📊 Resumen de Verificación${NC}"
echo "═══════════════════════════════════════════════"
echo -e "Checks pasados:  ${GREEN}$CHECKS_PASSED${NC}"
echo -e "Advertencias:    ${YELLOW}$WARNINGS${NC}"
echo -e "Checks fallidos: ${RED}$CHECKS_FAILED${NC}"

echo ""

# Recomendaciones
if [ $CHECKS_FAILED -gt 0 ]; then
    echo -e "${RED}❌ Hay problemas que deben resolverse antes de continuar${NC}"
    echo ""
    echo "Recomendaciones:"
    [ ! -d "$PROJECT_DIR/node_modules" ] && echo "  → Ejecuta: npm install"
    [ $CHECKS_FAILED -gt 2 ] && echo "  → Revisa la documentación en docs/QUICK_START.md"
    exit 1
elif [ $WARNINGS -gt 2 ]; then
    echo -e "${YELLOW}⚠️  Hay advertencias pero puedes continuar${NC}"
    echo ""
    echo "Sugerencias:"
    echo "  → Verifica puertos ocupados: npm run ports:status"
    echo "  → Libera puertos si es necesario: npm run ports:kill -- <puerto>"
    exit 0
else
    echo -e "${GREEN}✅ Sistema listo para iniciar servicios${NC}"
    echo ""
    echo "Siguiente paso:"
    echo "  → Iniciar con Docker: npm run dev:up"
    echo "  → O ejecutar: npm start"
    echo "  → Health check: npm run health"
    exit 0
fi
