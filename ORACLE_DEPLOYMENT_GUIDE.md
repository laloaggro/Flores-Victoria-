# 🚀 Guía de Deployment - Oracle Cloud Free Tier

## Pre-requisitos Completados ✅

- [x] **Recursos optimizados**: 3.2 CPUs, 2.2GB RAM (dentro del límite de 4 CPUs)
- [x] **14/14 servicios HEALTHY**: nginx, api-gateway, 11 microservicios, postgres, mongodb, redis
- [x] **Seguridad**: Secrets seguros, 0 vulnerabilidades npm
- [x] **Backups**: Script `backup-databases-v2.sh` configurado
- [x] **Documentación**: `.env.oracle-example` con todas las variables

## Checklist Pre-Deployment

### 1. Verificación Local (5 min)

```bash
# Verificar estado de servicios
docker compose -f docker-compose.oracle.yml ps

# Verificar recursos
docker stats --no-stream | head -15

# Probar endpoints críticos
curl http://localhost/api/health
curl http://localhost/api/auth/health
curl http://localhost/api/cart/health

# Validar secretos
./scripts/validate-secrets.sh
```

**Expected Output**: Todos los servicios HEALTHY, CPU < 4.0, RAM < 3GB

### 2. Preparar Credenciales (10 min)

```bash
# Copiar archivo de ejemplo
cp .env.oracle-example .env.production

# Generar secretos seguros
./scripts/generate-production-secrets.sh

# O manualmente:
echo "POSTGRES_PASSWORD=$(openssl rand -base64 48)"
echo "MONGODB_PASSWORD=$(openssl rand -base64 48)"
echo "REDIS_PASSWORD=$(openssl rand -base64 48)"
echo "JWT_SECRET=$(openssl rand -base64 72)"

# Guardar en password manager (Bitwarden/1Password/LastPass)
# ⚠️ CRÍTICO: Hacer backup de CREDENCIALES_PRODUCCION.txt
```

### 3. Oracle Cloud Setup (20 min)

#### 3.1 Crear Compute Instance

1. **Login**: https://cloud.oracle.com
2. **Compute** → **Instances** → **Create Instance**
3. **Configuración**:
   - **Name**: `flores-victoria-prod`
   - **Image**: Ubuntu 22.04 LTS (Always Free Eligible)
   - **Shape**: VM.Standard.A1.Flex
     - **OCPUs**: 4 (Free Tier limit)
     - **Memory**: 24 GB (Free Tier limit)
   - **Networking**: Create new VCN or use existing
   - **SSH Keys**: Subir tu clave pública (`~/.ssh/id_rsa.pub`)

4. **Esperar** ~5 minutos para provisioning

#### 3.2 Configurar Firewall

**En Oracle Cloud Console**:

1. **Networking** → **Virtual Cloud Networks** → Tu VCN
2. **Security Lists** → **Default Security List**
3. **Agregar Ingress Rules**:

```
Source: 0.0.0.0/0
Destination Port: 80 (HTTP)
Description: Web traffic

Source: 0.0.0.0/0
Destination Port: 443 (HTTPS)
Description: Secure web traffic

Source: TU_IP/32
Destination Port: 22 (SSH)
Description: SSH access (restringido a tu IP)
```

**⚠️ NO abrir**: 5432 (PostgreSQL), 6379 (Redis), 27017 (MongoDB)

**En el servidor (UFW)**:

```bash
# Conectar via SSH
ssh ubuntu@<IP_PUBLICA>

# Configurar firewall
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status
```

### 4. Instalar Docker en Oracle Cloud (15 min)

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
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verificar instalación
docker --version
docker-compose --version
```

**Expected Output**:

```
Docker version 24.x.x
Docker Compose version v2.x.x
```

### 5. Transferir Proyecto (10 min)

**Desde tu máquina local**:

```bash
# Crear archivo tar excluyendo node_modules y archivos grandes
cd /home/impala/Documentos/Proyectos
tar -czf flores-victoria.tar.gz flores-victoria \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='backups' \
  --exclude='logs' \
  --exclude='*.log'

# Transferir via SCP
scp flores-victoria.tar.gz ubuntu@<IP_PUBLICA>:~/

# O usar rsync (más rápido)
rsync -avz --exclude='node_modules' --exclude='.git' \
  --exclude='backups' --exclude='logs' \
  flores-victoria/ ubuntu@<IP_PUBLICA>:~/flores-victoria/
```

**En el servidor**:

```bash
# Descomprimir (si usaste tar)
tar -xzf flores-victoria.tar.gz

# Entrar al directorio
cd flores-victoria

# Copiar credenciales
cp .env.oracle-example .env.production

# Editar con tus credenciales
nano .env.production
```

### 6. Build y Deploy (20 min)

```bash
# Construir imágenes (primera vez)
docker compose -f docker-compose.oracle.yml build

# Iniciar servicios
docker compose -f docker-compose.oracle.yml up -d

# Monitorear inicio
watch docker compose -f docker-compose.oracle.yml ps

# Esperar ~2 minutos hasta que todos estén HEALTHY
```

### 7. Verificación Post-Deployment (10 min)

```bash
# 1. Verificar servicios
docker compose -f docker-compose.oracle.yml ps
# Expected: 14/14 HEALTHY

# 2. Verificar logs
docker compose -f docker-compose.oracle.yml logs --tail=50 api-gateway
docker compose -f docker-compose.oracle.yml logs --tail=50 postgres
docker compose -f docker-compose.oracle.yml logs --tail=50 mongodb

# 3. Probar endpoints
curl http://localhost/api/health
curl http://localhost/api/auth/health

# 4. Verificar recursos
docker stats --no-stream

# 5. Verificar conectividad externa (desde tu máquina)
curl http://<IP_PUBLICA>/api/health
```

### 8. Configurar Backups Automáticos (5 min)

```bash
# Configurar cron para backups diarios
./scripts/setup-cron-jobs.sh

# O manualmente:
crontab -e

# Agregar:
# Backup diario a las 3 AM
0 3 * * * /home/ubuntu/flores-victoria/scripts/backup-databases-v2.sh --all

# Limpiar backups antiguos semanalmente
0 4 * * 0 find /var/backups/flores-victoria -type f -mtime +7 -delete
```

### 9. SSL/HTTPS (Opcional - 15 min)

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtener certificado (requiere dominio apuntando a IP)
sudo certbot --nginx -d tudominio.com -d www.tudominio.com

# Renovación automática (ya configurada por Certbot)
sudo certbot renew --dry-run
```

## Monitoreo Continuo

### Comandos Útiles

```bash
# Ver logs en tiempo real
docker compose -f docker-compose.oracle.yml logs -f

# Ver logs de un servicio específico
docker compose -f docker-compose.oracle.yml logs -f api-gateway

# Reiniciar un servicio
docker compose -f docker-compose.oracle.yml restart api-gateway

# Ver recursos
docker stats

# Ver estado de servicios
./scripts/health-check-v2.sh
```

### Métricas Importantes

- **CPU Usage**: Debe estar < 80% promedio
- **Memory Usage**: Debe estar < 2GB promedio
- **Disk Usage**: Verificar con `df -h` (mantener < 80%)
- **Database Size**: Monitorear crecimiento

```bash
# Tamaño de bases de datos
docker exec flores-postgres psql -U postgres -c "SELECT pg_database_size('flores_victoria')/1024/1024 as size_mb;"
docker exec flores-mongodb mongosh --eval "db.stats()"
```

## Troubleshooting

### Servicio no inicia

```bash
# Ver logs detallados
docker compose -f docker-compose.oracle.yml logs --tail=100 <servicio>

# Reconstruir imagen
docker compose -f docker-compose.oracle.yml build --no-cache <servicio>

# Reiniciar todos los servicios
docker compose -f docker-compose.oracle.yml restart
```

### Falta de memoria

```bash
# Ver uso actual
free -h
docker stats --no-stream

# Limpiar caché de Docker
docker system prune -a --volumes

# Reducir límites en docker-compose.oracle.yml si necesario
```

### Problemas de conectividad

```bash
# Verificar firewall
sudo ufw status

# Verificar puertos en uso
sudo netstat -tulpn | grep LISTEN

# Verificar red de Docker
docker network inspect flores-victoria_flores-network
```

### Database connection errors

```bash
# Verificar passwords en .env.production
cat .env.production | grep PASSWORD

# Verificar bases de datos
docker exec flores-postgres psql -U postgres -l
docker exec flores-mongodb mongosh --eval "show dbs"

# Reiniciar bases de datos
docker compose -f docker-compose.oracle.yml restart postgres mongodb redis
```

## Rollback

Si algo sale mal:

```bash
# 1. Detener servicios
docker compose -f docker-compose.oracle.yml down

# 2. Restaurar backup
./scripts/restore-databases.sh

# 3. Reiniciar
docker compose -f docker-compose.oracle.yml up -d
```

## Mantenimiento

### Actualizaciones

```bash
# 1. Hacer backup
./scripts/backup-databases-v2.sh --all

# 2. Pull cambios
git pull origin main

# 3. Rebuild
docker compose -f docker-compose.oracle.yml build

# 4. Recrear servicios
docker compose -f docker-compose.oracle.yml up -d --force-recreate
```

### Limpieza Regular

```bash
# Limpiar logs antiguos
find ./logs -type f -mtime +7 -delete

# Limpiar imágenes no usadas
docker image prune -a

# Limpiar volúmenes huérfanos
docker volume prune
```

## Recursos de Soporte

- **Documentación**: `./docs/`
- **Scripts**: `./scripts/`
- **Logs**: `./logs/` o `docker compose logs`
- **Health Checks**: `./scripts/health-check-v2.sh`
- **Backups**: `/var/backups/flores-victoria/`

## Contacto de Emergencia

En caso de problemas críticos:

1. Verificar logs: `docker compose logs`
2. Ejecutar diagnósticos: `./scripts/unified-diagnostics.sh`
3. Restaurar backup: `./scripts/restore-databases.sh`
4. Documentar el issue para análisis posterior

---

**Última actualización**: 20 de noviembre de 2025 **Versión**: 1.0 **Estado**: Listo para producción
✅
