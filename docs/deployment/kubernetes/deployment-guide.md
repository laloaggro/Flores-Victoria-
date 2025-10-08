# Guía de Despliegue en Kubernetes - Flores Victoria

## Introducción

Esta guía describe cómo desplegar la aplicación Flores Victoria en un clúster de Kubernetes. La arquitectura de microservicios se traduce en múltiples deployments, services y configuraciones que permiten una gestión eficiente y escalable de la aplicación.

## Prerrequisitos

1. Clúster de Kubernetes (GKE, EKS, AKS o minikube para desarrollo)
2. `kubectl` configurado y autenticado
3. `helm` (opcional, para despliegues más complejos)
4. Acceso a un registro de contenedores (Docker Hub, GCR, ECR, etc.)

## Arquitectura en Kubernetes

```
Namespace: flores-victoria
┌─────────────────────────────────────────────────────────────┐
│                      Ingress Controller                     │
├─────────────────────────────────────────────────────────────┤
│                         Ingress                             │
│                   (api.floresvictoria.com)                  │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                      API Gateway SVC                        │
├─────────────────────────────────────────────────────────────┤
│                     API Gateway Pod                         │
└─────────────────────┬───────────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐            ┌────────────┐
        ▼             ▼             ▼            ▼            │
┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌────────────┐│
│  Auth SVC   │ │Product SVC  │ │  User SVC   │ │ Order SVC  ││
├─────────────┤ ├─────────────┤ ├─────────────┤ ├────────────┤│
│ Auth Pod    │ │Product Pod  │ │  User Pod   │ │ Order Pod  ││
└─────────────┘ └─────────────┘ └─────────────┘ └────────────┘│
        ▼             ▼             ▼            ┌────────────┘
┌─────────────┐ ┌─────────────┐ ┌─────────────┐  │
│  Cart SVC   │ │Wishlist SVC │ │ Review SVC  │  │
├─────────────┤ ├─────────────┤ ├─────────────┤  │
│  Cart Pod   │ │Wishlist Pod │ │ Review Pod  │  │
└─────────────┘ └─────────────┘ └─────────────┘  │
        ▼             ▼                          │
┌─────────────┐ ┌─────────────┐                  │
│Contact SVC  │ │ Audit SVC   │                  │
├─────────────┤ ├─────────────┤                  │
│Contact Pod  │ │ Audit Pod   │                  │
└─────────────┘ └─────────────┘                  │
        ▼                                        │
┌─────────────┐                                  │
│Messaging SVC│                                  │
├─────────────┤                                  │
│Messaging Pod│                                  │
└─────────────┘                                  │
        ▼                                        │
┌─────────────┐                                  │
│  I18n SVC   │                                  │
├─────────────┤                                  │
│  I18n Pod   │                                  │
└─────────────┘                                  │
        ▼                                        │
┌─────────────┐                                  │
│Analytics SVC│                                  │
├─────────────┤                                  │
│Analytics Pod│                                  │
└─────────────┘ ─────────────────────────────────┘
        ▼             ▼             ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ PostgreSQL  │ │  MongoDB    │ │   Redis     │
├─────────────┤ ├─────────────┤ ├─────────────┤
│PostgreSQL Pod││MongoDB Pod  │ │ Redis Pod   │
└─────────────┘ └─────────────┘ └─────────────┘
        ▼             ▼             ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│  RabbitMQ   │ │Prometheus   │ │ Elasticsearch│
├─────────────┤ ├─────────────┤ ├─────────────┤
│ RabbitMQ Pod│ │Prometheus Pod││Elasticsearch │
└─────────────┘ └─────────────┘ │    Pod       │
        ▼             ▼        └─────────────┘
┌─────────────┐ ┌─────────────┐        ▼
│  Grafana    │ │  Kibana     │ ┌─────────────┐
├─────────────┤ ├─────────────┤ │ Logstash    │
│ Grafana Pod │ │ Kibana Pod  │ ├─────────────┤
└─────────────┘ └─────────────┘ │Logstash Pod │
                               └─────────────┘
```

## Componentes de Kubernetes

### Namespace

```yaml
# kubernetes/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: flores-victoria
```

### ConfigMaps

```yaml
# kubernetes/configmaps.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  namespace: flores-victoria
data:
  NODE_ENV: "production"
  API_GATEWAY_PORT: "3000"
  AUTH_SERVICE_PORT: "3001"
  PRODUCT_SERVICE_PORT: "3002"
  USER_SERVICE_PORT: "3003"
  ORDER_SERVICE_PORT: "3004"
  CART_SERVICE_PORT: "3005"
  WISHLIST_SERVICE_PORT: "3006"
  REVIEW_SERVICE_PORT: "3007"
  CONTACT_SERVICE_PORT: "3008"
```

### Secrets

```yaml
# kubernetes/secrets.yaml
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
  namespace: flores-victoria
type: Opaque
data:
  # Valores codificados en base64
  JWT_SECRET: bXktc2VjcmV0LWtleQ==
  DB_PASSWORD: cGFzc3dvcmQ=
  REDIS_PASSWORD: cmVkaXMtcGFzc3dvcmQ=
```

### Deployments

#### API Gateway

```yaml
# kubernetes/api-gateway/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-gateway
  namespace: flores-victoria
  labels:
    app: api-gateway
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api-gateway
  template:
    metadata:
      labels:
        app: api-gateway
    spec:
      containers:
      - name: api-gateway
        image: floresvictoria/api-gateway:latest
        ports:
        - containerPort: 3000
        envFrom:
        - configMapRef:
            name: app-config
        - secretRef:
            name: app-secrets
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: api-gateway-svc
  namespace: flores-victoria
spec:
  selector:
    app: api-gateway
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3000
  type: ClusterIP
```

#### Auth Service

```yaml
# kubernetes/auth-service/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: auth-service
  namespace: flores-victoria
  labels:
    app: auth-service
spec:
  replicas: 2
  selector:
    matchLabels:
      app: auth-service
  template:
    metadata:
      labels:
        app: auth-service
    spec:
      containers:
      - name: auth-service
        image: floresvictoria/auth-service:latest
        ports:
        - containerPort: 3001
        envFrom:
        - configMapRef:
            name: app-config
        - secretRef:
            name: app-secrets
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: auth-service-svc
  namespace: flores-victoria
spec:
  selector:
    app: auth-service
  ports:
    - protocol: TCP
      port: 3001
      targetPort: 3001
  type: ClusterIP
```

#### Product Service

```yaml
# kubernetes/product-service/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: product-service
  namespace: flores-victoria
  labels:
    app: product-service
spec:
  replicas: 2
  selector:
    matchLabels:
      app: product-service
  template:
    metadata:
      labels:
        app: product-service
    spec:
      containers:
      - name: product-service
        image: floresvictoria/product-service:latest
        ports:
        - containerPort: 3002
        envFrom:
        - configMapRef:
            name: app-config
        - secretRef:
            name: app-secrets
        resources:
          requests:
            memory: "256Mi"
            cpu: "200m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3002
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3002
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: product-service-svc
  namespace: flores-victoria
spec:
  selector:
    app: product-service
  ports:
    - protocol: TCP
      port: 3002
      targetPort: 3002
  type: ClusterIP
```

### Ingress

```yaml
# kubernetes/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: flores-victoria-ingress
  namespace: flores-victoria
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  rules:
  - host: api.floresvictoria.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: api-gateway-svc
            port:
              number: 80
  - host: admin.floresvictoria.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: admin-panel-svc
            port:
              number: 80
```

### Autoescalado Horizontal (HPA)

```yaml
# kubernetes/hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-gateway-hpa
  namespace: flores-victoria
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api-gateway
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

## Despliegue

### 1. Crear el Namespace

```bash
kubectl apply -f kubernetes/namespace.yaml
```

### 2. Crear ConfigMaps y Secrets

```bash
kubectl apply -f kubernetes/configmaps.yaml
kubectl apply -f kubernetes/secrets.yaml
```

### 3. Desplegar Bases de Datos

```bash
kubectl apply -f kubernetes/database/
```

### 4. Desplegar Microservicios

```bash
kubectl apply -f kubernetes/api-gateway/
kubectl apply -f kubernetes/auth-service/
kubectl apply -f kubernetes/product-service/
# ... aplicar para cada servicio
```

### 5. Configurar Ingress

```bash
kubectl apply -f kubernetes/ingress.yaml
```

### 6. Configurar Autoescalado

```bash
kubectl apply -f kubernetes/hpa.yaml
```

## Monitoreo

### Métricas con Prometheus

```yaml
# kubernetes/monitoring/prometheus-config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-config
  namespace: flores-victoria
data:
  prometheus.yml: |
    global:
      scrape_interval: 15s
    
    scrape_configs:
    - job_name: 'api-gateway'
      static_configs:
      - targets: ['api-gateway-svc:3000']
    
    - job_name: 'auth-service'
      static_configs:
      - targets: ['auth-service-svc:3001']
    
    - job_name: 'product-service'
      static_configs:
      - targets: ['product-service-svc:3002']
    
    # ... configuraciones para otros servicios
```

### Dashboards con Grafana

Los dashboards deben configurarse para visualizar métricas clave de cada microservicio:
- Tiempo de respuesta
- Tasa de errores
- Throughput
- Uso de recursos
- Métricas de negocio

## Estrategias de Despliegue

### Blue/Green Deployment

```yaml
# Estrategia de actualización blue/green
spec:
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
```

### Canary Deployment

Utilizar herramientas como Istio o Flagger para implementar despliegues canary.

## Backup y Recuperación

### Backup de Configuraciones

```bash
# Backup de todos los recursos
kubectl get all -n flores-victoria -o yaml > backup/all-resources.yaml

# Backup de ConfigMaps
kubectl get configmap -n flores-victoria -o yaml > backup/configmaps.yaml

# Backup de Secrets
kubectl get secret -n flores-victoria -o yaml > backup/secrets.yaml
```

### Backup de Datos

Implementar políticas de backup para bases de datos:
- PostgreSQL: pg_dump
- MongoDB: mongodump
- Redis: dump.rdb backup

## Seguridad

### Network Policies

```yaml
# kubernetes/network-policies.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: api-gateway-policy
  namespace: flores-victoria
spec:
  podSelector:
    matchLabels:
      app: api-gateway
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: ingress-nginx
    ports:
    - protocol: TCP
      port: 3000
```

### RBAC

```yaml
# kubernetes/rbac.yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: flores-victoria
  name: deployment-manager
rules:
- apiGroups: ["apps"]
  resources: ["deployments"]
  verbs: ["get", "list", "watch", "create", "update", "patch", "delete"]
- apiGroups: [""]
  resources: ["pods"]
  verbs: ["get", "list", "watch"]

---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: deployment-manager-binding
  namespace: flores-victoria
subjects:
- kind: User
  name: dev-team
  apiGroup: rbac.authorization.k8s.io
roleRef:
  kind: Role
  name: deployment-manager
  apiGroup: rbac.authorization.k8s.io
```

## Troubleshooting

### Comandos Útiles

```bash
# Ver estado de deployments
kubectl get deployments -n flores-victoria

# Ver logs de un pod
kubectl logs -n flores-victoria <pod-name>

# Describir un servicio
kubectl describe svc -n flores-victoria <service-name>

# Ver eventos del namespace
kubectl get events -n flores-victoria

# Acceder a un pod
kubectl exec -it -n flores-victoria <pod-name> -- /bin/sh
```

### Problemas Comunes

1. **Pods en CrashLoopBackOff**
   - Verificar logs
   - Revisar variables de entorno
   - Confirmar configuración de health checks

2. **Servicios sin endpoints**
   - Verificar selectors
   - Confirmar que los pods están corriendo

3. **Problemas de conectividad**
   - Revisar NetworkPolicies
   - Verificar servicios y endpoints

## Actualizaciones

### Proceso de Actualización

1. Crear nueva imagen de contenedor
2. Actualizar tag de imagen en el deployment
3. Aplicar cambios con `kubectl apply`
4. Monitorear el despliegue
5. Verificar funcionalidad

### Rollback

```bash
# Ver historial de revisiones
kubectl rollout history deployment/api-gateway -n flores-victoria

# Realizar rollback a una revisión específica
kubectl rollout undo deployment/api-gateway -n flores-victoria --to-revision=2
```

## Costos y Optimización

### Recomendaciones

1. **Derecho de tamaño de pods**: Ajustar requests y limits basados en métricas reales
2. **Autoescalado**: Configurar HPA para escalar según demanda
3. **Node Affinity**: Asignar workloads a nodos apropiados
4. **Resource Quotas**: Limitar consumo por namespace

### Monitoreo de Costos

Implementar herramientas como:
- Kubernetes Metrics Server
- Prometheus + Grafana
- Cloud provider cost monitoring