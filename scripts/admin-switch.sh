#!/bin/bash

###############################################################################
# Script: admin-switch.sh
# Descripción: Alterna entre Admin Panel en Docker y Admin Panel local (nodemon)
# Uso:
#   ./scripts/admin-switch.sh docker   # usa contenedor en 3021
#   ./scripts/admin-switch.sh local    # detiene contenedor y levanta nodemon
###############################################################################

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_message() { echo -e "${GREEN}[Admin Switch]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[Admin Switch]${NC} $1"; }
print_error() { echo -e "${RED}[Admin Switch]${NC} $1"; }

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
SERVICE_NAME="admin-panel"
CONTAINER_NAME="flores-victoria-admin-panel"
TARGET=${1:-docker}

case "$TARGET" in
  docker)
    print_message "Cambiando a Admin Panel en Docker (puerto 3021)"
    # Detener admin local si estuviera corriendo
    "$SCRIPT_DIR/admin-stop.sh" || true
    # Subir solo el servicio admin-panel si está definido
    if docker compose ps >/dev/null 2>&1; then
      if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
        print_message "Contenedor ya está arriba: ${CONTAINER_NAME}"
      else
        print_message "Levantando contenedor ${CONTAINER_NAME}..."
        (docker compose up -d ${SERVICE_NAME}) || (print_warning "Servicio '${SERVICE_NAME}' no definido, levantando stack completo" && docker compose up -d)
      fi
    else
      print_error "Docker Compose no disponible en este directorio"
      exit 1
    fi
    ;;
  local)
    print_message "Cambiando a Admin Panel local (nodemon, puerto 3021)"
    # Detener contenedor si está corriendo
    if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
      print_message "Deteniendo contenedor ${CONTAINER_NAME}..."
      docker stop ${CONTAINER_NAME} >/dev/null 2>&1 || true
    fi
    # Iniciar admin local
    "$SCRIPT_DIR/admin-start.sh" dev || exit 1
    ;;
  *)
    echo "Uso: $0 [docker|local]" >&2
    exit 1
    ;;
 esac

print_message "Hecho"
