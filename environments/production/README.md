# 🚀 Production Environment

Configuración optimizada y hardened para deployment en Oracle Cloud.

## 📦 Archivos en este directorio

### Configuración Docker

- **`docker-compose.production.yml`** - Configuración de producción con:
  - 35 microservicios configurados
  - Resource limits aplicados
  - Healthchecks habilitados
  - Restart policies: `unless-stopped`
  - Puertos cerrados (solo Nginx/API Gateway expuestos)
  - Logging rotativo configurado

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

### Documentación

- **`CHECKLIST_DEPLOY_ORACLE_CLOUD.md`** - Guía completa de deployment:
  - 10 secciones
  - 67 pasos detallados
  - Específico para Oracle Cloud

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
