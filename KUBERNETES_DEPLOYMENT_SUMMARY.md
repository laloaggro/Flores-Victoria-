# Implementación de Kubernetes para Flores Victoria

## Resumen

Hemos completado la implementación de los manifiestos de Kubernetes para desplegar la aplicación
Flores Victoria en un clúster de Kubernetes. Esta implementación incluye:

1. Manifiestos de Kubernetes para todos los servicios
2. Configuración de secretos y configmaps
3. Implementación mediante Helm chart
4. Script de despliegue automatizado

## Estructura del directorio k8s

```
k8s/
├── config/          # ConfigMaps para la configuración de la aplicación
├── deploy/          # Manifiestos de despliegue de Kubernetes
├── secrets/         # Secretos de Kubernetes
└── deploy-k8s.sh    # Script de despliegue automatizado
```

## Componentes implementados

### Infraestructura

- **Namespace**: `flores-victoria`
- **ConfigMap**: Configuración global de la aplicación
- **Secrets**: Gestión segura de contraseñas y tokens

### Bases de datos y servicios auxiliares

- **PostgreSQL**: Base de datos principal
- **Redis**: Caché y almacenamiento de sesiones
- **MongoDB**: Base de datos para productos
- **RabbitMQ**: Mensajería entre microservicios
- **Jaeger**: Trazado distribuido

### Microservicios

- **auth-service**: Servicio de autenticación
- **user-service**: Gestión de usuarios
- **product-service**: Catálogo de productos
- **api-gateway**: Puerta de enlace de la API
- **frontend**: Interfaz de usuario

## Estructura del Helm Chart

```
helm/flores-victoria/
├── Chart.yaml       # Metadatos del chart
├── values.yaml      # Valores configurables
├── templates/       # Plantillas de manifiestos
└── README.md        # Documentación del chart
```

## Instrucciones de despliegue

### Método 1: Usando el script automatizado

```bash
cd /home/impala/Documentos/Proyectos/Flores-Victoria-/
./k8s/deploy-k8s.sh
```

### Método 2: Despliegue manual

```bash
# Construir imágenes Docker
docker compose build

# Aplicar manifiestos
kubectl apply -f k8s/deploy/namespace.yaml
kubectl apply -f k8s/secrets/secrets.yaml
kubectl apply -f k8s/config/configmap.yaml
kubectl apply -f k8s/deploy/postgres.yaml
kubectl apply -f k8s/deploy/redis.yaml
kubectl apply -f k8s/deploy/mongodb.yaml
kubectl apply -f k8s/deploy/rabbitmq.yaml
kubectl apply -f k8s/deploy/jaeger.yaml
kubectl apply -f k8s/deploy/user-service.yaml
kubectl apply -f k8s/deploy/auth-service.yaml
kubectl apply -f k8s/deploy/product-service.yaml
kubectl apply -f k8s/deploy/api-gateway.yaml
kubectl apply -f k8s/deploy/frontend.yaml
```

### Método 3: Usando Helm

```bash
cd /home/impala/Documentos/Proyectos/Flores-Victoria-/helm
helm install flores-victoria ./flores-victoria
```

## Acceso a la aplicación

Después del despliegue, puedes acceder a la aplicación usando reenvío de puertos:

```bash
kubectl port-forward -n flores-victoria service/frontend 8080:80
```

Luego abre tu navegador en http://localhost:8080

## Monitoreo

Puedes acceder a la interfaz de Jaeger para trazado distribuido:

```bash
kubectl port-forward -n flores-victoria service/jaeger 16686:16686
```

Luego abre tu navegador en http://localhost:16686

## Solución de problemas

1. Verificar el estado de los pods:

   ```bash
   kubectl get pods -n flores-victoria
   ```

2. Verificar logs de un pod específico:

   ```bash
   kubectl logs -n flores-victoria <nombre-del-pod>
   ```

3. Describir un pod para más detalles:
   ```bash
   kubectl describe pod -n flores-victoria <nombre-del-pod>
   ```

## Mejoras futuras

1. Implementar persistencia para las bases de datos usando volúmenes persistentes
2. Configurar probes de readiness y liveness para mejor resiliencia
3. Implementar políticas de red para mayor seguridad
4. Configurar autoescalado horizontal para los microservicios
5. Implementar TLS/SSL para conexiones seguras
6. Agregar métricas con Prometheus y visualización con Grafana
