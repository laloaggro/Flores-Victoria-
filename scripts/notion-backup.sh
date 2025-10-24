#!/bin/bash
# Notion Backup Script
# Guarda un backup local de todo el contenido crítico del proyecto

BACKUP_DIR="docs/notion-backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_PATH="$BACKUP_DIR/backup_$TIMESTAMP"

echo "🔄 Flores Victoria - Notion Backup"
echo "===================================="
echo ""

# Crear directorio de backup
mkdir -p "$BACKUP_PATH"

echo "📦 Creando backup en: $BACKUP_PATH"
echo ""

# 1. Backup de configuración
echo "⚙️  Respaldando configuración..."
cp -r config/ "$BACKUP_PATH/config/" 2>/dev/null || echo "  ⚠️  No se encontró carpeta config/"
cp package.json "$BACKUP_PATH/" 2>/dev/null
cp .env.example "$BACKUP_PATH/" 2>/dev/null

# 2. Backup de documentación
echo "📚 Respaldando documentación..."
cp -r docs/ "$BACKUP_PATH/docs/" 2>/dev/null || echo "  ⚠️  No se encontró carpeta docs/"

# 3. Backup de scripts
echo "🔧 Respaldando scripts..."
cp -r scripts/ "$BACKUP_PATH/scripts/" 2>/dev/null || echo "  ⚠️  No se encontró carpeta scripts/"

# 4. Backup de servicios (solo archivos principales)
echo "🔌 Respaldando definición de servicios..."
cp *-service.js "$BACKUP_PATH/" 2>/dev/null || echo "  ⚠️  No se encontraron archivos *-service.js"
cp api-gateway.js "$BACKUP_PATH/" 2>/dev/null || echo "  ⚠️  No se encontró api-gateway.js"

# 5. Backup de logs recientes
echo "📋 Respaldando logs recientes..."
mkdir -p "$BACKUP_PATH/logs"
find logs/ -name "*.log" -mtime -7 -exec cp {} "$BACKUP_PATH/logs/" \; 2>/dev/null || echo "  ⚠️  No se encontraron logs"

# 6. Crear resumen del backup
cat > "$BACKUP_PATH/README.md" << EOF
# Backup de Flores Victoria

**Fecha:** $(date)
**Timestamp:** $TIMESTAMP

## Contenido

- ✅ Configuración del proyecto
- ✅ Documentación completa
- ✅ Scripts de automatización
- ✅ Definiciones de servicios
- ✅ Logs recientes (últimos 7 días)

## Cómo Restaurar

### Opción 1: Restauración Manual
1. Copia los archivos de este backup a tu proyecto
2. Revisa y actualiza las rutas si es necesario

### Opción 2: Restauración Automática
\`\`\`bash
# Desde la raíz del proyecto
bash docs/notion-backups/backup_$TIMESTAMP/restore.sh
\`\`\`

## Notas
- Este backup NO incluye: node_modules, logs antiguos, archivos temporales
- Verifica las variables de entorno antes de restaurar
- Los backups se crean automáticamente cada semana

## Contenido del Sistema

### Servicios Activos:
$(ps aux | grep -E "node.*(service|gateway)" | grep -v grep || echo "Ninguno")

### Puertos en Uso:
$(netstat -tlnp 2>/dev/null | grep -E ":(3[0-9]{3}|4[0-9]{3}|5[0-9]{3})" || echo "Ninguno")

### Git Status:
\`\`\`
$(git status --short 2>/dev/null || echo "No es un repositorio git")
\`\`\`

### Último Commit:
\`\`\`
$(git log -1 --oneline 2>/dev/null || echo "No hay commits")
\`\`\`

---
Generado automáticamente por: scripts/notion-backup.sh
EOF

# 7. Crear script de restauración
cat > "$BACKUP_PATH/restore.sh" << 'EOF'
#!/bin/bash
echo "🔄 Restaurando backup de Flores Victoria..."
echo ""

# Detectar directorio raíz del proyecto
if [ -f "package.json" ]; then
    PROJECT_ROOT="."
else
    echo "❌ Error: Ejecuta este script desde la raíz del proyecto"
    exit 1
fi

# Confirmar restauración
read -p "⚠️  Esto sobrescribirá archivos actuales. ¿Continuar? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Restauración cancelada"
    exit 1
fi

# Restaurar archivos
echo "📦 Restaurando configuración..."
cp -r config/* "$PROJECT_ROOT/config/" 2>/dev/null

echo "📚 Restaurando documentación..."
cp -r docs/* "$PROJECT_ROOT/docs/" 2>/dev/null

echo "🔧 Restaurando scripts..."
cp -r scripts/* "$PROJECT_ROOT/scripts/" 2>/dev/null

echo "✅ Restauración completada"
echo ""
echo "🔄 Próximos pasos:"
echo "  1. Verifica las variables de entorno (.env)"
echo "  2. Reinstala dependencias: npm install"
echo "  3. Verifica servicios: npm run ports:check:dev"
EOF

chmod +x "$BACKUP_PATH/restore.sh"

# 8. Comprimir backup (opcional)
echo "📦 Comprimiendo backup..."
tar -czf "$BACKUP_PATH.tar.gz" -C "$BACKUP_DIR" "backup_$TIMESTAMP" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "  ✅ Backup comprimido: $BACKUP_PATH.tar.gz"
    
    # Preguntar si eliminar carpeta sin comprimir
    read -p "¿Eliminar carpeta sin comprimir para ahorrar espacio? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rm -rf "$BACKUP_PATH"
        echo "  ✅ Carpeta eliminada, solo se mantiene .tar.gz"
    fi
fi

# 9. Limpiar backups antiguos (mantener últimos 5)
echo ""
echo "🧹 Limpiando backups antiguos..."
cd "$BACKUP_DIR"
ls -t backup_*.tar.gz 2>/dev/null | tail -n +6 | xargs -r rm
REMAINING=$(ls -1 backup_*.tar.gz 2>/dev/null | wc -l)
echo "  ✅ Backups actuales: $REMAINING"

echo ""
echo "✅ Backup completado exitosamente!"
echo ""
echo "📁 Ubicación: $BACKUP_PATH"
echo "📦 Comprimido: $BACKUP_PATH.tar.gz"
echo ""
echo "💡 Tips:"
echo "  - Guarda este backup en Google Drive/Dropbox"
echo "  - Ejecuta este script semanalmente"
echo "  - Para restaurar: bash $BACKUP_PATH/restore.sh"
echo ""
