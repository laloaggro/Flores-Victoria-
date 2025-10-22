#!/bin/bash

###############################################################################
# Script: admin-status.sh
# Descripción: Muestra el estado del panel de administración
# Uso: ./scripts/admin-status.sh
###############################################################################

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_header() {
    echo -e "\n${BLUE}════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  Estado del Panel de Administración - Flores Victoria${NC}"
    echo -e "${BLUE}════════════════════════════════════════════════════════${NC}\n"
}

print_section() {
    echo -e "\n${YELLOW}▶ $1${NC}"
    echo "────────────────────────────────────────────────────────"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "  $1"
}

print_header

# Verificar proceso en puerto 3010
print_section "Estado del Servicio"
if lsof -ti:3010 > /dev/null 2>&1; then
    PID=$(lsof -ti:3010)
    print_success "Panel de administración CORRIENDO"
    print_info "PID: $PID"
    print_info "Puerto: 3010"
    print_info "URL: http://localhost:3010"
    
    # Obtener información del proceso
    PROCESS_INFO=$(ps -p $PID -o pid,vsz,rss,etime,comm 2>/dev/null | tail -n 1)
    if [ ! -z "$PROCESS_INFO" ]; then
        print_info "Proceso: $PROCESS_INFO"
    fi
else
    print_error "Panel de administración NO está corriendo"
    print_info "Puerto 3010: Disponible"
fi

# Verificar procesos nodemon
print_section "Procesos Nodemon"
NODEMON_COUNT=$(ps aux | grep -c "[n]odemon.*admin-panel" || echo "0")
if [ "$NODEMON_COUNT" -gt 0 ]; then
    print_success "Nodemon detectado ($NODEMON_COUNT proceso(s))"
    ps aux | grep "[n]odemon.*admin-panel" | awk '{print "  PID: "$2" - "$11" "$12" "$13}' || true
else
    print_info "No hay procesos nodemon para admin-panel"
fi

# Verificar conectividad HTTP
print_section "Conectividad HTTP"
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3010/health 2>/dev/null | grep -q "200"; then
    print_success "Endpoint /health responde correctamente"
    HEALTH_DATA=$(curl -s http://localhost:3010/health 2>/dev/null)
    print_info "Respuesta: $HEALTH_DATA"
else
    if lsof -ti:3010 > /dev/null 2>&1; then
        print_error "El servicio está corriendo pero no responde HTTP"
    else
        print_info "Servicio no disponible (no está corriendo)"
    fi
fi

# Verificar archivos del proyecto
print_section "Archivos del Proyecto"
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
ADMIN_DIR="$PROJECT_DIR/admin-panel"

if [ -d "$ADMIN_DIR" ]; then
    print_success "Directorio admin-panel encontrado"
    print_info "Ubicación: $ADMIN_DIR"
    
    if [ -f "$ADMIN_DIR/package.json" ]; then
        print_success "package.json encontrado"
        VERSION=$(grep -oP '"version":\s*"\K[^"]+' "$ADMIN_DIR/package.json" 2>/dev/null || echo "desconocida")
        print_info "Versión: $VERSION"
    else
        print_error "package.json no encontrado"
    fi
    
    if [ -d "$ADMIN_DIR/node_modules" ]; then
        print_success "node_modules encontrado"
        MODULE_COUNT=$(ls -1 "$ADMIN_DIR/node_modules" 2>/dev/null | wc -l)
        print_info "Módulos instalados: $MODULE_COUNT"
    else
        print_error "node_modules no encontrado (ejecutar npm install)"
    fi
    
    if [ -f "$ADMIN_DIR/server.js" ]; then
        print_success "server.js encontrado"
    else
        print_error "server.js no encontrado"
    fi
else
    print_error "Directorio admin-panel no encontrado"
fi

# Páginas disponibles
print_section "Páginas Disponibles"
if [ -d "$ADMIN_DIR/public" ]; then
    print_success "Directorio public encontrado"
    
    declare -a pages=(
        "index.html:Dashboard Principal"
        "products/index.html:Gestión de Productos"
        "orders/index.html:Gestión de Pedidos"
        "users/index.html:Gestión de Usuarios"
        "reports/index.html:Reportes"
        "settings/index.html:Configuración"
        "reviews/index.html:Reseñas"
        "wishlist/index.html:Lista de Deseos"
    )
    
    for page in "${pages[@]}"; do
        IFS=':' read -r file desc <<< "$page"
        if [ -f "$ADMIN_DIR/public/$file" ]; then
            print_success "$desc"
            print_info "  http://localhost:3010/${file%index.html}"
        else
            print_error "$desc (archivo no encontrado)"
        fi
    done
else
    print_error "Directorio public no encontrado"
fi

# Docker status si está disponible
if command -v docker &> /dev/null; then
    print_section "Estado Docker"
    CONTAINER_STATUS=$(docker ps --filter "name=admin-panel" --format "{{.Names}}: {{.Status}}" 2>/dev/null || echo "")
    if [ ! -z "$CONTAINER_STATUS" ]; then
        print_success "Contenedor Docker encontrado"
        print_info "$CONTAINER_STATUS"
    else
        print_info "No hay contenedores Docker de admin-panel corriendo"
    fi
fi

# Uso de recursos
print_section "Uso de Recursos"
if lsof -ti:3010 > /dev/null 2>&1; then
    PID=$(lsof -ti:3010)
    CPU_USAGE=$(ps -p $PID -o %cpu 2>/dev/null | tail -n 1 | xargs)
    MEM_USAGE=$(ps -p $PID -o %mem 2>/dev/null | tail -n 1 | xargs)
    print_info "CPU: ${CPU_USAGE}%"
    print_info "Memoria: ${MEM_USAGE}%"
else
    print_info "No hay proceso corriendo para monitorear"
fi

echo -e "\n${BLUE}════════════════════════════════════════════════════════${NC}\n"
