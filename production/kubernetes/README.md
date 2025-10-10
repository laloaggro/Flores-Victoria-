# Configuración de Kubernetes para Flores Victoria

Esta carpeta contiene la configuración necesaria para desplegar los microservicios de Flores Victoria en un clúster de Kubernetes.

## Estructura del directorio

- `manifests/`: Archivos de manifiesto de Kubernetes (Deployments, Services, ConfigMaps, etc.)
- `configs/`: Archivos de configuración específicos de las aplicaciones
- `scripts/`: Scripts de utilidad para el despliegue y mantenimiento

## Componentes incluidos

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

## Requisitos previos

- Clúster de Kubernetes (v1.20+)
- kubectl configurado
- Helm 3 (para algunos componentes)

## Despliegue

```bash
# Aplicar los manifiestos
kubectl apply -f manifests/

# O usar el script de despliegue
./scripts/deploy.sh

# Ver el estado de los pods
kubectl get pods -n flores-victoria

# Ver los servicios
kubectl get services -n flores-victoria
```

## Eliminación

```bash
# Eliminar todos los recursos
./scripts/destroy.sh
```

## Configuración de secretos

Los secretos deben crearse por separado:

```bash
kubectl create secret generic db-password --from-literal=password=tu_contraseña -n flores-victoria
```

## Acceso a los servicios

- API Gateway: http://<EXTERNAL-IP>:80
- Grafana: http://<EXTERNAL-IP>:3000
- Prometheus: http://<EXTERNAL-IP>:9090
- RabbitMQ Management: http://<EXTERNAL-IP>:15672

## Consideraciones de producción

1. **Persistencia**: En producción, se utilizan volúmenes persistentes (PersistentVolumes) para garantizar la persistencia de los datos. Los manifiestos incluyen configuraciones para volúmenes persistentes basados en hostPath, que deben adaptarse según el entorno de producción (por ejemplo, usar almacenamiento en la nube).

2. **Secretos**: Usar secretos de Kubernetes o herramientas como HashiCorp Vault. Los secretos actuales están codificados en base64, lo cual no es seguro para producción.

3. **Escalabilidad**: Ajustar el número de réplicas según la carga esperada. Los manifiestos actuales usan una sola réplica por servicio.

4. **Seguridad**: 
   - Implementar políticas de red (NetworkPolicies) para controlar el tráfico entre servicios
   - Usar RBAC para control de acceso
   - Implementar TLS para la comunicación entre servicios
   - Escanear vulnerabilidades en las imágenes de contenedores

5. **Backup**: Implementar estrategias de backup para las bases de datos

6. **Monitoreo y logging**: 
   - Configurar alertas en Prometheus
   - Implementar una solución de logging centralizado (como ELK o Fluentd)
   - Configurar paneles en Grafana para visualizar métricas clave

7. **Despliegues avanzados**: 
   - Considerar el uso de Helm para gestión de charts
   - Implementar CI/CD para despliegues automatizados
   - Usar Ingress controllers para gestión avanzada de tráfico