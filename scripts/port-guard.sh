#!/bin/bash
# Utilidades para validar y asignar puertos libres de forma segura

# Comprueba si un puerto está en uso (devuelve 0 si está en uso)
check_port() {
  local port=$1
  if command -v ss >/dev/null 2>&1; then
    ss -tulpen | grep -q ":${port} " && return 0 || return 1
  else
    lsof -ti:$port >/dev/null 2>&1 && return 0 || return 1
  fi
}

# Obtiene el PID del proceso que está usando un puerto (o vacío si no hay)
port_pid() {
  local port=$1
  lsof -ti:$port 2>/dev/null | head -n1
}

# Busca un puerto libre a partir de un puerto preferido
# Uso: find_free_port <puerto_inicial> [max_intentos]
find_free_port() {
  local start_port=${1:-3000}
  local max_attempts=${2:-50}
  local port=$start_port
  for ((i=0; i<max_attempts; i++)); do
    if ! check_port "$port"; then
      echo "$port"
      return 0
    fi
    port=$((port+1))
  done
  # Si no se encontró, devolver el inicial
  echo "$start_port"
  return 1
}

# Imprime un reporte corto del estado de un puerto
report_port() {
  local name=$1
  local port=$2
  if check_port "$port"; then
    local pid="$(port_pid "$port")"
    echo "❌ ${name}: puerto ${port} en uso (PID: ${pid})"
  else
    echo "✅ ${name}: puerto ${port} libre"
  fi
}

export -f check_port
export -f find_free_port
export -f report_port
