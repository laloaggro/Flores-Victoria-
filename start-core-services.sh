#!/bin/bash

# 🚀 INICIO DE SERVICIOS CORE - FLORES VICTORIA v3.0
# Inicia los servicios principales del sistema

echo "🚀 INICIANDO SERVICIOS CORE - FLORES VICTORIA v3.0"
echo "================================================="
echo ""

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Cargar utilidades de puertos
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ -f "$SCRIPT_DIR/scripts/port-guard.sh" ]; then
  # shellcheck source=/dev/null
  source "$SCRIPT_DIR/scripts/port-guard.sh"
else
  echo "⚠️  port-guard.sh no encontrado, usando verificación básica de puertos"
  # Función para verificar si un puerto está en uso (fallback)
  check_port() {
      local port=$1
      if lsof -ti:$port > /dev/null 2>&1; then
          return 0  # Puerto en uso
      else
          return 1  # Puerto libre
      fi
  }
  # Función fallback para encontrar puerto libre
  find_free_port() {
      local start_port=${1:-3000}
      local max_attempts=${2:-50}
      local port=$start_port
      for ((i=0; i<max_attempts; i++)); do
          if ! lsof -ti:$port >/dev/null 2>&1; then
              echo "$port"
              return 0
          fi
          port=$((port+1))
      done
      echo "$start_port"  # devolver el inicial si no se encuentra
      return 1
  }
fi

# Función para iniciar servicio
start_service() {
    local name=$1
    local command=$2
    local port=$3
    local log_file=$4
    
    echo -n "🔄 Iniciando $name (puerto $port)... "
    
    if check_port $port; then
        echo -e "${YELLOW}YA ESTÁ CORRIENDO${NC}"
        return 0
    fi
    
    eval "$command" > "$log_file" 2>&1 &
    local pid=$!
    
    # Esperar un momento y verificar
    sleep 3
    
    if check_port $port; then
        echo -e "${GREEN}✅ INICIADO${NC}"
        echo "   📝 Log: $log_file"
        return 0
    else
        echo -e "❌ ERROR"
        echo "   📝 Ver log: $log_file"
        return 1
    fi
}

echo -e "${BLUE}🎯 INICIANDO SERVICIOS PRINCIPALES${NC}"
echo "-----------------------------------"

# Directorio base
cd /home/impala/Documentos/Proyectos/flores-victoria

# Limpieza previa: evitar duplicados de procesos anteriores
echo "🧹 Limpiando procesos previos (si existen)..."
pkill -f "ai-simple.js" >/dev/null 2>&1 || true
pkill -f "order-service-simple.js" >/dev/null 2>&1 || true
pkill -f "admin-panel.*server.js" >/dev/null 2>&1 || true
sleep 1

# Resolver puertos libres con defaults preferidos
AI_SIMPLE_PORT=${AI_SIMPLE_PORT:-$(find_free_port 3012 50)}
ORDER_PORT=${ORDER_PORT:-$(find_free_port 3004 50)}
if [ "$ORDER_PORT" = "$AI_SIMPLE_PORT" ]; then
    ORDER_PORT=$(find_free_port $((ORDER_PORT+1)) 50)
fi
ADMIN_PORT=${ADMIN_PORT:-$(find_free_port 3021 50)}
if [ "$ADMIN_PORT" = "$AI_SIMPLE_PORT" ] || [ "$ADMIN_PORT" = "$ORDER_PORT" ]; then
    ADMIN_PORT=$(find_free_port $((ADMIN_PORT+1)) 50)
fi

echo "🧭 Puertos asignados: AI=${AI_SIMPLE_PORT}, Orders=${ORDER_PORT}, Admin=${ADMIN_PORT}"

# Iniciar AI Service (ai-simple)
start_service "AI Service" "PORT=${AI_SIMPLE_PORT} node ai-simple.js" ${AI_SIMPLE_PORT} "/tmp/ai-service.log"

# Iniciar Order Service
start_service "Order Service" "PORT=${ORDER_PORT} node order-service-simple.js" ${ORDER_PORT} "/tmp/order-service.log"

# Iniciar Admin Panel
start_service "Admin Panel" "cd admin-panel && node server.js --port=${ADMIN_PORT}" ${ADMIN_PORT} "/tmp/admin-panel.log"

echo ""
echo -e "${BLUE}🔍 VERIFICANDO SERVICIOS${NC}"
echo "-------------------------"

# Verificar servicios después de 5 segundos
sleep 5

services_ok=0

# Verificar AI Service
if curl -s --connect-timeout 3 "http://localhost:${AI_SIMPLE_PORT}/health" > /dev/null 2>&1; then
    echo -e "🤖 AI Service:      ${GREEN}✅ FUNCIONANDO${NC}"
    services_ok=$((services_ok + 1))
else
    echo -e "🤖 AI Service:      ❌ NO RESPONDE"
fi

# Verificar Order Service
if curl -s --connect-timeout 3 "http://localhost:${ORDER_PORT}/health" > /dev/null 2>&1; then
    echo -e "🛒 Order Service:   ${GREEN}✅ FUNCIONANDO${NC}"
    services_ok=$((services_ok + 1))
else
    echo -e "🛒 Order Service:   ❌ NO RESPONDE"
fi

# Verificar Admin Panel
if curl -s --connect-timeout 3 "http://localhost:${ADMIN_PORT}/health" > /dev/null 2>&1; then
    echo -e "🛡️  Admin Panel:     ${GREEN}✅ FUNCIONANDO${NC}"
    services_ok=$((services_ok + 1))
else
    echo -e "🛡️  Admin Panel:     ❌ NO RESPONDE"
fi

echo ""
echo -e "${BLUE}📊 RESUMEN${NC}"
echo "----------"
echo "✅ Servicios activos: $services_ok/3"

if [ $services_ok -eq 3 ]; then
    echo ""
    echo -e "${GREEN}🎉 ¡TODOS LOS SERVICIOS CORE INICIADOS EXITOSAMENTE!${NC}"
    echo ""
    echo -e "${YELLOW}📍 URLs de acceso:${NC}"
    echo "  🌐 Admin Panel: http://localhost:${ADMIN_PORT}"
    echo "  📚 Documentación: http://localhost:${ADMIN_PORT}/documentation.html"
    echo "  🤖 AI Service: http://localhost:${AI_SIMPLE_PORT}/ai/recommendations"
    echo "  🛒 Order Service: http://localhost:${ORDER_PORT}/api/orders"
    echo ""
    echo -e "${YELLOW}🔧 Comandos útiles:${NC}"
    echo "  npm run status    - Verificar estado de servicios"
    echo "  npm run verify    - Verificar URLs del sistema"
    echo "  npm run stop:core - Detener servicios core"
else
    echo ""
    echo -e "${YELLOW}⚠️  Algunos servicios no iniciaron correctamente${NC}"
    echo "Revisa los logs en /tmp/ para más detalles"
    echo ""
    echo "📝 Logs disponibles:"
    echo "  - /tmp/ai-service.log"
    echo "  - /tmp/order-service.log" 
    echo "  - /tmp/admin-panel.log"
fi

echo ""
echo "🌸 Inicio completado - $(date)"
echo "================================================="