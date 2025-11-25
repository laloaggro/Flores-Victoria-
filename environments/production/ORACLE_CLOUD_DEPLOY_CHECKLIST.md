# ✅ Checklist Pre-Deploy Oracle Cloud - Flores Victoria

**Fecha de análisis:** 25 de noviembre de 2025  
**Estado del proyecto:** Listo para producción con observaciones  
**Score actual:** 85-95/100 Lighthouse (estimado post-optimizaciones)

---

## 🎯 RESUMEN EJECUTIVO

### ✅ Aspectos Listos

- 35 servicios Docker configurados
- 25 health checks implementados
- Build optimizado: 6.0MB (Brotli + Gzip)
- Imágenes WebP: ~250KB ahorrados
- Nginx configurado con proxy y compresión
- Multi-stage Dockerfiles (node:22-alpine)
- Restart policy: `unless-stopped`
- Tests: 22 archivos de test disponibles

### ⚠️ Requiere Atención Antes de Deploy

1. **8 archivos .env detectados** - revisar credenciales
2. **JWT_SECRET** - validar que no use valores por defecto
3. **Console.logs en producción** - algunos servicios aún los tienen
4. **Monitoring** - validar configuración Prometheus/Grafana
5. **Backup strategy** - definir estrategia para datos en Oracle Cloud

---

## 📋 CHECKLIST DETALLADO

### 1️⃣ SEGURIDAD Y SECRETOS 🔒

#### Variables de Entorno (CRÍTICO)

- [ ] **Revisar todos los archivos .env:**

  ```bash
  # Archivos detectados:
  ./.env
  ./services/ai-image-service/.env
  ./development/.env
  ./microservices/.env
  ./microservices/api-gateway/.env
  ./microservices/auth-service/.env
  ./microservices/user-service/.env
  ./microservices/product-service/.env
  ```

- [ ] **Validar JWT_SECRET en producción:**
  - ❌ NO debe ser: `your_jwt_secret_key`, `my_secret_key`, `default_secret`
  - ✅ Debe ser: String aleatorio de 64+ caracteres
  - Ubicación: `auth-service`, `api-gateway`

- [ ] **Passwords de bases de datos:**

  ```yaml
  # Cambiar estos valores por defecto:
  MONGO_INITDB_ROOT_PASSWORD: rootpassword # ⚠️ CAMBIAR
  POSTGRES_PASSWORD: flores_password # ⚠️ CAMBIAR
  RABBITMQ_DEFAULT_PASS: adminpassword # ⚠️ CAMBIAR
  ```

- [ ] **Crear .env.production separado:**
  ```bash
  # No versionar este archivo
  echo ".env.production" >> .gitignore
  ```

#### Configuración de Seguridad

- [ ] **Eliminar console.logs en producción:**
  - Frontend: ✅ Ya configurado en vite.config.js (drop_console: true)
  - Backend: ⚠️ Algunos servicios tienen console.log (revisar seed.js, logger.js)

- [ ] **CORS configuration:**
  - [ ] Configurar origins permitidos en api-gateway
  - [ ] No usar `*` en producción

- [ ] **Rate limiting:**
  - [ ] Verificar límites en API Gateway
  - [ ] Configurar Nginx rate limiting

---

### 2️⃣ CONFIGURACIÓN DOCKER 🐳

#### Docker Compose

- [x] ✅ 35 servicios configurados
- [x] ✅ 25 health checks implementados
- [x] ✅ Restart policy: `unless-stopped`
- [x] ✅ Networks aisladas (app-network)
- [x] ✅ Volumes persistentes para datos

#### Health Checks (25/35 servicios)

- [x] MongoDB, PostgreSQL, Redis
- [x] RabbitMQ
- [x] Jaeger, MCP Server
- [x] Microservicios principales
- [ ] **⚠️ Verificar que todos los servicios críticos tengan health check**

#### Resources Limits

- [ ] **Configurar límites de memoria por servicio:**

  ```yaml
  deploy:
    resources:
      limits:
        memory: 512m # Ajustar según Oracle Cloud instance
        cpus: '0.5'
      reservations:
        memory: 256m
  ```

- [ ] **Monitorear uso de recursos antes de deploy:**
  ```bash
  docker stats --no-stream
  ```

---

### 3️⃣ FRONTEND 🎨

#### Build de Producción

- [x] ✅ Build exitoso: 6.0MB total
- [x] ✅ Assets: 1.1MB
- [x] ✅ Brotli compression: -86% CSS, -84% HTML
- [x] ✅ Terser minification activa
- [x] ✅ Console.log removidos en producción
- [x] ✅ Service Worker deshabilitado en dev

#### Imágenes Optimizadas

- [x] ✅ Logo: 92KB → 16KB WebP (-82.6%)
- [x] ✅ Logo watermark: 32KB → 8KB WebP (-75%)
- [x] ✅ 9 categorías: JPG → WebP (-60%)
- [x] ✅ Total ahorrado: ~250KB

#### Nginx Configuration

- [x] ✅ Gzip level 6 configurado
- [x] ✅ Proxy pass a API Gateway
- [x] ✅ Health check endpoint: /health
- [x] ✅ Static assets caching

- [ ] **Ajustar para Oracle Cloud:**
  ```nginx
  # Cambiar puertos si Oracle Cloud los requiere
  listen 80;  # En lugar de 5173
  server_name tu-dominio.com;
  ```

---

### 4️⃣ BASES DE DATOS 💾

#### PostgreSQL

- [ ] **Backup antes de deploy:**

  ```bash
  docker exec flores-victoria-postgres pg_dump -U flores_user flores_db > backup_pre_oracle.sql
  ```

- [ ] **Migración de datos:**
  - [ ] Exportar datos actuales
  - [ ] Validar schema en Oracle Cloud
  - [ ] Importar datos

- [ ] **Connection pooling:**
  - [ ] Configurar max connections
  - [ ] Timeout settings

#### MongoDB

- [ ] **Backup antes de deploy:**

  ```bash
  docker exec flores-victoria-mongodb mongodump --out /backup
  ```

- [ ] **Índices optimizados:**
  - [ ] Verificar índices en colecciones productos
  - [ ] Configurar TTL para logs/sessions

#### Redis

- [ ] **Configurar persistencia:**

  ```conf
  # redis.conf
  save 900 1
  save 300 10
  save 60 10000
  ```

- [ ] **Límite de memoria:**
  ```conf
  maxmemory 256mb
  maxmemory-policy allkeys-lru
  ```

---

### 5️⃣ MONITOREO Y LOGS 📊

#### Prometheus + Grafana

- [ ] **Verificar configuración:**
  - [ ] Prometheus scraping todos los servicios
  - [ ] Grafana dashboards importados
  - [ ] Alertas configuradas

- [ ] **Métricas críticas:**
  - [ ] CPU usage por servicio
  - [ ] Memory usage por servicio
  - [ ] Request rate API Gateway
  - [ ] Database connections
  - [ ] Error rate por endpoint

#### Jaeger (Tracing)

- [x] ✅ Jaeger configurado en docker-compose
- [ ] **Configurar retention:**
  ```yaml
  environment:
    - SPAN_STORAGE_TYPE=elasticsearch # Para persistencia
  ```

#### Logs Centralizados

- [ ] **ELK Stack o Loki:**
  - [ ] Elasticsearch/Logstash/Kibana configurados
  - [ ] Log rotation habilitado
  - [ ] Retención de logs: 30 días

---

### 6️⃣ NETWORKING Y DNS 🌐

#### Dominio

- [ ] **Configurar DNS en Oracle Cloud:**
  - [ ] Record A: tu-dominio.com → IP Oracle Cloud
  - [ ] Record CNAME: www.tu-dominio.com → tu-dominio.com
  - [ ] SSL/TLS certificado (Let's Encrypt)

#### Load Balancer

- [ ] **Configurar Oracle Cloud Load Balancer:**
  - [ ] Health checks en /health
  - [ ] SSL termination
  - [ ] Sticky sessions (si es necesario)

#### Firewall

- [ ] **Configurar Security Lists en Oracle Cloud:**

  ```
  Inbound:
  - 80/TCP (HTTP)
  - 443/TCP (HTTPS)
  - 22/TCP (SSH) - solo desde IPs confiables

  Outbound:
  - Permitir todo (inicialmente)
  ```

---

### 7️⃣ CI/CD Y AUTOMATIZACIÓN 🔄

#### GitHub Actions (Recomendado)

- [ ] **Crear workflow de deploy:**
  ```yaml
  # .github/workflows/deploy-oracle.yml
  name: Deploy to Oracle Cloud
  on:
    push:
      branches: [main]
  jobs:
    deploy:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v3
        - name: Deploy to Oracle
          # SSH a Oracle Cloud y pull + restart
  ```

#### Scripts de Deploy

- [ ] **Crear script de deploy automático:**
  ```bash
  # scripts/deploy-oracle.sh
  #!/bin/bash
  docker-compose pull
  docker-compose up -d --remove-orphans
  docker system prune -f
  ```

---

### 8️⃣ PERFORMANCE Y OPTIMIZACIÓN ⚡

#### Frontend

- [x] ✅ Lighthouse Score: 85-95/100 (estimado)
- [x] ✅ Core Web Vitals optimizados
- [x] ✅ Lazy loading implementado
- [x] ✅ WebP images
- [x] ✅ Brotli + Gzip compression

#### Backend

- [ ] **Connection pooling configurado**
- [ ] **Query optimization:**
  - [ ] Índices en campos frecuentemente consultados
  - [ ] Paginación en listados grandes

- [ ] **Caching strategy:**
  - [ ] Redis para sesiones
  - [ ] Redis para catálogo productos (TTL 5min)
  - [ ] CDN para assets estáticos (opcional)

---

### 9️⃣ TESTING Y VALIDACIÓN 🧪

#### Pre-Deploy Testing

- [ ] **Ejecutar tests:**

  ```bash
  # 22 tests detectados
  npm test  # En cada servicio
  ```

- [ ] **Smoke tests:**
  - [ ] Health checks de todos los servicios
  - [ ] Login/Register flow
  - [ ] Ver catálogo de productos
  - [ ] Agregar al carrito
  - [ ] Proceso de checkout

#### Post-Deploy Validation

- [ ] **Verificar servicios levantados:**

  ```bash
  docker-compose ps
  docker-compose logs --tail=50
  ```

- [ ] **Verificar endpoints principales:**

  ```bash
  curl -I https://tu-dominio.com
  curl https://tu-dominio.com/api/health
  curl https://tu-dominio.com/api/products
  ```

- [ ] **Monitorear logs primeras 24h:**
  - Errores 500
  - Timeouts
  - Database connection errors

---

### 🔟 BACKUP Y DISASTER RECOVERY 💾

#### Backup Strategy

- [ ] **Configurar backups automáticos:**
  - [ ] PostgreSQL: diario (7 días retención)
  - [ ] MongoDB: diario (7 días retención)
  - [ ] Imágenes subidas: semanal
  - [ ] Código: Git + Oracle Object Storage

#### Disaster Recovery Plan

- [ ] **Documentar proceso de restauración:**
  1. Levantar servicios desde docker-compose
  2. Restaurar databases desde backup
  3. Verificar integridad de datos
  4. Validar funcionamiento

- [ ] **Backup de configuración:**
  ```bash
  # Guardar todos los .env
  tar -czf config-backup.tar.gz .env* microservices/**/.env
  ```

---

## 🚀 COMANDOS ÚTILES PARA DEPLOY

### Pre-Deploy

```bash
# 1. Crear backup completo
./scripts/backup-before-deploy.sh

# 2. Build de todos los servicios
docker-compose build

# 3. Verificar imágenes
docker images | grep flores-victoria

# 4. Test de servicios localmente
docker-compose up -d
docker-compose ps
```

### Deploy en Oracle Cloud

```bash
# 1. Conectar a Oracle Cloud
ssh opc@<oracle-ip>

# 2. Clonar repositorio
git clone https://github.com/laloaggro/Flores-Victoria-.git
cd Flores-Victoria-

# 3. Configurar variables de entorno
cp .env.example .env.production
nano .env.production  # Editar credenciales

# 4. Levantar servicios
docker-compose -f docker-compose.yml up -d

# 5. Verificar
docker-compose ps
docker-compose logs -f --tail=100
```

### Monitoreo Post-Deploy

```bash
# Ver logs en tiempo real
docker-compose logs -f

# Ver recursos
docker stats

# Ver health checks
docker ps --format "table {{.Names}}\t{{.Status}}"

# Reiniciar servicio específico
docker-compose restart <servicio>
```

---

## ⚠️ PROBLEMAS COMUNES Y SOLUCIONES

### 1. Servicio no levanta

```bash
# Ver logs detallados
docker-compose logs <servicio> --tail=200

# Verificar variables de entorno
docker-compose config

# Reiniciar desde cero
docker-compose down -v
docker-compose up -d
```

### 2. Database connection errors

```bash
# Verificar que DB esté lista
docker-compose exec postgres pg_isready
docker-compose exec mongodb mongo --eval "db.adminCommand('ping')"

# Verificar red
docker network inspect flores-victoria_app-network
```

### 3. Out of memory

```bash
# Ver uso de memoria
docker stats --no-stream

# Limpiar recursos no usados
docker system prune -a

# Ajustar límites en docker-compose.yml
```

---

## 📝 NOTAS FINALES

### Recursos Oracle Cloud Recomendados

- **Compute:** VM.Standard.E3.Flex (2 OCPU, 16GB RAM mínimo)
- **Storage:** Block Volume 100GB para datos
- **Network:** Public IP + Load Balancer
- **Backup:** Object Storage para backups automáticos

### Costos Estimados (Free Tier)

- Compute: ✅ Incluido en Free Tier (ARM Ampere)
- Storage: ✅ 200GB Object Storage gratis
- Network: ✅ 10TB egress gratis al mes
- Load Balancer: Aprox $15-20/mes (si se usa)

### Timeline de Deploy

- **Pre-configuración:** 2-3 horas
- **Deploy inicial:** 1 hora
- **Testing y ajustes:** 2-4 horas
- **Monitoreo post-deploy:** 24-48 horas

---

## ✅ CHECKLIST FINAL

Antes de hacer `docker-compose up -d` en Oracle Cloud:

- [ ] ✅ Todos los .env revisados y actualizados
- [ ] ✅ JWT_SECRET con valor seguro aleatorio
- [ ] ✅ Passwords de DB cambiados
- [ ] ✅ Backup de datos actuales hecho
- [ ] ✅ DNS configurado
- [ ] ✅ SSL/TLS certificado instalado
- [ ] ✅ Firewall configurado
- [ ] ✅ Monitoring activo (Prometheus/Grafana)
- [ ] ✅ Logs centralizados configurados
- [ ] ✅ Tests ejecutados satisfactoriamente
- [ ] ✅ Plan de rollback documentado

---

**¡Listo para deployar! 🚀**

Para cualquier duda, revisar:

- README.md
- DEVELOPMENT_GUIDE.md
- Documentación de Oracle Cloud
