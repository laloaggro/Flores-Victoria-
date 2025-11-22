# Guía de Configuración para Producción

> Guía completa para configurar y desplegar Flores Victoria en un entorno de producción.

---

## 📋 Tabla de Contenidos

- [Prerrequisitos](#prerrequisitos)
- [Variables de Entorno](#variables-de-entorno)
- [Configuración de Bases de Datos](#configuración-de-bases-de-datos)
- [Configuración de Servicios](#configuración-de-servicios)
- [Seguridad](#seguridad)
- [Monitoreo](#monitoreo)
- [Backups](#backups)
- [Escalamiento](#escalamiento)

---

## Prerrequisitos

### Hardware Recomendado

| Componente | Mínimo     | Recomendado |
| ---------- | ---------- | ----------- |
| CPU        | 4 cores    | 8+ cores    |
| RAM        | 8 GB       | 16+ GB      |
| Disco      | 100 GB SSD | 250+ GB SSD |
| Red        | 100 Mbps   | 1 Gbps      |

### Software Requerido

```bash
# Versiones mínimas
Docker: 24.0+
Docker Compose: 2.20+
Node.js: 20.0+ LTS
PostgreSQL: 15+
MongoDB: 7.0+
Redis: 7.2+
```

---

## Variables de Entorno

### Configuración Inicial

1. **Copiar plantilla de producción:**

```bash
cp .env.production.example .env.production
```

2. **Variables críticas a configurar:**

#### Seguridad

```bash
# JWT - Generar con: openssl rand -base64 64
JWT_SECRET=<token_seguro_256_bits>
JWT_EXPIRATION=24h

# Cookies - Generar con: openssl rand -base64 32
SESSION_SECRET=<token_seguro_128_bits>
```

#### Base de Datos PostgreSQL

```bash
POSTGRES_HOST=<ip_o_hostname>
POSTGRES_PORT=5432
POSTGRES_DB=flores_db_prod
POSTGRES_USER=flores_user_prod
POSTGRES_PASSWORD=<password_compleja>
POSTGRES_SSL=true
POSTGRES_MAX_CONNECTIONS=20
```

#### MongoDB

```bash
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/flores_prod?retryWrites=true&w=majority
MONGODB_DB_NAME=flores_prod
MONGODB_MAX_POOL_SIZE=50
MONGODB_MIN_POOL_SIZE=10
```

#### Redis

```bash
REDIS_HOST=<ip_o_hostname>
REDIS_PORT=6379
REDIS_PASSWORD=<password_redis>
REDIS_TLS=true
REDIS_DB=0
```

---

## Configuración de Bases de Datos

### PostgreSQL

#### 1. Instalación y Configuración Básica

```bash
# Instalar PostgreSQL (Ubuntu/Debian)
sudo apt-get update
sudo apt-get install postgresql-15 postgresql-contrib-15

# Configurar PostgreSQL
sudo -u postgres psql
```

```sql
-- Crear usuario
CREATE USER flores_user_prod WITH PASSWORD '<password_compleja>';

-- Crear base de datos
CREATE DATABASE flores_db_prod OWNER flores_user_prod;

-- Permisos
GRANT ALL PRIVILEGES ON DATABASE flores_db_prod TO flores_user_prod;
```

#### 2. Optimizaciones para Producción

Editar `/etc/postgresql/15/main/postgresql.conf`:

```ini
# Conexiones
max_connections = 100
superuser_reserved_connections = 3

# Memoria
shared_buffers = 4GB
effective_cache_size = 12GB
maintenance_work_mem = 1GB
work_mem = 50MB

# Checkpoints
checkpoint_completion_target = 0.9
wal_buffers = 16MB
min_wal_size = 2GB
max_wal_size = 8GB

# Logging
logging_collector = on
log_directory = 'pg_log'
log_filename = 'postgresql-%Y-%m-%d_%H%M%S.log'
log_rotation_age = 1d
log_rotation_size = 100MB
log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h '
log_min_duration_statement = 1000

# Performance
random_page_cost = 1.1  # Para SSD
effective_io_concurrency = 200
```

#### 3. Crear Tablas Iniciales

```bash
# Ejecutar migraciones
npm run db:migrate:prod
```

### MongoDB

#### 1. Configuración de Réplica Set (Recomendado)

```javascript
// Conectar a MongoDB
mongosh "mongodb://<primary_host>:27017"

// Inicializar réplica set
rs.initiate({
  _id: "flores-rs",
  members: [
    { _id: 0, host: "mongo-1:27017", priority: 2 },
    { _id: 1, host: "mongo-2:27017" },
    { _id: 2, host: "mongo-3:27017" }
  ]
})

// Verificar estado
rs.status()
```

#### 2. Crear Usuario y Base de Datos

```javascript
use admin
db.createUser({
  user: "flores_admin",
  pwd: "<password_compleja>",
  roles: [
    { role: "userAdminAnyDatabase", db: "admin" },
    { role: "readWriteAnyDatabase", db: "admin" }
  ]
})

use flores_prod
db.createUser({
  user: "flores_user_prod",
  pwd: "<password_prod>",
  roles: [
    { role: "readWrite", db: "flores_prod" }
  ]
})
```

#### 3. Crear Índices

```bash
# Ejecutar script de creación de índices
npm run db:indexes:create
```

O manualmente:

```javascript
use flores_prod

// Productos
db.products.createIndex({ category: 1, price: 1, active: 1 })
db.products.createIndex({ occasions: 1, featured: -1 })
db.products.createIndex({ views: -1, rating: -1, active: 1 })
db.products.createIndex({ featured: -1, createdAt: -1, active: 1 })
db.products.createIndex({ name: "text", description: "text" })
```

### Redis

#### Configuración Optimizada

```bash
# /etc/redis/redis.conf

# Networking
bind 0.0.0.0
protected-mode yes
port 6379
timeout 300
tcp-keepalive 60

# Seguridad
requirepass <password_redis>

# Memoria
maxmemory 4gb
maxmemory-policy allkeys-lru

# Persistencia
save 900 1
save 300 10
save 60 10000
appendonly yes
appendfsync everysec

# Performance
tcp-backlog 511
databases 16
```

---

## Configuración de Servicios

### Docker Compose (Producción)

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  api-gateway:
    image: flores-victoria/api-gateway:latest
    restart: always
    env_file: .env.production
    ports:
      - '3000:3000'
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:3000/health']
      interval: 30s
      timeout: 10s
      retries: 3
    logging:
      driver: 'json-file'
      options:
        max-size: '10m'
        max-file: '3'
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G

  # ... más servicios
```

### Nginx como Proxy Inverso

```nginx
# /etc/nginx/sites-available/flores-victoria

upstream api_gateway {
    least_conn;
    server 127.0.0.1:3000 max_fails=3 fail_timeout=30s;
    server 127.0.0.1:3001 max_fails=3 fail_timeout=30s;
}

server {
    listen 80;
    server_name floresvictoria.cl www.floresvictoria.cl;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name floresvictoria.cl www.floresvictoria.cl;

    # SSL
    ssl_certificate /etc/letsencrypt/live/floresvictoria.cl/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/floresvictoria.cl/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Seguridad
    add_header Strict-Transport-Security "max-age=63072000" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Logs
    access_log /var/log/nginx/flores-victoria-access.log;
    error_log /var/log/nginx/flores-victoria-error.log;

    # Proxy
    location /api {
        proxy_pass http://api_gateway;
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

    # Frontend
    location / {
        root /var/www/flores-victoria/frontend;
        index index.html;
        try_files $uri $uri/ /index.html;

        # Cache estático
        location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg)$ {
            expires 30d;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

---

## Seguridad

### Certificados SSL

#### Let's Encrypt (Certbot)

```bash
# Instalar Certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtener certificado
sudo certbot --nginx -d floresvictoria.cl -d www.floresvictoria.cl

# Renovación automática
sudo certbot renew --dry-run

# Agregar a crontab
0 0,12 * * * root certbot renew --quiet
```

### Firewall

```bash
# UFW (Ubuntu)
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

### Fail2Ban

```bash
# Instalar
sudo apt-get install fail2ban

# Configurar
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
```

```ini
# /etc/fail2ban/jail.local
[nginx-limit-req]
enabled = true
filter = nginx-limit-req
port = http,https
logpath = /var/log/nginx/*error.log
maxretry = 5
findtime = 600
bantime = 3600
```

---

## Monitoreo

### Prometheus

```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'api-gateway'
    static_configs:
      - targets: ['localhost:3000']
    metrics_path: '/metrics'

  - job_name: 'product-service'
    static_configs:
      - targets: ['localhost:3009']
    metrics_path: '/metrics'
```

### Grafana Dashboards

Importar dashboards pre-configurados:

- Node.js Application (ID: 11159)
- MongoDB (ID: 2583)
- PostgreSQL (ID: 9628)
- Redis (ID: 763)

---

## Backups

### Script de Backup Automatizado

```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/flores-victoria"

# PostgreSQL
pg_dump -h localhost -U flores_user_prod flores_db_prod | \
  gzip > "$BACKUP_DIR/postgres_$DATE.sql.gz"

# MongoDB
mongodump --uri="$MONGODB_URI" --out="$BACKUP_DIR/mongo_$DATE"
tar -czf "$BACKUP_DIR/mongo_$DATE.tar.gz" "$BACKUP_DIR/mongo_$DATE"
rm -rf "$BACKUP_DIR/mongo_$DATE"

# Redis
redis-cli --rdb "$BACKUP_DIR/redis_$DATE.rdb"

# Limpiar backups antiguos (> 7 días)
find "$BACKUP_DIR" -name "*.gz" -mtime +7 -delete
find "$BACKUP_DIR" -name "*.rdb" -mtime +7 -delete

echo "Backup completado: $DATE"
```

```bash
# Agregar a crontab
0 2 * * * /opt/flores-victoria/scripts/backup.sh >> /var/log/flores-backups.log 2>&1
```

---

## Escalamiento

### Horizontal (Múltiples Instancias)

```yaml
# docker-compose.scale.yml
services:
  api-gateway:
    deploy:
      replicas: 3
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3
```

```bash
docker-compose -f docker-compose.prod.yml up -d --scale api-gateway=3
```

### Load Balancer (Nginx)

```nginx
upstream api_gateway_cluster {
    least_conn;
    server 10.0.1.10:3000 weight=3;
    server 10.0.1.11:3000 weight=2;
    server 10.0.1.12:3000 weight=1 backup;
}
```

---

## Checklist de Despliegue

- [ ] Variables de entorno configuradas
- [ ] Bases de datos inicializadas
- [ ] Índices de MongoDB creados
- [ ] Certificados SSL instalados
- [ ] Firewall configurado
- [ ] Nginx configurado
- [ ] Servicios Docker levantados
- [ ] Healthchecks verificados
- [ ] Monitoreo activo (Grafana)
- [ ] Backups automatizados
- [ ] Logs centralizados
- [ ] Rate limiting verificado
- [ ] CORS configurado
- [ ] Pruebas de carga realizadas

---

## Referencias

- [Guía de Despliegue (DEPLOYMENT.md)](./DEPLOYMENT.md)
- [Troubleshooting (TROUBLESHOOTING.md)](./TROUBLESHOOTING.md)
- [API Versioning (API_VERSIONING.md)](./API_VERSIONING.md)
- [Configuración de Puertos (PORTS_CONFIGURATION.md)](../PORTS_CONFIGURATION.md)

---

**Última actualización:** Noviembre 2025  
**Versión:** 3.0
