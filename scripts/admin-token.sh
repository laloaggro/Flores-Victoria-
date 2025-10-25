#!/bin/bash

# 🪙 Obtener token admin del Auth Service (demo)
# Uso:
#   ./scripts/admin-token.sh            # imprime solo el token de acceso
#   ADMIN_EMAIL=... ADMIN_PASSWORD=... ./scripts/admin-token.sh

set -e

AUTH_URL=${AUTH_URL:-"http://localhost:3017"}
EMAIL=${ADMIN_EMAIL:-"demo@flores-victoria.com"}
PASSWORD=${ADMIN_PASSWORD:-"demo123"}

resp=$(curl -s -X POST "$AUTH_URL/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

echo "$resp" | jq -r .accessToken
