# Sistema de Monitoreo para Flores Victoria

## Índice

1. [Introducción](#introducción)
2. [Componentes del Sistema de Monitoreo](#componentes-del-sistema-de-monitoreo)
3. [Arquitectura de Monitoreo](#arquitectura-de-monitoreo)
4. [Métricas Implementadas](#métricas-implementadas)
5. [Configuración](#configuración)
6. [Uso de Métricas en los Microservicios](#uso-de-métricas-en-los-microservicios)
7. [Personalización](#personalización)
8. [Alertas](#alertas)
9. [Solución de Problemas](#solución-de-problemas)
10. [Mejoras Futuras](#mejoras-futuras)

## Introducción

Este documento describe cómo configurar y utilizar el sistema de monitoreo para la aplicación Flores
Victoria. El sistema utiliza Prometheus para la recolección de métricas, Grafana para la
visualización y Jaeger para tracing distribuido.

El monitoreo es fundamental para mantener la salud del sistema, identificar problemas de rendimiento
y asegurar una experiencia óptima para los usuarios.

## Componentes del Sistema de Monitoreo

### Prometheus

Prometheus es un sistema de monitoreo y alerta basado en métricas. Recopila y almacena métricas como
series temporales identificadas por nombre de métrica y pares clave-valor.

### Grafana

Grafana es una plataforma de análisis y visualización para métricas. Permite crear dashboards
interactivos y configurar alertas visuales.

### Jaeger

Jaeger es un sistema de tracing distribuido que permite seguir las solicitudes a través de múltiples
microservicios, identificando cuellos de botella y problemas de latencia.

### Exporters

Los exporters son componentes que exponen métricas de sistemas externos en un formato que Prometheus
puede recolectar.

## Arquitectura de Monitoreo

```
┌─────────────────┐    ┌──────────────┐    ┌──────────────┐
│   Microservicios│    │   Prometheus │    │    Grafana   │
│                 │    │              │    │              │
│  ┌────────────┐ │    │              │    │              │
│  │ Métricas   │ │    │              │    │              │
│  │ Middleware │─┼───►│  Recolección ├───►│  Dashboard   │
│  └────────────┘ │    │              │    │              │
│                 │    │              │    │              │
└─────────────────┘    └──────────────┘    └──────────────┘
                                │
                       ┌────────▼────────┐
                       │     Alertas     │
                       └─────────────────┘

┌─────────────────┐    ┌──────────────┐
│   Microservicios│    │    Jaeger    │
│                 │    │              │
│  ┌────────────┐ │    │              │
│  │   Tracing  │─┼───►│   Collector  │
│  │ Middleware │ │    │              │
│  └────────────┘ │    │              │
└─────────────────┘    └──────────────┘
```

## Métricas Implementadas

### Métricas HTTP

- `http_request_duration_seconds`: Duración de las solicitudes HTTP
- `http_requests_total`: Número total de solicitudes HTTP
- `http_request_size_bytes`: Tamaño de las solicitudes HTTP
- `http_response_size_bytes`: Tamaño de las respuestas HTTP

### Métricas de Negocio

- `active_users`: Número de usuarios activos
- `product_count`: Número total de productos
- `user_count`: Número total de usuarios
- `order_count`: Número total de pedidos
- `cart_items_count`: Número de items en carritos

### Métricas de Sistema

- `process_cpu_seconds_total`: Tiempo total de CPU utilizado
- `process_open_fds`: Número de descriptores de archivo abiertos
- `process_resident_memory_bytes`: Memoria residente del proceso
- `nodejs_heap_size_total_bytes`: Tamaño total del heap de Node.js
- `nodejs_heap_size_used_bytes`: Tamaño del heap utilizado de Node.js

### Métricas Personalizadas

- `database_query_duration_seconds`: Duración de consultas a base de datos
- `external_api_request_duration_seconds`: Duración de solicitudes a APIs externas
- `email_send_duration_seconds`: Duración de envío de correos electrónicos

## Configuración

### 1. Iniciar servicios de monitoreo

```bash
# Iniciar todos los servicios incluyendo monitoreo
docker-compose up -d

# O iniciar solo los servicios de monitoreo
docker-compose -f docker-compose.monitoring.yml up -d
```

### 2. Acceder a las interfaces

- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3000 (usuario: admin, contraseña: admin)
- **Jaeger**: http://localhost:16686

### 3. Configurar Grafana

1. Accede a Grafana en http://localhost:3000
2. Añade Prometheus como fuente de datos:
   - Type: Prometheus
   - URL: http://prometheus:9090
3. Importa el dashboard desde `monitoring/grafana-dashboard.json`

### 4. Configurar Jaeger

1. Las aplicaciones están configuradas para enviar traces a Jaeger automáticamente
2. Accede a la interfaz web en http://localhost:16686
3. Busca traces por operación, servicio o tags

## Uso de Métricas en los Microservicios

Los microservicios exponen un endpoint `/metrics` que Prometheus utiliza para recolectar métricas.
Por ejemplo:

```bash
# Ver métricas del servicio de autenticación
curl http://localhost:3001/metrics

# Ver métricas del servicio de productos
curl http://localhost:3002/metrics
```

### Implementación en Código

Cada microservicio implementa métricas usando la biblioteca `prom-client`:

```javascript
const client = require('prom-client');

// Crear una métrica personalizada
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
});

// Usar la métrica en un middleware
app.use((req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestDuration.observe(
      {
        method: req.method,
        route: req.route?.path || req.path,
        status_code: res.statusCode,
      },
      duration
    );
  });

  next();
});
```

## Personalización

### Añadir nuevas métricas

1. Editar `shared/metrics/index.js` en el microservicio correspondiente
2. Añadir la nueva métrica al registro
3. Utilizar la métrica en el código del microservicio

```javascript
// shared/metrics/index.js
const client = require('prom-client');

// Nueva métrica para contar operaciones de base de datos
const dbOperationsTotal = new client.Counter({
  name: 'database_operations_total',
  help: 'Total number of database operations',
  labelNames: ['operation', 'table', 'status'],
});

module.exports = {
  // ... otras métricas
  dbOperationsTotal,
};
```

### Modificar el dashboard de Grafana

1. Editar `monitoring/grafana-dashboard.json`
2. Importar el dashboard actualizado en Grafana

```json
{
  "dashboard": {
    "title": "Flores Victoria Dashboard",
    "panels": [
      {
        "title": "HTTP Request Duration",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_request_duration_seconds_sum[5m]) / rate(http_request_duration_seconds_count[5m])",
            "legendFormat": "{{method}} {{route}}"
          }
        ]
      }
    ]
  }
}
```

## Alertas

### Configuración de Alertas en Prometheus

Las alertas se configuran en `prometheus/alerts.yml`:

```yaml
groups:
  - name: ejemplo
    rules:
      - alert: AltoErrorRate
        expr: rate(http_requests_total{status_code=~"5.."}[5m]) > 0.05
        for: 10m
        labels:
          severity: page
        annotations:
          summary: 'Alto error rate en {{ $labels.service }}'
          description: '{{ $value }}% de errores en el servicio {{ $labels.service }}'
```

### Tipos de Alertas Recomendadas

1. **Disponibilidad**: Servicio no responde
2. **Latencia**: Tiempo de respuesta mayor al umbral
3. **Error Rate**: Porcentaje de solicitudes con error
4. **Recursos**: Uso alto de CPU, memoria o disco
5. **Negocio**: Métricas clave por debajo de umbrales

## Solución de Problemas

### No se muestran métricas

1. Verificar que los microservicios estén ejecutándose

   ```bash
   docker-compose ps
   ```

2. Comprobar que el endpoint `/metrics` esté accesible

   ```bash
   curl http://localhost:3001/metrics
   ```

3. Revisar la configuración de Prometheus
   ```bash
   docker-compose logs prometheus
   ```

### Problemas de conexión entre servicios

1. Verifica que los nombres de servicio en `prometheus.yml` coincidan con los del docker-compose
2. Asegúrate de que los puertos estén correctamente expuestos
3. Comprueba que las redes Docker estén configuradas correctamente

### Problemas con Jaeger

1. Verificar que el agente de Jaeger esté corriendo
2. Comprobar las variables de entorno de tracing en los microservicios
3. Revisar los logs de los servicios para errores de tracing

```bash
# Verificar contenedores de Jaeger
docker-compose ps | grep jaeger

# Ver logs de Jaeger
docker-compose logs jaeger
```

## Mejoras Futuras

### Métricas Adicionales

1. Implementar métricas específicas de base de datos
2. Añadir métricas de cache (Redis)
3. Métricas de colas de mensajes (RabbitMQ)
4. Métricas de uso de APIs externas

### Dashboards Especializados

1. Dashboard específico por microservicio
2. Dashboard de rendimiento de base de datos
3. Dashboard de usuarios y conversiones
4. Dashboard de errores y debugging

### Alertas Avanzadas

1. Alertas predictivas basadas en tendencias
2. Alertas compuestas que requieran múltiples condiciones
3. Silenciado automático de alertas repetidas
4. Integración con sistemas de notificación (Slack, Email, etc.)

### Tracing Distribuido

1. Correlacionar métricas con traces
2. Métricas de latencia por servicio en traces
3. Análisis de rutas críticas
4. Integración con logs estructurados

La implementación continua y mejora del sistema de monitoreo es crucial para mantener la salud y el
rendimiento del sistema Flores Victoria.
