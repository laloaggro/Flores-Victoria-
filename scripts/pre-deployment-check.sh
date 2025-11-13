#!/bin/bash

# ==========================================
# PRE-DEPLOYMENT CHECKLIST
# Flores Victoria - Validate Before Deploy
# ==========================================

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔═══════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   PRE-DEPLOYMENT VALIDATION                   ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════╝${NC}"
echo ""

CHECKS_PASSED=0
CHECKS_FAILED=0
WARNINGS=0

# ==========================================
# 1. ENVIRONMENT VARIABLES
# ==========================================
echo -e "${YELLOW}📋 Verificando variables de entorno...${NC}"

if [ ! -f .env ]; then
    echo -e "${RED}❌ Archivo .env no encontrado${NC}"
    ((CHECKS_FAILED++))
else
    echo -e "${GREEN}✅ Archivo .env existe${NC}"
    ((CHECKS_PASSED++))
    
    # Check for default passwords
    if grep -q "CHANGE_THIS\|your_password_here\|admin123\|password" .env; then
        echo -e "${YELLOW}⚠️  ADVERTENCIA: Contraseñas por defecto detectadas en .env${NC}"
        ((WARNINGS++))
    else
        echo -e "${GREEN}✅ No se detectaron contraseñas por defecto${NC}"
        ((CHECKS_PASSED++))
    fi
    
    # Check required variables
    REQUIRED_VARS=(
        "MONGO_INITDB_ROOT_PASSWORD"
        "POSTGRES_PASSWORD"
        "JWT_SECRET"
        "RABBITMQ_DEFAULT_PASS"
    )
    
    for var in "${REQUIRED_VARS[@]}"; do
        if grep -q "^${var}=" .env; then
            echo -e "${GREEN}✅ $var configurado${NC}"
            ((CHECKS_PASSED++))
        else
            echo -e "${RED}❌ $var faltante${NC}"
            ((CHECKS_FAILED++))
        fi
    done
fi

echo ""

# ==========================================
# 2. DOCKER CONFIGURATION
# ==========================================
echo -e "${YELLOW}🐳 Verificando Docker...${NC}"

if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker no está instalado${NC}"
    ((CHECKS_FAILED++))
else
    echo -e "${GREEN}✅ Docker instalado${NC}"
    ((CHECKS_PASSED++))
    
    # Check Docker version
    DOCKER_VERSION=$(docker --version | grep -oP '\d+\.\d+\.\d+' | head -1)
    echo -e "   Versión: $DOCKER_VERSION"
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${RED}❌ Docker Compose no está instalado${NC}"
    ((CHECKS_FAILED++))
else
    echo -e "${GREEN}✅ Docker Compose instalado${NC}"
    ((CHECKS_PASSED++))
fi

# Check docker-compose.oracle.yml syntax
if docker compose -f docker-compose.oracle.yml config > /dev/null 2>&1; then
    echo -e "${GREEN}✅ docker-compose.oracle.yml válido${NC}"
    ((CHECKS_PASSED++))
else
    echo -e "${RED}❌ docker-compose.oracle.yml tiene errores de sintaxis${NC}"
    ((CHECKS_FAILED++))
fi

echo ""

# ==========================================
# 3. FRONTEND BUILD
# ==========================================
echo -e "${YELLOW}🎨 Verificando frontend...${NC}"

if [ -d "frontend/dist" ]; then
    echo -e "${GREEN}✅ Frontend build existe${NC}"
    ((CHECKS_PASSED++))
    
    DIST_SIZE=$(du -sh frontend/dist | cut -f1)
    echo -e "   Tamaño: $DIST_SIZE"
else
    echo -e "${YELLOW}⚠️  Frontend no está compilado${NC}"
    echo -e "   Ejecutar: cd frontend && npm run build"
    ((WARNINGS++))
fi

if [ -f "frontend/package.json" ]; then
    if [ ! -d "frontend/node_modules" ]; then
        echo -e "${YELLOW}⚠️  Dependencias del frontend no instaladas${NC}"
        ((WARNINGS++))
    else
        echo -e "${GREEN}✅ Dependencias del frontend instaladas${NC}"
        ((CHECKS_PASSED++))
    fi
fi

echo ""

# ==========================================
# 4. SSL/TLS CERTIFICATES
# ==========================================
echo -e "${YELLOW}🔒 Verificando certificados SSL...${NC}"

if [ -d "ssl" ]; then
    if [ -f "ssl/fullchain.pem" ] && [ -f "ssl/privkey.pem" ]; then
        echo -e "${GREEN}✅ Certificados SSL encontrados${NC}"
        ((CHECKS_PASSED++))
        
        # Check expiration
        if command -v openssl &> /dev/null; then
            EXPIRY=$(openssl x509 -enddate -noout -in ssl/fullchain.pem | cut -d= -f2)
            echo -e "   Expira: $EXPIRY"
        fi
    else
        echo -e "${YELLOW}⚠️  Certificados SSL no encontrados${NC}"
        echo -e "   Para producción, configurar con Let's Encrypt"
        ((WARNINGS++))
    fi
else
    echo -e "${YELLOW}⚠️  Directorio ssl/ no existe${NC}"
    ((WARNINGS++))
fi

echo ""

# ==========================================
# 5. DISK SPACE
# ==========================================
echo -e "${YELLOW}💾 Verificando espacio en disco...${NC}"

AVAILABLE_SPACE=$(df -BG / | awk 'NR==2 {print $4}' | sed 's/G//')

if [ "$AVAILABLE_SPACE" -gt 10 ]; then
    echo -e "${GREEN}✅ Espacio suficiente: ${AVAILABLE_SPACE}GB disponibles${NC}"
    ((CHECKS_PASSED++))
elif [ "$AVAILABLE_SPACE" -gt 5 ]; then
    echo -e "${YELLOW}⚠️  Espacio limitado: ${AVAILABLE_SPACE}GB disponibles${NC}"
    ((WARNINGS++))
else
    echo -e "${RED}❌ Espacio insuficiente: ${AVAILABLE_SPACE}GB disponibles${NC}"
    echo -e "   Se requieren al menos 5GB libres"
    ((CHECKS_FAILED++))
fi

echo ""

# ==========================================
# 6. NETWORK PORTS
# ==========================================
echo -e "${YELLOW}🌐 Verificando puertos...${NC}"

PORTS_TO_CHECK=(80 443 3000 5432 27017 6379 16686 9090)
PORTS_IN_USE=()

for port in "${PORTS_TO_CHECK[@]}"; do
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1 || netstat -tuln 2>/dev/null | grep -q ":$port "; then
        PORTS_IN_USE+=($port)
    fi
done

if [ ${#PORTS_IN_USE[@]} -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Puertos en uso: ${PORTS_IN_USE[*]}${NC}"
    echo -e "   Estos puertos serán liberados durante el deployment"
    ((WARNINGS++))
else
    echo -e "${GREEN}✅ Todos los puertos están disponibles${NC}"
    ((CHECKS_PASSED++))
fi

echo ""

# ==========================================
# 7. BACKUP CHECK
# ==========================================
echo -e "${YELLOW}💾 Verificando sistema de backups...${NC}"

if [ -f "scripts/backup-databases.sh" ]; then
    echo -e "${GREEN}✅ Script de backup existe${NC}"
    ((CHECKS_PASSED++))
    
    if [ -x "scripts/backup-databases.sh" ]; then
        echo -e "${GREEN}✅ Script de backup es ejecutable${NC}"
        ((CHECKS_PASSED++))
    else
        echo -e "${YELLOW}⚠️  Script de backup no es ejecutable${NC}"
        echo -e "   Ejecutar: chmod +x scripts/backup-databases.sh"
        ((WARNINGS++))
    fi
else
    echo -e "${YELLOW}⚠️  Script de backup no encontrado${NC}"
    ((WARNINGS++))
fi

echo ""

# ==========================================
# 8. DEPLOYMENT SCRIPT
# ==========================================
echo -e "${YELLOW}🚀 Verificando script de deployment...${NC}"

if [ -f "deploy-oracle.sh" ]; then
    echo -e "${GREEN}✅ Script deploy-oracle.sh existe${NC}"
    ((CHECKS_PASSED++))
    
    if [ -x "deploy-oracle.sh" ]; then
        echo -e "${GREEN}✅ Script de deployment es ejecutable${NC}"
        ((CHECKS_PASSED++))
    else
        echo -e "${YELLOW}⚠️  Script de deployment no es ejecutable${NC}"
        echo -e "   Ejecutar: chmod +x deploy-oracle.sh"
        ((WARNINGS++))
    fi
else
    echo -e "${RED}❌ Script deploy-oracle.sh no encontrado${NC}"
    ((CHECKS_FAILED++))
fi

echo ""

# ==========================================
# 9. GIT STATUS
# ==========================================
echo -e "${YELLOW}📝 Verificando Git...${NC}"

if [ -d ".git" ]; then
    # Check for uncommitted changes
    if git diff-index --quiet HEAD -- 2>/dev/null; then
        echo -e "${GREEN}✅ No hay cambios sin commitear${NC}"
        ((CHECKS_PASSED++))
    else
        echo -e "${YELLOW}⚠️  Hay cambios sin commitear${NC}"
        echo -e "   Considerar hacer commit antes del deployment"
        ((WARNINGS++))
    fi
    
    # Show current branch
    BRANCH=$(git branch --show-current)
    echo -e "   Branch actual: ${BLUE}$BRANCH${NC}"
else
    echo -e "${YELLOW}⚠️  No es un repositorio Git${NC}"
    ((WARNINGS++))
fi

echo ""

# ==========================================
# SUMMARY
# ==========================================
echo -e "${BLUE}╔═══════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   RESUMEN DE VALIDACIÓN                       ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════╝${NC}"
echo ""

TOTAL=$((CHECKS_PASSED + CHECKS_FAILED))

echo -e "Checks totales: ${BLUE}$TOTAL${NC}"
echo -e "${GREEN}✅ Pasados: $CHECKS_PASSED${NC}"
echo -e "${RED}❌ Fallidos: $CHECKS_FAILED${NC}"
echo -e "${YELLOW}⚠️  Advertencias: $WARNINGS${NC}"
echo ""

if [ $CHECKS_FAILED -eq 0 ]; then
    echo -e "${GREEN}╔═══════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║   ✅ LISTO PARA DEPLOYMENT                    ║${NC}"
    echo -e "${GREEN}╚═══════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "Ejecutar: ${BLUE}./deploy-oracle.sh${NC}"
    echo ""
    exit 0
else
    echo -e "${RED}╔═══════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║   ❌ NO LISTO PARA DEPLOYMENT                 ║${NC}"
    echo -e "${RED}╚═══════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "Corregir los errores antes de continuar"
    echo ""
    exit 1
fi
