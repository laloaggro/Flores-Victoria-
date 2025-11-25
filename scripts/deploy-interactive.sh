#!/bin/bash

# ========================================
# 🚀 Deploy Interactivo a Oracle Cloud
# Flores Victoria - Script Automatizado
# ========================================

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

clear

echo -e "${MAGENTA}"
echo "╔════════════════════════════════════════════════════════╗"
echo "║                                                        ║"
echo "║        🌸 FLORES VICTORIA - Deploy Oracle Cloud 🌸    ║"
echo "║                                                        ║"
echo "╚════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

# ========================================
# PASO 1: Recopilar información
# ========================================
echo -e "${CYAN}📋 Configuración de Deploy${NC}"
echo ""

read -p "🔑 Ruta a tu clave SSH (.pem): " SSH_KEY
while [ ! -f "$SSH_KEY" ]; do
    echo -e "${RED}❌ Archivo no encontrado${NC}"
    read -p "🔑 Ruta a tu clave SSH (.pem): " SSH_KEY
done

read -p "🌐 IP pública de Oracle Cloud: " ORACLE_IP
read -p "👤 Usuario SSH (ubuntu/opc): " SSH_USER
SSH_USER=${SSH_USER:-ubuntu}

read -p "🌍 ¿Tienes dominio configurado? (y/n): " HAS_DOMAIN
if [[ $HAS_DOMAIN =~ ^[Yy]$ ]]; then
    read -p "📛 Nombre del dominio (ej: arreglosvictoria.com): " DOMAIN_NAME
else
    DOMAIN_NAME=""
fi

echo ""
echo -e "${GREEN}✅ Configuración guardada:${NC}"
echo "   SSH Key:  $SSH_KEY"
echo "   IP:       $ORACLE_IP"
echo "   Usuario:  $SSH_USER"
echo "   Dominio:  ${DOMAIN_NAME:-'No configurado (usará IP)'}"
echo ""

read -p "¿Continuar con el deploy? (y/n): " CONFIRM
if [[ ! $CONFIRM =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Deploy cancelado${NC}"
    exit 0
fi

# ========================================
# PASO 2: Verificar build local
# ========================================
echo ""
echo -e "${BLUE}📦 Verificando build local...${NC}"

FRONTEND_DIR="/home/impala/Documentos/Proyectos/flores-victoria/frontend"
BUILD_DIR="$FRONTEND_DIR/dist"

if [ ! -d "$BUILD_DIR" ]; then
    echo -e "${YELLOW}⚠️  Build no encontrado. Ejecutando npm run build...${NC}"
    cd "$FRONTEND_DIR"
    npm run build
fi

echo -e "${GREEN}✅ Build verificado ($(du -sh $BUILD_DIR | cut -f1))${NC}"

# ========================================
# PASO 3: Comprimir build
# ========================================
echo ""
echo -e "${BLUE}📦 Comprimiendo archivos...${NC}"

cd "$FRONTEND_DIR"
tar -czf dist.tar.gz dist/

TARBALL_SIZE=$(du -sh dist.tar.gz | cut -f1)
echo -e "${GREEN}✅ Tarball creado: dist.tar.gz ($TARBALL_SIZE)${NC}"

# ========================================
# PASO 4: Subir archivos
# ========================================
echo ""
echo -e "${BLUE}📤 Subiendo archivos a Oracle Cloud...${NC}"

scp -i "$SSH_KEY" dist.tar.gz "$SSH_USER@$ORACLE_IP:/tmp/" || {
    echo -e "${RED}❌ Error al subir archivos${NC}"
    rm dist.tar.gz
    exit 1
}

echo -e "${GREEN}✅ Archivos subidos exitosamente${NC}"
rm dist.tar.gz

# ========================================
# PASO 5: Configurar servidor remoto
# ========================================
echo ""
echo -e "${BLUE}⚙️  Configurando servidor remoto...${NC}"

ssh -i "$SSH_KEY" "$SSH_USER@$ORACLE_IP" << 'ENDSSH'
set -e

echo "🔧 Instalando dependencias..."

# Actualizar sistema
sudo apt update -qq

# Instalar Nginx si no está instalado
if ! command -v nginx &> /dev/null; then
    echo "📦 Instalando Nginx..."
    sudo apt install nginx -y
fi

# Instalar Brotli
if ! dpkg -l | grep -q libnginx-mod-http-brotli; then
    echo "📦 Instalando módulo Brotli..."
    sudo apt install libnginx-mod-http-brotli-filter libnginx-mod-http-brotli-static -y
fi

# Instalar Certbot
if ! command -v certbot &> /dev/null; then
    echo "📦 Instalando Certbot..."
    sudo apt install certbot python3-certbot-nginx -y
fi

echo "✅ Dependencias instaladas"

# Crear directorio de aplicación
echo "📁 Creando directorio de aplicación..."
sudo mkdir -p /var/www/flores-victoria
sudo mkdir -p /var/www/backups

# Hacer backup si existe contenido
if [ "$(ls -A /var/www/flores-victoria)" ]; then
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    echo "💾 Haciendo backup..."
    sudo tar -czf /var/www/backups/backup_$TIMESTAMP.tar.gz -C /var/www/flores-victoria . 2>/dev/null || true
fi

# Extraer nuevos archivos
echo "📦 Extrayendo archivos..."
sudo rm -rf /var/www/flores-victoria/*
cd /var/www/flores-victoria
sudo tar -xzf /tmp/dist.tar.gz --strip-components=1

# Configurar permisos
echo "🔐 Configurando permisos..."
sudo chown -R www-data:www-data /var/www/flores-victoria
sudo find /var/www/flores-victoria -type f -exec chmod 644 {} \;
sudo find /var/www/flores-victoria -type d -exec chmod 755 {} \;

# Limpiar
rm /tmp/dist.tar.gz

echo "✅ Archivos extraídos y permisos configurados"
ENDSSH

# ========================================
# PASO 6: Configurar Nginx
# ========================================
echo ""
echo -e "${BLUE}🌐 Configurando Nginx...${NC}"

# Crear configuración de Nginx
NGINX_CONFIG="/tmp/flores-victoria-nginx.conf"

cat > "$NGINX_CONFIG" << 'EOF'
server {
    listen 80;
    listen [::]:80;
    
    server_name _;
    
    root /var/www/flores-victoria;
    index index.html;
    
    # ========================================
    # Compresión Gzip
    # ========================================
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/rss+xml
        font/truetype
        font/opentype
        application/vnd.ms-fontobject
        image/svg+xml;
    
    # ========================================
    # Compresión Brotli
    # ========================================
    brotli on;
    brotli_comp_level 6;
    brotli_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/rss+xml
        font/truetype
        font/opentype
        application/vnd.ms-fontobject
        image/svg+xml;
    
    # ========================================
    # Security Headers
    # ========================================
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # ========================================
    # Cache estático
    # ========================================
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot|webp)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }
    
    # ========================================
    # Service Worker
    # ========================================
    location ~ ^/(sw\.js|sw-.*\.js|registerSW\.js|workbox-.*\.js)$ {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
        add_header Service-Worker-Allowed "/";
    }
    
    # ========================================
    # Manifest PWA
    # ========================================
    location ~ ^/(manifest\.json|manifest\.webmanifest)$ {
        add_header Cache-Control "no-cache, must-revalidate";
        add_header Content-Type "application/manifest+json";
    }
    
    # ========================================
    # SPA Routing
    # ========================================
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Health check
    location /health {
        access_log off;
        return 200 "OK\n";
        add_header Content-Type text/plain;
    }
    
    # Ocultar archivos sensibles
    location ~ /(README|LICENSE|\.git) {
        deny all;
        access_log off;
        log_not_found off;
    }
}
EOF

# Subir configuración
scp -i "$SSH_KEY" "$NGINX_CONFIG" "$SSH_USER@$ORACLE_IP:/tmp/"
rm "$NGINX_CONFIG"

# Aplicar configuración en el servidor
ssh -i "$SSH_KEY" "$SSH_USER@$ORACLE_IP" << 'ENDSSH'
set -e

echo "📝 Aplicando configuración de Nginx..."

sudo cp /tmp/flores-victoria-nginx.conf /etc/nginx/sites-available/flores-victoria
sudo ln -sf /etc/nginx/sites-available/flores-victoria /etc/nginx/sites-enabled/flores-victoria

# Eliminar default si existe
sudo rm -f /etc/nginx/sites-enabled/default

# Test de configuración
echo "🧪 Verificando configuración..."
sudo nginx -t

# Recargar Nginx
echo "🔄 Recargando Nginx..."
sudo systemctl reload nginx
sudo systemctl enable nginx

rm /tmp/flores-victoria-nginx.conf

echo "✅ Nginx configurado y recargado"
ENDSSH

# ========================================
# PASO 7: Configurar SSL (si tiene dominio)
# ========================================
if [ ! -z "$DOMAIN_NAME" ]; then
    echo ""
    echo -e "${BLUE}🔒 Configurando SSL con Let's Encrypt...${NC}"
    
    ssh -i "$SSH_KEY" "$SSH_USER@$ORACLE_IP" << ENDSSH
set -e

echo "📝 Actualizando server_name en Nginx..."
sudo sed -i "s/server_name _;/server_name $DOMAIN_NAME www.$DOMAIN_NAME;/" /etc/nginx/sites-available/flores-victoria
sudo nginx -t
sudo systemctl reload nginx

echo "🔐 Obteniendo certificado SSL..."
sudo certbot --nginx -d $DOMAIN_NAME -d www.$DOMAIN_NAME --non-interactive --agree-tos --email admin@$DOMAIN_NAME --redirect

echo "✅ SSL configurado exitosamente"
ENDSSH
    
    SITE_URL="https://$DOMAIN_NAME"
else
    SITE_URL="http://$ORACLE_IP"
fi

# ========================================
# PASO 8: Verificación final
# ========================================
echo ""
echo -e "${BLUE}🔍 Verificando deploy...${NC}"

sleep 3

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$SITE_URL" 2>/dev/null || echo "000")

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Sitio respondiendo correctamente (HTTP $HTTP_CODE)${NC}"
else
    echo -e "${YELLOW}⚠️  Sitio responde con código $HTTP_CODE${NC}"
fi

# ========================================
# RESUMEN FINAL
# ========================================
echo ""
echo -e "${MAGENTA}"
echo "╔════════════════════════════════════════════════════════╗"
echo "║                                                        ║"
echo "║           🎉 DEPLOY COMPLETADO EXITOSAMENTE 🎉        ║"
echo "║                                                        ║"
echo "╚════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""
echo -e "${GREEN}📍 URL del sitio:${NC}"
echo "   $SITE_URL"
echo ""
echo -e "${CYAN}📊 Información del deploy:${NC}"
echo "   Servidor:  $ORACLE_IP"
echo "   Usuario:   $SSH_USER"
echo "   Build:     $TARBALL_SIZE comprimido"
if [ ! -z "$DOMAIN_NAME" ]; then
    echo "   SSL:       ✅ Certificado Let's Encrypt activo"
fi
echo ""
echo -e "${YELLOW}🔧 Comandos útiles:${NC}"
echo "   Conectar:     ssh -i $SSH_KEY $SSH_USER@$ORACLE_IP"
echo "   Ver logs:     ssh -i $SSH_KEY $SSH_USER@$ORACLE_IP 'sudo tail -f /var/log/nginx/access.log'"
echo "   Reiniciar:    ssh -i $SSH_KEY $SSH_USER@$ORACLE_IP 'sudo systemctl restart nginx'"
echo "   Ver estado:   ssh -i $SSH_KEY $SSH_USER@$ORACLE_IP 'sudo systemctl status nginx'"
echo ""
echo -e "${GREEN}✨ Siguiente paso: Visita $SITE_URL y verifica que todo funcione${NC}"
echo ""

# Guardar información del deploy
DEPLOY_INFO="/home/impala/Documentos/Proyectos/flores-victoria/.last-deploy.txt"
cat > "$DEPLOY_INFO" << EOF
ÚLTIMO DEPLOY
=============
Fecha: $(date)
IP: $ORACLE_IP
Usuario: $SSH_USER
SSH Key: $SSH_KEY
Dominio: ${DOMAIN_NAME:-'No configurado'}
URL: $SITE_URL
Estado: $HTTP_CODE
EOF

echo -e "${BLUE}💾 Información guardada en .last-deploy.txt${NC}"
echo ""
