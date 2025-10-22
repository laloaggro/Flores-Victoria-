#!/usr/bin/env bash
set -euo pipefail

GW="http://localhost:3000"
email_user="cliente@flores.local"
email_worker="trabajador@flores.local"
email_admin="admin@flores.local"
pass="admin123"

jq_check() { command -v jq >/dev/null 2>&1 || { echo "Se requiere 'jq' (apt install jq)"; exit 1; }; }

register() {
  local email="$1"; local role="$2"
  echo "== Registrando $role ($email) =="
  curl -s -X POST "$GW/api/auth/register" \
    -H 'Content-Type: application/json' \
    -d "{\"name\":\"$role demo\",\"email\":\"$email\",\"password\":\"$pass\",\"role\":\"$role\"}" | jq
}

login() {
  local email="$1"
  curl -s -X POST "$GW/api/auth/login" -H 'Content-Type: application/json' \
    -d "{\"email\":\"$email\",\"password\":\"$pass\"}"
}

jq_check

# Intentar registrar; si ya existen, solo mostrar profile
register "$email_user" user || true
register "$email_worker" worker || true
register "$email_admin" admin || true

echo "== Verificando perfiles =="
for email in "$email_user" "$email_worker" "$email_admin"; do
  tok=$(login "$email" | jq -r '.data.token // empty')
  if [[ -n "$tok" ]]; then
    echo "-- $email --"
    curl -s "$GW/api/auth/profile" -H "Authorization: Bearer $tok" | jq
  else
    echo "No fue posible loguear $email"
  fi
done

echo "Listo. Usa estas cuentas para validar roles:"
cat <<EOF
- Usuario:     $email_user / $pass
- Trabajador:  $email_worker / $pass
- Administrador: $email_admin / $pass
EOF
