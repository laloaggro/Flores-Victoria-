# 🚀 Guía de Uso - Sistema de Administración Flores Victoria

## ⚡ Inicio Rápido

### 1️⃣ Iniciar Todos los Servicios

```bash
cd /home/impala/Documentos/Proyectos/flores-victoria
./quick-start.sh
```

Este script:
- ✅ Verifica dependencias (Node.js, npm)
- ✅ Instala node_modules si no existen
- ✅ Inicia todos los servicios en el orden correcto
- ✅ Muestra el estado de cada servicio
- ✅ Crea logs en el directorio `logs/`

### 2️⃣ Detener Todos los Servicios

```bash
./stop-all.sh
```

### 3️⃣ Acceder al Panel de Administración

Abre tu navegador en:
```
http://localhost:3021/control-center.html
```

Desde ahí puedes acceder a:
- 📚 **Documentación**: Sistema completo de documentación
- 🛠️ **Administración del Sistema**: Panel de monitoreo y control

O directamente (vía Gateway recomendado):
```
http://localhost:3000/admin-site/pages/system-admin.html
```

---

## 📊 Panel de Administración del Sistema

### Características Principales

#### 🔧 Gestión de Servicios
- **Ver estado en tiempo real** de todos los servicios
- **Indicadores visuales** (verde=activo, rojo=detenido)
- **PIDs** de procesos activos
- **Puertos** de cada servicio
- **Acciones rápidas**: Iniciar, detener, reiniciar

#### 📈 Monitoreo de Recursos
- **CPU**: Uso en porcentaje por núcleo
- **Memoria RAM**: Uso total y disponible
- **Uptime**: Tiempo activo del sistema
- **Alertas automáticas** cuando CPU/RAM > 80%

#### 📝 Visualizador de Logs
- **Filtrado por servicio**: api-gateway, auth, payment, admin-panel
- **Filtrado por nivel**: error, warn, info
- **Auto-refresh configurable** (cada 5 segundos)
- **Interfaz tipo terminal** con syntax highlighting

#### ⚡ Acciones Rápidas
- **Reiniciar servicios** individuales (Gateway, Auth, Payment)
- **Mantenimiento**: Limpiar cache, logs, optimizar DB
- **Diagnóstico**: Health check completo, test de red
- **Backups**: Crear, listar y restaurar

---

## 🔌 Endpoints de la API

### Health Check y Métricas

#### 1. Métricas del Sistema
```bash
curl http://localhost:3000/api/health/system/metrics | jq
```

**Respuesta:**
```json
{
  "ok": true,
  "uptime": 12,
  "cpu": {
    "usage": "45.32",
    "cores": 8
  },
  "memory": {
    "total": "16.00 GB",
    "used": "8.50 GB",
    "free": "7.50 GB",
    "usage": "53.12%"
  },
  "platform": "linux",
  "hostname": "flores-victoria-server"
}
```

#### 2. Estado de Servicios
```bash
curl http://localhost:3000/api/health/services/health | jq
```

**Respuesta:**
```json
{
  "ok": true,
  "services": [
    {
      "name": "api-gateway",
      "port": 3000,
      "status": "running",
      "pid": "12345"
    },
    {
      "name": "auth-service",
      "port": 3001,
      "status": "running",
      "pid": "12346"
    }
  ],
  "summary": {
    "total": 7,
    "running": 5,
    "stopped": 2
  }
}
```

#### 3. Estado de Docker
```bash
curl http://localhost:3000/api/health/docker/status | jq
```

#### 4. Logs de Servicios
```bash
# Últimas 100 líneas del gateway
curl http://localhost:3000/api/health/logs/api-gateway?lines=100 | jq

# Últimas 200 líneas de auth
curl http://localhost:3000/api/health/logs/auth-service?lines=200 | jq
```

#### 5. Acciones Rápidas
```bash
# Reiniciar Gateway
curl -X POST http://localhost:3000/api/health/admin/quick-fix \
  -H "Content-Type: application/json" \
  -d '{"action": "restart-gateway"}'

# Limpiar Cache
curl -X POST http://localhost:3000/api/health/admin/quick-fix \
  -H "Content-Type: application/json" \
  -d '{"action": "clear-cache"}'
```

---

## 🎯 Casos de Uso Comunes

### Verificar que todo está funcionando

```bash
# 1. Verificar servicios
curl http://localhost:3000/api/health/services/health | jq '.summary'

# 2. Ver métricas del sistema
curl http://localhost:3000/api/health/system/metrics | jq

# 3. Estado general
curl http://localhost:3000/api/status | jq
```

### Debugging de un servicio

```bash
# 1. Ver logs en tiempo real
tail -f logs/api-gateway.log

# 2. Ver últimas 50 líneas de errores
grep -i error logs/api-gateway.log | tail -50

# 3. Ver logs desde el panel
# Ir a: http://localhost:3000/admin-site/pages/system-admin.html
# Tab: Logs → Seleccionar servicio → Cargar Logs
```

### Reiniciar un servicio problemático

**Opción 1: Desde el Panel Web**
1. Ir a `Administración del Sistema`
2. Tab: `Acciones Rápidas`
3. Click en el botón del servicio a reiniciar

**Opción 2: Desde la API**
```bash
curl -X POST http://localhost:3000/api/health/admin/quick-fix \
  -H "Content-Type: application/json" \
  -d '{"action": "restart-gateway"}'
```

**Opción 3: Manualmente**
```bash
# Detener
pkill -f api-gateway.js

# Iniciar
cd /home/impala/Documentos/Proyectos/flores-victoria
NODE_ENV=development node api-gateway.js > logs/gateway.log 2>&1 &
```

### Monitoreo continuo

```bash
# Terminal 1: Métricas cada 5 segundos
watch -n 5 'curl -s http://localhost:3000/api/health/system/metrics | jq ".cpu.usage, .memory.usage"'

# Terminal 2: Estado de servicios
watch -n 10 'curl -s http://localhost:3000/api/health/services/health | jq ".summary"'

# Terminal 3: Logs en vivo
tail -f logs/gateway.log
```

---

## 🔒 Seguridad

### Acceso al Panel
- ✅ Solo usuarios autenticados pueden acceder
- ✅ Validación mediante `auth.js`
- ✅ Control de permisos en `navbar.js`
- ✅ Endpoints de admin protegidos

### Recomendaciones
- 🔐 **Producción**: Agregar autenticación JWT a `/api/health/*`
- 🔒 **HTTPS**: Usar certificados SSL en producción
- 🛡️ **Rate Limiting**: Los endpoints ya tienen límites configurados
- 📝 **Logs**: Rotar logs periódicamente para evitar llenar el disco

---

## 📁 Estructura de Archivos

```
flores-victoria/
├── api-gateway.js                    # Gateway principal
├── routes/
│   └── health-monitor.js             # Endpoints de monitoreo
├── admin-site/pages/
│   └── system-admin.html             # Panel de administración
├── quick-start.sh                    # Script de inicio
├── stop-all.sh                       # Script de detención
├── logs/                             # Logs de todos los servicios
│   ├── gateway.log
│   ├── auth.log
│   ├── payment.log
│   └── ...
└── MEJORAS_ADMINISTRACION_SISTEMA.md # Documentación de cambios
```

---

## 🐛 Troubleshooting

### Problema: "Address already in use"
```bash
# Ver qué proceso está usando el puerto
lsof -i :3000

# Detener el proceso
kill -9 <PID>

# O usar el script
./stop-all.sh
```

### Problema: "Cannot GET /api/health/system/metrics"
**Causa**: El API Gateway no está corriendo o health-monitor no está integrado

**Solución**:
```bash
# Verificar que el gateway está corriendo
curl http://localhost:3000/health

# Si no responde, reiniciar
./stop-all.sh
./quick-start.sh
```

### Problema: El dashboard no muestra métricas reales
**Causa**: CORS o fetch fallando

**Solución**:
1. Abrir DevTools (F12) → Console
2. Ver errores de red
3. Verificar que el API Gateway esté en `http://localhost:3000`
4. Verificar que `/api/health/system/metrics` responda

### Problema: Logs no se muestran
**Causa**: Archivos de log no existen o servicio no configurado

**Solución**:
```bash
# Verificar que existen los logs
ls -la logs/

# Verificar permisos
chmod 644 logs/*.log

# Crear logs si no existen
mkdir -p logs
touch logs/gateway.log logs/auth.log
```

---

## 📚 Recursos Adicionales

### Documentación
- **Completa**: http://localhost:3021/docs/index.html
- **API Docs**: http://localhost:3021/docs/sections/api-documentation.html
- **Arquitectura**: http://localhost:3021/docs/sections/architecture.html

### Monitoreo
- **Prometheus Metrics**: http://localhost:3000/metrics
- **Health Check**: http://localhost:3000/health
- **Service Status**: http://localhost:3000/api/status

### Logs
- **Directory**: `/home/impala/Documentos/Proyectos/flores-victoria/logs/`
- **Real-time**: `tail -f logs/<servicio>.log`
- **Search**: `grep -i "error" logs/*.log`

---

## ✨ Mejoras Futuras

### En Desarrollo
- [ ] Alertas por email/Slack cuando servicios caen
- [ ] Gráficos históricos de métricas
- [ ] Sistema de backups automatizado
- [ ] Deployment con Docker Compose
- [ ] CI/CD con GitHub Actions

### Sugerencias
- [ ] Dashboard de analytics de negocio
- [ ] Integración con bases de datos
- [ ] API de reportes personalizados
- [ ] Mobile app para monitoreo remoto

---

## 🤝 Soporte

¿Problemas o preguntas?
1. Revisa esta guía y la documentación
2. Verifica los logs en `logs/`
3. Ejecuta health checks: `curl http://localhost:3000/api/health/services/health`
4. Consulta `MEJORAS_ADMINISTRACION_SISTEMA.md` para detalles técnicos

---

**Última actualización**: 24 de octubre de 2025  
**Versión**: 3.0  
**Estado**: ✅ Producción
