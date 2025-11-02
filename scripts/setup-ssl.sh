#!/bin/bash

# ================================================
# 🔒 CONFIGURACIÓN SSL/TLS CON LET'S ENCRYPT
# ================================================
# Script para configurar HTTPS en Flores Victoria

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $1"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# ================================================
# CONFIGURACIÓN
# ================================================

DOMAIN="${DOMAIN:-flores-victoria.com}"
WWW_DOMAIN="www.${DOMAIN}"
EMAIL="${ADMIN_EMAIL:-admin@${DOMAIN}}"
WEBROOT="/var/www/html"

log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log "🔒 CONFIGURACIÓN SSL/TLS - Flores Victoria"
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log "Dominio: $DOMAIN"
log "WWW: $WWW_DOMAIN"
log "Email: $EMAIL"
echo ""

# ================================================
# 1. VERIFICAR REQUISITOS
# ================================================

log "1️⃣  Verificando requisitos..."

# Verificar si es root
if [ "$EUID" -ne 0 ]; then 
    log_error "Este script debe ejecutarse como root"
    exit 1
fi

# Verificar sistema operativo
if [ -f /etc/debian_version ]; then
    OS="debian"
    PKG_MANAGER="apt-get"
elif [ -f /etc/redhat-release ]; then
    OS="redhat"
    PKG_MANAGER="yum"
else
    log_error "Sistema operativo no soportado"
    exit 1
fi

log_success "Sistema: $OS"

# ================================================
# 2. INSTALAR CERTBOT
# ================================================

log "2️⃣  Instalando Certbot..."

if ! command -v certbot &> /dev/null; then
    log "Certbot no encontrado, instalando..."
    
    if [ "$OS" = "debian" ]; then
        apt-get update
        apt-get install -y certbot python3-certbot-nginx
    else
        yum install -y certbot python3-certbot-nginx
    fi
    
    log_success "Certbot instalado"
else
    log_success "Certbot ya instalado"
fi

# ================================================
# 3. VERIFICAR NGINX
# ================================================

log "3️⃣  Verificando Nginx..."

if ! command -v nginx &> /dev/null; then
    log_error "Nginx no encontrado. Instalar primero."
    exit 1
fi

log_success "Nginx encontrado"

# ================================================
# 4. CONFIGURAR NGINX PARA HTTP (TEMPORAL)
# ================================================

log "4️⃣  Configurando Nginx temporal..."

cat > /etc/nginx/sites-available/flores-victoria << 'NGINXEOF'
server {
    listen 80;
    listen [::]:80;
    server_name DOMAIN_PLACEHOLDER WWW_DOMAIN_PLACEHOLDER;

    # Let's Encrypt challenge
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
NGINXEOF

# Reemplazar placeholders
sed -i "s/DOMAIN_PLACEHOLDER/$DOMAIN/g" /etc/nginx/sites-available/flores-victoria
sed -i "s/WWW_DOMAIN_PLACEHOLDER/$WWW_DOMAIN/g" /etc/nginx/sites-available/flores-victoria

# Habilitar sitio
ln -sf /etc/nginx/sites-available/flores-victoria /etc/nginx/sites-enabled/

# Test y reload
nginx -t && systemctl reload nginx

log_success "Nginx configurado"

# ================================================
# 5. OBTENER CERTIFICADOS
# ================================================

log "5️⃣  Obteniendo certificados SSL..."

# Crear directorio webroot
mkdir -p "$WEBROOT/.well-known/acme-challenge"

# Obtener certificado
certbot certonly \
    --webroot \
    --webroot-path="$WEBROOT" \
    --email "$EMAIL" \
    --agree-tos \
    --no-eff-email \
    --domains "$DOMAIN,$WWW_DOMAIN" \
    --non-interactive

if [ $? -eq 0 ]; then
    log_success "Certificados obtenidos"
else
    log_error "Error al obtener certificados"
    exit 1
fi

# ================================================
# 6. CONFIGURAR NGINX PARA HTTPS
# ================================================

log "6️⃣  Configurando Nginx con HTTPS..."

cat > /etc/nginx/sites-available/flores-victoria << NGINXEOF
# HTTP -> HTTPS redirect
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN $WWW_DOMAIN;
    
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    
    location / {
        return 301 https://\$server_name\$request_uri;
    }
}

# HTTPS server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name $DOMAIN $WWW_DOMAIN;

    # SSL certificates
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    ssl_trusted_certificate /etc/letsencrypt/live/$DOMAIN/chain.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384';
    ssl_prefer_server_ciphers off;

    # SSL session
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_session_tickets off;

    # OCSP stapling
    ssl_stapling on;
    ssl_stapling_verify on;
    resolver 8.8.8.8 8.8.4.4 valid=300s;
    resolver_timeout 5s;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;

    # API proxy
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Frontend
    location / {
        root /var/www/flores-victoria/frontend;
        try_files \$uri \$uri/ /index.html;
        
        # Cache static assets
        location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Security: deny access to hidden files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
}
NGINXEOF

# Test y reload
nginx -t && systemctl reload nginx

log_success "Nginx configurado con HTTPS"

# ================================================
# 7. CONFIGURAR RENOVACIÓN AUTOMÁTICA
# ================================================

log "7️⃣  Configurando renovación automática..."

# Crear script de renovación
cat > /etc/cron.d/certbot-flores-victoria << 'CRONEOF'
# Renovar certificados SSL automáticamente
# Ejecutar dos veces al día
0 0,12 * * * root certbot renew --quiet --post-hook "systemctl reload nginx"
CRONEOF

log_success "Renovación automática configurada"

# ================================================
# 8. TEST DE SEGURIDAD
# ================================================

log "8️⃣  Probando configuración..."

# Test SSL
if openssl s_client -connect "$DOMAIN:443" -servername "$DOMAIN" < /dev/null 2>/dev/null | grep -q "Verify return code: 0"; then
    log_success "Certificado SSL válido"
else
    log_warning "Verificar certificado manualmente"
fi

# ================================================
# RESUMEN
# ================================================

echo ""
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log_success "CONFIGURACIÓN SSL/TLS COMPLETADA"
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
log "📋 Información:"
log "   • Dominio: https://$DOMAIN"
log "   • WWW: https://$WWW_DOMAIN"
log "   • Certificados: /etc/letsencrypt/live/$DOMAIN/"
log "   • Renovación: Automática (2x/día)"
log "   • Nginx config: /etc/nginx/sites-available/flores-victoria"
echo ""
log "🔍 Verificar:"
log "   1. Abrir https://$DOMAIN en navegador"
log "   2. Verificar candado verde en barra de direcciones"
log "   3. Test SSL: https://www.ssllabs.com/ssltest/analyze.html?d=$DOMAIN"
echo ""
log "⚡ Comandos útiles:"
log "   • Renovar manualmente: certbot renew"
log "   • Ver certificados: certbot certificates"
log "   • Test nginx: nginx -t"
log "   • Reload nginx: systemctl reload nginx"
log "   • Logs SSL: tail -f /var/log/letsencrypt/letsencrypt.log"
echo ""
log_success "¡HTTPS configurado correctamente!"
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
