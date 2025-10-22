# Operaciones y Despliegue

## Índice

1. [Visión General](#visión-general)
2. [Requisitos del Sistema](#requisitos-del-sistema)
3. [Despliegue con Docker Compose](#despliegue-con-docker-compose)
4. [Despliegue en Kubernetes](#despliegue-en-kubernetes)
5. [Configuración de Variables de Entorno](#configuración-de-variables-de-entorno)
6. [Gestión de Secretos](#gestión-de-secretos)
7. [Escalabilidad](#escalabilidad)
8. [Monitoreo](#monitoreo)
9. [Backup y Recuperación](#backup-y-recuperación)
10. [Actualizaciones](#actualizaciones)

## Visión General

El sistema Flores Victoria puede desplegarse en múltiples entornos utilizando Docker Compose para
entornos de desarrollo y pruebas, y Kubernetes para entornos de producción. Esta documentación cubre
ambos enfoques y las mejores prácticas para cada uno.

## Requisitos del Sistema

### Desarrollo Local

- Docker 20.10+
- Docker Compose 1.29+
- 8GB RAM mínimo (16GB recomendado)
- 20GB de espacio en disco
- Conexión a Internet

### Producción (Kubernetes)

- Cluster Kubernetes 1.20+
- 16GB RAM mínimo por nodo
- 50GB de espacio en disco por nodo
- Load Balancer (Cloud o self-hosted)
- Ingress Controller

## Despliegue con Docker Compose

### Inicio Rápido

```bash
# Clonar el repositorio
git clone <repositorio-url>
cd flores-victoria

# Crear archivo .env (copiar de .env.example)
cp .env.example .env

# Editar variables de entorno según sea necesario
nano .env

# Iniciar todos los servicios
docker-compose up -d

# Verificar el estado de los servicios
docker-compose ps
```

### Estructura de Docker Compose

El proyecto utiliza varios archivos docker-compose para diferentes propósitos:

1. `docker-compose.yml` - Configuración principal
2. `docker-compose.secrets.yml` - Gestión de secretos
3. `docker-compose.fixed.yml` - Configuración fija para CI/CD

### Comandos Útiles

```bash
# Ver logs de un servicio específico
docker-compose logs auth-service

# Reiniciar un servicio
docker-compose restart product-service

# Detener todos los servicios
docker-compose down

# Construir servicios desde cero
docker-compose build --no-cache

# Ver uso de recursos
docker-compose top
docker stats
```

## Despliegue en Kubernetes

### Prerrequisitos

- Tener acceso a un cluster Kubernetes
- Tener kubectl configurado
- Tener Helm instalado (opcional)

### Usando Scripts de Despliegue

```bash
# Desplegar usando scripts
./k8s/deploy-k8s.sh

# Verificar estado de los pods
kubectl get pods -n flores-victoria

# Verificar servicios
kubectl get services -n flores-victoria
```

### Usando Helm Charts

```bash
# Agregar repositorio (si está configurado)
helm repo add flores-victoria ./helm

# Instalar la aplicación
helm install flores-victoria ./helm/flores-victoria

# Actualizar la aplicación
helm upgrade flores-victoria ./helm/flores-victoria
```

### Componentes de Kubernetes

1. **Namespaces**: Separación lógica de entornos
2. **Deployments**: Gestión de réplicas de servicios
3. **Services**: Descubrimiento de servicios
4. **Ingress**: Enrutamiento HTTP/HTTPS
5. **ConfigMaps**: Configuración no sensible
6. **Secrets**: Datos sensibles
7. **PersistentVolumes**: Almacenamiento persistente

## Configuración de Variables de Entorno

### Variables Críticas

```env
# API Gateway
API_GATEWAY_PORT=3000
AUTH_SERVICE_URL=http://auth-service:3001
PRODUCT_SERVICE_URL=http://product-service:3002
USER_SERVICE_URL=http://user-service:3003
ORDER_SERVICE_URL=http://order-service:3004
CART_SERVICE_URL=http://cart-service:3005
WISHLIST_SERVICE_URL=http://wishlist-service:3006
REVIEW_SERVICE_URL=http://review-service:3007
CONTACT_SERVICE_URL=http://contact-service:3008

# Auth Service
AUTH_SERVICE_PORT=3001
JWT_SECRET=secreto_seguro_para_JWT
JWT_EXPIRES_IN=24h

# Product Service
PRODUCT_SERVICE_PORT=3002
MONGODB_URI=mongodb://root:rootpassword@mongodb:27017/flores_victoria

# User Service
USER_SERVICE_PORT=3003
DB_HOST=postgres
DB_PORT=5432
DB_NAME=flores_db
DB_USER=flores_user
DB_PASSWORD=flores_password

# Order Service
ORDER_SERVICE_PORT=3004

# Cart Service
CART_SERVICE_PORT=3005
REDIS_HOST=redis
REDIS_PORT=6379

# Wishlist Service
WISHLIST_SERVICE_PORT=3006
REDIS_HOST=redis
REDIS_PORT=6379

# Review Service
REVIEW_SERVICE_PORT=3007

# Contact Service
CONTACT_SERVICE_PORT=3008
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_contraseña_de_aplicacion

# Jaeger (tracing)
JAEGER_AGENT_HOST=jaeger
JAEGER_AGENT_PORT=6832
```

### Gestión de Configuración por Entorno

- **Desarrollo**: Variables en `.env`
- **Pruebas**: Variables en `.env.test`
- **Producción**: Variables en ConfigMaps de Kubernetes

## Gestión de Secretos

### Docker Compose

Para entornos de desarrollo, se pueden usar archivos `.env`:

```bash
# Crear archivo de secretos
cp .env.example .env
# Editar con valores reales
nano .env
```

### Kubernetes

Para producción, se deben usar Secrets de Kubernetes:

```bash
# Crear secretos
kubectl create secret generic db-secret \
  --from-literal=DB_PASSWORD=flores_password \
  --from-literal=JWT_SECRET=secreto_seguro_para_JWT \
  -n flores-victoria

# Crear secretos para email
kubectl create secret generic email-secret \
  --from-literal=EMAIL_PASS=contraseña_de_aplicacion \
  -n flores-victoria
```

### Buenas Prácticas de Secretos

1. Nunca almacenar secretos en el código fuente
2. Rotar secretos periódicamente
3. Usar secretos específicos por entorno
4. Limitar acceso a secretos mediante RBAC
5. Encriptar secretos en repositorios

## Escalabilidad

### Escalado Horizontal

```bash
# Escalar un servicio específico
docker-compose up -d --scale product-service=3

# En Kubernetes
kubectl scale deployment product-service --replicas=3 -n flores-victoria
```

### Estrategias de Escalado

1. **Basado en CPU**: Escalar cuando el uso de CPU supera el 70%
2. **Basado en Memoria**: Escalar cuando el uso de memoria supera el 80%
3. **Basado en Solicitudes**: Escalar según el número de solicitudes por segundo
4. **Programado**: Escalar automáticamente en horarios pico

### Consideraciones de Escalabilidad

- Cada servicio debe ser stateless
- Usar Redis para sesiones y datos temporales
- Implementar patrones de circuit breaker
- Usar colas de mensajes para tareas asíncronas
- Balanceo de carga entre réplicas

## Monitoreo

### Métricas Clave

1. **Disponibilidad**: Tiempo activo del sistema
2. **Latencia**: Tiempo de respuesta de las APIs
3. **Uso de Recursos**: CPU, memoria, disco
4. **Tasa de Errores**: Porcentaje de solicitudes fallidas
5. **Throughput**: Solicitudes por segundo

### Herramientas de Monitoreo

1. **Prometheus**: Recopilación de métricas
2. **Grafana**: Visualización de dashboards
3. **Jaeger**: Tracing distribuido
4. **ELK Stack**: Logging centralizado

### Alertas Importantes

- Servicio no disponible (99.9% uptime objetivo)
- Alta latencia (>1s promedio)
- Uso de CPU > 85%
- Uso de memoria > 85%
- Errores HTTP 5xx > 1% de solicitudes

## Backup y Recuperación

### Estrategia de Backup

1. **Base de Datos**: Backups diarios con retención de 30 días
2. **Configuración**: Control de versiones en Git
3. **Volúmenes**: Snapshots semanales
4. **Documentación**: Actualización continua

### Procedimientos de Backup

```bash
# Backup de PostgreSQL
pg_dump -h localhost -p 5433 -U flores_user flores_db > backup_$(date +%Y%m%d).sql

# Backup de MongoDB
mongodump --host localhost:27018 --username root --password rootpassword --db flores_victoria --out ./backups/mongo_$(date +%Y%m%d)

# Backup de volúmenes Docker
docker run --rm -v flores-victoria_redis-data:/data -v $(pwd)/backups:/backup alpine tar czf /backup/redis_$(date +%Y%m%d).tar.gz -C / data
```

### Procedimientos de Recuperación

1. Restaurar base de datos desde backup más reciente
2. Recrear volúmenes desde snapshots
3. Reimplementar configuración desde Git
4. Verificar funcionalidad de todos los servicios

## Actualizaciones

### Estrategia de Actualización

1. **Blue-Green Deployment**: Desplegar nueva versión en paralelo
2. **Rolling Updates**: Actualizar réplicas una por una
3. **Canary Releases**: Desplegar a un subconjunto de usuarios primero

### Proceso de Actualización

```bash
# 1. Preparar nueva versión
git pull origin main

# 2. Construir nuevas imágenes
docker-compose build

# 3. Actualizar servicios
docker-compose up -d

# 4. Verificar estado
docker-compose ps
```

### En Kubernetes

```bash
# Actualizar con Helm
helm upgrade flores-victoria ./helm/flores-victoria --set image.tag=v1.2.0

# O con kubectl
kubectl set image deployment/product-service product-service=floresvictoria/product-service:v1.2.0 -n flores-victoria
```

### Verificación Post-Actualización

1. Verificar estado de todos los pods/servicios
2. Probar funcionalidades críticas
3. Monitorear métricas y logs
4. Confirmar que no hay errores en las APIs
