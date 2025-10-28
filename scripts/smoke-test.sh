#!/usr/bin/env bash
set -euo pipefail

echo "==> Ejecutando smoke tests (API, Frontend, Admin Panel)"

pass() { echo "✅ $1"; }
fail() { echo "❌ $1"; exit 1; }

# Requiere curl y jq instalados en el host
command -v curl >/dev/null 2>&1 || { echo "curl no encontrado"; exit 1; }
command -v jq >/dev/null 2>&1 || { echo "jq no encontrado"; exit 1; }

# API Gateway health
if curl -fsS http://localhost:3000/health | jq -e '.status=="healthy"' >/dev/null; then
  pass "API Gateway /health"
else
  fail "API Gateway /health"
fi

# Products endpoint
if curl -fsS 'http://localhost:3000/api/products?limit=1' | jq -e '.products | length > 0' >/dev/null; then
  pass "Productos disponibles"
else
  fail "Productos no disponibles"
fi

# Promotions endpoint (puede estar vacío; validamos formato)
if curl -fsS 'http://localhost:3000/api/promotions' | jq -e '.promotions | type == "array"' >/dev/null; then
  pass "Promociones formato OK"
else
  fail "Promociones formato inválido"
fi

# Frontend health
if [[ "$(curl -fsS http://localhost:5173/health)" == "OK" ]]; then
  pass "Frontend /health"
else
  fail "Frontend /health"
fi

# Admin panel health
if curl -fsS http://localhost:3010/health | jq -e '.status=="OK"' >/dev/null; then
  pass "Admin Panel /health"
else
  fail "Admin Panel /health"
fi

echo "🎉 Smoke tests completados con éxito"