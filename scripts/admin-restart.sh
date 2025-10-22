#!/bin/bash

###############################################################################
# Script: admin-restart.sh
# Descripción: Reinicia el panel de administración
# Uso: ./scripts/admin-restart.sh [dev|prod]
###############################################################################

set -e

# Colores para output
GREEN='\033[0;32m'
NC='\033[0m' # No Color

print_message() {
    echo -e "${GREEN}[Admin Panel]${NC} $1"
}

# Directorio del proyecto
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Modo: dev o prod (por defecto dev)
MODE="${1:-dev}"

print_message "Reiniciando panel de administración en modo $MODE..."

# Detener el servicio
bash "$SCRIPT_DIR/admin-stop.sh"

# Esperar un momento
sleep 2

# Iniciar el servicio
bash "$SCRIPT_DIR/admin-start.sh" "$MODE"
