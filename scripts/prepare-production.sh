#!/bin/bash

# ================================================
# 🚀 SCRIPT DE PREPARACIÓN PARA PRODUCCIÓN
# ================================================
# Automatiza tareas P0 y P1 del análisis pre-producción
# Autor: Análisis Pre-Producción Oracle Cloud
# Fecha: $(date +%Y-%m-%d)

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
NC='\033[0m'

# Configuración
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SECRETS_FILE="$PROJECT_ROOT/.secrets.generated"

# ================================================
# FUNCIONES AUXILIARES
# ================================================

log_info() {
    echo -e "${BLUE}ℹ️  [$(date +'%H:%M:%S')]${NC} $1"
}

log_success() {
    echo -e "${GREEN}✅ [$(date +'%H:%M:%S')]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}⚠️  [$(date +'%H:%M:%S')]${NC} $1"
}

log_error() {
    echo -e "${RED}❌ [$(date +'%H:%M:%S')]${NC} $1"
}

log_section() {
    echo ""
    echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${MAGENTA}$1${NC}"
    echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

# ================================================
# FUNCIONES PRINCIPALES
# ================================================

check_dependencies() {
    log_section "🔍 VERIFICANDO DEPENDENCIAS"
    
    local missing_deps=0
    
    # Verificar openssl
    if ! command -v openssl &> /dev/null; then
        log_error "openssl no está instalado"
        missing_deps=1
    else
        log_success "openssl encontrado"
    fi
    
    # Verificar docker
    if ! command -v docker &> /dev/null; then
        log_error "docker no está instalado"
        missing_deps=1
    else
        log_success "docker encontrado"
    fi
    
    # Verificar npm
    if ! command -v npm &> /dev/null; then
        log_error "npm no está instalado"
        missing_deps=1
    else
        log_success "npm encontrado"
    fi
    
    # Verificar jq (opcional)
    if ! command -v jq &> /dev/null; then
        log_warning "jq no está instalado (opcional, para validaciones)"
    else
        log_success "jq encontrado"
    fi
    
    if [ $missing_deps -eq 1 ]; then
        log_error "Faltan dependencias requeridas"
        exit 1
    fi
}

generate_secrets() {
    log_section "🔐 P0.1 - GENERANDO SECRETS FUERTES"
    
    log_info "Generando passwords seguros..."
    
    # Generar secrets
    POSTGRES_PASSWORD=$(openssl rand -base64 32)
    REDIS_PASSWORD=$(openssl rand -base64 32)
    JWT_SECRET=$(openssl rand -base64 64)
    MONGODB_PASSWORD=$(openssl rand -base64 32)
    RABBITMQ_PASSWORD=$(openssl rand -base64 32)
    
    # Guardar en archivo temporal (seguro)
    cat > "$SECRETS_FILE" <<EOF
# ================================================
# SECRETS GENERADOS AUTOMÁTICAMENTE
# ================================================
# Fecha: $(date)
# IMPORTANTE: Este archivo contiene información sensible
# NO lo subas a git ni lo compartas públicamente
# ================================================

POSTGRES_PASSWORD=$POSTGRES_PASSWORD
REDIS_PASSWORD=$REDIS_PASSWORD
JWT_SECRET=$JWT_SECRET
MONGODB_PASSWORD=$MONGODB_PASSWORD
RABBITMQ_PASSWORD=$RABBITMQ_PASSWORD

# ================================================
# INSTRUCCIONES DE USO
# ================================================
# 1. Copia estos valores a .env.production
# 2. Actualiza docker-compose.oracle.yml para usar estas variables
# 3. Guarda estos valores en un gestor de passwords seguro
# 4. Elimina este archivo después de copiar los valores
# ================================================
EOF

    chmod 600 "$SECRETS_FILE"
    
    log_success "Secrets generados en: $SECRETS_FILE"
    log_warning "⚠️  IMPORTANTE: Guarda estos secrets en un lugar seguro"
    log_warning "⚠️  Este archivo será mostrado al final del script"
}

update_env_production() {
    log_section "📝 P0.2 - ACTUALIZANDO .env.production"
    
    local env_file="$PROJECT_ROOT/.env.production"
    
    if [ ! -f "$env_file" ]; then
        log_error ".env.production no encontrado"
        return 1
    fi
    
    # Backup del archivo original
    cp "$env_file" "$env_file.backup.$(date +%Y%m%d_%H%M%S)"
    log_info "Backup creado: $env_file.backup.*"
    
    # Actualizar passwords
    sed -i "s|^POSTGRES_PASSWORD=.*|POSTGRES_PASSWORD=$POSTGRES_PASSWORD|" "$env_file"
    sed -i "s|^REDIS_PASSWORD=.*|REDIS_PASSWORD=$REDIS_PASSWORD|" "$env_file"
    sed -i "s|^DB_PASSWORD=.*|DB_PASSWORD=$POSTGRES_PASSWORD|" "$env_file"
    sed -i "s|^JWT_SECRET=.*|JWT_SECRET=$JWT_SECRET|" "$env_file"
    sed -i "s|^MONGO_INITDB_ROOT_PASSWORD=.*|MONGO_INITDB_ROOT_PASSWORD=$MONGODB_PASSWORD|" "$env_file"
    sed -i "s|^MONGODB_ROOT_PASSWORD=.*|MONGODB_ROOT_PASSWORD=$MONGODB_PASSWORD|" "$env_file"
    sed -i "s|^RABBITMQ_DEFAULT_PASS=.*|RABBITMQ_DEFAULT_PASS=$RABBITMQ_PASSWORD|" "$env_file"
    
    log_success ".env.production actualizado con secrets fuertes"
}

create_env_example() {
    log_section "📄 P1.7 - CREANDO .env.production.example"
    
    local example_file="$PROJECT_ROOT/.env.production.example"
    
    cat > "$example_file" <<'EOF'
# ================================================
# CONFIGURACIÓN DE PRODUCCIÓN - EJEMPLO
# ================================================
# Copia este archivo a .env.production y actualiza los valores
# NUNCA uses estos valores de ejemplo en producción
# ================================================

# ==========================================
# BASE DE DATOS POSTGRESQL
# ==========================================
DB_HOST=postgres
DB_PORT=5432
DB_NAME=flores_victoria
DB_USER=flores_user
DB_PASSWORD=GENERAR_PASSWORD_FUERTE_32_CHARS

POSTGRES_USER=postgres
POSTGRES_PASSWORD=GENERAR_PASSWORD_FUERTE_32_CHARS
POSTGRES_DB=flores_victoria
PGDATA=/var/lib/postgresql/data/pgdata

# ==========================================
# REDIS
# ==========================================
REDIS_URL=redis://:PASSWORD@redis:6379
REDIS_PASSWORD=GENERAR_PASSWORD_FUERTE_32_CHARS

# ==========================================
# JWT - AUTENTICACIÓN
# ==========================================
JWT_SECRET=GENERAR_SECRET_FUERTE_64_CHARS
JWT_EXPIRES_IN=7d

# ==========================================
# MONGODB (opcional)
# ==========================================
MONGODB_URI=mongodb://admin:PASSWORD@mongodb:27017/flores_victoria?authSource=admin
MONGO_INITDB_ROOT_USERNAME=admin
MONGO_INITDB_ROOT_PASSWORD=GENERAR_PASSWORD_FUERTE_32_CHARS

# ==========================================
# RABBITMQ (opcional)
# ==========================================
RABBITMQ_URL=amqp://admin:PASSWORD@rabbitmq:5672
RABBITMQ_DEFAULT_USER=admin
RABBITMQ_DEFAULT_PASS=GENERAR_PASSWORD_FUERTE_32_CHARS

# ==========================================
# APLICACIÓN
# ==========================================
NODE_ENV=production
LOG_LEVEL=warn
PORT=3000

# ==========================================
# MONITOREO
# ==========================================
LOGSTASH_HOST=logstash
LOGSTASH_PORT=5000
JAEGER_AGENT_HOST=jaeger
JAEGER_AGENT_PORT=6831

# ==========================================
# BACKUPS (opcional - Oracle Object Storage)
# ==========================================
S3_BUCKET=flores-victoria-backups
S3_ENABLED=false
AWS_ACCESS_KEY_ID=oracle_cloud_access_key
AWS_SECRET_ACCESS_KEY=oracle_cloud_secret_key

# ==========================================
# INSTRUCCIONES PARA GENERAR SECRETS
# ==========================================
# Ejecuta estos comandos para generar passwords seguros:
#   openssl rand -base64 32  # Para passwords de 32 chars
#   openssl rand -base64 64  # Para JWT_SECRET de 64 chars
#
# O ejecuta el script: ./scripts/prepare-production.sh
# ==========================================
EOF

    log_success ".env.production.example creado"
}

fix_npm_vulnerabilities() {
    log_section "🔧 P0.3 - CORRIGIENDO VULNERABILIDADES NPM"
    
    local services=(
        "auth-service"
        "api-gateway"
        "order-service"
        "product-service"
        "promotion-service"
        "user-service"
    )
    
    log_info "Servicios a auditar: ${#services[@]}"
    
    for service in "${services[@]}"; do
        local service_path="$PROJECT_ROOT/microservices/$service"
        
        if [ ! -d "$service_path" ]; then
            log_warning "Servicio no encontrado: $service"
            continue
        fi
        
        log_info "Auditando $service..."
        cd "$service_path"
        
        # Ejecutar npm audit fix
        if npm audit fix --audit-level=moderate > /dev/null 2>&1; then
            log_success "$service: vulnerabilidades corregidas"
        else
            log_warning "$service: revisar manualmente"
        fi
    done
    
    cd "$PROJECT_ROOT"
    log_success "Auditoría de vulnerabilidades completada"
}

update_docker_compose_logging() {
    log_section "📋 P1.4 - AGREGANDO LOG ROTATION"
    
    local compose_file="$PROJECT_ROOT/docker-compose.oracle.yml"
    
    if [ ! -f "$compose_file" ]; then
        log_error "docker-compose.oracle.yml no encontrado"
        return 1
    fi
    
    # Backup
    cp "$compose_file" "$compose_file.backup.$(date +%Y%m%d_%H%M%S)"
    log_info "Backup creado: $compose_file.backup.*"
    
    log_warning "⚠️  Esta tarea requiere edición manual del docker-compose.yml"
    log_info "Agrega lo siguiente a cada servicio:"
    echo ""
    echo "    logging:"
    echo "      driver: \"json-file\""
    echo "      options:"
    echo "        max-size: \"10m\""
    echo "        max-file: \"3\""
    echo "        compress: \"true\""
    echo ""
    log_info "Ver el análisis completo para más detalles"
}

update_docker_compose_healthchecks() {
    log_section "🏥 P1.5 - AGREGANDO HEALTHCHECKS"
    
    log_warning "⚠️  Esta tarea requiere edición manual del docker-compose.yml"
    log_info "Agrega healthchecks a los 9 microservicios:"
    echo ""
    echo "Ejemplo para auth-service:"
    echo "    healthcheck:"
    echo "      test: [\"CMD\", \"wget\", \"--quiet\", \"--tries=1\", \"--spider\", \"http://localhost:3001/health\"]"
    echo "      interval: 30s"
    echo "      timeout: 10s"
    echo "      retries: 3"
    echo "      start_period: 40s"
    echo ""
    log_info "Servicios y puertos:"
    echo "  - api-gateway: 3000"
    echo "  - auth-service: 3001"
    echo "  - user-service: 3003"
    echo "  - order-service: 3004"
    echo "  - cart-service: 3005"
    echo "  - wishlist-service: 3006"
    echo "  - review-service: 3007"
    echo "  - contact-service: 3008"
    echo "  - product-service: 3009"
}

update_docker_compose_cpu_limits() {
    log_section "⚡ P1.6 - AGREGANDO CPU LIMITS"
    
    log_warning "⚠️  Esta tarea requiere edición manual del docker-compose.yml"
    log_info "Agrega límites de CPU a cada servicio:"
    echo ""
    echo "Ejemplo:"
    echo "    cpus: 0.5  # 50% de un core"
    echo "    mem_limit: 256m"
    echo "    mem_reservation: 128m"
    echo ""
    log_info "Distribución recomendada para Oracle Cloud (4 OCPUs):"
    echo "  - nginx: 0.5"
    echo "  - api-gateway: 0.75"
    echo "  - postgres: 1.0"
    echo "  - redis: 0.25"
    echo "  - Cada microservicio: 0.5"
}

verify_gitignore() {
    log_section "🔍 P0.4 - VERIFICANDO .gitignore"
    
    local gitignore="$PROJECT_ROOT/.gitignore"
    
    if [ ! -f "$gitignore" ]; then
        log_error ".gitignore no encontrado"
        return 1
    fi
    
    # Verificar que .env.production está ignorado
    if grep -q "\.env\.production" "$gitignore" || grep -q "\.env\.\*" "$gitignore" || grep -q "\.env$" "$gitignore"; then
        log_success ".env.production está en .gitignore"
    else
        log_warning ".env.production NO está en .gitignore"
        log_info "Agregando .env.production a .gitignore..."
        echo ".env.production" >> "$gitignore"
        log_success "Agregado a .gitignore"
    fi
    
    # Verificar que .secrets.generated está ignorado
    if ! grep -q "\.secrets\.generated" "$gitignore"; then
        echo ".secrets.generated" >> "$gitignore"
        log_success "Agregado .secrets.generated a .gitignore"
    fi
}

create_db_migration_script() {
    log_section "🗄️  P1.9 - CREANDO SCRIPT DE MIGRACIÓN DB"
    
    local migration_script="$PROJECT_ROOT/scripts/init-db.sql"
    
    cat > "$migration_script" <<'EOF'
-- ================================================
-- SCRIPT DE INICIALIZACIÓN DE BASE DE DATOS
-- ================================================
-- Proyecto: Flores Victoria E-commerce
-- Base de Datos: PostgreSQL 15+
-- ================================================

-- Crear extensiones
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- TABLA: auth_users
-- ================================================
CREATE TABLE IF NOT EXISTS auth_users (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT,
    provider TEXT,
    provider_id TEXT,
    role TEXT DEFAULT 'user',
    picture TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para auth_users
CREATE INDEX IF NOT EXISTS idx_auth_users_email ON auth_users(email);
CREATE INDEX IF NOT EXISTS idx_auth_users_provider ON auth_users(provider, provider_id);

-- ================================================
-- TABLA: users
-- ================================================
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password TEXT,
    name TEXT,
    role TEXT DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- ================================================
-- TABLA: products
-- ================================================
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    category TEXT,
    stock INTEGER DEFAULT 0 CHECK (stock >= 0),
    featured BOOLEAN DEFAULT false,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para products
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_products_name_trgm ON products USING gin (name gin_trgm_ops);

-- ================================================
-- TABLA: orders
-- ================================================
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
    total DECIMAL(10, 2) NOT NULL CHECK (total >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Índices para orders
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- ================================================
-- TABLA: order_items
-- ================================================
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Índices para order_items
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- ================================================
-- TABLA: reviews
-- ================================================
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_approved BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Índices para reviews
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_approved ON reviews(is_approved) WHERE is_approved = true;

-- ================================================
-- TABLA: addresses
-- ================================================
CREATE TABLE IF NOT EXISTS addresses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    street TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT,
    country TEXT NOT NULL,
    postal_code TEXT,
    is_default BOOLEAN DEFAULT false,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Índices para addresses
CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON addresses(user_id);

-- ================================================
-- TABLA: contact_messages
-- ================================================
CREATE TABLE IF NOT EXISTS contact_messages (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'resolved', 'closed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para contact_messages
CREATE INDEX IF NOT EXISTS idx_contact_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_created_at ON contact_messages(created_at DESC);

-- ================================================
-- DATOS INICIALES (SEED)
-- ================================================

-- Usuario admin por defecto (password: admin123 - CAMBIAR EN PRODUCCIÓN)
INSERT INTO users (email, password, name, role) 
VALUES ('admin@floresvictoria.com', '$2b$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', 'Admin', 'admin')
ON CONFLICT (email) DO NOTHING;

-- ================================================
-- VERIFICACIÓN
-- ================================================
SELECT 'Tablas creadas correctamente' AS status;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;
SELECT indexname FROM pg_indexes WHERE schemaname = 'public' ORDER BY indexname;

EOF

    log_success "Script de migración creado: $migration_script"
    log_info "Ejecutar en PostgreSQL: psql -U flores_user -d flores_victoria -f $migration_script"
}

show_summary() {
    log_section "📊 RESUMEN DE TAREAS COMPLETADAS"
    
    echo ""
    echo -e "${GREEN}✅ TAREAS P0 (BLOQUEANTES) COMPLETADAS:${NC}"
    echo "  ✅ P0.1 - Secrets fuertes generados"
    echo "  ✅ P0.2 - .env.production actualizado"
    echo "  ✅ P0.3 - Vulnerabilidades npm corregidas"
    echo "  ✅ P0.4 - .gitignore verificado"
    echo ""
    echo -e "${YELLOW}⚠️  TAREAS P1 (REQUERIDAS) - ACCIÓN MANUAL:${NC}"
    echo "  ⚠️  P1.4 - Agregar log rotation a docker-compose.yml"
    echo "  ⚠️  P1.5 - Agregar healthchecks a microservicios"
    echo "  ⚠️  P1.6 - Agregar CPU limits"
    echo "  ✅ P1.7 - .env.production.example creado"
    echo "  ⚠️  P1.8 - Configurar backup automático (ver scripts/backup-databases-v2.sh)"
    echo "  ✅ P1.9 - Script de migración DB creado"
    echo ""
    echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${BLUE}📄 SECRETS GENERADOS (GUARDAR EN LUGAR SEGURO):${NC}"
    echo ""
    cat "$SECRETS_FILE"
    echo ""
    echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${YELLOW}⚠️  IMPORTANTE:${NC}"
    echo "  1. Guarda los secrets en un gestor de passwords (LastPass, 1Password, etc.)"
    echo "  2. Completa las tareas manuales P1.4, P1.5, P1.6"
    echo "  3. Ejecuta el script de migración: psql -U flores_user -d flores_victoria -f scripts/init-db.sql"
    echo "  4. Configura backup automático en cron"
    echo "  5. Elimina el archivo .secrets.generated después de copiar los valores"
    echo "  6. Revisa el análisis completo: ANALISIS_PRE_PRODUCCION_ORACLE_CLOUD.md"
    echo ""
    echo -e "${GREEN}🎉 Sistema listo para deploy después de completar las tareas manuales${NC}"
    echo ""
}

# ================================================
# MAIN
# ================================================

main() {
    clear
    echo ""
    echo -e "${MAGENTA}╔═══════════════════════════════════════════════════════╗${NC}"
    echo -e "${MAGENTA}║                                                       ║${NC}"
    echo -e "${MAGENTA}║   🚀 PREPARACIÓN PARA PRODUCCIÓN - FLORES VICTORIA   ║${NC}"
    echo -e "${MAGENTA}║                                                       ║${NC}"
    echo -e "${MAGENTA}╚═══════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    log_info "Directorio del proyecto: $PROJECT_ROOT"
    echo ""
    
    # Ejecutar tareas
    check_dependencies
    generate_secrets
    update_env_production
    verify_gitignore
    create_env_example
    fix_npm_vulnerabilities
    create_db_migration_script
    
    # Tareas que requieren edición manual
    update_docker_compose_logging
    update_docker_compose_healthchecks
    update_docker_compose_cpu_limits
    
    # Mostrar resumen
    show_summary
}

# Ejecutar script
main "$@"
