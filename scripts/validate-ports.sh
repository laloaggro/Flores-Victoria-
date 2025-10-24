#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=/dev/null
source "$SCRIPT_DIR/port-guard.sh"

# Defaults preferidos
ADMIN_DEFAULT=${ADMIN_DEFAULT:-3021}
AI_SIMPLE_DEFAULT=${AI_SIMPLE_DEFAULT:-3012}
AI_STANDALONE_DEFAULT=${AI_STANDALONE_DEFAULT:-3002}
ORDER_DEFAULT=${ORDER_DEFAULT:-3004}

echo "🔎 Validación de puertos - Flores Victoria"
echo "-----------------------------------------"
report_port "Admin Panel" "$ADMIN_DEFAULT"
report_port "AI Simple" "$AI_SIMPLE_DEFAULT"
report_port "AI Standalone" "$AI_STANDALONE_DEFAULT"
report_port "Order Service" "$ORDER_DEFAULT"

# Sugerencias de puertos libres
echo "\n🧭 Sugerencias de puertos libres:"
ADMIN_SUGGEST=$(find_free_port "$ADMIN_DEFAULT" 50)
AI_SIMPLE_SUGGEST=$(find_free_port "$AI_SIMPLE_DEFAULT" 50)
AI_STANDALONE_SUGGEST=$(find_free_port "$AI_STANDALONE_DEFAULT" 50)
ORDER_SUGGEST=$(find_free_port "$ORDER_DEFAULT" 50)

echo "  Admin Panel:      ${ADMIN_SUGGEST}"
echo "  AI Simple:        ${AI_SIMPLE_SUGGEST}"
echo "  AI Standalone:    ${AI_STANDALONE_SUGGEST}"
echo "  Order Service:    ${ORDER_SUGGEST}"

# Código de salida: 0 si no hay conflictos en defaults, 1 si hay al menos uno
exit_code=0
for p in "$ADMIN_DEFAULT" "$AI_SIMPLE_DEFAULT" "$AI_STANDALONE_DEFAULT" "$ORDER_DEFAULT"; do
  if check_port "$p"; then
    exit_code=1
  fi

done

exit $exit_code
