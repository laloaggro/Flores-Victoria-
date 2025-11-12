# 📊 Sistema de Monitoreo - Flores Victoria v3.0

## 🎯 Stack de Monitoreo

### Componentes Activos

- **Prometheus** - Recolección de métricas
  - URL: http://localhost:9090
  - Configuración: `monitoring/prometheus.yml`
  - Intervalo de scrape: 15s

- **Grafana Enterprise** - Visualización de dashboards
  - URL: http://localhost:3011
  - Usuario: `admin`
  - Contraseña: `admin`
  - Dashboards provisionados automáticamente

## 🚀 Arranque y Detención

```bash
# Iniciar monitoreo
npm run monitoring:up

# Detener monitoreo
npm run monitoring:down

# Ver logs
npm run monitoring:logs

# Validar conectividad
bash scripts/validate-monitoring.sh
```

## 📡 Servicios Monitoreados

### Servicios Core Locales

- **AI Service** - `172.17.0.1:3013` → `/health`
- **Order Service** - `172.17.0.1:3004` → `/health`
- **Admin Panel** - `172.17.0.1:3024` → `/health`

### Microservicios Docker

- **API Gateway** - `api-gateway:3000`
- **Auth Service** - `auth-service:3001`
- **Product Service** - `product-service:3002`
- **User Service** - `user-service:3003`

## 📈 Dashboards Disponibles

### Core Services Dashboard

- Estado de salud de servicios principales
- Tasa de requests (cuando métricas estén disponibles)
- Tiempo de respuesta (cuando métricas estén disponibles)

**Ubicación:** Grafana → Dashboards → Flores Victoria - Core Services

## 🔧 Configuración

### Prometheus Targets

Los servicios core locales se acceden vía gateway Docker (`172.17.0.1`) para permitir que Prometheus
en contenedor alcance servicios en el host.

### Grafana Provisioning

- **Datasources:** Auto-configurado con Prometheus
- **Dashboards:** Provisionados desde `monitoring/grafana/dashboards/`
- **Plugins:** Grafana Enterprise incluye plugins avanzados

## 📊 Próximos Pasos

### Para Métricas Completas

Los servicios actuales exponen `/health` pero no `/metrics` en formato Prometheus. Para habilitar
métricas:

1. **Añadir prom-client a servicios:**

   ```bash
   npm install prom-client
   ```

2. **Implementar endpoint /metrics:**

   ```javascript
   const promClient = require('prom-client');
   const register = new promClient.Registry();

   promClient.collectDefaultMetrics({ register });

   app.get('/metrics', async (req, res) => {
     res.set('Content-Type', register.contentType);
     res.end(await register.metrics());
   });
   ```

3. **Actualizar prometheus.yml:**
   ```yaml
   metrics_path: '/metrics' # Cambiar de /health
   ```

### Dashboards Personalizados

- Crear dashboards adicionales en `monitoring/grafana/dashboards/`
- Formato JSON de Grafana
- Auto-importados al reiniciar Grafana

## 🔍 Troubleshooting

### Prometheus no alcanza servicios

```bash
# Validar gateway Docker
docker network inspect bridge | grep Gateway

# Probar desde contenedor
docker exec flores-victoria-prometheus wget -qO- http://172.17.0.1:3013/health
```

### Grafana no muestra dashboards

```bash
# Verificar volúmenes montados
docker inspect flores-victoria-grafana | grep Mounts -A 20

# Revisar logs
docker logs flores-victoria-grafana
```

### Resetear contraseña de Grafana

```bash
docker exec flores-victoria-grafana grafana-cli admin reset-admin-password nuevacontraseña
```

## 📝 Notas

- El monitoreo funciona independientemente del estado de microservicios Docker
- Los servicios core se monitorean directamente desde el host
- Grafana persiste configuración en volumen `grafana_data`
- Prometheus retiene métricas por 200 horas
