#!/bin/bash

###############################################################################
# Script: admin-logs.sh
# Descripción: Muestra los logs del panel de administración
# Uso: ./scripts/admin-logs.sh [follow]
###############################################################################

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  Logs del Panel de Administración${NC}"
    echo -e "${BLUE}════════════════════════════════════════════════════════${NC}\n"
}

print_message() {
    echo -e "${GREEN}[Admin Panel]${NC} $1"
}

# Directorio del proyecto
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
ADMIN_DIR="$PROJECT_DIR/admin-panel"
LOG_DIR="$ADMIN_DIR/logs"

print_header

# Verificar si existe el directorio de logs
if [ ! -d "$LOG_DIR" ]; then
    print_message "No existe directorio de logs. Creando $LOG_DIR..."
    mkdir -p "$LOG_DIR"
fi

# Modo: follow o mostrar últimas líneas
MODE="${1:-tail}"

if [ "$MODE" = "follow" ] || [ "$MODE" = "-f" ]; then
    print_message "Siguiendo logs en tiempo real (Ctrl+C para salir)..."
    echo ""
    
    # Si existe archivo de log, seguirlo
    if [ -f "$LOG_DIR/admin-panel.log" ]; then
        tail -f "$LOG_DIR/admin-panel.log"
    else
        print_message "Esperando logs..."
        # Crear archivo si no existe y seguirlo
        touch "$LOG_DIR/admin-panel.log"
        tail -f "$LOG_DIR/admin-panel.log"
    fi
else
    # Mostrar últimas 50 líneas
    print_message "Mostrando últimas 50 líneas de logs..."
    echo ""
    
    if [ -f "$LOG_DIR/admin-panel.log" ]; then
        tail -n 50 "$LOG_DIR/admin-panel.log"
    else
        print_message "No hay logs disponibles aún"
    fi
fi

echo ""
echo -e "${YELLOW}Tip:${NC} Usa './scripts/admin-logs.sh follow' para ver logs en tiempo real"
