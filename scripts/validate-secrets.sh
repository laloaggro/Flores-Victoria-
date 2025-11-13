#!/bin/bash

# ==========================================
# SECRETS VALIDATION SCRIPT
# Verifica seguridad de secrets y variables
# ==========================================

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔═══════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   SECRETS SECURITY VALIDATION                ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════╝${NC}"
echo ""

CRITICAL_ISSUES=0
WARNINGS=0
INFO=0

# ==========================================
# 1. VERIFICAR ARCHIVO .env
# ==========================================
echo -e "${YELLOW}🔐 Verificando archivo .env...${NC}"
echo ""

if [ ! -f .env ]; then
    echo -e "${RED}❌ CRÍTICO: Archivo .env no encontrado${NC}"
    echo -e "   Crear desde: cp .env.example .env"
    ((CRITICAL_ISSUES++))
else
    echo -e "${GREEN}✅ Archivo .env existe${NC}"
    
    # Verificar si .env está en .gitignore
    if grep -q "^\.env$" .gitignore 2>/dev/null; then
        echo -e "${GREEN}✅ .env está en .gitignore${NC}"
    else
        echo -e "${RED}❌ CRÍTICO: .env NO está en .gitignore${NC}"
        ((CRITICAL_ISSUES++))
    fi
fi

echo ""

# ==========================================
# 2. DETECTAR SECRETS POR DEFECTO
# ==========================================
echo -e "${YELLOW}🔍 Detectando secrets por defecto...${NC}"
echo ""

INSECURE_PATTERNS=(
    "CHANGE_THIS"
    "YOUR_"
    "admin123"
    "password123"
    "floresdb2025"
    "floresredis2025"
    "default_secret"
    "test-secret"
)

if [ -f .env ]; then
    for pattern in "${INSECURE_PATTERNS[@]}"; do
        if grep -qi "$pattern" .env; then
            echo -e "${RED}❌ Encontrado patrón inseguro: $pattern${NC}"
            ((CRITICAL_ISSUES++))
        fi
    done
    
    if [ $CRITICAL_ISSUES -eq 0 ]; then
        echo -e "${GREEN}✅ No se encontraron patrones inseguros en .env${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  No se puede verificar (archivo .env no existe)${NC}"
    ((WARNINGS++))
fi

echo ""

# ==========================================
# 3. VERIFICAR LONGITUD DE SECRETS
# ==========================================
echo -e "${YELLOW}📏 Verificando longitud de secrets...${NC}"
echo ""

if [ -f .env ]; then
    # JWT_SECRET debe tener al menos 256 bits (32 bytes = 43 caracteres en base64)
    JWT_LENGTH=$(grep "^JWT_SECRET=" .env 2>/dev/null | cut -d= -f2 | wc -c)
    if [ "$JWT_LENGTH" -lt 43 ]; then
        echo -e "${RED}❌ JWT_SECRET muy corto: $JWT_LENGTH caracteres (mínimo 43)${NC}"
        ((CRITICAL_ISSUES++))
    else
        echo -e "${GREEN}✅ JWT_SECRET tiene longitud adecuada${NC}"
    fi
    
    # Verificar otros secrets
    for secret_var in "POSTGRES_PASSWORD" "REDIS_PASSWORD" "GRAFANA_PASSWORD"; do
        SECRET_LENGTH=$(grep "^${secret_var}=" .env 2>/dev/null | cut -d= -f2 | wc -c)
        if [ "$SECRET_LENGTH" -lt 16 ]; then
            echo -e "${YELLOW}⚠️  $secret_var es corto: $SECRET_LENGTH caracteres (recomendado >16)${NC}"
            ((WARNINGS++))
        else
            echo -e "${GREEN}✅ $secret_var tiene longitud adecuada${NC}"
        fi
    done
fi

echo ""

# ==========================================
# 4. BUSCAR SECRETS HARDCODEADOS EN CÓDIGO
# ==========================================
echo -e "${YELLOW}🔎 Buscando secrets hardcodeados en código...${NC}"
echo ""

HARDCODED_COUNT=0

# Buscar en archivos JS (excluir tests y node_modules)
while IFS= read -r file; do
    # Buscar patterns sospechosos
    if grep -qE "(password|secret|token).*=.*['\"][^$\{]" "$file" 2>/dev/null; then
        # Verificar que no sea un test o configuración de test
        if [[ ! "$file" =~ (test|spec|jest.setup|__mocks__|node_modules) ]]; then
            echo -e "${YELLOW}⚠️  Posible hardcoded secret en: $file${NC}"
            ((HARDCODED_COUNT++))
        fi
    fi
done < <(find microservices -name "*.js" -type f 2>/dev/null)

if [ $HARDCODED_COUNT -eq 0 ]; then
    echo -e "${GREEN}✅ No se encontraron secrets hardcodeados${NC}"
else
    echo -e "${YELLOW}⚠️  Encontrados $HARDCODED_COUNT archivos con posibles secrets${NC}"
    echo -e "   Revisar manualmente para confirmar"
    ((WARNINGS++))
fi

echo ""

# ==========================================
# 5. VERIFICAR DEFAULTS EN DOCKER COMPOSE
# ==========================================
echo -e "${YELLOW}📦 Verificando defaults en docker-compose...${NC}"
echo ""

COMPOSE_FILES=(
    "docker-compose.oracle-optimized.yml"
    "docker-compose.oracle.yml"
    "docker-compose.yml"
)

for compose_file in "${COMPOSE_FILES[@]}"; do
    if [ -f "$compose_file" ]; then
        if grep -qE "CHANGE_THIS|admin123|YOUR_" "$compose_file"; then
            echo -e "${RED}❌ $compose_file contiene valores por defecto inseguros${NC}"
            ((CRITICAL_ISSUES++))
        else
            echo -e "${GREEN}✅ $compose_file usa variables de entorno correctamente${NC}"
        fi
    fi
done

echo ""

# ==========================================
# 6. GENERAR SECRETS SEGUROS
# ==========================================
echo -e "${BLUE}╔═══════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   GENERACIÓN DE SECRETS SEGUROS               ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${YELLOW}💡 Comandos para generar secrets seguros:${NC}"
echo ""

echo -e "${BLUE}# JWT_SECRET (256 bits)${NC}"
echo "JWT_SECRET=\"$(openssl rand -base64 32 | tr -d '\n')\""
echo ""

echo -e "${BLUE}# POSTGRES_PASSWORD${NC}"
echo "POSTGRES_PASSWORD=\"$(openssl rand -base64 24 | tr -d '\n')\""
echo ""

echo -e "${BLUE}# REDIS_PASSWORD${NC}"
echo "REDIS_PASSWORD=\"$(openssl rand -base64 16 | tr -d '\n')\""
echo ""

echo -e "${BLUE}# GRAFANA_PASSWORD${NC}"
echo "GRAFANA_PASSWORD=\"$(openssl rand -base64 16 | tr -d '\n')\""
echo ""

echo -e "${BLUE}# RABBITMQ_DEFAULT_PASS${NC}"
echo "RABBITMQ_DEFAULT_PASS=\"$(openssl rand -base64 16 | tr -d '\n')\""
echo ""

# ==========================================
# 7. CREAR .env.example
# ==========================================
echo -e "${YELLOW}¿Crear .env.example con valores seguros? (y/n)${NC}"
read -r CREATE_EXAMPLE

if [ "$CREATE_EXAMPLE" = "y" ] || [ "$CREATE_EXAMPLE" = "Y" ]; then
    cat > .env.example << 'EOF'
# ==========================================
# FLORES VICTORIA - ENVIRONMENT VARIABLES
# ==========================================

# ==========================================
# APPLICATION
# ==========================================
NODE_ENV=production
PORT=3000
LOG_LEVEL=warn

# ==========================================
# JWT AUTHENTICATION (CAMBIAR EN PRODUCCIÓN)
# ==========================================
# Generar con: openssl rand -base64 32
JWT_SECRET=CHANGE_THIS_GENERATE_WITH_openssl_rand_base64_32
JWT_EXPIRES_IN=7d

# ==========================================
# DATABASE - PostgreSQL
# ==========================================
# Generar con: openssl rand -base64 24
POSTGRES_USER=postgres
POSTGRES_PASSWORD=CHANGE_THIS_GENERATE_WITH_openssl_rand_base64_24
POSTGRES_DB=flores_victoria
DATABASE_URL=postgresql://postgres:${POSTGRES_PASSWORD}@postgres:5432/flores_victoria

# ==========================================
# CACHE - Redis
# ==========================================
# Generar con: openssl rand -base64 16
REDIS_PASSWORD=CHANGE_THIS_GENERATE_WITH_openssl_rand_base64_16
REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379

# ==========================================
# MESSAGE QUEUE - RabbitMQ
# ==========================================
RABBITMQ_DEFAULT_USER=admin
RABBITMQ_DEFAULT_PASS=CHANGE_THIS_GENERATE_WITH_openssl_rand_base64_16

# ==========================================
# MONITORING - Grafana
# ==========================================
GRAFANA_USER=admin
GRAFANA_PASSWORD=CHANGE_THIS_GENERATE_WITH_openssl_rand_base64_16

# ==========================================
# OBSERVABILITY - Jaeger
# ==========================================
JAEGER_AGENT_HOST=jaeger
JAEGER_AGENT_PORT=6831
JAEGER_SAMPLER_TYPE=probabilistic
JAEGER_SAMPLER_PARAM=0.1

# ==========================================
# CACHING
# ==========================================
ENABLE_CACHE=true
CACHE_TTL=300

# ==========================================
# EMAIL (Opcional)
# ==========================================
EMAIL_USER=noreply@floresvictoria.com
EMAIL_PASS=
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587

# ==========================================
# EXTERNAL SERVICES (Opcional)
# ==========================================
HF_TOKEN=
REPLICATE_API_TOKEN=
OPENAI_API_KEY=

# ==========================================
# CORS
# ==========================================
CORS_ORIGIN=https://floresvictoria.com
EOF

    echo -e "${GREEN}✅ .env.example creado${NC}"
    echo ""
fi

# ==========================================
# RESUMEN
# ==========================================
echo -e "${BLUE}╔═══════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   RESUMEN DE SEGURIDAD                        ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════╝${NC}"
echo ""

echo -e "Problemas críticos: ${RED}$CRITICAL_ISSUES${NC}"
echo -e "Advertencias:       ${YELLOW}$WARNINGS${NC}"
echo ""

if [ $CRITICAL_ISSUES -gt 0 ]; then
    echo -e "${RED}╔═══════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║   ❌ ACCIÓN REQUERIDA                         ║${NC}"
    echo -e "${RED}╚═══════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${YELLOW}Pasos a seguir:${NC}"
    echo "1. Crear .env desde .env.example"
    echo "2. Generar secrets seguros con openssl"
    echo "3. Reemplazar TODOS los valores CHANGE_THIS"
    echo "4. Verificar que .env está en .gitignore"
    echo "5. NO commitear .env a Git"
    echo ""
    exit 1
else
    echo -e "${GREEN}╔═══════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║   ✅ SECRETS CONFIGURADOS CORRECTAMENTE       ║${NC}"
    echo -e "${GREEN}╚═══════════════════════════════════════════════╝${NC}"
    echo ""
    
    if [ $WARNINGS -gt 0 ]; then
        echo -e "${YELLOW}⚠️  Revisar advertencias antes de deployment${NC}"
    fi
    
    exit 0
fi
