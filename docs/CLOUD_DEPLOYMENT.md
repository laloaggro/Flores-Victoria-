# Despliegue en la Nube y Kubernetes

## Introducción

Este documento describe cómo desplegar la aplicación Flores Victoria en un entorno de nube utilizando Kubernetes. El objetivo es proporcionar una guía completa para escalar y administrar la aplicación en un entorno de producción.

## Arquitectura en la Nube

### Componentes de la Arquitectura

1. **Cluster de Kubernetes**: Orquestador de contenedores
2. **Balanceador de Carga**: Distribuye el tráfico entre los nodos
3. **Ingress Controller**: Gestiona el acceso externo a los servicios
4. **Volúmenes Persistentes**: Almacenamiento para bases de datos
5. **ConfigMaps y Secrets**: Gestión de configuración y secretos
6. **Servicios Externos**: Bases de datos gestionadas (opcional)

## Preparación para el Despliegue

### 1. Construcción de Imágenes Docker

Antes de desplegar en Kubernetes, es necesario construir y publicar las imágenes Docker:

```bash
# Construir imágenes para todos los microservicios
docker-compose build

# Etiquetar imágenes para el registro de contenedores
docker tag flores-victoria_frontend:latest your-registry/frontend:v1.0.0
docker tag flores-victoria_api-gateway:latest your-registry/api-gateway:v1.0.0
# ... repetir para cada servicio

# Publicar imágenes en el registro
docker push your-registry/frontend:v1.0.0
docker push your-registry/api-gateway:v1.0.0
# ... repetir para cada servicio
```

### 2. Configuración de Kubernetes

#### Crear un Namespace

```yaml
# kubernetes/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: flores-victoria
```

#### ConfigMaps para Variables de Entorno

```yaml
# kubernetes/configmaps.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: flores-victoria-config
  namespace: flores-victoria
data:
  NODE_ENV: "production"
  AUTH_SERVICE_URL: "http://auth-service:3001"
  PRODUCT_SERVICE_URL: "http://product-service:3002"
  USER_SERVICE_URL: "http://user-service:3003"
  ORDER_SERVICE_URL: "http://order-service:3004"
  CART_SERVICE_URL: "http://cart-service:3005"
  WISHLIST_SERVICE_URL: "http://wishlist-service:3006"
  REVIEW_SERVICE_URL: "http://review-service:3007"
  CONTACT_SERVICE_URL: "http://contact-service:3008"
```

#### Secrets para Credenciales

```yaml
# kubernetes/secrets.yaml
apiVersion: v1
kind: Secret
metadata:
  name: flores-victoria-secrets
  namespace: flores-victoria
type: Opaque
data:
  # Valores codificados en base64
  jwt_secret: eW91ci1qd3Qtc2VjcmV0LWhlcmU=
  mongo_root_password: eW91ci1tb25nby1wYXNzd29yZA==
  postgres_password: eW91ci1wb3N0Z3Jlcy1wYXNzd29yZA==
```

## Despliegue de Microservicios

### API Gateway

```yaml
# kubernetes/api-gateway-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-gateway
  namespace: flores-victoria
spec:
  replicas: 2
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
        image: your-registry/api-gateway:v1.0.0
        ports:
        - containerPort: 3000
        envFrom:
        - configMapRef:
            name: flores-victoria-config
        - secretRef:
            name: flores-victoria-secrets
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
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
  name: api-gateway
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

### Servicio de Autenticación

```yaml
# kubernetes/auth-service-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: auth-service
  namespace: flores-victoria
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
        image: your-registry/auth-service:v1.0.0
        ports:
        - containerPort: 3001
        env:
        - name: DATABASE_URL
          value: "postgresql://user:password@postgres:5432/auth"
        envFrom:
        - configMapRef:
            name: flores-victoria-config
        - secretRef:
            name: flores-victoria-secrets
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
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
  name: auth-service
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

### Servicio de Productos

```yaml
# kubernetes/product-service-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: product-service
  namespace: flores-victoria
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
        image: your-registry/product-service:v1.0.0
        ports:
        - containerPort: 3002
        env:
        - name: MONGODB_URI
          value: "mongodb://root:password@mongodb:27017/products?authSource=admin"
        envFrom:
        - configMapRef:
            name: flores-victoria-config
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
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
  name: product-service
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

## Despliegue de Bases de Datos

### MongoDB

```yaml
# kubernetes/mongodb-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mongodb
  namespace: flores-victoria
spec:
  replicas: 1
  selector:
    matchLabels:
      app: mongodb
  template:
    metadata:
      labels:
        app: mongodb
    spec:
      containers:
      - name: mongodb
        image: mongo:4.4
        ports:
        - containerPort: 27017
        env:
        - name: MONGO_INITDB_ROOT_USERNAME
          value: root
        - name: MONGO_INITDB_ROOT_PASSWORD
          valueFrom:
            secretKeyRef:
              name: flores-victoria-secrets
              key: mongo_root_password
        volumeMounts:
        - name: mongodb-storage
          mountPath: /data/db
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1"
      volumes:
      - name: mongodb-storage
        persistentVolumeClaim:
          claimName: mongodb-pvc

---
apiVersion: v1
kind: Service
metadata:
  name: mongodb
  namespace: flores-victoria
spec:
  selector:
    app: mongodb
  ports:
    - protocol: TCP
      port: 27017
      targetPort: 27017
  type: ClusterIP

---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: mongodb-pvc
  namespace: flores-victoria
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
```

### PostgreSQL

```yaml
# kubernetes/postgres-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: postgres
  namespace: flores-victoria
spec:
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: postgres:13
        ports:
        - containerPort: 5432
        env:
        - name: POSTGRES_DB
          value: floresvictoria
        - name: POSTGRES_USER
          value: floresuser
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: flores-victoria-secrets
              key: postgres_password
        volumeMounts:
        - name: postgres-storage
          mountPath: /var/lib/postgresql/data
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1"
      volumes:
      - name: postgres-storage
        persistentVolumeClaim:
          claimName: postgres-pvc

---
apiVersion: v1
kind: Service
metadata:
  name: postgres
  namespace: flores-victoria
spec:
  selector:
    app: postgres
  ports:
    - protocol: TCP
      port: 5432
      targetPort: 5432
  type: ClusterIP

---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: postgres-pvc
  namespace: flores-victoria
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
```

## Despliegue de Redis

```yaml
# kubernetes/redis-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: redis
  namespace: flores-victoria
spec:
  replicas: 1
  selector:
    matchLabels:
      app: redis
  template:
    metadata:
      labels:
        app: redis
    spec:
      containers:
      - name: redis
        image: redis:6-alpine
        ports:
        - containerPort: 6379
        volumeMounts:
        - name: redis-storage
          mountPath: /data
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
      volumes:
      - name: redis-storage
        persistentVolumeClaim:
          claimName: redis-pvc

---
apiVersion: v1
kind: Service
metadata:
  name: redis
  namespace: flores-victoria
spec:
  selector:
    app: redis
  ports:
    - protocol: TCP
      port: 6379
      targetPort: 6379
  type: ClusterIP

---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: redis-pvc
  namespace: flores-victoria
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 5Gi
```

## Despliegue de RabbitMQ

```yaml
# kubernetes/rabbitmq-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: rabbitmq
  namespace: flores-victoria
spec:
  replicas: 1
  selector:
    matchLabels:
      app: rabbitmq
  template:
    metadata:
      labels:
        app: rabbitmq
    spec:
      containers:
      - name: rabbitmq
        image: rabbitmq:3-management
        ports:
        - containerPort: 5672
        - containerPort: 15672
        env:
        - name: RABBITMQ_DEFAULT_USER
          value: admin
        - name: RABBITMQ_DEFAULT_PASS
          valueFrom:
            secretKeyRef:
              name: flores-victoria-secrets
              key: rabbitmq_password
        volumeMounts:
        - name: rabbitmq-storage
          mountPath: /var/lib/rabbitmq
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1"
      volumes:
      - name: rabbitmq-storage
        persistentVolumeClaim:
          claimName: rabbitmq-pvc

---
apiVersion: v1
kind: Service
metadata:
  name: rabbitmq
  namespace: flores-victoria
spec:
  selector:
    app: rabbitmq
  ports:
    - name: amqp
      protocol: TCP
      port: 5672
      targetPort: 5672
    - name: management
      protocol: TCP
      port: 15672
      targetPort: 15672
  type: ClusterIP

---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: rabbitmq-pvc
  namespace: flores-victoria
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 5Gi
```

## Configuración de Ingress

```yaml
# kubernetes/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: flores-victoria-ingress
  namespace: flores-victoria
  annotations:
    kubernetes.io/ingress.class: nginx
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  rules:
  - host: floresvictoria.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend
            port:
              number: 80
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: api-gateway
            port:
              number: 80
```

## Despliegue del Frontend

```yaml
# kubernetes/frontend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
  namespace: flores-victoria
spec:
  replicas: 3
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
      - name: frontend
        image: your-registry/frontend:v1.0.0
        ports:
        - containerPort: 80
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"

---
apiVersion: v1
kind: Service
metadata:
  name: frontend
  namespace: flores-victoria
spec:
  selector:
    app: frontend
  ports:
    - protocol: TCP
      port: 80
      targetPort: 80
  type: ClusterIP
```

## Despliegue de Monitoreo

### Prometheus

```yaml
# kubernetes/prometheus-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: prometheus
  namespace: flores-victoria
spec:
  replicas: 1
  selector:
    matchLabels:
      app: prometheus
  template:
    metadata:
      labels:
        app: prometheus
    spec:
      containers:
      - name: prometheus
        image: prom/prometheus:v2.45.0
        ports:
        - containerPort: 9090
        volumeMounts:
        - name: prometheus-config
          mountPath: /etc/prometheus
        - name: prometheus-storage
          mountPath: /prometheus
        resources:
          requests:
            memory: "1Gi"
            cpu: "1"
          limits:
            memory: "2Gi"
            cpu: "2"
      volumes:
      - name: prometheus-config
        configMap:
          name: prometheus-config
      - name: prometheus-storage
        persistentVolumeClaim:
          claimName: prometheus-pvc

---
apiVersion: v1
kind: Service
metadata:
  name: prometheus
  namespace: flores-victoria
spec:
  selector:
    app: prometheus
  ports:
    - protocol: TCP
      port: 9090
      targetPort: 9090
  type: ClusterIP

---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: prometheus-pvc
  namespace: flores-victoria
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 20Gi
```

### Grafana

```yaml
# kubernetes/grafana-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: grafana
  namespace: flores-victoria
spec:
  replicas: 1
  selector:
    matchLabels:
      app: grafana
  template:
    metadata:
      labels:
        app: grafana
    spec:
      containers:
      - name: grafana
        image: grafana/grafana-enterprise
        ports:
        - containerPort: 3000
        env:
        - name: GF_SECURITY_ADMIN_USER
          value: admin
        - name: GF_SECURITY_ADMIN_PASSWORD
          value: admin
        volumeMounts:
        - name: grafana-storage
          mountPath: /var/lib/grafana
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1"
      volumes:
      - name: grafana-storage
        persistentVolumeClaim:
          claimName: grafana-pvc

---
apiVersion: v1
kind: Service
metadata:
  name: grafana
  namespace: flores-victoria
spec:
  selector:
    app: grafana
  ports:
    - protocol: TCP
      port: 3000
      targetPort: 3000
  type: ClusterIP

---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: grafana-pvc
  namespace: flores-victoria
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
```

## Despliegue en la Nube

### Usando Google Kubernetes Engine (GKE)

1. **Crear un cluster**:
   ```bash
   gcloud container clusters create flores-victoria-cluster \
     --num-nodes=3 \
     --zone=us-central1-a \
     --machine-type=e2-medium
   ```

2. **Configurar kubectl**:
   ```bash
   gcloud container clusters get-credentials flores-victoria-cluster \
     --zone=us-central1-a
   ```

3. **Desplegar la aplicación**:
   ```bash
   kubectl apply -f kubernetes/namespace.yaml
   kubectl apply -f kubernetes/configmaps.yaml
   kubectl apply -f kubernetes/secrets.yaml
   kubectl apply -f kubernetes/mongodb-deployment.yaml
   kubectl apply -f kubernetes/postgres-deployment.yaml
   kubectl apply -f kubernetes/redis-deployment.yaml
   kubectl apply -f kubernetes/rabbitmq-deployment.yaml
   kubectl apply -f kubernetes/auth-service-deployment.yaml
   kubectl apply -f kubernetes/product-service-deployment.yaml
   # ... aplicar todos los demás archivos de despliegue
   ```

### Usando Amazon Elastic Kubernetes Service (EKS)

1. **Crear un cluster**:
   ```bash
   eksctl create cluster \
     --name flores-victoria-cluster \
     --version 1.21 \
     --region us-west-2 \
     --nodegroup-name standard-workers \
     --node-type t3.medium \
     --nodes 3
   ```

2. **Desplegar la aplicación**:
   ```bash
   kubectl apply -f kubernetes/namespace.yaml
   kubectl apply -f kubernetes/configmaps.yaml
   kubectl apply -f kubernetes/secrets.yaml
   # ... aplicar todos los demás archivos de despliegue
   ```

### Usando Azure Kubernetes Service (AKS)

1. **Crear un cluster**:
   ```bash
   az group create --name flores-victoria-rg --location eastus
   
   az aks create \
     --resource-group flores-victoria-rg \
     --name flores-victoria-cluster \
     --node-count 3 \
     --enable-addons monitoring \
     --generate-ssh-keys
   ```

2. **Configurar kubectl**:
   ```bash
   az aks get-credentials \
     --resource-group flores-victoria-rg \
     --name flores-victoria-cluster
   ```

3. **Desplegar la aplicación**:
   ```bash
   kubectl apply -f kubernetes/namespace.yaml
   kubectl apply -f kubernetes/configmaps.yaml
   kubectl apply -f kubernetes/secrets.yaml
   # ... aplicar todos los demás archivos de despliegue
   ```

## Escalado Automático

### Horizontal Pod Autoscaler

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
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

## Copias de Seguridad y Recuperación

### CronJob para Copias de Seguridad

```yaml
# kubernetes/backup-cronjob.yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: database-backup
  namespace: flores-victoria
spec:
  schedule: "0 2 * * *"  # Todos los días a las 2 AM
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: backup
            image: postgres:13
            command:
            - /bin/bash
            - -c
            - |
              pg_dump -h postgres -U floresuser -d floresvictoria > /backups/backup-$(date +%Y%m%d).sql
              # Aquí se podría añadir código para subir el backup a un almacenamiento en la nube
            env:
            - name: PGPASSWORD
              valueFrom:
                secretKeyRef:
                  name: flores-victoria-secrets
                  key: postgres_password
            volumeMounts:
            - name: backups
              mountPath: /backups
          volumes:
          - name: backups
            persistentVolumeClaim:
              claimName: backups-pvc
          restartPolicy: OnFailure

---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: backups-pvc
  namespace: flores-victoria
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 50Gi
```

## Monitoreo y Alertas

### Configuración de Prometheus

```yaml
# kubernetes/prometheus-config.yaml
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
      - targets: ['api-gateway:3000']
    - job_name: 'auth-service'
      static_configs:
      - targets: ['auth-service:3001']
    - job_name: 'product-service'
      static_configs:
      - targets: ['product-service:3002']
    # ... añadir configuraciones para otros servicios
```

## Seguridad

### Network Policies

```yaml
# kubernetes/network-policies.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny
  namespace: flores-victoria
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress

---
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-frontend
  namespace: flores-victoria
spec:
  podSelector:
    matchLabels:
      app: frontend
  policyTypes:
  - Ingress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: ingress-nginx
    ports:
    - protocol: TCP
      port: 80
```

## Mantenimiento y Actualizaciones

### Estrategia de Despliegue

```yaml
# Ejemplo de estrategia de despliegue en un Deployment
spec:
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 1
      maxSurge: 1
```

### Actualización de Imágenes

```bash
# Actualizar una imagen específica
kubectl set image deployment/api-gateway api-gateway=your-registry/api-gateway:v1.0.1 -n flores-victoria
```

## 7. Integración y Despliegue Continuo (CI/CD)

El proyecto incluye configuraciones de CI/CD usando GitHub Actions para automatizar las pruebas y el despliegue del sistema.

### 7.1 Pipeline de CI/CD

El pipeline se encuentra en `.github/workflows/ci-cd.yml` y consta de tres etapas principales:

1. **Test**: Ejecuta pruebas unitarias, de integración y de carga
2. **Build**: Construye las imágenes Docker de los microservicios
3. **Deploy**: Despliega a ambientes de staging y producción

### 7.2 Configuración del Pipeline

Para utilizar el pipeline de CI/CD, necesitas configurar las siguientes variables de entorno en GitHub:

- `DOCKER_REGISTRY` - Registro de contenedores donde se subirán las imágenes
- `KUBECONFIG_DATA` - Configuración de kubeconfig codificada en base64 para despliegue en Kubernetes

### 7.3 Despliegue en Kubernetes

Hay un workflow adicional en `.github/workflows/kubernetes-deploy.yml` que se encarga específicamente del despliegue en Kubernetes cuando se crea un nuevo release.

### 7.4 Pruebas Automatizadas

El pipeline ejecuta automáticamente tres tipos de pruebas:

1. **Pruebas Unitarias**: Verifican la funcionalidad de componentes individuales
2. **Pruebas de Integración**: Verifican la interacción entre microservicios
3. **Pruebas de Carga**: Evalúan el rendimiento del sistema bajo carga

## Conclusión

Este documento proporciona una guía completa para desplegar la aplicación Flores Victoria en un entorno de nube utilizando Kubernetes. La arquitectura propuesta permite:

1. **Escalabilidad**: Escalar horizontalmente los microservicios según la demanda
2. **Alta Disponibilidad**: Usar múltiples réplicas y health checks
3. **Seguridad**: Aislar servicios con Network Policies y gestionar secretos de forma segura
4. **Monitoreo**: Integrar Prometheus y Grafana para observabilidad
5. **Mantenimiento**: Facilitar actualizaciones y copias de seguridad

La implementación en la nube proporciona una plataforma robusta y escalable para la aplicación Flores Victoria, asegurando su disponibilidad y rendimiento en un entorno de producción.