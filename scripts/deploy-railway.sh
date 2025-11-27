#!/bin/bash

# 🚀 Script de Deployment Automatizado para Railway
# Flores Victoria E-commerce Platform

set -e

echo "🌸 ================================================"
echo "   Flores Victoria - Railway Deployment"
echo "================================================ 🌸"
echo ""

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Función para generar secretos
generate_secrets() {
    echo -e "${BLUE}📝 Generando secretos de seguridad...${NC}"
    
    JWT_SECRET=$(openssl rand -base64 32)
    SESSION_SECRET=$(openssl rand -base64 48)
    
    echo -e "${GREEN}✅ Secretos generados${NC}"
    echo ""
    echo "Copia estos valores y guárdalos en Railway → Shared Variables:"
    echo ""
    echo -e "${YELLOW}JWT_SECRET:${NC}"
    echo "$JWT_SECRET"
    echo ""
    echo -e "${YELLOW}SESSION_SECRET:${NC}"
    echo "$SESSION_SECRET"
    echo ""
    echo "Presiona ENTER cuando hayas configurado las variables en Railway..."
    read
}

# Verificar si estamos en el directorio correcto
if [ ! -f "package.json" ] || [ ! -d "microservices" ]; then
    echo -e "${RED}❌ Error: Ejecuta este script desde la raíz del proyecto${NC}"
    exit 1
fi

# Verificar git
if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Git no está instalado${NC}"
    exit 1
fi

# Verificar si hay cambios sin commitear
if ! git diff-index --quiet HEAD --; then
    echo -e "${YELLOW}⚠️  Hay cambios sin commitear${NC}"
    echo "Haciendo commit de los cambios..."
    git add .
    git commit -m "feat: railway deployment configuration - $(date +%Y-%m-%d)"
fi

# Generar secretos
generate_secrets

# Push al repositorio
echo -e "${BLUE}📤 Pusheando código a GitHub...${NC}"
git push origin main
echo -e "${GREEN}✅ Código pusheado${NC}"
echo ""

# Checklist de Railway
echo -e "${BLUE}📋 Checklist de Configuración Railway${NC}"
echo ""
echo "Ahora ve a https://railway.app y completa estos pasos:"
echo ""
echo "1️⃣  CREAR PROYECTO"
echo "   - 'New Project' → 'Empty Project'"
echo "   - Nombre: 'Flores-Victoria-Production'"
echo ""
echo "2️⃣  AGREGAR BASES DE DATOS (en este orden)"
echo "   - '+ New' → 'Database' → 'PostgreSQL'"
echo "   - '+ New' → 'Database' → 'MongoDB'"
echo "   - '+ New' → 'Database' → 'Redis'"
echo ""
echo "3️⃣  CONFIGURAR VARIABLES COMPARTIDAS"
echo "   - Settings → Shared Variables"
echo "   - NODE_ENV=production"
echo "   - JWT_SECRET=<el generado arriba>"
echo "   - SESSION_SECRET=<el generado arriba>"
echo ""
echo "4️⃣  DESPLEGAR SERVICIOS (en este orden):"
echo ""
echo "   Grupo 1 - Servicios Base:"
echo "   - '+ New' → 'GitHub Repo' → Root Dir: microservices/auth-service"
echo "   - '+ New' → 'GitHub Repo' → Root Dir: microservices/user-service"
echo "   - '+ New' → 'GitHub Repo' → Root Dir: microservices/product-service"
echo ""
echo "   Grupo 2 - Servicios Intermedios:"
echo "   - '+ New' → 'GitHub Repo' → Root Dir: microservices/order-service"
echo "   - '+ New' → 'GitHub Repo' → Root Dir: microservices/cart-service"
echo "   - '+ New' → 'GitHub Repo' → Root Dir: microservices/wishlist-service"
echo "   - '+ New' → 'GitHub Repo' → Root Dir: microservices/review-service"
echo "   - '+ New' → 'GitHub Repo' → Root Dir: microservices/contact-service"
echo "   - '+ New' → 'GitHub Repo' → Root Dir: microservices/payment-service"
echo "   - '+ New' → 'GitHub Repo' → Root Dir: microservices/promotion-service"
echo ""
echo "   Grupo 3 - Gateway:"
echo "   - '+ New' → 'GitHub Repo' → Root Dir: microservices/api-gateway"
echo "   - Generar dominio público: Settings → Generate Domain"
echo ""
echo "   Grupo 4 - Frontend:"
echo "   - '+ New' → 'GitHub Repo' → Root Dir: frontend"
echo "   - Configurar: VITE_API_URL=<url-del-api-gateway>"
echo "   - Generar dominio público"
echo ""
echo "   Grupo 5 - Admin Panel:"
echo "   - '+ New' → 'GitHub Repo' → Root Dir: admin-panel"
echo "   - Configurar: VITE_API_URL=<url-del-api-gateway>"
echo "   - Generar dominio público"
echo ""
echo "5️⃣  CONFIGURAR VARIABLES POR SERVICIO"
echo "   (Ver RAILWAY_FULLSTACK_SETUP.md para detalles completos)"
echo ""
echo "6️⃣  VERIFICAR HEALTH CHECKS"
echo "   - Esperar a que todos los servicios estén 'Running'"
echo "   - Verificar logs de cada servicio"
echo "   - Probar: curl <api-gateway-url>/health"
echo ""
echo -e "${GREEN}✅ Script completado${NC}"
echo ""
echo -e "${YELLOW}📚 Documentación completa:${NC} RAILWAY_FULLSTACK_SETUP.md"
echo -e "${YELLOW}🐛 Troubleshooting:${NC} Ver sección en RAILWAY_FULLSTACK_SETUP.md"
echo ""
echo "🚀 ¡Buena suerte con el deployment!"
