# Configuración de Kubernetes para Flores Victoria

## Introducción

Este directorio contiene todos los archivos de configuración necesarios para desplegar la aplicación Flores Victoria en un clúster de Kubernetes.

## Estructura del Directorio

```
kubernetes/
├── README.md                 # Este archivo
├── namespace.yaml           # Definición del namespace
├── configmaps.yaml          # Configuración de la aplicación
├── secrets.yaml             # Secretos de la aplicación
├── ingress.yaml             # Configuración de Ingress
├── frontend-deployment.yaml # Despliegue del frontend
├── api-gateway-deployment.yaml # Despliegue del API Gateway
├── auth-service-deployment.yaml # Despliegue del servicio de autenticación
├── product-service-deployment.yaml # Despliegue del servicio de productos
├── user-service-deployment.yaml # Despliegue del servicio de usuarios
├── order-service-deployment.yaml # Despliegue del servicio de órdenes
├── cart-service-deployment.yaml # Despliegue del servicio de carrito
├── wishlist-service-deployment.yaml # Despliegue del servicio de lista de deseos
├── review-service-deployment.yaml # Despliegue del servicio de reseñas
├── contact-service-deployment.yaml # Despliegue del servicio de contacto
├── mongodb-deployment.yaml  # Despliegue de MongoDB
├── postgres-deployment.yaml # Despliegue de PostgreSQL
├── redis-deployment.yaml    # Despliegue de Redis
├── rabbitmq-deployment.yaml # Despliegue de RabbitMQ
├── prometheus-deployment.yaml # Despliegue de Prometheus
├── grafana-deployment.yaml  # Despliegue de Grafana
├── hpa.yaml                 # Configuración de autoescalado
├── backup-cronjob.yaml      # CronJob para copias de seguridad
├── network-policies.yaml    # Políticas de red
└── prometheus-config.yaml   # Configuración de Prometheus
```

## Instrucciones de Despliegue

### 1. Crear el Namespace

```bash
kubectl apply -f namespace.yaml
```

### 2. Configurar Secretos y ConfigMaps

```bash
kubectl apply -f configmaps.yaml
kubectl apply -f secrets.yaml
```

### 3. Desplegar Bases de Datos y Servicios de Infraestructura

```bash
kubectl apply -f mongodb-deployment.yaml
kubectl apply -f postgres-deployment.yaml
kubectl apply -f redis-deployment.yaml
kubectl apply -f rabbitmq-deployment.yaml
```

### 4. Desplegar Microservicios

```bash
kubectl apply -f auth-service-deployment.yaml
kubectl apply -f product-service-deployment.yaml
kubectl apply -f user-service-deployment.yaml
kubectl apply -f order-service-deployment.yaml
kubectl apply -f cart-service-deployment.yaml
kubectl apply -f wishlist-service-deployment.yaml
kubectl apply -f review-service-deployment.yaml
kubectl apply -f contact-service-deployment.yaml
kubectl apply -f api-gateway-deployment.yaml
```

### 5. Desplegar Frontend

```bash
kubectl apply -f frontend-deployment.yaml
```

### 6. Configurar Ingress

```bash
kubectl apply -f ingress.yaml
```

### 7. Configurar Monitoreo

```bash
kubectl apply -f prometheus-config.yaml
kubectl apply -f prometheus-deployment.yaml
kubectl apply -f grafana-deployment.yaml
```

### 8. Configurar Autoescalado y Copias de Seguridad

```bash
kubectl apply -f hpa.yaml
kubectl apply -f backup-cronjob.yaml
```

### 9. Aplicar Políticas de Red

```bash
kubectl apply -f network-policies.yaml
```

## Verificación del Despliegue

### Verificar Pods

```bash
kubectl get pods -n flores-victoria
```

### Verificar Servicios

```bash
kubectl get services -n flores-victoria
```

### Verificar Ingress

```bash
kubectl get ingress -n flores-victoria
```

## Actualización de la Aplicación

Para actualizar la aplicación, simplemente actualice las imágenes en los archivos de despliegue correspondientes y vuelva a aplicarlos:

```bash
kubectl apply -f <archivo-de-despliegue-actualizado.yaml>
```

## Eliminación del Despliegue

Para eliminar completamente la aplicación:

```bash
kubectl delete -f .
```

O para eliminar por tipo de recurso:

```bash
kubectl delete deployments,services,configmaps,secrets,pvc -n flores-victoria --all
```

## Notas Adicionales

1. Asegúrese de tener suficientes recursos en su clúster de Kubernetes para ejecutar todos los servicios.
2. Los volúmenes persistentes requieren un aprovisionador de almacenamiento configurado en su clúster.
3. Las configuraciones de red pueden necesitar ajustes según su entorno específico.
4. Los secretos en este ejemplo están codificados en base64; en un entorno de producción, considere usar herramientas como HashiCorp Vault o secrets de Kubernetes gestionados por el proveedor de nube.