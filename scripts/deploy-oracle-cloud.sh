#!/bin/bash

# ========================================
# 🚀 Script de Deploy Automatizado
# Flores Victoria - Oracle Cloud
# ========================================

set -e  # Salir si hay errores

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuración
PROJECT_DIR="/var/www/flores-victoria"
BUILD_DIR="$PROJECT_DIR/frontend"
DEPLOY_DIR="/var/www/html"
BACKUP_DIR="/var/www/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Funciones
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar que estamos ejecutando como usuario correcto
if [ "$EUID" -eq 0 ]; then 
    log_error "No ejecutar como root. Usar sudo solo cuando sea necesario."
    exit 1
fi

# Banner
echo ""
echo "========================================="
echo "🚀 Flores Victoria - Deploy to Production"
echo "========================================="
echo ""

# 1. Verificar que el directorio del proyecto existe
log_info "Verificando directorios..."
if [ ! -d "$PROJECT_DIR" ]; then
    log_error "Directorio del proyecto no encontrado: $PROJECT_DIR"
    exit 1
fi
log_success "Directorio del proyecto OK"

# 2. Cambiar al directorio del proyecto
cd $PROJECT_DIR

# 3. Pull últimos cambios
log_info "Descargando últimos cambios desde Git..."
git fetch origin
CURRENT_BRANCH=$(git branch --show-current)
log_info "Branch actual: $CURRENT_BRANCH"
git pull origin $CURRENT_BRANCH
log_success "Código actualizado"

# 4. Cambiar al directorio frontend
cd $BUILD_DIR

# 5. Verificar Node.js y npm
log_info "Verificando Node.js..."
NODE_VERSION=$(node -v)
NPM_VERSION=$(npm -v)
log_info "Node: $NODE_VERSION | npm: $NPM_VERSION"

# 6. Instalar dependencias
log_info "Instalando dependencias..."
npm ci --production=false
log_success "Dependencias instaladas"

# 7. Ejecutar tests (opcional)
if [ "$1" != "--skip-tests" ]; then
    log_info "Ejecutando tests..."
    npm run lint || log_warning "Lint encontró warnings (continuando...)"
fi

# 8. Build de producción
log_info "Generando build de producción..."
npm run build

if [ ! -d "dist" ]; then
    log_error "Build falló - directorio dist no encontrado"
    exit 1
fi

BUILD_SIZE=$(du -sh dist | cut -f1)
log_success "Build completado (Tamaño: $BUILD_SIZE)"

# 9. Crear directorio de backups si no existe
sudo mkdir -p $BACKUP_DIR

# 10. Backup del deploy anterior
if [ -d "$DEPLOY_DIR" ] && [ "$(ls -A $DEPLOY_DIR)" ]; then
    log_info "Creando backup del deploy anterior..."
    BACKUP_NAME="backup_$TIMESTAMP"
    sudo tar -czf "$BACKUP_DIR/$BACKUP_NAME.tar.gz" -C $DEPLOY_DIR . 2>/dev/null || true
    
    # Mantener solo los últimos 5 backups
    cd $BACKUP_DIR
    ls -t backup_*.tar.gz 2>/dev/null | tail -n +6 | xargs -r sudo rm --
    
    BACKUP_SIZE=$(du -sh "$BACKUP_DIR/$BACKUP_NAME.tar.gz" 2>/dev/null | cut -f1 || echo "N/A")
    log_success "Backup creado: $BACKUP_NAME.tar.gz ($BACKUP_SIZE)"
fi

# 11. Limpiar directorio de deploy
log_info "Limpiando directorio de deploy..."
sudo rm -rf $DEPLOY_DIR/*
log_success "Directorio limpio"

# 12. Copiar nuevo build
log_info "Copiando archivos al servidor..."
sudo cp -r $BUILD_DIR/dist/* $DEPLOY_DIR/
log_success "Archivos copiados"

# 13. Ajustar permisos
log_info "Ajustando permisos..."
sudo chown -R www-data:www-data $DEPLOY_DIR
sudo find $DEPLOY_DIR -type f -exec chmod 644 {} \;
sudo find $DEPLOY_DIR -type d -exec chmod 755 {} \;
log_success "Permisos configurados"

# 14. Verificar configuración de nginx
log_info "Verificando configuración de nginx..."
sudo nginx -t

if [ $? -ne 0 ]; then
    log_error "Configuración de nginx inválida"
    
    # Restaurar backup si existe
    if [ -f "$BACKUP_DIR/backup_$TIMESTAMP.tar.gz" ]; then
        log_warning "Restaurando backup..."
        sudo rm -rf $DEPLOY_DIR/*
        sudo tar -xzf "$BACKUP_DIR/backup_$TIMESTAMP.tar.gz" -C $DEPLOY_DIR
        log_success "Backup restaurado"
    fi
    
    exit 1
fi

log_success "Configuración de nginx OK"

# 15. Recargar nginx
log_info "Recargando nginx..."
sudo systemctl reload nginx
log_success "Nginx recargado"

# 16. Limpiar cache de navegadores (opcional)
log_info "Limpiando cache..."
sudo sh -c "sync; echo 3 > /proc/sys/vm/drop_caches" 2>/dev/null || log_warning "No se pudo limpiar cache del sistema"

# 17. Verificar que el sitio responde
log_info "Verificando disponibilidad del sitio..."
sleep 2

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/ 2>/dev/null || echo "000")

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "301" ]; then
    log_success "Sitio respondiendo correctamente (HTTP $HTTP_CODE)"
else
    log_warning "Sitio responde con código: $HTTP_CODE"
fi

# 18. Resumen
echo ""
echo "========================================="
echo "✨ Deploy Completado Exitosamente"
echo "========================================="
echo ""
echo "📊 Información del Deploy:"
echo "  • Timestamp: $TIMESTAMP"
echo "  • Build size: $BUILD_SIZE"
echo "  • Branch: $CURRENT_BRANCH"
echo "  • Node: $NODE_VERSION"
echo ""
echo "🔗 URLs:"
echo "  • Producción: https://arreglosvictoria.com"
echo "  • Productos: https://arreglosvictoria.com/pages/products.html"
echo ""

# 19. Lighthouse Audit (opcional)
if command -v npx &> /dev/null && [ "$1" != "--skip-audit" ]; then
    log_info "Ejecutando Lighthouse audit..."
    
    AUDIT_DIR="/tmp/lighthouse-audits"
    mkdir -p $AUDIT_DIR
    AUDIT_FILE="$AUDIT_DIR/audit_${TIMESTAMP}.json"
    
    npx lighthouse https://arreglosvictoria.com/pages/products.html \
        --only-categories=performance \
        --output=json \
        --output-path=$AUDIT_FILE \
        --chrome-flags="--headless --no-sandbox" \
        --quiet 2>/dev/null || log_warning "Lighthouse audit falló"
    
    if [ -f "$AUDIT_FILE" ]; then
        echo ""
        echo "📊 Resultados de Performance:"
        
        cat $AUDIT_FILE | jq -r '
          "  • Performance: \((.categories.performance.score * 100) | round)/100",
          "  • FCP: \(.audits[\"first-contentful-paint\"].displayValue)",
          "  • LCP: \(.audits[\"largest-contentful-paint\"].displayValue)",
          "  • TBT: \(.audits[\"total-blocking-time\"].displayValue)",
          "  • CLS: \(.audits[\"cumulative-layout-shift\"].displayValue)"
        ' 2>/dev/null || log_warning "No se pudieron extraer métricas"
        
        echo ""
        log_success "Reporte guardado en: $AUDIT_FILE"
    fi
fi

echo ""
log_success "🎉 Deploy finalizado!"
echo ""

# 20. Comandos útiles
echo "💡 Comandos útiles:"
echo "  • Ver logs: sudo tail -f /var/log/nginx/access.log"
echo "  • Rollback: sudo tar -xzf $BACKUP_DIR/backup_$TIMESTAMP.tar.gz -C $DEPLOY_DIR"
echo "  • Reiniciar nginx: sudo systemctl restart nginx"
echo ""
