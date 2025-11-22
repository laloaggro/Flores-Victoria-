# Guía de Despliegue

> Guía paso a paso para desplegar Flores Victoria en producción.

---

## 📋 Tabla de Contenidos

- [Opciones de Despliegue](#opciones-de-despliegue)
- [Despliegue en Oracle Cloud](#despliegue-en-oracle-cloud)
- [Despliegue con Docker](#despliegue-con-docker)
- [CI/CD con GitHub Actions](#cicd-con-github-actions)
- [Rollback y Recovery](#rollback-y-recovery)
- [Post-Deployment](#post-deployment)

---

## Opciones de Despliegue

### Comparación de Plataformas

| Plataforma       | Pros                               | Contras                       | Costo       |
| ---------------- | ---------------------------------- | ----------------------------- | ----------- |
| **Oracle Cloud** | Free tier generoso, VMs potentes   | Configuración compleja        | $0-50/mes   |
| **AWS**          | Ecosistema completo, documentación | Costoso, curva de aprendizaje | $30-200/mes |
| **DigitalOcean** | Simple, droplets económicos        | Menos servicios               | $12-40/mes  |
| **Heroku**       | Deploy sencillo, addons            | Caro, no free tier real       | $25-100/mes |
| **Vercel**       | Excelente para frontend            | Solo frontend/serverless      | $0-20/mes   |

**Recomendación:** Oracle Cloud para free tier o DigitalOcean para producción.

---

## Despliegue en Oracle Cloud

### Paso 1: Crear VM Compute Instance

#### 1.1 Acceder a Oracle Cloud Console

```
https://cloud.oracle.com
```

#### 1.2 Crear Instancia

**Navegación:** Compute → Instances → Create Instance

**Configuración recomendada:**

- **Shape:** VM.Standard.E2.1.Micro (Free Tier)
  - 1 OCPU
  - 1 GB RAM
  - Always Free eligible
- **Image:** Ubuntu 22.04 LTS
- **Boot Volume:** 50 GB (Free Tier)
- **VCN:** Crear nueva o usar existente
- **Subnet:** Public subnet con auto-assign public IP

#### 1.3 Configurar Networking

**Security List Rules:**

```bash
# Ingress Rules
Protocol  Source        Destination Port  Description
--------------------------------------------------------------
TCP       0.0.0.0/0     22                SSH
TCP       0.0.0.0/0     80                HTTP
TCP       0.0.0.0/0     443               HTTPS
TCP       0.0.0.0/0     3000              API Gateway (temp)
```

---

### Paso 2: Configuración Inicial del Servidor

#### 2.1 Conectar por SSH

```bash
# Desde tu máquina local
ssh -i ~/.ssh/oracle-vm-key ubuntu@<PUBLIC_IP>
```

#### 2.2 Actualizar Sistema

```bash
sudo apt-get update && sudo apt-get upgrade -y
sudo apt-get install -y curl git vim wget htop
```

#### 2.3 Instalar Docker

```bash
# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Agregar usuario al grupo docker
sudo usermod -aG docker $USER

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" \
  -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verificar
docker --version
docker-compose --version
```

#### 2.4 Configurar Firewall (UFW)

```bash
# Instalar UFW
sudo apt-get install -y ufw

# Configurar reglas
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS

# Activar firewall
sudo ufw enable
sudo ufw status
```

---

### Paso 3: Clonar Repositorio

```bash
# Crear directorio de aplicación
sudo mkdir -p /opt/flores-victoria
sudo chown $USER:$USER /opt/flores-victoria
cd /opt/flores-victoria

# Clonar repositorio
git clone https://github.com/tu-usuario/flores-victoria.git .

# Verificar estructura
ls -la
```

---

### Paso 4: Configurar Variables de Entorno

```bash
# Copiar template
cp .env.production.example .env.production

# Editar variables
nano .env.production
```

**Variables críticas:**

```bash
# Generar secretos seguros
openssl rand -base64 64  # Para JWT_SECRET
openssl rand -base64 32  # Para SESSION_SECRET

# Configurar
NODE_ENV=production
JWT_SECRET=<tu_jwt_secret_generado>
JWT_EXPIRATION=24h

# Bases de datos (ver siguiente sección para setup)
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=flores_db_prod
POSTGRES_USER=flores_user_prod
POSTGRES_PASSWORD=<password_segura>

MONGODB_URI=mongodb://localhost:27017/flores_prod
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=<password_redis>

# URLs públicas
FRONTEND_URL=https://floresvictoria.cl
API_URL=https://api.floresvictoria.cl
```

---

### Paso 5: Setup de Bases de Datos

#### 5.1 PostgreSQL

```bash
# Levantar contenedor PostgreSQL
docker run -d \
  --name postgres \
  --restart always \
  -e POSTGRES_USER=flores_user_prod \
  -e POSTGRES_PASSWORD=<password_segura> \
  -e POSTGRES_DB=flores_db_prod \
  -p 5432:5432 \
  -v postgres_data:/var/lib/postgresql/data \
  postgres:15-alpine

# Verificar
docker logs postgres
docker exec -it postgres psql -U flores_user_prod -d flores_db_prod -c "SELECT version();"
```

#### 5.2 MongoDB

```bash
# Levantar contenedor MongoDB
docker run -d \
  --name mongodb \
  --restart always \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=<password_mongo_admin> \
  -p 27017:27017 \
  -v mongodb_data:/data/db \
  mongo:7.0

# Crear usuario de aplicación
docker exec -it mongodb mongosh admin -u admin -p <password_mongo_admin>
```

```javascript
// En mongosh
use flores_prod
db.createUser({
  user: "flores_user_prod",
  pwd: "<password_prod>",
  roles: [{ role: "readWrite", db: "flores_prod" }]
})
```

#### 5.3 Redis

```bash
# Levantar contenedor Redis
docker run -d \
  --name redis \
  --restart always \
  -p 6379:6379 \
  -v redis_data:/data \
  redis:7-alpine redis-server \
  --requirepass <password_redis> \
  --appendonly yes

# Verificar
docker exec -it redis redis-cli -a <password_redis> PING
```

---

### Paso 6: Build y Deploy

#### 6.1 Build de Imágenes

```bash
cd /opt/flores-victoria

# Build de todos los servicios
docker-compose -f docker-compose.prod.yml build

# Ver imágenes creadas
docker images | grep flores
```

#### 6.2 Inicializar Bases de Datos

```bash
# Crear tablas PostgreSQL
docker-compose -f docker-compose.prod.yml run --rm auth-service npm run db:migrate

# Crear índices MongoDB
docker-compose -f docker-compose.prod.yml run --rm product-service npm run db:indexes:create

# Seed inicial (opcional, solo primera vez)
docker-compose -f docker-compose.prod.yml run --rm product-service npm run db:seed
```

#### 6.3 Levantar Servicios

```bash
# Levantar todos los servicios
docker-compose -f docker-compose.prod.yml up -d

# Ver estado
docker-compose -f docker-compose.prod.yml ps

# Ver logs
docker-compose -f docker-compose.prod.yml logs -f
```

---

### Paso 7: Configurar Nginx

#### 7.1 Instalar Nginx

```bash
sudo apt-get install -y nginx
```

#### 7.2 Configurar Virtual Host

```bash
sudo nano /etc/nginx/sites-available/flores-victoria
```

```nginx
# Upstream para load balancing
upstream api_backend {
    least_conn;
    server 127.0.0.1:3000 max_fails=3 fail_timeout=30s;
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name floresvictoria.cl www.floresvictoria.cl;

    # Certbot challenge
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS Server
server {
    listen 443 ssl http2;
    server_name floresvictoria.cl www.floresvictoria.cl;

    # SSL Configuration (se agregarán después con certbot)
    ssl_certificate /etc/letsencrypt/live/floresvictoria.cl/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/floresvictoria.cl/privkey.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Logs
    access_log /var/log/nginx/flores-access.log;
    error_log /var/log/nginx/flores-error.log;

    # API Proxy
    location /api/ {
        proxy_pass http://api_backend/;
        proxy_http_version 1.1;

        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_buffering off;
        proxy_cache_bypass $http_upgrade;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Frontend
    location / {
        root /opt/flores-victoria/frontend;
        index index.html;
        try_files $uri $uri/ /index.html;

        # Cache para assets estáticos
        location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "OK\n";
        add_header Content-Type text/plain;
    }
}
```

#### 7.3 Activar Site y Reiniciar

```bash
# Crear symlink
sudo ln -s /etc/nginx/sites-available/flores-victoria /etc/nginx/sites-enabled/

# Eliminar default
sudo rm /etc/nginx/sites-enabled/default

# Test configuración
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

---

### Paso 8: Configurar SSL (Let's Encrypt)

```bash
# Instalar Certbot
sudo apt-get install -y certbot python3-certbot-nginx

# Obtener certificado
sudo certbot --nginx -d floresvictoria.cl -d www.floresvictoria.cl

# Seguir prompts:
# - Email para notificaciones
# - Aceptar Terms of Service
# - Redirect HTTP to HTTPS? → Yes

# Verificar
sudo certbot certificates

# Auto-renovación (ya configurada)
sudo systemctl status certbot.timer
```

---

## Despliegue con Docker

### docker-compose.prod.yml

```yaml
version: '3.8'

services:
  api-gateway:
    build:
      context: ./microservices/api-gateway
      dockerfile: Dockerfile.prod
    image: flores-victoria/api-gateway:${VERSION:-latest}
    container_name: flores-api-gateway
    restart: always
    env_file: .env.production
    ports:
      - '3000:3000'
    depends_on:
      - redis
      - postgres
      - mongodb
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:3000/health']
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    logging:
      driver: 'json-file'
      options:
        max-size: '10m'
        max-file: '3'
    networks:
      - flores-network

  # ... más servicios (auth, product, etc.)

networks:
  flores-network:
    driver: bridge

volumes:
  postgres_data:
  mongodb_data:
  redis_data:
```

---

## CI/CD con GitHub Actions

### .github/workflows/deploy-production.yml

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
  workflow_dispatch: # Manual trigger

env:
  DEPLOY_USER: ubuntu
  DEPLOY_HOST: ${{ secrets.ORACLE_VM_IP }}

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Check coverage
        run: npm run test:coverage

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to DockerHub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Build and push images
        run: |
          docker-compose -f docker-compose.prod.yml build
          docker-compose -f docker-compose.prod.yml push

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Oracle Cloud
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.ORACLE_VM_IP }}
          username: ${{ env.DEPLOY_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /opt/flores-victoria

            # Backup de base de datos
            ./scripts/backup.sh

            # Pull latest code
            git pull origin main

            # Pull latest images
            docker-compose -f docker-compose.prod.yml pull

            # Down y up con zero-downtime
            docker-compose -f docker-compose.prod.yml up -d --no-deps --build

            # Verificar health
            sleep 10
            curl -f http://localhost:3000/health || exit 1

            # Limpiar imágenes antiguas
            docker image prune -af

      - name: Notify deployment
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: 'Deployment to production completed!'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
        if: always()
```

---

## Rollback y Recovery

### Rollback Rápido

```bash
#!/bin/bash
# scripts/rollback.sh

VERSION=${1:-previous}

echo "🔄 Rolling back to version: $VERSION"

cd /opt/flores-victoria

# Down servicios actuales
docker-compose -f docker-compose.prod.yml down

# Checkout versión anterior
git checkout $VERSION

# Restaurar backup de BD (si necesario)
# ./scripts/restore-backup.sh

# Up con versión anterior
docker-compose -f docker-compose.prod.yml up -d

# Verificar
sleep 10
curl -f http://localhost:3000/health

echo "✅ Rollback completado"
```

### Uso:

```bash
# Rollback a commit específico
./scripts/rollback.sh abc123

# Rollback al último tag
./scripts/rollback.sh v2.5.0

# Rollback al commit anterior
git log --oneline -5
./scripts/rollback.sh <commit_hash>
```

---

## Post-Deployment

### Checklist de Verificación

```bash
#!/bin/bash
# scripts/post-deployment-check.sh

echo "🔍 Post-Deployment Checks"
echo "========================="

# 1. Healthchecks
echo -e "\n1. Service Health:"
for port in 3000 3001 3009 3002 3003; do
  status=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$port/health)
  if [ $status -eq 200 ]; then
    echo "✅ Port $port: OK"
  else
    echo "❌ Port $port: FAIL ($status)"
  fi
done

# 2. Database connections
echo -e "\n2. Database Connectivity:"
docker exec postgres pg_isready && echo "✅ PostgreSQL" || echo "❌ PostgreSQL"
docker exec mongodb mongosh --eval "db.adminCommand('ping')" > /dev/null && echo "✅ MongoDB" || echo "❌ MongoDB"
docker exec redis redis-cli ping > /dev/null && echo "✅ Redis" || echo "❌ Redis"

# 3. SSL Certificate
echo -e "\n3. SSL Certificate:"
echo | openssl s_client -servername floresvictoria.cl -connect floresvictoria.cl:443 2>/dev/null | \
  openssl x509 -noout -dates

# 4. Disk space
echo -e "\n4. Disk Space:"
df -h / | tail -1

# 5. Docker stats
echo -e "\n5. Container Resources:"
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}"

# 6. Recent errors
echo -e "\n6. Recent Errors (last 10):"
docker-compose logs --tail=100 | grep -i error | tail -10

echo -e "\n✅ Post-deployment check completed"
```

```bash
# Ejecutar checks
./scripts/post-deployment-check.sh
```

---

## Monitoreo y Alertas

### Configurar Uptime Monitor

```bash
# Usar servicios externos como:
# - UptimeRobot (free)
# - Pingdom
# - Better Uptime

# Endpoints a monitorear:
https://floresvictoria.cl/health
https://api.floresvictoria.cl/health
```

### Logs Centralizados

```bash
# Instalar Loki (opcional)
docker run -d \
  --name=loki \
  -v $(pwd)/loki-config.yaml:/etc/loki/local-config.yaml \
  -p 3100:3100 \
  grafana/loki:latest
```

---

## Mantenimiento

### Script de Mantenimiento Semanal

```bash
#!/bin/bash
# scripts/weekly-maintenance.sh

# Limpiar Docker
docker system prune -af --volumes

# Actualizar sistema
sudo apt-get update && sudo apt-get upgrade -y

# Renovar SSL
sudo certbot renew --quiet

# Rotar logs
sudo logrotate /etc/logrotate.d/nginx

# Backup
./scripts/backup.sh

echo "✅ Mantenimiento completado"
```

```bash
# Agregar a crontab
0 3 * * 0 /opt/flores-victoria/scripts/weekly-maintenance.sh >> /var/log/flores-maintenance.log 2>&1
```

---

## Referencias

- [Production Setup Guide](./PRODUCTION_SETUP.md)
- [Troubleshooting Guide](./TROUBLESHOOTING.md)
- [Oracle Cloud Docs](https://docs.oracle.com/en-us/iaas/Content/home.htm)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)

---

**Última actualización:** Noviembre 2025  
**Versión:** 3.0
