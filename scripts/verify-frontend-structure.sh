#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FRONTEND_DIR="$ROOT_DIR/frontend"

red() { printf "\033[31m%s\033[0m\n" "$*"; }
green() { printf "\033[32m%s\033[0m\n" "$*"; }
yellow() { printf "\033[33m%s\033[0m\n" "$*"; }

if [ ! -d "$FRONTEND_DIR" ]; then
  red "[ERROR] Frontend directory not found at: $FRONTEND_DIR"
  exit 1
fi

echo "🔎 Verificando estructura del frontend en: $FRONTEND_DIR"

ISSUES=0

# 1) ESM config loaded as classic script (root cause of Unexpected token 'export')
if grep -RIn --include='*.html' "js/config/api.js" "$FRONTEND_DIR" | grep -v "type=\"module\"" >/dev/null 2>&1; then
  red "[FAIL] Se encontró inclusión clásica de js/config/api.js en HTML sin type=module."
  grep -RIn --include='*.html' "js/config/api.js" "$FRONTEND_DIR" | grep -v "type=\"module\"" || true
  echo "   ➤ Solución: remover <script src> y usar import ESM en los módulos."
  ISSUES=$((ISSUES+1))
else
  green "[OK] No hay inclusiones clásicas de js/config/api.js sin type=module."
fi

# 2) Backups y archivos temporales dentro de pages/
BACKUP_MATCHES=$(find "$FRONTEND_DIR/pages" -type f \( -name "*backup*" -o -name "*.backup*" -o -name "*-backup-*" -o -name "*.new" \) 2>/dev/null | wc -l | tr -d ' ')
if [ "$BACKUP_MATCHES" != "0" ]; then
  yellow "[WARN] Se detectaron $BACKUP_MATCHES archivos de backup/temporales en frontend/pages." 
  find "$FRONTEND_DIR/pages" -type f \( -name "*backup*" -o -name "*.backup*" -o -name "*-backup-*" -o -name "*.new" \) -maxdepth 3 2>/dev/null | sed 's/^/   • /'
  echo "   ➤ Recomendado: moverlos a frontend/backups/ o eliminarlos."
else
  green "[OK] No se encontraron backups o temporales en pages/."
fi

# 3) Mock de productos disponible
if [ -f "$FRONTEND_DIR/assets/mock/products.json" ]; then
  green "[OK] Mock de productos encontrado: assets/mock/products.json"
else
  yellow "[WARN] Mock de productos no encontrado en assets/mock/products.json"
  echo "   ➤ Recomendado: crear archivo de mock para desarrollo."
fi

# 4) SW en desarrollo (5175) – registrar condicional
if ! grep -RIn "localhost:5175" "$FRONTEND_DIR/js/sw-register.js" >/dev/null 2>&1; then
  yellow "[WARN] No se encontró guardia explícita para no registrar SW en localhost:5175"
  echo "   ➤ Recomendado: mantener bypass de SW en dev para evitar cachés."
else
  green "[OK] SW bypass en dev detectado."
fi

if [ "$ISSUES" -gt 0 ]; then
  red "\nResultado: $ISSUES problema(s) crítico(s) detectado(s)."
  exit 2
fi

green "\nResultado: Verificación de estructura del frontend OK."
