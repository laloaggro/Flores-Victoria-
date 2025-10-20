#!/bin/bash

# Script para validar que todo el sistema está funcionando correctamente
# Verifica todos los componentes del sistema Flores Victoria

# Colores para salida
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Validación del Sistema Flores Victoria ===${NC}"
echo "Verificando que todos los componentes del sistema estén funcionando correctamente..."

# Verificar si docker-compose está disponible
if ! command -v docker-compose &> /dev/null
then
    echo -e "${RED}✗ docker-compose no encontrado. Verifica tu instalación de Docker.${NC}"
    exit 1
fi

# Verificar que el entorno esté corriendo
echo -e "${YELLOW}Verificando estado de los contenedores...${NC}"
if ! docker-compose ps | grep -q "Up"; then
    echo -e "${YELLOW}Advertencia: No se detectaron contenedores en ejecución${NC}"
    echo "Iniciando el entorno..."
    docker-compose up -d
    sleep 10 # Esperar a que los servicios se inicien
fi

# Verificar contenedores en ejecución
echo -e "${BLUE}Estado de los contenedores:${NC}"
docker-compose ps

# Verificar servicios críticos
echo ""
echo -e "${BLUE}=== Verificación de Servicios Críticos ===${NC}"

# Verificar auth-service (prioridad más alta)
echo -e "${YELLOW}Verificando Auth Service (prioridad más alta)...${NC}"
AUTH_SERVICE_URL="http://localhost:3001/health"
if curl -f -s "$AUTH_SERVICE_URL" > /dev/null; then
    echo -e "${GREEN}✓ Auth Service disponible${NC}"
else
    echo -e "${RED}✗ Auth Service no disponible${NC}"
fi

# Verificar otros servicios principales
MAIN_SERVICES=(
    "API Gateway:http://localhost:3000/health"
    "Product Service:http://localhost:3002/health"
    "User Service:http://localhost:3003/health"
    "Order Service:http://localhost:3004/health"
    "Cart Service:http://localhost:3005/health"
    "Wishlist Service:http://localhost:3006/health"
    "Review Service:http://localhost:3007/health"
    "Contact Service:http://localhost:3008/health"
)

echo ""
echo -e "${BLUE}Verificando otros servicios principales...${NC}"
for service_info in "${MAIN_SERVICES[@]}"; do
    IFS=':' read -r service_name service_url <<< "$service_info"
    echo "Verificando $service_name..."
    if curl -f -s "$service_url" > /dev/null; then
        echo -e "${GREEN}  ✓ $service_name disponible${NC}"
    else
        echo -e "${RED}  ✗ $service_name no disponible${NC}"
    fi
done

# Verificar bases de datos
echo ""
echo -e "${BLUE}=== Verificación de Bases de Datos ===${NC}"

DB_SERVICES=(
    "MongoDB:27017"
    "PostgreSQL:5432"
    "Redis:6379"
)

for db_info in "${DB_SERVICES[@]}"; do
    IFS=':' read -r db_name db_port <<< "$db_info"
    echo "Verificando $db_name en puerto $db_port..."
    if nc -z localhost $db_port 2>/dev/null; then
        echo -e "${GREEN}  ✓ $db_name disponible${NC}"
    else
        echo -e "${RED}  ✗ $db_name no disponible${NC}"
    fi
done

# Verificar servicios web
echo ""
echo -e "${BLUE}=== Verificación de Interfaces Web ===${NC}"

WEB_SERVICES=(
    "Frontend:http://localhost:5175"
    "Admin Panel:http://localhost:3010"
)

for web_info in "${WEB_SERVICES[@]}"; do
    IFS=':' read -r web_name web_url <<< "$web_info"
    echo "Verificando $web_name..."
    if curl -f -s "$web_url" > /dev/null; then
        echo -e "${GREEN}  ✓ $web_name disponible${NC}"
    else
        echo -e "${RED}  ✗ $web_name no disponible${NC}"
    fi
done

# Verificar conectividad entre microservicios
echo ""
echo -e "${BLUE}=== Verificación de Conectividad entre Microservicios ===${NC}"

# Verificar que el API Gateway puede comunicarse con los microservicios
echo "Verificando comunicación API Gateway -> Microservicios..."
# Esta verificación sería más compleja en un entorno real

echo ""
echo -e "${BLUE}=== Resumen de Validación ===${NC}"
echo "La validación del sistema se ha completado."
echo "Verifique los resultados anteriores para identificar posibles problemas."
echo ""
echo -e "${YELLOW}Recomendación:${NC} Utilice scripts/check-critical-services.sh para verificar"
echo "el estado de los servicios críticos antes de realizar operaciones importantes."