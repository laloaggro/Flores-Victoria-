# 🚀 Guía Rápida - Deploy Oracle Cloud Free Tier

## 📋 Pre-requisitos

✅ VM Oracle Cloud creada (VM.Standard.E2.1.Micro, 1GB RAM) ✅ IP pública: **144.22.56.153** ✅
Sistema: Ubuntu 22.04 Minimal

---

## 🔥 PASO 1: Configurar Security List (Oracle Cloud Console)

### Abrir puertos necesarios:

1. Ve a: **Networking → Virtual Cloud Networks → vcn-flores-victoria**
2. Click en tu subnet
3. Click en **"Default Security List"**
4. **Add Ingress Rules**:

| Puerto | Protocolo | Source CIDR | Descripción |
| ------ | --------- | ----------- | ----------- |
| 22     | TCP       | 0.0.0.0/0   | SSH         |
| 80     | TCP       | 0.0.0.0/0   | HTTP        |
| 443    | TCP       | 0.0.0.0/0   | HTTPS       |

---

## 🔑 PASO 2: Agregar clave SSH

### Opción A: Desde tu máquina local

1. **Copia la clave pública**:

   ```bash
   cat ~/.ssh/oracle_cloud_flores.pub
   ```

2. **En Oracle Cloud Console**:
   - Ve a tu instancia `flores-victoria-free`
   - Click **Actions → Edit**
   - Sección **"Add SSH keys"**
   - Pega la clave pública
   - Click **"Save"**

### Opción B: Desde Oracle Cloud Console (Serial Console)

Si no puedes acceder vía SSH, usa la **Serial Console**:

1. En tu instancia, click **"Console connection"**
2. Click **"Create console connection"**
3. Sigue las instrucciones para conectarte
4. Una vez dentro:
   ```bash
   # Agregar tu clave SSH
   mkdir -p ~/.ssh
   echo "PEGA_TU_CLAVE_PUBLICA_AQUI" >> ~/.ssh/authorized_keys
   chmod 700 ~/.ssh
   chmod 600 ~/.ssh/authorized_keys
   ```

---

## 🚀 PASO 3: Conectar vía SSH

Desde tu máquina local:

```bash
ssh -i ~/.ssh/oracle_cloud_flores ubuntu@144.22.56.153
```

**Si falla**:

- Verifica que el puerto 22 esté abierto en Security List
- Espera 2-3 minutos después de abrir puertos
- Verifica que la clave SSH esté agregada correctamente

---

## 📦 PASO 4: Ejecutar script de instalación

Una vez conectado a la VM:

### Opción A: Copiar y ejecutar script

```bash
# Copiar el script desde tu máquina local
scp -i ~/.ssh/oracle_cloud_flores \
  environments/production/oracle-cloud-setup.sh \
  ubuntu@144.22.56.153:/home/ubuntu/

# En la VM, ejecutar:
chmod +x /home/ubuntu/oracle-cloud-setup.sh
./oracle-cloud-setup.sh
```

### Opción B: Ejecutar comandos manualmente

```bash
# 1. Actualizar sistema
sudo apt-get update && sudo apt-get upgrade -y

# 2. Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu

# 3. Instalar Docker Compose
sudo apt-get install -y docker-compose-plugin

# 4. Configurar firewall
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
sudo apt-get install -y iptables-persistent
sudo netfilter-persistent save

# 5. Clonar repositorio
cd /home/ubuntu
git clone https://github.com/laloaggro/Flores-Victoria-.git
cd Flores-Victoria-/environments/production

# 6. Crear .env.production (ver sección Variables de Entorno abajo)

# 7. Levantar servicios
docker compose -f docker-compose.free-tier.yml up -d
```

---

## ⚙️ Variables de Entorno (.env.production)

Crear archivo `/home/ubuntu/Flores-Victoria-/environments/production/.env.production`:

```bash
# Generar secretos seguros
JWT_SECRET=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-64)
POSTGRES_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
MONGO_ROOT_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
REDIS_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
SESSION_SECRET=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-64)

# Crear archivo
cat > .env.production <<EOF
NODE_ENV=production
API_GATEWAY_PORT=3000
JWT_SECRET=${JWT_SECRET}
POSTGRES_USER=flores_user
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
POSTGRES_DB=flores_db
POSTGRES_HOST=postgres
MONGO_ROOT_USERNAME=flores_admin
MONGO_ROOT_PASSWORD=${MONGO_ROOT_PASSWORD}
MONGO_HOST=mongodb
REDIS_HOST=redis
REDIS_PASSWORD=${REDIS_PASSWORD}
SESSION_SECRET=${SESSION_SECRET}
CORS_ORIGINS=http://144.22.56.153
EOF
```

---

## 🔍 PASO 5: Verificar servicios

```bash
# Ver estado de contenedores
docker compose -f docker-compose.free-tier.yml ps

# Ver logs en tiempo real
docker compose -f docker-compose.free-tier.yml logs -f

# Ver uso de memoria/CPU
docker stats

# Health check API Gateway
curl http://localhost:3000/health

# Health check desde fuera
curl http://144.22.56.153/health
```

---

## 🌐 Acceso a la aplicación

Una vez que todo esté corriendo:

- **Frontend**: http://144.22.56.153
- **API Gateway**: http://144.22.56.153/api
- **Health Check**: http://144.22.56.153/health

---

## 🛠️ Comandos útiles

```bash
# Ver logs de un servicio específico
docker compose -f docker-compose.free-tier.yml logs -f api-gateway

# Reiniciar todos los servicios
docker compose -f docker-compose.free-tier.yml restart

# Reiniciar un servicio específico
docker compose -f docker-compose.free-tier.yml restart api-gateway

# Detener todos los servicios
docker compose -f docker-compose.free-tier.yml down

# Detener y eliminar volúmenes (⚠️ CUIDADO: borra datos)
docker compose -f docker-compose.free-tier.yml down -v

# Ver uso de recursos en tiempo real
docker stats

# Limpiar espacio (imágenes no usadas)
docker system prune -af

# Backup de volúmenes
docker run --rm -v postgres-data:/data -v $(pwd):/backup \
  alpine tar czf /backup/postgres-backup-$(date +%Y%m%d).tar.gz /data
```

---

## 🐛 Troubleshooting

### No puedo conectar vía SSH

- ✅ Verifica que el puerto 22 esté abierto en Security List
- ✅ Verifica que la clave SSH esté agregada a la instancia
- ✅ Espera 2-3 minutos después de cambios en Security List
- ✅ Prueba con Serial Console si SSH no funciona

### Los servicios no inician

```bash
# Ver logs detallados
docker compose -f docker-compose.free-tier.yml logs

# Ver memoria disponible
free -h

# Si hay poco espacio, limpiar Docker
docker system prune -af
```

### Error "Out of Memory"

```bash
# Ver uso de memoria por contenedor
docker stats

# Reducir servicios:
# Editar docker-compose.free-tier.yml y comentar servicios no esenciales
```

### Frontend no carga

```bash
# Verificar que Nginx esté corriendo
docker compose -f docker-compose.free-tier.yml ps nginx

# Ver logs de Nginx
docker compose -f docker-compose.free-tier.yml logs nginx

# Verificar puertos
sudo netstat -tlnp | grep 80
```

---

## 📊 Monitoreo de recursos

```bash
# Crear script de monitoreo
cat > /home/ubuntu/monitor.sh <<'EOF'
#!/bin/bash
while true; do
  clear
  echo "=== Recursos del Sistema ==="
  free -h
  echo ""
  echo "=== Uso por Contenedor ==="
  docker stats --no-stream
  sleep 5
done
EOF

chmod +x /home/ubuntu/monitor.sh
./monitor.sh
```

---

## 🔒 Seguridad Post-Deploy

### 1. Cambiar contraseñas

```bash
# Editar .env.production con contraseñas nuevas
nano /home/ubuntu/Flores-Victoria-/environments/production/.env.production

# Reiniciar servicios
cd /home/ubuntu/Flores-Victoria-/environments/production
docker compose -f docker-compose.free-tier.yml down
docker compose -f docker-compose.free-tier.yml up -d
```

### 2. Instalar fail2ban

```bash
sudo apt-get install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 3. Configurar backups automáticos

```bash
# Crear script de backup
cat > /home/ubuntu/backup.sh <<'EOF'
#!/bin/bash
BACKUP_DIR="/home/ubuntu/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup PostgreSQL
docker exec flores-postgres-free pg_dumpall -U flores_user > $BACKUP_DIR/postgres-$DATE.sql

# Backup MongoDB
docker exec flores-mongo-free mongodump --archive=$BACKUP_DIR/mongo-$DATE.archive

# Limpiar backups antiguos (mantener últimos 7 días)
find $BACKUP_DIR -type f -mtime +7 -delete
EOF

chmod +x /home/ubuntu/backup.sh

# Agregar a crontab (diario a las 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * /home/ubuntu/backup.sh") | crontab -
```

---

## 📞 Soporte

Si encuentras problemas:

1. Revisa logs: `docker compose logs`
2. Verifica recursos: `docker stats` y `free -h`
3. Revisa firewall: `sudo iptables -L -n`
4. Consulta documentación en `/docs`

---

**Última actualización**: 25 de noviembre de 2025
