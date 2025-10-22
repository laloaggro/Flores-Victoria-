#!/bin/bash

# Script de validación completa del proyecto Flores Victoria
# Ejecuta todas las validaciones y genera un reporte completo

set -e

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║     VALIDACIÓN COMPLETA - FLORES VICTORIA                    ║"
echo "║     Ejecutando todas las verificaciones del sistema          ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Contadores
TESTS_PASSED=0
TESTS_FAILED=0
WARNINGS=0

# Función para logging
log_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

log_success() {
    echo -e "${GREEN}✓${NC} $1"
    ((TESTS_PASSED++))
}

log_error() {
    echo -e "${RED}✗${NC} $1"
    ((TESTS_FAILED++))
}

log_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
    ((WARNINGS++))
}

# Crear directorio de reportes
REPORT_DIR="./validation-reports"
mkdir -p "$REPORT_DIR"
REPORT_FILE="$REPORT_DIR/validation-report-$(date +%Y%m%d-%H%M%S).txt"

# Iniciar reporte
{
    echo "=================================================="
    echo "REPORTE DE VALIDACIÓN COMPLETA - FLORES VICTORIA"
    echo "Fecha: $(date '+%Y-%m-%d %H:%M:%S')"
    echo "=================================================="
    echo ""
} > "$REPORT_FILE"

log_info "Iniciando validaciones..."
echo ""

# 1. Verificar instalación de Node.js y npm
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1. Verificando entorno de desarrollo"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    log_success "Node.js instalado: $NODE_VERSION"
    echo "Node.js: $NODE_VERSION" >> "$REPORT_FILE"
else
    log_error "Node.js no encontrado"
    echo "Node.js: NO INSTALADO" >> "$REPORT_FILE"
fi

if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    log_success "npm instalado: $NPM_VERSION"
    echo "npm: $NPM_VERSION" >> "$REPORT_FILE"
else
    log_error "npm no encontrado"
    echo "npm: NO INSTALADO" >> "$REPORT_FILE"
fi

if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    log_success "Docker instalado: $DOCKER_VERSION"
    echo "Docker: $DOCKER_VERSION" >> "$REPORT_FILE"
else
    log_warning "Docker no encontrado"
    echo "Docker: NO INSTALADO" >> "$REPORT_FILE"
fi

echo ""

# 2. Verificar dependencias del proyecto
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2. Verificando dependencias del proyecto"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -f "package.json" ]; then
    log_success "package.json encontrado"
    
    if [ -d "node_modules" ]; then
        log_success "node_modules instalado"
        echo "Dependencias: INSTALADAS" >> "$REPORT_FILE"
    else
        log_warning "node_modules no encontrado - ejecute npm install"
        echo "Dependencias: FALTANTES" >> "$REPORT_FILE"
    fi
else
    log_error "package.json no encontrado"
    echo "package.json: NO ENCONTRADO" >> "$REPORT_FILE"
fi

echo ""

# 3. Ejecutar linting
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3. Ejecutando ESLint"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if npm run lint > /dev/null 2>&1; then
    log_success "ESLint: Sin errores"
    echo "ESLint: PASADO" >> "$REPORT_FILE"
else
    log_warning "ESLint: Advertencias o errores encontrados"
    echo "ESLint: ADVERTENCIAS" >> "$REPORT_FILE"
    npm run lint >> "$REPORT_FILE" 2>&1 || true
fi

echo ""

# 4. Verificar formato de código
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4. Verificando formato de código (Prettier)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if npm run format:check > /dev/null 2>&1; then
    log_success "Prettier: Formato correcto"
    echo "Prettier: PASADO" >> "$REPORT_FILE"
else
    log_warning "Prettier: Archivos sin formatear"
    echo "Prettier: ADVERTENCIAS" >> "$REPORT_FILE"
fi

echo ""

# 5. Ejecutar tests unitarios
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "5. Ejecutando tests unitarios"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if npm run test:unit > /dev/null 2>&1; then
    log_success "Tests unitarios: PASADOS"
    echo "Tests Unitarios: PASADOS" >> "$REPORT_FILE"
else
    log_warning "Tests unitarios: Algunos tests fallaron"
    echo "Tests Unitarios: FALLIDOS" >> "$REPORT_FILE"
    npm run test:unit >> "$REPORT_FILE" 2>&1 || true
fi

echo ""

# 6. Ejecutar tests de integración
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "6. Ejecutando tests de integración"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if npm run test:integration > /dev/null 2>&1; then
    log_success "Tests de integración: PASADOS"
    echo "Tests Integración: PASADOS" >> "$REPORT_FILE"
else
    log_warning "Tests de integración: Algunos tests fallaron"
    echo "Tests Integración: FALLIDOS" >> "$REPORT_FILE"
    npm run test:integration >> "$REPORT_FILE" 2>&1 || true
fi

echo ""

# 7. Generar reporte de cobertura
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "7. Generando reporte de cobertura"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if npm run test:coverage > /dev/null 2>&1; then
    log_success "Cobertura de tests generada"
    echo "Cobertura: GENERADA" >> "$REPORT_FILE"
    
    if [ -f "coverage/coverage-summary.json" ]; then
        log_info "Ver reporte en: coverage/lcov-report/index.html"
    fi
else
    log_warning "No se pudo generar reporte de cobertura"
    echo "Cobertura: ERROR" >> "$REPORT_FILE"
fi

echo ""

# 8. Verificar archivos de configuración
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "8. Verificando archivos de configuración"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

CONFIG_FILES=(
    ".eslintrc.js"
    ".prettierrc.json"
    "jest.config.js"
    "playwright.config.js"
    "docker-compose.dev.yml"
    "docker-compose.db.yml"
    ".github/workflows/ci-cd.yml"
)

for file in "${CONFIG_FILES[@]}"; do
    if [ -f "$file" ]; then
        log_success "Archivo encontrado: $file"
    else
        log_warning "Archivo faltante: $file"
    fi
done

echo ""

# 9. Verificar estructura de microservicios
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "9. Verificando estructura de microservicios"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

SERVICES=(
    "microservices/api-gateway"
    "microservices/auth-service"
    "microservices/product-service"
    "frontend"
    "admin-panel"
)

for service in "${SERVICES[@]}"; do
    if [ -d "$service" ]; then
        log_success "Servicio encontrado: $service"
    else
        log_warning "Servicio faltante: $service"
    fi
done

echo ""

# 10. Verificar servicios Docker
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "10. Verificando servicios Docker"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if command -v docker-compose &> /dev/null || command -v docker &> /dev/null; then
    if docker ps > /dev/null 2>&1; then
        RUNNING_CONTAINERS=$(docker ps --format "{{.Names}}" | grep -c "flores" || echo "0")
        log_info "Contenedores de Flores Victoria en ejecución: $RUNNING_CONTAINERS"
        echo "Contenedores activos: $RUNNING_CONTAINERS" >> "$REPORT_FILE"
    else
        log_warning "Docker daemon no está corriendo"
        echo "Docker daemon: NO CORRIENDO" >> "$REPORT_FILE"
    fi
else
    log_warning "Docker no disponible"
fi

echo ""

# 11. Auditar dependencias de seguridad
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "11. Auditando vulnerabilidades de seguridad"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

npm audit --audit-level=moderate >> "$REPORT_FILE" 2>&1 || log_warning "Vulnerabilidades encontradas - ver reporte"

echo ""

# Resumen final
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                     RESUMEN DE VALIDACIÓN                    ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}Tests Pasados:${NC}  $TESTS_PASSED"
echo -e "${RED}Tests Fallidos:${NC} $TESTS_FAILED"
echo -e "${YELLOW}Advertencias:${NC}   $WARNINGS"
echo ""
echo "Reporte completo guardado en: $REPORT_FILE"
echo ""

# Calcular porcentaje de éxito
TOTAL_TESTS=$((TESTS_PASSED + TESTS_FAILED))
if [ $TOTAL_TESTS -gt 0 ]; then
    SUCCESS_RATE=$(( TESTS_PASSED * 100 / TOTAL_TESTS ))
    echo "Tasa de éxito: ${SUCCESS_RATE}%"
    
    if [ $SUCCESS_RATE -ge 80 ]; then
        echo -e "${GREEN}✓ Proyecto en buen estado${NC}"
    elif [ $SUCCESS_RATE -ge 60 ]; then
        echo -e "${YELLOW}⚠ Proyecto requiere atención${NC}"
    else
        echo -e "${RED}✗ Proyecto requiere correcciones${NC}"
    fi
fi

echo ""
echo "Para ver el reporte completo:"
echo "  cat $REPORT_FILE"
echo ""

exit 0
