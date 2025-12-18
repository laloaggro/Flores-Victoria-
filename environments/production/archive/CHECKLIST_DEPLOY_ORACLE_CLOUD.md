# ✅ Checklist Pre-Deploy Oracle Cloud - Flores Victoria

**Fecha de revisión**: 25 noviembre 2025  
**Versión proyecto**: v3.0  
**Build optimizado**: 6.0MB con Brotli + WebP

---

## 🔒 1. SEGURIDAD Y SECRETOS (CRÍTICO)

### 1.1 Variables de Entorno

- [ ] **Revisar .env en producción**
  - ⚠️ Detectados 8 archivos .env en el proyecto
  - Verificar que NO contengan credenciales reales
  - Usar solo archivos .env.example en repositorio
- [ ] **Generar secretos seguros para producción**

  ```bash
  # JWT_SECRET (mínimo 32 caracteres)
  JWT_SECRET=$(openssl rand -base64 32)

  # Database passwords
  MONGO_ROOT_PASSWORD=$(openssl rand -base64 24)
  POSTGRES_PASSWORD=$(openssl rand -base64 24)

  # API Keys
  # Regenerar todas las API keys de servicios externos
  ```

- [ ] **Secretos críticos a configurar**:
  - `JWT_SECRET` - Auth service
  - `MONGO_INITDB_ROOT_PASSWORD` - MongoDB
  - `POSTGRES_PASSWORD` - PostgreSQL
  - `REDIS_PASSWORD` (añadir si no existe)
  - `AI_HORDE_API_KEY` - Generación imágenes
  - `LEONARDO_API_KEY` - IA images (si aplica)
  - `SMTP_PASSWORD` - Notificaciones email
  - `TRANSBANK_API_KEY` - Pagos
  - `WHATSAPP_API_KEY` - Mensajería

### 1.2 Hardening Docker

- [ ] **Remover puertos expuestos innecesarios**
  - Solo exponer puerto del API Gateway (3000)
  - Servicios internos NO deben ser públicos
  - Bases de datos: cerrar puertos externos

- [ ] **Configurar secrets con Docker**
  ```bash
  # Crear secrets en Docker Swarm o usar archivos externos
  echo "password_secreto" | docker secret create mongo_root_password -
  ```

### 1.3 Código

- [ ] Verificar que NO hay credenciales hardcodeadas

  ```bash
  grep -r "password.*=.*\"" --include="*.js" microservices/ | grep -v "process.env"
  ```

  - ✅ Verificación realizada: NO se encontraron passwords hardcodeadas

---

## 🏗️ 2. INFRAESTRUCTURA ORACLE CLOUD

### 2.1 Instancia VM

- [ ] **Especificaciones mínimas requeridas**:
  - vCPUs: 2-4 (por 35 contenedores)
  - RAM: 8-16 GB
  - Storage: 100-200 GB (SSD recomendado)
  - OS: Ubuntu 20.04/22.04 LTS o Oracle Linux 8

- [ ] **Configurar firewall (Security Lists)**:

  ```
  Ingress Rules:
  - Puerto 80 (HTTP) → Redirect a HTTPS
  - Puerto 443 (HTTPS) → Nginx/Traefik
  - Puerto 22 (SSH) → Solo desde IPs conocidas

  Bloquear:
  - 27018 (MongoDB)
  - 5433 (PostgreSQL)
  - 6380 (Redis)
  - 3000-3010 (Microservices)
  ```

### 2.2 Networking

- [ ] **Configurar VCN (Virtual Cloud Network)**
  - Subnet privada para servicios internos
  - Load Balancer si se necesita alta disponibilidad
  - DNS configurado para dominio

- [ ] **SSL/TLS**:
  - [ ] Obtener certificado SSL (Let's Encrypt)
  - [ ] Configurar renovación automática
  - [ ] HTTPS obligatorio (HTTP → HTTPS redirect)

---

## 🐳 3. DOCKER Y CONTENEDORES

### 3.1 Docker Compose

- [ ] **Usar docker-compose.yml de producción**
  - ✅ 35 servicios configurados
  - ✅ Healthchecks en 25 servicios
  - ✅ Restart policy: `unless-stopped`

- [ ] **Volúmenes persistentes**:

  ```yaml
  volumes:
    - mongodb-data:/data/db
    - postgres-data:/var/lib/postgresql/data
    - redis-data:/data
    - product-images:/app/uploads
  ```

  - [ ] Backup automático configurado para volúmenes

### 3.2 Límites de Recursos

- [ ] **Revisar memory limits** (actualmente 256m para MongoDB)

  ```yaml
  deploy:
    resources:
      limits:
        memory: 512m # Ajustar según carga
        cpus: '1.0'
  ```

- [ ] **Configurar restart policies**
  - ✅ Ya configurado: `restart: unless-stopped`

---

## 📦 4. BUILD Y OPTIMIZACIONES

### 4.1 Frontend

- [ ] **Build de producción ejecutado**

  ```bash
  cd frontend
  npm run build
  ```

  - ✅ Build actual: 6.0MB
  - ✅ Brotli compression activa (-86% CSS)
  - ✅ 10 imágenes WebP optimizadas (~250KB ahorrados)
  - ✅ PurgeCSS configurado

- [ ] **Copiar dist/ a servidor**
  ```bash
  # Desde /frontend/dist/
  rsync -avz dist/ user@oracle:/var/www/flores-victoria/
  ```

### 4.2 Assets

- [ ] **Verificar imágenes WebP**
  - ✅ Logo: 32KB → 8KB
  - ✅ 9 categorías convertidas a WebP
  - [ ] Configurar fallback para navegadores antiguos

---

## 🔍 5. MONITOREO Y LOGS

### 5.1 Logging

- [ ] **Configurar sistema centralizado de logs**
  - Opciones: ELK Stack, Grafana Loki, CloudWatch
  - Configurar rotación de logs

- [ ] **Log levels apropiados**:
  ```javascript
  // Producción: solo ERROR y WARN
  process.env.LOG_LEVEL = 'error';
  ```

### 5.2 Monitoring

- [ ] **Activar servicios de monitoreo**:
  - Prometheus (puerto 9090)
  - Grafana dashboards
  - Jaeger tracing (si aplica)

- [ ] **Alertas configuradas**:
  - CPU > 80%
  - Memory > 85%
  - Disk > 90%
  - Service down
  - Error rate > threshold

---

## 🗄️ 6. BASES DE DATOS

### 6.1 PostgreSQL

- [ ] **Configurar backups automáticos**

  ```bash
  # Cron job diario
  0 2 * * * pg_dump -U flores_user flores_db > /backups/flores_db_$(date +\%Y\%m\%d).sql
  ```

- [ ] **Optimizaciones**:
  - [ ] Índices en tablas críticas
  - [ ] VACUUM ANALYZE configurado
  - [ ] Connection pooling (max_connections)

### 6.2 MongoDB

- [ ] **Configurar replica set** (alta disponibilidad)
- [ ] **Backups diarios**:
  ```bash
  mongodump --uri="mongodb://user:pass@localhost:27017" --out=/backups/mongo_$(date +\%Y\%m\%d)
  ```

### 6.3 Redis

- [ ] **Configurar persistencia**:
  - AOF enabled
  - RDB snapshots
- [ ] **Memoria límite**: `maxmemory 256mb`

---

## 🌐 7. NGINX / REVERSE PROXY

### 7.1 Configuración

- [ ] **Instalar Nginx**

  ```bash
  apt install nginx
  ```

- [ ] **Configurar proxy a API Gateway**:

  ```nginx
  server {
      listen 80;
      server_name flores-victoria.com;
      return 301 https://$server_name$request_uri;
  }

  server {
      listen 443 ssl http2;
      server_name flores-victoria.com;

      ssl_certificate /etc/letsencrypt/live/flores-victoria.com/fullchain.pem;
      ssl_certificate_key /etc/letsencrypt/live/flores-victoria.com/privkey.pem;

      # Frontend estático
      location / {
          root /var/www/flores-victoria/dist;
          try_files $uri $uri/ /index.html;

          # Habilitar compresión Brotli
          brotli on;
          brotli_types text/css application/javascript application/json;
      }

      # API Gateway
      location /api {
          proxy_pass http://localhost:3000;
          proxy_http_version 1.1;
          proxy_set_header Upgrade $http_upgrade;
          proxy_set_header Connection 'upgrade';
          proxy_set_header Host $host;
          proxy_cache_bypass $http_upgrade;
      }
  }
  ```

### 7.2 Seguridad Headers

- [ ] **Configurar headers de seguridad**:
  ```nginx
  add_header X-Frame-Options "SAMEORIGIN" always;
  add_header X-Content-Type-Options "nosniff" always;
  add_header X-XSS-Protection "1; mode=block" always;
  add_header Referrer-Policy "no-referrer-when-downgrade" always;
  add_header Content-Security-Policy "default-src 'self' https:; script-src 'self' 'unsafe-inline'" always;
  ```

---

## 🚀 8. DEPLOYMENT

### 8.1 Pre-Deploy Checks

- [ ] **Verificar dependencias instaladas**:

  ```bash
  docker --version
  docker compose version
  node --version
  npm --version
  ```

- [ ] **Clonar repositorio**:
  ```bash
  git clone https://github.com/laloaggro/Flores-Victoria-.git
  cd Flores-Victoria-
  ```

### 8.2 Configuración Inicial

- [ ] **Crear archivo .env para producción**:

  ```bash
  cp .env.example .env
  # Editar con credenciales reales de producción
  nano .env
  ```

- [ ] **Build de imágenes**:
  ```bash
  docker compose build --no-cache
  ```

### 8.3 Deploy

- [ ] **Iniciar servicios**:

  ```bash
  docker compose up -d
  ```

- [ ] **Verificar servicios activos**:

  ```bash
  docker compose ps
  docker compose logs -f api-gateway
  ```

- [ ] **Healthcheck de servicios**:
  ```bash
  curl http://localhost:3000/api/health
  ```

---

## ✅ 9. VALIDACIÓN POST-DEPLOY

### 9.1 Tests Funcionales

- [ ] **Frontend accesible**:
  - [ ] https://flores-victoria.com carga correctamente
  - [ ] Imágenes WebP se cargan
  - [ ] Navegación funciona

- [ ] **API responde**:
  ```bash
  curl https://flores-victoria.com/api/products
  curl https://flores-victoria.com/api/auth/health
  ```

### 9.2 Performance

- [ ] **Lighthouse Score** (objetivo: 85-95):

  ```bash
  npm install -g lighthouse
  lighthouse https://flores-victoria.com --view
  ```

- [ ] **Comprobar compresión**:
  ```bash
  curl -H "Accept-Encoding: br" https://flores-victoria.com -I | grep -i content-encoding
  # Debe retornar: content-encoding: br
  ```

### 9.3 Seguridad

- [ ] **SSL Labs Test**: https://www.ssllabs.com/ssltest/
  - Objetivo: A+ rating

- [ ] **Security Headers**: https://securityheaders.com/
  - Objetivo: A rating

---

## 🔧 10. MANTENIMIENTO

### 10.1 Backups

- [ ] **Configurar backups automáticos**:

  ```bash
  # Script de backup (ejecutar diariamente)
  ./scripts/backup.sh

  # Sincronizar con Object Storage de Oracle
  oci os object put --bucket-name backups --file /backups/latest.tar.gz
  ```

### 10.2 Updates

- [ ] **Proceso de actualización**:

  ```bash
  git pull origin main
  docker compose build
  docker compose up -d
  ```

- [ ] **Rollback plan**:
  ```bash
  git checkout <previous-commit>
  docker compose up -d
  ```

---

## 📊 RESUMEN PRE-DEPLOY

### ✅ Completado

- ✅ 10 imágenes optimizadas WebP (~250KB ahorrados)
- ✅ Build frontend 6.0MB con Brotli (-86% CSS)
- ✅ 35 servicios Docker configurados
- ✅ Healthchecks en 25 servicios
- ✅ NO hay passwords hardcodeadas en código

### ⚠️ Pendiente (CRÍTICO)

- ⚠️ Generar secretos seguros para producción
- ⚠️ Configurar SSL/TLS en Oracle Cloud
- ⚠️ Cerrar puertos de bases de datos
- ⚠️ Configurar backups automáticos
- ⚠️ Configurar monitoreo (Prometheus/Grafana)

### 📈 Estimación Lighthouse Score

- **Performance**: 85-95 (con todas las optimizaciones)
- **Accessibility**: 94-100
- **Best Practices**: 100
- **SEO**: 100

---

## 🆘 TROUBLESHOOTING

### Servicios no arrancan

```bash
# Ver logs específicos
docker compose logs -f <service-name>

# Verificar healthcheck
docker inspect flores-victoria-<service> | grep -i health
```

### Problemas de memoria

```bash
# Aumentar límites en docker-compose.yml
deploy:
  resources:
    limits:
      memory: 1g
```

### Base de datos no conecta

```bash
# Verificar conectividad
docker compose exec postgres psql -U flores_user -d flores_db
docker compose exec mongodb mongosh -u root -p rootpassword
```

---

## 📞 CONTACTO Y SOPORTE

**Documentación adicional**:

- `README.md` - Guía general
- `DEVELOPMENT_GUIDE.md` - Desarrollo local
- `PORTS_CONFIGURATION.md` - Puertos servicios
- `API_COMPLETE_REFERENCE.md` - Documentación API

**Repositorio**: https://github.com/laloaggro/Flores-Victoria-

---

**Última actualización**: 25 noviembre 2025  
**Estado proyecto**: ✅ Listo para deploy (pendiente configuración secretos)
