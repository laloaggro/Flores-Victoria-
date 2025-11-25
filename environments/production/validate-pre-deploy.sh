#!/bin/bash

###############################################################################
# Pre-Deploy Validation Script - Flores Victoria
# Valida que todo esté listo antes de hacer deploy a Oracle Cloud
###############################################################################

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   Pre-Deploy Validation - Flores Victoria${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Función para success
success() {
    echo -e "${GREEN}✓${NC} $1"
}

# Función para error
error() {
    echo -e "${RED}✗${NC} $1"
    ((ERRORS++))
}

# Función para warning
warning() {
    echo -e "${YELLOW}⚠${NC} $1"
    ((WARNINGS++))
}

# Función para info
info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

###############################################################################
# 1. VERIFICAR FRONTEND BUILD
###############################################################################
echo -e "\n${BLUE}[1/8] Verificando Frontend Build...${NC}"

if [ -d "../../frontend/dist" ]; then
    if [ -f "../../frontend/dist/index.html" ]; then
        # Verificar que tenga assets optimizados
        webp_count=$(find ../../frontend/dist -name "*.webp" 2>/dev/null | wc -l)
        if [ "$webp_count" -gt 0 ]; then
            success "Frontend buildeado con $webp_count imágenes WebP"
        else
            warning "Frontend buildeado pero sin imágenes WebP optimizadas"
        fi
        
        # Verificar compresión Brotli
        br_count=$(find ../../frontend/dist -name "*.br" 2>/dev/null | wc -l)
        if [ "$br_count" -gt 0 ]; then
            success "Archivos con compresión Brotli ($br_count archivos .br)"
        else
            warning "No se encontraron archivos .br (compresión Brotli)"
        fi
    else
        error "Frontend/dist existe pero falta index.html"
    fi
else
    error "Frontend no está buildeado. Ejecuta: cd frontend && npm run build"
fi

###############################################################################
# 2. VERIFICAR SECRETOS DE PRODUCCIÓN
###############################################################################
echo -e "\n${BLUE}[2/8] Verificando Secretos de Producción...${NC}"

if [ -f ".env.production" ]; then
    success "Archivo .env.production existe"
    
    # Verificar variables críticas
    critical_vars=(
        "JWT_SECRET"
        "MONGODB_PASSWORD"
        "POSTGRES_PASSWORD"
        "REDIS_PASSWORD"
        "SESSION_SECRET"
    )
    
    for var in "${critical_vars[@]}"; do
        if grep -q "^${var}=" .env.production 2>/dev/null; then
            # Verificar que no sea un placeholder
            value=$(grep "^${var}=" .env.production | cut -d'=' -f2)
            if [[ "$value" == *"CHANGE_ME"* ]] || [[ "$value" == *"YOUR_"* ]]; then
                error "${var} tiene valor placeholder - debe cambiarse"
            else
                success "${var} configurado"
            fi
        else
            error "${var} no encontrado en .env.production"
        fi
    done
else
    error "Archivo .env.production NO existe"
    info "Ejecuta: ./generate-production-secrets.sh"
fi

# Verificar secretos generados
if [ -d "../../config/production-secrets" ]; then
    if [ -f "../../config/production-secrets/.env.secrets" ]; then
        success "Secretos generados en config/production-secrets/"
    else
        warning "Directorio production-secrets existe pero falta .env.secrets"
    fi
else
    warning "No se han generado secretos. Ejecuta: ./generate-production-secrets.sh"
fi

###############################################################################
# 3. VERIFICAR DOCKER COMPOSE
###############################################################################
echo -e "\n${BLUE}[3/8] Verificando Docker Compose...${NC}"

if [ -f "docker-compose.production.yml" ]; then
    success "docker-compose.production.yml existe"
    
    # Verificar que no tenga puertos expuestos innecesarios
    exposed_ports=$(grep -E "^\s+- \"[0-9]+:" docker-compose.production.yml | grep -v "80:" | grep -v "443:" | grep -v "#" || true)
    if [ -n "$exposed_ports" ]; then
        warning "Puertos innecesarios expuestos en docker-compose.production.yml:"
        echo "$exposed_ports" | sed 's/^/    /'
    else
        success "Solo puertos necesarios expuestos (80, 443)"
    fi
else
    error "docker-compose.production.yml NO existe"
fi

###############################################################################
# 4. VERIFICAR SCRIPTS
###############################################################################
echo -e "\n${BLUE}[4/8] Verificando Scripts de Producción...${NC}"

scripts=("backup-production.sh" "generate-production-secrets.sh" "validate-pre-deploy.sh")

for script in "${scripts[@]}"; do
    if [ -f "$script" ]; then
        if [ -x "$script" ]; then
            success "$script existe y es ejecutable"
        else
            warning "$script existe pero NO es ejecutable"
            info "Ejecuta: chmod +x $script"
        fi
    else
        error "$script NO existe"
    fi
done

###############################################################################
# 5. VERIFICAR DOCUMENTACIÓN
###############################################################################
echo -e "\n${BLUE}[5/8] Verificando Documentación...${NC}"

docs=("README.md" "CHECKLIST_DEPLOY_ORACLE_CLOUD.md" ".env.production.example")

for doc in "${docs[@]}"; do
    if [ -f "$doc" ]; then
        success "$doc existe"
    else
        warning "$doc NO existe"
    fi
done

###############################################################################
# 6. VERIFICAR CREDENCIALES HARDCODEADAS
###############################################################################
echo -e "\n${BLUE}[6/8] Verificando Credenciales Hardcodeadas...${NC}"

# Buscar passwords hardcodeados en código JavaScript (excluir tests y destructuring)
hardcoded=$(grep -rE "password\s*=\s*['\"][^'\"{}]+['\"]" ../../microservices/ --include="*.js" | grep -v "process.env" | grep -v "node_modules" | grep -v ".example" | grep -v "__tests__" | grep -v ".test.js" | grep -v ".spec.js" | grep -v "const {" | grep -v "SELECT" || true)

if [ -n "$hardcoded" ]; then
    error "Se encontraron posibles credenciales hardcodeadas:"
    echo "$hardcoded" | head -5 | sed 's/^/    /'
else
    success "No se encontraron credenciales hardcodeadas en JavaScript"
fi

###############################################################################
# 7. VERIFICAR GITIGNORE
###############################################################################
echo -e "\n${BLUE}[7/8] Verificando .gitignore...${NC}"

if [ -f "../../.gitignore" ]; then
    # Verificar que se ignoren archivos críticos
    critical_ignores=(".env.production" "production-secrets" "backups")
    
    for ignore in "${critical_ignores[@]}"; do
        if grep -q "$ignore" ../../.gitignore; then
            success "$ignore está en .gitignore"
        else
            error "$ignore NO está en .gitignore - riesgo de seguridad"
        fi
    done
else
    error ".gitignore NO existe"
fi

###############################################################################
# 8. VERIFICAR TAMAÑO DEL BUILD
###############################################################################
echo -e "\n${BLUE}[8/8] Verificando Tamaño del Build...${NC}"

if [ -d "../../frontend/dist" ]; then
    size=$(du -sh ../../frontend/dist 2>/dev/null | awk '{print $1}')
    info "Tamaño del build: $size"
    
    # Verificar que no sea demasiado grande (>20MB es sospechoso)
    size_mb=$(du -sm ../../frontend/dist 2>/dev/null | awk '{print $1}')
    if [ "$size_mb" -gt 20 ]; then
        warning "Build muy grande (${size_mb}MB) - considerar optimizar más"
    else
        success "Tamaño del build aceptable (${size_mb}MB)"
    fi
fi

###############################################################################
# RESUMEN
###############################################################################
echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   Resumen de Validación${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "\n${GREEN}✅ TODO LISTO PARA DEPLOY${NC}"
    echo -e "No se encontraron errores ni advertencias.\n"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "\n${YELLOW}⚠ LISTO CON ADVERTENCIAS${NC}"
    echo -e "Se encontraron ${YELLOW}${WARNINGS} advertencias${NC}."
    echo -e "Revisa las advertencias antes de continuar.\n"
    exit 0
else
    echo -e "\n${RED}❌ NO LISTO PARA DEPLOY${NC}"
    echo -e "Se encontraron ${RED}${ERRORS} errores${NC} y ${YELLOW}${WARNINGS} advertencias${NC}."
    echo -e "Debes corregir los errores antes de hacer deploy.\n"
    exit 1
fi
