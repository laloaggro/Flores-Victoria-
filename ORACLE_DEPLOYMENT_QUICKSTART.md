# 🚀 GUÍA RÁPIDA DE DEPLOYMENT - ORACLE CLOUD

## ⚡ Inicio Rápido (5 minutos)

### 1️⃣ En tu VM de Oracle Cloud

```bash
# SSH a tu VM
ssh -i oracle-key.pem ubuntu@YOUR_ORACLE_IP

# Clonar repositorio
git clone https://github.com/YOUR_USERNAME/flores-victoria.git
cd flores-victoria

# Configurar variables de entorno
cp .env.oracle.example .env
nano .env  # Cambiar TODAS las contraseñas

# Ejecutar deployment
./deploy-oracle.sh
```

### 2️⃣ Acceder al sitio

```
http://YOUR_ORACLE_IP
```

---

## 📋 Checklist Pre-Deployment

- [ ] VM Oracle creada (4 OCPUs, 24GB RAM, Ubuntu 22.04)
- [ ] Firewall Oracle configurado (puertos 80, 443, 3000)
- [ ] UFW configurado en Ubuntu
- [ ] Docker y Docker Compose instalados
- [ ] Git instalado
- [ ] Repositorio clonado
- [ ] `.env` configurado con contraseñas seguras

---

## 🔧 Configuración de .env (CRÍTICO)

Edita `.env` y cambia estos valores:

```bash
# Database
POSTGRES_PASSWORD=TU_PASSWORD_SUPER_SEGURA_AQUI

# Redis
REDIS_PASSWORD=TU_REDIS_PASSWORD_AQUI

# JWT (genera con: openssl rand -base64 48)
JWT_SECRET=TU_JWT_SECRET_GENERADO_ALEATORIAMENTE

# Email (opcional)
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu-app-password
```

---

## 🏗️ Archivos de Configuración Creados

```
flores-victoria/
├── docker-compose.oracle.yml   ✅ Stack completo optimizado
├── nginx.conf                   ✅ Reverse proxy + SPA routing
├── .env.oracle.example          ✅ Template de variables
├── deploy-oracle.sh             ✅ Script de deployment automático
└── database/
    └── init.sql                 ✅ Inicialización de PostgreSQL
```

---

## 🎯 Comandos Útiles

### Ver logs en tiempo real
```bash
docker-compose -f docker-compose.oracle.yml logs -f
```

### Ver logs de un servicio específico
```bash
docker-compose -f docker-compose.oracle.yml logs -f api-gateway
docker-compose -f docker-compose.oracle.yml logs -f postgres
```

### Reiniciar un servicio
```bash
docker-compose -f docker-compose.oracle.yml restart api-gateway
```

### Ver estado de todos los servicios
```bash
docker-compose -f docker-compose.oracle.yml ps
```

### Ver uso de recursos
```bash
docker stats
```

### Detener todo
```bash
docker-compose -f docker-compose.oracle.yml down
```

### Iniciar todo
```bash
docker-compose -f docker-compose.oracle.yml up -d
```

### Rebuild de un servicio
```bash
docker-compose -f docker-compose.oracle.yml build --no-cache nginx
docker-compose -f docker-compose.oracle.yml up -d nginx
```

---

## 🐛 Troubleshooting

### Servicio no inicia
```bash
# Ver logs detallados
docker-compose -f docker-compose.oracle.yml logs SERVICE_NAME

# Reiniciar servicio
docker-compose -f docker-compose.oracle.yml restart SERVICE_NAME
```

### PostgreSQL no conecta
```bash
# Verificar que esté corriendo
docker-compose -f docker-compose.oracle.yml exec postgres pg_isready -U postgres

# Ver logs
docker-compose -f docker-compose.oracle.yml logs postgres

# Conectarse manualmente
docker-compose -f docker-compose.oracle.yml exec postgres psql -U postgres -d flores_victoria
```

### Redis no conecta
```bash
# Verificar conexión
docker-compose -f docker-compose.oracle.yml exec redis redis-cli -a YOUR_PASSWORD ping

# Ver logs
docker-compose -f docker-compose.oracle.yml logs redis
```

### Frontend muestra 404
```bash
# Verificar que Nginx esté sirviendo archivos
docker-compose -f docker-compose.oracle.yml exec nginx ls -la /usr/share/nginx/html

# Verificar configuración de Nginx
docker-compose -f docker-compose.oracle.yml exec nginx nginx -t

# Ver logs de Nginx
docker-compose -f docker-compose.oracle.yml logs nginx
```

### API no responde
```bash
# Verificar API Gateway
curl http://localhost/api/health

# Ver logs
docker-compose -f docker-compose.oracle.yml logs api-gateway

# Verificar que los microservicios estén corriendo
docker-compose -f docker-compose.oracle.yml ps | grep -E "(auth|product|cart)"
```

---

## 🔐 Seguridad Post-Deployment

### 1. Cambiar contraseñas por defecto
```bash
nano .env
# Cambiar TODAS las contraseñas
docker-compose -f docker-compose.oracle.yml down
docker-compose -f docker-compose.oracle.yml up -d
```

### 2. Configurar SSL (Let's Encrypt)
```bash
# Instalar certbot
sudo apt install certbot

# Obtener certificado
sudo certbot certonly --standalone -d your-domain.com

# Copiar certificados
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ./ssl/
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem ./ssl/

# Descomentar bloque HTTPS en nginx.conf
nano nginx.conf
# Descomentar server { listen 443 ssl ... }

# Reiniciar Nginx
docker-compose -f docker-compose.oracle.yml restart nginx
```

### 3. Habilitar auto-renovación SSL
```bash
# Agregar cron job
sudo crontab -e

# Añadir (renovar certificados cada 3 meses)
0 3 1 */3 * certbot renew --quiet && docker-compose -f /home/ubuntu/flores-victoria/docker-compose.oracle.yml restart nginx
```

---

## 📊 Monitoreo

### Uso de CPU y RAM
```bash
docker stats --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}"
```

### Espacio en disco
```bash
df -h
docker system df
```

### Limpieza de espacio
```bash
# Limpiar imágenes viejas
docker image prune -a

# Limpiar volúmenes no usados
docker volume prune

# Limpiar todo (CUIDADO - borra datos no usados)
docker system prune -a --volumes
```

---

## 🔄 Actualización del Código

```bash
# En la VM Oracle
cd flores-victoria

# Pull cambios
git pull origin main

# Rebuild frontend
cd frontend
npm install
npm run build
cd ..

# Rebuild y redeploy
docker-compose -f docker-compose.oracle.yml build --no-cache
docker-compose -f docker-compose.oracle.yml up -d

# Verificar
docker-compose -f docker-compose.oracle.yml ps
```

---

## 🎯 Stack Deployado

| Servicio | Puerto | RAM | Estado |
|----------|--------|-----|--------|
| Nginx (Frontend) | 80/443 | 128MB | ✅ |
| API Gateway | 3000 | 256MB | ✅ |
| Auth Service | 3001 | 256MB | ✅ |
| Product Service | 3009 | 256MB | ✅ |
| Cart Service | 3003 | 128MB | ✅ |
| Order Service | 3004 | 256MB | ✅ |
| User Service | 3005 | 256MB | ✅ |
| Contact Service | 3006 | 128MB | ✅ |
| Review Service | 3007 | 256MB | ✅ |
| Wishlist Service | 3008 | 128MB | ✅ |
| PostgreSQL | 5432 | 512MB | ✅ |
| Redis | 6379 | 256MB | ✅ |

**Total RAM:** ~2.5GB / 24GB disponibles ✅

---

## ✅ Verificación Final

```bash
# 1. Todos los servicios corriendo
docker-compose -f docker-compose.oracle.yml ps

# 2. Nginx responde
curl http://localhost/health

# 3. API responde
curl http://localhost/api/health

# 4. PostgreSQL funciona
docker-compose -f docker-compose.oracle.yml exec postgres psql -U postgres -d flores_victoria -c "SELECT COUNT(*) FROM products;"

# 5. Redis funciona
docker-compose -f docker-compose.oracle.yml exec redis redis-cli -a YOUR_PASSWORD ping

# 6. Frontend accesible
curl -I http://YOUR_ORACLE_IP
```

---

## 🆘 Soporte

Si algo no funciona:

1. Revisa los logs: `docker-compose -f docker-compose.oracle.yml logs -f`
2. Verifica `.env` tiene contraseñas correctas
3. Verifica firewall Oracle y UFW están configurados
4. Reinicia el servicio problemático
5. Como último recurso: `docker-compose -f docker-compose.oracle.yml down && docker-compose -f docker-compose.oracle.yml up -d`

---

## 🎉 ¡Listo!

Tu sitio está corriendo en:
- **Frontend:** http://YOUR_ORACLE_IP
- **API:** http://YOUR_ORACLE_IP/api
- **Sin problemas de caché de Netlify** ✅
- **Control total** ✅
- **$0/mes forever** ✅
