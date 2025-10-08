# Monitoreo y Alertas - Flores Victoria

## Introducción

Este documento describe el sistema de monitoreo y alertas implementado para el proyecto Flores Victoria. Incluye la configuración de Prometheus, Grafana y las reglas de alertas para garantizar la salud y el rendimiento del sistema.

## Componentes del Sistema de Monitoreo

### 1. Prometheus
- Recopila métricas de los servicios
- Evalúa reglas de alertas
- Almacena series temporales

### 2. Grafana
- Visualiza métricas en dashboards
- Gestiona alertas y notificaciones
- Proporciona interfaz de usuario para el monitoreo

### 3. Exporters
- Node Exporter: Métricas del sistema host
- MongoDB Exporter: Métricas de MongoDB
- PostgreSQL Exporter: Métricas de PostgreSQL
- RabbitMQ Exporter: Métricas de RabbitMQ

## Configuración de Alertas

### Tipos de Alertas

#### Alertas de Recursos
- **HighCPUUsage**: Uso de CPU > 80% por más de 2 minutos
- **CriticalCPUUsage**: Uso de CPU > 95% por más de 1 minuto
- **HighMemoryUsage**: Uso de memoria > 80% por más de 2 minutos
- **CriticalMemoryUsage**: Uso de memoria > 95% por más de 1 minuto
- **LowDiskSpace**: Espacio en disco < 10%
- **CriticalLowDiskSpace**: Espacio en disco < 5%

#### Alertas de Servicios
- **ServiceDown**: Un servicio no responde por más de 1 minuto
- **HighLatency**: Latencia del 95 percentil > 2 segundos
- **HighErrorRate**: Más del 5% de solicitudes fallan

#### Alertas de Infraestructura
- **MongoDBDown**: MongoDB no disponible
- **PostgreSQLDown**: PostgreSQL no disponible
- **HighRabbitMQQueueSize**: Más de 1000 mensajes en cola

## Configuración de Notificaciones

### Canales de Notificación

#### Email
```yaml
# Configuración de notificaciones por email en Grafana
smtp:
  enabled: true
  host: smtp.gmail.com:587
  user: your-email@gmail.com
  password: your-password
  from_address: your-email@gmail.com
  from_name: Flores Victoria Monitoring
```

#### Slack
```yaml
# Configuración de notificaciones por Slack
slack:
  url: https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
  username: monitoring-bot
```

#### Webhooks
```yaml
# Configuración de notificaciones por webhook
webhook:
  url: https://your-webhook-url.com/monitoring
  http_method: POST
```

## Dashboards de Grafana

### Dashboard Principal
- Estado general del sistema
- Uso de recursos (CPU, memoria, disco)
- Tasa de solicitudes y errores
- Latencia de servicios

### Dashboard de Servicios
- Métricas específicas por microservicio
- Tiempo de actividad
- Rendimiento de endpoints

### Dashboard de Bases de Datos
- Conexiones activas
- Consultas por segundo
- Tamaño de bases de datos
- Tiempos de respuesta

### Dashboard de Mensajería
- Tamaño de colas
- Mensajes procesados
- Tasa de publicación/consumo
- Errores de procesamiento

## SLIs y SLOs

### Indicadores de Nivel de Servicio (SLIs)

1. **Disponibilidad**:
   - Medido como tiempo de actividad / tiempo total
   - Objetivo: 99.9%

2. **Latencia**:
   - 95 percentil de tiempo de respuesta
   - Objetivo: < 200ms para el 95% de solicitudes

3. **Tasa de errores**:
   - Porcentaje de solicitudes fallidas
   - Objetivo: < 0.1%

4. **Durabilidad de datos**:
   - Porcentaje de datos correctamente almacenados
   - Objetivo: 99.99%

### Objetivos de Nivel de Servicio (SLOs)

| Servicio | Disponibilidad | Latencia (p95) | Tasa de Errores |
|----------|----------------|----------------|-----------------|
| API Gateway | 99.9% | < 200ms | < 0.1% |
| Auth Service | 99.9% | < 150ms | < 0.05% |
| Product Service | 99.9% | < 300ms | < 0.1% |
| User Service | 99.9% | < 200ms | < 0.05% |
| Order Service | 99.9% | < 500ms | < 0.1% |
| Cart Service | 99.9% | < 200ms | < 0.1% |
| Wishlist Service | 99.5% | < 300ms | < 0.2% |
| Review Service | 99.5% | < 300ms | < 0.2% |
| Contact Service | 99.5% | < 400ms | < 0.1% |

## Configuración de Métricas Personalizadas

### Métricas de Negocio
```javascript
// Ejemplo de métricas personalizadas en Node.js
const client = require('prom-client');

// Contador de órdenes creadas
const ordersCreated = new client.Counter({
  name: 'flores_victoria_orders_created_total',
  help: 'Total de órdenes creadas',
  labelNames: ['product_type', 'payment_method']
});

// Histograma de tiempo de procesamiento de órdenes
const orderProcessingDuration = new client.Histogram({
  name: 'flores_victoria_order_processing_duration_seconds',
  help: 'Tiempo de procesamiento de órdenes',
  labelNames: ['order_type'],
  buckets: [1, 5, 10, 30, 60, 120]
});

// Registrar métricas en endpoints
app.post('/orders', async (req, res) => {
  const end = orderProcessingDuration.startTimer();
  
  try {
    const order = await createOrder(req.body);
    ordersCreated.inc({
      product_type: order.productType,
      payment_method: order.paymentMethod
    });
    
    end({ order_type: 'standard' });
    res.status(201).json(order);
  } catch (error) {
    end({ order_type: 'standard' });
    res.status(500).json({ error: error.message });
  }
});
```

## Procedimientos de Respuesta a Alertas

### Alerta: ServiceDown
1. Verificar estado del contenedor: `docker-compose ps`
2. Verificar logs del servicio: `docker-compose logs <service>`
3. Reiniciar servicio si necesario: `docker-compose restart <service>`
4. Escalar a equipo de operaciones si el problema persiste

### Alerta: HighCPUUsage / HighMemoryUsage
1. Identificar proceso consumidor de recursos: `docker stats`
2. Analizar logs del servicio: `docker-compose logs <service>`
3. Verificar solicitudes concurrentes
4. Escalar cantidad de réplicas si es un problema de capacidad

### Alerta: HighErrorRate
1. Revisar logs de errores: `docker-compose logs <service> | grep ERROR`
2. Verificar estado de dependencias (bases de datos, servicios externos)
3. Revisar métricas de latencia
4. Implementar mitigaciones si es un problema de código

## Mantenimiento del Sistema de Monitoreo

### Actualización de Reglas de Alertas
```bash
# Editar reglas en monitoring/prometheus/rules.yml
# Recargar configuración de Prometheus
curl -X POST http://localhost:9090/-/reload
```

### Backup de Configuraciones
```bash
# Backup de configuraciones de Grafana
docker-compose exec grafana tar -czf /tmp/grafana-backup.tar.gz /etc/grafana

# Backup de reglas de Prometheus
cp monitoring/prometheus/rules.yml backup/prometheus-rules-$(date +%Y%m%d).yml
```

### Prueba de Alertas
```bash
# Forzar una alerta de prueba
curl -X POST http://localhost:9090/api/v1/alerts -d '[{
  "labels": {
    "alertname": "TestAlert",
    "service": "test-service"
  },
  "annotations": {
    "summary": "Alerta de prueba"
  },
  "generatorURL": "http://localhost:9090/graph?g0.expr=up%3D%3D0"
}]'
```

## Conclusión

El sistema de monitoreo y alertas implementado proporciona una visibilidad completa del estado del sistema Flores Victoria. Las alertas configuradas permiten detectar y responder rápidamente a problemas, manteniendo los SLOs definidos y garantizando una experiencia de usuario óptima.

Se recomienda:
1. Revisar y ajustar umbrales de alertas según el comportamiento real del sistema
2. Configurar canales de notificación apropiados para diferentes niveles de severidad
3. Entrenar al equipo de operaciones en los procedimientos de respuesta a alertas
4. Realizar pruebas periódicas del sistema de alertas