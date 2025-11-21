#!/bin/bash
# Script para traducir mensajes de commit al español

# Diccionario de traducciones
declare -A translations=(
  ["test: add comprehensive test suite across services"]="test: agregar suite completa de tests en todos los servicios

📊 Cobertura: 28.94%
Nuevos tests:
- product-service: productUtils.test.js (20 casos)
- cart-service: cartController.test.js (10 casos)
- API Gateway: tests middleware y utilidades
  
Tests agregados: 50+
Tests pasando: 536"

  ["test(api-gateway): add comprehensive middleware tests"]="test(api-gateway): agregar tests completos de middleware

✅ Nuevos tests de middleware:
- cache.test.js (5 tests)
- auth.test.js (6 tests)
- security.test.js (8 tests)
- request-id.test.js (11 tests)
  
✅ Nuevos tests unitarios:
- mcp-helper.test.js (10 tests)
- config.test.js (10 tests)
  
Incremento de cobertura: 26.37% → 28.94%"

  ["fix(tests): resolve 19 failing integration tests"]="fix(tests): resolver 19 tests de integración fallidos

🔧 Correcciones aplicadas:
- Agregado middleware Content-Type global
- Función handleProxyError para errores consistentes
- Agregado onError a todos los proxies
  
Resultado: 20/20 tests pasando ✅"

  ["refactor(api-gateway): complete logger migration in middleware utilities"]="refactor(api-gateway): completar migración a logger en utilidades de middleware

🔄 Archivos migrados:
- middleware/cache.js (8 ocurrencias)
- middleware/rateLimiter.js (5 ocurrencias)
  
console.log → logger.info
console.error → logger.error"

  ["refactor(api-gateway): complete console to logger migration in app.js"]="refactor(api-gateway): completar migración de console a logger en app.js

🔄 7 ocurrencias migradas:
- Endpoints de desarrollo con logger estructurado
- Mensajes de error con contexto apropiado
  
console.error → logger.error con objeto de contexto"

  ["refactor(product-service): migrar console a logger"]="refactor(product-service): migrar console a logger

🔄 Archivos actualizados:
- product-service/src/config/index.js
  
console.log/error → logger.info/error"

  ["refactor(auth-service): migrar console a logger en archivos config"]="refactor(auth-service): migrar console a logger en archivos config

🔄 Archivos actualizados:
- auth-service/src/config/index.js
  
console.log/error → logger.info/error"

  ["refactor: migrar console a logger en archivos app.js"]="refactor: migrar console a logger en archivos app.js

🔄 Servicios actualizados:
- notification-service
- payment-service
- wishlist-service
- review-service
- contact-service
- cart-service
- order-service
- user-service
  
console.log/error → logger.info/error"

  ["refactor: migrar console a logger en config y helpers"]="refactor: migrar console a logger en config y helpers

🔄 Archivos actualizados:
- Archivos mcp-helper.js en todos los servicios
- Archivos config/index.js
  
console.log/warn/error → logger.info/warn/error"

  ["refactor(tests): migrar console a logger en tests unitarios"]="refactor(tests): migrar console a logger en tests unitarios

🔄 Archivos de test actualizados:
- Tests de configuración de servicios
  
console.log/error → logger.info/error"

  ["refactor(api-gateway): migrate all routes to http-proxy-middleware"]="refactor(api-gateway): migrar todas las rutas a http-proxy-middleware

🚀 Migración completa del API Gateway:
- 12 proxies configurados con http-proxy-middleware
- Manejo consistente de errores
- Contexto de servicio en logs
  
Antes: múltiples configuraciones manuales
Ahora: proxies estandarizados"
)

# Obtener los commits a reescribir (los últimos 11, excluyendo el HEAD que ya fue modificado)
COMMITS=(
  "91cc6aa"  # test: add comprehensive test suite across services
  "281ca63"  # test(api-gateway): add comprehensive middleware tests
  "39b0442"  # fix(tests): resolve 19 failing integration tests
  "b2d2ac1"  # refactor(api-gateway): complete logger migration in middleware utilities
  "69cfcd8"  # refactor(api-gateway): complete console to logger migration in app.js
  "c080e03"  # refactor(product-service): migrar console a logger
  "5489392"  # refactor(auth-service): migrar console a logger en archivos config
  "e7537f6"  # refactor: migrar console a logger en archivos app.js
  "3ea67f5"  # refactor: migrar console a logger en config y helpers
  "2d85957"  # refactor(tests): migrar console a logger en tests unitarios
  "91e0403"  # refactor(api-gateway): migrate all routes to http-proxy-middleware
)

echo "Este script requiere interacción manual con git rebase."
echo "Por favor, ejecuta los siguientes comandos manualmente:"
echo ""
echo "git rebase -i HEAD~11"
echo ""
echo "Luego, en el editor que se abre, cambia 'pick' a 'reword' para cada commit que quieras modificar."
echo ""
echo "Traducciones sugeridas:"
echo "====================="
for commit in "${COMMITS[@]}"; do
  msg=$(git log --format=%s -n 1 "$commit")
  echo ""
  echo "Commit: $commit"
  echo "Mensaje actual: $msg"
  echo "Traducción sugerida: ${translations[$msg]}"
  echo "---"
done
