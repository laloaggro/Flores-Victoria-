#!/bin/bash

###############################################################################
# Script: admin-start.sh
# Descripción: Inicia el panel de administración
# Uso: ./scripts/admin-start.sh [dev|prod]
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

# Directorio del proyecto
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
ADMIN_DIR="$PROJECT_DIR/admin-panel"

# Verificar que existe el directorio admin-panel
if [ ! -d "$ADMIN_DIR" ]; then
    print_error "No se encontró el directorio admin-panel en $ADMIN_DIR"
    exit 1
fi

# Modo: dev o prod (por defecto dev)
MODE="${1:-dev}"

print_message "Iniciando panel de administración en modo $MODE..."

# Cambiar al directorio admin-panel
cd "$ADMIN_DIR"

# Verificar si node_modules existe
if [ ! -d "node_modules" ]; then
    print_warning "No se encontró node_modules. Instalando dependencias..."
    npm install
fi

# Iniciar el servidor según el modo
if [ "$MODE" = "prod" ]; then
    print_message "Iniciando servidor en modo producción (puerto 3010)..."
    npm start
else
    print_message "Iniciando servidor en modo desarrollo (puerto 3010)..."
    npm run dev
fi
