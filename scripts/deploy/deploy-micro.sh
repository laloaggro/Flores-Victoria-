#!/bin/bash

set -e

echo "=========================================="
echo "  🌸 Flores Victoria - Deploy E2.1.Micro"
echo "=========================================="
echo ""

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar Docker
echo "1️⃣  Verificando Docker..."
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker no está instalado${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker instalado${NC}"

# Verificar Docker Compose
echo "2️⃣  Verificando Docker Compose..."
if ! docker compose version &> /dev/null; then
    echo -e "${RED}❌ Docker Compose no está instalado${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker Compose instalado${NC}"

# Verificar archivo .env
echo "3️⃣  Verificando configuración..."
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  Archivo .env no encontrado${NC}"
    echo "Copiando .env.micro.example a .env..."
    cp .env.micro.example .env
    echo -e "${YELLOW}⚠️  IMPORTANTE: Edita el archivo .env con tus valores antes de continuar${NC}"
    echo "Genera un JWT_SECRET con: openssl rand -base64 48"
    exit 1
fi
echo -e "${GREEN}✅ Archivo .env encontrado${NC}"

# Verificar JWT_SECRET
if grep -q "CHANGE_THIS_SECRET" .env; then
    echo -e "${RED}❌ JWT_SECRET no configurado en .env${NC}"
    echo "Ejecuta: openssl rand -base64 48"
    exit 1
fi

# Build del frontend
echo "4️⃣  Construyendo frontend..."
cd frontend
if [ ! -d "node_modules" ]; then
    echo "Instalando dependencias del frontend..."
    npm install
fi
echo "Ejecutando build de Vite..."
npm run build
cd ..
echo -e "${GREEN}✅ Frontend construido${NC}"

# Detener contenedores previos
echo "5️⃣  Deteniendo contenedores previos..."
docker compose -f docker-compose.micro.yml down 2>/dev/null || true
echo -e "${GREEN}✅ Contenedores detenidos${NC}"

# Build de imágenes Docker
echo "6️⃣  Construyendo imágenes Docker..."
docker compose -f docker-compose.micro.yml build --no-cache
echo -e "${GREEN}✅ Imágenes construidas${NC}"

# Iniciar servicios
echo "7️⃣  Iniciando servicios..."
docker compose -f docker-compose.micro.yml up -d
echo -e "${GREEN}✅ Servicios iniciados${NC}"

# Esperar a que los servicios estén listos
echo "8️⃣  Esperando a que los servicios estén listos..."
sleep 10

# Verificar estado de contenedores
echo "9️⃣  Verificando estado de servicios..."
docker compose -f docker-compose.micro.yml ps

# Health checks
echo "🔟  Ejecutando health checks..."

# Check API
if docker compose -f docker-compose.micro.yml exec -T api wget --quiet --tries=1 --spider http://localhost:3000/health 2>/dev/null; then
    echo -e "${GREEN}✅ API: Saludable${NC}"
else
    echo -e "${RED}⚠️  API: No responde (puede necesitar más tiempo)${NC}"
fi

# Check Nginx
if curl -f http://localhost/health &>/dev/null; then
    echo -e "${GREEN}✅ Nginx: Saludable${NC}"
else
    echo -e "${RED}⚠️  Nginx: No responde${NC}"
fi

# Obtener IP pública
PUBLIC_IP=$(curl -s ifconfig.me || echo "OBTENER_IP_MANUALMENTE")

echo ""
echo "=========================================="
echo -e "${GREEN}  ✅ Deployment completado!${NC}"
echo "=========================================="
echo ""
echo "📊 Acceso al sitio:"
echo "   Frontend:  http://$PUBLIC_IP"
echo "   API:       http://$PUBLIC_IP/api/health"
echo ""
echo "📦 Uso de recursos:"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}" | grep flores
echo ""
echo "📝 Ver logs:"
echo "   docker compose -f docker-compose.micro.yml logs -f"
echo ""
echo "🔧 Comandos útiles:"
echo "   Reiniciar:  docker compose -f docker-compose.micro.yml restart"
echo "   Detener:    docker compose -f docker-compose.micro.yml down"
echo "   Ver estado: docker compose -f docker-compose.micro.yml ps"
echo ""
echo -e "${YELLOW}⚠️  Recuerda configurar el firewall de Oracle Cloud (puertos 80, 443)${NC}"
echo ""
