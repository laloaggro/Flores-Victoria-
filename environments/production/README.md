# 🚀 Production Environment

# ============================================## ./monitor-free-tier.sh --continuous# 📊 MONITOREAR RECURSOS:## ./generate-production-secrets.sh# 💡 PARA GENERAR VALORES SEGUROS:## - Sin Prometheus/Grafana local# - Usar servicios gratuitos (UptimeRobot, Sentry)# 5. Monitoreo externo:## - Redis con eviction policy LRU# - TTL extendido (hasta 1 hora)# 4. Cache agresivo:## - Mensajería RabbitMQ# - Notificaciones push# - Analytics en tiempo real# - Wishlist, Reviews (solo catálogo y compras)# 3. Features deshabilitados:## - Healthchecks menos frecuentes# - Logging reducido (warn only)# - Pools de conexión pequeños (max 5)# - 1 worker por servicio# 2. Microservicios:## - Redis: 64MB RAM, solo caché (sin persistencia)# - MongoDB: 150MB RAM, 100MB cache# - PostgreSQL: 128MB RAM, 20 conexiones max# 1. Bases de datos:# # 🚀 OPTIMIZACIONES APLICADAS:## ============================================# NOTAS IMPORTANTES PARA FREE TIER# ============================================TZ=America/Santiago# ============================================# TIMEZONE# ============================================HSTS_MAX_AGE=31536000HSTS_ENABLED=false# HSTS (habilitar con SSL)SECURE_COOKIES=falseFORCE_HTTPS=false# HTTPS solo si tienes dominio con SSL# ============================================# SECURITY# ============================================ENABLE_RABBITMQ=false # Sin mensajería (polling en su lugar)ENABLE_NOTIFICATIONS=false # Deshabilitar notificaciones en tiempo realENABLE_ANALYTICS=false # Deshabilitar analytics trackingENABLE_REVIEWS=false # Deshabilitar reviewsENABLE_WISHLIST=false # Deshabilitar wishlist# ============================================# FEATURE FLAGS (Deshabilitar features no críticos)# ============================================SENTRY_SAMPLE_RATE=0.1 # Solo 10% de eventosSENTRY_ENVIRONMENT=production-free-tierSENTRY_DSN=# Sentry (opcional)# Sentry.io: 5k eventos/mes gratis# Better Uptime: 10 monitores gratis# UptimeRobot: 5 monitores gratis# ============================================# MONITORING (Servicios externos gratuitos)# ============================================BACKUP_SCHEDULE=0 3 \* \* \* # Solo 1 vez al día (3 AM)BACKUP_RETENTION_DAYS=7 # Reducido de 30 díasBACKUP_DIR=/backupsBACKUP_ENABLED=true# ============================================# BACKUPS (Menos frecuentes)# ============================================HEALTHCHECK_START_PERIOD=40sHEALTHCHECK_RETRIES=3HEALTHCHECK_TIMEOUT=5sHEALTHCHECK_INTERVAL=30s # Aumentado de 15s# ============================================# HEALTHCHECKS (Intervalos más largos)# ============================================WORKERS=1 # Solo 1 worker por servicio# Worker processesCACHE_TTL_LONG=3600 # 1 horaCACHE_TTL_MEDIUM=1800 # 30 minutosCACHE_TTL_SHORT=300 # 5 minutos# Cache TTL extendido (menos queries a DB)CONNECTION_TIMEOUT=5000 # 5 segundosDB_POOL_MAX=5 # Máximo de 5 conexiones (reducido de 10)DB_POOL_MIN=1 # Mínimo de 1 conexión# Connections pools reducidos# ============================================# PERFORMANCE (Optimizado para 1GB RAM)# ============================================LOG_MAX_FILES=2 # Reducido de 3LOG_MAX_SIZE=5m # Reducido de 10mLOG_FILE=/var/log/flores-victoria/app.log# ============================================# LOGGING (Reducido para Free Tier)# ============================================CORS_CREDENTIALS=trueCORS_ORIGIN=http://YOUR_ORACLE_IP_HERE,https://YOUR_ORACLE_IP_HERE# ============================================# CORS# ============================================RATE_LIMIT_LOGIN_MAX=3 # 3 intentos login (reducido de 5)RATE_LIMIT_MAX_REQUESTS=50 # 50 requests por ventana (reducido de 100)RATE_LIMIT_WINDOW_MS=900000 # 15 minutos# ============================================# RATE LIMITING (Más estricto para ahorrar recursos)# ============================================UPLOAD_ALLOWED_TYPES=image/jpeg,image/png,image/webpUPLOAD_MAX_SIZE=5242880 # 5MB (reducido de 10MB)UPLOAD_DIR=/app/uploads# ============================================# FILE UPLOADS (Local storage)# ============================================TRANSBANK_API_KEY=579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1CTRANSBANK_COMMERCE_CODE=597055555532TRANSBANK_ENV=integration# Transbank Chile - Ambiente integración (gratis)# ============================================# PAGOS (OPCIONAL - Sandbox gratuito)# ============================================EMAIL_FROM=noreply@tudominio.comSMTP_PASSWORD=CHANGE_ME_SENDGRID_API_KEYSMTP_USER=apikeySMTP_SECURE=falseSMTP_PORT=587SMTP_HOST=smtp.sendgrid.net# - Brevo (Sendinblue): 300 emails/día gratis# - Mailgun: 5,000 emails/mes gratis (3 meses)# - SendGrid: 100 emails/día gratis# Opciones gratuitas:# ============================================# EMAIL (OPCIONAL - Servicios externos gratis)# ============================================PRODUCT_SERVICE_URL=http://product-service:3009CART_SERVICE_URL=http://cart-service:3004ORDER_SERVICE_URL=http://order-service:3003USER_SERVICE_URL=http://user-service:3002AUTH_SERVICE_URL=http://auth-service:3001# ============================================# MICROSERVICES URLS (Internos)# ============================================CART_SERVICE_KEY=CHANGE_ME_CART_SERVICE_KEYORDER_SERVICE_KEY=CHANGE_ME_ORDER_SERVICE_KEYPRODUCT_SERVICE_KEY=CHANGE_ME_PRODUCT_SERVICE_KEYUSER_SERVICE_KEY=CHANGE_ME_USER_SERVICE_KEYAUTH_SERVICE_KEY=CHANGE_ME_AUTH_SERVICE_KEYAPI_GATEWAY_KEY=CHANGE_ME_API_GATEWAY_KEY# ============================================# API KEYS (Inter-service communication)# ============================================ENCRYPTION_IV=CHANGE_ME_ENCRYPTION_IV_16_BYTES_HEXENCRYPTION_KEY=CHANGE_ME_ENCRYPTION_KEY_32_BYTES_HEX# ============================================# ENCRIPTACIÓN# ============================================COOKIE_SECRET=CHANGE_ME_COOKIE_SECRET_MIN_64_CHARS_RANDOMSESSION_SECRET=CHANGE_ME_SESSION_SECRET_MIN_64_CHARS_RANDOMJWT_REFRESH_EXPIRATION=7dJWT_EXPIRATION=24hJWT_SECRET=CHANGE_ME_JWT_SECRET_MIN_64_CHARS_RANDOM# ============================================# JWT Y AUTENTICACIÓN# ============================================REDIS_SAVE=# Deshabilitar persistencia (solo caché volátil)REDIS_MAX_MEMORY_POLICY=allkeys-lruREDIS_MAX_MEMORY=50mb # Límite estrictoREDIS_PASSWORD= # Sin password para reducir overheadREDIS_PORT=6379REDIS_HOST=redis# ============================================# REDIS (Alpine - caché ligero)# ============================================MONGODB_OPLOG_SIZE_MB=50 # Reducido de 1024MBMONGODB_CACHE_SIZE_GB=0.1 # 100MB cache (mínimo)# Optimizaciones para 1GB RAMMONGODB_URI=mongodb://admin:CHANGE_ME_MONGODB_PASSWORD_MIN_24_CHARS@mongodb:27017/flores_products?authSource=admin# URI completa para microserviciosMONGO_INITDB_ROOT_PASSWORD=CHANGE_ME_MONGODB_PASSWORD_MIN_24_CHARSMONGO_INITDB_ROOT_USERNAME=adminMONGODB_PORT=27017MONGODB_HOST=mongodb# ============================================# MONGODB (Jammy - optimizado)# ============================================POSTGRES_WORK_MEM=2MB # Reducido de 4MBPOSTGRES_EFFECTIVE_CACHE_SIZE=64MB # Reducido de 256MBPOSTGRES_SHARED_BUFFERS=32MB # Reducido de 128MBPOSTGRES_MAX_CONNECTIONS=20 # Reducido de 100# Optimizaciones para 1GB RAMPOSTGRES_DB=flores_dbPOSTGRES_PASSWORD=CHANGE_ME_POSTGRES_PASSWORD_MIN_24_CHARSPOSTGRES_USER=flores_userPOSTGRES_PORT=5432POSTGRES_HOST=postgres# ============================================# POSTGRESQL (Alpine - optimizado)# ============================================# API_URL=https://api.tudominio.com# FRONTEND_URL=https://tudominio.com# Si tienes dominio (opcional):ADMIN_URL=http://YOUR_ORACLE_IP_HERE:3010API_URL=http://YOUR_ORACLE_IP_HEREFRONTEND_URL=http://YOUR_ORACLE_IP_HERE# ⚠️ Reemplaza con tu IP pública de Oracle Cloud# ============================================# URLS Y DOMINIOS# ============================================LOG_LEVEL=warn # warn en lugar de info para reducir I/ONODE_ENV=production# ============================================# ENVIRONMENT# ============================================# ============================================# - Límites de memoria estrictos# - Servicios esenciales únicamente# - VM.Standard.E2.1.Micro (1 OCPU, 1GB RAM)# 💡 Optimizado para:## 4. Usar generate-production-secrets.sh para generar valores seguros# 3. NUNCA subir .env.production a Git# 2. Reemplazar TODOS los valores CHANGE_ME# 1. Copiar este archivo como .env.production# ⚠️ IMPORTANTE:# # ============================================# Flores Victoria - 1GB RAMConfiguración optimizada y hardened para deployment en Oracle Cloud.

## 🎯 Elige tu Configuración

### 💰 Para Producción Completa

- **Archivo**: `docker-compose.production.yml`
- **Requisitos**: 8-16GB RAM, 2-4 CPUs
- **Costo**: ~$15-30 USD/mes
- **Incluye**: Todos los servicios + monitoreo + mensajería

### 🆓 Para Desarrollo/Pruebas (Always Free)

- **Archivo**: `docker-compose.free-tier.yml`
- **Requisitos**: 1GB RAM, 1 CPU (VM.Standard.E2.1.Micro)
- **Costo**: $0 USD/mes ✨
- **Incluye**: Servicios esenciales optimizados para 1GB RAM
- **Guía**: [`FREE_TIER_DEPLOYMENT.md`](FREE_TIER_DEPLOYMENT.md)

---

## 📦 Archivos en este directorio

### Configuración Docker

- **`docker-compose.production.yml`** - Configuración completa de producción:
  - 35 microservicios configurados
  - Resource limits aplicados
  - Healthchecks habilitados
  - Restart policies: `unless-stopped`
  - Puertos cerrados (solo Nginx/API Gateway expuestos)
  - Logging rotativo configurado

- **`docker-compose.free-tier.yml`** - Configuración optimizada para 1GB RAM:
  - 9 servicios esenciales
  - Límites de memoria agresivos (~900MB total)
  - Solo servicios críticos habilitados
  - Optimizado para Oracle Cloud Free Tier

### Variables de Entorno

- **`.env.production.example`** - Template con todas las variables necesarias
  - ⚠️ **IMPORTANTE**: NO usar directamente, copiar como `.env.production` y llenar con valores
    reales

### Scripts

- **`backup-production.sh`** - Backup automático de:
  - PostgreSQL (pg_dump + gzip)
  - MongoDB (mongodump + archive)
  - Redis (RDB snapshot)
  - Uploads (tar.gz)
  - Retención: 30 días
- **`generate-production-secrets.sh`** - Genera secretos seguros:
  - JWT_SECRET (128 caracteres)
  - Database passwords (24 bytes base64)
  - API keys para 8 microservicios
  - Session, encryption, cookie secrets
  - Output: `../../config/production-secrets/.env.secrets`

- **`monitor-free-tier.sh`** - Monitor de recursos para Free Tier:
  - Uso de RAM, CPU, Disco
  - Alertas configurables
  - Top contenedores por memoria
  - Modo continuo disponible
  - Recomendaciones automáticas

- **`validate-pre-deploy.sh`** - Validación pre-deployment:
  - 8 checks automatizados
  - Frontend, secretos, Docker, scripts
  - Detección de credenciales hardcodeadas
  - Validación de .gitignore

### Documentación

- **`FREE_TIER_DEPLOYMENT.md`** - 🆓 Guía específica para Always Free:
  - Paso a paso completo
  - Configuración de swap
  - Optimizaciones para 1GB RAM
  - Troubleshooting específico
  - **RECOMENDADO** para primer deployment

- **`CHECKLIST_DEPLOY_ORACLE_CLOUD.md`** - Guía completa de deployment:
  - 10 secciones
  - 67 pasos detallados
  - Específico para Oracle Cloud

- **`ORACLE_CLOUD_SETUP_GUIDE.md`** - Guía detallada general:
  - 7 partes completas
  - Desde creación de cuenta hasta monitoreo
  - Incluye troubleshooting

## 🔧 Configuración Inicial

### 1. Generar Secretos

```bash
# Ejecutar desde la raíz del proyecto:
./environments/production/generate-production-secrets.sh

# Output en:
# config/production-secrets/.env.secrets
# config/production-secrets/.env.production.template
# config/production-secrets/docker-secrets/
```

### 2. Crear .env.production

```bash
cd environments/production

# Copiar template:
cp .env.production.example .env.production

# Editar y llenar con valores reales:
nano .env.production

# O usar los generados automáticamente:
cp ../../config/production-secrets/.env.secrets .env.production
```

### 3. Configurar APIs Externas

Editar `.env.production` y agregar:

```bash
# Email (SendGrid/Mailgun)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=TU_API_KEY_AQUI

# Pagos (Transbank)
TRANSBANK_API_KEY=TU_API_KEY_AQUI
TRANSBANK_ENVIRONMENT=production

# WhatsApp Business (opcional)
WHATSAPP_API_KEY=TU_API_KEY_AQUI

# AI Horde (opcional)
AI_HORDE_API_KEY=TU_API_KEY_AQUI
```

## 🚀 Deployment

### Pre-requisitos

- [ ] VM creada en Oracle Cloud (8-16GB RAM)
- [ ] Docker y Docker Compose instalados
- [ ] Dominio configurado con DNS
- [ ] Firewall configurado (puertos 80, 443, 22)
- [ ] Certificado SSL obtenido (Let's Encrypt)

### Pasos de Deployment

```bash
# 1. Clonar repositorio en servidor
git clone https://github.com/laloaggro/Flores-Victoria-.git /opt/flores-victoria
cd /opt/flores-victoria

# 2. Copiar secretos desde tu máquina local
scp environments/production/.env.production ubuntu@IP_ORACLE:/opt/flores-victoria/environments/production/

# 3. Crear directorios necesarios
mkdir -p data/{mongodb,postgres,redis,uploads}
mkdir -p backups

# 4. Iniciar servicios
cd environments/production
docker compose -f docker-compose.production.yml up -d

# 5. Verificar estado
docker compose -f docker-compose.production.yml ps
docker compose -f docker-compose.production.yml logs -f

# 6. Configurar backups automáticos
crontab -e
# Agregar:
0 2 * * * /opt/flores-victoria/environments/production/backup-production.sh
```

## 🔒 Seguridad

### Archivos NUNCA commitear:

```
.env.production
.env.production.generated
*.production
*-prod.env
../../config/production-secrets/
../../backups/
```

### Permisos recomendados:

```bash
chmod 600 .env.production
chmod 700 backup-production.sh
chmod 700 generate-production-secrets.sh
```

## 📊 Monitoreo

### Healthchecks

```bash
# Verificar todos los servicios:
docker compose -f docker-compose.production.yml ps

# Ver logs de un servicio específico:
docker compose -f docker-compose.production.yml logs -f [servicio]

# Verificar API Gateway:
curl https://tu-dominio.com/api/health
```

### Métricas (Prometheus + Grafana)

- Prometheus: http://tu-dominio.com:9090 (interno)
- Grafana: http://tu-dominio.com:3001 (interno)
- ⚠️ Configurar Nginx para exponer solo por VPN o IP whitelist

## 🔄 Backups

### Manual

```bash
./backup-production.sh
```

### Automático (ya configurado en crontab)

- Frecuencia: Diario a las 2 AM
- Ubicación: `/opt/flores-victoria/backups/`
- Retención: 30 días (limpieza automática)
- Formatos:
  - PostgreSQL: `postgres_YYYYMMDD_HHMMSS.sql.gz`
  - MongoDB: `mongodb_YYYYMMDD_HHMMSS.archive.gz`
  - Redis: `redis_YYYYMMDD_HHMMSS.rdb.gz`
  - Uploads: `uploads_YYYYMMDD_HHMMSS.tar.gz`

### Restauración

```bash
# PostgreSQL
gunzip < backups/postgres_20251125_020000.sql.gz | \
  docker compose exec -T postgres psql -U flores_user -d flores_db

# MongoDB
gunzip < backups/mongodb_20251125_020000.archive.gz | \
  docker compose exec -T mongodb mongorestore --archive --gzip

# Redis
docker compose exec redis redis-cli SHUTDOWN
gunzip < backups/redis_20251125_020000.rdb.gz > data/redis/dump.rdb
docker compose restart redis
```

## 🔍 Troubleshooting

### Servicios no inician

```bash
# Ver logs detallados:
docker compose -f docker-compose.production.yml logs [servicio]

# Verificar variables de entorno:
docker compose -f docker-compose.production.yml config

# Reiniciar servicio específico:
docker compose -f docker-compose.production.yml restart [servicio]
```

### Problemas de memoria

```bash
# Verificar uso de recursos:
docker stats

# Ajustar límites en docker-compose.production.yml:
deploy:
  resources:
    limits:
      memory: 512M  # Aumentar si es necesario
```

### Base de datos no conecta

```bash
# Verificar que esté corriendo:
docker compose ps postgres mongodb redis

# Verificar conectividad:
docker compose exec postgres pg_isready
docker compose exec mongodb mongosh --eval "db.adminCommand('ping')"
docker compose exec redis redis-cli ping
```

## 📞 Recursos

- [Checklist completo](./CHECKLIST_DEPLOY_ORACLE_CLOUD.md)
- [Docker Compose Reference](https://docs.docker.com/compose/)
- [Oracle Cloud Docs](https://docs.oracle.com/en-us/iaas/Content/home.htm)
- [Let's Encrypt](https://letsencrypt.org/docs/)

## ⚙️ Configuración Avanzada

### Escalado horizontal

```bash
# Escalar microservicio específico:
docker compose -f docker-compose.production.yml up -d --scale product-service=3
```

### Health checks custom

Ver `docker-compose.production.yml` para configuración de healthchecks por servicio.

### Logs centralizados

Configurar ELK stack (Elasticsearch, Logstash, Kibana) en `docker-compose.production.yml`.

---

**Versión**: 1.0.0  
**Última actualización**: 25 noviembre 2025  
**Mantenedor**: DevOps Team
