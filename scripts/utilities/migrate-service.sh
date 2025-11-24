#!/bin/bash

# Script para migrar microservicios a usar middlewares compartidos
# Uso: ./migrate-service.sh <service-name>

set -e

SERVICE_NAME=$1
if [ -z "$SERVICE_NAME" ]; then
    echo "❌ Error: Debes especificar el nombre del servicio"
    echo "Uso: ./migrate-service.sh <service-name>"
    echo "Ejemplo: ./migrate-service.sh auth-service"
    exit 1
fi

SERVICE_PATH="microservices/${SERVICE_NAME}"
APP_FILE="${SERVICE_PATH}/src/app.js"
BACKUP_FILE="${SERVICE_PATH}/src/app-backup-$(date +%Y%m%d_%H%M%S).js"

# Verificar que el servicio existe
if [ ! -d "$SERVICE_PATH" ]; then
    echo "❌ Error: El servicio '$SERVICE_NAME' no existe en $SERVICE_PATH"
    exit 1
fi

if [ ! -f "$APP_FILE" ]; then
    echo "❌ Error: No se encontró $APP_FILE"
    exit 1
fi

echo "🔄 Migrando servicio: $SERVICE_NAME"

# 1. Crear backup del archivo original
echo "📁 Creando backup: $BACKUP_FILE"
cp "$APP_FILE" "$BACKUP_FILE"

# 2. Analizar el archivo actual
echo "🔍 Analizando archivo actual..."

# Verificar si ya usa middlewares compartidos
if grep -q "shared/middleware" "$APP_FILE"; then
    echo "✅ El servicio ya parece usar middlewares compartidos"
    exit 0
fi

# 3. Contar líneas de código duplicado que se eliminarán
DUPLICATE_LINES=0

# Contar CORS
if grep -q "app.use(cors" "$APP_FILE"; then
    DUPLICATE_LINES=$((DUPLICATE_LINES + 1))
    echo "   📊 CORS detectado"
fi

# Contar JSON parsing
if grep -q "express.json" "$APP_FILE"; then
    DUPLICATE_LINES=$((DUPLICATE_LINES + 2))
    echo "   📊 JSON parsing detectado"
fi

# Contar rate limiting
if grep -q "rateLimit" "$APP_FILE"; then
    DUPLICATE_LINES=$((DUPLICATE_LINES + 8))
    echo "   📊 Rate limiting detectado"
fi

# Contar health check
if grep -q "app.get('/health'" "$APP_FILE"; then
    DUPLICATE_LINES=$((DUPLICATE_LINES + 10))
    echo "   📊 Health check detectado"
fi

echo "   📈 Líneas de código duplicado estimadas: $DUPLICATE_LINES"

# 4. Crear el archivo migrado
echo "🔧 Generando archivo migrado..."

cat > "${SERVICE_PATH}/src/app-migrated.js" << 'EOF'
// Archivo migrado automáticamente para usar middlewares compartidos
const express = require('express');

// Middlewares compartidos
const { applyCommonMiddleware } = require('../shared/middleware/common');
const { setupHealthChecks } = require('../shared/middleware/healthcheck');
const { setupErrorHandling } = require('../shared/middleware/errorHandler');

// Importaciones específicas del servicio (ajustar según necesidad)
const config = require('./config');
const routes = require('./routes'); // Ajustar según estructura

const app = express();

// 1. Aplicar middleware común (reemplaza CORS, JSON parsing, rate limiting)
applyCommonMiddleware(app, {
  serviceName: 'SERVICE_NAME_PLACEHOLDER',
  rateLimitOptions: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // Ajustar según necesidades del servicio
  },
});

// 2. Configurar health checks (reemplaza endpoints /health duplicados)
setupHealthChecks(app, 'SERVICE_NAME_PLACEHOLDER', {
  version: '1.0.0',
  // customHealthCheck: dbHealthCheck, // Descomentar si hay DB
});

// 3. Rutas específicas del servicio
// TODO: Ajustar según estructura del servicio
// app.use('/api/SERVICE_NAME_PLACEHOLDER', routes);

// 4. Ruta raíz informativa
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'SERVICE_DISPLAY_NAME - Arreglos Victoria',
    version: '1.0.0',
    service: 'SERVICE_NAME_PLACEHOLDER',
  });
});

// 5. Configurar manejo de errores (debe ir al final)
setupErrorHandling(app, 'SERVICE_NAME_PLACEHOLDER');

module.exports = app;
EOF

# Reemplazar placeholders
sed -i "s/SERVICE_NAME_PLACEHOLDER/${SERVICE_NAME}/g" "${SERVICE_PATH}/src/app-migrated.js"

# Generar nombre para mostrar
SERVICE_DISPLAY_NAME=$(echo "$SERVICE_NAME" | sed 's/-/ /g' | sed 's/\b\w/\U&/g')
sed -i "s/SERVICE_DISPLAY_NAME/${SERVICE_DISPLAY_NAME}/g" "${SERVICE_PATH}/src/app-migrated.js"

echo "✅ Archivo migrado generado: ${SERVICE_PATH}/src/app-migrated.js"

# 5. Crear checklist de tareas manuales
cat > "${SERVICE_PATH}/MIGRATION_CHECKLIST.md" << EOF
# 📋 Checklist de Migración - $SERVICE_NAME

## ✅ Completado Automáticamente
- [x] Backup del archivo original creado
- [x] Archivo migrado generado con middlewares compartidos
- [x] Eliminación estimada de $DUPLICATE_LINES líneas de código duplicado

## 📝 Tareas Manuales Pendientes

### 1. Revisar Importaciones
- [ ] Verificar que todas las importaciones necesarias estén incluidas
- [ ] Ajustar rutas de importación si es necesario
- [ ] Verificar configuración específica del servicio

### 2. Configurar Rutas
- [ ] Identificar las rutas principales del servicio
- [ ] Actualizar la configuración de rutas en app-migrated.js
- [ ] Verificar que los prefijos de ruta sean correctos

### 3. Health Checks Personalizados
- [ ] Si el servicio usa base de datos, descomentar y configurar dbHealthCheck
- [ ] Agregar verificaciones personalizadas si es necesario
- [ ] Probar endpoints /health, /ready, /metrics

### 4. Rate Limiting
- [ ] Ajustar límites de rate limiting según necesidades del servicio
- [ ] Configurar excepciones si es necesario

### 5. Testing
- [ ] Ejecutar tests existentes
- [ ] Verificar que todos los endpoints respondan correctamente
- [ ] Probar manejo de errores

### 6. Deployment
- [ ] Comparar archivo original vs migrado
- [ ] Reemplazar app.js con app-migrated.js
- [ ] Actualizar configuración de contenedor si es necesario

## 🔧 Comandos Útiles

\`\`\`bash
# Comparar archivos
diff ${SERVICE_PATH}/src/app.js ${SERVICE_PATH}/src/app-migrated.js

# Testing del servicio
cd ${SERVICE_PATH}
npm test

# Verificar health checks
curl http://localhost:PORT/health
curl http://localhost:PORT/ready
curl http://localhost:PORT/metrics
\`\`\`

## 📊 Métricas de Mejora

- **Líneas eliminadas**: ~$DUPLICATE_LINES líneas de código duplicado
- **Endpoints agregados**: /health, /ready, /metrics (mejorados)
- **Funcionalidades**: Logging estructurado, manejo de errores estandarizado
- **Mantenibilidad**: Cambios centralizados en shared/middleware/

---
**Fecha de migración**: $(date)
**Backup disponible en**: $BACKUP_FILE
EOF

echo "📋 Checklist creado: ${SERVICE_PATH}/MIGRATION_CHECKLIST.md"

# 6. Resumen final
echo ""
echo "🎉 Migración de $SERVICE_NAME completada!"
echo "📊 Resumen:"
echo "   • Backup: $BACKUP_FILE"
echo "   • Migrado: ${SERVICE_PATH}/src/app-migrated.js"
echo "   • Checklist: ${SERVICE_PATH}/MIGRATION_CHECKLIST.md"
echo "   • Líneas eliminadas: ~$DUPLICATE_LINES"
echo ""
echo "📋 Próximos pasos:"
echo "   1. Revisar el archivo migrado"
echo "   2. Completar tareas del checklist"
echo "   3. Probar el servicio migrado"
echo "   4. Reemplazar app.js cuando esté listo"
echo ""
echo "🔧 Para probar la migración:"
echo "   cd $SERVICE_PATH"
echo "   # Revisar cambios"
echo "   diff src/app.js src/app-migrated.js"