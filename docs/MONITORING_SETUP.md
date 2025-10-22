# Sistema de Monitoreo para Flores Victoria

## Introducción

Este documento describe cómo configurar y utilizar el sistema de monitoreo para la aplicación Flores
Victoria. El sistema utiliza Prometheus para la recolección de métricas y Grafana para la
visualización.

## Componentes

1. **Prometheus**: Sistema de monitoreo y alerta basado en métricas
2. **Grafana**: Plataforma de análisis y visualización para métricas
3. **Métricas personalizadas**: Métricas específicas de la aplicación implementadas con prom-client

## Arquitectura

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
```

## Métricas Implementadas

### Métricas HTTP

- `http_request_duration_seconds`: Duración de las solicitudes HTTP
- `http_requests_total`: Número total de solicitudes HTTP

### Métricas de Negocio

- `active_users`: Número de usuarios activos
- `product_count`: Número total de productos
- `user_count`: Número total de usuarios

## Configuración

### 1. Iniciar servicios de monitoreo

```bash
cd monitoring
docker-compose -f docker-compose.monitoring.yml up -d
```

### 2. Acceder a las interfaces

- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3000 (usuario: admin, contraseña: admin)

### 3. Configurar Grafana

1. Accede a Grafana en http://localhost:3000
2. Añade Prometheus como fuente de datos:
   - URL: http://prometheus:9090
3. Importa el dashboard desde `monitoring/grafana-dashboard.json`

## Uso de Métricas en los Microservicios

Los microservicios exponen un endpoint `/metrics` que Prometheus utiliza para recolectar métricas.
Por ejemplo:

```bash
curl http://localhost:3001/metrics
```

## Personalización

### Añadir nuevas métricas

1. Editar `shared/metrics/index.js`
2. Añadir la nueva métrica al registro
3. Utilizar la métrica en el código del microservicio

### Modificar el dashboard de Grafana

1. Editar `monitoring/grafana-dashboard.json`
2. Importar el dashboard actualizado en Grafana

## Solución de Problemas

### No se muestran métricas

1. Verifica que los microservicios estén ejecutándose
2. Comprueba que el endpoint `/metrics` esté accesible
3. Revisa la configuración de Prometheus

### Problemas de conexión entre servicios

1. Verifica que los nombres de servicio en `prometheus.yml` coincidan con los del docker-compose
2. Asegúrate de que los puertos estén correctamente expuestos

## Mejoras Futuras

1. Implementar alertas en Prometheus
2. Añadir métricas específicas de base de datos
3. Integrar tracing distribuido con métricas
4. Implementar dashboards específicos por microservicio
