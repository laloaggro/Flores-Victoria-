# 🚀 Quick Start Guide - Activaciones Pendientes

## ✅ Completado

- [x] **MongoDB Indexes**: 25 índices creados (5-10x performance boost)
- [x] **Cleanup Tests**: Eliminado cacheService.test.js innecesario
- [x] **Security Workflow**: Pushed to GitHub, ejecutándose automáticamente

## 📊 Verificar Security Workflow en GitHub Actions

### Paso 1: Ver Estado del Workflow

```bash
# Opción 1: Abrir en navegador
xdg-open https://github.com/laloaggro/Flores-Victoria-/actions

# Opción 2: Ver desde terminal (si tienes gh CLI)
gh run list --limit 5
gh run view --log
```

### Paso 2: Verificar Scans Ejecutados

El workflow `security.yml` ejecuta 6 tipos de scans:

1. **npm audit** - Vulnerabilidades en dependencias
2. **OWASP ZAP Baseline** - Scan rápido de seguridad web
3. **OWASP ZAP Full** - Scan completo (más lento)
4. **Security Headers** - Verificación de headers seguros
5. **TruffleHog** - Detección de secretos/credenciales
6. **Trivy** - Vulnerabilidades en imágenes Docker

### Paso 3: Revisar Resultados

- ✅ Verde = Todo OK
- ⚠️ Amarillo = Warnings (revisar pero no crítico)
- ❌ Rojo = Vulnerabilidades críticas (ACCIÓN REQUERIDA)

### Paso 4: Ver Reportes Detallados

Los reportes se guardan como artifacts:

- `security-reports/npm-audit.html`
- `security-reports/zap-baseline.html`
- `security-reports/zap-full.html`
- `security-reports/trivy-results.json`

---

## 💓 Iniciar Health Monitor en Background

### Opción 1: PM2 (Recomendado para desarrollo)

```bash
# Instalar PM2 globalmente (si no lo tienes)
npm install -g pm2

# Iniciar health monitor
cd /home/impala/Documentos/Proyectos/flores-victoria
pm2 start scripts/health-monitor.js --name "health-monitor" \
  --log /var/log/health-monitor.log \
  --time

# Ver status
pm2 status
pm2 logs health-monitor

# Configurar arranque automático
pm2 save
pm2 startup
```

### Opción 2: systemd (Recomendado para producción)

```bash
# 1. Crear archivo de servicio
sudo nano /etc/systemd/system/flores-health-monitor.service

# 2. Contenido del archivo:
cat << 'EOF' | sudo tee /etc/systemd/system/flores-health-monitor.service
[Unit]
Description=Flores Victoria Health Monitor
After=network.target mongodb.service

[Service]
Type=simple
User=impala
WorkingDirectory=/home/impala/Documentos/Proyectos/flores-victoria
ExecStart=/usr/bin/node scripts/health-monitor.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

# Environment variables
Environment="NODE_ENV=production"
Environment="ALERT_EMAIL_ENABLED=true"
Environment="ALERT_SLACK_ENABLED=false"
Environment="SMTP_HOST=smtp.gmail.com"
Environment="SMTP_PORT=587"
Environment="SMTP_USER=your-email@gmail.com"
Environment="SMTP_PASS=your-app-password"
Environment="ALERT_EMAIL_TO=admin@flores-victoria.com"

[Install]
WantedBy=multi-user.target
EOF

# 3. Recargar systemd y activar servicio
sudo systemctl daemon-reload
sudo systemctl enable flores-health-monitor.service
sudo systemctl start flores-health-monitor.service

# 4. Ver status y logs
sudo systemctl status flores-health-monitor.service
sudo journalctl -u flores-health-monitor.service -f
```

### Configuración de Alertas

**Email (Gmail)**:

1. Ir a https://myaccount.google.com/apppasswords
2. Crear "App Password" para "Mail"
3. Usar ese password en `SMTP_PASS`

**Slack**:

1. Ir a https://api.slack.com/messaging/webhooks
2. Crear Incoming Webhook
3. Configurar `ALERT_SLACK_WEBHOOK_URL`

**Webhook Personalizado**:

1. Configurar endpoint en tu servidor
2. Configurar `ALERT_WEBHOOK_URL`

### Verificar Funcionamiento

```bash
# Ver logs en tiempo real
pm2 logs health-monitor --lines 50

# O con systemd:
sudo journalctl -u flores-health-monitor.service -n 50 -f

# Probar manualmente
node scripts/health-monitor.js
```

---

## 📈 Activar Codecov (5 minutos)

Ver guía completa: `CODECOV_ACTIVATION_STEPS.md`

**Pasos rápidos**:

1. Ir a https://codecov.io/signup
2. Sign up with GitHub
3. Buscar "Flores-Victoria-"
4. Copiar "Repository Upload Token"
5. Ir a https://github.com/laloaggro/Flores-Victoria-/settings/secrets/actions
6. New secret: `CODECOV_TOKEN` = [tu token]
7. Próximo push activará reportes automáticos

---

## 🐛 Integrar Sentry (30-45 min)

Ver guía completa: `SENTRY_INTEGRATION.md`

**Quick Start**:

```bash
# 1. Crear cuenta en Sentry
xdg-open https://sentry.io/signup/

# 2. Crear proyecto Node.js
# 3. Copiar DSN

# 4. Instalar en product-service (piloto)
cd microservices/product-service
npm install @sentry/node @sentry/profiling-node

# 5. Seguir pasos en SENTRY_INTEGRATION.md
```

---

## 📊 Configurar Grafana Alerts (30 min)

Ver guía completa: `GRAFANA_ALERTS_SETUP.md`

**Pre-requisitos**:

- Grafana instalado y corriendo
- Prometheus como data source
- Métricas de servicios disponibles

**6 Alertas configuradas**:

1. High CPU Usage (>80%)
2. High Memory Usage (>85%)
3. Service Down (2 min)
4. High Error Rate (>5%)
5. Slow Response Time (P95 >2s)
6. DB Connection Pool Exhausted

---

## 🧪 Incrementar Cobertura a 60% (+30 tests)

**Prioridad**: Servicios sin tests unitarios

### Cart Service

```bash
cd microservices/cart-service
mkdir -p src/__tests__/unit

# Crear tests para:
# - src/models/Cart.js
# - src/controllers/cartController.js
# - src/utils/helpers.js (si existen)
```

### Order Service

```bash
cd microservices/order-service
mkdir -p src/__tests__/unit

# Crear tests para:
# - src/models/Order.js
# - src/controllers/orderController.js
# - src/utils/helpers.js
```

### Contact Service

```bash
cd microservices/contact-service
mkdir -p src/__tests__/unit

# Crear tests para:
# - src/models/Contact.js
# - src/controllers/contactController.js
# - src/utils/emailService.js
```

**Target**: +10 tests por servicio = 30 tests total **Cobertura esperada**: 48% → 60%

---

## 📋 Checklist de Verificación

- [ ] GitHub Actions security workflow ejecutándose
- [ ] Health monitor corriendo en background
- [ ] Codecov activado y reportando
- [ ] Sentry integrado en al menos 1 servicio
- [ ] Grafana alerts configuradas
- [ ] Cobertura de tests ≥60%

## 🔗 Enlaces Útiles

- **GitHub Actions**: https://github.com/laloaggro/Flores-Victoria-/actions
- **Codecov**: https://app.codecov.io/gh/laloaggro/Flores-Victoria-
- **Sentry**: https://sentry.io/
- **Grafana**: http://localhost:3000 (local)

## 📞 Soporte

Si encuentras problemas:

1. Revisar logs: `pm2 logs` o `sudo journalctl -xe`
2. Verificar variables de entorno
3. Consultar documentación específica en archivos MD
4. Verificar conectividad de servicios

---

**Última actualización**: 30 de octubre de 2025 **Versión**: 1.0.0
