#!/bin/bash

# ================================================
# 🔒 SCRIPT DE GENERACIÓN DE SECRETS DE PRODUCCIÓN
# ================================================
# Genera secrets seguros para producción
# Uso: ./generate-production-secrets.sh

set -e

echo "🔒 GENERACIÓN DE SECRETS DE PRODUCCIÓN - Flores Victoria"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Directorio de output
OUTPUT_DIR="./config/production-secrets"
mkdir -p "$OUTPUT_DIR"

echo "📁 Directorio de output: $OUTPUT_DIR"
echo ""

# ================================================
# 1. JWT SECRET (64 bytes = 128 caracteres hex)
# ================================================
echo "🔑 Generando JWT_SECRET..."
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
echo "JWT_SECRET=$JWT_SECRET" > "$OUTPUT_DIR/.env.secrets"
echo -e "${GREEN}✅ JWT_SECRET generado (128 caracteres)${NC}"
echo ""

# ================================================
# 2. DATABASE PASSWORDS
# ================================================
echo "🗄️ Generando database passwords..."

# PostgreSQL
POSTGRES_PASSWORD=$(openssl rand -base64 32)
echo "POSTGRES_PASSWORD=$POSTGRES_PASSWORD" >> "$OUTPUT_DIR/.env.secrets"
echo -e "${GREEN}✅ PostgreSQL password generado${NC}"

# MongoDB
MONGODB_PASSWORD=$(openssl rand -base64 32)
echo "MONGODB_PASSWORD=$MONGODB_PASSWORD" >> "$OUTPUT_DIR/.env.secrets"
echo -e "${GREEN}✅ MongoDB password generado${NC}"

# Redis password
REDIS_PASSWORD=$(openssl rand -base64 32)
echo "REDIS_PASSWORD=$REDIS_PASSWORD" >> "$OUTPUT_DIR/.env.secrets"
echo -e "${GREEN}✅ Redis password generado${NC}"
echo ""

# ================================================
# 3. API KEYS
# ================================================
echo "🔐 Generando API keys..."

# API Gateway key
API_GATEWAY_KEY=$(openssl rand -hex 32)
echo "API_GATEWAY_KEY=$API_GATEWAY_KEY" >> "$OUTPUT_DIR/.env.secrets"
echo -e "${GREEN}✅ API Gateway key generado${NC}"

# Internal service keys
for service in cart product auth user order contact review; do
    SERVICE_KEY=$(openssl rand -hex 32)
    SERVICE_NAME_UPPER=$(echo "$service" | tr '[:lower:]' '[:upper:]')
    echo "${SERVICE_NAME_UPPER}_SERVICE_KEY=$SERVICE_KEY" >> "$OUTPUT_DIR/.env.secrets"
    echo -e "${GREEN}✅ ${service}-service key generado${NC}"
done
echo ""

# ================================================
# 4. SESSION SECRET
# ================================================
echo "🎫 Generando session secret..."
SESSION_SECRET=$(openssl rand -base64 48)
echo "SESSION_SECRET=$SESSION_SECRET" >> "$OUTPUT_DIR/.env.secrets"
echo -e "${GREEN}✅ Session secret generado${NC}"
echo ""

# ================================================
# 5. ENCRYPTION KEYS
# ================================================
echo "🔒 Generando encryption keys..."
ENCRYPTION_KEY=$(openssl rand -hex 32)
ENCRYPTION_IV=$(openssl rand -hex 16)
echo "ENCRYPTION_KEY=$ENCRYPTION_KEY" >> "$OUTPUT_DIR/.env.secrets"
echo "ENCRYPTION_IV=$ENCRYPTION_IV" >> "$OUTPUT_DIR/.env.secrets"
echo -e "${GREEN}✅ Encryption keys generados${NC}"
echo ""

# ================================================
# 6. COOKIE SECRET
# ================================================
echo "🍪 Generando cookie secret..."
COOKIE_SECRET=$(openssl rand -base64 32)
echo "COOKIE_SECRET=$COOKIE_SECRET" >> "$OUTPUT_DIR/.env.secrets"
echo -e "${GREEN}✅ Cookie secret generado${NC}"
echo ""

# ================================================
# 7. CREAR TEMPLATE DE .ENV PARA PRODUCCIÓN
# ================================================
echo "📄 Creando template .env.production..."

cat > "$OUTPUT_DIR/.env.production.template" << 'EOF'
# ================================================
# PRODUCTION ENVIRONMENT VARIABLES
# ================================================
# ⚠️ NO COMMITEAR ESTE ARCHIVO CON VALORES REALES
# Usar AWS Secrets Manager, HashiCorp Vault, o similar

# ================================================
# NODE ENVIRONMENT
# ================================================
NODE_ENV=production
PORT=3000

# ================================================
# SECURITY (CARGAR DESDE .env.secrets)
# ================================================
JWT_SECRET=__REPLACE_WITH_GENERATED__
SESSION_SECRET=__REPLACE_WITH_GENERATED__
COOKIE_SECRET=__REPLACE_WITH_GENERATED__
ENCRYPTION_KEY=__REPLACE_WITH_GENERATED__
ENCRYPTION_IV=__REPLACE_WITH_GENERATED__
API_GATEWAY_KEY=__REPLACE_WITH_GENERATED__

# ================================================
# DATABASE CONNECTIONS
# ================================================
# PostgreSQL
POSTGRES_HOST=postgres-prod.example.com
POSTGRES_PORT=5432
POSTGRES_DB=flores_victoria
POSTGRES_USER=admin
POSTGRES_PASSWORD=__REPLACE_WITH_GENERATED__
POSTGRES_MAX_CONNECTIONS=20
POSTGRES_SSL=true

# MongoDB
MONGODB_URI=mongodb://admin:__PASSWORD__@mongodb-prod.example.com:27017/flores_victoria?authSource=admin
MONGODB_MAX_POOL_SIZE=50
MONGODB_SSL=true

# Redis
REDIS_HOST=redis-prod.example.com
REDIS_PORT=6379
REDIS_PASSWORD=__REPLACE_WITH_GENERATED__
REDIS_TLS=true
REDIS_MAX_RETRIES=3

# ================================================
# SERVICE URLS (INTERNAL)
# ================================================
CART_SERVICE_URL=http://cart-service:3001
PRODUCT_SERVICE_URL=http://product-service:3002
AUTH_SERVICE_URL=http://auth-service:3003
USER_SERVICE_URL=http://user-service:3004
ORDER_SERVICE_URL=http://order-service:3005
CONTACT_SERVICE_URL=http://contact-service:3006
REVIEW_SERVICE_URL=http://review-service:3007

# ================================================
# SERVICE KEYS (INTERNAL AUTH)
# ================================================
CART_SERVICE_KEY=__REPLACE_WITH_GENERATED__
PRODUCT_SERVICE_KEY=__REPLACE_WITH_GENERATED__
AUTH_SERVICE_KEY=__REPLACE_WITH_GENERATED__
USER_SERVICE_KEY=__REPLACE_WITH_GENERATED__
ORDER_SERVICE_KEY=__REPLACE_WITH_GENERATED__
CONTACT_SERVICE_KEY=__REPLACE_WITH_GENERATED__
REVIEW_SERVICE_KEY=__REPLACE_WITH_GENERATED__

# ================================================
# CORS
# ================================================
CORS_ORIGIN=https://flores-victoria.com,https://www.flores-victoria.com
CORS_CREDENTIALS=true

# ================================================
# RATE LIMITING
# ================================================
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_LOGIN_MAX=5

# ================================================
# JWT CONFIGURATION
# ================================================
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# ================================================
# LOGGING
# ================================================
LOG_LEVEL=info
LOG_FILE_PATH=/var/log/flores-victoria
LOG_MAX_SIZE=20m
LOG_MAX_FILES=14d

# ================================================
# EMAIL (SMTP)
# ================================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=true
SMTP_USER=noreply@flores-victoria.com
SMTP_PASSWORD=__REPLACE_WITH_APP_PASSWORD__
EMAIL_FROM=Flores Victoria <noreply@flores-victoria.com>

# ================================================
# PAYMENT GATEWAYS
# ================================================
# Stripe (Configurar en producción)
STRIPE_SECRET_KEY=__REPLACE_WITH_STRIPE_SECRET_KEY__
STRIPE_PUBLISHABLE_KEY=__REPLACE_WITH_STRIPE_PUBLISHABLE_KEY__
STRIPE_WEBHOOK_SECRET=__REPLACE_WITH_STRIPE_WEBHOOK_SECRET__

# PayPal (opcional)
PAYPAL_CLIENT_ID=__REPLACE_WITH_PAYPAL_CLIENT_ID__
PAYPAL_CLIENT_SECRET=__REPLACE_WITH_PAYPAL_CLIENT_SECRET__
PAYPAL_MODE=live

# ================================================
# AWS S3 (PARA IMÁGENES)
# ================================================
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=__REPLACE__
AWS_SECRET_ACCESS_KEY=__REPLACE__
AWS_S3_BUCKET=flores-victoria-images
AWS_S3_CDN_URL=https://cdn.flores-victoria.com

# ================================================
# CLOUDFLARE (CDN/DDoS Protection)
# ================================================
CLOUDFLARE_ZONE_ID=__REPLACE__
CLOUDFLARE_API_TOKEN=__REPLACE__

# ================================================
# MONITORING
# ================================================
# Sentry
SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
SENTRY_ENVIRONMENT=production
SENTRY_TRACES_SAMPLE_RATE=0.1

# Prometheus
PROMETHEUS_ENABLED=true
PROMETHEUS_PORT=9090

# ================================================
# BACKUP
# ================================================
BACKUP_ENABLED=true
BACKUP_S3_BUCKET=flores-victoria-backups
BACKUP_RETENTION_DAYS=7

# ================================================
# DOMAIN
# ================================================
FRONTEND_URL=https://flores-victoria.com
API_URL=https://api.flores-victoria.com
EOF

echo -e "${GREEN}✅ Template .env.production creado${NC}"
echo ""

# ================================================
# 8. CREAR SCRIPT PARA AWS SECRETS MANAGER
# ================================================
echo "☁️ Creando script para AWS Secrets Manager..."

cat > "$OUTPUT_DIR/upload-to-aws-secrets.sh" << 'AWSEOF'
#!/bin/bash

# ================================================
# UPLOAD SECRETS TO AWS SECRETS MANAGER
# ================================================
# Prerrequisito: AWS CLI instalado y configurado
# Uso: ./upload-to-aws-secrets.sh

set -e

AWS_REGION="${AWS_REGION:-us-east-1}"
SECRET_NAME="flores-victoria/production"

echo "☁️ Subiendo secrets a AWS Secrets Manager..."
echo "Region: $AWS_REGION"
echo "Secret name: $SECRET_NAME"
echo ""

# Verificar que .env.secrets existe
if [ ! -f ".env.secrets" ]; then
    echo "❌ Error: .env.secrets no encontrado"
    exit 1
fi

# Convertir .env.secrets a JSON
SECRET_JSON=$(cat .env.secrets | jq -R -s -c 'split("\n") | map(select(length > 0 and (startswith("#") | not))) | map(split("=") | {(.[0]): .[1]}) | add')

# Crear o actualizar secret
aws secretsmanager create-secret \
    --name "$SECRET_NAME" \
    --secret-string "$SECRET_JSON" \
    --region "$AWS_REGION" \
    2>/dev/null || \
aws secretsmanager update-secret \
    --secret-id "$SECRET_NAME" \
    --secret-string "$SECRET_JSON" \
    --region "$AWS_REGION"

echo "✅ Secrets subidos a AWS Secrets Manager"
echo ""
echo "Para recuperar en producción:"
echo "aws secretsmanager get-secret-value --secret-id $SECRET_NAME --region $AWS_REGION"
AWSEOF

chmod +x "$OUTPUT_DIR/upload-to-aws-secrets.sh"
echo -e "${GREEN}✅ Script AWS Secrets Manager creado${NC}"
echo ""

# ================================================
# 9. CREAR DOCKER SECRETS
# ================================================
echo "🐳 Creando Docker secrets..."

mkdir -p "$OUTPUT_DIR/docker-secrets"

# Crear archivo por cada secret
while IFS='=' read -r key value; do
    # Ignorar líneas vacías y comentarios
    if [ -z "$key" ] || [[ "$key" =~ ^# ]]; then
        continue
    fi
    echo -n "$value" > "$OUTPUT_DIR/docker-secrets/${key,,}"
done < "$OUTPUT_DIR/.env.secrets"

echo -e "${GREEN}✅ Docker secrets creados en docker-secrets/${NC}"
echo ""

# ================================================
# RESUMEN
# ================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ SECRETS GENERADOS EXITOSAMENTE${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📁 Archivos creados:"
echo "   1. $OUTPUT_DIR/.env.secrets"
echo "   2. $OUTPUT_DIR/.env.production.template"
echo "   3. $OUTPUT_DIR/upload-to-aws-secrets.sh"
echo "   4. $OUTPUT_DIR/docker-secrets/"
echo ""
echo -e "${YELLOW}⚠️ IMPORTANTE:${NC}"
echo "   1. NUNCA commitear .env.secrets a Git"
echo "   2. Agregar config/production-secrets/ a .gitignore"
echo "   3. Subir secrets a AWS Secrets Manager o Vault"
echo "   4. Rotar passwords regularmente (90 días)"
echo "   5. Usar diferentes secrets para staging y producción"
echo ""
echo "📚 Próximos pasos:"
echo "   1. Revisar .env.secrets generado"
echo "   2. Completar .env.production.template con valores externos"
echo "   3. Ejecutar: ./upload-to-aws-secrets.sh"
echo "   4. Configurar servicios para leer desde AWS Secrets Manager"
echo ""
echo -e "${GREEN}🎯 Para usar en Docker Compose:${NC}"
echo "   docker secret create jwt_secret docker-secrets/jwt_secret"
echo "   docker secret create postgres_password docker-secrets/postgres_password"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
