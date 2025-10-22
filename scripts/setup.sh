#!/bin/bash

# Script para setup inicial del proyecto
# Ejecuta todas las configuraciones necesarias para comenzar a desarrollar

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}=== Setup Inicial - Flores Victoria ===${NC}\n"

# 1. Verificar Docker
echo -e "${YELLOW}1. Verificando Docker...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker no está instalado${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker encontrado${NC}\n"

# 2. Verificar Docker Compose
echo -e "${YELLOW}2. Verificando Docker Compose...${NC}"
if ! command -v docker compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose no está instalado${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker Compose encontrado${NC}\n"

# 3. Hacer ejecutables los scripts
echo -e "${YELLOW}3. Configurando permisos de scripts...${NC}"
chmod +x dev.sh
chmod +x scripts/*.sh
echo -e "${GREEN}✅ Permisos configurados${NC}\n"

# 4. Crear archivo .env.local si no existe
echo -e "${YELLOW}4. Configurando variables de entorno...${NC}"
if [ ! -f .env.local ]; then
    cp .env.development .env.local
    echo -e "${GREEN}✅ Archivo .env.local creado${NC}"
else
    echo -e "${BLUE}ℹ️  .env.local ya existe${NC}"
fi
echo ""

# 5. Construir imágenes
echo -e "${YELLOW}5. Construyendo imágenes Docker...${NC}"
docker compose -f docker-compose.dev-simple.yml build
echo -e "${GREEN}✅ Imágenes construidas${NC}\n"

# 6. Iniciar servicios
echo -e "${YELLOW}6. Iniciando servicios...${NC}"
docker compose -f docker-compose.dev-simple.yml up -d
echo -e "${GREEN}✅ Servicios iniciados${NC}\n"

# 7. Esperar a que los servicios estén listos
echo -e "${YELLOW}7. Esperando a que los servicios estén listos...${NC}"
sleep 10

# 8. Verificar health
echo -e "${YELLOW}8. Verificando servicios...${NC}"
./scripts/health-check.sh

echo ""
echo -e "${GREEN}=== ✅ Setup Completado ===${NC}\n"
echo -e "${BLUE}Servicios disponibles en:${NC}"
echo -e "  Frontend:      http://localhost:5173"
echo -e "  Admin Panel:   http://localhost:3010"
echo -e "  API Gateway:   http://localhost:3000"
echo -e "  Auth Service:  http://localhost:3001"
echo -e "  Product Svc:   http://localhost:3009"
echo ""
echo -e "${BLUE}Comandos útiles:${NC}"
echo -e "  ./dev.sh status    - Ver estado de servicios"
echo -e "  ./dev.sh logs      - Ver logs de todos los servicios"
echo -e "  ./dev.sh stop      - Detener servicios"
echo -e "  ./dev.sh help      - Ver todos los comandos"
echo ""
echo -e "${GREEN}¡Listo para desarrollar! 🚀${NC}"
