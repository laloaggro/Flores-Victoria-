# Flores Victoria Kubernetes Deployment

This directory contains all the necessary Kubernetes manifests to deploy the Flores Victoria
application.

## Prerequisites

- Kubernetes cluster (minikube, k3s, or any cloud provider)
- kubectl CLI
- Docker (for building images)

## Directory Structure

```
k8s/
├── config/          # Configuration files (ConfigMaps)
├── deploy/          # Deployment manifests
├── secrets/         # Secret manifests
└── deploy-k8s.sh    # Deployment script
```

## Deployment Steps

1. Make sure you're in the project root directory:

   ```bash
   cd /home/impala/Documentos/Proyectos/Flores-Victoria-/
   ```

2. Build the Docker images:

   ```bash
   docker compose build
   ```

3. Run the deployment script:

   ```bash
   ./k8s/deploy-k8s.sh
   ```

   Or deploy manually:

   ```bash
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

## Accessing the Application

After deployment, you can access the application using port forwarding:

```bash
kubectl port-forward -n flores-victoria service/frontend 8080:80
```

Then open your browser at http://localhost:8080

Alternatively, if you're using a cloud provider that supports LoadBalancer services, you can access
the services directly using their external IPs.

## Monitoring Services

You can access the Jaeger UI for tracing at:

```bash
kubectl port-forward -n flores-victoria service/jaeger 16686:16686
```

Then open your browser at http://localhost:16686

## Troubleshooting

1. Check pod status:

   ```bash
   kubectl get pods -n flores-victoria
   ```

2. Check logs for a specific pod:

   ```bash
   kubectl logs -n flores-victoria <pod-name>
   ```

3. Describe a pod for more details:
   ```bash
   kubectl describe pod -n flores-victoria <pod-name>
   ```
