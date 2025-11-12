# 🌺 Admin Control Center - Guía de Navegación

## 📊 Panel Principal

**URL:** http://localhost:3010/

### Dashboard Unificado

El nuevo dashboard es el centro de control que conecta todas las herramientas y secciones
administrativas.

---

## 🔗 Enlaces Principales

### 1. Monitoreo & Analytics

#### MCP Server Dashboard

- **URL:** http://localhost:5050/
- **Embebido:** http://localhost:3010/mcp-embedded.html
- **Credenciales:** admin / changeme
- **Descripción:** Dashboard completo con Chart.js, métricas en tiempo real, eventos y auditorías

#### Servicios Docker

- **URL:** http://localhost:3010/services/
- **Descripción:** Gestión de contenedores Docker (Start/Stop/Restart/Logs)
- **Servicios:** 20 microservicios monitoreados

#### Health Checks

- **URL:** http://localhost:3010/monitoring.html
- **Descripción:** Verificación de estado de servicios

#### Logs del Sistema

- **URL:** http://localhost:3010/logs.html
- **Descripción:** Visualización de logs centralizados

---

### 2. Gestión de Negocio

#### Gestión de Productos

- **URL:** http://localhost:3010/products/
- **Funciones:** CRUD completo, upload de imágenes, categorías

#### Gestión de Pedidos

- **URL:** http://localhost:3010/orders/
- **Funciones:** Visualizar, procesar y gestionar pedidos

#### Gestión de Usuarios

- **URL:** http://localhost:3010/users/
- **Funciones:** CRUD de usuarios, roles, permisos

#### Promociones

- **URL:** http://localhost:3010/promotions.html
- **Funciones:** Crear y gestionar promociones

---

### 3. Analytics & Reportes

#### Dashboard Analytics

- **URL:** http://localhost:3010/dashboard-analytics.html
- **Descripción:** Análisis de ventas, métricas de negocio

#### Visualización de Datos

- **URL:** http://localhost:3010/dashboard-visual.html
- **Descripción:** Gráficos y visualizaciones avanzadas

#### Reportes

- **URL:** http://localhost:3010/reports/
- **Descripción:** Reportes descargables

#### Métricas Avanzadas

- **URL:** http://localhost:3010/analytics.html
- **Descripción:** Analytics detallados

---

### 4. Configuración

#### Configuración General

- **URL:** http://localhost:3010/settings/
- **Funciones:** Configuración de la aplicación

#### Ajustes del Sistema

- **URL:** http://localhost:3010/settings.html
- **Funciones:** Parámetros del sistema

#### Documentación

- **URL:** http://localhost:3010/documentation.html
- **Descripción:** Guías y documentación técnica

#### Backups

- **URL:** http://localhost:3010/backup.html
- **Descripción:** Gestión de respaldos

---

## 🚀 Acciones Rápidas

### Enlaces Externos

#### Sitio Principal (Frontend)

- **URL:** http://localhost:5173/
- **Descripción:** Sitio público de Flores Victoria

#### MCP Dashboard (Directo)

- **URL:** http://localhost:5050/
- **Usuario:** admin
- **Contraseña:** changeme

---

## 📊 Estado del Sistema

### Servicios Monitoreados (20 total)

**Microservicios (9):**

1. `api-gateway` - Puerto 3000
2. `auth-service` - Puerto 3001
3. `user-service` - Puerto 3002
4. `product-service` - Puerto 3003
5. `cart-service` - Puerto 3004
6. `order-service` - Puerto 3005
7. `review-service` - Puerto 3006
8. `wishlist-service` - Puerto 3007
9. `contact-service` - Puerto 3008

**Infraestructura (5):**

1. `mongodb` - Puerto 27017
2. `postgres` - Puerto 5432
3. `redis` - Puerto 6379
4. `rabbitmq` - Puerto 5672 (Web: 15672)
5. `jaeger` - Puerto 16686

**Herramientas (3):**

1. `admin-panel` - Puerto 3010
2. `mcp-server` - Puerto 5050
3. `frontend` - Puerto 5173 (Vite - proceso local)

---

## 🎯 Flujos de Trabajo Comunes

### 1. Monitorear el Sistema

```
Dashboard Principal (/)
  → Ver stats en tiempo real
  → Click "MCP Dashboard"
  → Ver gráficos detallados
```

### 2. Gestionar Servicios Docker

```
Dashboard Principal (/)
  → Click "Docker Services"
  → Servicios (/services/)
  → Start/Stop/Restart/Ver Logs
```

### 3. Gestionar Productos

```
Dashboard Principal (/)
  → Click "Gestión de Productos"
  → Productos (/products/)
  → CRUD + Upload imágenes
```

### 4. Ver Métricas Avanzadas

```
Dashboard Principal (/)
  → Click "Dashboard Analytics"
  → Analytics (/dashboard-analytics.html)
  → Visualizar datos
```

---

## 🔧 Comandos Útiles

### Ver Logs de Servicios

```bash
# Admin Panel
docker logs -f flores-victoria-admin-panel

# MCP Server
docker logs -f flores-victoria-mcp-server

# Cualquier servicio
docker logs -f flores-victoria-[nombre-servicio]
```

### Restart Servicios

```bash
# Admin Panel
docker-compose restart admin-panel

# MCP Server
docker-compose restart mcp-server

# Todos los servicios
docker-compose restart
```

### Generar Eventos de Prueba en MCP

```bash
cd mcp-server
npm run generate-data
```

---

## 📱 Responsive Design

Todas las páginas están optimizadas para:

- ✅ Desktop (1920x1080)
- ✅ Laptop (1366x768)
- ✅ Tablet (768x1024)
- ✅ Mobile (375x812)

---

## 🎨 Características del Dashboard

### Visualización

- 📊 4 stat boxes con métricas en tiempo real
- 🎯 Cards organizadas por categorías
- 🔗 Enlaces directos y en nueva pestaña
- ⏰ Reloj en tiempo real
- 📈 Stats actualizadas cada 30 segundos

### Interactividad

- 🖱️ Hover effects en todas las cards
- 🎨 Gradientes y sombras modernas
- 📱 100% responsive
- ⚡ Carga rápida

### Estado del Sistema

- ✅ MCP Server: Online
- ✅ Microservicios: Monitoreados
- ✅ Base de Datos: Conectada
- ✅ Frontend: Running

---

## 🆘 Troubleshooting

### Dashboard no carga

```bash
# Verificar que el contenedor está corriendo
docker ps | grep admin-panel

# Ver logs
docker logs flores-victoria-admin-panel

# Restart
docker-compose restart admin-panel
```

### MCP Dashboard pide autenticación

```
Usuario: admin
Contraseña: changeme
```

### Servicios muestran como "Down"

```bash
# Verificar servicios
docker ps

# Iniciar servicios
docker-compose up -d
```

---

## 📚 Recursos Adicionales

### Documentación

- MCP Server: `/MCP_MEJORAS_IMPLEMENTADAS.md`
- Admin Panel: Este archivo
- API Docs: http://localhost:3000/api-docs (cuando esté implementado)

### Monitoreo

- MCP Metrics JSON: http://localhost:5050/metrics
- MCP Prometheus: http://localhost:5050/metrics/prometheus
- Health Check: http://localhost:5050/health

---

## ✨ Próximas Mejoras Sugeridas

1. **Autenticación unificada:** Login único para todo el panel
2. **Notificaciones en tiempo real:** WebSocket para alertas
3. **Temas personalizables:** Dark mode / Light mode
4. **Exportación de datos:** CSV/PDF de reportes
5. **Integración con Grafana:** Dashboards avanzados
6. **API REST para admin:** Gestión programática
7. **Logs centralizados:** ELK Stack integration
8. **Backup automático:** Scheduled backups

---

**Fecha:** 9 de noviembre de 2025  
**Versión:** 2.0.0  
**Estado:** ✅ Producción
