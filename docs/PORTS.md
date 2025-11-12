# 🔧 PORT CONFIGURATION GUIDE - FLORES VICTORIA v3.0

## 📋 Resumen de Puertos por Ambiente

### 🔵 Development (3xxx)

Ambiente de desarrollo local - Puerto base: 3000

| Servicio                | Puerto | URL                   |
| ----------------------- | ------ | --------------------- |
| **Core Services**       |
| AI Service              | 3013   | http://localhost:3013 |
| Order Service           | 3004   | http://localhost:3004 |
| Admin Panel             | 3021   | http://localhost:3021 |
| **Additional Services** |
| Notification Service    | 3016   | http://localhost:3016 |
| Auth Service            | 3017   | http://localhost:3017 |
| Payment Service         | 3018   | http://localhost:3018 |
| **Monitoring**          |
| Prometheus              | 9090   | http://localhost:9090 |
| Grafana                 | 3011   | http://localhost:3011 |
| **Frontend**            |
| Main Site               | 3000   | http://localhost:3000 |
| Documentation           | 3021   | http://localhost:3021 |
| **Databases**           |
| PostgreSQL              | 5432   | localhost:5432        |
| Redis                   | 6379   | localhost:6379        |
| MongoDB                 | 27017  | localhost:27017       |

### 🟢 Production (4xxx)

Ambiente de producción - Puerto base: 4000

| Servicio                | Puerto | URL                   |
| ----------------------- | ------ | --------------------- |
| **Core Services**       |
| AI Service              | 4013   | http://localhost:4013 |
| Order Service           | 4004   | http://localhost:4004 |
| Admin Panel             | 4021   | http://localhost:4021 |
| **Additional Services** |
| Notification Service    | 4016   | http://localhost:4016 |
| Auth Service            | 4017   | http://localhost:4017 |
| Payment Service         | 4018   | http://localhost:4018 |
| **Monitoring**          |
| Prometheus              | 9091   | http://localhost:9091 |
| Grafana                 | 4011   | http://localhost:4011 |
| **Frontend**            |
| Main Site               | 4000   | http://localhost:4000 |
| Documentation           | 4020   | http://localhost:4020 |
| **Databases**           |
| PostgreSQL              | 5433   | localhost:5433        |
| Redis                   | 6380   | localhost:6380        |
| MongoDB                 | 27018  | localhost:27018       |

### 🟡 Testing/Staging (5xxx)

Ambiente de pruebas - Puerto base: 5000

| Servicio                | Puerto | URL                   |
| ----------------------- | ------ | --------------------- |
| **Core Services**       |
| AI Service              | 5013   | http://localhost:5013 |
| Order Service           | 5004   | http://localhost:5004 |
| Admin Panel             | 5021   | http://localhost:5021 |
| **Additional Services** |
| Notification Service    | 5016   | http://localhost:5016 |
| Auth Service            | 5017   | http://localhost:5017 |
| Payment Service         | 5018   | http://localhost:5018 |
| **Monitoring**          |
| Prometheus              | 9092   | http://localhost:9092 |
| Grafana                 | 5011   | http://localhost:5011 |
| **Frontend**            |
| Main Site               | 5000   | http://localhost:5000 |
| Documentation           | 5020   | http://localhost:5020 |
| **Databases**           |
| PostgreSQL              | 5434   | localhost:5434        |
| Redis                   | 6381   | localhost:6381        |
| MongoDB                 | 27019  | localhost:27019       |

---

## 🚀 Uso del Port Manager

### Ver Configuración

```bash
# Ver todos los ambientes
node scripts/port-manager.js show all

# Ver solo desarrollo
node scripts/port-manager.js show development

# Ver solo producción
node scripts/port-manager.js show production
```

### Obtener Puerto Específico

```bash
# Obtener puerto del admin-panel en desarrollo
node scripts/port-manager.js get development admin-panel
# Output: 3021

# Obtener puerto del ai-service en producción
node scripts/port-manager.js get production ai-service
# Output: 4013
```

### Validar Configuración

```bash
# Verificar que no hay conflictos entre ambientes
node scripts/port-manager.js validate
```

### Verificar Disponibilidad

```bash
# Verificar puertos disponibles en desarrollo
node scripts/port-manager.js check development

# Verificar puertos disponibles en producción
node scripts/port-manager.js check production
```

### Generar Archivos .env

```bash
# Generar .env para desarrollo
node scripts/port-manager.js generate-env development .env.development

# Generar .env para producción
node scripts/port-manager.js generate-env production .env.production

# Generar .env para testing
node scripts/port-manager.js generate-env testing .env.testing
```

---

## 🎯 Iniciar Servicios por Ambiente

### Development

```bash
# Iniciar servicios de desarrollo
./start-services.sh development

# O simplemente (development es por defecto)
./start-services.sh
```

### Production

```bash
# Iniciar servicios de producción
./start-services.sh production
```

### Testing

```bash
# Iniciar servicios de testing
./start-services.sh testing
```

---

## 🛑 Detener Servicios

```bash
# Detener servicios de desarrollo
./stop-services.sh development

# Detener servicios de producción
./stop-services.sh production

# Detener todos
pkill -f "ai-simple.js"
pkill -f "order-service-simple.js"
pkill -f "admin-panel.*server.js"
```

---

## 📊 Monitoreo

### Verificar Estado de Puertos

```bash
# Ver qué servicios están usando puertos
ss -tlnp | grep -E ":(3|4|5)[0-9]{3}"

# Ver específicamente desarrollo (3xxx)
ss -tlnp | grep ":3"

# Ver específicamente producción (4xxx)
ss -tlnp | grep ":4"
```

### Health Checks

```bash
# Development
curl http://localhost:3013/health  # AI Service
curl http://localhost:3004/health  # Order Service
curl http://localhost:3021/health  # Admin Panel

# Production
curl http://localhost:4013/health  # AI Service
curl http://localhost:4004/health  # Order Service
curl http://localhost:4021/health  # Admin Panel
```

---

## 🔐 Variables de Ambiente

Cada servicio puede leer su puerto desde:

1. **Argumento de línea de comandos**: `--port=3013`
2. **Variable de ambiente**: `PORT=3013`
3. **Configuración por defecto**: Según ambiente en `config/ports.json`

### Ejemplo en Node.js

```javascript
const PortManager = require('./scripts/port-manager');
const portManager = new PortManager();

const environment = process.env.NODE_ENV || 'development';
const port = portManager.getPort('ai-service', environment);

app.listen(port, () => {
  console.log(`AI Service running on port ${port} (${environment})`);
});
```

---

## 🎨 Configuración Personalizada

Para agregar nuevos servicios o cambiar puertos, edita `config/ports.json`:

```json
{
  "development": {
    "core": {
      "mi-nuevo-servicio": 3025
    }
  },
  "production": {
    "core": {
      "mi-nuevo-servicio": 4025
    }
  }
}
```

Luego valida la configuración:

```bash
node scripts/port-manager.js validate
```

---

## 🚨 Solución de Problemas

### Puerto Ocupado

```bash
# Ver qué proceso usa el puerto 3013
lsof -i:3013

# Matar proceso específico
kill -9 <PID>

# O usar el script de limpieza
./stop-services.sh development
```

### Conflictos entre Ambientes

```bash
# Validar que no haya conflictos
node scripts/port-manager.js validate

# Verificar disponibilidad antes de iniciar
node scripts/port-manager.js check production
```

### Cambiar Puerto en Caliente

```bash
# Detener servicio actual
./stop-services.sh development

# Editar config/ports.json
# Cambiar puerto deseado

# Validar cambio
node scripts/port-manager.js validate

# Reiniciar con nuevo puerto
./start-services.sh development
```

---

## 📋 Checklist de Deployment

### Development → Testing

- [ ] Verificar puertos testing disponibles: `node scripts/port-manager.js check testing`
- [ ] Iniciar servicios testing: `./start-services.sh testing`
- [ ] Verificar health checks en puertos 5xxx
- [ ] Ejecutar pruebas de integración

### Testing → Production

- [ ] Verificar puertos production disponibles: `node scripts/port-manager.js check production`
- [ ] Generar .env.production: `node scripts/port-manager.js generate-env production`
- [ ] Configurar firewall para puertos 4xxx
- [ ] Iniciar servicios production: `./start-services.sh production`
- [ ] Verificar health checks en puertos 4xxx
- [ ] Configurar monitoreo (Prometheus 9091, Grafana 4011)

---

## 🎯 Best Practices

1. **Nunca hardcodear puertos**: Usar siempre port-manager
2. **Validar antes de iniciar**: Ejecutar `check` antes de `start-services.sh`
3. **Logs separados**: Cada ambiente tiene sus propios logs
4. **PIDs tracked**: PIDs guardados en `.pids/` para fácil cleanup
5. **Ambientes aislados**: Nunca mezclar puertos entre ambientes

---

## 📚 Recursos Adicionales

- **Configuración**: `config/ports.json`
- **Port Manager**: `scripts/port-manager.js`
- **Start Script**: `start-services.sh`
- **Stop Script**: `stop-services.sh`
- **Logs**: `logs/` (por ambiente)
- **PIDs**: `.pids/` (por ambiente)

---

**Versión**: 3.0  
**Última actualización**: Octubre 2025  
**Mantenedor**: Flores Victoria Team
