#!/bin/bash
# ============================================
# Oracle Cloud Setup Script - Flores Victoria
# VM.Standard.E2.1.Micro (1 OCPU, 1GB RAM)
# ============================================

set -e  # Exit on error

echo "🚀 Iniciando setup de Oracle Cloud Free Tier..."
echo "================================================"

# ============================================
# 1. ACTUALIZAR SISTEMA
# ============================================
echo ""
echo "📦 1/7 - Actualizando sistema..."
sudo apt-get update -qq
sudo apt-get upgrade -y -qq

# ============================================
# 2. INSTALAR DOCKER
# ============================================
echo ""
echo "🐳 2/7 - Instalando Docker..."

# Instalar dependencias
sudo apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# Agregar GPG key de Docker
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Agregar repositorio Docker
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Instalar Docker Engine
sudo apt-get update -qq
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Agregar usuario ubuntu al grupo docker
sudo usermod -aG docker ubuntu

echo "✅ Docker instalado: $(docker --version)"

# ============================================
# 3. INSTALAR DOCKER COMPOSE STANDALONE
# ============================================
echo ""
echo "🔧 3/7 - Instalando Docker Compose standalone..."

DOCKER_COMPOSE_VERSION="2.24.0"
sudo curl -L "https://github.com/docker/compose/releases/download/v${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

echo "✅ Docker Compose instalado: $(docker-compose --version)"

# ============================================
# 4. CONFIGURAR FIREWALL INTERNO
# ============================================
echo ""
echo "🔥 4/7 - Configurando firewall interno..."

# Permitir puertos HTTP y HTTPS
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT

# Guardar reglas
sudo apt-get install -y iptables-persistent
sudo netfilter-persistent save

echo "✅ Firewall configurado (puertos 80, 443 abiertos)"

# ============================================
# 5. CLONAR REPOSITORIO
# ============================================
echo ""
echo "📥 5/7 - Clonando repositorio..."

cd /home/ubuntu

if [ -d "Flores-Victoria-" ]; then
    echo "⚠️  Repositorio ya existe, actualizando..."
    cd Flores-Victoria-
    git pull origin main
else
    git clone https://github.com/laloaggro/Flores-Victoria-.git
    cd Flores-Victoria-
fi

echo "✅ Repositorio clonado/actualizado"

# ============================================
# 6. CONFIGURAR VARIABLES DE ENTORNO
# ============================================
echo ""
echo "⚙️  6/7 - Configurando variables de entorno..."

cd /home/ubuntu/Flores-Victoria-/environments/production

# Crear .env.production si no existe
if [ ! -f .env.production ]; then
    cat > .env.production <<EOF
# ============================================
# CONFIGURACIÓN ORACLE CLOUD FREE TIER
# ============================================

# Node Environment
NODE_ENV=production

# API Gateway
API_GATEWAY_PORT=3000
API_GATEWAY_HOST=0.0.0.0

# JWT Secret (CAMBIAR EN PRODUCCIÓN)
JWT_SECRET=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-64)

# PostgreSQL
POSTGRES_USER=flores_user
POSTGRES_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
POSTGRES_DB=flores_db
POSTGRES_HOST=postgres
POSTGRES_PORT=5432

# MongoDB
MONGO_ROOT_USERNAME=flores_admin
MONGO_ROOT_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
MONGO_HOST=mongodb
MONGO_PORT=27017
MONGO_DATABASE=flores_victoria

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)

# Session Secret
SESSION_SECRET=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-64)

# CORS Origins
CORS_ORIGINS=http://144.22.56.153,https://144.22.56.153

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Oracle Cloud Specific
MEMORY_LIMIT=1GB
MAX_CONTAINER_MEMORY=128MB
EOF

    echo "✅ Archivo .env.production creado"
else
    echo "⚠️  .env.production ya existe, no se sobrescribe"
fi

# ============================================
# 7. LEVANTAR SERVICIOS
# ============================================
echo ""
echo "🚀 7/7 - Levantando servicios con Docker Compose..."

cd /home/ubuntu/Flores-Victoria-/environments/production

# Usar docker-compose.free-tier.yml
docker-compose -f docker-compose.free-tier.yml pull
docker-compose -f docker-compose.free-tier.yml up -d

echo ""
echo "⏳ Esperando que los servicios se inicialicen (30 segundos)..."
sleep 30

# ============================================
# VERIFICAR SERVICIOS
# ============================================
echo ""
echo "🔍 Verificando servicios..."
docker-compose -f docker-compose.free-tier.yml ps

echo ""
echo "✅ ================================================"
echo "✅ SETUP COMPLETADO EXITOSAMENTE"
echo "✅ ================================================"
echo ""
echo "📊 Información del servidor:"
echo "   - IP Pública: 144.22.56.153"
echo "   - Frontend: http://144.22.56.153"
echo "   - API Gateway: http://144.22.56.153/api"
echo ""
echo "🔧 Comandos útiles:"
echo "   - Ver logs: docker-compose -f docker-compose.free-tier.yml logs -f"
echo "   - Reiniciar: docker-compose -f docker-compose.free-tier.yml restart"
echo "   - Detener: docker-compose -f docker-compose.free-tier.yml down"
echo "   - Estado: docker stats"
echo ""
echo "📝 Archivo de configuración: /home/ubuntu/Flores-Victoria-/environments/production/.env.production"
echo ""
echo "⚠️  IMPORTANTE: Cambia las contraseñas en .env.production antes de uso en producción real"
echo ""
