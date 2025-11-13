# 🔒 Guía de Configuración SSL/TLS

Esta guía proporciona instrucciones detalladas para configurar certificados SSL/TLS en producción usando Let's Encrypt.

---

## 📋 Tabla de Contenidos

1. [Requisitos Previos](#requisitos-previos)
2. [Instalación de Certbot](#instalación-de-certbot)
3. [Obtención de Certificados](#obtención-de-certificados)
4. [Configuración de Nginx](#configuración-de-nginx)
5. [Renovación Automática](#renovación-automática)
6. [Verificación](#verificación)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 Requisitos Previos

### 1. Dominio Configurado
```bash
# Verificar registros DNS (A records)
dig floresvictoria.com +short
dig www.floresvictoria.com +short

# Deben apuntar a la IP de tu servidor Oracle Cloud
```

### 2. Puertos Abiertos
```bash
# Verificar firewall
sudo iptables -L -n | grep -E '80|443'

# O en Oracle Cloud
oci network security-list list \
  --compartment-id <your-compartment-id> \
  --vcn-id <your-vcn-id>
```

**Puertos requeridos:**
- `80/tcp` - HTTP (para validación de Let's Encrypt)
- `443/tcp` - HTTPS

### 3. Contenedores Funcionando
```bash
docker ps
# Verificar que nginx esté corriendo
```

---

## 🚀 Instalación de Certbot

### Opción 1: Ubuntu/Debian
```bash
# Actualizar paquetes
sudo apt update

# Instalar certbot y plugin de nginx
sudo apt install -y certbot python3-certbot-nginx

# Verificar instalación
certbot --version
```

### Opción 2: Docker (Recomendado para Oracle Cloud)
```bash
# Crear directorio para certificados
mkdir -p ssl/live

# Instalar certbot via Docker
docker run -it --rm \
  -v $(pwd)/ssl:/etc/letsencrypt \
  -v $(pwd)/ssl-challenges:/var/www/certbot \
  certbot/certbot --version
```

---

## 📜 Obtención de Certificados

### Método 1: Standalone (Sin Nginx corriendo)
```bash
# Detener nginx temporalmente
docker-compose -f docker-compose.oracle.yml stop nginx

# Obtener certificado
sudo certbot certonly --standalone \
  -d floresvictoria.com \
  -d www.floresvictoria.com \
  --email tu-email@ejemplo.com \
  --agree-tos \
  --no-eff-email

# Iniciar nginx
docker-compose -f docker-compose.oracle.yml start nginx
```

### Método 2: Webroot (Con Nginx corriendo)
```bash
# Crear directorio para desafíos
mkdir -p ssl-challenges

# Obtener certificado
sudo certbot certonly --webroot \
  -w $(pwd)/ssl-challenges \
  -d floresvictoria.com \
  -d www.floresvictoria.com \
  --email tu-email@ejemplo.com \
  --agree-tos \
  --non-interactive
```

### Método 3: DNS Challenge (Para wildcards)
```bash
# Instalar plugin de Oracle Cloud DNS
pip3 install certbot-dns-oracle

# Obtener certificado wildcard
sudo certbot certonly --dns-oracle \
  -d floresvictoria.com \
  -d '*.floresvictoria.com' \
  --email tu-email@ejemplo.com \
  --agree-tos
```

### Ubicación de Certificados
```bash
# Let's Encrypt guarda los certificados en:
/etc/letsencrypt/live/floresvictoria.com/

# Archivos generados:
# - fullchain.pem    (certificado + cadena intermedia)
# - privkey.pem      (llave privada)
# - cert.pem         (certificado solo)
# - chain.pem        (cadena intermedia)
```

---

## ⚙️ Configuración de Nginx

### 1. Copiar Certificados al Proyecto
```bash
# Crear directorio SSL
mkdir -p ssl

# Copiar certificados (si usaste certbot nativo)
sudo cp /etc/letsencrypt/live/floresvictoria.com/fullchain.pem ssl/
sudo cp /etc/letsencrypt/live/floresvictoria.com/privkey.pem ssl/

# Ajustar permisos
sudo chown $USER:$USER ssl/*.pem
chmod 644 ssl/fullchain.pem
chmod 600 ssl/privkey.pem
```

### 2. Crear Configuración de Nginx
```bash
cat > nginx/nginx.prod.conf << 'EOF'
# ==========================================
# NGINX PRODUCTION CONFIGURATION WITH SSL
# ==========================================

user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 2048;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';
    access_log /var/log/nginx/access.log main;

    # Performance
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    # Compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript 
               application/json application/javascript application/xml+rss 
               application/rss+xml font/truetype font/opentype 
               application/vnd.ms-fontobject image/svg+xml;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=100r/m;
    limit_req_zone $binary_remote_addr zone=login_limit:10m rate=5r/m;

    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    ssl_stapling on;
    ssl_stapling_verify on;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # ==========================================
    # HTTP to HTTPS Redirect
    # ==========================================
    server {
        listen 80;
        server_name floresvictoria.com www.floresvictoria.com;

        # ACME challenge for Let's Encrypt
        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }

        # Redirect all other traffic to HTTPS
        location / {
            return 301 https://$server_name$request_uri;
        }
    }

    # ==========================================
    # HTTPS Server
    # ==========================================
    server {
        listen 443 ssl http2;
        server_name floresvictoria.com www.floresvictoria.com;

        # SSL Certificates
        ssl_certificate /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/privkey.pem;

        # Root directory
        root /usr/share/nginx/html;
        index index.html;

        # Frontend SPA
        location / {
            try_files $uri $uri/ /index.html;
            
            # Cache static assets
            location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
                expires 1y;
                add_header Cache-Control "public, immutable";
            }
        }

        # API Gateway
        location /api/ {
            limit_req zone=api_limit burst=20 nodelay;
            
            proxy_pass http://api-gateway:3000/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
            
            # Timeouts
            proxy_connect_timeout 60s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;
        }

        # Auth endpoints with stricter rate limiting
        location /api/auth/login {
            limit_req zone=login_limit burst=3 nodelay;
            proxy_pass http://api-gateway:3000/auth/login;
            include /etc/nginx/proxy_params;
        }

        # Health checks
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }

        # Monitoring endpoints (restricted)
        location /metrics {
            allow 10.0.0.0/8;      # Internal network
            allow 172.16.0.0/12;   # Docker network
            deny all;
            
            proxy_pass http://prometheus:9090/metrics;
        }
    }

    # ==========================================
    # Jaeger UI (Development/Staging only)
    # ==========================================
    server {
        listen 16686 ssl http2;
        server_name floresvictoria.com;

        ssl_certificate /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/privkey.pem;

        # Basic auth for extra security
        # auth_basic "Restricted Access";
        # auth_basic_user_file /etc/nginx/.htpasswd;

        location / {
            proxy_pass http://jaeger:16686;
            include /etc/nginx/proxy_params;
        }
    }

    # ==========================================
    # Grafana Dashboard
    # ==========================================
    server {
        listen 3001 ssl http2;
        server_name floresvictoria.com;

        ssl_certificate /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/privkey.pem;

        location / {
            proxy_pass http://grafana:3000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }
}
EOF
```

### 3. Crear archivo de parámetros de proxy
```bash
cat > nginx/proxy_params << 'EOF'
proxy_http_version 1.1;
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection 'upgrade';
proxy_set_header Host $host;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
proxy_cache_bypass $http_upgrade;
proxy_connect_timeout 60s;
proxy_send_timeout 60s;
proxy_read_timeout 60s;
EOF
```

### 4. Actualizar docker-compose.oracle.yml
```yaml
services:
  nginx:
    image: nginx:alpine
    container_name: flores-nginx
    ports:
      - "80:80"
      - "443:443"
      - "3001:3001"    # Grafana (SSL)
      - "16686:16686"  # Jaeger (SSL)
    volumes:
      - ./frontend/dist:/usr/share/nginx/html:ro
      - ./nginx/nginx.prod.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/proxy_params:/etc/nginx/proxy_params:ro
      - ./ssl:/etc/nginx/ssl:ro
      - ./ssl-challenges:/var/www/certbot:ro
    depends_on:
      - api-gateway
    networks:
      - flores-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

### 5. Aplicar Configuración
```bash
# Validar sintaxis de nginx
docker run --rm -v $(pwd)/nginx/nginx.prod.conf:/etc/nginx/nginx.conf:ro nginx nginx -t

# Reiniciar nginx con nueva configuración
docker-compose -f docker-compose.oracle.yml restart nginx

# Verificar logs
docker logs flores-nginx
```

---

## 🔄 Renovación Automática

### 1. Crear Script de Renovación
```bash
cat > scripts/renew-ssl.sh << 'EOF'
#!/bin/bash

# Renew SSL certificates
certbot renew --quiet

# Check if renewal was successful
if [ $? -eq 0 ]; then
    echo "[$(date)] ✅ SSL certificates renewed successfully"
    
    # Copy new certificates
    cp /etc/letsencrypt/live/floresvictoria.com/fullchain.pem ssl/
    cp /etc/letsencrypt/live/floresvictoria.com/privkey.pem ssl/
    
    # Restart nginx to load new certificates
    docker-compose -f docker-compose.oracle.yml restart nginx
    
    echo "[$(date)] ✅ Nginx restarted with new certificates"
else
    echo "[$(date)] ❌ SSL certificate renewal failed"
    exit 1
fi
EOF

chmod +x scripts/renew-ssl.sh
```

### 2. Configurar Cron Job
```bash
# Editar crontab
crontab -e

# Agregar renovación cada 12 horas
0 */12 * * * /opt/flores-victoria/scripts/renew-ssl.sh >> /opt/flores-victoria/logs/ssl-renewal.log 2>&1
```

### 3. Verificar Renovación Manual
```bash
# Dry run (simular renovación)
sudo certbot renew --dry-run

# Si funciona correctamente, verás:
# ✅ Congratulations, all simulated renewals succeeded
```

---

## ✅ Verificación

### 1. Verificar Certificado Instalado
```bash
# Verificar certificado via OpenSSL
openssl s_client -connect floresvictoria.com:443 -servername floresvictoria.com < /dev/null 2>/dev/null | openssl x509 -noout -dates

# Deberías ver:
# notBefore=...
# notAfter=...
```

### 2. Verificar en Navegador
```
https://floresvictoria.com
```
- ✅ Candado verde en la barra de direcciones
- ✅ No advertencias de seguridad
- ✅ Certificado emitido por Let's Encrypt

### 3. Herramientas de Verificación Online
```
# SSL Labs
https://www.ssllabs.com/ssltest/analyze.html?d=floresvictoria.com

# Objetivo: Calificación A o A+
```

### 4. Verificar Redirección HTTP → HTTPS
```bash
curl -I http://floresvictoria.com
# Debería retornar:
# HTTP/1.1 301 Moved Permanently
# Location: https://floresvictoria.com/
```

### 5. Verificar Headers de Seguridad
```bash
curl -I https://floresvictoria.com

# Verificar presencia de:
# Strict-Transport-Security: max-age=31536000; includeSubDomains
# X-Frame-Options: SAMEORIGIN
# X-Content-Type-Options: nosniff
# X-XSS-Protection: 1; mode=block
```

---

## 🔧 Troubleshooting

### Error: "Connection refused" en puerto 80
```bash
# Verificar que nginx escucha en 80
docker exec flores-nginx netstat -tuln | grep :80

# Verificar firewall
sudo iptables -L -n | grep 80

# En Oracle Cloud, verificar Security List
oci network security-list list-rules --security-list-id <id>
```

### Error: "Certificate not found"
```bash
# Verificar ubicación de certificados
ls -la /etc/letsencrypt/live/

# Verificar montaje de volumen en docker
docker inspect flores-nginx | grep -A 10 Mounts
```

### Error: "Too many requests" de Let's Encrypt
```bash
# Let's Encrypt tiene límites de rate:
# - 5 certificados por dominio por semana
# - 50 subdominios por certificado

# Usar staging environment para pruebas
certbot certonly --staging \
  -d floresvictoria.com \
  --standalone
```

### Error: "Failed authorization procedure"
```bash
# Verificar que el dominio apunta a tu servidor
dig floresvictoria.com +short

# Verificar que puerto 80 está accesible externamente
curl http://<tu-ip-publica>/.well-known/acme-challenge/test

# Verificar logs de certbot
sudo tail -f /var/log/letsencrypt/letsencrypt.log
```

### Error: "nginx: [emerg] cannot load certificate"
```bash
# Verificar permisos de certificados
ls -la ssl/
# fullchain.pem debe ser 644
# privkey.pem debe ser 600

# Corregir permisos
chmod 644 ssl/fullchain.pem
chmod 600 ssl/privkey.pem

# Verificar que nginx puede leer los archivos
docker exec flores-nginx ls -la /etc/nginx/ssl/
```

---

## 🎯 Checklist de Configuración SSL

- [ ] Dominio DNS configurado (A records)
- [ ] Puertos 80/443 abiertos en firewall
- [ ] Certbot instalado
- [ ] Certificados obtenidos de Let's Encrypt
- [ ] Certificados copiados a directorio ssl/
- [ ] nginx.prod.conf configurado con rutas correctas
- [ ] docker-compose.oracle.yml actualizado con volumen ssl/
- [ ] Nginx reiniciado correctamente
- [ ] HTTPS funciona en navegador (candado verde)
- [ ] HTTP redirige a HTTPS
- [ ] Headers de seguridad presentes
- [ ] Renovación automática configurada en cron
- [ ] Dry run de renovación exitoso

---

## 📚 Referencias

- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [Certbot User Guide](https://eff-certbot.readthedocs.io/)
- [Mozilla SSL Configuration Generator](https://ssl-config.mozilla.org/)
- [SSL Labs Best Practices](https://github.com/ssllabs/research/wiki/SSL-and-TLS-Deployment-Best-Practices)
- [Oracle Cloud Security Lists](https://docs.oracle.com/en-us/iaas/Content/Network/Concepts/securitylists.htm)

---

## 💡 Tips de Producción

### 1. Certificados Wildcard
Para múltiples subdominios:
```bash
certbot certonly --dns-oracle \
  -d floresvictoria.com \
  -d '*.floresvictoria.com'
```

### 2. Monitoreo de Expiración
```bash
# Script para alertar 7 días antes
cat > scripts/check-ssl-expiry.sh << 'EOF'
#!/bin/bash
EXPIRY=$(openssl x509 -enddate -noout -in ssl/fullchain.pem | cut -d= -f2)
EXPIRY_EPOCH=$(date -d "$EXPIRY" +%s)
NOW_EPOCH=$(date +%s)
DAYS_LEFT=$(( ($EXPIRY_EPOCH - $NOW_EPOCH) / 86400 ))

if [ $DAYS_LEFT -lt 7 ]; then
    echo "⚠️ SSL certificate expires in $DAYS_LEFT days!"
    # Enviar alerta
fi
EOF
```

### 3. Backup de Certificados
```bash
# Incluir en backup diario
tar -czf backups/ssl-$(date +%Y%m%d).tar.gz ssl/
```

---

**🔒 Configuración SSL completada**
