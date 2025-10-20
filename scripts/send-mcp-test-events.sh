#!/usr/bin/env bash
# Envia eventos de prueba a mcp-server desde el host (usa puerto expuesto 5051 si está mapeado)
set -euo pipefail
MCP_HOST=${1:-localhost}
MCP_PORT=${2:-5051}
URL="http://${MCP_HOST}:${MCP_PORT}/events"

echo "Enviando 3 eventos de prueba a ${URL}"
for i in 1 2 3; do
  payload=$(jq -n --arg i "$i" '{type: "ci_test_event", payload: {index: $i, message: "prueba desde script"}}')
  curl -sS -X POST "$URL" -H "Content-Type: application/json" -d "$payload" && echo " -> OK ($i)" || echo " -> ERROR ($i)"
  sleep 0.5
done

echo "Hecho" 
