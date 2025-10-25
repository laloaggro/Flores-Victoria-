#!/usr/bin/env bash
set -euo pipefail

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

TOTAL=0
OKS=0
FAILS=0

say() { echo -e "$1"; }

check_http() {
  local name="$1"; local url="$2"; local expected="${3:-200}";
  TOTAL=$((TOTAL+1))
  printf "%-28s" "$name"
  code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 "$url" || true)
  if [[ "$code" == "$expected" ]]; then
    echo -e " ${GREEN}✓ OK${NC} (HTTP $code)"; OKS=$((OKS+1)); return 0;
  else
    echo -e " ${RED}✗ FAIL${NC} (HTTP ${code:-N/A}, esperado $expected)"; FAILS=$((FAILS+1)); return 1;
  fi
}

check_port() {
  local name="$1"; local port="$2";
  TOTAL=$((TOTAL+1))
  printf "%-28s" "$name:$port"
  if ss -tlnp 2>/dev/null | grep -q ":$port " || lsof -i:"$port" >/dev/null 2>&1; then
    echo -e " ${GREEN}✓ LISTENING${NC}"; OKS=$((OKS+1)); return 0;
  else
    echo -e " ${RED}✗ NOT LISTENING${NC}"; FAILS=$((FAILS+1)); return 1;
  fi
}

say "\n🧪 CI Smoke Health Check (core)"
say "==================================\n"

# Minimal set aligned with docker-compose.core.yml
say "HTTP checks"
ADMIN_PORT="${ADMIN_PORT:-3021}"
# En desarrollo, los servicios de microservicios exponen puertos 400x al host.
# Permite override por variable de entorno ORDER_PORT si se requiere.
ORDER_PORT="${ORDER_PORT:-4004}"

check_http "Admin Panel" "http://localhost:${ADMIN_PORT}/health"
check_http "Order Service" "http://localhost:${ORDER_PORT}/health"

say "\nPort checks"
check_port "Admin Panel" "${ADMIN_PORT}"
check_port "Order Service" "${ORDER_PORT}"

say "\n📊 Summary"
say "Total: $TOTAL"
say "OK:    $OKS"
say "Fail:  $FAILS\n"

if [[ $FAILS -gt 0 ]]; then
  say "${RED}❌ Smoke health check failed${NC}"; exit 1;
else
  say "${GREEN}✅ Smoke health check passed${NC}"; exit 0;
fi
