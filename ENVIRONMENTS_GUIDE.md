# Guía de Entornos: Desarrollo vs Producción

## Tabla de Contenidos
1. [Introducción](#introducción)
2. [Entorno de Desarrollo](#entorno-de-desarrollo)
   - [Configuración](#configuración)
   - [Características](#características)
   - [Comandos útiles](#comandos-útiles)
3. [Entorno de Producción](#entorno-de-producción)
   - [Configuración](#configuración-1)
   - [Características](#características-1)
   - [Comandos útiles](#comandos-útiles-1)
4. [Diferencias Clave](#diferencias-clave)
5. [Mejores Prácticas](#mejores-prácticas)

## Introducción

Este documento describe las diferencias entre los entornos de desarrollo y producción en el sistema Flores Victoria, con el objetivo de evitar conflictos y confusiones durante el desarrollo y despliegue del sistema.

## Entorno de Desarrollo

### Configuración

El entorno de desarrollo está diseñado para facilitar el desarrollo local de los microservicios. Se encuentra definido principalmente en el archivo `docker-compose.yml`.

**Características principales:**
- Volúmenes montados para recarga de código en vivo
- Puertos expuestos directamente para fácil acceso
- Bases de datos con datos de prueba
- Sin restricciones de seguridad estrictas para facilitar el desarrollo
- Logs detallados para depuración

### Comandos útiles

```bash
# Iniciar el entorno de desarrollo
docker-compose up -d

# Detener el entorno de desarrollo
docker-compose down

# Ver logs de un servicio específico
docker-compose logs service-name

# Reiniciar un servicio específico
docker-compose restart service-name
```

### Directorios y estructura

Los archivos de desarrollo se encuentran principalmente en:
```
/flores-victoria/
├── docker-compose.yml          # Configuración de desarrollo
├── microservices/              # Código fuente de microservicios
├── development/                # Configuraciones específicas de desarrollo
├── tests/                      # Pruebas
└── scripts/                    # Scripts de desarrollo
```

## Entorno de Producción

### Configuración

El entorno de producción está optimizado para rendimiento, seguridad y estabilidad. Se encuentra definido en el archivo `docker-compose.prod.yml`.

**Características principales:**
- Imágenes optimizadas y versionadas
- Configuración de secretos segura
- Health checks implementados
- Políticas de reinicio automáticas
- Redes seguras y aisladas
- Recursos limitados para prevenir abusos

### Comandos útiles

```bash
# Desplegar el stack de producción
docker stack deploy -c docker-compose.prod.yml flores-victoria

# Ver el estado de los servicios
docker service ls

# Ver logs de un servicio
docker service logs service-name

# Escalar un servicio
docker service scale flores-victoria_service-name=3

# Eliminar el stack de producción
docker stack rm flores-victoria
```

### Directorios y estructura

Los archivos de producción se encuentran principalmente en:
```
/flores-victoria/
├── docker-compose.prod.yml     # Configuración de producción
├── production/                 # Configuraciones específicas de producción
├── kubernetes/                 # Manifiestos de Kubernetes (opcional)
├── helm/                       # Charts de Helm (opcional)
└── scripts/                    # Scripts de producción
```

## Diferencias Clave

| Aspecto | Desarrollo | Producción |
|---------|------------|------------|
| **Archivo de configuración** | `docker-compose.yml` | `docker-compose.prod.yml` |
| **Volúmenes** | Montados para desarrollo en vivo | No montados (imágenes autocontenidas) |
| **Puertos** | Expuestos directamente | Mapeados con políticas de seguridad |
| **Secretos** | En archivos .env | A través de Docker secrets |
| **Health checks** | Opcionales | Obligatorios |
| **Reinicio** | Manual | Automático con políticas |
| **Logs** | Detallados para depuración | Concisos, con agregación |
| **Recursos** | Sin límites estrictos | Limitados para estabilidad |
| **Seguridad** | Relajada para facilitar desarrollo | Estricta según mejores prácticas |
| **Imágenes** | Construidas localmente | Desde registry, versionadas |

## Mejores Prácticas

### 1. Separación Estricta de Entornos

- **Nunca mezclar configuraciones**: Mantener archivos separados para cada entorno
- **Variables de entorno**: Usar archivos .env específicos por entorno
- **Secretos**: Nunca almacenar secretos en el código fuente

### 2. Gestión de Configuraciones

- **Desarrollo**: Usar `docker-compose.yml` con volúmenes para desarrollo en vivo
- **Producción**: Usar `docker-compose.prod.yml` con imágenes versionadas

### 3. Despliegue Seguro

- **Validar en desarrollo**: Probar completamente en desarrollo antes de pasar a producción
- **Versionado**: Usar tags de versiones específicas en producción
- **Rollbacks**: Mantener versiones anteriores para rollbacks rápidos

### 4. Monitoreo y Logs

- **Desarrollo**: Logs detallados para depuración
- **Producción**: Logs estructurados para agregación y alertas

### 5. Manejo de Datos

- **Desarrollo**: Datos de prueba que pueden ser descartados
- **Producción**: Datos reales con backups regulares y políticas de retención

### 6. Seguridad

- **Desarrollo**: Acceso fácil para desarrolladores
- **Producción**: Acceso restringido, autenticación obligatoria

### 7. Recomendaciones Específicas para Flores Victoria

1. **Microservicios**:
   - En desarrollo, ejecutar microservicios individualmente para pruebas
   - En producción, usar el stack completo con Docker Swarm

2. **Bases de datos**:
   - En desarrollo, usar contenedores con datos de prueba
   - En producción, usar bases de datos dedicadas o servicios gestionados

3. **API Gateway**:
   - En desarrollo, acceder directamente a los microservicios si es necesario
   - En producción, siempre usar el API Gateway para orquestación y seguridad

4. **Panel de administración**:
   - En desarrollo, usar datos de prueba
   - En producción, proteger con autenticación fuerte

Esta separación clara entre entornos ayudará a evitar los conflictos y confusiones que se han experimentado previamente, asegurando un flujo de trabajo eficiente y seguro.