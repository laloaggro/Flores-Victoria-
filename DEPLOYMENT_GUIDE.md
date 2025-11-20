# 🚀 Guía de Deployment - Flores Victoria

> Instrucciones completas para desplegar el sistema en diferentes entornos

## 📋 Índice

1. [Requisitos Previos](#requisitos-previos)
2. [Deployment Local (Desarrollo)](#deployment-local-desarrollo)
3. [Deployment con Docker](#deployment-con-docker)
4. [Deployment en Producción](#deployment-en-producción)
5. [Variables de Entorno](#variables-de-entorno)
6. [Troubleshooting](#troubleshooting)

---

## Requisitos Previos

### Software Necesario

#### Para Desarrollo Local

```bash
Node.js >= 22.0.0
npm >= 10.0.0
MongoDB >= 4.4
Redis >= 6.0
PostgreSQL >= 13
```

#### Para Docker

```bash
Docker >= 20.10
Docker Compose >= 2.0
```

### Verificar Instalación

```bash
node --version   # v22.x.x
npm --version    # 10.x.x
docker --version # Docker version 20.10+
docker compose version # Docker Compose version v2.x.x
```

---

## Deployment Local (Desarrollo)

### 1. Clonar el Repositorio

```bash
git clone https://github.com/laloaggro/Flores-Victoria-.git
cd Flores-Victoria-
```

### 2. Instalar Dependencias

```bash
# Backend
cd backend
npm install

# API Gateway
cd ../microservices/api-gateway
npm install

# Admin Panel
cd ../../admin-panel
npm install

# Volver a raíz
cd ..
```

### 3. Configurar Variables de Entorno

```bash
# Copiar ejemplos
cp .env.example .env
cp microservices/api-gateway/.env.example microservices/api-gateway/.env
```

**Archivo `.env` principal:**

```env
NODE_ENV=development
PORT=3000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/flores_victoria
MONGO_INITDB_ROOT_USERNAME=root
MONGO_INITDB_ROOT_PASSWORD=rootpassword

# PostgreSQL
POSTGRES_USER=flores_user
POSTGRES_PASSWORD=flores_password
POSTGRES_DB=flores_db

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=tu_clave_secreta_super_segura_aqui

# AI Services
HUGGINGFACE_API_KEY=tu_key_aqui
AI_HORDE_API_KEY=tu_key_aqui

# Puertos
API_GATEWAY_PORT=3000
FRONTEND_PORT=5173
ADMIN_PORT=3021
```

### 4. Iniciar Bases de Datos

```bash
# Con Docker (recomendado)
docker compose up -d mongodb postgres redis

# O instalar localmente
mongod --port 27017
redis-server --port 6379
```

### 5. Iniciar Servicios

```bash
# Opción 1: Script automático
npm run start

# Opción 2: Servicios individuales
npm run start:backend &
npm run start:frontend &
npm run start:admin &
```

### 6. Verificar

```bash
# Health checks
curl http://localhost:3000/api/health
curl http://localhost:5173
curl http://localhost:3021/health

# O usar el script de verificación
npm run status
```

---

## Deployment con Docker

### Desarrollo

```bash
# 1. Construir imágenes
docker compose build

# 2. Iniciar todos los servicios
docker compose up -d

# 3. Ver logs
docker compose logs -f

# 4. Verificar estado
docker compose ps
```

### Solo Servicios Específicos

```bash
# Solo bases de datos
docker compose up -d mongodb postgres redis

# Solo API Gateway
docker compose up -d api-gateway

# Solo frontend
docker compose up -d frontend
```

### Reconstruir Servicios

```bash
# Reconstruir un servicio específico
docker compose build api-gateway
docker compose up -d --force-recreate api-gateway

# Reconstruir todo
docker compose build --no-cache
docker compose up -d --force-recreate
```

---

## Deployment en Producción

### Pre-requisitos

1. **Servidor con Docker** (mínimo 4GB RAM, 2 CPUs)
2. **Dominio configurado** (ejemplo: flores-victoria.com)
3. **Certificado SSL** (Let's Encrypt recomendado)
4. **Backup configurado** para bases de datos

### Paso 1: Preparar el Servidor

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Configurar firewall
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### Paso 2: Clonar y Configurar

```bash
# Clonar repositorio
git clone https://github.com/laloaggro/Flores-Victoria-.git
cd Flores-Victoria-

# Configurar producción
cp .env.production.example .env
nano .env
```

**Variables de Producción:**

```env
NODE_ENV=production
PORT=3000
DOMAIN=flores-victoria.com

# MongoDB (usar servicio externo o cluster)
MONGODB_URI=mongodb://usuario:password@cluster.mongodb.net/flores_victoria

# PostgreSQL (usar servicio administrado)
POSTGRES_HOST=db.example.com
POSTGRES_USER=flores_prod
POSTGRES_PASSWORD=contraseña_segura_aqui
POSTGRES_DB=flores_victoria_prod

# Redis (usar servicio administrado)
REDIS_URL=redis://redis.example.com:6379

# Seguridad
JWT_SECRET=clave_muy_segura_generada_aleatoriamente
SESSION_SECRET=otra_clave_segura

# APIs externas
HUGGINGFACE_API_KEY=hf_xxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx
PAYPAL_CLIENT_ID=xxxxxxxxxxxxx
```

### Paso 3: Configurar Nginx (Reverse Proxy)

```bash
sudo apt install nginx -y
sudo nano /etc/nginx/sites-available/flores-victoria
```

**Configuración Nginx:**

```nginx
upstream api_backend {
    server localhost:3000;
}

server {
    listen 80;
    server_name flores-victoria.com www.flores-victoria.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name flores-victoria.com www.flores-victoria.com;

    ssl_certificate /etc/letsencrypt/live/flores-victoria.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/flores-victoria.com/privkey.pem;

    # Frontend estático
    location / {
        root /var/www/flores-victoria/frontend/public;
        try_files $uri $uri/ /index.html;
    }

    # API Gateway
    location /api {
        proxy_pass http://api_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Admin Panel
    location /admin {
        proxy_pass http://localhost:3021;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Seguridad
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

```bash
# Activar configuración
sudo ln -s /etc/nginx/sites-available/flores-victoria /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Paso 4: Configurar SSL con Let's Encrypt

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtener certificado
sudo certbot --nginx -d flores-victoria.com -d www.flores-victoria.com

# Verificar renovación automática
sudo certbot renew --dry-run
```

### Paso 5: Desplegar con Docker Compose

```bash
# Usar archivo de producción
docker compose -f docker-compose.production.yml up -d

# Verificar logs
docker compose -f docker-compose.production.yml logs -f

# Verificar estado
docker compose -f docker-compose.production.yml ps
```

### Paso 6: Configurar Monitoreo

```bash
# Prometheus + Grafana
docker compose -f monitoring/docker-compose.monitoring.yml up -d

# Acceder a Grafana
# http://flores-victoria.com:3011
# Usuario: admin
# Password: admin (cambiar inmediatamente)
```

### Paso 7: Backups Automáticos

```bash
# Crear script de backup
sudo nano /usr/local/bin/backup-flores-victoria.sh
```

```bash
#!/bin/bash
BACKUP_DIR=/backups/flores-victoria
DATE=$(date +%Y%m%d_%H%M%S)

# MongoDB
docker exec flores-victoria-mongodb mongodump --out /backup/$DATE

# PostgreSQL
docker exec flores-victoria-postgres pg_dump -U flores_prod flores_victoria_prod > $BACKUP_DIR/postgres_$DATE.sql

# Comprimir
tar -czf $BACKUP_DIR/backup_$DATE.tar.gz $BACKUP_DIR/$DATE

# Limpiar backups antiguos (mantener 7 días)
find $BACKUP_DIR -type f -mtime +7 -delete

# Subir a S3 (opcional)
# aws s3 cp $BACKUP_DIR/backup_$DATE.tar.gz s3://flores-victoria-backups/
```

```bash
# Hacer ejecutable
sudo chmod +x /usr/local/bin/backup-flores-victoria.sh

# Configurar cron (diario a las 2 AM)
sudo crontab -e
0 2 * * * /usr/local/bin/backup-flores-victoria.sh
```

---

## Variables de Entorno

### Obligatorias

| Variable        | Descripción          | Ejemplo                       |
| --------------- | -------------------- | ----------------------------- |
| `NODE_ENV`      | Entorno de ejecución | `production`                  |
| `MONGODB_URI`   | URI de MongoDB       | `mongodb://user:pass@host/db` |
| `POSTGRES_HOST` | Host PostgreSQL      | `localhost`                   |
| `REDIS_URL`     | URL de Redis         | `redis://localhost:6379`      |
| `JWT_SECRET`    | Clave para JWT       | (generada aleatoriamente)     |

### Opcionales

| Variable         | Descripción        | Default                    |
| ---------------- | ------------------ | -------------------------- |
| `PORT`           | Puerto API Gateway | `3000`                     |
| `FRONTEND_PORT`  | Puerto frontend    | `5173`                     |
| `ADMIN_PORT`     | Puerto admin       | `3021`                     |
| `LOG_LEVEL`      | Nivel de logs      | `info`                     |
| `RATE_LIMIT_MAX` | Max requests/15min | `500` (prod), `2000` (dev) |

### APIs Externas

| Variable              | Descripción          | Obtener en                             |
| --------------------- | -------------------- | -------------------------------------- |
| `HUGGINGFACE_API_KEY` | API Key Hugging Face | https://huggingface.co/settings/tokens |
| `AI_HORDE_API_KEY`    | API Key AI Horde     | https://aihorde.net/register           |
| `STRIPE_SECRET_KEY`   | Stripe (pagos)       | https://dashboard.stripe.com/apikeys   |
| `PAYPAL_CLIENT_ID`    | PayPal (pagos)       | https://developer.paypal.com/          |

---

## Troubleshooting

### Contenedor no inicia

```bash
# Ver logs
docker logs flores-victoria-<servicio>

# Ver eventos
docker events --filter container=flores-victoria-<servicio>

# Reconstruir
docker compose build --no-cache <servicio>
docker compose up -d --force-recreate <servicio>
```

### Puerto ya en uso

```bash
# Encontrar proceso
lsof -i :<puerto>
# o
ss -tlnp | grep <puerto>

# Matar proceso
kill -9 <PID>
```

### Base de datos no conecta

```bash
# Verificar que esté corriendo
docker ps | grep mongodb

# Probar conexión
docker exec flores-victoria-mongodb mongo --eval "db.adminCommand('ping')"

# Ver logs
docker logs flores-victoria-mongodb --tail 50
```

### Memoria insuficiente

```bash
# Aumentar límites en docker-compose.yml
services:
  api-gateway:
    deploy:
      resources:
        limits:
          memory: 1G
        reservations:
          memory: 512M
```

### Limpiar Docker

```bash
# Limpiar contenedores detenidos
docker container prune

# Limpiar imágenes sin usar
docker image prune -a

# Limpiar volúmenes
docker volume prune

# Limpiar todo
docker system prune -a --volumes
```

---

## Health Checks

### Manual

```bash
# API Gateway
curl http://localhost:3000/api/health

# Servicios individuales
curl http://localhost:3000/api/ai/health
curl http://localhost:3000/api/wasm/health
curl http://localhost:3000/api/payments/health

# Bases de datos
docker exec flores-victoria-mongodb mongo --eval "db.adminCommand('ping')"
docker exec flores-victoria-postgres pg_isready -U flores_prod
docker exec flores-victoria-redis redis-cli ping
```

### Automatizado

```bash
# Script incluido
npm run health

# O crear cronjob
*/5 * * * * /var/www/flores-victoria/scripts/health-check.sh
```

---

## Performance Optimization

### Producción

1. **Habilitar compresión en Nginx**

```nginx
gzip on;
gzip_vary on;
gzip_types text/plain text/css application/json application/javascript text/xml;
```

2. **Usar CDN para assets estáticos**

```env
CDN_URL=https://cdn.flores-victoria.com
```

3. **Configurar caché de Redis**

```env
REDIS_CACHE_TTL=3600
```

4. **Optimizar imágenes**

```bash
npm run optimize:images
```

---

## Rollback

Si algo sale mal en producción:

```bash
# 1. Detener servicios
docker compose -f docker-compose.production.yml down

# 2. Volver a versión anterior
git checkout <tag-version-anterior>

# 3. Reconstruir y desplegar
docker compose -f docker-compose.production.yml build
docker compose -f docker-compose.production.yml up -d

# 4. Restaurar base de datos (si es necesario)
docker exec -i flores-victoria-mongodb mongorestore --archive < /backups/backup_YYYYMMDD.archive
```

---

## Checklist de Deployment

### Pre-deployment

- [ ] Todas las pruebas pasan
- [ ] Variables de entorno configuradas
- [ ] Backup reciente disponible
- [ ] SSL configurado y válido
- [ ] Firewall configurado

### Deployment

- [ ] Código en producción desplegado
- [ ] Contenedores corriendo correctamente
- [ ] Health checks OK
- [ ] Logs sin errores críticos

### Post-deployment

- [ ] Monitoreo activo
- [ ] Backup automático configurado
- [ ] Alertas configuradas
- [ ] Documentación actualizada

---

**Última actualización**: 28 de octubre de 2025  
**Versión**: 1.0

# Guía de Despliegue en Producción (Oracle Cloud)

## Recomendaciones generales
- Ejecuta todos los microservicios y bases en contenedores Docker.
- Usa archivos `.env.production` para variables sensibles y credenciales.
- Propaga variables vía `docker-compose.oracle.yml`.
- Usa volúmenes persistentes para MongoDB, Redis y Postgres.
- Configura healthchecks y logging centralizado.
- Protege credenciales y tokens fuera del repositorio (usa secretos de Oracle Cloud).

## Inicialización de MongoDB
- Asegúrate de que el usuario root se crea correctamente en el primer arranque.
- Si el volumen persiste y el usuario no existe, elimina el volumen y reinicia el contenedor.

## Ejemplo de variables de entorno
Ver `.env.production` adjunto.

## Ejemplo de comando de despliegue
```bash
docker-compose -f docker-compose.oracle.yml --env-file .env.production up -d
```

## Seguridad
- No subas archivos `.env.production` con credenciales reales al repositorio.
- Usa Oracle Cloud Vault para gestionar secretos en producción.

## Troubleshooting
- Si MongoDB no permite autenticación, revisa el volumen y las variables de inicialización.
- Verifica que los puertos mapeados no estén ocupados antes de iniciar los servicios.
