#!/bin/bash

echo "Creando namespace..."
kubectl apply -f manifests/namespace.yaml

echo "Creando secrets..."
kubectl apply -f manifests/secrets.yaml
kubectl apply -f manifests/app-secrets.yaml

echo "Creando volúmenes persistentes..."
kubectl apply -f manifests/persistent-volumes.yaml

echo "Desplegando bases de datos..."
kubectl apply -f manifests/databases.yaml

echo "Desplegando RabbitMQ..."
kubectl apply -f manifests/rabbitmq.yaml

echo "Desplegando exportadores..."
kubectl apply -f manifests/exporters.yaml

echo "Desplegando monitoreo..."
kubectl apply -f manifests/monitoring.yaml

echo "Desplegando políticas de red..."
kubectl apply -f manifests/network-policies.yaml

echo "Desplegando microservicios..."
kubectl apply -f manifests/microservices.yaml

echo "Desplegando API Gateway..."
kubectl apply -f manifests/api-gateway.yaml

echo "Despliegue completado."
echo "Para verificar el estado de los pods, ejecuta: kubectl get pods -n flores-victoria"