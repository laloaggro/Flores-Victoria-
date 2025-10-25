#!/bin/bash
# Ports Enforcer - ensures no conflicts before running a command
# Usage: ports-enforcer.sh <service> <environment> [--action=abort|auto-next|kill-local|stop-docker] -- <command...>
set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

SERVICE="$1"; shift
ENVIRONMENT="$1"; shift
ACTION="abort"

for arg in "$@"; do
  case "$arg" in
    --action=*) ACTION="${arg#*=}"; shift; break;;
    --) shift; break;;
  esac
done

if [ -z "$SERVICE" ] || [ -z "$ENVIRONMENT" ]; then
  echo "Uso: $0 <service> <environment> [--action=abort|auto-next|kill-local|stop-docker] -- <command...>" >&2
  exit 2
fi

PORT=$(node "$SCRIPT_DIR/port-manager.js" get "$ENVIRONMENT" "$SERVICE" 2>/dev/null || true)
if [ -z "$PORT" ]; then
  echo "❌ No se pudo obtener puerto para $SERVICE en $ENVIRONMENT" >&2
  exit 2
fi

# Helper: who uses port
who_port() {
  local port="$1"
  local docker_names
  docker_names=$(docker ps --format '{{.Names}}\t{{.Ports}}' 2>/dev/null | grep ":${port}->" | cut -f1 || true)
  local pids
  pids=$(lsof -ti:$port 2>/dev/null || true)
  echo "$docker_names" | sed '/^$/d' | sed 's/^/docker: /'
  echo "$pids" | sed '/^$/d' | sed 's/^/pid: /'
}

in_use() {
  ss -tulpen 2>/dev/null | grep -q ":${PORT} " && return 0
  lsof -i:$PORT >/dev/null 2>&1 && return 0
  return 1
}

if in_use; then
  echo "⚠️  Puerto $PORT está en uso para $SERVICE/$ENVIRONMENT"
  who_port "$PORT" || true
  case "$ACTION" in
    abort)
      echo "Abortando para evitar conflicto. Opciones: --action=kill-local | stop-docker | auto-next"
      exit 1
      ;;
    kill-local)
      PIDS=$(lsof -ti:$PORT 2>/dev/null || true)
      if [ -n "$PIDS" ]; then
        echo "$PIDS" | xargs -r kill || true
        sleep 1
      fi
      ;;
    stop-docker)
      # intento detener contenedores conocidos
      case "$SERVICE" in
        admin-panel) C="flores-victoria-admin-panel" ;;
        ai-service) C="flores-victoria-ai-service" ;;
        order-service) C="flores-victoria-order-service" ;;
        *) C="" ;;
      esac
      if [ -n "$C" ] && docker ps --format '{{.Names}}' | grep -q "^${C}$"; then
        echo "Deteniendo contenedor ${C}..."
        docker stop "$C" >/dev/null 2>&1 || true
        sleep 1
      else
        echo "No se encontró contenedor asociado, omitiendo."
      fi
      ;;
    auto-next)
      # buscar puerto libre
      if [ -f "$SCRIPT_DIR/port-guard.sh" ]; then
        # shellcheck disable=SC1090
        source "$SCRIPT_DIR/port-guard.sh"
        NEW_PORT=$(find_free_port "$PORT" 50)
        echo "↪️  Cambiando a puerto libre $NEW_PORT (antes $PORT)"
        PORT="$NEW_PORT"
      else
        echo "No disponible 'find_free_port'. Abortando."
        exit 1
      fi
      ;;
    *)
      echo "Acción no válida: $ACTION"
      exit 2
      ;;
  esac
fi

# Ejecutar comando con PORT seteado
export PORT
exec "$@"
