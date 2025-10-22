#!/bin/bash

###############################################################################
# Script: admin-stop.sh
# Descripción: Detiene el panel de administración
# Uso: ./scripts/admin-stop.sh
###############################################################################

set -e

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Función para imprimir mensajes
print_message() {
    echo -e "${GREEN}[Admin Panel]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[Admin Panel]${NC} $1"
}

print_error() {
    echo -e "${RED}[Admin Panel]${NC} $1"
}

print_message "Deteniendo panel de administración..."

# Buscar procesos de Node.js corriendo en puerto 3010
ADMIN_PID=$(lsof -ti:3010 2>/dev/null || true)

if [ -z "$ADMIN_PID" ]; then
    print_warning "No se encontró ningún proceso corriendo en el puerto 3010"
else
    print_message "Deteniendo proceso(s) en puerto 3010: $ADMIN_PID"
    kill $ADMIN_PID
    sleep 2
    
    # Verificar si el proceso aún está corriendo
    if lsof -ti:3010 > /dev/null 2>&1; then
        print_warning "El proceso no se detuvo correctamente. Forzando detención..."
        kill -9 $ADMIN_PID
    fi
    
    print_message "Panel de administración detenido exitosamente"
fi

# Buscar y detener procesos de nodemon relacionados con admin-panel
NODEMON_PIDS=$(ps aux | grep "[n]odemon.*admin-panel" | awk '{print $2}' || true)

if [ ! -z "$NODEMON_PIDS" ]; then
    print_message "Deteniendo procesos nodemon relacionados..."
    echo "$NODEMON_PIDS" | xargs kill 2>/dev/null || true
fi

print_message "Limpieza completada"
