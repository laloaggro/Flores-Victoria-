#!/usr/bin/env bash
set -euo pipefail

BASE="http://localhost:9000"
GATEWAY="http://localhost:3000"
COOKIE="/tmp/admin-console-cookie.txt"

echo "== Validación Consola de Administración =="

# 1) Check admin-site
code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/health" || true)
if [[ "$code" != "200" && "$code" != "503" ]]; then
  echo "[FALLO] admin-site no responde en $BASE/health (code=$code)"; exit 1
else
  echo "[OK] admin-site responde (code=$code)"
fi

# 2) Intentar login en Gateway y set-cookie (si Gateway está arriba)
LOGIN_PAYLOAD='{"email":"admin@flores.local","password":"admin123"}'
TOKEN=""
if curl -s "$GATEWAY/health" >/dev/null 2>&1; then
  echo "[INFO] Gateway responde, intentando login..."
  TOKEN=$(curl -s -X POST "$GATEWAY/api/auth/login" -H "Content-Type: application/json" -d "$LOGIN_PAYLOAD" | jq -r '.data.token // empty' || true)
  if [[ -n "$TOKEN" ]]; then
    echo "[OK] Token obtenido (${#TOKEN} chars). Seteando cookie..."
    curl -s -X POST "$BASE/auth/set-cookie" -H "Content-Type: application/json" -d "{\"token\":\"$TOKEN\"}" -c "$COOKIE" >/dev/null
    echo "[OK] Cookie seteada en $COOKIE"
  else
    echo "[WARN] No se pudo obtener token. Continuando sin endpoints protegidos."
  fi
else
  echo "[WARN] Gateway no disponible. Saltando pasos protegidos."
fi

# 3) Validar endpoints protegidos si tenemos cookie
if [[ -f "$COOKIE" ]]; then
  echo "[INFO] Validando /admin/status..."
  curl -s "$BASE/admin/status" -b "$COOKIE" | jq '.ok, .health.ok' || true

  echo "[INFO] Listando servicios..."
  curl -s "$BASE/admin/services/list" -b "$COOKIE" | jq '.services' || true

  echo "[INFO] Logs de api-gateway (200 líneas)..."
  curl -s "$BASE/admin/logs?target=api-gateway&lines=200" -b "$COOKIE" | head -50 || true

  echo "[INFO] Ejecutando smoke (si scripts presentes)..."
  curl -s -X POST "$BASE/admin/pipeline" -H "Content-Type: application/json" -d '{"name":"smoke"}' -b "$COOKIE" | head -50 || true
fi

echo "== Validación finalizada =="
