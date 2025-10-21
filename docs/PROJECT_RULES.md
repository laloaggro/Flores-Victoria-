# ⚠️ DEPRECATED — ver documento canónico en [.github/PROJECT_RULES.md](../.github/PROJECT_RULES.md)
# Reglas y Convenciones del Proyecto Flores Victoria

## Propósito

Este documento establece las reglas y convenciones que deben seguirse en el proyecto Flores Victoria para mantener la consistencia, facilitar el mantenimiento y asegurar la calidad del código.

## Estructura del Proyecto

```
flores-victoria/
├── .env                      # Variables de entorno
├── docker-compose.yml        # Configuración de contenedores
├── start-all.sh              # Script para iniciar todos los servicios
├── stop-all.sh               # Script para detener todos los servicios
├── PROJECT_OVERVIEW.md       # Visión general del proyecto (documento principal de referencia)
├── docs/                     # Documentación detallada
├── microservices/            # Directorio de microservicios
├── frontend/                 # Aplicación frontend
├── admin-panel/              # Panel de administración
├── scripts/                  # Scripts de utilidad
└── ...
```

## Convenciones de Nombres

### Archivos y Directorios
- Utilizar minúsculas
- Separar palabras con guiones (`-`)
- Nombres descriptivos y en inglés

### Contenedores Docker
- Prefijo: `flores-victoria-`
- Seguido del nombre del servicio

### Puertos
- Microservicios: 3001-3008
- Bases de datos: puertos estándar internos, +1 para externos
- Monitoreo: puertos estándar de la industria

## Configuración

### Variables de Entorno
- Todas las variables de entorno deben estar documentadas en `.env`
- Las variables críticas deben tener valores por defecto razonables
- No incluir credenciales reales en el repositorio

### Docker Compose
- Los puertos deben coincidir con la documentación en `PROJECT_OVERVIEW.md`
- Las dependencias entre servicios deben estar claramente definidas
- Los health checks deben estar implementados para todos los servicios

## Documentación

### Archivo Principal de Referencia
- `PROJECT_OVERVIEW.md` es el documento principal de referencia
- Debe actualizarse inmediatamente después de cualquier cambio en la arquitectura
- Contiene información crítica sobre puertos, URLs y configuraciones

### Otros Documentos
- `docs/` contiene documentación detallada por temas
- `development/microservices/PORTS.md` contiene información histórica sobre puertos

## Proceso de Verificación

### Antes de Realizar Cambios
1. Verificar la consistencia entre `docker-compose.yml`, `.env` y `PROJECT_OVERVIEW.md`
2. Asegurarse de que todos los scripts necesarios tengan permisos de ejecución
3. Revisar que la documentación esté actualizada

### Después de Realizar Cambios
1. Actualizar `PROJECT_OVERVIEW.md` con cualquier cambio en la arquitectura
2. Verificar que los servicios se inicien correctamente
3. Confirmar que la documentación sea coherente con la implementación

## Reglas de Puerto

### Asignación de Puertos para Microservicios
| Servicio         | Puerto |
|------------------|--------|
| API Gateway      | 3000   |
| Auth Service     | 3001   |
| Product Service  | 3002   |
| User Service     | 3003   |
| Order Service    | 3004   |
| Cart Service     | 3005   |
| Wishlist Service | 3006   |
| Review Service   | 3007   |
| Contact Service  | 3008   |

### Puertos de Infraestructura
| Servicio    | Puerto Interno | Puerto Externo |
|-------------|----------------|----------------|
| PostgreSQL  | 5432           | 5433           |
| Redis       | 6379           | 6380           |
| MongoDB     | 27017          | 27018          |
| RabbitMQ    | 5672           | 5672           |
| RabbitMQ    | 15672          | 15672          |
| Prometheus  | 9090           | 9090           |
| Grafana     | 3000           | 3009           |
| Jaeger      | 16686          | 16686          |

## URLs de Acceso

| Servicio         | URL                    |
|------------------|------------------------|
| Frontend         | http://localhost:5175  |
| Admin Panel      | http://localhost:3010  |
| API Gateway      | http://localhost:3000  |
| Grafana          | http://localhost:3009  |
| Prometheus       | http://localhost:9090  |
| Jaeger           | http://localhost:16686 |
| RabbitMQ Mgmt    | http://localhost:15672 |

## Scripts de Verificación

### Scripts de Automatización
- `scripts/system-maintenance.sh`: Menú interactivo para mantenimiento del sistema
- `scripts/advanced-diagnostics.sh`: Diagnóstico detallado del sistema
- `scripts/verify-config.sh`: Verifica la consistencia de la configuración

### Verificación Automática
- Ejecutar `scripts/advanced-diagnostics.sh` para obtener un diagnóstico completo
- Ejecutar `scripts/system-maintenance.sh` para operaciones de mantenimiento interactivas
- Ejecutar `scripts/verify-config.sh` para verificar consistencia

### Verificación Manual
- Verificar que todas las URLs listadas estén accesibles
- Confirmar que los health checks respondan correctamente

## Proceso de Actualización

1. Realizar cambios en la configuración
2. Actualizar `PROJECT_OVERVIEW.md` inmediatamente
3. Ejecutar `scripts/advanced-diagnostics.sh` para verificar consistencia
4. Reiniciar servicios con `./start-all.sh`
5. Verificar funcionamiento correcto

## Contacto y Soporte

Para cualquier duda o problema con la configuración:
- Revisar primero `PROJECT_OVERVIEW.md`
- Consultar la documentación en `docs/`
- Ejecutar scripts de verificación
- Contactar al equipo de desarrollo