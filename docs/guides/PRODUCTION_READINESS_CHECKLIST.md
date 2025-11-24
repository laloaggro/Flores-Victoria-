# 🚀 Production Readiness Checklist - Flores Victoria

Checklist completo para deployment a producción.

---

## ✅ 1. Security Audit

### Environment Variables

- [x] `.env` files en `.gitignore`
- [ ] Secrets en AWS Secrets Manager / Vault (producción)
- [x] `JWT_SECRET` único y seguro (64+ caracteres)
- [ ] Database passwords rotados
- [ ] API keys en variables de entorno

### Authentication & Authorization

- [x] JWT tokens implementados
- [x] Token expiration configurado (24h)
- [ ] Refresh token flow (opcional)
- [x] Role-based access control (RBAC)
- [x] Password hashing con bcrypt (salt rounds: 10)
- [ ] Rate limiting en login endpoints (5 req/min)

### Network Security

- [x] CORS configurado apropiadamente
- [x] Helmet.js implementado
- [ ] HTTPS/TLS en producción
- [ ] WAF (Web Application Firewall) configurado
- [ ] DDoS protection habilitado

### Input Validation

- [x] express-validator en todos los endpoints
- [x] SQL injection prevention (parameterized queries)
- [x] XSS prevention (express-sanitizer)
- [ ] CSRF protection tokens
- [x] File upload validation (tipo, tamaño)

### API Security

- [x] Rate limiting global (100 req/min)
- [x] Rate limiting específico por endpoint
- [ ] API versioning (/api/v1/)
- [ ] Request size limits
- [ ] Timeout configurations

**Actions Required:**

```bash
# 1. Generar nuevo JWT_SECRET para producción
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# 2. Configurar secrets en AWS
aws secretsmanager create-secret \
  --name flores-victoria/production/jwt-secret \
  --secret-string "nuevo_secret_generado"

# 3. Habilitar HTTPS con Let's Encrypt
sudo certbot --nginx -d flores-victoria.com -d www.flores-victoria.com
```

---

## ✅ 2. Performance Benchmarks

### Database Performance

- [x] PostgreSQL indexes creados
- [x] MongoDB indexes creados
- [x] Connection pooling configurado
- [x] Query optimization aplicada
- [ ] Database read replicas (alta disponibilidad)

### Caching Strategy

- [x] Redis caching implementado
- [x] Cache TTL definidos
- [x] Cache invalidation strategy
- [x] Cache hit rate monitoring

### Load Testing Results

- [ ] Artillery tests ejecutados
- [ ] K6 tests ejecutados
- [ ] P95 < 500ms verificado
- [ ] Throughput > 1000 req/s verificado

**Run Load Tests:**

```bash
# 1. Instalar Artillery
npm install -g artillery

# 2. Crear test básico
cat > load-test.yml << 'EOF'
config:
  target: 'http://localhost:3002'
  phases:
    - duration: 60
      arrivalRate: 50
scenarios:
  - flow:
      - get:
          url: "/api/products"
EOF

# 3. Ejecutar test
artillery run load-test.yml

# 4. Analizar resultados
# - Verificar P95 < 500ms
# - Verificar error rate < 1%
# - Verificar throughput objetivo
```

---

## ✅ 3. Backup Strategies

### Database Backups

**PostgreSQL:**

```bash
# Script de backup automático
cat > /scripts/backup-postgres.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/postgres"
mkdir -p $BACKUP_DIR

# Backup
pg_dump -U admin -d flores_victoria -F c -b -v \
  -f "$BACKUP_DIR/flores_victoria_$DATE.backup"

# Retention: 7 días
find $BACKUP_DIR -type f -mtime +7 -delete

# Upload a S3
aws s3 cp "$BACKUP_DIR/flores_victoria_$DATE.backup" \
  s3://flores-victoria-backups/postgres/
EOF

chmod +x /scripts/backup-postgres.sh

# Cron job (diario a las 2 AM)
echo "0 2 * * * /scripts/backup-postgres.sh" | crontab -
```

**MongoDB:**

```bash
# Script de backup automático
cat > /scripts/backup-mongodb.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/mongodb"
mkdir -p $BACKUP_DIR

# Backup
mongodump --uri="mongodb://admin:admin123@localhost:27017/flores_victoria" \
  --out="$BACKUP_DIR/$DATE"

# Comprimir
tar -czf "$BACKUP_DIR/mongodb_$DATE.tar.gz" "$BACKUP_DIR/$DATE"
rm -rf "$BACKUP_DIR/$DATE"

# Retention: 7 días
find $BACKUP_DIR -type f -mtime +7 -delete

# Upload a S3
aws s3 cp "$BACKUP_DIR/mongodb_$DATE.tar.gz" \
  s3://flores-victoria-backups/mongodb/
EOF

chmod +x /scripts/backup-mongodb.sh
echo "0 3 * * * /scripts/backup-mongodb.sh" | crontab -
```

**Redis:**

```bash
# Backup RDB file
cat > /scripts/backup-redis.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/redis"
mkdir -p $BACKUP_DIR

# Trigger BGSAVE
redis-cli BGSAVE

# Esperar a que termine
sleep 10

# Copiar dump.rdb
cp /var/lib/redis/dump.rdb "$BACKUP_DIR/dump_$DATE.rdb"

# Upload a S3
aws s3 cp "$BACKUP_DIR/dump_$DATE.rdb" \
  s3://flores-victoria-backups/redis/

# Retention: 3 días
find $BACKUP_DIR -type f -mtime +3 -delete
EOF

chmod +x /scripts/backup-redis.sh
echo "0 4 * * * /scripts/backup-redis.sh" | crontab -
```

### Disaster Recovery Plan

**RTO (Recovery Time Objective):** 1 hora **RPO (Recovery Point Objective):** 24 horas

**Recovery Steps:**

1. Restore databases desde último backup
2. Restart servicios
3. Verify data integrity
4. Run health checks
5. Monitor errors

---

## ✅ 4. Monitoring & Alerts

### Prometheus Alerts

```yaml
# monitoring/prometheus/alerts.yml
groups:
  - name: flores_victoria_alerts
    interval: 30s
    rules:
      # High error rate
      - alert: HighErrorRate
        expr: |
          sum(rate(http_requests_total{status=~"5.."}[5m])) by (service)
          /
          sum(rate(http_requests_total[5m])) by (service)
          > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: 'High error rate on {{ $labels.service }}'
          description: 'Error rate is {{ $value }}%'

      # High response time
      - alert: HighResponseTime
        expr: |
          histogram_quantile(0.95,
            rate(http_request_duration_seconds_bucket[5m])
          ) > 1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: 'High response time'
          description: 'P95 latency is {{ $value }}s'

      # Database down
      - alert: DatabaseDown
        expr: up{job="postgres"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: 'PostgreSQL is down'

      - alert: MongoDBDown
        expr: up{job="mongodb"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: 'MongoDB is down'

      # High memory usage
      - alert: HighMemoryUsage
        expr: |
          (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes)
          /
          node_memory_MemTotal_bytes > 0.9
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: 'High memory usage'
          description: 'Memory usage is {{ $value }}%'

      # Disk space low
      - alert: DiskSpaceLow
        expr: |
          (node_filesystem_avail_bytes{mountpoint="/"}
          /
          node_filesystem_size_bytes{mountpoint="/"}) < 0.1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: 'Low disk space'
          description: 'Only {{ $value }}% available'
```

### Alertmanager Configuration

```yaml
# monitoring/alertmanager/alertmanager.yml
global:
  resolve_timeout: 5m
  smtp_smarthost: 'smtp.gmail.com:587'
  smtp_from: 'alerts@flores-victoria.com'
  smtp_auth_username: 'alerts@flores-victoria.com'
  smtp_auth_password: 'password'

route:
  receiver: 'team-email'
  group_by: ['alertname', 'cluster', 'service']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 12h
  routes:
    - match:
        severity: critical
      receiver: 'team-pagerduty'
      continue: true
    - match:
        severity: warning
      receiver: 'team-slack'

receivers:
  - name: 'team-email'
    email_configs:
      - to: 'team@flores-victoria.com'
        headers:
          Subject: '[ALERT] {{ .GroupLabels.alertname }}'

  - name: 'team-pagerduty'
    pagerduty_configs:
      - service_key: 'YOUR_PAGERDUTY_KEY'

  - name: 'team-slack'
    slack_configs:
      - api_url: 'YOUR_SLACK_WEBHOOK'
        channel: '#alerts'
        title: 'Alert: {{ .GroupLabels.alertname }}'
        text: '{{ range .Alerts }}{{ .Annotations.description }}{{ end }}'
```

---

## ✅ 5. Logging Strategy

### Centralized Logging

**Install:**

```bash
# Instalar winston en todos los servicios
npm install winston winston-daily-rotate-file
```

**Logger Configuration:**

```javascript
// shared/logger/index.js
const winston = require('winston');
require('winston-daily-rotate-file');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: process.env.SERVICE_NAME || 'unknown-service',
  },
  transports: [
    // Console (development)
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
    }),

    // File (production)
    new winston.transports.DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxSize: '20m',
      maxFiles: '14d',
    }),

    new winston.transports.DailyRotateFile({
      filename: 'logs/combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
    }),
  ],
});

module.exports = logger;
```

**Usage:**

```javascript
const logger = require('./shared/logger');

logger.info('User logged in', { userId: '123', ip: req.ip });
logger.error('Database connection failed', { error: err.message });
logger.warn('High memory usage detected', { usage: '85%' });
```

---

## ✅ 6. Docker Production Setup

### Production docker-compose

```yaml
# docker-compose.production.yml
version: '3.8'

services:
  # Services con resource limits
  cart-service:
    image: ghcr.io/your-org/cart-service:latest
    restart: always
    mem_limit: 512m
    cpus: '0.5'
    environment:
      NODE_ENV: production
    logging:
      driver: 'json-file'
      options:
        max-size: '10m'
        max-file: '3'
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:3001/health']
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # Similar para otros servicios...

  # Databases con backups
  postgres:
    image: postgres:15-alpine
    restart: always
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups/postgres:/backups
    mem_limit: 2g
    cpus: '2.0'

  # Nginx reverse proxy
  nginx:
    image: nginx:alpine
    restart: always
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
    depends_on:
      - cart-service
      - product-service
      - auth-service
      - user-service
      - order-service

volumes:
  postgres_data:
  mongodb_data:
  redis_data:
```

### Nginx Configuration

```nginx
# nginx/nginx.conf
upstream backend {
  least_conn;
  server cart-service:3001 max_fails=3 fail_timeout=30s;
  server product-service:3002 max_fails=3 fail_timeout=30s;
  server auth-service:3003 max_fails=3 fail_timeout=30s;
  server user-service:3004 max_fails=3 fail_timeout=30s;
  server order-service:3005 max_fails=3 fail_timeout=30s;
}

server {
  listen 80;
  server_name flores-victoria.com www.flores-victoria.com;

  # Redirect HTTP to HTTPS
  return 301 https://$server_name$request_uri;
}

server {
  listen 443 ssl http2;
  server_name flores-victoria.com www.flores-victoria.com;

  # SSL certificates
  ssl_certificate /etc/nginx/ssl/fullchain.pem;
  ssl_certificate_key /etc/nginx/ssl/privkey.pem;
  ssl_protocols TLSv1.2 TLSv1.3;
  ssl_ciphers HIGH:!aNULL:!MD5;

  # Security headers
  add_header X-Frame-Options "SAMEORIGIN" always;
  add_header X-Content-Type-Options "nosniff" always;
  add_header X-XSS-Protection "1; mode=block" always;
  add_header Strict-Transport-Security "max-age=31536000" always;

  # Gzip compression
  gzip on;
  gzip_vary on;
  gzip_types text/plain text/css application/json application/javascript;

  # API proxy
  location /api/ {
    proxy_pass http://backend;
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
    root /usr/share/nginx/html;
    try_files $uri $uri/ /index.html;
  }

  # Static assets caching
  location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }
}
```

---

## ✅ 7. CI/CD Pipeline Verification

- [x] GitHub Actions workflows creados
- [x] Lint checks configurados
- [x] Unit tests en CI
- [x] Security scanning (npm audit)
- [x] Docker build & push
- [ ] Integration tests en staging
- [ ] Smoke tests post-deployment
- [ ] Automatic rollback on failure

---

## ✅ 8. Documentation Review

- [x] API_COMPLETE_REFERENCE.md
- [x] ARCHITECTURE_OVERVIEW.md
- [x] TROUBLESHOOTING_GUIDE.md
- [x] FRONTEND_INTEGRATION_GUIDE.md
- [x] CI_CD_GUIDE.md
- [x] PERFORMANCE_OPTIMIZATION_GUIDE.md
- [x] PRODUCTION_READINESS_CHECKLIST.md
- [ ] README.md actualizado
- [ ] CHANGELOG.md creado
- [ ] API documentation en Swagger/OpenAPI

---

## ✅ 9. Pre-Launch Checklist

### 1 Week Before Launch

- [ ] Load testing completado
- [ ] Security audit realizado
- [ ] Backup strategy probada
- [ ] Monitoring alerts configurados
- [ ] Rollback plan documentado
- [ ] Team training completado

### 1 Day Before Launch

- [ ] Freeze code (no más cambios)
- [ ] Full system backup
- [ ] Verify all secrets rotados
- [ ] DNS configurado
- [ ] SSL certificates válidos
- [ ] CDN configurado

### Launch Day

- [ ] Deploy a producción
- [ ] Verify health checks
- [ ] Monitor error rates
- [ ] Check response times
- [ ] Verify database connections
- [ ] Test critical user flows
- [ ] Monitor resource usage

### Post-Launch (First 24h)

- [ ] Monitor continuously
- [ ] Check error logs
- [ ] Verify backups running
- [ ] Test alerts funcionando
- [ ] Collect performance metrics
- [ ] User feedback

---

## 📊 Production Metrics

### SLA Targets

- **Uptime:** 99.9% (8.76 horas downtime/año)
- **Response Time (P95):** < 500ms
- **Error Rate:** < 0.1%
- **Database Uptime:** 99.95%

### Monitoring Dashboards

- [x] Microservices overview (Grafana)
- [x] Database monitoring (Grafana)
- [x] Error tracking (Grafana)
- [ ] Business metrics (orders, revenue, users)
- [ ] Customer-facing status page

---

**Production Readiness Checklist v1.0** | Ready for Launch! 🚀
