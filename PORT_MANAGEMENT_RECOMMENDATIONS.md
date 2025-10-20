# Recomendaciones para la Gestión de Puertos en Entornos de Desarrollo y Producción

## Introducción

Este documento proporciona recomendaciones y mejores prácticas para gestionar los puertos en los entornos de desarrollo y producción del proyecto Flores Victoria. La gestión adecuada de puertos es crucial para evitar conflictos y garantizar un flujo de trabajo eficiente.

## Recomendaciones Generales

### 1. Uso de Rangos de Puertos Separados

Para evitar conflictos entre entornos, se recomienda utilizar rangos de puertos diferentes:

- **Entorno de Producción**: 3000-3099
- **Entorno de Desarrollo**: 4000-4099
- **Entorno de Pruebas**: 5000-5099

Esto permite identificar fácilmente a qué entorno pertenece cada servicio por su número de puerto.

### 2. Consistencia de Puertos Internos

Mantener los puertos internos consistentes entre entornos facilita la depuración y el mantenimiento:

```yaml
# Ejemplo de configuración consistente
services:
  api-gateway:
    # Puerto interno siempre es 3000
    environment:
      - PORT=3000
    # Puerto externo puede variar según el entorno
    ports:
      - "4000:3000"  # Desarrollo
      # - "3000:3000"  # Producción
```

### 3. Documentación Clara

Mantener actualizada la documentación de puertos es esencial. Cada cambio en la asignación de puertos debe reflejarse en [PORTS_CONFIGURATION.md](file:///home/impala/Documentos/Proyectos/flores-victoria/PORTS_CONFIGURATION.md).

## Estrategias para Evitar Conflictos

### 1. Archivos docker-compose Específicos por Entorno

Crear archivos docker-compose separados para cada entorno:

- `docker-compose.yml` - Producción
- `docker-compose.dev.yml` - Desarrollo
- `docker-compose.test.yml` - Pruebas

### 2. Perfiles de Docker Compose

Utilizar perfiles de Docker Compose para activar/desactivar servicios según el entorno:

```yaml
services:
  api-gateway-dev:
    profiles: ["development"]
    # Configuración específica para desarrollo
    
  api-gateway-prod:
    profiles: ["production"]
    # Configuración específica para producción
```

### 3. Variables de Entorno para Configuración de Puertos

Utilizar variables de entorno para definir los puertos:

```bash
# .env.development
API_GATEWAY_PORT=4000
AUTH_SERVICE_PORT=4001

# .env.production
API_GATEWAY_PORT=3000
AUTH_SERVICE_PORT=3001
```

## Procedimiento para Cambiar Puertos

### 1. Identificar Servicios Afectados

Antes de cambiar puertos, identificar todos los servicios que podrían verse afectados:

- Servicios que se comunican entre sí
- Clientes que se conectan a los servicios
- Configuraciones de proxy o balanceadores de carga

### 2. Actualizar Configuraciones

Actualizar todas las configuraciones relevantes:

1. Archivos docker-compose
2. Archivos de configuración de servicios
3. Variables de entorno
4. Documentación

### 3. Verificar Comunicación entre Servicios

Asegurarse de que la comunicación interna entre servicios no se vea afectada:

```yaml
# En lugar de usar puertos externos, usar nombres de servicio
environment:
  # Correcto - comunicación interna
  - AUTH_SERVICE_URL=http://auth-service:3001
  
  # Incorrecto - usando puerto externo
  # - AUTH_SERVICE_URL=http://localhost:4001
```

## Recomendaciones Específicas para Flores Victoria

### 1. Asignación de Puertos Sugerida

| Servicio | Producción | Desarrollo | Pruebas |
|----------|------------|------------|---------|
| API Gateway | 3000 | 4000 | 5000 |
| Auth Service | 3001 | 4001 | 5001 |
| Product Service | 3009 | 4009 | 5009 |
| User Service | 3003 | 4003 | 5003 |
| Order Service | 3004 | 4004 | 5004 |
| Cart Service | 3005 | 4005 | 5005 |
| Wishlist Service | 3006 | 4006 | 5006 |
| Review Service | 3007 | 4007 | 5007 |
| Contact Service | 3008 | 4008 | 5008 |
| Admin Panel | 3010 | 4010 | 5010 |

### 2. Comandos para Cambiar Entornos

```bash
# Para ejecutar entorno de desarrollo con puertos modificados
docker-compose -f docker-compose.dev-conflict-free.yml up -d

# Para ejecutar entorno de producción
docker-compose -f docker-compose.yml up -d

# Para ejecutar ambos simultáneamente (con puertos diferentes)
# Terminal 1:
docker-compose -f docker-compose.yml up -d

# Terminal 2:
docker-compose -f docker-compose.dev-conflict-free.yml up -d
```

### 3. Verificación de Puertos

Antes de iniciar cualquier entorno, verificar que los puertos estén disponibles:

```bash
# Verificar si un puerto está en uso
netstat -tuln | grep :3000

# O en sistemas con ss
ss -tuln | grep :3000
```

## Mejores Prácticas

### 1. Automatización

Crear scripts para automatizar el cambio de puertos:

```bash
#!/bin/bash
# switch-environment.sh
if [ "$1" = "dev" ]; then
  export PORT_PREFIX=4000
elif [ "$1" = "prod" ]; then
  export PORT_PREFIX=3000
fi

# Usar en plantillas de docker-compose
```

### 2. Validación

Implementar validaciones para asegurar que no haya conflictos de puertos:

```bash
#!/bin/bash
# check-ports.sh
check_port() {
  if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
    echo "Puerto $1 está en uso"
    exit 1
  fi
}

# Verificar puertos críticos
check_port 3000  # API Gateway producción
check_port 4000  # API Gateway desarrollo
```

### 3. Configuración por Entorno

Utilizar directorios separados para configuraciones específicas de cada entorno:

```
config/
├── development/
│   ├── api-gateway.env
│   └── product-service.env
├── production/
│   ├── api-gateway.env
│   └── product-service.env
└── testing/
    ├── api-gateway.env
    └── product-service.env
```

## Consideraciones Adicionales

### 1. Bases de Datos

Para bases de datos, considerar el uso de volúmenes con nombres diferentes para evitar conflictos de datos:

```yaml
volumes:
  # Para desarrollo
  mongodb-data-dev:
  
  # Para producción
  mongodb-data-prod:
```

### 2. Redes Docker

Utilizar redes Docker separadas para cada entorno:

```yaml
networks:
  # Para desarrollo
  app-network-dev:
    driver: bridge
    
  # Para producción
  app-network-prod:
    driver: bridge
```

### 3. Nombres de Contenedores

Usar prefijos para identificar el entorno:

```yaml
services:
  api-gateway:
    # Para desarrollo
    container_name: flores-victoria-api-gateway-dev
    
    # Para producción
    # container_name: flores-victoria-api-gateway-prod
```

## Conclusión

La gestión adecuada de puertos es fundamental para mantener un entorno de desarrollo y producción eficiente. Siguiendo estas recomendaciones, podrás:

1. Evitar conflictos entre entornos
2. Facilitar la identificación de servicios
3. Simplificar el mantenimiento y la depuración
4. Mejorar la documentación y la colaboración del equipo

Recuerda siempre actualizar la documentación cuando realices cambios en la asignación de puertos y comunicar estos cambios al equipo de desarrollo.