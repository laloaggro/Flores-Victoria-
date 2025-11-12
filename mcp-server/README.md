# 🌺 MCP Server (Model Context Protocol)

> Sistema de monitoreo, auditoría y gestión de contexto para microservicios

[![Status](https://img.shields.io/badge/status-active-success.svg)]()
[![Docker](https://img.shields.io/badge/docker-ready-blue.svg)]()
[![Node](https://img.shields.io/badge/node-18.x-green.svg)]()
[![License](https://img.shields.io/badge/license-MIT-blue.svg)]()

---

## 📋 Descripción

Servidor MCP para:

- 📊 **Monitoreo en tiempo real** de microservicios
- 📝 **Auditoría y trazabilidad** de acciones
- 📈 **Métricas y estadísticas** del sistema
- 🎨 **Dashboard interactivo** con Chart.js
- 🔔 **Alertas** de servicios caídos
- 📡 **Integración Prometheus** para observabilidad

---

## ✨ Características

### Dashboard Web

- ✅ Gráficos interactivos con Chart.js
- ✅ Stats en tiempo real (servicios, eventos, auditorías)
- ✅ Lista de últimos eventos y auditorías
- ✅ Auto-refresh cada 30 segundos
- ✅ Protegido con Basic Auth

### API REST

- ✅ Endpoints para registrar eventos
- ✅ Sistema de auditoría
- ✅ Health checks de servicios
- ✅ Métricas en formato JSON
- ✅ Métricas para Prometheus

### Integración

- ✅ Helper para microservicios
- ✅ Compatible con Docker
- ✅ Ready para Prometheus/Grafana
- ✅ Alertas configurables

---

## 🚀 Instalación

### Usando Docker (Recomendado)

```bash
# Ya está configurado en docker-compose.yml
docker-compose up -d mcp-server
```

### Local

```bash
cd mcp-server
npm install
npm start
```

---

## 📖 Uso

### Acceder al Dashboard

```bash
# URL
http://localhost:5050/

# Credenciales
Usuario: admin
Contraseña: changeme
```

### Generar Datos de Prueba

```bash
npm run generate-data
```

### Ver Métricas

```bash
# JSON
curl http://localhost:5050/metrics | jq '.'

# Prometheus
curl http://localhost:5050/metrics/prometheus

# Health Check
curl http://localhost:5050/health
```

---

## 🔌 Endpoints

### Públicos

| Endpoint              | Método | Descripción               |
| --------------------- | ------ | ------------------------- |
| `/health`             | GET    | Health check del servidor |
| `/metrics`            | GET    | Métricas en formato JSON  |
| `/metrics/prometheus` | GET    | Métricas para Prometheus  |

### Protegidos (Basic Auth)

| Endpoint          | Método | Descripción               |
| ----------------- | ------ | ------------------------- |
| `/`               | GET    | Dashboard web             |
| `/check-services` | GET    | Health check de servicios |
| `/context`        | GET    | Contexto completo         |

### API para Microservicios

| Endpoint    | Método | Descripción             |
| ----------- | ------ | ----------------------- |
| `/events`   | POST   | Registrar evento        |
| `/audit`    | POST   | Registrar auditoría     |
| `/tasks`    | POST   | Ejecutar tarea          |
| `/register` | POST   | Registrar modelo/agente |
| `/clear`    | POST   | Limpiar contexto        |

---

## 💻 Integración con Microservicios

### Importar el Helper

```javascript
const { registerAudit, registerEvent } = require('./mcp-helper');
```

### Registrar Eventos

```javascript
// Evento simple
await registerEvent('product_viewed', {
  productId: 123,
  category: 'rosas',
});

// Evento con más datos
await registerEvent('order_created', {
  orderId: 456,
  userId: 789,
  total: 150.5,
  items: 3,
});
```

### Registrar Auditorías

```javascript
await registerAudit(
  'user_login', // Acción
  'auth-service', // Agente/Servicio
  'Login exitoso' // Detalles
);

await registerAudit(
  'product_deleted',
  'admin-panel',
  'Producto ID 123 eliminado por admin@flores.com'
);
```

---

## 📊 Métricas Prometheus

### Métricas Disponibles

```prometheus
# Servicios
mcp_healthy_services          # Servicios saludables
mcp_total_services            # Total de servicios
mcp_unhealthy_services        # Servicios caídos
mcp_service_status{service}   # Estado por servicio (1=up, 0=down)

# Eventos y Auditorías
mcp_events_count              # Total de eventos
mcp_audits_count              # Total de auditorías

# Sistema
mcp_uptime_percent            # Porcentaje de disponibilidad
mcp_tests_status              # Tests pasando
```

### Configuración Prometheus

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'mcp-server'
    static_configs:
      - targets: ['mcp-server:5050']
    metrics_path: '/metrics/prometheus'
    scrape_interval: 15s
```

---

## 🔔 Alertas

### Configuración de Alertas (alerts.yml)

```yaml
groups:
  - name: mcp_alerts
    rules:
      - alert: ServiciosInactivos
        expr: mcp_unhealthy_services > 0
        for: 2m

      - alert: UptimeBajo
        expr: mcp_uptime_percent < 80
        for: 5m

      - alert: SinEventosRecientes
        expr: rate(mcp_events_count[5m]) == 0
        for: 10m
```

---

## 📁 Estructura de Archivos

```
mcp-server/
├── server.js                  # Servidor Express principal
├── dashboard.html             # Dashboard web con Chart.js
├── health-check.js            # Health checks de servicios
├── notifier.js                # Sistema de notificaciones
├── generate-test-data.js      # Script de datos de prueba
├── package.json               # Dependencias
├── Dockerfile                 # Imagen Docker
├── prometheus.yml             # Config Prometheus
├── alerts.yml                 # Reglas de alerta
├── grafana-dashboard.json     # Dashboard Grafana
└── README.md                  # Esta documentación
```

---

## 🎨 Dashboard Features

### Stats Dashboard

- **Servicios Activos:** Número de servicios saludables
- **Eventos Totales:** Total de eventos registrados
- **Auditorías:** Total de auditorías
- **Uptime:** Porcentaje de disponibilidad

### Gráficos

- **Eventos:** Actividad de eventos (últimas 24h)
- **Respuesta:** Tiempos de respuesta en tiempo real
- **Servicios:** Estado de cada microservicio

### Listas

- **Últimos 10 eventos:** Con tipo, servicio y datos
- **Últimas 10 auditorías:** Con acción, agente y detalles

---

## 🛠️ Comandos Útiles

```bash
# Desarrollo
npm run dev                     # Modo desarrollo con nodemon

# Producción
npm start                       # Iniciar servidor

# Testing
npm run generate-data           # Generar datos de prueba

# Docker
docker-compose up -d mcp-server # Iniciar contenedor
docker logs -f mcp-server       # Ver logs en tiempo real
docker exec -it mcp-server sh   # Acceder al contenedor

# Métricas
curl localhost:5050/metrics | jq '.'              # Ver métricas JSON
curl localhost:5050/metrics/prometheus            # Ver métricas Prometheus
curl localhost:5050/health                        # Health check
```

---

## 🔧 Variables de Entorno

```bash
# Puerto del servidor
PORT=5050

# Autenticación del dashboard
MCP_DASHBOARD_USER=admin
MCP_DASHBOARD_PASS=changeme

# Entorno
NODE_ENV=production
```

---

## 📈 Roadmap

### Implementado ✅

- [x] Dashboard con Chart.js
- [x] Métricas Prometheus
- [x] Sistema de eventos y auditorías
- [x] Health checks de servicios
- [x] Generación de datos de prueba
- [x] Gráficos en tiempo real

### Próximas Features 🚀

- [ ] Persistencia en MongoDB
- [ ] Integración con Grafana
- [ ] Notificaciones Slack/Discord
- [ ] Webhooks para eventos
- [ ] Reportes automáticos
- [ ] Dashboard móvil
- [ ] Autenticación JWT
- [ ] Rate limiting

---

## 🤝 Integración Actual

### Microservicios Conectados

- ✅ api-gateway
- ✅ auth-service
- ✅ user-service
- ✅ product-service
- ✅ cart-service
- ✅ order-service
- ✅ review-service
- ✅ wishlist-service
- ✅ contact-service

---

## 📝 Ejemplos de Uso

### Registrar Evento de Producto Visto

```javascript
await registerEvent('product_viewed', {
  productId: 123,
  productName: 'Rosa Roja Premium',
  category: 'rosas',
  userId: 789,
});
```

### Registrar Auditoría de Login

```javascript
await registerAudit(
  'user_login',
  'auth-service',
  `Usuario admin@flores.com inició sesión desde IP 192.168.1.100`
);
```

### Obtener Métricas desde JavaScript

```javascript
const response = await fetch('http://mcp-server:5050/metrics');
const metrics = await response.json();

console.log(`Servicios activos: ${metrics.healthyServices}`);
console.log(`Uptime: ${metrics.uptime}%`);
```

---

## 🐛 Troubleshooting

### El dashboard no carga

```bash
# Verificar que el servidor está corriendo
docker ps | grep mcp-server

# Ver logs
docker logs mcp-server

# Verificar puerto
curl http://localhost:5050/health
```

### No aparecen eventos

```bash
# Generar datos de prueba
cd mcp-server && npm run generate-data

# Verificar contexto
curl http://localhost:5050/context | jq '.context.events'
```

### Error de autenticación

```bash
# Credenciales por defecto
Usuario: admin
Contraseña: changeme

# Cambiar contraseña (docker-compose.yml)
environment:
  - MCP_DASHBOARD_USER=admin
  - MCP_DASHBOARD_PASS=nueva_contraseña
```

---

## 📄 Licencia

MIT License - Ver [LICENSE](../LICENSE) para más detalles

---

## 👨‍💻 Autor

**laloaggro**

- GitHub: [@laloaggro](https://github.com/laloaggro)
- Proyecto: Flores Victoria

---

## 🔗 Enlaces

- [Dashboard](http://localhost:5050/)
- [Métricas](http://localhost:5050/metrics)
- [Prometheus](http://localhost:5050/metrics/prometheus)
- [Health](http://localhost:5050/health)
- [Documentación Completa](../MCP_MEJORAS_IMPLEMENTADAS.md)

---

**Última actualización:** 9 de noviembre de 2025  
**Versión:** 2.0.0 (Con Chart.js y métricas mejoradas)
