#!/bin/bash

# Script para manejar migraciones de MongoDB con migrate-mongo
# Uso: ./migrate-mongo.sh [command]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DB_DIR="$SCRIPT_DIR/../microservices/shared/database"

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Cargar variables de entorno
if [ -f "$SCRIPT_DIR/../.env" ]; then
  export $(grep -v '^#' "$SCRIPT_DIR/../.env" | xargs)
fi

COMMAND=${1:-"up"}

cd "$DB_DIR"

echo -e "${YELLOW}🔄 Ejecutando migraciones MongoDB...${NC}"
echo ""

case $COMMAND in
  up)
    echo "Aplicando todas las migraciones pendientes..."
    npx migrate-mongo up -f migrate-mongo-config.js
    ;;
  down)
    echo "Revirtiendo la última migración..."
    npx migrate-mongo down -f migrate-mongo-config.js
    ;;
  status)
    echo "Estado de migraciones:"
    npx migrate-mongo status -f migrate-mongo-config.js
    ;;
  create)
    NAME=$2
    if [ -z "$NAME" ]; then
      echo -e "${RED}Error: Debes proporcionar un nombre para la migración${NC}"
      echo "Uso: $0 create nombre_de_migracion"
      exit 1
    fi
    echo "Creando nueva migración: $NAME"
    npx migrate-mongo create "$NAME" -f migrate-mongo-config.js
    ;;
  *)
    echo -e "${RED}Comando desconocido: $COMMAND${NC}"
    echo ""
    echo "Comandos disponibles:"
    echo "  up      - Aplicar todas las migraciones pendientes"
    echo "  down    - Revertir la última migración"
    echo "  status  - Ver estado de migraciones"
    echo "  create  - Crear nueva migración"
    echo ""
    echo "Ejemplo: $0 create add_product_indexes"
    exit 1
    ;;
esac

if [ $? -eq 0 ]; then
  echo ""
  echo -e "${GREEN}✓ Operación completada exitosamente${NC}"
else
  echo ""
  echo -e "${RED}✗ Error ejecutando migración${NC}"
  exit 1
fi
