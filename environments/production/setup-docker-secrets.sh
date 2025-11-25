#!/bin/bash

# ==============================================================================
# Script: setup-docker-secrets.sh
# Descripción: Configuración segura de secretos con Docker Secrets
# Versión: 1.0.0
# Fecha: 25 Noviembre 2025
# ==============================================================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo "=========================================="
echo "  🔐 Docker Secrets Setup"
echo "  Flores Victoria - Production Security"
echo "=========================================="
echo ""

# Verificar que estamos en modo swarm o standalone
if docker info 2>/dev/null | grep -q "Swarm: active"; then
    SWARM_MODE=true
    echo -e "${GREEN}✅ Docker Swarm detectado${NC}"
else
    SWARM_MODE=false
    echo -e "${YELLOW}⚠️  Docker Swarm no activo - usando secrets externos${NC}"
    echo -e "${BLUE}ℹ️  Para Swarm: docker swarm init${NC}"
fi

echo ""
echo "Este script creará secretos seguros para:"
echo "  - JWT_SECRET (256 bits)"
echo "  - POSTGRES_PASSWORD (32 caracteres)"
echo "  - MONGO_INITDB_ROOT_PASSWORD (32 caracteres)"
echo "  - REDIS_PASSWORD (32 caracteres)"
echo "  - SESSION_SECRET (64 caracteres)"
echo ""

read -p "¿Continuar? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelado."
    exit 0
fi

echo ""
echo "Generando secretos aleatorios..."

# Directorio para secretos (si no usamos Swarm)
SECRETS_DIR="./secrets"
mkdir -p "$SECRETS_DIR"
chmod 700 "$SECRETS_DIR"

# Función para generar secreto aleatorio
generate_secret() {
    openssl rand -base64 "$1" | tr -d "=+/" | cut -c1-"$1"
}

# Función para crear secreto en Docker
create_docker_secret() {
    local secret_name=$1
    local secret_value=$2
    
    if [ "$SWARM_MODE" = true ]; then
        # Docker Swarm mode
        echo "$secret_value" | docker secret create "$secret_name" - 2>/dev/null || \
        echo -e "${YELLOW}⚠️  Secret $secret_name ya existe (usando existente)${NC}"
    else
        # Standalone mode - guardar en archivos
        echo "$secret_value" > "$SECRETS_DIR/$secret_name"
        chmod 400 "$SECRETS_DIR/$secret_name"
    fi
}

# Generar y crear secretos
echo ""
echo "1️⃣  JWT_SECRET..."
JWT_SECRET=$(generate_secret 64)
create_docker_secret "jwt_secret" "$JWT_SECRET"
echo -e "${GREEN}✅ JWT_SECRET creado${NC}"

echo ""
echo "2️⃣  POSTGRES_PASSWORD..."
POSTGRES_PASSWORD=$(generate_secret 32)
create_docker_secret "postgres_password" "$POSTGRES_PASSWORD"
echo -e "${GREEN}✅ POSTGRES_PASSWORD creado${NC}"

echo ""
echo "3️⃣  MONGO_ROOT_PASSWORD..."
MONGO_PASSWORD=$(generate_secret 32)
create_docker_secret "mongo_root_password" "$MONGO_PASSWORD"
echo -e "${GREEN}✅ MONGO_ROOT_PASSWORD creado${NC}"

echo ""
echo "4️⃣  REDIS_PASSWORD..."
REDIS_PASSWORD=$(generate_secret 32)
create_docker_secret "redis_password" "$REDIS_PASSWORD"
echo -e "${GREEN}✅ REDIS_PASSWORD creado${NC}"

echo ""
echo "5️⃣  SESSION_SECRET..."
SESSION_SECRET=$(generate_secret 64)
create_docker_secret "session_secret" "$SESSION_SECRET"
echo -e "${GREEN}✅ SESSION_SECRET creado${NC}"

# Crear archivo .env mínimo (sin secretos)
echo ""
echo "6️⃣  Creando .env.production (sin secretos)..."

cat > .env.production << EOF
# ==============================================================================
# Flores Victoria - Production Environment (Docker Secrets)
# ==============================================================================
# ⚠️ IMPORTANTE: Los secretos están en Docker Secrets, NO en este archivo
# ==============================================================================

# ENVIRONMENT
NODE_ENV=production
LOG_LEVEL=warn
TZ=America/Santiago

# URLS (Reemplazar con tu IP/dominio)
FRONTEND_URL=http://YOUR_ORACLE_IP_HERE
API_URL=http://YOUR_ORACLE_IP_HERE
ADMIN_URL=http://YOUR_ORACLE_IP_HERE:3010

# CORS
CORS_ORIGIN=http://YOUR_ORACLE_IP_HERE,https://YOUR_ORACLE_IP_HERE
CORS_CREDENTIALS=true

# RATE LIMITING
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=50
RATE_LIMIT_LOGIN_MAX=3

# DATABASE HOSTS (no passwords aquí)
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_USER=flores_user
POSTGRES_DB=flores_db

MONGO_HOST=mongo
MONGO_PORT=27017
MONGO_DB=flores_victoria

REDIS_HOST=redis
REDIS_PORT=6379

# PERFORMANCE
DB_POOL_MAX=5
DB_POOL_MIN=1
CACHE_TTL_SHORT=300
CACHE_TTL_MEDIUM=1800
CACHE_TTL_LONG=3600
CONNECTION_TIMEOUT=5000

# LOGGING
LOG_FILE=/var/log/flores-victoria/app.log
LOG_MAX_SIZE=5m
LOG_MAX_FILES=2

# FEATURES (Free Tier - optimizado)
ENABLE_WISHLIST=false
ENABLE_REVIEWS=false
ENABLE_ANALYTICS=false
ENABLE_NOTIFICATIONS=false
ENABLE_RABBITMQ=false

# SECURITY
SECURE_COOKIES=false
FORCE_HTTPS=false
HSTS_ENABLED=false
HSTS_MAX_AGE=31536000

# ==============================================================================
# SECRETOS GESTIONADOS POR DOCKER SECRETS
# ==============================================================================
# Los siguientes secretos están en Docker Secrets o ./secrets/
# - jwt_secret
# - postgres_password
# - mongo_root_password
# - redis_password
# - session_secret
#
# Acceso en código:
#   const secret = fs.readFileSync('/run/secrets/jwt_secret', 'utf8').trim();
# ==============================================================================
EOF

echo -e "${GREEN}✅ .env.production creado${NC}"

# Mostrar resumen
echo ""
echo "=========================================="
echo "  ✅ Configuración Completada"
echo "=========================================="
echo ""

if [ "$SWARM_MODE" = true ]; then
    echo "📦 Secretos creados en Docker Swarm:"
    docker secret ls | grep -E "jwt_secret|postgres_password|mongo_root_password|redis_password|session_secret"
    echo ""
    echo "🔍 Ver contenido de un secreto:"
    echo "   docker secret inspect jwt_secret"
else
    echo "📂 Secretos guardados en: $SECRETS_DIR/"
    ls -lh "$SECRETS_DIR/"
    echo ""
    echo -e "${YELLOW}⚠️  IMPORTANTE: NO subir ./secrets/ a Git${NC}"
    echo "   Verificar que ./secrets/ está en .gitignore"
fi

echo ""
echo "📝 Próximos pasos:"
echo ""
echo "1. Editar .env.production:"
echo "   - Reemplazar YOUR_ORACLE_IP_HERE con tu IP pública"
echo ""
echo "2. Actualizar docker-compose para usar secretos:"
echo "   - Ver docker-compose.secrets.yml como ejemplo"
echo ""
echo "3. Arrancar servicios:"
if [ "$SWARM_MODE" = true ]; then
    echo "   docker stack deploy -c docker-compose.secrets.yml flores-victoria"
else
    echo "   docker compose -f docker-compose.secrets.yml up -d"
fi
echo ""

# Backup de secretos (cifrado)
echo "🔐 ¿Crear backup cifrado de secretos? (recomendado)"
read -p "   (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    BACKUP_FILE="secrets-backup-$(date +%Y%m%d-%H%M%S).tar.gz.gpg"
    
    if [ "$SWARM_MODE" = true ]; then
        echo "⚠️  En Swarm mode, exportar manualmente con docker secret inspect"
    else
        echo ""
        echo "Ingresa una contraseña para cifrar el backup:"
        tar czf - "$SECRETS_DIR" | gpg --symmetric --cipher-algo AES256 -o "$BACKUP_FILE"
        echo ""
        echo -e "${GREEN}✅ Backup creado: $BACKUP_FILE${NC}"
        echo -e "${YELLOW}⚠️  Guardar este archivo en un lugar seguro (USB, password manager)${NC}"
        echo ""
        echo "Para restaurar:"
        echo "  gpg -d $BACKUP_FILE | tar xzf -"
    fi
fi

echo ""
echo "=========================================="
echo "  🎉 Setup Completado"
echo "=========================================="
echo ""
