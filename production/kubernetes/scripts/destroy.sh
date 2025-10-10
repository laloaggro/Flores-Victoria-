#!/bin/bash

echo "Eliminando API Gateway..."
kubectl delete -f ../manifests/api-gateway.yaml

echo "Eliminando microservicios..."
kubectl delete -f ../manifests/microservices.yaml

echo "Eliminando políticas de red..."
kubectl delete -f ../manifests/network-policies.yaml

echo "Eliminando monitoreo..."
kubectl delete -f ../manifests/monitoring.yaml

echo "Eliminando exportadores..."
kubectl delete -f ../manifests/exporters.yaml

echo "Eliminando RabbitMQ..."
kubectl delete -f ../manifests/rabbitmq.yaml

echo "Eliminando bases de datos..."
kubectl delete -f ../manifests/databases.yaml

echo "Eliminando volúmenes persistentes..."
kubectl delete -f ../manifests/persistent-volumes.yaml

echo "Eliminando secrets..."
kubectl delete -f ../manifests/app-secrets.yaml
kubectl delete -f ../manifests/secrets.yaml

echo "Eliminando namespace..."
kubectl delete -f ../manifests/namespace.yaml

echo "Eliminación completada."