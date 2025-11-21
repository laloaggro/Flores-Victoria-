#!/bin/bash
# Script para reescribir automáticamente los mensajes de commit al español

set -e

cd "$(dirname "$0")/.."

echo "🔄 Reescribiendo commits al español..."

# Backup de la rama actual
CURRENT_BRANCH=$(git branch --show-current)
git branch backup-before-spanish-$CURRENT_BRANCH 2>/dev/null || true

# Usar git filter-branch para reescribir los mensajes
git filter-branch -f --msg-filter '
  read msg
  case "$msg" in
    "test: add comprehensive test suite across services")
      echo "test: agregar suite completa de tests en todos los servicios"
      echo ""
      echo "📊 Cobertura: 28.94%"
      echo "Nuevos tests:"
      echo "- product-service: productUtils.test.js (20 casos)"
      echo "- cart-service: cartController.test.js (10 casos)"
      echo "- API Gateway: tests middleware y utilidades"
      echo ""
      echo "Tests agregados: 50+"
      echo "Tests pasando: 536"
      ;;
    "test(api-gateway): add comprehensive middleware tests")
      echo "test(api-gateway): agregar tests completos de middleware"
      echo ""
      echo "✅ Nuevos tests de middleware:"
      echo "- cache.test.js (5 tests)"
      echo "- auth.test.js (6 tests)"
      echo "- security.test.js (8 tests)"
      echo "- request-id.test.js (11 tests)"
      echo ""
      echo "✅ Nuevos tests unitarios:"
      echo "- mcp-helper.test.js (10 tests)"
      echo "- config.test.js (10 tests)"
      echo ""
      echo "Incremento de cobertura: 26.37% → 28.94%"
      ;;
    "fix(tests): resolve 19 failing integration tests")
      echo "fix(tests): resolver 19 tests de integración fallidos"
      echo ""
      echo "🔧 Correcciones aplicadas:"
      echo "- Agregado middleware Content-Type global"
      echo "- Función handleProxyError para errores consistentes"
      echo "- Agregado onError a todos los proxies"
      echo ""
      echo "Resultado: 20/20 tests pasando ✅"
      ;;
    "refactor(api-gateway): complete logger migration in middleware utilities")
      echo "refactor(api-gateway): completar migración a logger en utilidades de middleware"
      echo ""
      echo "🔄 Archivos migrados:"
      echo "- middleware/cache.js (8 ocurrencias)"
      echo "- middleware/rateLimiter.js (5 ocurrencias)"
      echo ""
      echo "console.log → logger.info"
      echo "console.error → logger.error"
      ;;
    "refactor(api-gateway): complete console to logger migration in app.js")
      echo "refactor(api-gateway): completar migración de console a logger en app.js"
      echo ""
      echo "🔄 7 ocurrencias migradas:"
      echo "- Endpoints de desarrollo con logger estructurado"
      echo "- Mensajes de error con contexto apropiado"
      echo ""
      echo "console.error → logger.error con objeto de contexto"
      ;;
    "refactor(product-service): migrar console a logger")
      echo "$msg"
      ;;
    "refactor(auth-service): migrar console a logger en archivos config")
      echo "$msg"
      ;;
    "refactor: migrar console a logger en archivos app.js")
      echo "$msg"
      ;;
    "refactor: migrar console a logger en config y helpers")
      echo "$msg"
      ;;
    "refactor(tests): migrar console a logger en tests unitarios")
      echo "$msg"
      ;;
    "refactor(api-gateway): migrate all routes to http-proxy-middleware")
      echo "refactor(api-gateway): migrar todas las rutas a http-proxy-middleware"
      echo ""
      echo "🚀 Migración completa del API Gateway:"
      echo "- 12 proxies configurados con http-proxy-middleware"
      echo "- Manejo consistente de errores"
      echo "- Contexto de servicio en logs"
      echo ""
      echo "Antes: múltiples configuraciones manuales"
      echo "Ahora: proxies estandarizados"
      ;;
    *)
      echo "$msg"
      ;;
  esac
' HEAD~11..HEAD

echo "✅ Commits reescritos al español"
echo "ℹ️  Branch de respaldo creado: backup-before-spanish-$CURRENT_BRANCH"
echo ""
echo "Para verificar los cambios, ejecuta:"
echo "  git log --oneline -12"
