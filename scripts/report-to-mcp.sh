#!/bin/bash
# Script para enviar resultados de tests o métricas al MCP server
# Script to send test results or metrics to MCP server

MCP_URL="http://mcp-server:5050/events"
TYPE="$1"
PAYLOAD="$2"

curl -X POST "$MCP_URL" \
  -H 'Content-Type: application/json' \
  -d "{\"type\": \"$TYPE\", \"payload\": $PAYLOAD}"
