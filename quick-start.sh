#!/bin/bash

# 🚀 Quick Start Script - Flores Victoria
# Inicia todos los servicios necesarios de forma coordinada

set -e

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║     🚀 Iniciando Sistema Flores Victoria v3.0           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Directorio del proyecto
PROJECT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$PROJECT_DIR"

# Entorno de desarrollo y seguridad (bypass solo en DEV)
export NODE_ENV=development
# Bypass de administración SOLO en desarrollo y para localhost
# Si no está definido externamente, actívalo por defecto en dev
if [ -z "${DEV_ADMIN_BYPASS+x}" ]; then
    export DEV_ADMIN_BYPASS=true
fi
export ADMIN_BYPASS_ALLOWED_IPS="127.0.0.1,::1"
# Alinear secretos para que el Gateway valide tokens del Auth Service
export JWT_SECRET="flores-victoria-secret-key-change-in-production"
# Si no viene seteado, alinea el secret de admin con el del Auth Service
if [ -z "${ADMIN_JWT_SECRET+x}" ]; then
    export ADMIN_JWT_SECRET="$JWT_SECRET"
fi

# Crear directorios de logs si no existen
mkdir -p logs

# Función para verificar si un puerto está en uso
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        return 0  # Puerto en uso
    else
        return 1  # Puerto libre
    fi
}

# Función para iniciar un servicio
start_service() {
    local name=$1
    local script=$2
    local port=$3
    local log_file=$4
    
    echo -ne "${BLUE}[INFO]${NC} Iniciando $name en puerto $port... "
    
    if check_port $port; then
        echo -e "${YELLOW}[SKIP]${NC} Ya está corriendo"
        return 0
    fi
    
    NODE_ENV=development node "$script" > "logs/$log_file" 2>&1 &
    local pid=$!
    
    # Esperar un momento para verificar que inició
    sleep 2
    
    if ps -p $pid > /dev/null; then
        echo -e "${GREEN}[OK]${NC} PID: $pid"
        return 0
    else
        echo -e "${RED}[ERROR]${NC} Falló al iniciar"
        return 1
    fi
}

echo "📋 Verificando dependencias..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}[ERROR]${NC} Node.js no está instalado"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}[ERROR]${NC} npm no está instalado"
    exit 1
fi

echo -e "${GREEN}[OK]${NC} Node.js $(node --version) y npm $(npm --version) disponibles"
echo ""

# Verificar que node_modules existe
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}[WARN]${NC} Instalando dependencias..."
    npm install
fi

echo "🔧 Iniciando servicios principales..."
echo ""

# 1. API Gateway (debe iniciar primero)
start_service "API Gateway" "api-gateway.js" 3000 "gateway.log"

# 2. Auth Service (puerto mapeado por PortManager: 3017)
start_service "Auth Service" "auth-service.js" 3017 "auth.log"

# 3. Payment Service (puerto mapeado: 3018)
start_service "Payment Service" "payment-service.js" 3018 "payment.log"

# 4. Order Service (si existe) (puerto mapeado: 3004)
if [ -f "order-service.js" ]; then
    start_service "Order Service" "order-service.js" 3004 "order.log"
fi

# 5. Product Service (si existe) — opcional, mantener puerto 3004 si aplica
if [ -f "product-service.js" ]; then
    start_service "Product Service" "product-service.js" 3004 "product.log"
fi

# 6. Notification Service (puerto mapeado: 3016)
if [ -f "notification-service.js" ]; then
    start_service "Notification Service" "notification-service.js" 3016 "notification.log"
fi

# 7. AI Service (si existe) (puerto mapeado: 3013)
if [ -f "ai-service.js" ]; then
    start_service "AI Service" "ai-service.js" 3013 "ai.log"
fi

# 8. Admin Panel (puerto mapeado: 3021)
if [ -f "admin-panel/server.js" ]; then
    echo -ne "${BLUE}[INFO]${NC} Iniciando Admin Panel en puerto 3021... "
    
    if check_port 3021; then
        echo -e "${YELLOW}[SKIP]${NC} Ya está corriendo"
    else
        cd admin-panel && node server.js --port=3021 > ../logs/admin-panel.log 2>&1 &
        local pid=$!
        cd ..
        sleep 2
        
        if ps -p $pid > /dev/null; then
            echo -e "${GREEN}[OK]${NC} PID: $pid"
        else
            echo -e "${RED}[ERROR]${NC} Falló al iniciar"
        fi
    fi
fi

echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                  ✅ Sistema Iniciado                      ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""
echo "📊 Servicios Disponibles:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🌐 API Gateway:        http://localhost:3000"
echo "  🔐 Auth Service:       http://localhost:3017"
echo "  💳 Payment Service:    http://localhost:3018"
echo "  🛒 Order Service:      http://localhost:3004"
echo "  📦 Product Service:    http://localhost:3004"
echo "  🔔 Notification:       http://localhost:3016"
echo "  🤖 AI Service:         http://localhost:3013"
echo "  🛠️  Admin Panel:        http://localhost:3021"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📡 Endpoints Útiles:"
echo "  ├─ Status:             http://localhost:3000/api/status"
echo "  ├─ Health:             http://localhost:3000/health"
echo "  ├─ Metrics:            http://localhost:3000/metrics"
echo "  ├─ System Metrics:     http://localhost:3000/api/health/system/metrics (protegido)"
echo "  ├─ Services Health:    http://localhost:3000/api/health/services/health (protegido)"
echo "  └─ Docker Status:      http://localhost:3000/api/health/docker/status (protegido)"
echo ""
echo "📝 Logs ubicados en: $PROJECT_DIR/logs/"
echo ""
echo "🛑 Para detener todos los servicios, ejecuta:"
echo "   ./stop-all.sh"
echo ""
echo "🔍 Para ver el estado de los servicios:"
echo "   # Dev bypass activo: no requiere token"
echo "   curl http://localhost:3000/api/health/services/health | jq"
echo ""
echo "🔐 Modo seguro (sin bypass) - ejemplo (comentado):"
echo "   # DEV_ADMIN_BYPASS=false ADMIN_JWT_SECRET=\"$JWT_SECRET\" node api-gateway.js"
echo "   # token=\$(curl -s -X POST http://localhost:3017/login -H 'Content-Type: application/json' -d '{\"email\":\"demo@flores-victoria.com\",\"password\":\"demo123\"}' | jq -r .accessToken)"
echo "   # curl -H \"Authorization: Bearer $token\" http://localhost:3000/api/health/services/health | jq"
echo ""
echo "✨ Sistema listo para usar!"
