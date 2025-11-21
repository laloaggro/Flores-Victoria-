#!/bin/bash

# Script para manejar migraciones de PostgreSQL con Knex
# Uso: ./migrate-postgres.sh [command] [options]

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

COMMAND=${1:-"latest"}
ENV=${NODE_ENV:-development}

cd "$DB_DIR"

echo -e "${YELLOW}🔄 Ejecutando migraciones PostgreSQL (env: $ENV)...${NC}"
echo ""

case $COMMAND in
  latest)
    echo "Aplicando todas las migraciones pendientes..."
    npx knex migrate:latest --env "$ENV"
    ;;
  up)
    echo "Aplicando la siguiente migración..."
    npx knex migrate:up --env "$ENV"
    ;;
  down)
    echo "Revirtiendo la última migración..."
    npx knex migrate:down --env "$ENV"
    ;;
  rollback)
    BATCH=${2:-1}
    echo "Revirtiendo último batch de migraciones..."
    npx knex migrate:rollback --env "$ENV" --all=$BATCH
    ;;
  status)
    echo "Estado de migraciones:"
    npx knex migrate:status --env "$ENV"
    ;;
  make)
    NAME=$2
    if [ -z "$NAME" ]; then
      echo -e "${RED}Error: Debes proporcionar un nombre para la migración${NC}"
      echo "Uso: $0 make nombre_de_migracion"
      exit 1
    fi
    echo "Creando nueva migración: $NAME"
    npx knex migrate:make "$NAME" --env "$ENV"
    ;;
  list)
    echo "Migraciones completadas:"
    npx knex migrate:list --env "$ENV"
    ;;
  unlock)
    echo "Desbloqueando migraciones..."
    npx knex migrate:unlock --env "$ENV"
    ;;
  *)
    echo -e "${RED}Comando desconocido: $COMMAND${NC}"
    echo ""
    echo "Comandos disponibles:"
    echo "  latest    - Aplicar todas las migraciones pendientes"
    echo "  up        - Aplicar la siguiente migración"
    echo "  down      - Revertir la última migración"
    echo "  rollback  - Revertir último batch"
    echo "  status    - Ver estado de migraciones"
    echo "  make      - Crear nueva migración"
    echo "  list      - Listar migraciones completadas"
    echo "  unlock    - Desbloquear migraciones"
    echo ""
    echo "Ejemplo: $0 make add_user_preferences"
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
