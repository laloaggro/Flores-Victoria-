#!/bin/bash

# ============================================
# QUICK START - ORACLE CLOUD FREE TIER
# Flores Victoria - Deploy en 5 minutos
# ============================================

set -e

# Colores
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

clear
echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║         QUICK START - ORACLE CLOUD FREE TIER                   ║${NC}"
echo -e "${BLUE}║                  Flores Victoria                               ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# ============================================
# PASO 1: Verificar requisitos
# ============================================
echo -e "${BLUE}[1/7]${NC} Verificando requisitos..."

# Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker no encontrado${NC}"
    echo "Instalar con: curl -fsSL https://get.docker.com | sh"
    exit 1
fi
echo -e "${GREEN}✓${NC} Docker $(docker --version | awk '{print $3}')"

# Docker Compose
if ! command -v docker compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose no encontrado${NC}"
    exit 1
fi
echo -e "${GREEN}✓${NC} Docker Compose instalado"

# Verificar memoria disponible
total_mem=$(free -m | awk 'NR==2{print $2}')
if [ $total_mem -lt 900 ]; then
    echo -e "${RED}❌ Memoria insuficiente: ${total_mem}MB (mínimo: 900MB)${NC}"
    echo "Asegúrate de estar en VM.Standard.E2.1.Micro con swap configurado"
    exit 1
fi
echo -e "${GREEN}✓${NC} Memoria disponible: ${total_mem}MB"

# Verificar swap
swap_size=$(free -m | awk 'NR==3{print $2}')
if [ $swap_size -lt 1000 ]; then
    echo -e "${YELLOW}⚠️  Swap pequeño o no configurado: ${swap_size}MB${NC}"
    echo "   Recomendado: 2GB swap"
    echo "   Configurar: sudo fallocate -l 2G /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile"
    read -p "¿Continuar de todos modos? (y/N): " continue_without_swap
    if [ "$continue_without_swap" != "y" ]; then
        exit 1
    fi
else
    echo -e "${GREEN}✓${NC} Swap configurado: ${swap_size}MB"
fi

# ============================================
# PASO 2: Configurar .env
# ============================================
echo ""
echo -e "${BLUE}[2/7]${NC} Configurando variables de entorno..."

if [ ! -f .env.production ]; then
    if [ -f .env.free-tier.example ]; then
        echo "Copiando .env.free-tier.example → .env.production"
        cp .env.free-tier.example .env.production
        
        echo ""
        echo -e "${YELLOW}⚠️  IMPORTANTE: Debes editar .env.production${NC}"
        echo "   1. Reemplazar YOUR_ORACLE_IP_HERE con tu IP pública"
        echo "   2. Cambiar todos los CHANGE_ME por valores seguros"
        echo ""
        echo -e "${GREEN}💡 Tip: Usa ./generate-production-secrets.sh para generar secretos${NC}"
        echo ""
        read -p "¿Quieres editar .env.production ahora? (Y/n): " edit_env
        
        if [ "$edit_env" != "n" ]; then
            ${EDITOR:-nano} .env.production
        else
            echo -e "${YELLOW}⚠️  Recuerda editar .env.production antes de iniciar servicios${NC}"
        fi
    else
        echo -e "${RED}❌ .env.free-tier.example no encontrado${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✓${NC} .env.production ya existe"
fi

# Validar variables críticas
if grep -q "CHANGE_ME" .env.production; then
    echo -e "${YELLOW}⚠️  Hay variables sin configurar en .env.production${NC}"
    echo "   Búscalas con: grep CHANGE_ME .env.production"
    read -p "¿Continuar de todos modos? (y/N): " continue_with_change_me
    if [ "$continue_with_change_me" != "y" ]; then
        exit 1
    fi
fi

if grep -q "YOUR_ORACLE_IP_HERE" .env.production; then
    echo -e "${YELLOW}⚠️  IP de Oracle no configurada en .env.production${NC}"
    read -p "Ingresa tu IP pública de Oracle Cloud: " oracle_ip
    
    if [ -n "$oracle_ip" ]; then
        sed -i "s/YOUR_ORACLE_IP_HERE/$oracle_ip/g" .env.production
        echo -e "${GREEN}✓${NC} IP configurada: $oracle_ip"
    fi
fi

# ============================================
# PASO 3: Validar configuración
# ============================================
echo ""
echo -e "${BLUE}[3/7]${NC} Validando configuración..."

if [ -x ./validate-pre-deploy.sh ]; then
    echo "Ejecutando validación pre-deploy..."
    if ./validate-pre-deploy.sh; then
        echo -e "${GREEN}✓${NC} Validación exitosa"
    else
        echo -e "${YELLOW}⚠️  Algunas validaciones fallaron${NC}"
        read -p "¿Continuar de todos modos? (y/N): " continue_with_errors
        if [ "$continue_with_errors" != "y" ]; then
            exit 1
        fi
    fi
else
    echo -e "${YELLOW}⚠️  validate-pre-deploy.sh no encontrado o no ejecutable${NC}"
fi

# ============================================
# PASO 4: Limpiar servicios anteriores
# ============================================
echo ""
echo -e "${BLUE}[4/7]${NC} Limpiando servicios anteriores..."

if docker compose -f docker-compose.free-tier.yml ps -q 2>/dev/null | grep -q .; then
    echo "Deteniendo servicios existentes..."
    docker compose -f docker-compose.free-tier.yml down
fi

echo -e "${GREEN}✓${NC} Listo para iniciar"

# ============================================
# PASO 5: Construir imágenes
# ============================================
echo ""
echo -e "${BLUE}[5/7]${NC} Construyendo imágenes Docker..."
echo -e "${YELLOW}⏳ Esto puede tardar 5-10 minutos la primera vez...${NC}"

if docker compose -f docker-compose.free-tier.yml build --quiet; then
    echo -e "${GREEN}✓${NC} Imágenes construidas"
else
    echo -e "${RED}❌ Error construyendo imágenes${NC}"
    exit 1
fi

# ============================================
# PASO 6: Iniciar servicios
# ============================================
echo ""
echo -e "${BLUE}[6/7]${NC} Iniciando servicios..."

docker compose -f docker-compose.free-tier.yml up -d

echo ""
echo "Esperando que los servicios estén listos..."
sleep 10

# ============================================
# PASO 7: Verificar estado
# ============================================
echo ""
echo -e "${BLUE}[7/7]${NC} Verificando estado de servicios..."

# Contar contenedores
total_containers=$(docker compose -f docker-compose.free-tier.yml ps -q | wc -l)
running_containers=$(docker compose -f docker-compose.free-tier.yml ps -q --status running | wc -l)

echo ""
echo -e "📦 Contenedores: ${GREEN}${running_containers}${NC}/${total_containers} corriendo"

# Listar contenedores
echo ""
docker compose -f docker-compose.free-tier.yml ps --format "table {{.Name}}\t{{.Status}}"

# ============================================
# RESUMEN FINAL
# ============================================
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                     ✅ DEPLOY COMPLETADO                        ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Obtener IP del .env
FRONTEND_URL=$(grep FRONTEND_URL .env.production | cut -d'=' -f2)

echo -e "🌐 URLs disponibles:"
echo -e "   Frontend:     ${BLUE}${FRONTEND_URL}${NC}"
echo -e "   API Gateway:  ${BLUE}${FRONTEND_URL}:3000${NC}"
echo ""

echo -e "📊 Comandos útiles:"
echo -e "   Ver logs:        ${YELLOW}docker compose -f docker-compose.free-tier.yml logs -f${NC}"
echo -e "   Ver estado:      ${YELLOW}docker compose -f docker-compose.free-tier.yml ps${NC}"
echo -e "   Monitor:         ${YELLOW}./monitor-free-tier.sh --continuous${NC}"
echo -e "   Reiniciar:       ${YELLOW}docker compose -f docker-compose.free-tier.yml restart${NC}"
echo -e "   Detener:         ${YELLOW}docker compose -f docker-compose.free-tier.yml down${NC}"
echo ""

echo -e "💡 Recomendaciones:"
echo -e "   1. Monitorea recursos: ${YELLOW}./monitor-free-tier.sh${NC}"
echo -e "   2. Revisa logs si algo falla"
echo -e "   3. Configura backups automáticos"
echo -e "   4. Considera configurar un dominio + SSL"
echo ""

# Mostrar monitor si está disponible
if [ -x ./monitor-free-tier.sh ]; then
    read -p "¿Quieres ver el monitor de recursos ahora? (y/N): " show_monitor
    if [ "$show_monitor" = "y" ]; then
        ./monitor-free-tier.sh
    fi
fi

echo -e "${GREEN}🎉 ¡Tu aplicación Flores Victoria está corriendo en Oracle Cloud FREE!${NC}"
echo ""
