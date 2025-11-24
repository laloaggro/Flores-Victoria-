# Guía de Deploy a Oracle Cloud - Flores Victoria

**Fecha:** 24 de Noviembre 2025  
**Versión del proyecto:** 2.0.0  
**Estado:** Production Ready ✅

---

## 📋 Pre-requisitos

### En Oracle Cloud
- ✅ Instancia de VM creada (Ubuntu 20.04+ o similar)
- ✅ Puerto 80 y 443 abiertos en Security List
- ✅ IP pública asignada
- ✅ Acceso SSH configurado

### En tu máquina local
- ✅ Build de producción generado (`npm run build`)
- ✅ Archivos en `frontend/dist/`
- ✅ Configuración de Nginx lista

---

## 🚀 Paso 1: Preparar el Servidor

### Conectar a Oracle Cloud VM

```bash
ssh -i /path/to/your/key.pem ubuntu@<YOUR_ORACLE_VM_IP>
```

### Actualizar sistema e instalar dependencias

```bash
# Actualizar paquetes
sudo apt update && sudo apt upgrade -y

# Instalar Nginx
sudo apt install nginx -y

# Instalar Certbot para SSL
sudo apt install certbot python3-certbot-nginx -y

# Instalar módulo Brotli para Nginx (opcional pero recomendado)
sudo apt install libnginx-mod-http-brotli-filter libnginx-mod-http-brotli-static -y
```

### Verificar instalación de Nginx

```bash
sudo systemctl status nginx
sudo nginx -v
```

---

## 📦 Paso 2: Subir Archivos del Build

### Opción A: Usando SCP (recomendado)

Desde tu máquina local:

```bash
cd /home/impala/Documentos/Proyectos/flores-victoria/frontend

# Comprimir el build
tar -czf dist.tar.gz dist/

# Subir a Oracle Cloud
scp -i /path/to/your/key.pem dist.tar.gz ubuntu@<YOUR_ORACLE_VM_IP>:/tmp/
```

En el servidor Oracle Cloud:

```bash
# Crear directorio para la aplicación
sudo mkdir -p /var/www/flores-victoria

# Extraer archivos
cd /var/www/flores-victoria
sudo tar -xzf /tmp/dist.tar.gz --strip-components=1

# Configurar permisos
sudo chown -R www-data:www-data /var/www/flores-victoria
sudo chmod -R 755 /var/www/flores-victoria

# Limpiar
rm /tmp/dist.tar.gz
```

### Opción B: Usando Git (alternativa)

```bash
# En el servidor
cd /var/www
sudo git clone https://github.com/laloaggro/Flores-Victoria-.git flores-victoria
cd flores-victoria/frontend
sudo npm install
sudo npm run build
sudo cp -r dist/* /var/www/flores-victoria/
```

---

## ⚙️ Paso 3: Configurar Nginx

### Crear archivo de configuración

```bash
sudo nano /etc/nginx/sites-available/flores-victoria
```

### Configuración Nginx Optimizada

```nginx
# Configuración optimizada para Flores Victoria
# Incluye: Gzip, Brotli, HTTP/2, Security Headers, Cache

# Upstream para futuro API Gateway (opcional)
# upstream api_backend {
#     server localhost:3000;
#     keepalive 32;
# }

# Rate limiting
limit_req_zone $binary_remote_addr zone=general:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=api:10m rate=30r/s;

server {
    listen 80;
    listen [::]:80;
    
    server_name arreglosvictoria.com www.arreglosvictoria.com;
    
    # Redirect HTTP to HTTPS (descomentar después de configurar SSL)
    # return 301 https://$server_name$request_uri;
    
    root /var/www/flores-victoria;
    index index.html;
    
    # Logs
    access_log /var/log/nginx/flores-victoria-access.log;
    error_log /var/log/nginx/flores-victoria-error.log warn;
    
    # ========================================
    # Gzip Compression
    # ========================================
    gzip on;
    gzip_vary on;
    gzip_proxied any;
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
    gzip_min_length 1000;
    gzip_disable "msie6";
    
    # ========================================
    # Brotli Compression (si está instalado)
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
    add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
    
    # CSP (ajustar según tus necesidades)
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://www.google-analytics.com;" always;
    
    # ========================================
    # Cache Control
    # ========================================
    
    # Service Worker - NO CACHE
    location = /sw.js {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
        try_files $uri =404;
    }
    
    # Manifest - Cache corto
    location = /manifest.webmanifest {
        add_header Cache-Control "public, max-age=3600"; # 1 hora
        try_files $uri =404;
    }
    
    # JavaScript y CSS versionados - Cache largo
    location ~* ^/assets/.*\.(js|css)$ {
        add_header Cache-Control "public, max-age=31536000, immutable"; # 1 año
        try_files $uri =404;
    }
    
    # Imágenes - Cache medio
    location ~* \.(jpg|jpeg|png|gif|webp|svg|ico)$ {
        add_header Cache-Control "public, max-age=2592000"; # 30 días
        try_files $uri =404;
    }
    
    # Fuentes - Cache largo
    location ~* \.(woff|woff2|ttf|otf|eot)$ {
        add_header Cache-Control "public, max-age=31536000, immutable"; # 1 año
        add_header Access-Control-Allow-Origin "*";
        try_files $uri =404;
    }
    
    # HTML - No cache para forzar actualizaciones
    location ~* \.html$ {
        add_header Cache-Control "no-cache, must-revalidate";
        try_files $uri =404;
    }
    
    # ========================================
    # SPA Routing - Todas las rutas a index.html
    # ========================================
    location / {
        limit_req zone=general burst=20 nodelay;
        try_files $uri $uri/ /index.html;
    }
    
    # ========================================
    # API Proxy (descomentar si tienes backend)
    # ========================================
    # location /api/ {
    #     limit_req zone=api burst=50 nodelay;
    #     
    #     proxy_pass http://api_backend/;
    #     proxy_http_version 1.1;
    #     
    #     proxy_set_header Upgrade $http_upgrade;
    #     proxy_set_header Connection 'upgrade';
    #     proxy_set_header Host $host;
    #     proxy_set_header X-Real-IP $remote_addr;
    #     proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    #     proxy_set_header X-Forwarded-Proto $scheme;
    #     
    #     proxy_cache_bypass $http_upgrade;
    #     proxy_buffering off;
    #     proxy_read_timeout 300s;
    #     proxy_connect_timeout 75s;
    # }
    
    # ========================================
    # Denegar acceso a archivos sensibles
    # ========================================
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
    
    location ~ /(README|LICENSE|\.git) {
        deny all;
        access_log off;
        log_not_found off;
    }
}

# ========================================
# HTTPS Configuration (activar después de SSL)
# ========================================
# server {
#     listen 443 ssl http2;
#     listen [::]:443 ssl http2;
#     
#     server_name arreglosvictoria.com www.arreglosvictoria.com;
#     
#     # SSL Certificates (Let's Encrypt)
#     ssl_certificate /etc/letsencrypt/live/arreglosvictoria.com/fullchain.pem;
#     ssl_certificate_key /etc/letsencrypt/live/arreglosvictoria.com/privkey.pem;
#     
#     # SSL Configuration
#     ssl_protocols TLSv1.2 TLSv1.3;
#     ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
#     ssl_prefer_server_ciphers off;
#     
#     ssl_session_cache shared:SSL:10m;
#     ssl_session_timeout 10m;
#     ssl_stapling on;
#     ssl_stapling_verify on;
#     
#     # HSTS
#     add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
#     
#     # ... (resto de la configuración igual que HTTP)
# }
```

### Activar configuración

```bash
# Crear symlink
sudo ln -s /etc/nginx/sites-available/flores-victoria /etc/nginx/sites-enabled/

# Eliminar configuración default (opcional)
sudo rm /etc/nginx/sites-enabled/default

# Verificar configuración
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

---

## 🔒 Paso 4: Configurar SSL con Let's Encrypt

### Configurar dominio

Antes de continuar, asegúrate de que tu dominio apunte a la IP de Oracle Cloud:

```bash
# Verificar DNS
nslookup arreglosvictoria.com
```

### Obtener certificado SSL

```bash
# Obtener certificado
sudo certbot --nginx -d arreglosvictoria.com -d www.arreglosvictoria.com

# Seguir las instrucciones interactivas:
# 1. Ingresar email
# 2. Aceptar términos
# 3. Elegir "2" para redirect automático HTTP → HTTPS
```

### Verificar renovación automática

```bash
# Test de renovación
sudo certbot renew --dry-run

# Ver timer de renovación
sudo systemctl status certbot.timer
```

---

## 🔥 Paso 5: Optimizaciones Post-Deploy

### Configurar firewall (UFW)

```bash
# Habilitar firewall
sudo ufw enable

# Permitir SSH, HTTP, HTTPS
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Verificar
sudo ufw status
```

### Configurar fail2ban (opcional pero recomendado)

```bash
# Instalar
sudo apt install fail2ban -y

# Copiar configuración
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local

# Editar para Nginx
sudo nano /etc/fail2ban/jail.local

# Agregar:
# [nginx-http-auth]
# enabled = true
# [nginx-noscript]
# enabled = true
# [nginx-badbots]
# enabled = true

# Reiniciar
sudo systemctl restart fail2ban
sudo systemctl enable fail2ban
```

### Monitoreo con logrotate

```bash
# Verificar configuración de logs
sudo cat /etc/logrotate.d/nginx

# Debería rotar logs automáticamente
```

---

## ✅ Paso 6: Verificación Post-Deploy

### Checks básicos

```bash
# 1. Verificar que Nginx está corriendo
sudo systemctl status nginx

# 2. Verificar logs
sudo tail -f /var/log/nginx/flores-victoria-access.log
sudo tail -f /var/log/nginx/flores-victoria-error.log

# 3. Test de conectividad
curl -I https://arreglosvictoria.com

# 4. Test de compresión
curl -H "Accept-Encoding: gzip" -I https://arreglosvictoria.com
curl -H "Accept-Encoding: br" -I https://arreglosvictoria.com
```

### Tests de performance

```bash
# Lighthouse audit (desde tu máquina local)
npm install -g lighthouse
lighthouse https://arreglosvictoria.com --view

# GTmetrix
# Visitar: https://gtmetrix.com/

# PageSpeed Insights
# Visitar: https://pagespeed.web.dev/
```

### Verificar Service Worker

Abrir DevTools en el navegador:
1. Application → Service Workers
2. Verificar que `sw.js` esté registrado
3. Network → Verificar cache hits

---

## 📊 Paso 7: Monitoreo Continuo

### Configurar Real User Monitoring (opcional)

En el HTML, agregar:

```html
<!-- Google Analytics 4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### Configurar alertas de uptime

Opciones gratuitas:
- UptimeRobot: https://uptimerobot.com/
- StatusCake: https://www.statuscake.com/
- Pingdom (free tier): https://www.pingdom.com/

---

## 🐛 Troubleshooting

### Problema: Nginx no inicia

```bash
# Ver errores detallados
sudo nginx -t
sudo journalctl -xe

# Verificar puertos
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :443
```

### Problema: Certificado SSL no funciona

```bash
# Renovar manualmente
sudo certbot renew --force-renewal

# Ver logs
sudo tail -f /var/log/letsencrypt/letsencrypt.log
```

### Problema: Service Worker no se registra

- Verificar que el sitio esté en HTTPS
- Verificar que `sw.js` esté accesible: `https://tu-dominio.com/sw.js`
- Revisar Console en DevTools para errores

### Problema: Archivos no se actualizan

```bash
# Limpiar cache de Nginx
sudo rm -rf /var/cache/nginx/*
sudo systemctl restart nginx

# Forzar actualización del navegador: Ctrl+Shift+R
```

---

## 📝 Checklist Final

Antes de considerar el deploy completado:

- [ ] ✅ Sitio accesible via HTTPS
- [ ] ✅ Redirección HTTP → HTTPS funcionando
- [ ] ✅ Service Worker registrado correctamente
- [ ] ✅ PWA instalable desde el navegador
- [ ] ✅ Lighthouse score > 90 en todas las categorías
- [ ] ✅ Compresión Gzip/Brotli activa
- [ ] ✅ Headers de seguridad configurados
- [ ] ✅ Cache funcionando correctamente
- [ ] ✅ Logs configurados y rotando
- [ ] ✅ Firewall activo y configurado
- [ ] ✅ Certificado SSL válido y auto-renovación activa
- [ ] ✅ Monitoring/alertas configuradas
- [ ] ✅ DNS propagado correctamente

---

## 📞 Contacto y Soporte

**Proyecto:** Flores Victoria  
**Versión:** 2.0.0  
**Fecha de deploy:** 24 Nov 2025  
**Documentación:** README.md, DEVELOPMENT_GUIDE.md  

---

## 🎉 ¡Deploy Completado!

Una vez completados todos los pasos, tu aplicación estará:
- ✅ Corriendo en producción con HTTPS
- ✅ Optimizada con Service Worker y PWA
- ✅ Comprimida con Gzip y Brotli
- ✅ Cache configurado óptimamente
- ✅ Segura con headers y firewall
- ✅ Monitoreada y con logs activos

**¡Felicidades! 🚀**
