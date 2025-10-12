# Despliegue en Kubernetes - Flores Victoria

## Introducción

Este documento proporciona instrucciones detalladas sobre cómo desplegar la aplicación Flores Victoria en un clúster de Kubernetes. La aplicación utiliza una arquitectura de microservicios que se despliega como múltiples servicios, deployments y configuraciones en Kubernetes.

## Prerrequisitos

Antes de comenzar el despliegue, asegúrate de tener instalados los siguientes componentes:

1. **Clúster de Kubernetes** (puede ser minikube para desarrollo local, GKE, EKS, AKS, etc.)
2. **kubectl** configurado y autenticado con tu clúster
3. **Docker** para construir las imágenes de los contenedores
4. Acceso a un **registro de contenedores** (Docker Hub, GCR, ECR, etc.)

## Arquitectura en Kubernetes

La aplicación se despliega en el namespace `flores-victoria` y consta de los siguientes componentes:

1. **Bases de datos**:
   - PostgreSQL para datos relacionales
   - Redis para caché y datos en memoria
   - MongoDB para documentos y datos no relacionales

2. **Microservicios**:
   - API Gateway
   - Auth Service
   - User Service
   - Product Service
   - Cart Service
   - Order Service
   - Wishlist Service
   - Review Service
   - Contact Service

3. **Frontend**:
   - Aplicación web cliente

4. **Ingress**:
   - Controlador de ingreso para enrutar el tráfico

## Construcción de Imágenes Docker

Antes de desplegar en Kubernetes, necesitas construir y publicar las imágenes Docker para cada servicio. Asegúrate de tener Docker instalado y configurado.

```bash
# Navega al directorio raíz del proyecto
cd /ruta/al/proyecto/Flores-Victoria-

# Construye las imágenes para cada microservicio
docker build -t floresvictoria/api-gateway:latest ./microservices/api-gateway
docker build -t floresvictoria/auth-service:latest ./microservices/auth-service
docker build -t floresvictoria/user-service:latest ./microservices/user-service
docker build -t floresvictoria/product-service:latest ./microservices/product-service
docker build -t floresvictoria/cart-service:latest ./microservices/cart-service
docker build -t floresvictoria/order-service:latest ./microservices/order-service
docker build -t floresvictoria/wishlist-service:latest ./microservices/wishlist-service
docker build -t floresvictoria/review-service:latest ./microservices/review-service
docker build -t floresvictoria/contact-service:latest ./microservices/contact-service
docker build -t floresvictoria/frontend:latest ./frontend
```

Publica las imágenes en tu registro de contenedores:

```bash
# Publica las imágenes (ejemplo con Docker Hub)
docker push floresvictoria/api-gateway:latest
docker push floresvictoria/auth-service:latest
docker push floresvictoria/user-service:latest
docker push floresvictoria/product-service:latest
docker push floresvictoria/cart-service:latest
docker push floresvictoria/order-service:latest
docker push floresvictoria/wishlist-service:latest
docker push floresvictoria/review-service:latest
docker push floresvictoria/contact-service:latest
docker push floresvictoria/frontend:latest
```

## Despliegue en Kubernetes

### 1. Configuración del Entorno

Navega al directorio de configuración de Kubernetes:

```bash
cd k8s/production
```

### 2. Despliegue de Componentes

Puedes desplegar todos los componentes usando el script proporcionado:

```bash
./deploy.sh
```

O desplegar cada componente manualmente:

```bash
# Crear el namespace
kubectl apply -f namespace.yaml

# Crear volúmenes persistentes
kubectl apply -f persistent-volumes.yaml

# Crear secretos
kubectl apply -f secrets.yaml

# Desplegar bases de datos
kubectl apply -f databases.yaml

# Esperar a que las bases de datos estén listas
sleep 30

# Desplegar microservicios
kubectl apply -f api-gateway.yaml
kubectl apply -f auth-service.yaml
kubectl apply -f user-service.yaml
kubectl apply -f product-service.yaml
kubectl apply -f cart-service.yaml
kubectl apply -f order-service.yaml
kubectl apply -f wishlist-service.yaml
kubectl apply -f review-service.yaml
kubectl apply -f contact-service.yaml

# Desplegar frontend
kubectl apply -f frontend.yaml

# Crear ingress
kubectl apply -f ingress.yaml
```

### 3. Verificación del Despliegue

Verifica que todos los pods se estén ejecutando correctamente:

```bash
kubectl get pods -n flores-victoria
```

Verifica los servicios:

```bash
kubectl get services -n flores-victoria
```

Verifica el ingress:

```bash
kubectl get ingress -n flores-victoria
```

## Configuración de Secretos

Los secretos se han preconfigurado con valores de ejemplo. En un entorno de producción, debes actualizarlos con valores seguros:

```bash
# Generar nuevos secretos
echo -n "tu_usuario_postgres" | base64
echo -n "tu_contraseña_segura" | base64
echo -n "tu_secreto_jwt" | base64
```

Actualiza el archivo `secrets.yaml` con los valores generados.

## Escalabilidad

Los deployments están configurados para escalar automáticamente según la carga. Puedes ajustar el número de réplicas manualmente:

```bash
# Escalar el servicio de usuarios a 3 réplicas
kubectl scale deployment user-service --replicas=3 -n flores-victoria
```

## Monitoreo

Para monitorear la aplicación, puedes usar las herramientas de monitoreo de Kubernetes o integrar soluciones como Prometheus y Grafana.

## Actualizaciones

Para actualizar la aplicación, sigue estos pasos:

1. Construye y publica las nuevas imágenes Docker
2. Actualiza los deployments:

```bash
kubectl set image deployment/api-gateway api-gateway=floresvictoria/api-gateway:v2 -n flores-victoria
```

## Eliminación del Despliegue

Para eliminar completamente la aplicación:

```bash
kubectl delete namespace flores-victoria
```

## Solución de Problemas

### Problemas Comunes

1. **Pods en estado CrashLoopBackOff**:
   - Verifica los logs: `kubectl logs <nombre-del-pod> -n flores-victoria`
   - Verifica las variables de entorno y secretos

2. **Servicios no accesibles**:
   - Verifica que los servicios estén correctamente expuestos
   - Verifica las configuraciones de red y firewall

3. **Problemas de conectividad con bases de datos**:
   - Verifica las credenciales en los secretos
   - Verifica que las bases de datos estén en ejecución

### Verificación de Logs

Para verificar los logs de cualquier componente:

```bash
kubectl logs <nombre-del-pod> -n flores-victoria
```

Para seguir los logs en tiempo real:

```bash
kubectl logs -f <nombre-del-pod> -n flores-victoria
```

## Conclusión

Este documento proporciona una guía completa para desplegar la aplicación Flores Victoria en Kubernetes. La arquitectura de microservicios permite un despliegue escalable y mantenible, con cada servicio ejecutándose de forma independiente y comunicándose a través del API Gateway.

El despliegue en Kubernetes proporciona beneficios como:
- Alta disponibilidad
- Escalabilidad automática
- Gestión de configuraciones
- Actualizaciones sin tiempo de inactividad
- Monitoreo y registro centralizado