#!/bin/bash

# ==========================================
# DOCKER IMAGE OPTIMIZATION SCRIPT
# Analiza y optimiza todas las imágenes Docker
# ==========================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}╔═══════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   DOCKER IMAGE OPTIMIZATION                   ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════╝${NC}"
echo ""

# ==========================================
# 1. ANALIZAR IMÁGENES ACTUALES
# ==========================================
echo -e "${YELLOW}📊 Analizando imágenes existentes...${NC}"
echo ""

if docker images | grep -q "flores"; then
    echo -e "${BLUE}Imágenes actuales:${NC}"
    docker images | grep "flores" | awk '{print $1 "\t" $7 $8}'
    echo ""
    
    TOTAL_SIZE=$(docker images | grep "flores" | awk '{sum += $7} END {print sum}')
    echo -e "${YELLOW}Tamaño total: ~${TOTAL_SIZE}MB${NC}"
    echo ""
fi

# ==========================================
# 2. OPTIMIZAR DOCKERFILES
# ==========================================
echo -e "${YELLOW}🔧 Verificando optimizaciones en Dockerfiles...${NC}"
echo ""

CHECKS_PASSED=0
CHECKS_FAILED=0

# Verificar uso de alpine
for dockerfile in microservices/*/Dockerfile; do
    if grep -q "FROM node:.*-alpine" "$dockerfile"; then
        echo -e "${GREEN}✅ $(dirname $dockerfile) usa alpine${NC}"
        ((CHECKS_PASSED++))
    else
        echo -e "${RED}❌ $(dirname $dockerfile) NO usa alpine${NC}"
        ((CHECKS_FAILED++))
    fi
done

echo ""

# Verificar multi-stage builds
for dockerfile in microservices/*/Dockerfile; do
    if grep -q "AS builder" "$dockerfile"; then
        echo -e "${GREEN}✅ $(dirname $dockerfile) usa multi-stage${NC}"
        ((CHECKS_PASSED++))
    else
        echo -e "${YELLOW}⚠️  $(dirname $dockerfile) NO usa multi-stage${NC}"
    fi
done

echo ""

# ==========================================
# 3. BUILD OPTIMIZADO
# ==========================================
echo -e "${YELLOW}🏗️  ¿Construir imágenes optimizadas? (y/n)${NC}"
read -r BUILD_IMAGES

if [ "$BUILD_IMAGES" = "y" ] || [ "$BUILD_IMAGES" = "Y" ]; then
    echo ""
    echo -e "${BLUE}Construyendo imágenes optimizadas...${NC}"
    echo ""
    
    # Usar BuildKit para mejor caching
    export DOCKER_BUILDKIT=1
    export COMPOSE_DOCKER_CLI_BUILD=1
    
    # Build con docker-compose (más rápido con caché)
    docker compose -f docker-compose.oracle-optimized.yml build \
        --parallel \
        --compress \
        --pull \
        --progress=plain
    
    echo ""
    echo -e "${GREEN}✅ Imágenes construidas${NC}"
    echo ""
    
    # Mostrar nuevos tamaños
    echo -e "${BLUE}Nuevas imágenes:${NC}"
    docker images | grep "flores" | awk '{print $1 "\t" $7 $8}'
    echo ""
fi

# ==========================================
# 4. LIMPIEZA
# ==========================================
echo -e "${YELLOW}🧹 ¿Limpiar imágenes antiguas y caché? (y/n)${NC}"
read -r CLEANUP

if [ "$CLEANUP" = "y" ] || [ "$CLEANUP" = "Y" ]; then
    echo ""
    echo -e "${BLUE}Limpiando imágenes antiguas...${NC}"
    
    # Eliminar imágenes sin tag
    docker image prune -f
    
    # Eliminar build cache
    docker builder prune -f
    
    # Mostrar espacio recuperado
    echo ""
    echo -e "${GREEN}✅ Limpieza completada${NC}"
    
    # Espacio en disco
    df -h / | awk 'NR==2 {print "Espacio disponible: " $4}'
    echo ""
fi

# ==========================================
# 5. RECOMENDACIONES
# ==========================================
echo -e "${BLUE}╔═══════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   RECOMENDACIONES                             ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${GREEN}✅ Optimizaciones aplicadas:${NC}"
echo "   • Multi-stage builds"
echo "   • Imágenes alpine (node:22-alpine)"
echo "   • npm ci --only=production"
echo "   • npm cache clean --force"
echo "   • Usuario no-root (nodejs:1001)"
echo "   • dumb-init para señales"
echo "   • COPY con --chown"
echo ""

echo -e "${YELLOW}💡 Tips adicionales:${NC}"
echo "   • Usar .dockerignore para excluir archivos"
echo "   • Ordenar COPY para mejor caché (package.json primero)"
echo "   • Evitar npm install en producción (usar ci)"
echo "   • Considerar distroless para máxima seguridad"
echo ""

echo -e "${BLUE}📦 Tamaños esperados:${NC}"
echo "   • API Gateway:     ~150MB"
echo "   • Microservices:   ~120MB cada uno"
echo "   • Frontend:        ~25MB (nginx:alpine)"
echo "   • Total stack:     ~1.2GB"
echo ""

# ==========================================
# 6. ANÁLISIS DE SEGURIDAD (Trivy)
# ==========================================
if command -v trivy &> /dev/null; then
    echo -e "${YELLOW}🔒 ¿Ejecutar escaneo de seguridad con Trivy? (y/n)${NC}"
    read -r SCAN_SECURITY
    
    if [ "$SCAN_SECURITY" = "y" ] || [ "$SCAN_SECURITY" = "Y" ]; then
        echo ""
        echo -e "${BLUE}Escaneando vulnerabilidades...${NC}"
        echo ""
        
        for service in api-gateway auth-service product-service order-service; do
            echo -e "${YELLOW}Escaneando flores-$service...${NC}"
            trivy image --severity HIGH,CRITICAL "flores-$service:latest" || true
            echo ""
        done
    fi
else
    echo -e "${YELLOW}💡 Instalar Trivy para escaneo de seguridad:${NC}"
    echo -e "   ${BLUE}wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | sudo apt-key add -${NC}"
    echo -e "   ${BLUE}echo 'deb https://aquasecurity.github.io/trivy-repo/deb $(lsb_release -sc) main' | sudo tee /etc/apt/sources.list.d/trivy.list${NC}"
    echo -e "   ${BLUE}sudo apt update && sudo apt install trivy${NC}"
    echo ""
fi

echo -e "${GREEN}╔═══════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   ✅ ANÁLISIS COMPLETADO                      ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════╝${NC}"
echo ""
