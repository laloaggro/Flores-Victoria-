# 🎯 Pre-Deployment Checklist - Oracle Cloud

**Fecha:** 11 de noviembre de 2025  
**Versión:** 3.0.0-optimized  
**Ambiente:** Oracle Cloud Free Tier

---

## ✅ Optimizaciones Completadas

### 1. Docker Resources ✅
- [x] docker-compose.oracle-optimized.yml creado
- [x] Deploy resources con CPU/RAM limits
- [x] PostgreSQL tuning configurado
- [x] Redis optimizado (maxmemory policy)
- [x] Healthchecks optimizados (30s interval)

### 2. Imágenes Docker ✅
- [x] Script optimize-docker-images.sh creado
- [x] Multi-stage builds verificados
- [x] Alpine images en uso
- [x] .dockerignore configurado

### 3. Caché Redis ✅
- [x] Middleware cache.js implementado
- [x] TTL diferenciado por endpoint
- [x] Cache headers (X-Cache: HIT/MISS)
- [x] Invalidación por patrón

### 4. Seguridad ✅
- [x] Rate limiter middleware creado
- [x] Fail2ban setup script creado
- [x] Secrets validation script creado
- [x] .env.production.example creado

### 5. Logging ✅
- [x] LOG_LEVEL=warn en docker-compose
- [x] Log rotation configurado en cron
- [x] Structured logging ready

### 6. Node.js Config ✅
- [x] NODE_ENV=production
- [x] NODE_OPTIONS memory limits
- [x] Todos los servicios optimizados

---

## 🔐 Seguridad - CRÍTICO

### Secrets a Cambiar

- [ ] **JWT_SECRET** - Generar: `openssl rand -base64 32`
- [ ] **POSTGRES_PASSWORD** - Generar: `openssl rand -base64 24`
- [ ] **REDIS_PASSWORD** - Generar: `openssl rand -base64 16`
- [ ] **GRAFANA_PASSWORD** - Generar: `openssl rand -base64 16`

### Validación

```bash
# Ejecutar validación de secrets
./scripts/validate-secrets.sh

# Debe pasar sin errores críticos
```

---

## 📦 Archivos de Deployment

### Archivos Principales
- [x] `docker-compose.oracle-optimized.yml` - Compose optimizado
- [x] `deploy-oracle.sh` - Script de deployment
- [x] `.env.production.example` - Template de variables
- [x] `nginx/nginx.prod.conf` - Nginx con SSL/rate limiting

### Scripts de Automatización
- [x] `scripts/pre-deployment-check.sh` - Validación pre-deployment
- [x] `scripts/backup-databases.sh` - Backups automatizados
- [x] `scripts/health-check.sh` - Health checks
- [x] `scripts/setup-cron-jobs.sh` - Configuración de cron jobs
- [x] `scripts/setup-fail2ban.sh` - DDoS protection
- [x] `scripts/optimize-docker-images.sh` - Optimización de imágenes
- [x] `scripts/validate-secrets.sh` - Validación de seguridad

### Documentación
- [x] `ENV_CONFIGURATION.md` - 282 variables documentadas
- [x] `ORACLE_CLOUD_DEPLOYMENT.md` - Guía de deployment
- [x] `SSL_CONFIGURATION_GUIDE.md` - Configuración SSL/TLS
- [x] `OPTIMIZATIONS_ORACLE_CLOUD.md` - Optimizaciones aplicadas
- [x] `monitoring/grafana/provisioning/alerting/alerts.yml` - Alertas

---

## 🚀 Pasos de Deployment

### Pre-Deployment (Local)

1. **Validar configuración**
   ```bash
   ./scripts/pre-deployment-check.sh
   ```

2. **Generar secrets**
   ```bash
   # Copiar template
   cp .env.production.example .env
   
   # Editar y cambiar TODOS los secrets
   nano .env
   ```

3. **Validar secrets**
   ```bash
   ./scripts/validate-secrets.sh
   ```

4. **Optimizar imágenes**
   ```bash
   ./scripts/optimize-docker-images.sh
   ```

5. **Compilar frontend**
   ```bash
   cd frontend
   npm install
   npm run build
   cd ..
   ```

6. **Validar docker-compose**
   ```bash
   docker compose -f docker-compose.oracle-optimized.yml config
   ```

### En Oracle Cloud

7. **Subir archivos al servidor**
   ```bash
   # Comprimir proyecto
   tar -czf flores-victoria.tar.gz \
     docker-compose.oracle-optimized.yml \
     deploy-oracle.sh \
     .env \
     frontend/dist \
     microservices \
     nginx \
     monitoring \
     database \
     scripts \
     ssl
   
   # Subir a servidor
   scp flores-victoria.tar.gz ubuntu@<oracle-ip>:/home/ubuntu/
   ```

8. **Extraer en servidor**
   ```bash
   ssh ubuntu@<oracle-ip>
   cd /opt
   sudo mkdir flores-victoria
   sudo chown ubuntu:ubuntu flores-victoria
   cd flores-victoria
   tar -xzf ~/flores-victoria.tar.gz
   ```

9. **Configurar firewall**
   ```bash
   # Oracle Cloud Security List
   # Puertos a abrir: 22, 80, 443, 3000, 16686
   ```

10. **Instalar Docker**
    ```bash
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker ubuntu
    ```

11. **Deployment**
    ```bash
    ./deploy-oracle.sh
    ```

12. **Configurar SSL**
    ```bash
    # Seguir SSL_CONFIGURATION_GUIDE.md
    sudo certbot certonly --standalone -d floresvictoria.com
    ```

13. **Configurar cron jobs**
    ```bash
    ./scripts/setup-cron-jobs.sh
    ```

14. **Configurar fail2ban**
    ```bash
    sudo ./scripts/setup-fail2ban.sh
    ```

---

## ✅ Post-Deployment Verification

### Verificación de Servicios

```bash
# Health checks
./scripts/health-check.sh

# Docker status
docker ps

# Logs
docker compose -f docker-compose.oracle-optimized.yml logs -f
```

### Verificación de Endpoints

- [ ] Frontend: https://floresvictoria.com
- [ ] API: https://floresvictoria.com/api/health
- [ ] Grafana: https://floresvictoria.com:3000
- [ ] Jaeger: https://floresvictoria.com:16686
- [ ] Prometheus: http://<ip>:9090

### Verificación de Monitoreo

- [ ] Grafana dashboards cargados
- [ ] Alertas configuradas
- [ ] Prometheus scraping metrics
- [ ] Jaeger recibiendo traces

### Verificación de Seguridad

- [ ] SSL certificado válido
- [ ] HTTPS redirect funcionando
- [ ] Rate limiting activo
- [ ] Fail2ban corriendo
- [ ] Headers de seguridad presentes

---

## 📊 Métricas Esperadas

### Performance
- Response time: < 100ms (con cache)
- Cache hit rate: > 60%
- CPU usage: < 50%
- RAM usage: < 70%

### Recursos
- Total RAM used: ~3.5GB / 24GB
- Total CPU used: ~2.5 cores / 4 cores
- Disk used: ~5GB (images + data)

---

## 🔧 Troubleshooting

### Si hay errores de memoria
```bash
# Verificar uso de RAM
docker stats

# Reducir servicios de observability
docker compose stop jaeger prometheus grafana
```

### Si hay errores de conexión
```bash
# Verificar network
docker network inspect flores-network

# Verificar firewall
sudo iptables -L -n
```

### Si hay errores de DB
```bash
# Verificar PostgreSQL
docker logs flores-postgres

# Verificar Redis
docker logs flores-redis
```

---

## 📞 Soporte

- **Documentación**: Ver archivos .md en el proyecto
- **Logs**: `docker compose logs -f [service]`
- **Health checks**: `./scripts/health-check.sh`
- **Backups**: Automáticos diarios a las 2:00 AM

---

## ✨ Deployment Completo

Una vez completados todos los pasos, el sistema estará:

- ✅ Optimizado para Oracle Cloud Free Tier
- ✅ Protegido con SSL/TLS
- ✅ Rate limiting activo
- ✅ Fail2ban configurado
- ✅ Backups automatizados
- ✅ Monitoreo con alertas
- ✅ Logging centralizado
- ✅ Cache Redis activo

**Total de recursos usados:**
- RAM: 3.5GB / 24GB (14%)
- CPU: 2.5 cores / 4 cores (62%)
- Storage: ~5GB

**Costo mensual:** ~$3 (solo storage adicional)

---

**Última actualización:** 11 de noviembre de 2025  
**Versión:** 3.0.0-optimized
