#!/bin/bash

# ════════════════════════════════════════════════════════════════════════════
# Script para recrear user-service en Railway con configuración correcta
# ════════════════════════════════════════════════════════════════════════════

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                                                                ║${NC}"
echo -e "${BLUE}║        🚀 RECREAR USER-SERVICE EN RAILWAY (v2)               ║${NC}"
echo -e "${BLUE}║                                                                ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "docker/Dockerfile.user-service" ]; then
    echo -e "${RED}❌ Error: No se encuentra docker/Dockerfile.user-service${NC}"
    echo -e "${YELLOW}Asegúrate de ejecutar este script desde la raíz del proyecto${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Dockerfile centralizado encontrado${NC}"
echo ""

# Verificar railway.toml
if [ ! -f "microservices/railway.toml" ]; then
    echo -e "${RED}❌ Error: No se encuentra microservices/railway.toml${NC}"
    exit 1
fi

echo -e "${GREEN}✅ railway.toml encontrado${NC}"
echo ""

# Mostrar configuración actual
echo -e "${BLUE}📋 Configuración en railway.toml:${NC}"
grep -A 2 "^\[build\]" microservices/railway.toml || echo "No encontrado"
echo ""

# Instrucciones manuales para el Dashboard
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}📱 PASOS EN EL DASHBOARD DE RAILWAY:${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${GREEN}PASO 1:${NC} Ve a Railway Dashboard"
echo "   → https://railway.com/project/d751ae6b-0067-4745-bc61-87b41f3cc2c4"
echo ""
echo -e "${GREEN}PASO 2:${NC} Haz clic en el servicio ${YELLOW}'User Service (Usuario)'${NC}"
echo ""
echo -e "${GREEN}PASO 3:${NC} Ve a ${YELLOW}Settings${NC} (⚙️)"
echo ""
echo -e "${GREEN}PASO 4:${NC} Scroll hasta el final → ${RED}Danger Zone${NC}"
echo ""
echo -e "${GREEN}PASO 5:${NC} Haz clic en ${RED}'Delete Service'${NC}"
echo "   → Confirmar eliminación"
echo ""
echo -e "${GREEN}PASO 6:${NC} Crear servicio nuevo:"
echo "   → Botón ${GREEN}'+ New'${NC} en el proyecto"
echo "   → Seleccionar ${GREEN}'GitHub Repo'${NC}"
echo "   → Repo: ${GREEN}'laloaggro/Flores-Victoria-'${NC}"
echo ""
echo -e "${RED}   ⚠️  IMPORTANTE: NO CONFIGURAR ROOT DIRECTORY${NC}"
echo -e "${RED}   ⚠️  Dejar VACÍO desde el inicio${NC}"
echo ""
echo -e "${GREEN}PASO 7:${NC} Nombre del servicio: ${GREEN}'User Service'${NC}"
echo ""
echo -e "${GREEN}PASO 8:${NC} Configurar variables de entorno (copiar y pegar):"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
cat << 'ENVVARS'
NODE_ENV=production
PORT=3003
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=${{shared.JWT_SECRET}}
REDIS_URL=${{Redis.REDIS_URL}}
ENVVARS
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${GREEN}PASO 9:${NC} Railway copiará railway.toml automáticamente"
echo "   → dockerfilePath = ${GREEN}'docker/Dockerfile.user-service'${NC}"
echo "   → Build context = ${GREEN}'/' (raíz del repo)${NC}"
echo ""
echo -e "${GREEN}PASO 10:${NC} Railway iniciará el build automáticamente"
echo "   → Monitorea en la pestaña ${YELLOW}'Deployments'${NC}"
echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${GREEN}✅ Esperando a que completes los pasos en el Dashboard...${NC}"
echo ""
echo -e "${BLUE}Presiona Enter cuando hayas terminado para verificar el deployment${NC}"
read -r

echo ""
echo -e "${BLUE}🔍 Verificando deployment...${NC}"
echo ""

# Intentar verificar con Railway CLI
if command -v railway &> /dev/null; then
    echo -e "${GREEN}Railway CLI detectado, intentando conectar...${NC}"
    # No podemos hacer mucho aquí porque el servicio fue eliminado y recreado
    echo -e "${YELLOW}Ve al Dashboard para ver el estado del nuevo servicio${NC}"
else
    echo -e "${YELLOW}Railway CLI no instalado${NC}"
fi

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✨ Proceso completado${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}📊 Próximos pasos:${NC}"
echo "   1. Verifica que el build sea exitoso en Railway"
echo "   2. Revisa los logs para confirmar que user-service inicie correctamente"
echo "   3. Confirma que el puerto 3003 esté expuesto"
echo "   4. Prueba el endpoint de health: /health"
echo ""
echo -e "${GREEN}🎉 ¡El nuevo servicio debería funcionar correctamente!${NC}"
echo ""
