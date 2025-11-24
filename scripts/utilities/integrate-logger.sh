#!/bin/bash

# 🔄 Script de Integración Automática de Logger
# Integra logger.js en un microservicio automáticamente

SERVICE_PATH="$1"

if [ -z "$SERVICE_PATH" ]; then
    echo "❌ Uso: $0 <ruta-al-microservicio>"
    echo "   Ejemplo: $0 /microservices/auth-service"
    exit 1
fi

if [ ! -d "$SERVICE_PATH" ]; then
    echo "❌ Error: El directorio $SERVICE_PATH no existe"
    exit 1
fi

SERVICE_NAME=$(basename "$SERVICE_PATH")

echo "🔧 Integrando logger en: $SERVICE_NAME"
echo ""

# Buscar archivo principal (server.js o index.js)
MAIN_FILE=""
if [ -f "$SERVICE_PATH/src/server.js" ]; then
    MAIN_FILE="$SERVICE_PATH/src/server.js"
elif [ -f "$SERVICE_PATH/src/index.js" ]; then
    MAIN_FILE="$SERVICE_PATH/src/index.js"
elif [ -f "$SERVICE_PATH/server.js" ]; then
    MAIN_FILE="$SERVICE_PATH/server.js"
elif [ -f "$SERVICE_PATH/index.js" ]; then
    MAIN_FILE="$SERVICE_PATH/index.js"
else
    echo "❌ No se encontró server.js o index.js"
    exit 1
fi

echo "📄 Archivo principal: $MAIN_FILE"

# Crear backup
BACKUP_FILE="${MAIN_FILE}.backup-$(date +%Y%m%d-%H%M%S)"
cp "$MAIN_FILE" "$BACKUP_FILE"
echo "💾 Backup creado: $BACKUP_FILE"

# Verificar si logger ya está importado
if grep -q "require.*logger" "$MAIN_FILE"; then
    echo "⚠️  Logger ya está importado en este archivo"
    echo "   Revisa manualmente para evitar duplicados"
else
    # Agregar import del logger después de los otros requires
    sed -i "/^const.*require/a const logger = require('./logger');" "$MAIN_FILE"
    echo "✅ Import de logger agregado"
fi

echo ""
echo "📝 Próximos pasos MANUALES:"
echo ""
echo "1. Reemplazar console.log por logger.info:"
echo "   Buscar:  console.log('mensaje')"
echo "   Cambiar: logger.info('mensaje')"
echo ""
echo "2. Reemplazar console.error por logger.error:"
echo "   Buscar:  console.error('error')"
echo "   Cambiar: logger.error('error')"
echo ""
echo "3. Agregar middleware de HTTP logging (después de crear app):"
echo ""
cat << 'EOF'
// Logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.logRequest(req, res, duration);
  });
  next();
});
EOF
echo ""
echo "4. Agregar error handler (al final de middlewares):"
echo ""
cat << 'EOF'
// Error handler
app.use((err, req, res, next) => {
  logger.logError(err, {
    method: req.method,
    url: req.url,
    ip: req.ip
  });
  res.status(500).json({ error: 'Internal Server Error' });
});
EOF
echo ""
echo "5. Rebuilder el contenedor:"
echo "   docker-compose up -d --build $SERVICE_NAME"
echo ""
echo "📖 Ver ejemplos completos en: ELK_INTEGRATION_GUIDE.md"
echo ""
