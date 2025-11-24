# 🚀 Guía de Deployment en Oracle Cloud

Guía completa para desplegar Flores Victoria en Oracle Cloud Infrastructure (OCI) Free Tier.

## 📋 Tabla de Contenidos

- [Pre-requisitos](#pre-requisitos)
- [Configuración de la Instancia](#configuración-de-la-instancia)
- [Deployment Automatizado](#deployment-automatizado)
- [Configuración de DNS](#configuración-de-dns)
- [SSL/TLS](#ssltls)
- [Monitoreo](#monitoreo)
- [Troubleshooting](#troubleshooting)

---

## ✅ Pre-requisitos

### Oracle Cloud Free Tier

✅ **Instancia disponible:**
- **Shape**: VM.Standard.E2.1.Micro (Always Free)
- **CPU**: 1 OCPU (ARM64 o AMD64)
- **RAM**: 1 GB
- **Storage**: 46 GB Boot Volume

**⚠️ Nota**: Para el stack completo, se recomienda:
- **Shape**: VM.Standard.A1.Flex (Always Free)
- **CPU**: 4 OCPUs (ARM Ampere)
- **RAM**: 24 GB
- **Storage**: 100 GB

### Herramientas locales

```bash
# OCI CLI (opcional)
brew install oci-cli  # macOS
pip install oci-cli   # Linux/Windows

# SSH Key
ssh-keygen -t rsa -b 4096 -f ~/.ssh/oracle_cloud_key
```

---

## 🖥️ Configuración de la Instancia

### 1. Crear Instancia en OCI

1. Login a [cloud.oracle.com](https://cloud.oracle.com)
2. Navegar a **Compute → Instances → Create Instance**
3. Configurar:
   - **Name**: flores-victoria-prod
   - **Image**: Ubuntu 22.04 LTS
   - **Shape**: VM.Standard.A1.Flex (ARM, 4 OCPU, 24GB RAM)
   - **Network**: Create new VCN with public subnet
   - **SSH Key**: Upload `oracle_cloud_key.pub`

### 2. Configurar Firewall (Security List)

**Ingress Rules:**

| Port | Protocol | Source | Description |
|------|----------|--------|-------------|
| 22 | TCP | 0.0.0.0/0 | SSH |
| 80 | TCP | 0.0.0.0/0 | HTTP |
| 443 | TCP | 0.0.0.0/0 | HTTPS |
| 16686 | TCP | Tu IP | Jaeger UI (opcional) |
| 3000 | TCP | Tu IP | Grafana (opcional) |

**Configurar en OCI:**
```
Networking → Virtual Cloud Networks → tu-vcn → Security Lists → Default Security List
→ Add Ingress Rules
```

### 3. Conectar via SSH

```bash
ssh -i ~/.ssh/oracle_cloud_key ubuntu@<PUBLIC_IP>
```

### 4. Configurar el Sistema

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Agregar usuario al grupo docker
sudo usermod -aG docker ubuntu
newgrp docker

# Instalar Docker Compose
sudo apt install docker-compose-plugin -y

# Verificar instalación
docker --version
docker compose version

# Instalar utilidades
sudo apt install -y git vim htop curl wget
```

---

## 🚀 Deployment Automatizado

### 1. Clonar Repositorio

```bash
cd ~
git clone https://github.com/laloaggro/Flores-Victoria-.git
cd Flores-Victoria-
```

### 2. Configurar Variables de Entorno

```bash
# Copiar template
cp .env.oracle.example .env

# Editar con tus valores
nano .env
```

**Variables críticas a cambiar:**

```bash
# Generar secrets seguros
MONGO_INITDB_ROOT_PASSWORD=$(openssl rand -base64 24)
POSTGRES_PASSWORD=$(openssl rand -base64 24)
RABBITMQ_DEFAULT_PASS=$(openssl rand -base64 24)
JWT_SECRET=$(openssl rand -base64 32)
REDIS_PASSWORD=$(openssl rand -base64 24)

# Dominio (si tienes uno)
APP_URL=https://tu-dominio.com
API_GATEWAY_URL=https://api.tu-dominio.com
```

### 3. Ejecutar Deployment Script

```bash
# Dar permisos de ejecución
chmod +x deploy-oracle.sh

# Ejecutar
./deploy-oracle.sh
```

**El script automáticamente:**
1. ✅ Verifica requisitos (Docker, Docker Compose)
2. ✅ Valida archivo `.env`
3. ✅ Compila el frontend (`npm run build`)
4. ✅ Detiene contenedores anteriores
5. ✅ Construye imágenes Docker optimizadas
6. ✅ Inicia todos los servicios
7. ✅ Ejecuta health checks
8. ✅ Muestra logs y URLs

### 4. Verificar Deployment

```bash
# Ver todos los contenedores
docker ps

# Ver logs
docker-compose -f docker-compose.oracle.yml logs -f

# Logs de un servicio específico
docker logs flores-api-gateway -f

# Ver recursos
docker stats
```

---

## 🌐 Configuración de DNS

### Con Dominio Propio

1. **Registrar dominio** (Namecheap, GoDaddy, etc.)

2. **Configurar DNS A Records:**

```
Type  Host  Value              TTL
A     @     <ORACLE_PUBLIC_IP> 3600
A     www   <ORACLE_PUBLIC_IP> 3600
A     api   <ORACLE_PUBLIC_IP> 3600
```

3. **Verificar propagación:**

```bash
dig tu-dominio.com
nslookup tu-dominio.com
```

### Sin Dominio (Solo IP)

Accede directamente via:
- Frontend: `http://<PUBLIC_IP>`
- API: `http://<PUBLIC_IP>/api`

---

## 🔒 SSL/TLS con Let's Encrypt

### 1. Instalar Certbot

```bash
sudo apt install certbot python3-certbot-nginx -y
```

### 2. Detener Nginx temporalmente

```bash
docker stop flores-nginx
```

### 3. Obtener Certificado

```bash
sudo certbot certonly --standalone -d tu-dominio.com -d www.tu-dominio.com
```

**Certificados se guardan en:**
- `/etc/letsencrypt/live/tu-dominio.com/fullchain.pem`
- `/etc/letsencrypt/live/tu-dominio.com/privkey.pem`

### 4. Copiar Certificados

```bash
sudo mkdir -p ~/Flores-Victoria-/ssl
sudo cp /etc/letsencrypt/live/tu-dominio.com/fullchain.pem ~/Flores-Victoria-/ssl/
sudo cp /etc/letsencrypt/live/tu-dominio.com/privkey.pem ~/Flores-Victoria-/ssl/
sudo chown ubuntu:ubuntu ~/Flores-Victoria-/ssl/*
```

### 5. Actualizar nginx.conf

Editar `nginx.conf` para usar SSL:

```nginx
server {
    listen 443 ssl http2;
    server_name tu-dominio.com www.tu-dominio.com;

    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # ... resto de configuración
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name tu-dominio.com www.tu-dominio.com;
    return 301 https://$server_name$request_uri;
}
```

### 6. Reiniciar servicios

```bash
docker-compose -f docker-compose.oracle.yml restart nginx
```

### 7. Auto-renovación

```bash
# Agregar cron job
sudo crontab -e

# Agregar línea:
0 0 * * * certbot renew --quiet && docker-compose -f ~/Flores-Victoria-/docker-compose.oracle.yml restart nginx
```

---

## 📊 Monitoreo

### Servicios Disponibles

```bash
# Jaeger UI (Tracing)
http://<PUBLIC_IP>:16686

# Grafana (Metrics)
http://<PUBLIC_IP>:3000
Usuario: admin
Contraseña: admin123

# Prometheus
http://<PUBLIC_IP>:9090

# Admin Panel
http://<PUBLIC_IP>:3021
```

### Health Checks

```bash
# API Gateway
curl http://localhost:3000/health

# Todos los servicios
for service in auth-service product-service user-service order-service cart-service; do
  echo "=== $service ==="
  docker exec flores-$service curl -s http://localhost/health | jq
done
```

### Logs Centralizados

```bash
# Todos los logs
docker-compose -f docker-compose.oracle.yml logs -f

# Filtrar por servicio
docker-compose -f docker-compose.oracle.yml logs -f api-gateway

# Últimas 100 líneas
docker-compose -f docker-compose.oracle.yml logs --tail=100

# Logs con timestamps
docker-compose -f docker-compose.oracle.yml logs -f --timestamps
```

### Métricas del Sistema

```bash
# CPU, RAM, Network por contenedor
docker stats

# Disk usage
docker system df

# Ver recursos de la instancia
htop
```

---

## 🔧 Troubleshooting

### Contenedor no inicia

```bash
# Ver logs del contenedor
docker logs <container_name>

# Inspeccionar contenedor
docker inspect <container_name>

# Reiniciar servicio específico
docker-compose -f docker-compose.oracle.yml restart <service_name>
```

### Base de datos no conecta

```bash
# Verificar que contenedores de DB estén corriendo
docker ps | grep -E 'mongodb|postgres|redis'

# Logs de MongoDB
docker logs flores-mongodb

# Logs de PostgreSQL
docker logs flores-postgres

# Test de conexión
docker exec flores-mongodb mongosh --eval "db.adminCommand('ping')"
docker exec flores-postgres pg_isready
```

### Out of Memory

```bash
# Ver uso de memoria
free -h
docker stats --no-stream

# Limpiar recursos no usados
docker system prune -a --volumes

# Reducir servicios en docker-compose.oracle.yml
# Comentar servicios no críticos temporalmente
```

### Puertos no accesibles

```bash
# Verificar firewall local (Ubuntu)
sudo ufw status
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Verificar que el contenedor expone el puerto
docker ps | grep <container_name>

# Test desde el servidor
curl http://localhost:<port>/health

# Verificar Security List en OCI Console
```

### SSL no funciona

```bash
# Verificar certificados
sudo certbot certificates

# Renovar manualmente
sudo certbot renew

# Verificar nginx config
docker exec flores-nginx nginx -t

# Ver logs de nginx
docker logs flores-nginx
```

---

## 🔄 Actualizaciones

### Actualizar código

```bash
cd ~/Flores-Victoria-

# Pull latest changes
git pull origin main

# Rebuild y redeploy
./deploy-oracle.sh
```

### Rollback

```bash
# Ver imágenes anteriores
docker images

# Detener servicios actuales
docker-compose -f docker-compose.oracle.yml down

# Iniciar con versión anterior
docker-compose -f docker-compose.oracle.yml up -d
```

---

## 📦 Backups

### Base de Datos

```bash
# Backup MongoDB
docker exec flores-mongodb mongodump --out /backup --authenticationDatabase admin -u admin -p <password>
docker cp flores-mongodb:/backup ./mongodb-backup-$(date +%Y%m%d)

# Backup PostgreSQL
docker exec flores-postgres pg_dumpall -U postgres > postgres-backup-$(date +%Y%m%d).sql

# Automatizar con cron
0 2 * * * /home/ubuntu/Flores-Victoria-/scripts/backup-databases.sh
```

---

## 📊 Optimización de Recursos

### Oracle Free Tier (1GB RAM)

Si tienes limitación de RAM:

```yaml
# Reducir servicios en docker-compose.oracle.yml
# Mantener solo:
# - nginx (frontend)
# - api-gateway
# - auth-service
# - product-service
# - mongodb
# - postgres
# - redis

# Ajustar límites de memoria
mem_limit: 128m  # para servicios pequeños
mem_limit: 256m  # para servicios críticos
```

### Oracle A1.Flex (24GB RAM)

Stack completo funciona sin problemas.

---

## 📚 Referencias

- [OCI Documentation](https://docs.oracle.com/en-us/iaas/Content/home.htm)
- [Docker Compose File](./docker-compose.oracle.yml)
- [Deployment Script](./deploy-oracle.sh)
- [Environment Variables](./ENV_CONFIGURATION.md)
- [Architecture](./ARCHITECTURE.md)

---

## 🆘 Soporte

Si encuentras problemas:

1. Revisa logs: `docker-compose logs -f`
2. Verifica health checks: `curl http://localhost:3000/health`
3. Revisa recursos: `docker stats`
4. Consulta [Issues en GitHub](https://github.com/laloaggro/Flores-Victoria-/issues)
