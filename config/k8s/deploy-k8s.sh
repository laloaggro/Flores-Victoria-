#!/bin/bash

# Script to deploy Flores Victoria application to Kubernetes

echo "Building Docker images..."
cd /home/impala/Documentos/Proyectos/Flores-Victoria-/
docker compose build

echo "Creating Kubernetes namespace..."
kubectl apply -f k8s/deploy/namespace.yaml

echo "Creating Kubernetes secrets..."
kubectl apply -f k8s/secrets/secrets.yaml

echo "Creating Kubernetes configmaps..."
kubectl apply -f k8s/config/configmap.yaml

echo "Deploying databases and message queues..."
kubectl apply -f k8s/deploy/postgres.yaml
kubectl apply -f k8s/deploy/redis.yaml
kubectl apply -f k8s/deploy/mongodb.yaml
kubectl apply -f k8s/deploy/rabbitmq.yaml
kubectl apply -f k8s/deploy/jaeger.yaml

echo "Deploying microservices..."
kubectl apply -f k8s/deploy/user-service.yaml
kubectl apply -f k8s/deploy/auth-service.yaml
kubectl apply -f k8s/deploy/product-service.yaml
kubectl apply -f k8s/deploy/api-gateway.yaml

echo "Deploying frontend..."
kubectl apply -f k8s/deploy/frontend.yaml

echo "Checking deployment status..."
kubectl get pods -n flores-victoria

echo "Deployment completed!"
echo "To access the application, you may need to expose services or use port forwarding."
echo "For example: kubectl port-forward -n flores-victoria service/frontend 8080:80"