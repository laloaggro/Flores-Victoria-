# Infraestructura en Kubernetes - Flores Victoria

## Descripción General

Esta documentación describe la infraestructura del sistema Flores Victoria desplegada en Kubernetes. Incluye detalles sobre los componentes, configuraciones, políticas y mejores prácticas utilizadas.

## Arquitectura del Clúster

### Componentes Principales

1. **Namespace**: `flores-victoria` - Aisla los recursos del proyecto
2. **Ingress Controller**: Maneja el enrutamiento de tráfico externo
3. **API Gateway**: Punto de entrada único para todas las solicitudes
4. **Microservicios**: Componentes individuales de la aplicación
5. **Bases de Datos**: PostgreSQL, MongoDB y Redis
6. **Frontend**: Aplicación web del cliente
7. **Monitoreo**: Prometheus y Grafana para métricas

### Diagrama de Arquitectura

```
Internet
    ↓
Ingress Controller
    ↓
API Gateway Service (:80)
    ↓
API Gateway Pod
    ↓
┌─────────────────────────────────────────────────────────────┐
│                    Microservicios                           │
├─────────────┬─────────────┬─────────────┬───────────────────┤
│ Auth        │ Productos   │ Pedidos     │ Carrito           │
│ Service     │ Service     │ Service     │ Service           │
│ :4001       │ :3002       │ :3004       │ :3005             │
├─────────────┼─────────────┼─────────────┼───────────────────┤
│ Lista de    │ Reseñas     │ Contacto    │ Usuarios          │
│ Deseos      │ Service     │ Service     │ Service           │
│ Service     │ :3007       │ :3008       │ :3003             │
│ :3006       │             │             │                   │
└─────────────────────────────────────────────────────────────┘
    ↓               ↓              ↓              ↓
┌─────────────────────────────────────────────────────────────┐
│                    Bases de Datos                           │
├─────────────┬─────────────┬─────────────┬───────────────────┤
│ PostgreSQL  │ MongoDB     │ Redis       │                   │
│ :5432       │ :27017      │ :6379       │                   │
└─────────────────────────────────────────────────────────────┘
    ↓               ↓              ↓              ↓
┌─────────────────────────────────────────────────────────────┐
│                    Frontend                                 │
├─────────────────────────────────────────────────────────────┤
│ Frontend Service (:80)                                      │
│ Frontend Pod                                                │
└─────────────────────────────────────────────────────────────┘
```

## Configuración de Recursos

### Namespace
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: flores-victoria
```

### Recursos por Servicio

#### API Gateway
- **Replicas**: 2
- **CPU Request**: 100m
- **CPU Limit**: 200m
- **Memory Request**: 128Mi
- **Memory Limit**: 256Mi

#### Servicios de Backend
- **Replicas**: 1
- **CPU Request**: 100m
- **CPU Limit**: 200m
- **Memory Request**: 128Mi
- **Memory Limit**: 256Mi

#### Bases de Datos
- **Replicas**: 1
- **CPU Request**: 250m
- **CPU Limit**: 500m
- **Memory Request**: 256Mi
- **Memory Limit**: 512Mi

#### Redis
- **Replicas**: 1
- **CPU Request**: 100m
- **CPU Limit**: 200m
- **Memory Request**: 128Mi
- **Memory Limit**: 256Mi

#### Frontend
- **Replicas**: 2
- **CPU Request**: 50m
- **CPU Limit**: 100m
- **Memory Request**: 64Mi
- **Memory Limit**: 128Mi

## Volúmenes Persistentes

### PostgreSQL
- **Tipo**: PersistentVolumeClaim
- **Tamaño**: 5Gi
- **Modo de Acceso**: ReadWriteOnce

### MongoDB
- **Tipo**: PersistentVolumeClaim
- **Tamaño**: 2Gi
- **Modo de Acceso**: ReadWriteOnce

### Redis
- **Tipo**: PersistentVolumeClaim
- **Tamaño**: 1Gi
- **Modo de Acceso**: ReadWriteOnce

## Configuración de Red

### Services
- **ClusterIP**: Para comunicación interna entre microservicios
- **LoadBalancer**: Para el frontend (en entornos cloud)
- **NodePort**: Para desarrollo local

### Ingress
- **Host**: floresvictoria.local
- **Paths**: 
  - `/` → Frontend
  - `/api` → API Gateway

## Políticas de Seguridad

### Network Policies
- Se limita la comunicación entre servicios
- Solo se permite el tráfico necesario
- Se separan las bases de datos de los servicios de aplicación

### RBAC
- Se utilizan ServiceAccounts específicos por servicio
- Se aplican roles y role bindings mínimos
- Se evita el uso de cuentas privilegiadas

## Configuración de Secrets

### Secretos Utilizados
1. **db-secrets**: Credenciales de bases de datos
2. **jwt-secret**: Secreto para tokens JWT

### Gestión de Secrets
- Se codifican en base64
- Se evita almacenar secrets en repositorios
- Se utilizan herramientas de gestión de secretos en producción

## Health Checks

### Liveness Probes
- Verifican que el servicio esté funcionando
- Reinician el pod si fallan
- Configuradas con tiempos de espera apropiados

### Readiness Probes
- Verifican que el servicio esté listo para recibir tráfico
- Eliminan el pod del balanceo de carga si fallan
- Configuradas con tiempos de espera apropiados

## Autoscaling

### Horizontal Pod Autoscaler (HPA)
- Se configura para servicios con carga variable
- Se basa en uso de CPU y memoria
- Se ajusta automáticamente el número de réplicas

## Monitoreo

### Métricas
- Se exponen métricas en formato Prometheus
- Se utilizan sidecar exporters para bases de datos
- Se configuran alertas para condiciones críticas

### Logging
- Se centralizan los logs con Elasticsearch/Fluentd/Kibana
- Se estructuran los logs en formato JSON
- Se configuran niveles de log apropiados

## Backup y Recuperación

### Estrategias de Backup
- Se realizan backups regulares de volúmenes persistentes
- Se versionan los manifests de Kubernetes
- Se utilizan herramientas como Velero para backup completo

### Plan de Recuperación ante Desastres
- Se documentan procedimientos de recuperación
- Se prueban regularmente los planes de recuperación
- Se mantienen copias de seguridad en ubicaciones separadas

## Despliegue y Actualizaciones

### Estrategias de Despliegue
- **Rolling Update**: Para la mayoría de servicios
- **Blue/Green**: Para actualizaciones críticas
- **Canary**: Para nuevas funcionalidades

### CI/CD
- Se utilizan GitHub Actions para integración continua
- Se automatizan las pruebas y despliegues
- Se implementan pipelines de staging y producción

## Costos y Optimización

### Optimización de Recursos
- Se ajustan requests y limits basados en uso real
- Se utilizan nodos apropiados para cada tipo de carga
- Se implementan quotas y limits en namespaces

### Monitoreo de Costos
- Se utilizan herramientas de monitoreo de costos
- Se identifican recursos subutilizados
- Se optimizan configuraciones para reducir costos