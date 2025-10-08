#!/bin/bash

# Script para desplegar la aplicación Flores Victoria en Kubernetes

echo "=== Desplegando Flores Victoria en Kubernetes ==="
echo "Fecha: $(date)"
echo ""

# Verificar si kubectl está instalado
if ! command -v kubectl &> /dev/null
then
    echo "❌ kubectl no encontrado. Por favor instale kubectl primero."
    exit 1
fi

echo "✓ kubectl encontrado"
echo ""

# Verificar conexión al clúster
echo "Verificando conexión al clúster de Kubernetes..."
if ! kubectl cluster-info &> /dev/null
then
    echo "❌ No se puede conectar al clúster de Kubernetes. Verifique su configuración."
    exit 1
fi

echo "✓ Conexión al clúster establecida"
echo ""

# Crear namespace
echo "Creando namespace flores-victoria..."
kubectl apply -f kubernetes/namespace.yaml

if [ $? -ne 0 ]; then
    echo "❌ Error al crear el namespace"
    exit 1
fi

echo "✓ Namespace creado"
echo ""

# Aplicar ConfigMaps y Secrets
echo "Aplicando ConfigMaps y Secrets..."
kubectl apply -f kubernetes/configmaps.yaml
kubectl apply -f kubernetes/secrets.yaml

if [ $? -ne 0 ]; then
    echo "❌ Error al aplicar ConfigMaps y Secrets"
    exit 1
fi

echo "✓ ConfigMaps y Secrets aplicados"
echo ""

# Desplegar bases de datos
echo "Desplegando bases de datos..."
kubectl apply -f kubernetes/mongodb-deployment.yaml
kubectl apply -f kubernetes/postgres-deployment.yaml
kubectl apply -f kubernetes/redis-deployment.yaml
kubectl apply -f kubernetes/rabbitmq-deployment.yaml

if [ $? -ne 0 ]; then
    echo "❌ Error al desplegar las bases de datos"
    exit 1
fi

echo "✓ Bases de datos desplegadas"
echo ""

# Esperar a que las bases de datos estén listas
echo "Esperando a que las bases de datos estén listas..."
sleep 30

# Desplegar microservicios
echo "Desplegando microservicios..."
kubectl apply -f kubernetes/auth-service-deployment.yaml
kubectl apply -f kubernetes/product-service-deployment.yaml
kubectl apply -f kubernetes/user-service-deployment.yaml
kubectl apply -f kubernetes/order-service-deployment.yaml
kubectl apply -f kubernetes/cart-service-deployment.yaml
kubectl apply -f kubernetes/wishlist-service-deployment.yaml
kubectl apply -f kubernetes/review-service-deployment.yaml
kubectl apply -f kubernetes/contact-service-deployment.yaml
kubectl apply -f kubernetes/api-gateway-deployment.yaml

if [ $? -ne 0 ]; then
    echo "❌ Error al desplegar los microservicios"
    exit 1
fi

echo "✓ Microservicios desplegados"
echo ""

# Desplegar frontend y panel de administración
echo "Desplegando frontend y panel de administración..."
kubectl apply -f kubernetes/frontend-deployment.yaml
kubectl apply -f kubernetes/admin-panel-deployment.yaml

if [ $? -ne 0 ]; then
    echo "❌ Error al desplegar frontend y panel de administración"
    exit 1
fi

echo "✓ Frontend y panel de administración desplegados"
echo ""

# Configurar monitoreo
echo "Configurando monitoreo..."
kubectl apply -f kubernetes/prometheus-config.yaml
kubectl apply -f kubernetes/prometheus-deployment.yaml
kubectl apply -f kubernetes/grafana-deployment.yaml

if [ $? -ne 0 ]; then
    echo "❌ Error al configurar el monitoreo"
    exit 1
fi

echo "✓ Monitoreo configurado"
echo ""

# Configurar autoescalado y copias de seguridad
echo "Configurando autoescalado y copias de seguridad..."
kubectl apply -f kubernetes/hpa.yaml
kubectl apply -f kubernetes/backup-cronjob.yaml

if [ $? -ne 0 ]; then
    echo "❌ Error al configurar autoescalado y copias de seguridad"
    exit 1
fi

echo "✓ Autoescalado y copias de seguridad configurados"
echo ""

# Aplicar políticas de red
echo "Aplicando políticas de red..."
kubectl apply -f kubernetes/network-policies.yaml

if [ $? -ne 0 ]; then
    echo "❌ Error al aplicar políticas de red"
    exit 1
fi

echo "✓ Políticas de red aplicadas"
echo ""

# Configurar Ingress
echo "Configurando Ingress..."
kubectl apply -f kubernetes/ingress.yaml

if [ $? -ne 0 ]; then
    echo "❌ Error al configurar Ingress"
    exit 1
fi

echo "✓ Ingress configurado"
echo ""

echo "=== Despliegue completado ==="
echo ""
echo "Recursos desplegados:"
echo "- Namespace: flores-victoria"
echo "- ConfigMaps y Secrets"
echo "- Bases de datos: MongoDB, PostgreSQL, Redis, RabbitMQ"
echo "- Microservicios: Auth, Product, User, Order, Cart, Wishlist, Review, Contact"
echo "- API Gateway"
echo "- Frontend y Panel de Administración"
echo "- Monitoreo: Prometheus y Grafana"
echo "- Autoescalado y copias de seguridad"
echo "- Políticas de red"
echo "- Ingress"
echo ""
echo "Para verificar el estado de los pods:"
echo "  kubectl get pods -n flores-victoria"
echo ""
echo "Para acceder a la aplicación:"
echo "  Añada 'floresvictoria.local' a su archivo /etc/hosts apuntando a la IP del Ingress"
echo "  Luego visite http://floresvictoria.local en su navegador"