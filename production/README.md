# Producción - Flores Victoria

Este directorio contiene todos los archivos necesarios para el despliegue en entorno de producción del proyecto Flores Victoria.

## Estructura

- `kubernetes/`: Contiene todos los manifiestos y configuraciones para desplegar el sistema en Kubernetes

## Instrucciones de Despliegue

### Requisitos Previos
- Clúster de Kubernetes (v1.20+)
- kubectl configurado
- Helm 3 (para algunos componentes)
- Acceso al registro de contenedores donde se encuentran las imágenes

### Iniciar el Entorno de Producción

```bash
# Navegar al directorio de Kubernetes
cd kubernetes

# Aplicar los manifiestos
kubectl apply -f manifests/

# O usar el script de despliegue
./scripts/deploy.sh

# Ver el estado de los pods
kubectl get pods -n flores-victoria

# Ver los servicios
kubectl get services -n flores-victoria
```

## Componentes Incluidos

1. **Microservicios**:
   - Auth Service
   - Product Service
   - User Service
   - Order Service
   - Cart Service
   - Wishlist Service
   - Review Service
   - Contact Service
   - API Gateway

2. **Bases de datos**:
   - PostgreSQL
   - MongoDB
   - Redis

3. **Servicios de mensajería**:
   - RabbitMQ

4. **Monitoreo**:
   - Prometheus
   - Grafana

## Configuración

### Secretos

Los secretos deben crearse por separado:

```bash
kubectl create secret generic db-password --from-literal=password=tu_contraseña -n flores-victoria
```

### Volúmenes Persistentes

Los manifiestos incluyen configuraciones para volúmenes persistentes basados en hostPath. En un entorno de producción real, estos deben adaptarse según el proveedor de nube o sistema de almacenamiento utilizado.

## Acceso a los Servicios

- API Gateway: http://<EXTERNAL-IP>:80
- Grafana: http://<EXTERNAL-IP>:3000
- Prometheus: http://<EXTERNAL-IP>:9090
- RabbitMQ Management: http://<EXTERNAL-IP>:15672

## Escalabilidad

Los manifiestos actuales usan una sola réplica por servicio. En producción, puedes aumentar el número de réplicas según las necesidades de carga y disponibilidad.

## Seguridad

Considera implementar:
- NetworkPolicies para controlar el tráfico entre servicios
- RBAC para control de acceso
- TLS para la comunicación entre servicios
- Escaneo de vulnerabilidades en las imágenes de contenedores