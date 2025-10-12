#!/bin/bash

# Script para desplegar la aplicación Flores Victoria en Kubernetes

echo "Creando namespace..."
kubectl apply -f namespace.yaml

echo "Creando volúmenes persistentes..."
kubectl apply -f persistent-volumes.yaml

echo "Creando secretos..."
kubectl apply -f secrets.yaml

echo "Desplegando bases de datos..."
kubectl apply -f databases.yaml

echo "Esperando a que las bases de datos estén listas..."
sleep 30

echo "Desplegando microservicios..."
kubectl apply -f api-gateway.yaml
kubectl apply -f auth-service.yaml
kubectl apply -f user-service.yaml
kubectl apply -f product-service.yaml
kubectl apply -f cart-service.yaml
kubectl apply -f order-service.yaml
kubectl apply -f wishlist-service.yaml
kubectl apply -f review-service.yaml
kubectl apply -f contact-service.yaml

echo "Desplegando frontend..."
kubectl apply -f frontend.yaml

echo "Creando ingress..."
kubectl apply -f ingress.yaml

echo "Despliegue completado. Verificando estado de los pods..."
kubectl get pods -n flores-victoria

echo "Para ver los servicios, ejecuta: kubectl get services -n flores-victoria"
echo "Para ver el ingress, ejecuta: kubectl get ingress -n flores-victoria"