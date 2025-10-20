# Documentación de Scripts

## Introducción

Este documento describe los scripts disponibles en el proyecto Flores Victoria y su uso. Los scripts están ubicados en el directorio [scripts/](file:///home/impala/Documentos/Proyectos/flores-victoria/scripts) y proporcionan utilidades para el desarrollo, despliegue, monitoreo y mantenimiento del sistema.

## Scripts de Gestión y Despliegue

### start-all.sh
Inicia todos los servicios del proyecto utilizando docker-compose.

**Uso:**
```bash
./start-all.sh
```

### stop-all.sh
Detiene todos los servicios del proyecto.

**Uso:**
```bash
./stop-all.sh
```

### scripts/deploy.sh
Script básico de despliegue.

### scripts/deploy-kubernetes.sh
Script para despliegue en Kubernetes.

### scripts/start-with-monitoring.sh
Inicia el entorno completo con servicios de monitoreo (Prometheus, Grafana).

**Uso:**
```bash
./scripts/start-with-monitoring.sh
```

## Scripts de Verificación y Pruebas

### scripts/check-services.sh
Verifica el estado de todos los servicios y sus endpoints de health check.

**Uso:**
```bash
./scripts/check-services.sh
```

### scripts/check-critical-services.sh
Verifica el estado de los servicios críticos, con prioridad en el auth-service.

**Uso:**
```bash
./scripts/check-critical-services.sh
```

### scripts/validate-system.sh
Verifica que todo el sistema esté funcionando correctamente.

**Uso:**
```bash
./scripts/validate-system.sh
```

### scripts/test-product-service.js
Script para probar la funcionalidad del servicio de productos.

**Uso:**
```bash
node scripts/test-product-service.js
```

### scripts/run-all-tests.sh
Ejecuta todas las suites de pruebas del proyecto.

### scripts/run-integration-tests.sh
Ejecuta las pruebas de integración.

### scripts/run-load-tests.sh
Ejecuta pruebas de carga.

## Scripts de Backup y Mantenimiento

### scripts/backup-databases.sh
Realiza backup de las bases de datos MongoDB y PostgreSQL.

**Uso:**
```bash
./scripts/backup-databases.sh
```

### scripts/incremental-backup.sh
Realiza backup incremental de los datos.

### scripts/cleanup-backups.sh
Limpia los backups antiguos.

### scripts/auto-scaling.sh
Gestiona el auto-escalado de los servicios.

## Scripts de Seguridad

### scripts/generate-secrets.sh
Genera secretos para la aplicación.

### scripts/generate-secure-secrets.sh
Genera secretos seguros para la aplicación.

### scripts/scan-vulnerabilities.sh
Escanea vulnerabilidades en las dependencias.

## Scripts de Documentación

### scripts/generate-openapi.js
Genera documentación OpenAPI para los servicios.

### scripts/generate-openapi.sh
Script shell para generar documentación OpenAPI.

### scripts/update-docs.sh
Actualiza la documentación del proyecto.

## Scripts de Utilidad

### scripts/check-resources.sh
Verifica el uso de recursos del sistema.

### scripts/restart-frontend.sh
Reinicia el servicio frontend.

### scripts/start-with-logs.sh
Inicia el entorno con logs detallados.

### scripts/microservice-repair-process.sh
Proceso para reparar microservicios siguiendo las mejores prácticas.

### scripts/fix-dockerfile-dependencies.sh
Script para corregir las rutas de dependencias en los Dockerfiles.

**Uso:**
```bash
./scripts/fix-dockerfile-dependencies.sh
```

## Scripts de Desarrollo

### scripts/test-product-service.js
Prueba la funcionalidad del servicio de productos.